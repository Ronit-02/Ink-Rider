# Write page improvement audit — 2026-10-12

## Draft deletion — 2026-10-12

Audit: WriteDrafts and Writing studio draft rows already use saved title/type/time metadata and continuation links. Existing DM Sans/Libre Baskerville, semantic themes, Button danger/action appearances, ModalLayer, ModalHeader, and dialog focus support an additive sibling Delete draft action. The existing draft API helper and authenticated owner-scoped DELETE `/api/drafts/:draftId` remove only the selected owned Draft record; no backend, service, schema, route, or persistence replacement is required.

Added shared DeleteDraftButton to both lists. It confirms permanent deletion, retains failed requests for retry, blocks dismissal/repeated writes while pending, updates/refetches the shared list, clears the exact editor record cache, and restores focus after a removed row. Current behavior belongs to UI rules. Existing row typography/palette/dividers, continuation destinations, composition/autosave, chooser, navigation, APIs and stored models are preserved. The row wrapper makes the button a sibling of the existing link, avoiding nested interactive elements. No optional refactor or approval-dependent decision remains.

Changed source: `Frontend/src/features/editor/components/DeleteDraftButton.tsx`, `WriteDrafts.tsx`, and `Frontend/src/features/user/pages/Profile/index.jsx`. Checks: `Frontend/tests/write-drafts.spec.js`. Documentation: Frontend README, UI rules/registry, this audit, and progress tracker. Dated verification and limitations are recorded in the tracker.

## Draft list and typed composition — 2026-10-12

Completed the user's explicit approval to create this flow. This section supersedes the earlier format-toggle/Add content layout below; UI rules owns the current editor behavior.

Audit: the existing AppLayout/1120 px PageFrame, Libre Baskerville titles, DM Sans controls, semantic themes, shared Button, ModalLayer, ModalHeader, ViewportPopover, and SlashMenu support the requested change. Authenticated `/api/drafts` already lists/creates/reads/updates/deletes owner-scoped, versioned drafts. Existing multipart post creation and revision-checked updates remain the publication paths. No backend, schema, route, or API replacement is required.

| Before | Completed requested change |
|---|---|
| `/write` immediately opens composition | Saved draft list with top-right Write new and Post/Short chooser; selection immediately creates a typed draft for authenticated writers |
| Inline format toggle and combined details panel | Fixed draft type; Post stacks full-width cover placeholder, tags, title, body; Short uses the same column without a cover |
| Add content alongside per-block controls | Add content removed; desktop plus/cross appear on hover or keyboard focus and plus opens existing block choices |
| Phone gutter actions | Active-block toolbar with insertion/type choices in a scrolling bottom sheet |

Guest composition remains local until authentication; saved draft/edit targets remain private. Direct `?new=article`, `?new=short`, saved draft/edit, and question-response targets remain available. Failed list/create operations expose retry; pending creation prevents duplicate clicks and dismissal. Draft re-entry fetches the current server record before hydration to prevent stale cached content. Existing tags, release/depth settings, autosave/version conflicts, publish validation, question linkage, theme, typography, navigation, and unrelated pages remain intact. This task contains no optional refactor.

Changed files for this follow-up:

- Source: `Frontend/src/features/editor/pages/index.jsx`, `Frontend/src/features/editor/components/WriteDrafts.tsx`, `Frontend/src/features/editor/components/MobileBlockMenu.tsx`, `Frontend/src/styles/global.css`.
- Checks: `Frontend/tests/write-drafts.spec.js`, `Frontend/tests/editor-layout.spec.js`, `Frontend/tests/editor-overlay.spec.js`, `Frontend/tests/editor-tags.spec.js`, `Frontend/tests/critical-flow.spec.js`.
- Documentation: `Frontend/README.md`, `context/ui-rules.md`, `context/ui-registry.md`, `context/project-overview.md`, this audit, `context/progress-tracker.md`.

