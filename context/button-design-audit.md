# App-wide button design and reuse audit

Initial audit and authorized correction: 2026-10-12.

## Completed correction

The user's follow-up authorized contrast fixes, consistent target sizing, named shared sizes/styles, and a duplicate-style list. Button now consumes typed buttonStyles, forwards refs, and preserves its original pending/native-attribute behavior. ButtonLink provides router/external navigation with explicit theme text; IconButton reuses Button and requires an accessible label. Pill and ActionMenuItem consume shared appearance/sizing. Current named APIs and values are owned by [UI registry](ui-registry.md#button) and [UI tokens](ui-tokens.md#button-targets).

Article active tool glyphs, membership CTA and audio playback now use inverted theme colors/currentColor. The navbar notification badge has the same correction. Standard shared controls now keep their minimum targets at every width, with a larger opt-in size. Native sizing edits cover 45 declarations across 23 files; link-target edits cover 18 declarations across 10 files. Additional targeted changes cover shared primitives, recovery links, notification width/height, and toast Close width/height. Dedicated feature typography/shapes remain intact; navbar Join and the expanded-hit-area Clear search exception are preserved. Inactive legacy cards/toolbars were excluded. No backend, API, schema, navigation order, callback, persistence, card layout or dependency changes belong to this correction.

Ordinary recovery links and article membership/playback now reuse the added primitives. Remaining duplicate appearances are intentionally listed rather than wholesale migrated. [Button style duplicates](button-style-duplicates.md) names each grouped control, its location, closest reusable component, and whether the match is exact, near or absent. This supersedes the earlier missing-size/link/icon-contract findings below. The initial source counts and findings remain historical evidence, not the current implementation contract.

Verification on 2026-10-12: 84 distinct mocked-API Chrome checks passed across the broad run and completed focused reruns (eight new button-design checks plus existing pending/appreciation/responsive/menu checks). The final eight-case shared-button suite passed again. Coverage includes 320/1280 px Light/Dark sizes, semantic router/external links and appearance parity, required icon labels/geometry, forwarded refs, disclosure shape, one request during pending, stable dimensions, disabled/busy recovery, native responsive targets, and article/navbar theme foregrounds. Phone and desktop Dark screenshots were visually reviewed. The final AST pass parsed all 128 current JSX/TSX files and found no unclassified active native button target after known shared/inline/expanded-hit-area cases and inactive legacy exclusions.

Initial broad-run failures included a transient short-reader style failure (passed isolated rerun) and stale test assumptions: bookmark response envelope, short-card button vs link, auth main tag vs semantic role, and an omitted existing event-recording fixture. Those fixtures/selectors were corrected; responsive size assertions were strengthened to 44 px. Initial lint briefly caught incomplete concurrent onNavigateAway wiring, subsequently resolved by that separate work without a task-specific behavior change. Final frontend lint, production build, artifact validation (72 files without source maps), and scoped whitespace checks passed. TS/TSX are compiled/browser-checked under the existing lint exclusion; no dedicated strict type-check run is claimed. Live providers/persistence, physical devices, assistive technology and other engines remain unverified. Evidence is ignored under Frontend/node_modules/.cache/button-design-fix/.

No approval-dependent decision remains for the requested corrections. Further consolidation of distinct local styles is separate work. Exact task file scope appears after the historical inventory below; unrelated working-tree changes were preserved.

## Initial audit result and scope

Buttons do not all share a reusable implementation. Most standard actions reuse Button, and several dedicated controls correctly reuse their own shared component. Remaining feature-local implementations duplicate CTA, recovery, selector, tab, and icon-control styling. Native buttons are not automatically violations: the UI registry explicitly permits semantic native elements with token styling, and several different button layouts are intentional.

AST inventory parsed all 123 JSX/TSX files under Frontend/src: 252 button/component declarations (111 native button declarations, 124 Button usages, 12 Pill usages, 3 AppreciationButton usages, 2 BackButton usages). Counts include shared implementations and inactive legacy components, and count mapped declarations once rather than every rendered instance. A separate heuristic found 61 potentially button-like/styled links (57 Link, 4 a); it also includes rounded identity/card/tag links, so it is not a count of 61 CTA buttons. Source searching also checked role-based controls and generated elements. Google's injected authentication button is provider-owned and excluded from application-style compliance.

