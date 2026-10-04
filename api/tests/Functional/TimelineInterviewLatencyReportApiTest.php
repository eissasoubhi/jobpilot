<?php

declare(strict_types=1);

namespace App\Tests\Functional;

use App\Entity\Application;
use App\Entity\JobOffer;
use App\Entity\JobTimelineEvent;
use App\Timeline\JobTimelineEventType;
use Doctrine\ORM\EntityManagerInterface;
use Symfony\Bundle\FrameworkBundle\Test\WebTestCase;

final class TimelineInterviewLatencyReportApiTest extends WebTestCase
{
    public function testEndpointUsesPersistedTimelineEventsOnly(): void
    {
        $client = static::createClient();
        $em = static::getContainer()->get(EntityManagerInterface::class);
        self::assertInstanceOf(EntityManagerInterface::class, $em);

        $job = (new JobOffer())->fill([
            'source' => 'Timeline report test',
            'title' => 'Développeur Symfony',
            'company' => 'Example',
            'location' => 'Paris',
            'contractType' => 'CDI',
            'workMode' => 'Hybride',
            'description' => 'Test de délai vers entretien.',
        ]);
        $application = new Application($job);

        $em->persist($job);
        $em->persist($application);
        $em->persist(new JobTimelineEvent(
            $job,
            JobTimelineEventType::APPLICATION_SUBMITTED,
            [],
            $application,
            new \DateTimeImmutable('2026-09-10T10:00:00+00:00'),
            'test',
        ));
        $em->persist(new JobTimelineEvent(
            $job,
            JobTimelineEventType::INTERVIEW,
            [],
            $application,
            new \DateTimeImmutable('2026-09-12T10:00:00+00:00'),
            'test',
        ));
        $em->flush();

        $client->request('GET', '/api/reporting/interview-latency');

        self::assertResponseIsSuccessful();
        $payload = json_decode((string) $client->getResponse()->getContent(), true, 512, JSON_THROW_ON_ERROR);
        self::assertGreaterThanOrEqual(1, $payload['measured']);
        self::assertIsFloat($payload['averageHours']);
        self::assertIsFloat($payload['medianHours']);
    }
}
