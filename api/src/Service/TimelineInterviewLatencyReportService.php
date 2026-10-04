<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\JobTimelineEvent;
use App\Timeline\JobTimelineEventType;
use Doctrine\ORM\EntityManagerInterface;

final class TimelineInterviewLatencyReportService
{
    public function __construct(private EntityManagerInterface $em)
    {
    }

    /** @return array{measured: int, averageHours: float|null, medianHours: float|null} */
    public function report(): array
    {
        /** @var list<JobTimelineEvent> $events */
        $events = $this->em->getRepository(JobTimelineEvent::class)
            ->createQueryBuilder('event')
            ->addSelect('application')
            ->leftJoin('event.application', 'application')
            ->andWhere('event.type IN (:types)')
            ->setParameter('types', [
                JobTimelineEventType::APPLICATION_SUBMITTED,
                JobTimelineEventType::INTERVIEW,
            ])
            ->orderBy('event.occurredAt', 'ASC')
            ->addOrderBy('event.id', 'ASC')
            ->getQuery()
            ->getResult();

        $rows = [];
        foreach ($events as $event) {
            $applicationId = $event->getApplication()?->getId();
            if ($applicationId === null) {
                continue;
            }
            $rows[] = [
                'applicationId' => $applicationId,
                'type' => $event->getType(),
                'occurredAt' => $event->getOccurredAt(),
            ];
        }

        return self::summarize($rows);
    }

    /**
     * @param list<array{applicationId: int, type: string, occurredAt: \DateTimeImmutable}> $events
     * @return array{measured: int, averageHours: float|null, medianHours: float|null}
     */
    public static function summarize(array $events): array
    {
        usort($events, static fn (array $left, array $right): int => $left['occurredAt'] <=> $right['occurredAt']);

        /** @var array<int, \DateTimeImmutable> $submittedAt */
        $submittedAt = [];
        /** @var array<int, float> $firstInterviewHours */
        $firstInterviewHours = [];

        foreach ($events as $event) {
            $applicationId = $event['applicationId'];
            if ($event['type'] === JobTimelineEventType::APPLICATION_SUBMITTED) {
                $submittedAt[$applicationId] ??= $event['occurredAt'];
                continue;
            }

            if ($event['type'] !== JobTimelineEventType::INTERVIEW || isset($firstInterviewHours[$applicationId])) {
                continue;
            }

            $submission = $submittedAt[$applicationId] ?? null;
            if ($submission === null || $event['occurredAt'] < $submission) {
                continue;
            }

            $firstInterviewHours[$applicationId] = ($event['occurredAt']->getTimestamp() - $submission->getTimestamp()) / 3600;
        }

        $durations = array_values($firstInterviewHours);
        sort($durations, SORT_NUMERIC);
        $count = count($durations);
        if ($count === 0) {
            return ['measured' => 0, 'averageHours' => null, 'medianHours' => null];
        }

        $middle = intdiv($count, 2);
        $median = $count % 2 === 1
            ? $durations[$middle]
            : ($durations[$middle - 1] + $durations[$middle]) / 2;

        return [
            'measured' => $count,
            'averageHours' => round(array_sum($durations) / $count, 1),
            'medianHours' => round($median, 1),
        ];
    }
}
