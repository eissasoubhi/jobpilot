# JobPilot V1 — Production readiness ledger

This ledger turns the V1 exit criteria into evidence that can be checked before declaring V1 production-ready. It complements `roadmap.md` and `roadmap-v1.md`; it does not expand V1 scope into V2/V3.

## Merge gate

Every V1 product or production-hardening PR must be synchronized with `main` and green on its exact head for:

- Backend tests and database isolation;
- Frontend typecheck, unit tests, production build and Storybook build;
- Docker Compose configuration;
- Chromium end-to-end tests;
- required deployment image builds.

A documentation-only change may use the same CI contract, but documentation is never evidence that a runtime capability works.

## V1 capability evidence

| Capability | Current evidence | Exit evidence still required |
| --- | --- | --- |
| Foundation | Repository instructions, CI contract and isolated test-database rules are established. | Keep gates green on every exact head. |
| Connector framework | Common connector registry, synchronization history, diagnostics and health monitoring are delivered. | Keep source policies explicit and observable. |
| Gmail | Scheduled synchronization, classification, offer/application association and actionable inbox are delivered. | Preserve privacy and minimum OAuth scope. |
| Canonical offers / dedup | Canonical offer + source occurrences, deterministic conservative deduplication and source provenance are delivered. | Preserve idempotence as new connectors are added. |
| Multi-source collection | API/RSS/HTTP foundations and several operational sources exist; the acquisition matrix records explicit decisions rather than leaving sources indefinitely under review. | Implement only approved `PLANNED` channels after the required partner access/specifications are actually available; keep Gmail/extension-only sources non-automated. |
| Unified Offers Workspace | Review/edit/decision flows, sent/ignored/archive views and safe Undo are delivered. | Maintain Chromium coverage for the critical decisions. |
| Review Queue / preparation | Automatic preparation, Review Queue, keyboard navigation and explicit user-controlled submission tracking are delivered. | Do not introduce silent external submission. |
| Business timeline | Append-only business events back temporal analytics and opportunity history. | Any new temporal metric must continue to derive from reliable business events rather than inferred timestamps. |
| CRM | Organizations, recruiters/contacts, corrections, notes, tasks/reminders and timeline context are available. | Manual organization merge remains intentionally blocked until product semantics and non-destructive rules are defined. |
| Reporting / analytics | Conversion, matching, compensation and timeline-backed latency metrics are delivered. | Acceptance-rate metrics remain blocked until a reliable acceptance outcome is defined and historized. |
| UX / design / accessibility | Shared primitives, Storybook, keyboard/focus behavior and responsive product rules exist. | Record measured accessibility evidence on the principal daily workflows before V1 exit. |
| Production hardening | Immutable deployment images and automated disposable backup/restore verification exist. | Record staging deployment/rollback evidence, observability/alert evidence, incident procedure evidence, persistent/object-storage evidence where required, and measured accessibility/performance evidence. |

## External/manual blockers

The following are not safe targets for autonomous implementation until the prerequisite exists:

- partner-only acquisition channels that require a contract, credentials, redistribution specifications or explicit authorization;
- manual organization merging until merge semantics, provenance and rollback behavior are defined;
- acceptance-rate reporting until the domain has a reliable acceptance outcome;
- any scraper where authorization is absent or ambiguous.

Automation must not replace these prerequisites with undocumented endpoints, private sessions, CAPTCHA bypass, proxy rotation or weaker tests.

## Production evidence to capture

V1 is not 100% production-ready merely because CI is green. Before closing V1, retain concrete evidence for:

1. a staging deployment from immutable images;
2. a rollback of that staging deployment;
3. backup creation and restore verification using disposable databases, plus the production/staging operational procedure;
4. synchronization/worker failure visibility and at least one alert-path verification;
5. incident response and recovery steps that identify owner/action/rollback paths without embedding secrets;
6. persistence of user documents/data across application container replacement where the deployment architecture requires it;
7. measured accessibility of the principal Offers, Review Queue, Inbox/CRM and Reporting workflows;
8. measured performance of the principal daily workflows under a representative local/staging dataset.

For each item, record the date, environment, exact deployed commit/image digest, command or workflow used, result and any follow-up. Do not store credentials, OAuth tokens, private e-mail contents, CV contents or other personal data in the evidence.

## Completion rule

Declare V1 complete only when the V1 exit criteria in `roadmap-v1.md` are satisfied and the remaining production evidence above is captured. Once that is true, stop autonomous V1 work; do not automatically start V2 AI-first ATS or V3 Career OS work.