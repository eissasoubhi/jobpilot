# Timeline response latency

`GET /api/reporting/response-latency` exposes the V1 first-response latency derived only from append-only business timeline events.

The metric pairs the first `APPLICATION_SUBMITTED` event of an application with its first later response event (`RESPONSE_RECEIVED`, `REJECTED` or `INTERVIEW`). Events before submission, duplicate later responses and events without an application are ignored.

The response contains `measured`, the number of applications with a valid pair, `averageHours`, the arithmetic mean elapsed time in hours, and `medianHours`, the median elapsed time in hours. Both latency values are `null` when no pair is available. Keeping the median alongside the roadmap-required average makes skew from unusually slow responses visible without changing the existing contract destructively.

This endpoint deliberately does not fall back to mutable application status, `submittedAt`, or inbox timestamps. The timeline remains the sole temporal source of truth, as required by the V1 roadmap. The existing dashboard metric can migrate to this service in a separate small PR once this contract is validated.
