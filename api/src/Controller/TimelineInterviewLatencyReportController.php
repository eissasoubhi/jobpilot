<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\TimelineInterviewLatencyReportService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class TimelineInterviewLatencyReportController
{
    public function __construct(private TimelineInterviewLatencyReportService $report)
    {
    }

    #[Route('/api/reporting/interview-latency', methods: ['GET'])]
    public function __invoke(): JsonResponse
    {
        return new JsonResponse($this->report->report());
    }
}
