# Ink-Rider UI rules

Last updated: 2026-08-24

This document governs how tokens become reusable interface patterns. See [ui-tokens.md](ui-tokens.md) for raw design values and [ui-registry.md](ui-registry.md) for component ownership.

## General rules

- Use semantic HTML before adding roles.
- Every interactive state includes default, hover, pressed, focus-visible, disabled, loading, and error behavior where relevant.
- Do not use color as the only indication of state.
- Prefer clear hierarchy and whitespace over extra containers.
- Avoid cards nested inside cards.
- Use sentence case in UI copy.
- Controls use direct labels: “Save draft,” not “Proceed.”
- Destructive actions name the object affected and require proportionate confirmation.
- Do not show success before the server confirms persistence unless the action is explicitly optimistic and reversible.

## Fonts and editorial hierarchy

- Page and article titles use the display serif.
- Navigation, filters, controls, forms, and metadata use the body sans.
- Article body defaults to at least 17 px with generous line height.
- Limit long-form text width to `--width-reading`.
- Avoid more than three typographic levels in a single card or compact region.
- Small uppercase labels are optional, not the default section-heading pattern.
- Use tabular numbers for analytics, timers, ranks, and vote counts.

## Cards

A card exists only when grouping or interaction benefits from a bounded surface.

### Article card

Required content:

- Article title
- Writer identity
- Cover or an intentional text-only layout
- Reading time or content format
- Publication/freshness context
- Optional topic and one primary quality/context signal

Rules:

- The title or explicit stretched link owns navigation.
- Save and overflow actions remain separate buttons.
- Do not make a non-semantic outer `div` the only clickable target.
- Use a maximum of two metadata rows.
- Card images use stable aspect ratios to prevent layout shift.
- Avoid equal-height card grids when content density varies significantly.

### Question card

- Lead with the question, not the author.
- Show demand count, answer state, topics, freshness, and whether a writer has claimed it.
- Voting is an explicit set/unset action with an accessible name.
- Duplicate or answered states are visible in text, not color alone.

### Competition card

- Show status, mode, deadline/results date, eligibility summary, and entry count.
- Countdown values use server-derived dates and tabular figures.
- Closed competitions never display an enabled submission action.

### Collection card

- Show curator, purpose, item count, visibility, and a representative cover.
- Collection save is independent from opening the collection.
- Do not label algorithmic collections as hand-curated.

### Dashboard/stat card

- Use cards only when values require comparison or grouping.
- Always include time range and metric definition.
- A percentage change must expose its comparison period.
- Do not use decorative charts without accessible values or summaries.

## Buttons

### Hierarchy

- **Primary:** one dominant action per local decision area.
- **Secondary:** important alternative with lower emphasis.
- **Tertiary/text:** navigation or low-risk supportive action.
- **Quiet/icon:** compact action whose icon is familiar and has an accessible name.
- **Danger:** destructive action; never use it as decoration.

Rules:

- Minimum pointer target: 44 × 44 px where layout permits; never below 40 × 40 px for icon-only controls.
- Labels start with a verb when an action occurs.
- Icon-only buttons require `aria-label` and usually a tooltip.
- Loading retains width, disables duplicate submission, and communicates progress.
- Disabled controls must remain legible and should explain unmet prerequisites nearby.
- A button triggers an action; a link navigates.
- Do not pair primary and ghost buttons mechanically on every surface.

## Inputs and forms

- Every field has a persistent visible label. Placeholder text is supplementary.
- Help and error text is associated with `aria-describedby`.
- Validate on submit and after a visited field changes; do not punish users while they are typing.
- Preserve entered values after recoverable server errors.
- Required fields are identified in text.
- Search uses a search landmark and submit behavior.
- OTP inputs support paste, keyboard navigation, and a single accessible group label.
- Rich editor shortcuts must have discoverable pointer and keyboard alternatives.

## Navigation bars and sidebars

### Top bar

- Contains brand/home link, search entry, primary creation action when relevant, notifications, and account access.
- Remains visually stable across routes.
- Search suggestions distinguish writer, article, question, and collection results.
- Global search must not use a separate mock-data implementation from the search results page.

### Desktop navigation

- Active destination is indicated by text weight plus shape/border, not color alone.
- Expandable groups expose `aria-expanded` and preserve current-route visibility.
- Resizing is optional; if retained, it must have a keyboard mechanism and persisted bounds.

