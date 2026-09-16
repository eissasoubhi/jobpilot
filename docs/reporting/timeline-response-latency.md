# Timeline response latency

`GET /api/reporting/response-latency` exposes the V1 first-response latency derived only from append-only business timeline events.

The metric pairs the first `APPLICATION_SUBMITTED` event of an application with its first later response event (`RESPONSE_RECEIVED`, `REJECTED` or `INTERVIEW`). Events before submission, duplicate later responses and events without an application are ignored.

The response contains `measured`, the number of applications with a valid pair, and `medianHours`, the median elapsed time in hours (or `null` when no pair is available).

This endpoint deliberately does not fall back to mutable application status, `submittedAt`, or inbox timestamps. It is the first reporting slice that treats the timeline as the sole temporal source of truth, as required by the V1 roadmap. The existing dashboard metric can migrate to this service in a separate small PR once this contract is validated.
