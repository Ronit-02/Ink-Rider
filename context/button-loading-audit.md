# Button loading-state audit

Audited: 2026-10-08. Source scope: all JSX/TSX button declarations under Frontend/src, including shared components and feature-local controls.

## Current icon-only loading audit — 2026-10-10

This supersedes the historical filled-button rule below for every icon-led action. Source inspection covered all JSX/TSX native buttons, shared Button/AppreciationButton callers, mapped menu rows, SVG icon components, and text glyphs in the current working tree. Async controls use existing mutation/promise state; synchronous navigation/disclosure controls have no asynchronous loading state. Text-only actions keep their existing pending treatment. Google continues to own its injected control.

### Findings and completed contract

- The global busy rule filled every button and changed its label color. Icon-led buttons now retain their normal surface/border/text and full opacity; SVGs alone receive muted fill/stroke/color. Non-SVG vote glyphs are explicitly marked with data-button-icon and receive only muted color.
- The special whole-comment-like fade is replaced by the common icon-only rule. Its count stays fully opaque, with the same top alignment and hit target.
- Shared appreciation/comment, article Save/Saved, and question/answer vote actions have transparent resting/selected surfaces and borders. Selected appreciation still fills its heart; pressed state/counts remain visible. Existing hover feedback, geometry, and keyboard focus remain available. Primary pills, dropdown triggers, and dedicated circular icon-only controls retain their ordinary structure.
- Existing Button is extended with action/menu variants and decorative leading/trailing icon slots. Primary/secondary/ghost callers remain compatible. Returned async click promises still disable repeat activation until settlement.
- Question-detail voting now has an explicit Upvote/Remove upvote accessible action name rather than relying on the decorative triangle/count.

### Pending implementation coverage

| Implementation | Icon behavior |
|---|---|
| AppreciationButton, reused by cards/featured/writer/article/short reading | Muted filled heart, unchanged count, borderless action |
| CommentItem, reused by article/comments/short reading | Muted filled heart, fully opaque count, unchanged compact target |
| Article Save/Saved | Muted bookmark, unchanged label, borderless action |
| Collection detail and short-reader Save | Muted bookmark, ordinary circular surface preserved |
| DiscoveryPostCard menu save | Muted bookmark only; existing hover/focus row and label retained |
| ShareMenu clipboard copy | Muted link icon only; existing modal row and label retained |
| MobileProfileSheet sign-out | Muted user icon only; fully opaque label and transparent row |
| Question feed/detail and answer voting | Muted triangle only; borderless action/count |
| Competition entry voting | Muted plus/check glyph only; existing pill/cover contrast retained |
| Reusable Button primary/action/menu with icon slots | Normal surface/label/dimensions retained through returned-promise loading |

Menus stay open during pending actions and failures. Duplicate protection, optimistic updates, rollback, confirmed refresh, sign-in, labels, routes, query/cache behavior, and error feedback are unchanged. Frontend retains PageFrame/AppLayout, DM Sans/Libre Baskerville, semantic Light/Dark tokens, existing cards and navigation. Express routes/controllers/services and Mongoose records retain their existing data flow; no backend, API, schema, dependency, optional redesign, or migration work belongs to this correction.

### Changed files for this correction

Implementation:
- Frontend/src/styles/global.css
- Frontend/src/shared/components/ui/Button.jsx
- Frontend/src/features/post/components/AppreciationButton.tsx
- Frontend/src/features/post/components/CommentItem.tsx
- Frontend/src/features/discovery/components/PostEngagementControls.tsx
- Frontend/src/features/post/pages/index.jsx
- Frontend/src/features/discovery/pages/Explore/QuestionsTab.jsx
- Frontend/src/features/discovery/pages/Explore/QuestionDetail.jsx
- Frontend/src/features/discovery/pages/Explore/CompetitionDetail.jsx

