# Modal and overlay audit

Audited: 2026-10-07. Scope: the current working tree, including its native-dialog and viewport-placement changes. This is an audit, not a claim that every modal is fixed. Application code was not changed by this task.

## Inventory and verification boundary

The original 2026-10-07 audit covered nine user-facing modal types. Reporting became a tenth type on 2026-10-08; its separate inventory and verification are owned by the [report-button audit](report-audit.md). `ModalLayer` is a wrapper, not a tenth product dialog. The first six feature forms/reading surfaces below use that wrapper; Account, mobile search, and comments have their own native-dialog implementations. All nine enter the browser's modal top layer.

| Modal | Owning implementation | Entry point | Observed issues |
|---|---|---|---|
| Ask the community | `Frontend/src/features/discovery/pages/Explore/QuestionsTab.jsx` | Questions → Ask a question | Draft loss; light secondary-text contrast; eligible writer/similar-question lookup lacks explicit failure feedback in source |
| Create a collection | `Frontend/src/features/collection/pages/index.jsx` | Collections → Create collection | Draft loss; small Close target; light secondary-text contrast; eligible-list failure feedback |
| Create a short series | `Frontend/src/features/discovery/pages/Search/ShortsTab.jsx` | Shorts → Create a series | Draft loss; small Close target; light secondary-text contrast; eligible-list failure feedback |
| Submit an article | `Frontend/src/features/discovery/pages/Explore/CompetitionDetail.jsx` | Open competition → Add your entry | Draft loss; light secondary-text contrast; eligible-list failure feedback |
| Delete collection? | `Frontend/src/features/collection/components/CollectionCard.jsx` | Owned collection options → Delete collection | Small Cancel delete target; light close-icon contrast |
| Short read | `Frontend/src/features/discovery/components/ShortReadModal.jsx` | Short card / series entry / related short | Comment draft loss; secondary-text contrast; shared comment metadata wrapping |
| Account | `Frontend/src/features/user/components/MobileProfileSheet.tsx` | Mobile Account | Core audited behavior passes; see physical-device limitations |
| Search Ink Rider | `Frontend/src/features/discovery/components/MobileSearchDialog.tsx` | Mobile navbar search | Core audited behavior passes; full-screen search intentionally has no outside backdrop target |
| Comments | `Frontend/src/features/post/components/CommentsModal.tsx` | Post comment-count control | Comment draft loss; secondary-text contrast; long comment-author wrapping |

The shared modal implementations were exercised in saved Light/Dark mode at 320×360 and 1280×720. Account and mobile search were exercised at the mobile size only because they intentionally dismiss at the desktop breakpoint. Every type was also exercised with live system Light→Dark→Light changes while open, without a saved override. Guest checks cover Account, mobile search, comments, and short reading; creation/entry actions retain member gating.

Checks cover accessible dialog names, native modality, viewport bounds, horizontal overflow with ordinary content, forward/reverse keyboard focus containment, blocked programmatic background focus, Close/Escape and applicable backdrop dismissal, opener focus restoration, reachable close controls, internal scroll movement, and unchanged application scroll position during internal scrolling. Mutation failures keep entered work and the dialog open. Short-detail and comment-list failures have visible retry controls. Eligible-list failures were inspected after the original request and three automatic retries failed.

Computed text contrast and target dimensions are observational audit results. Passing the audit test means its core assertions completed; it does **not** mean recorded contrast, target, or draft-preservation defects passed acceptance. The contrast scan covers rendered leaf text with opaque ancestor backgrounds; it is not a complete accessibility certification.

## Confirmed findings

### 1. Unsaved work disappears on dismissal

Priority: P2. In Ask, Create collection, Create series, Submit article, Comments, and Short read, entering text, pressing Escape, and reopening produces an empty field. Form state is owned by the unmounted component. Source inspection also shows unguarded backdrop dismissal in these implementations (`ModalLayer` defaults to `dismissOnBackdrop=true`; Comments handles backdrop clicks directly).

This conflicts with the registry requirement to avoid backdrop dismissal when it risks losing work. Failed submissions themselves preserve work; the loss occurs on dismissal. A bounded follow-up should preserve drafts across reopening or guard dismissal only when dirty. Existing clean-state Escape/Close behavior should remain available.

Files relevant to a fix: the four form owners in the inventory, `ShortReadModal.jsx`, `CommentsModal.tsx`, shared `CommentsSection.jsx`, and potentially `ModalLayer.tsx` for a narrowly configured dismissal contract. Changing shared dismissal policy needs a concrete before/after review under `AGENTS.md`; the audit did not apply such a change.

### 2. Several secondary text colors miss the 4.5:1 small-text target

Priority: P2. Light muted text (`#8A837C`) measured 3.74:1 on the white modal surface and 3.34:1 on the subtle comment-composer surface. Affected examples include comment dates/counters, short-reading guidance/read time, form character counts, optional-field guidance, competition selection help, and the delete close glyph. The dark comment counter measured 4.37:1 on `#232324`, also below 4.5:1. Primary text and the audited Account/search content did not produce these failures.

A follow-up can reuse the existing secondary-text token in the affected essential labels rather than alter the global palette. Files relevant to a fix: `CommentsSection.jsx`, `ShortReadModal.jsx`, the four form owners, and `CollectionCard.jsx`. Broader token changes would affect unrelated pages and require separate review.

### 3. Collection, series, and delete close controls are too small

