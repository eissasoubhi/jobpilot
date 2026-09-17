# Workspace navigation UX review — 2026-09-17

## User problem

JobPilot V1 defines `Offres` as the primary workspace and keeps the legacy `Candidatures` surface only as a functional fallback until parity is validated. Showing both as equal first-level entries in the `Travail` navigation makes the product model ambiguous: the user is asked to choose between two surfaces for the same core job-search workflow.

## Product Design Expert review

The smallest safe improvement is to remove `Candidatures` from primary navigation while keeping the route intact. This follows the design principle “less noise, more decision” without deleting fallback functionality or changing any application behavior.

The resulting primary workflow is clearer:

1. `Tableau de bord` for orientation and priorities;
2. `Offres` as the single offer/application workspace entry;
3. `Review Queue` for the focused decision flow.

The legacy `/candidatures` route remains available to existing direct links and dashboard links until Unified Offers Workspace parity and E2E coverage are explicitly validated. This PR does not redirect or remove it.

## Accessibility and responsive review

No interaction primitive, focus behavior, mobile menu behavior, touch target, visual token, or reusable state changes. Existing navigation semantics and mobile disclosure remain unchanged. A focused unit regression ensures the primary navigation no longer exposes the duplicate `Candidatures` entry.

## UX writing review

No new user-facing terminology is introduced. Existing labels `Offres` and `Review Queue` remain task-oriented and preserve the current product vocabulary.

## Storybook

No shared visual component or reusable visual state changes, so no Storybook story is required for this slice.

## Safety

- no external submission behavior changes;
- no application status or data changes;
- no source-compliance behavior changes;
- `/candidatures` remains functional as a fallback;
- removal or redirect of the legacy route remains blocked on explicit parity validation.