Verification: Frontend/tests/button-loading.spec.js and Frontend/tests/appreciation-style.spec.js. Existing comment-actions, collection-detail, and question-detail suites are reused. Documentation: this audit, context/ui-rules.md, context/ui-registry.md, context/comment-actions-audit.md, and context/progress-tracker.md. Pre-existing and concurrent unrelated working-tree changes are preserved. No approval-dependent decision remains.

### Verification

On 2026-10-10, 66 distinct mocked-API Chrome checks passed across the main run and focused reruns. These include every pending icon implementation listed above, existing comment/collection/question interactions, six appreciation idle/selected cases, text-only loading regressions, and two real reusable-primitive promise checks exercising primary/action/menu in both themes. Phone Light (320 px) and desktop Dark (1280 px), plus both mobile sign-out themes and both reusable-primitive themes, were covered. Assertions verify icon color/fill, full opacity, busy/disabled state, one request after repeated activation, rollback/retry, transparency for quiet actions, and stable primitive labels/colors/bounds.

Pending screenshots were visually reviewed for article appreciation/save, collection save, comments, question/answer votes, competition vote, short save, discovery menu save, copy, mobile sign-out, and reusable variants. Source inventory is app-wide; this is representative rendered implementation coverage, not every button instance or live provider flow. Frontend lint, production build, artifact validation (78 files without source maps), and scoped whitespace checks passed. Local sandbox networking blocked initial browser attempts; the successful runs used an isolated task-owned Vite server and installed Chrome outside the sandbox. Early selector failures were corrected to follow optimistic label changes, and the primitive harness import was corrected before passing. Evidence remains ignored under Frontend/node_modules/.cache/icon-button-audit/. Live persistence/providers, physical devices, assistive technology, and other browser engines were not exercised.

## Historical baseline and requested behavior — 2026-10-08

Earlier 2026-10-10 correction (superseded by the current icon-only contract above): inline comment Like/Unlike overrides the filled busy surface with transparency and 60% opacity. The compact top-aligned heart/count stays inside its existing 44 px target without revealing a tall pill while pending. Busy semantics, wait cursor, duplicate protection, and confirmed-refresh timing remain intact. This scoped exception supersedes the common filled rule only for comment likes; see [comment actions audit](comment-actions-audit.md) for verification.

The source inventory found 212 button declarations. Existing post-detail bookmark/appreciation actions disable and fade while pending; collection detail alone introduced a spinner. Text actions also swap labels and sometimes shrink or expand. Retry, verification, direct-request response, competition-vote, clipboard, and sign-out controls need pending wiring.

The approved common behavior keeps each button’s existing label/icon, applies a muted filled action surface only while busy, and disables repeated activation. Use existing theme colors and aria-busy. Validation/permission-disabled controls, synchronous editing/navigation controls, page skeletons, and background autosave indicators are separate states. No API/schema change or artificial delay is required.

## Inventory by implementation

Counts describe source declarations; mapped collections can render many instances. Shared Button/Appreciation declarations and unused legacy cards are included. Pending counts below are the pre-change baseline.

