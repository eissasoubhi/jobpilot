<?php

declare(strict_types=1);

namespace App\Tests\Service;

use App\Entity\Application;
use App\Entity\JobOffer;
use App\Entity\UserSettings;
use App\Service\ApplicationEmailFactory;
use App\Service\AutomaticSubmissionService;
use App\Service\GmailService;
use Doctrine\ORM\EntityManagerInterface;
use PHPUnit\Framework\TestCase;

final class AutomaticSubmissionServiceTest extends TestCase
{
    public function testFilteredOfferCannotBeSubmittedAutomatically(): void
    {
        $job = (new JobOffer())->fill([
            'title' => 'Senior PHP Symfony',
            'description' => 'Mission PHP Symfony',
            'status' => 'REJECTED_BY_FILTER',
        ]);
        $application = new Application($job);
        $settings = (new UserSettings())->fill(['autoSubmitEnabled' => true]);

        $service = new AutomaticSubmissionService(
            $this->createMock(EntityManagerInterface::class),
            (new \ReflectionClass(GmailService::class))->newInstanceWithoutConstructor(),
            (new \ReflectionClass(ApplicationEmailFactory::class))->newInstanceWithoutConstructor(),
        );

        self::assertSame(
            ['status' => 'skipped', 'reason' => 'job_not_prepared'],
            $service->submitIfEligible($application, $settings),
        );
    }
}
