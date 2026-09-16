<?php

declare(strict_types=1);

namespace App\Controller;

use App\Service\TimelineApplicationLatencyReportService;
use Symfony\Component\HttpFoundation\JsonResponse;
use Symfony\Component\Routing\Attribute\Route;

final class TimelineApplicationLatencyReportController
{
    public function __construct(private TimelineApplicationLatencyReportService $report)
    {
    }

    #[Route('/api/reporting/application-latency', methods: ['GET'])]
    public function __invoke(): JsonResponse
    {
        return new JsonResponse($this->report->report());
    }
}