| File | Buttons | Existing pending guards | Direct retries |
|---|---:|---:|---:|
| Frontend/src/features/auth/pages/Login.jsx | 4 | 1 | 0 |
| Frontend/src/features/collection/components/CollectionCard.jsx | 8 | 1 | 0 |
| Frontend/src/features/collection/pages/CollectionDetail.jsx | 6 | 2 | 1 |
| Frontend/src/features/collection/pages/index.jsx | 6 | 2 | 1 |
| Frontend/src/features/collection/pages/SavedPage.jsx | 3 | 1 | 2 |
| Frontend/src/features/discovery/components/DiscoveryPostCard.jsx | 7 | 1 | 0 |
| Frontend/src/features/discovery/components/MobileSearchDialog.tsx | 7 | 0 | 2 |
| Frontend/src/features/discovery/components/PostEngagementControls.tsx | 2 | 1 | 0 |
| Frontend/src/features/discovery/components/ShortReadModal.jsx | 6 | 2 | 1 |
| Frontend/src/features/discovery/pages/Explore/CompetitionDetail.jsx | 6 | 1 | 1 |
| Frontend/src/features/discovery/pages/Explore/CompetitionsTab.jsx | 1 | 0 | 1 |
| Frontend/src/features/discovery/pages/Explore/QuestionDetail.jsx | 10 | 6 | 1 |
| Frontend/src/features/discovery/pages/Explore/QuestionsTab.jsx | 12 | 3 | 1 |
| Frontend/src/features/discovery/pages/Explore/TrendingTab.jsx | 6 | 1 | 1 |
| Frontend/src/features/discovery/pages/Home/HomeSections.jsx | 2 | 0 | 1 |
| Frontend/src/features/discovery/pages/Home/index.jsx | 3 | 1 | 1 |
| Frontend/src/features/discovery/pages/Home/TopQuestionsSection.jsx | 1 | 0 | 1 |
| Frontend/src/features/discovery/pages/ReadingHistory.jsx | 1 | 0 | 1 |
| Frontend/src/features/discovery/pages/Search/index.jsx | 3 | 0 | 0 |
| Frontend/src/features/discovery/pages/Search/ShortsTab.jsx | 6 | 2 | 1 |
| Frontend/src/features/discovery/pages/ShortSeriesDetail.jsx | 5 | 1 | 1 |
| Frontend/src/features/editor/components/HoveringMenu.jsx | 4 | 0 | 0 |
| Frontend/src/features/editor/components/SlashMenu.jsx | 1 | 0 | 0 |
| Frontend/src/features/editor/pages/index.jsx | 8 | 1 | 0 |
| Frontend/src/features/membership/pages/MemberHub.jsx | 7 | 4 | 0 |
| Frontend/src/features/membership/pages/MembershipPage.tsx | 2 | 1 | 1 |
| Frontend/src/features/notification/pages/NotificationsPage.jsx | 2 | 1 | 1 |
| Frontend/src/features/onboarding/pages/index.jsx | 3 | 2 | 1 |
| Frontend/src/features/onboarding/pages/StepFollow.jsx | 1 | 0 | 0 |
| Frontend/src/features/onboarding/pages/StepInterests.jsx | 1 | 0 | 0 |
| Frontend/src/features/post/components/AppreciationButton.tsx | 1 | 0 | 0 |
| Frontend/src/features/post/components/ArticleCard.jsx | 1 | 0 | 0 |
| Frontend/src/features/post/components/CommentsModal.tsx | 1 | 0 | 0 |
| Frontend/src/features/post/components/CompactCard.jsx | 2 | 0 | 0 |
| Frontend/src/features/post/components/FeaturedCard.jsx | 1 | 0 | 0 |
| Frontend/src/features/post/components/HorizontalCard.jsx | 1 | 0 | 0 |
| Frontend/src/features/post/pages/AIPanel.jsx | 4 | 1 | 0 |
| Frontend/src/features/post/pages/CommentsSection.jsx | 5 | 3 | 1 |
| Frontend/src/features/post/pages/index.jsx | 10 | 4 | 0 |
| Frontend/src/features/question/pages/OpportunitiesPage.jsx | 3 | 2 | 1 |
| Frontend/src/features/staff/components/CompetitionOperations.jsx | 2 | 2 | 0 |
| Frontend/src/features/staff/pages/StaffConsole.jsx | 6 | 5 | 1 |
| Frontend/src/features/user/components/MobileProfileSheet.tsx | 3 | 0 | 0 |
| Frontend/src/features/user/pages/Author/index.jsx | 5 | 3 | 1 |
| Frontend/src/features/user/pages/Profile/index.jsx | 13 | 5 | 3 |
| Frontend/src/features/user/pages/Settings/index.jsx | 2 | 2 | 0 |
| Frontend/src/shared/components/layout/BottomBar.jsx | 1 | 0 | 0 |
| Frontend/src/shared/components/layout/Navbar.jsx | 7 | 0 | 0 |
| Frontend/src/shared/components/layout/ServerUnavailable.jsx | 1 | 0 | 0 |
| Frontend/src/shared/components/layout/Sidebar.jsx | 1 | 0 | 0 |
| Frontend/src/shared/components/ui/BackButton.tsx | 1 | 0 | 0 |
| Frontend/src/shared/components/ui/Button.jsx | 1 | 0 | 0 |
| Frontend/src/shared/components/ui/FilterPopover.jsx | 3 | 0 | 0 |
| Frontend/src/shared/components/ui/Pill.jsx | 1 | 0 | 0 |
| Frontend/src/shared/components/ui/ShareMenu.tsx | 1 | 0 | 0 |
| Frontend/src/shared/components/ui/ToastViewport.jsx | 1 | 0 | 0 |