Priority: P2. Create collection and Create series Close buttons measured approximately 9.34×28.5 CSS px. Delete's Cancel delete control measured approximately 28.86×22 px. These fall below the repository's 40 px minimum for icon-only controls and 44 px preferred target. Ask, Submit article, and Short read use 40×40 close controls; Comments, Account, and mobile search use 44×44.

Desktop form Cancel buttons and delete actions measured 37.5 px tall, another repository target gap. A bounded follow-up should enlarge hit areas using existing control styles while preserving panel composition. Files relevant to a fix: collection `pages/index.jsx`, Search `ShortsTab.jsx`, `CollectionCard.jsx`; audit shared `Button.jsx` consumers before considering a global size change.

### 4. Failed eligible-story reads provide no recovery control

Priority: P2. Create collection, Create series, and Submit article show zero error alerts and zero Retry/Try again buttons when their eligible-list request fails with an ordinary 500, even after query retries. The result looks like an empty picker. Source inspection also shows no loading status for these lists. A failed eligibility read is not evidence that there are no eligible stories.

Files relevant to a fix: collection `pages/index.jsx`, Search `ShortsTab.jsx`, Explore `CompetitionDetail.jsx`. Reuse the existing query state and Button/error conventions; backend contracts and schemas need no change.

### 5. Long comment-author names overflow compact rows

Priority: P2. The shared compact comment header places the author and date in one flex row without a wrapping/minimum-width rule on the name. A valid 30-character username caused all 20 fixture comment rows to overflow at 320 px; the browser measurement and screenshot confirmed clipped names/dates. This also affects the comments embedded in short reading.

File relevant to a fix: `Frontend/src/features/post/pages/CommentsSection.jsx`. Preserve the avatar/name/date design, but allow the name/date to wrap within the available column.

## Related overlays and excluded surfaces

| Surface | Classification | Existing coverage used in this audit |
|---|---|---|
| Filters | Non-modal `role=dialog` popover; page remains interactive | Shared filter reset, focus return, outside dismissal, pinned position, short-height scrolling |
| Discovery story and Article of the Day options | Menus, including inline recommendation sections; discovery Report now opens a separate modal | Keyboard actions/focus return, portal placement, resize/scroll bounds |
| Collection options | Menu leading to the separate delete modal | Arrow-key navigation, focus return, card-clipping avoidance |
| Desktop Account | Menu | Keyboard navigation, Escape/Tab handling, opener focus |
| Desktop search suggestions | Combobox/listbox | Keyboard suggestion selection and existing navbar behavior |
| Article share | Menu | Initial item focus, keyboard navigation, Escape/focus restoration |
| Editor insert choices | Listbox, not a modal | Keyboard insertion and bottom-edge viewport positioning |

Summary/audio tools, collection editing, member studio forms, and authentication/verification are inline/page surfaces. Article, discovery-card, question, and answer reporting now use the separate report modal (2026-10-08). Toasts are live feedback, and Loader components are route/loading surfaces. None should be represented as audited product modals. Search in the current source found no application `window.alert`, `window.confirm`, or `window.prompt` dialogs.

## Architecture and change scope

The frontend retains React/Vite, Router routes, Redux session restoration, TanStack Query reads/mutations, feature-local form state, DM Sans/Libre Baskerville, semantic CSS colors, existing rounded panels, and existing motion/focus hooks. `ModalLayer`, `useOverlayViewport`, and `ViewportPopover` own the current top-layer/viewport behavior.

The API remains Express with authenticated/optional-auth routes, controllers/services, and Mongoose schemas for posts/comments, questions, collections, short series, competitions, identity, and sessions. These overlays call existing eligible-list, creation, engagement, search, and session hooks. No API, model, migration, or persistence change is required for the confirmed UI findings. Mocked HTTP responses isolate UI verification; no live data was mutated.

Audit-owned changes: new `Frontend/tests/modal-audit.spec.js`, this report, the registry's audit pointer, and progress records. Existing implementation, routes, typography, colors, layouts, navigation, and unrelated working-tree changes are preserved. Optional shared-component migration/redesign was not performed.

## Verification and remaining limits

On 2026-10-07, 58 distinct new mocked-API audit checks and 71 existing related browser checks completed successfully in Chromium/Chrome (129 distinct checks, zero unexpected failures). The final 32-case theme/layout matrix and valid-username check were rerun for screenshots and confirmation. Phone/desktop Light/Dark screenshots were visually reviewed. These totals describe completed behavioral assertions and observations, not resolution of the five findings.

Frontend `npm run lint`, `npm run build`, `npm run security:artifacts` (74 files, no source maps), focused lint/syntax checks for the new spec, and whitespace validation passed. The spec is `Frontend/tests/modal-audit.spec.js`; the existing suites cover article reading, collection menus, discovery cards, editor overlays, filter reset, Account sheets, mobile search, navbar search, overlay placement, and question submission. Use the existing `npm run test:e2e -- tests/modal-audit.spec.js` command with the repository's normal browser/server prerequisites. Local launch/runtime details and ignored evidence locations are recorded in the progress companion.

Remaining verification: physical phone keyboard/safe-area behavior, real 200% browser zoom, Firefox/WebKit, screen-reader announcements, and live authenticated persistence/provider flows. The short phone viewport exercises tight layout and scrolling, but does not substitute for those checks. Automatic contrast scanning and screenshots also do not prove all dynamic loading/pending/localization combinations.