Limitations: existing draft storage has no cover field. A newly chosen cover stays in the current editor until publication; Drafts navigation is disabled while that cover is present, with explanatory text. Guest drafts remain in memory. Browser verification uses mocked APIs, without live persistence/providers, physical devices, assistive technology, or other browser engines. No approval decisions remain.

Verification on 2026-10-12: 27 distinct mocked-API Chrome checks passed across editor layout, draft list/creation/reopening, guest authentication, tags, overlay menus, desktop keyboard controls, and short-screen phone-sheet behavior. Frontend lint, production build, security artifacts (79 files, no source maps), and scoped whitespace validation passed. Reviewed phone list, desktop Dark chooser, phone bottom sheet, and phone/desktop editor previews. The updated live critical-flow spec was not run. Initial environment/test failures and the corrected stale-cache defect are recorded in the progress tracker.

## Earlier editor/tag improvements — 2026-10-12

Status: the user approved this approach on 2026-10-12. The bounded editor changes and additive tag-choice endpoint are implemented; verification is recorded below.

## Before the change

`/write` renders WritePage/MemberEditor inside AppLayout and the shared 1120 px PageFrame. The compact serif header groups autosave status with the shared Publish/Update Button. DM Sans controls, Libre Baskerville titles, semantic Light/Dark colors, rounded details surfaces, and left-edge writing focus markers follow existing conventions.

Before this change, the order was header, format selector, collapsed Story details, title, and body. Story details contains cover upload/removal, free-text tags with Add, optional short depth links, and eligible release settings. Tags have no existing-choice dropdown. Writing reserves a 96 px left gutter for paragraph add/delete controls; desktop controls appear on hover/focus. The slash listbox exposes headings, quote, code, image URL, and divider. Pointer Add inserts only a paragraph; other block types require discovering the slash shortcut. The editor page defines the active Block component locally; the separate components/Block.jsx is not its current renderer.

Guests compose locally and Publish opens the shared sign-in modal. Authenticated editing hydrates drafts/posts through TanStack Query, autosaves after 1.5 seconds, and reports version conflicts. Existing validation, word counts, cover previews, image descriptions, keyboard block actions, and source-question linkage are present.

## Existing backend and data flow

Draft API `/api/drafts` supports authenticated list/create and owner-scoped read/update/delete; version checks prevent stale writes. Draft stores structured body, title, format, string tags, release date, and relationship fields. Publishing uses authenticated multipart POST `/api/post/`; editing uses PUT `/api/post/:id` with revision checks. Post stores string tags plus canonical Topic references; creation matches tag slugs/aliases to active topics, uploads article covers, and records immutable revisions. Arbitrary new tags already work without creating taxonomy records.

Topic owns active/retired canonical choices. Onboarding reads them through an authenticated endpoint that also returns private account selections. Before this change, audited routes had no dedicated public editor tag-choice API. The completed bounded public read endpoint supplies active topic slugs and existing tags from publicly released posts, excluding drafts, unpublished posts, and future releases. Creating a custom tag continues through existing draft/post writes and does not create a canonical Topic.

## Approved before/after impact

| Before | Completed |
|---|---|
| Cover and tags hidden in collapsed Story details | Cover and tags immediately visible in a compact section before title/body; optional depth/release settings retain a separate disclosure |
| Format in a detached panel | Group format selection with the compact writing header and preserve responsive wrapping |
| Desktop insertion relies on hover or slash discovery | Visible Add content control opens the existing block-choice menu; retain per-block add/delete and slash shortcuts |
| 96 px writing gutter at every size | Compact phone gutter, shared title/body alignment, existing desktop gutter |
| Type a tag and click Add | Searchable dropdown with existing choices, selected removable chips, and explicit Add new tag action; case-normalized duplicate protection |
| General prerequisite sentence | Visible readiness feedback near Publish naming remaining requirements, without adding a publication step |

