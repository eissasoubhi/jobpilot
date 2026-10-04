# Timeline interview latency

`GET /api/reporting/interview-latency` exposes the V1 submission-to-first-interview latency derived only from append-only business timeline events.

The metric pairs the first `APPLICATION_SUBMITTED` event of an application with its first later `INTERVIEW` event. Interviews recorded before submission, duplicate later interview events and applications without a complete pair are ignored.

The response contains `measured`, the number of applications with a valid pair, `averageHours`, and `medianHours`. Both latency values are `null` when no complete path exists.

This metric deliberately does not infer dates from the current application status, `updatedAt`, Gmail metadata or offer publication dates.
