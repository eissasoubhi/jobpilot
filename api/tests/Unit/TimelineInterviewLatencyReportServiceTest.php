<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\Service\TimelineInterviewLatencyReportService;
use App\Timeline\JobTimelineEventType;
use PHPUnit\Framework\TestCase;

final class TimelineInterviewLatencyReportServiceTest extends TestCase
{
    public function testUsesFirstInterviewAfterSubmissionAndReturnsAverageAndMedian(): void
    {
        $at = static fn (string $value): \DateTimeImmutable => new \DateTimeImmutable($value);

        $result = TimelineInterviewLatencyReportService::summarize([
            ['applicationId' => 1, 'type' => JobTimelineEventType::INTERVIEW, 'occurredAt' => $at('2026-09-10 08:00:00')],
            ['applicationId' => 1, 'type' => JobTimelineEventType::APPLICATION_SUBMITTED, 'occurredAt' => $at('2026-09-10 10:00:00')],
            ['applicationId' => 1, 'type' => JobTimelineEventType::INTERVIEW, 'occurredAt' => $at('2026-09-11 10:00:00')],
            ['applicationId' => 1, 'type' => JobTimelineEventType::INTERVIEW, 'occurredAt' => $at('2026-09-12 10:00:00')],
            ['applicationId' => 2, 'type' => JobTimelineEventType::APPLICATION_SUBMITTED, 'occurredAt' => $at('2026-09-10 10:00:00')],
            ['applicationId' => 2, 'type' => JobTimelineEventType::INTERVIEW, 'occurredAt' => $at('2026-09-13 10:00:00')],
            ['applicationId' => 3, 'type' => JobTimelineEventType::APPLICATION_SUBMITTED, 'occurredAt' => $at('2026-09-10 10:00:00')],
        ]);

        self::assertSame(2, $result['measured']);
        self::assertSame(48.0, $result['averageHours']);
        self::assertSame(48.0, $result['medianHours']);
    }

    public function testReturnsNoMeasurementWithoutSubmissionInterviewPair(): void
    {
        $result = TimelineInterviewLatencyReportService::summarize([
            ['applicationId' => 1, 'type' => JobTimelineEventType::APPLICATION_SUBMITTED, 'occurredAt' => new \DateTimeImmutable('2026-09-10 10:00:00')],
        ]);

        self::assertSame(['measured' => 0, 'averageHours' => null, 'medianHours' => null], $result);
    }
}
