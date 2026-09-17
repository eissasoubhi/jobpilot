# Michael Page acquisition review

Review date: 2026-09-17

## Decision

Recommended V1 acquisition status: `EMAIL_OR_EXTENSION_ONLY`.

Allowed JobPilot channels: recognized Gmail alerts and explicit user-triggered browser import. Do not add scheduled HTTP/browser scraping, private-session automation, or undocumented endpoint use on the basis of this review.

## Evidence reviewed

- Public job-search catalog: https://www.michaelpage.fr/job-search
- Public France jobs listing: https://www.michaelpage.fr/jobs/france
- Michael Page France terms of use: https://www.michaelpage.fr/conditions-g%C3%A9n%C3%A9rales-dutilisation

The public catalog and job listings are accessible without an authenticated candidate session, so Michael Page is technically discoverable as a public source. The terms of use, however, state that the Michael Page site is made available for personal use and prohibit producing, transmitting, or storing electronic copies of copyright-protected materials without the owner's authorization. The reviewed official pages do not publish an API/RSS or other official candidate-catalog redistribution channel for JobPilot.

Michael Page also documents job alerts delivered by email through a MyPage account. This provides a user-authorized acquisition path already compatible with JobPilot's Gmail/assisted-import model.

## Safety conclusion

Public visibility alone is not treated as permission for scheduled extraction. Until Michael Page publishes an official reusable reading channel or grants applicable written authorization, JobPilot should keep background scraping disabled and rely on Gmail alerts or voluntary browser import.

## Reopen condition

Revisit this decision only after one of the following is verified:

- an official API, RSS/feed, partner export, or equivalent reusable reading channel covering candidate job listings;
- written authorization applicable to JobPilot's automated collection use case.