## Change boundary

Preserve layouts, typography, idle colors, dimensions, button variants, routes, authentication gates, DTOs, persistence, and existing error feedback. Add pending attributes/guards to existing controls and one shared CSS pending rule. Shared Button forwards busy state; AppreciationButton and raw buttons consume the same rule. The collection-save hook continues waiting for its confirmed refresh.

## Completed source audit

The final scan has 214 declarations (111 native buttons, 100 shared Button usages, and 3 AppreciationButton usages). The count grew during concurrent share/report modal work. 105 declarations explicitly expose aria-busy. AppreciationButton forwards mutation pending state centrally; three reusable retry wrappers use Button's returned-promise guard. No direct mutate/refetch/fetchNextPage button callback is missing pending wiring. Named callbacks were also traced: form submissions, clipboard copying, logout, collection/menu save, vote, follow, and response actions use their owning mutation or local promise state.

All remaining controls perform local selection/editing, navigation, disclosure/dismissal, modal opening, browser speech playback, or full-page reload. Search/category/tab selections retain immediate selection and their existing result loading UI. Legacy ArticleCard/FeaturedCard/HorizontalCard bookmarks only toggle local state and have no pending request. Background editor autosave and page skeletons retain their existing independent status.

Retry views use a small presentation helper, retainRetryView, to stay mounted while a previously failed no-data query refetches. The helper preserves query/cache data and request behavior, leaves initial loading skeletons intact, and keeps the muted Retry control visible until success or failure.

Card action menus stay visible while save/appreciation is pending, close after success, and remain usable after failure. Desktop and mobile sign-out controls stay visible during the request; successful logout follows existing navigation. Collection Save retains the bookmark icon, preserves confirmed state on failure, and awaits the existing collection refresh. Other existing optimistic updates remain intact.

Google Identity owns its injected iframe/button styling. The app marks the wrapper busy/inert and guards repeated credential exchanges; it does not replace or restyle Google's internal button. Live Google, billing, email delivery, and database writes were not exercised. Share on X opens a browser window synchronously and has no asynchronous completion promise.

Detailed per-button inventory is generated locally under Frontend/node_modules/.cache/button-inventory.json. This is a source-wide audit with representative delayed browser coverage, not a claim that every rendered button instance was runtime-tested.

## Files changed for loading behavior

Shared: Frontend/src/shared/utils/retainRetryView.js; Frontend/src/styles/global.css; Frontend/src/shared/components/ui/Button.jsx; Frontend/src/shared/components/ui/ShareMenu.tsx; Frontend/src/shared/components/layout/Navbar.jsx; Frontend/src/features/post/components/AppreciationButton.tsx.

Authentication: Frontend/src/features/auth/hooks/useAuth.jsx; Frontend/src/features/auth/pages/Login.jsx.

Collections: Frontend/src/features/collection/components/CollectionCard.jsx; Frontend/src/features/collection/pages/CollectionDetail.jsx; Frontend/src/features/collection/pages/index.jsx; Frontend/src/features/collection/pages/SavedPage.jsx.

Discovery components: Frontend/src/features/discovery/components/DiscoveryPostCard.jsx; Frontend/src/features/discovery/components/MobileSearchDialog.tsx; Frontend/src/features/discovery/components/ShortReadModal.jsx.

