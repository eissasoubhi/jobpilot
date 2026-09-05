# AGENTS.md

## Product content / UX writing review

For every JobPilot change that affects a user-facing website, application screen, browser extension UI, workflow, notification, or other product surface, always perform an explicit **Content Designer / UX Writer** pass before considering the work complete.

Review all user-facing copy, including:

- buttons, links, menu labels, tabs, and form labels;
- page titles, section titles, helper text, placeholders, and empty states;
- validation, error, warning, success, confirmation, and informational messages;
- onboarding, instructions, tooltips, status text, and microcopy;
- terminology and wording consistency across the product.

The review must favor copy that is:

- short, clear, direct, and easy to understand;
- written for the user rather than for the implementation;
- non-technical unless technical wording is genuinely useful to the target user;
- explicit about what happened, what the user can do next, and the consequences of important actions;
- consistent in vocabulary, tone, capitalization, punctuation, and action labels across JobPilot;
- free of unnecessary jargon, internal implementation details, vague wording, and redundant text.

Do not treat existing copy as automatically correct. When reviewing or changing a screen, actively question the wording and improve it when a clearer, shorter, or more useful formulation exists.

## Design system

JobPilot uses one shared design system for all web product surfaces. Do not introduce a new visual language for a single page when an existing token, primitive, or composition pattern can be reused.

The visual hierarchy is:

- **Core minimal / productive** for the global shell, forms, navigation, actions, feedback and standard surfaces;
- **Bento** for dashboards, KPI groups and high-level summaries;
- **Data-dense** for offers, applications, CRM lists and operational tables;
- **Editorial** for a single offer, long descriptions and reading-heavy detail views;
- **AI-native / Aurora accents** only for AI analysis, matching, recommendations and other genuinely AI-powered features. Aurora styling must remain an accent, not the default page background.

Rules:

- Prefer semantic tokens from `web/app/design-system.css` over hard-coded colors, spacing, radii or shadows.
- Keep compatibility with existing aliases (`--bg`, `--panel`, `--text`, `--muted`, `--line`, `--primary`, etc.) while progressively migrating components to `--jp-*` tokens.
- Prefer shared primitives in `web/components/UI.tsx` before creating page-local equivalents.
- Keep states accessible: visible focus, sufficient contrast, explicit labels, semantic feedback, and reduced-motion support.
- New UI should work on narrow mobile layouts as well as desktop.

## Storybook

Storybook is part of the JobPilot UI development workflow, not optional documentation.

For every shared visual component or reusable state that is created or materially changed:

- create or update its Storybook story in the same change;
- cover meaningful states such as default, disabled, loading, success, warning, error, empty, selected or AI-specific states when relevant;
- load the real JobPilot design system instead of duplicating styles inside stories;
- keep story copy realistic and reviewed with the same UX writing rules as the product;
- run or keep compatible with `npm run build-storybook` before considering the UI change complete.

Use `web/components/UI.stories.tsx` as the starting reference for shared primitives.
