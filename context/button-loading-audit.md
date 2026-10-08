# Button loading-state audit

Audited: 2026-10-08. Source scope: all JSX/TSX button declarations under Frontend/src, including shared components and feature-local controls.

## Baseline and requested behavior

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

Tests/documentation: Frontend/tests/button-loading.spec.js; Frontend/tests/collection-detail.spec.js; Frontend/tests/appreciation-style.spec.js; context/button-loading-audit.md; context/ui-rules.md; context/ui-registry.md; context/progress-tracker.md. The appreciation test now checks the current inverted theme token instead of a stale hardcoded dark value. Other simultaneous working-tree changes are outside this loading audit.

No backend, route, API contract, schema, dependency, or idle design change is required by this task. No approval-dependent decision remains.
