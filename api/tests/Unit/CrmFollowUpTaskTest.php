<?php

declare(strict_types=1);

namespace App\Tests\Unit;

use App\Entity\CrmFollowUpTask;
use App\Entity\JobOffer;
use PHPUnit\Framework\TestCase;

final class CrmFollowUpTaskTest extends TestCase
{
    public function testNormalizesAndCompletesATaskWithoutChangingItsTarget(): void
    {
        $jobOffer = new JobOffer();
        $task = new CrmFollowUpTask(
            ' acme consulting ',
            ' jane@acme.test ',
            ' Relancer pour la mission ',
            ' Demander la date de décision. ',
            new \DateTimeImmutable('2026-08-12 18:30:00'),
            $jobOffer,
        );

        self::assertSame('acme consulting', $task->getOrganizationKey());
        self::assertSame('jane@acme.test', $task->getContactKey());
        self::assertSame($jobOffer, $task->getJobOffer());
        self::assertSame('Relancer pour la mission', $task->getTitle());
        self::assertSame('Demander la date de décision.', $task->getNote());
        self::assertSame('2026-08-12', $task->getDueAt()->format('Y-m-d'));
        self::assertFalse($task->isCompleted());

        $task->setCompleted(true);
        self::assertTrue($task->isCompleted());
        self::assertNotNull($task->getCompletedAt());

        $completedAt = $task->getCompletedAt();
        $task->setCompleted(true);
        self::assertSame($completedAt, $task->getCompletedAt());
        self::assertSame($jobOffer, $task->getJobOffer());

        $task->setCompleted(false);
        self::assertFalse($task->isCompleted());
        self::assertNull($task->getCompletedAt());
        self::assertSame($jobOffer, $task->getJobOffer());
    }

    public function testKeepsLegacyOrganizationOnlyFollowUpsValid(): void
    {
        $task = new CrmFollowUpTask('acme', null, 'Relancer', null, new \DateTimeImmutable('2026-08-12'));

        self::assertNull($task->getJobOffer());
        self::assertNull($task->toArray()['jobOfferId']);
    }

    public function testRejectsInvalidTitleAndOversizedNote(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new CrmFollowUpTask('acme', null, "Invalid\ntitle", null, new \DateTimeImmutable('2026-08-12'));
    }

    public function testRejectsOversizedNote(): void
    {
        $this->expectException(\InvalidArgumentException::class);
        new CrmFollowUpTask('acme', null, 'Relancer', str_repeat('x', 2001), new \DateTimeImmutable('2026-08-12'));
    }
}
