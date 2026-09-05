# JobPilot Design System

This document describes the visual language used by the JobPilot web application and its Storybook.

## Product principles

JobPilot is an operational tool. The interface should help the user decide and act quickly, not compete for attention.

1. **Clarity before decoration.** Information hierarchy, labels and actions must stay obvious.
2. **Dense where density is useful.** Offers, applications and CRM screens can show a lot of information, but grouping and scanning must remain easy.
3. **AI must look identifiable, not magical.** AI-generated analysis uses a restrained Aurora accent so the user can distinguish it from ordinary product data.
4. **One system, several compositions.** Dashboard, table and editorial screens share the same tokens and primitives.
5. **Content is part of the component.** UI copy is reviewed together with layout, states and accessibility.

## Visual modes

### Core minimal / productive

Default mode for the application shell, forms, buttons, filters, settings and feedback.

- neutral surfaces;
- clear borders;
- restrained shadows;
- one primary action color;
- predictable spacing and interaction states.

### Bento

Used for dashboards and summaries where several independent signals must be understood together.

- varied card spans are allowed when the information importance justifies them;
- avoid decorative empty cards;
- cards should represent one clear question or action;
- KPI cards must include context, not only a large number.

### Data-dense

Used for offers, applications, CRM and reporting.

- prioritize scanability;
- keep row actions stable;
- avoid excessive card nesting;
- use badges only for information that benefits from fast visual classification;
- show the most important decision information without forcing the user into a detail page.

### Editorial

Used for a single offer and long reading-heavy content.

- readable line length;
- comfortable line height;
- clear section hierarchy;
- metadata separated from the main narrative;
- actions remain visible without interrupting reading.

### AI-native / Aurora

Reserved for AI-powered surfaces: matching explanations, generated recommendations, assisted writing and similar features.

- use `--jp-color-ai` and `--jp-color-ai-secondary` as accents;
- prefer `jp-ai-surface` for contained AI panels;
- never apply Aurora gradients to the whole application shell;
- state what the AI did and what the user can do next;
- do not visually imply certainty when the output is probabilistic.

## Tokens

Tokens live in `web/app/design-system.css` and use the `--jp-*` prefix.

The existing variables (`--bg`, `--panel`, `--text`, `--muted`, `--line`, `--primary`, etc.) remain aliases during migration. New reusable components should prefer the semantic `--jp-*` variables.

Token groups currently include:

- semantic colors and feedback colors;
- radii;
- shadows;
- spacing;
- typography sizes.

## Shared primitives

Shared React primitives live in `web/components/UI.tsx`.

Prefer these primitives before inventing a page-local equivalent. When a local pattern appears on more than one screen, promote it to a reusable primitive or documented composition.

## Storybook

Run locally from `web/`:

```bash
npm install
npm run storybook
```

Validate the static build with:

```bash
npm run build-storybook
```

Stories import the real application styles from `web/app/globals.css` and `web/app/design-system.css`.

Every materially changed shared visual component must update its stories in the same change. Cover realistic states and keep example copy representative of the product.

## Migration order

1. shared shell and primitives;
2. dashboard / KPI surfaces;
3. offers and review flow;
4. applications and CRM tables;
5. single-offer editorial view;
6. AI-specific panels and generated-content workflows;
7. remaining settings and secondary screens.

This order keeps the product usable while progressively reducing legacy one-off styling.
