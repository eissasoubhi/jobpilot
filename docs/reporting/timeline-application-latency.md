# Timeline application latency

`GET /api/reporting/application-latency` exposes the V1 discovery-to-application latency derived only from append-only business timeline events.

The metric pairs the first `OFFER_IMPORTED` event of an offer with its first later `APPLICATION_SUBMITTED` event. Submission events recorded before discovery, duplicate later submissions and offers without a complete pair are ignored.

The response contains `measured`, the number of offers with a valid pair, `averageHours`, the arithmetic mean elapsed time in hours, and `medianHours`, the median elapsed time in hours. Both latency values are `null` when no pair is available. The average satisfies the V1 reporting definition while the median remains available for a robust view of skewed application delays.

This endpoint deliberately uses the business timeline rather than mutable offer/application timestamps so reporting keeps a single auditable temporal source of truth.
