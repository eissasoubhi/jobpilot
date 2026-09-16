<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\Service\TimelineResponseLatencyReportService;
use App\Timeline\JobTimelineEventType;
use PHPUnit\Framework\TestCase;

final class TimelineResponseLatencyReportServiceTest extends TestCase
{
    public function testUsesFirstResponseAfterSubmissionAndReturnsAverageAndMedian(): void
    {
        $at = static fn (string $value): \DateTimeImmutable => new \DateTimeImmutable($value);

        $result = TimelineResponseLatencyReportService::summarize([
            ['applicationId' => 1, 'type' => JobTimelineEventType::RESPONSE_RECEIVED, 'occurredAt' => $at('2026-09-10 08:00:00')],
            ['applicationId' => 1, 'type' => JobTimelineEventType::APPLICATION_SUBMITTED, 'occurredAt' => $at('2026-09-10 10:00:00')],
            ['applicationId' => 1, 'type' => JobTimelineEventType::INTERVIEW, 'occurredAt' => $at('2026-09-11 10:00:00')],
            ['applicationId' => 1, 'type' => JobTimelineEventType::REJECTED, 'occurredAt' => $at('2026-09-12 10:00:00')],
            ['applicationId' => 2, 'type' => JobTimelineEventType::APPLICATION_SUBMITTED, 'occurredAt' => $at('2026-09-10 10:00:00')],
            ['applicationId' => 2, 'type' => JobTimelineEventType::RESPONSE_RECEIVED, 'occurredAt' => $at('2026-09-13 10:00:00')],
            ['applicationId' => 3, 'type' => JobTimelineEventType::APPLICATION_SUBMITTED, 'occurredAt' => $at('2026-09-10 10:00:00')],
            ['applicationId' => 3, 'type' => JobTimelineEventType::REJECTED, 'occurredAt' => $at('2026-09-11 10:00:00')],
        ]);

        self::assertSame(3, $result['measured']);
        self::assertSame(40.0, $result['averageHours']);
        self::assertSame(24.0, $result['medianHours']);
    }

    public function testReturnsNoMeasurementWithoutSubmissionResponsePair(): void
    {
        $result = TimelineResponseLatencyReportService::summarize([
            ['applicationId' => 1, 'type' => JobTimelineEventType::APPLICATION_SUBMITTED, 'occurredAt' => new \DateTimeImmutable('2026-09-10 10:00:00')],
        ]);

        self::assertSame(['measured' => 0, 'averageHours' => null, 'medianHours' => null], $result);
    }
}