### Mobile bottom bar

- Contains no more than five primary destinations.
- Respects safe-area inset and does not cover page actions.
- Labels remain visible; do not rely on icons alone.

### Reading progress bar

- Represents article progress only after the reading container is known.
- Does not animate width with a duration that makes it lag behind scrolling.
- It is supplementary and does not need to be announced continuously by assistive technology.

## Tabs, pills, filters, and badges

### Tabs

- Use tabs only when sections share one context and switching does not represent navigation history.
- Use links/route segments when a state should be bookmarkable or support browser navigation.
- Implement keyboard arrow navigation and proper tab semantics for real tabs.

### Filter chips and pills

- Use for compact multi-select or mutually exclusive filters.
- Expose selected state with `aria-pressed` or native input semantics.
- Keep labels short and allow wrapping on mobile.
- Avoid using pills for ordinary static metadata.

### Badges

- Communicate status, qualification, or durable achievement.
- Use compact shapes rather than making every label fully pill-shaped.
- Competition winner badges identify contest and year in accessible text.
- “New” and “Premium” labels require a defined lifecycle and must not remain indefinitely.

## Menus, popovers, dialogs, and drawers

- Use a popover for lightweight contextual choices.
- Use a dialog only when the user must complete or dismiss a focused task.
- Prefer a drawer or full page for complex editing on small screens.
- Opening moves focus appropriately; closing restores focus to the trigger.
- Escape closes dismissible overlays.
- Dialogs trap focus and prevent background interaction.
- Outside-click dismissal must not be the only close mechanism.
- Positioning must account for viewport collision.

## Feedback states

### Loading

- Use layout-matched skeletons for feeds and detail pages.
- Use compact progress in buttons for individual mutations.
- Avoid replacing the full application shell during background refresh.

### Empty

- Explain why the surface is empty.
- Offer one relevant next action.
- Distinguish “no data yet” from “no results for these filters.”

### Error

- State what failed, preserve recoverable work, and offer retry or another route.
- Authentication expiry may redirect only after safe refresh fails.
- Do not expose raw server messages or stack traces.

### Success

- Confirm durable mutations quietly.
- Avoid exclamation marks and celebratory treatment for routine operations.
- Provide undo for reversible destructive or organizational changes when practical.

## Article page

- Keep title, abstract, writer context, publication date, reading time, and cover hierarchy clear.
- Generated summaries are labeled, tied to an article revision, and never impersonate author-written abstracts.
- Article actions remain reachable without obstructing reading.
- On narrow screens, summary and audio tools become a drawer or inline section rather than squeezing the article column.
- Comments follow the article and expose moderation/report controls.
- Related recommendations explain the relationship and avoid repeating the same writer excessively.

## Editor

- Autosave state is visible: saving, saved, offline, conflict, and error.
- Keyboard behavior never overrides native paste without preserving rich and plain-text expectations.
- Slash commands are optional accelerators; toolbar alternatives remain available.
- Block drag handles support keyboard reordering.
- Image blocks require alt text or an explicit decorative designation.
- Publishing validates title, content, media, topics, and audience settings.
- Preview uses the production renderer, not a parallel visual approximation.
- Destructive navigation warns only when unsaved work actually exists.

## Responsive rules

- Design for narrow width first, then enrich composition.
- Do not rely on hover for essential functionality.
- Prevent horizontal page scroll at 320 px CSS width.
- Major dialogs become full-height drawers when their content cannot fit comfortably.
- Tables require a mobile transformation or intentional scroll container.
- Long words, URLs, writer handles, and article titles must wrap safely.

## Accessibility baseline

- Meet WCAG 2.2 AA contrast and interaction expectations.
- Keep one main content landmark per rendered route; the application shell owns scrolling, while route content owns its main landmark.
- Include a skip-to-content link.
- Provide visible `:focus-visible` treatment.
- Maintain logical heading order.
- Give meaningful images useful alt text; decorative images use empty alt deliberately.
- Respect reduced motion and system color preference.
- The global reduced-motion mode disables non-essential animation and transition timing and turns off smooth scrolling; interaction and focus behavior remain available.
- Announce asynchronous form results with appropriate live regions.
- Test primary flows using keyboard only and at 200% zoom.