Existing typography is DM Sans for controls and Libre Baskerville for editorial headings. AppLayout/PageFrame, fixed navbar/sidebar/mobile navigation, semantic Light/Dark tokens, card structure, focus treatment, authenticated mutations, and URL-owned filters remain the source of truth. The existing Express route/controller/service and Mongoose data architecture does not need to change for button styling. This audit inspects frontend presentation and backend boundaries, not backend correctness or every action's end-to-end behavior.

## Agreed families

| Family | Existing owner | Audit result |
|---|---|---|
| Filled/outlined/quiet actions and menu rows | Button: primary, secondary, ghost, action, menu | Widely reused, but local clones remain; no size API or shared link rendering |
| Category/filter capsules | Pill | Correct 44 px shared implementation; Home/Search/onboarding implement their own selectors |
| Transparent engagement icons/counts | AppreciationButton, PostEngagementControls, Button action, global data-button-style rule | Shared implementation across active post surfaces; CSS intentionally overrides older class strings |
| Back arrow and label | BackButton | Shared route/step implementation |
| Dropdown trigger/options | Select; filter trigger/reset/close in FilterPopover | Dedicated shared layouts; should retain their distinct appearance |
| Modal Close | ModalHeader | Shared 44 px control; separate from filled CTA buttons |
| Underline tabs | Local Home/Search/Library/Writing implementations and Explore links | Intentional underline family; duplicated implementation, not grounds to convert to pills |
| Navigation, autocomplete, editor insertion/type choices | Existing layout/feature-owned controls | Distinct semantics; not blanket candidates for primary Button |

## Initial findings (before correction)

### 1. Confirmed Dark-mode contrast defect in article tools

`Frontend/src/features/post/pages/AIPanel.jsx`: SummaryIcon and AudioIcon use literal white when active (lines 6 and 13), AccessPanel's Become a member uses text-white (line 45), and ReadAloudPanel's play/pause SVGs use fill="white" (lines 137–138). Dark action background is #EEECE8, so white labels/icons lose contrast. The real components rendered at 320/1280 px in both themes confirmed white foreground against rgb(238, 236, 232). Screenshot review confirms the barely visible active tool/audio glyphs and membership label. Proposed correction: consume the existing inverted text token/currentColor and reuse Button for the ordinary membership CTA. Preserve the tool rail/audio layout and callbacks.

### 2. Confirmed size divergence in selectors and actions

The real unmodified Button measured 40 px at 320 px and 37.5 px at 1280 px. Pill measured 44 px at both widths. Onboarding StepInterests measured 37.5 px; the local AccessPanel CTA measured 34 px; audio playback measured 40 px; article tool rail measured 40 px at 1280 px (44 px on phone).

The agreement explicitly gives Pill/Back/engagement/filter/modal controls 44 px targets, but the base Button currently uses min-h-10 and sm:min-h-0. Do not treat every compact desktop button as an unapproved design: the navbar Join has an explicitly approved 36 px minimum, and primary CTA responsive sizes are referenced by existing account rules. The global Button size policy requires a deliberate decision before changing all callers. Many recent components force !min-h-11 locally, showing the absence of a reusable size contract.