Discovery pages: Frontend/src/features/discovery/pages/Explore/CompetitionDetail.jsx; Frontend/src/features/discovery/pages/Explore/CompetitionsTab.jsx; Frontend/src/features/discovery/pages/Explore/QuestionDetail.jsx; Frontend/src/features/discovery/pages/Explore/QuestionsTab.jsx; Frontend/src/features/discovery/pages/Explore/TrendingTab.jsx; Frontend/src/features/discovery/pages/Home/HomeSections.jsx; Frontend/src/features/discovery/pages/Home/index.jsx; Frontend/src/features/discovery/pages/Home/TopQuestionsSection.jsx; Frontend/src/features/discovery/pages/ReadingHistory.jsx; Frontend/src/features/discovery/pages/Search/index.jsx; Frontend/src/features/discovery/pages/Search/ShortsTab.jsx; Frontend/src/features/discovery/pages/ShortSeriesDetail.jsx.

Publishing/member/staff: Frontend/src/features/editor/pages/index.jsx; Frontend/src/features/membership/pages/MemberHub.jsx; Frontend/src/features/membership/pages/MembershipPage.tsx; Frontend/src/features/notification/pages/NotificationsPage.jsx; Frontend/src/features/onboarding/pages/index.jsx; Frontend/src/features/post/pages/AIPanel.jsx; Frontend/src/features/post/pages/CommentsSection.jsx; Frontend/src/features/post/pages/index.jsx; Frontend/src/features/question/pages/OpportunitiesPage.jsx; Frontend/src/features/staff/components/CompetitionOperations.jsx; Frontend/src/features/staff/pages/StaffConsole.jsx.

People: Frontend/src/features/user/components/MobileProfileSheet.tsx; Frontend/src/features/user/pages/Author/index.jsx; Frontend/src/features/user/pages/Profile/index.jsx; Frontend/src/features/user/pages/Settings/index.jsx.

Tests/documentation: Frontend/tests/button-loading.spec.js; Frontend/tests/collection-detail.spec.js; Frontend/tests/appreciation-style.spec.js; Frontend/tests/responsive-controls.spec.js; context/button-loading-audit.md; context/ui-rules.md; context/ui-registry.md; context/progress-tracker.md. The appreciation test now checks the current inverted theme token instead of a stale hardcoded dark value. The mobile-navigation test now reflects the existing four links and Account dialog button instead of an obsolete five-link layout. Other simultaneous working-tree changes are outside this loading audit.

No backend, route, API contract, schema, dependency, or idle design change is required by this task. No approval-dependent decision remains.


## Verification — 2026-10-08

103 distinct mocked-API Chrome checks passed across the broad run and targeted reruns: 100 passed in the 102-case regression run; the stale mobile-navigation assertion was corrected and passed, and collection-share focus passed on isolated rerun after an abnormal elapsed-time report. One additional native-search retry check passed. This includes all 18 delayed-action cases in button-loading.spec.js plus collection save's separate held mutation/refetch success/failure/retry check.

Delayed coverage includes Light/320 px and Dark/1280 px post bookmark, writer follow, competition vote, membership checkout, and notification mark-all; login label/dimensions; OTP verify/resend exclusion; clipboard failure/retry; post Retry success; native search Retry failure/retry; collection-menu save; staff validation versus pending; and desktop sign-out. Assertions check the shared theme-derived fill, unchanged loading labels/icons, disabled/busy state, one request after repeat activation, and recovery. Broader regression checks cover appreciation, curator/navigation, collections, writer/profile recovery, report forms, responsive controls, shared sharing, and staff.

Frontend lint, production build, security:artifacts (76 files, no source maps), and git diff --check passed. TSX remains compiled/browser-tested under the repository's existing lint exclusion. Backend code is unchanged by this task. No live provider, email, billing, database, physical-device, or non-Chrome-engine verification is claimed.