The implementation reuses Button, PageFrame, ViewportPopover, and SlashMenu. The searchable multi-tag picker remains editor-local because shared Select is a single-choice control. Failed choice loading exposes retry and keeps custom-tag entry available. Existing tags remain supported, including saved draft/post tags absent from suggestions.

## Changed files

Implementation:
- `Frontend/src/features/editor/pages/index.jsx`
- New `Frontend/src/features/editor/components/TagPicker.tsx`
- New `Frontend/src/features/editor/api/fetchTagOptions.ts`
- `Frontend/src/features/editor/components/SlashMenu.jsx` (44 px choice targets)
- New `Backend/controllers/tag-options.controller.js`
- `Backend/routes/v1.routes.js` (add public GET `/tags`)

Verification:
- `Frontend/tests/editor-layout.spec.js`
- `Frontend/tests/critical-flow.spec.js` (visible-tag workflow selectors)
- New `Frontend/tests/editor-tags.spec.js`
- `Backend/tests/foundation-contracts.test.js`
- `Backend/tests/integration.test.js`

Documentation: this audit, `context/ui-rules.md`, `context/ui-registry.md`, `context/architecture.md`, `context/progress-tracker.md`, and `Frontend/README.md`. Existing `editor-overlay.spec.js` is reused without modification.

Preserved fonts, palette, shared frame, global navigation, other pages, stored schemas, existing routes/contracts, autosave/versioning, revision history, guest sign-in behavior, upload handling, scheduling entitlements, and formatting shortcuts. Unrelated working-tree changes are preserved. No architecture migration, file rename, dependency, schema replacement, optional redesign, or broad refactor is included. No approval decisions remain.

## Completed behavior

Cover/tags are visible with desktop side-by-side fields and phone stacking. Format joins the header; Publish stays on its right and wraps appropriately on phones. Readiness feedback names remaining requirements. The title/body gutter shrinks to 48 px on phones while retaining desktop alignment; block controls remain visible. Add content opens existing block choices and focuses the inserted block, reusing a trailing empty paragraph when available.

TagPicker supports existing choices and explicit new tags, removable chips, case-normalized deduplication, comma rejection, a 60-character custom-entry bound, and the existing draft/update 20-tag limit. A saved tag need not appear in suggestions to remain selected/removable. The dropdown debounces reads, supports keyboard/pointer choices and reopening, and isolates late responses by query. Failed reads expose keyboard-reachable retry without blocking custom tags. Guest composition remains local until explicit sign-in; public suggestions make no private draft or entitlement reads.

The public endpoint returns at most 50 choices from active topics and released-post tags, using literal escaped search text of at most 60 characters, deduplication, and metadata-only projection. Unpublished/future posts and private drafts are excluded. Adding custom tags uses existing publishing/autosave string fields and creates no taxonomy record.

## Verification

On 2026-10-12, all 102 backend contracts, frontend/backend lint, production build, artifact validation (79 files without source maps), and scoped whitespace checks passed. All 19 distinct mocked-API Chrome checks completed across the full 18-case editor run and the final three-case tag run. Phone Light and desktop Dark screenshots were visually reviewed. Initial localhost connection failures preceded the completed runs; the added twenty-tag fixture initially lacked the existing navbar notification metadata and passed after that fixture was corrected. No production recovery behavior was changed for that fixture failure. The focused suites cover phone/desktop Light/Dark, 320–2560 px layout, keyboard dropdown/block insertion, custom-tag creation/removal/duplicates, lookup failure/retry, autosave payloads/conflicts, guest state retention through sign-in, publication failure retention, cover requirements, scheduling, and existing slash-menu navigation/scroll stability. Live database/provider persistence, physical devices, assistive technology, other engines, and tag aggregation performance at production scale remain outside mocked browser/contract checks. The critical-flow selectors and Mongo integration visibility case are updated but require their controlled live database environment.