Other source-level candidates for target review: ShortReadModal Save/Share (lines 91–92, 40 px), CollectionDetail ordering controls (line 39, 40 px phone/32 px desktop), ShortSeriesDetail ordering controls (line 25, same), Trending featured overflow (line 69, 40/32 px), Navbar Account (line 217, 40/32 px without Clear search's expanded hit-area treatment), and question answer actions (QuestionDetail lines 47–50, min-h-10). These were inspected in source, not measured in their complete route layouts.

### 3. Repeated CTA/recovery styling bypasses Button

Home/index.jsx (Try again, Load more stories), Home/HomeSections.jsx (collection retry), Search/index.jsx (retry), Explore/TrendingTab.jsx (retry, Load more), and post/pages/AIPanel.jsx (membership CTA) implement their own padding, weights and text sizes. Their shape mostly resembles established filled/outlined actions, but typography ranges from 12 px semibold to the shared 13 px medium. SignInPrompt.tsx and the guest MobileProfileSheet Sign In also have standalone CTA styling. Auth Login/Verify use 15 px rounded-lg full-width actions: preserve the documented auth composition and confirm its intentional variant before migration.

Proposed correction: migrate ordinary clones to existing Button variants with current mutation/busy state and route behavior. Do not erase the auth or centered guest-prompt presentation to achieve reuse.

### 4. Category selectors bypass Pill

Home/HomeSections.jsx:64 uses 12 px labels, 16 px horizontal padding and min-h-10/sm:min-h-0. Search/index.jsx:132 uses 11 px labels, 12 px horizontal padding and a removable desktop height minimum. Onboarding/StepInterests.jsx:7 uses 13 px labels/16 px horizontal padding without a minimum height. Shared Pill is 13 px/18 px/44 px. Selection handlers/aria-pressed already exist. These are real reuse gaps with visible proportional differences; onboarding size is browser-confirmed. The owner files and Pill are the complete proposed implementation scope for this finding.

### 5. Tabs and button-styled links copy their presentation

Library Saved/History and Writing Posts/Drafts/Analytics correctly match the approved Explore underline family, but SavedPage.jsx:127 and Profile/index.jsx:184 duplicate nearly identical JSX/classes and keyboard handling. Home/index.jsx:123 and Search/index.jsx:139 also implement underline variants locally; Explore/index.jsx uses route links. A shared presentation/helper can preserve their separate route and tab semantics, but extraction is optional refactoring and requires approval.

Standard button-styled links duplicate Button classes in Profile, editor draft entry points, Home section headers, NotFound/MissingResourceState and question surfaces. Button cannot render links today; never replace these with buttons to achieve a common import. A shared ButtonLink/style contract is a proposed addition. Question Add response/View responses are an explicitly documented compact regular-weight 44 px family, so their local responseButtonClass is intentional, not a reason to impose standard CTA weight.

### 6. Menu and circular controls lack a common primitive

DiscoveryPostCard, CollectionCard and Trending featured menus repeat rounded action-row classes at 12 px with smaller responsive targets. Button menu exists but does not yet define every menu's keyboard/focus/ref semantics. ShareMenu correctly owns its distinct 13 px/44 px shared modal rows; Select owns option behavior. Circular save/share/overflow controls also repeat their styles, with 32/40/44 px targets. IconButton is a registry proposal, not an implemented reusable primitive. Proposed reuse must preserve accessible names, pressed state, focus refs, menu dismissal, pending handling, and confirmed/optimistic mutation behavior.

### 7. Registry contract overstates implemented APIs

ui-registry.md's detailed Button section lists sm/md/lg sizes, while Button.jsx accepts no size prop and has one base geometry. Its component table accurately calls sizes/link guidance candidates. The IconButton section describes an intended contract without an implementation. These are documentation/implementation gaps. Do not pass size props assuming they change styling or mark these primitives Stable without implementation and validation.

### 8. Inactive legacy findings are separate

HoveringMenu has gray-200 local formatting buttons but is only referenced in a commented editor render. ArticleCard/FeaturedCard/HorizontalCard/CompactCard have old local bookmark/profile actions; current source search finds only definitions/barrel exports, with active feeds using DiscoveryPostCard. Their hard-coded white surfaces/small targets are maintenance candidates, not evidence that the active app currently renders those patterns. No removal is proposed in this audit.

## Initial proposed boundary (superseded by the correction above)

The initial audit changed only this document and context/progress-tracker.md. The subsequent authorized correction adds the implementation and verification described above.

The original request authorized an audit; the later request explicitly authorized sizing, contrast and shared-style corrections. Native selectors retain their local appearance with common target sizing, and the new ButtonLink/IconButton contracts are implemented. Broad extraction of underline tabs, changing auth shapes and wholesale menu migration remain outside this correction. No backend change is needed.

## Initial audit verification boundary

On 2026-10-12: AST parsing and source inventory completed for all 123 JSX/TSX files. A temporary Chrome harness mounted the real Button, Pill, StepInterests, AIStickyButtons, AccessPanel and ReadAloudPanel at 320/1280 px in Light/Dark, recording computed colors, dimensions, typography and icons in four combinations. Phone/desktop Dark screenshots were visually reviewed. Harness evidence is ignored under Frontend/node_modules/.cache/button-design-audit/ (inventory.json, measurements.json, render.cjs, four PNGs). The harness does not alter application source or exercise billing/audio mutations.

Initial sandbox localhost failures and harness interceptor/React/query import errors preceded the successful run. This is exhaustive source inventory with representative rendered checks, not visual certification of every route, interaction/state, button instance, keyboard flow, assistive technology, live provider or browser engine. No application build/regression suite was needed for documentation-only changes; scoped whitespace verification follows report generation.

## Source inventory by file

Counts include declarations/definitions and styled-link candidates; they are not rendered instance counts. Paths below are relative to Frontend/src. The detailed local JSON preserves source line, opening attributes, and a content excerpt for each inventoried site.

| File | Native | Button | Pill | Appreciation | Back | Styled links |
|---|---:|---:|---:|---:|---:|---:|
| app/pages/NotFound.jsx | 0 | 0 | 0 | 0 | 0 | 1 |
| features/auth/pages/Login.jsx | 4 | 0 | 0 | 0 | 0 | 2 |
| features/collection/components/CollectionCard.jsx | 5 | 2 | 0 | 0 | 0 | 1 |
| features/collection/pages/CollectionDetail.jsx | 4 | 2 | 0 | 0 | 0 | 1 |
| features/collection/pages/index.jsx | 0 | 5 | 2 | 0 | 0 | 0 |
| features/collection/pages/SavedPage.jsx | 1 | 3 | 2 | 0 | 0 | 0 |
| features/discovery/components/DiscoveryPostCard.jsx | 6 | 0 | 0 | 0 | 0 | 4 |
| features/discovery/components/MobileSearchDialog.tsx | 7 | 0 | 0 | 0 | 0 | 0 |
| features/discovery/components/PostEngagementControls.tsx | 1 | 0 | 0 | 1 | 0 | 0 |
| features/discovery/components/ShortReadModal.jsx | 2 | 2 | 0 | 1 | 0 | 2 |
| features/discovery/pages/Explore/CompetitionDetail.jsx | 1 | 4 | 0 | 0 | 0 | 2 |
| features/discovery/pages/Explore/CompetitionsTab.jsx | 0 | 1 | 2 | 0 | 0 | 1 |
| features/discovery/pages/Explore/index.jsx | 0 | 0 | 0 | 0 | 0 | 1 |
| features/discovery/pages/Explore/QuestionDetail.jsx | 4 | 6 | 0 | 0 | 0 | 2 |
| features/discovery/pages/Explore/QuestionsTab.jsx | 5 | 6 | 0 | 0 | 0 | 4 |
| features/discovery/pages/Explore/TrendingTab.jsx | 6 | 0 | 0 | 0 | 0 | 1 |
| features/discovery/pages/Home/HomeSections.jsx | 2 | 0 | 0 | 0 | 0 | 4 |
| features/discovery/pages/Home/index.jsx | 3 | 0 | 0 | 0 | 0 | 0 |
| features/discovery/pages/Home/TopQuestionsSection.jsx | 0 | 1 | 0 | 0 | 0 | 2 |
| features/discovery/pages/ReadingHistory.jsx | 0 | 1 | 0 | 0 | 0 | 0 |
| features/discovery/pages/Search/index.jsx | 3 | 0 | 0 | 0 | 0 | 2 |
| features/discovery/pages/Search/ShortsTab.jsx | 0 | 5 | 0 | 0 | 0 | 1 |
| features/discovery/pages/ShortSeriesDetail.jsx | 3 | 2 | 0 | 0 | 0 | 0 |
| features/editor/components/HoveringMenu.jsx | 4 | 0 | 0 | 0 | 0 | 0 |
| features/editor/components/MobileBlockMenu.tsx | 1 | 0 | 0 | 0 | 0 | 0 |
| features/editor/components/SlashMenu.jsx | 1 | 0 | 0 | 0 | 0 | 0 |
| features/editor/components/TagPicker.tsx | 2 | 2 | 0 | 0 | 0 | 0 |
| features/editor/components/WriteDrafts.tsx | 2 | 3 | 0 | 0 | 0 | 0 |
| features/editor/pages/index.jsx | 5 | 5 | 0 | 0 | 0 | 0 |
| features/membership/pages/MemberHub.jsx | 0 | 7 | 1 | 0 | 0 | 1 |
| features/membership/pages/MembershipPage.tsx | 1 | 2 | 0 | 0 | 0 | 0 |
| features/notification/pages/NotificationsPage.jsx | 0 | 4 | 0 | 0 | 0 | 0 |
| features/onboarding/pages/index.jsx | 0 | 3 | 0 | 0 | 1 | 0 |
| features/onboarding/pages/StepFollow.jsx | 0 | 1 | 0 | 0 | 0 | 0 |
| features/onboarding/pages/StepInterests.jsx | 1 | 0 | 0 | 0 | 0 | 0 |
| features/post/components/AppreciationButton.tsx | 1 | 0 | 0 | 0 | 0 | 0 |
| features/post/components/ArticleCard.jsx | 1 | 0 | 0 | 0 | 0 | 0 |
| features/post/components/CommentActionDialog.tsx | 0 | 2 | 0 | 0 | 0 | 0 |
| features/post/components/CommentItem.tsx | 0 | 10 | 0 | 0 | 0 | 0 |
| features/post/components/CompactCard.jsx | 2 | 0 | 0 | 0 | 0 | 0 |
| features/post/components/FeaturedCard.jsx | 1 | 0 | 0 | 0 | 0 | 0 |
| features/post/components/HorizontalCard.jsx | 1 | 0 | 0 | 0 | 0 | 0 |
| features/post/pages/AIPanel.jsx | 4 | 0 | 0 | 0 | 0 | 0 |
| features/post/pages/AuthorBio.jsx | 0 | 0 | 0 | 0 | 0 | 1 |
| features/post/pages/CommentsSection.jsx | 0 | 6 | 0 | 0 | 0 | 0 |
| features/post/pages/index.jsx | 3 | 2 | 0 | 1 | 0 | 5 |
| features/question/pages/OpportunitiesPage.jsx | 1 | 2 | 0 | 0 | 0 | 3 |
| features/staff/components/CompetitionOperations.jsx | 0 | 2 | 0 | 0 | 0 | 0 |
| features/staff/pages/StaffConsole.jsx | 0 | 6 | 4 | 0 | 0 | 0 |
| features/user/components/DeletePostDialog.tsx | 0 | 2 | 0 | 0 | 0 | 0 |
| features/user/components/MobileProfileSheet.tsx | 3 | 0 | 0 | 0 | 0 | 3 |
| features/user/pages/Author/index.jsx | 0 | 6 | 0 | 0 | 0 | 3 |
| features/user/pages/Profile/EditProfilePage.tsx | 0 | 3 | 0 | 0 | 0 | 0 |
| features/user/pages/Profile/index.jsx | 1 | 9 | 0 | 0 | 0 | 5 |
| features/user/pages/Settings/index.jsx | 0 | 2 | 0 | 0 | 0 | 0 |
| shared/components/layout/AppLayout.jsx | 0 | 0 | 0 | 0 | 1 | 1 |
| shared/components/layout/BottomBar.jsx | 1 | 0 | 0 | 0 | 0 | 0 |
| shared/components/layout/Navbar.jsx | 5 | 1 | 0 | 0 | 0 | 3 |
| shared/components/layout/ServerUnavailable.jsx | 0 | 1 | 0 | 0 | 0 | 0 |
| shared/components/layout/Sidebar.jsx | 1 | 0 | 0 | 0 | 0 | 1 |
| shared/components/ui/AuthorMeta.jsx | 0 | 0 | 0 | 0 | 0 | 3 |
| shared/components/ui/BackButton.tsx | 1 | 0 | 0 | 0 | 0 | 0 |
| shared/components/ui/Button.jsx | 1 | 0 | 0 | 0 | 0 | 0 |
| shared/components/ui/FilterBar.jsx | 0 | 0 | 1 | 0 | 0 | 0 |
| shared/components/ui/FilterPopover.jsx | 3 | 0 | 0 | 0 | 0 | 0 |
| shared/components/ui/MissingResourceState.jsx | 0 | 0 | 0 | 0 | 0 | 1 |
| shared/components/ui/ModalHeader.tsx | 1 | 0 | 0 | 0 | 0 | 0 |
| shared/components/ui/Pill.jsx | 1 | 0 | 0 | 0 | 0 | 0 |
| shared/components/ui/ReportForm.tsx | 0 | 3 | 0 | 0 | 0 | 0 |
| shared/components/ui/Select.tsx | 2 | 0 | 0 | 0 | 0 | 0 |
| shared/components/ui/ShareMenu.tsx | 1 | 0 | 0 | 0 | 0 | 0 |
| shared/components/ui/SignInPrompt.tsx | 1 | 0 | 0 | 0 | 0 | 0 |
| shared/components/ui/ToastViewport.jsx | 1 | 0 | 0 | 0 | 0 | 0 |

## Correction changed files

- `Frontend/src/app/pages/NotFound.jsx`
- `Frontend/src/features/auth/pages/Login.jsx`
- `Frontend/src/features/collection/pages/CollectionDetail.jsx`
- `Frontend/src/features/collection/pages/SavedPage.jsx`
- `Frontend/src/features/discovery/components/MobileSearchDialog.tsx`
- `Frontend/src/features/discovery/components/ShortReadModal.jsx`
- `Frontend/src/features/discovery/pages/Explore/QuestionDetail.jsx`
- `Frontend/src/features/discovery/pages/Explore/QuestionsTab.jsx`
- `Frontend/src/features/discovery/pages/Explore/TrendingTab.jsx`
- `Frontend/src/features/discovery/pages/Explore/index.jsx`
- `Frontend/src/features/discovery/pages/Home/HomeSections.jsx`
- `Frontend/src/features/discovery/pages/Home/TopQuestionsSection.jsx`
- `Frontend/src/features/discovery/pages/Home/index.jsx`
- `Frontend/src/features/discovery/pages/Search/index.jsx`
- `Frontend/src/features/discovery/pages/ShortSeriesDetail.jsx`
- `Frontend/src/features/membership/pages/MembershipPage.tsx`
- `Frontend/src/features/onboarding/pages/StepInterests.jsx`
- `Frontend/src/features/post/pages/AIPanel.jsx`
- `Frontend/src/features/post/pages/AuthorBio.jsx`
- `Frontend/src/features/post/pages/index.jsx`
- `Frontend/src/features/question/pages/OpportunitiesPage.jsx`
- `Frontend/src/features/user/components/MobileProfileSheet.tsx`
- `Frontend/src/features/user/pages/Profile/index.jsx`
- `Frontend/src/shared/components/layout/BottomBar.jsx`
- `Frontend/src/shared/components/layout/Navbar.jsx`
- `Frontend/src/shared/components/layout/Sidebar.jsx`
- `Frontend/src/shared/components/ui/ActionMenu.tsx`
- `Frontend/src/shared/components/ui/Button.jsx`
- `Frontend/src/shared/components/ui/ButtonLink.tsx`
- `Frontend/src/shared/components/ui/FilterPopover.jsx`
- `Frontend/src/shared/components/ui/IconButton.tsx`
- `Frontend/src/shared/components/ui/MissingResourceState.jsx`
- `Frontend/src/shared/components/ui/Pill.jsx`
- `Frontend/src/shared/components/ui/ToastViewport.jsx`
- `Frontend/src/shared/components/ui/buttonStyles.ts`
- `Frontend/src/styles/global.css`
- `Frontend/tests/button-design.spec.js`
- `Frontend/tests/responsive-controls.spec.js`
- `context/button-design-audit.md`
- `context/button-style-duplicates.md`
- `context/progress-tracker.md`
- `context/ui-registry.md`
- `context/ui-rules.md`
- `context/ui-tokens.md`
