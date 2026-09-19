<?php

declare(strict_types=1);

namespace App\Service;

use App\Entity\Application;
use App\Entity\CandidateProfile;
use App\Entity\JobOffer;
use App\Timeline\JobTimelineEventType;
use App\Timeline\JobTimelineRecorder;
use Doctrine\ORM\EntityManagerInterface;

final class ApplicationPreparationService
{
    public function __construct(
        private EntityManagerInterface $em,
        private ApplicationCvRepairService $cvRepair,
        private ApplicationContentBuilder $contentBuilder,
        private JobTimelineRecorder $timeline,
        private ?LocalDataService $data = null,
    ) {}

    public function prepare(JobOffer $job, CandidateProfile $profile): Application
    {
        $existing = $this->em->getRepository(Application::class)->findOneBy(['jobOffer' => $job]);

        // Archiving is an explicit local triage decision. Background processing and
        // repeated preparation must never silently put the offer back in the inbox;
        // the user has to restore it explicitly through the safe Undo flow first.
        if ($existing?->getStatus() === 'ARCHIVED') {
            return $existing;
        }

        $application = $existing ?? new Application($job);
        $profileSkills = $this->data?->settings()->getSkills() ?? [];
        $content = $this->contentBuilder->build($job, $profile, $profileSkills);

        $compensation = null;
        if ($job->getProposedTjm() !== null) {
            $compensation = $job->getProposedTjm().' € HT/jour';
        } elseif ($job->getProposedSalary() !== null) {
            $compensation = number_format($job->getProposedSalary(), 0, ',', ' ').' € brut annuel (rémunération globale)';
        }

        $cv = $this->cvRepair->resolveForJob($job);
        $application->prepare(
            $cv,
            $content['message'],
            $content['coverLetter'],
            $compensation,
        );
        $job->markPrepared();
        $this->em->persist($application);
        $this->timeline->record(
            $job,
            $existing === null
                ? JobTimelineEventType::PREPARATION_CREATED
                : JobTimelineEventType::PREPARATION_UPDATED,
            [],
            $application,
            null,
            'application-preparation',
        );
        $this->em->flush();

        return $application;
    }
}
