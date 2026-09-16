<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\Service\TimelineApplicationLatencyReportService;
use App\Timeline\JobTimelineEventType;
use PHPUnit\Framework\TestCase;

final class TimelineApplicationLatencyReportServiceTest extends TestCase
{
    public function testUsesFirstSubmissionAfterDiscoveryAndReturnsMedian(): void
    {
        $at = static fn (string $value): \DateTimeImmutable => new \DateTimeImmutable($value);

        $result = TimelineApplicationLatencyReportService::summarize([
            ['jobOfferId' => 1, 'type' => JobTimelineEventType::APPLICATION_SUBMITTED, 'occurredAt' => $at('2026-09-10 08:00:00')],
            ['jobOfferId' => 1, 'type' => JobTimelineEventType::OFFER_IMPORTED, 'occurredAt' => $at('2026-09-10 10:00:00')],
            ['jobOfferId' => 1, 'type' => JobTimelineEventType::APPLICATION_SUBMITTED, 'occurredAt' => $at('2026-09-11 10:00:00')],
            ['jobOfferId' => 1, 'type' => JobTimelineEventType::APPLICATION_SUBMITTED, 'occurredAt' => $at('2026-09-12 10:00:00')],
            ['jobOfferId' => 2, 'type' => JobTimelineEventType::OFFER_IMPORTED, 'occurredAt' => $at('2026-09-10 10:00:00')],
            ['jobOfferId' => 2, 'type' => JobTimelineEventType::APPLICATION_SUBMITTED, 'occurredAt' => $at('2026-09-13 10:00:00')],
        ]);

        self::assertSame(2, $result['measured']);
        self::assertSame(48.0, $result['medianHours']);
    }

    public function testReturnsNoMeasurementWithoutDiscoverySubmissionPair(): void
    {
        $result = TimelineApplicationLatencyReportService::summarize([
            ['jobOfferId' => 1, 'type' => JobTimelineEventType::OFFER_IMPORTED, 'occurredAt' => new \DateTimeImmutable('2026-09-10 10:00:00')],
        ]);

        self::assertSame(['measured' => 0, 'medianHours' => null], $result);
    }
}
