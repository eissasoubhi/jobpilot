<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\TimelineResponseLatencyReportService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class TimelineResponseLatencyReportController
{
    public function __construct(private TimelineResponseLatencyReportService $report)
    {
    }

    #[Route('/api/reporting/response-latency', methods: ['GET'])]
    public function __invoke(): JsonResponse
    {
        return new JsonResponse($this->report->report());
    }
}
