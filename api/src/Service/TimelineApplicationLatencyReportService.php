<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\JobTimelineEvent;
use App\Timeline\JobTimelineEventType;
use Doctrine\ORM\EntityManagerInterface;

final class TimelineApplicationLatencyReportService
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
            ->addSelect('jobOffer')
            ->leftJoin('event.jobOffer', 'jobOffer')
            ->andWhere('event.type IN (:types)')
            ->setParameter('types', [
                JobTimelineEventType::OFFER_IMPORTED,
                JobTimelineEventType::APPLICATION_SUBMITTED,
            ])
            ->orderBy('event.occurredAt', 'ASC')
            ->addOrderBy('event.id', 'ASC')
            ->getQuery()
            ->getResult();

        $rows = [];
        foreach ($events as $event) {
            $jobOfferId = $event->getJobOffer()->getId();
            if ($jobOfferId === null) {
                continue;
            }
            $rows[] = [
                'jobOfferId' => $jobOfferId,
                'type' => $event->getType(),
                'occurredAt' => $event->getOccurredAt(),
            ];
        }

        return self::summarize($rows);
    }

    /**
     * @param list<array{jobOfferId: int, type: string, occurredAt: \DateTimeImmutable}> $events
     * @return array{measured: int, averageHours: float|null, medianHours: float|null}
     */
    public static function summarize(array $events): array
    {
        usort($events, static fn (array $left, array $right): int => $left['occurredAt'] <=> $right['occurredAt']);

        /** @var array<int, \DateTimeImmutable> $discoveredAt */
        $discoveredAt = [];
        /** @var array<int, float> $firstApplicationHours */
        $firstApplicationHours = [];

        foreach ($events as $event) {
            $jobOfferId = $event['jobOfferId'];
            if ($event['type'] === JobTimelineEventType::OFFER_IMPORTED) {
                $discoveredAt[$jobOfferId] ??= $event['occurredAt'];
                continue;
            }
            if ($event['type'] !== JobTimelineEventType::APPLICATION_SUBMITTED || isset($firstApplicationHours[$jobOfferId])) {
                continue;
            }

            $discovery = $discoveredAt[$jobOfferId] ?? null;
            if ($discovery === null || $event['occurredAt'] < $discovery) {
                continue;
            }

            $firstApplicationHours[$jobOfferId] = ($event['occurredAt']->getTimestamp() - $discovery->getTimestamp()) / 3600;
        }

        $durations = array_values($firstApplicationHours);
        sort($durations, SORT_NUMERIC);
        $count = count($durations);
        if ($count === 0) {
            return ['measured' => 0, 'averageHours' => null, 'medianHours' => null];
        }

        $middle = intdiv($count, 2);
        $median = $count % 2 === 1
            ? $durations[$middle]
            : ($durations[$middle - 1] + $durations[$middle]) / 2;
        $average = array_sum($durations) / $count;

        return [
            'measured' => $count,
            'averageHours' => round($average, 1),
            'medianHours' => round($median, 1),
        ];
    }
}
