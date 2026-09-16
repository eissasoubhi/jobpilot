<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\JobTimelineEvent;
use App\Timeline\JobTimelineEventType;
use Doctrine\ORM\EntityManagerInterface;

final class TimelineResponseLatencyReportService
{
    public function __construct(private EntityManagerInterface $em)
    {
    }

    /** @return array{measured: int, medianHours: float|null} */
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
                JobTimelineEventType::RESPONSE_RECEIVED,
                JobTimelineEventType::REJECTED,
                JobTimelineEventType::INTERVIEW,
            ])
            ->orderBy('event.occurredAt', 'ASC')
            ->addOrderBy('event.id', 'ASC')
            ->getQuery()
            ->getResult();

        /** @var array<int, \DateTimeImmutable> $submittedAt */
        $submittedAt = [];
        /** @var array<int, float> $firstResponseHours */
        $firstResponseHours = [];

        foreach ($events as $event) {
            $applicationId = $event->getApplication()?->getId();
            if ($applicationId === null) {
                continue;
            }

            if ($event->getType() === JobTimelineEventType::APPLICATION_SUBMITTED) {
                $submittedAt[$applicationId] ??= $event->getOccurredAt();
                continue;
            }

            if (isset($firstResponseHours[$applicationId], $submittedAt[$applicationId])) {
                continue;
            }

            $submission = $submittedAt[$applicationId] ?? null;
            if ($submission === null || $event->getOccurredAt() < $submission) {
                continue;
            }

            $firstResponseHours[$applicationId] = ($event->getOccurredAt()->getTimestamp() - $submission->getTimestamp()) / 3600;
        }

        $durations = array_values($firstResponseHours);
        sort($durations, SORT_NUMERIC);
        $count = count($durations);
        if ($count === 0) {
            return ['measured' => 0, 'medianHours' => null];
        }

        $middle = intdiv($count, 2);
        $median = $count % 2 === 1
            ? $durations[$middle]
            : ($durations[$middle - 1] + $durations[$middle]) / 2;

        return [
            'measured' => $count,
            'medianHours' => round($median, 1),
        ];
    }
}
