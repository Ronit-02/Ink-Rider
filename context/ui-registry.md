# Ink-Rider UI registry

Last reviewed: 2026-10-10

## Purpose

The UI registry is the source of truth for reusable components and patterns. It prevents duplicate card, button, modal, author, and loading implementations from drifting across features.

This file records component responsibility and maturity. It does not replace component examples or tests.

The [dropdown audit](dropdown-audit.md) records the completed Settings-reference migration of every single-choice dropdown and the separate action-menu/autocomplete inventory. Shared viewport placement alone does not establish common styling for those other semantics.

The [modal audit](modal-audit.md) inventories the current 14 modal families, the approved shared header, related overlays, and dated behavioral evidence. It also retains historical findings; the header update fixes the listed close-target sizes but does not claim to resolve unrelated draft-loss, contrast, or eligible-list recovery findings. Comment presentation has its own current audit. Candidate dialog status does not imply full acceptance.

## Component layers

### Primitives

Low-level, product-agnostic controls with accessibility behavior built in.

Examples: Button, IconButton, TextField, TextArea, Select, Checkbox, Avatar, Badge, Divider, Skeleton, VisuallyHidden.

`DisabledButtonTooltip` is mounted once at the application root. It gives disabled shared and native buttons hover feedback using `data-disabled-reason`, busy/form/boundary context, or a general unmet-requirements explanation. It does not change their enabled state or visual style.

### Patterns

Reusable product compositions with domain-light contracts.

Examples: WriterIdentity, ArticleCard, QuestionCard, EmptyState, ErrorState, FilterBar, MetricCard, ConfirmDialog.

### Feature components

Components with domain behavior or feature-specific data requirements.

Examples: CompetitionEntryForm, QuestionComposer, DraftPublishPanel, RecommendationReason.

### Layouts

Route-level structure and navigation shells.

Examples: AppShell, ReadingLayout, EditorLayout, SettingsLayout.

A feature component may use patterns and primitives. A primitive must never import a feature.

## Registry status

- **Stable:** reusable contract, documented states, tests, and accessibility review.
- **Candidate:** used or potentially useful, but requires contract/state cleanup.
- **Feature-only:** intentionally not shared.
- **Deprecated:** no new use; migration target identified.
- **Missing:** required by the build plan but not created.

## Current inventory

| Component/pattern | Current location | Status | Required action |
|---|---|---:|---|
| `AddToCollectionDialog` | `Frontend/src/features/collection/components/`, public export from feature `index.ts` | Feature-only | Shared Save dialog for story previews and article/short reading. Library is selected by default; collection may be selected alone or with Library. Owner choices use shared Select with collection names/visibility badges, viewer-partitioned cursor cache, loading/empty/retry, and create-with-story form. Pending guards, retained failures, native focus/viewport behavior, and reader preservation reuse existing primitives and collection/bookmark hooks. The legacy `AddToCollectionButton` export is currently unmounted. |
| `ActionMenu` / `ActionMenuTrigger` / `ActionMenuItem` | `Frontend/src/shared/components/ui/ActionMenu.tsx` | Candidate | Shared post-reference presentation for collection and discovery list/grid/short card menus: 44 px SVG trigger, viewport-bounded 256 px icon-led menu, semantic danger rows, enabled-item keyboard navigation, dismissal/focus return, and caller-owned actions/pending state. Reuses ViewportPopover; no feature data fetching. |
| `ModalHeader` | `Frontend/src/shared/components/ui/ModalHeader.tsx` | Candidate | Shared Comments-reference header for all 14 modal families and desktop Inbox: serif 20 px title, optional 12 px subtitle, divider, responsive gutters, borderless 44 px Close with caller-owned label/ref/action. Existing shells, focus, motion, and data contracts remain with callers. |
| `Button` | `Frontend/src/shared/components/ui/Button.jsx` | Candidate | Primary/secondary pills plus borderless action, full-width menu, and flat full-width disclosure variants, with leading/trailing icon slots. Disclosure supplies a borderless 44 px target, wrapping label, and an aria-expanded-driven chevron with reduced-motion support; callers own visibility/state. Icon-led pending states mute/fill only the icon; text-only actions retain their existing fill. aria-busy and explicit mutations/returned promises prevent repeats. Labels, geometry, and focus stay stable. Source inventory: [button loading audit](button-loading-audit.md). Named sm/md (44 px) and lg (48 px) sizes, forwarded refs, and shared buttonStyles are implemented; ButtonLink and IconButton consume the same styles. Candidate maturity and broader typed Button props remain. |
| `buttonStyles` / `ButtonLink` / `IconButton` | `Frontend/src/shared/components/ui/buttonStyles.ts`, `ButtonLink.tsx`, `IconButton.tsx` | Candidate | Typed named appearance/sizing API, semantic router/external CTA links, and labelled icon-only actions sharing Button styles; sm/md 44 px and lg 48 px. ButtonLink retains native navigation, IconButton reuses Button pending/disabled/ref behavior. Duplicate mapping: [button styles](button-style-duplicates.md). |
| `retainRetryView` | `Frontend/src/shared/utils/retainRetryView.js` | Utility | Keeps an existing query recovery view mounted during no-data refetch so its Retry button can show the shared pending fill. Preserves first-load skeletons, query data/cache, and request behavior. |
| `ViewportPopover` | `Frontend/src/shared/components/ui/ViewportPopover.tsx` | Candidate | Typed portal placement shared by card/featured/collection/share/account menus, search suggestions, filters, and editor insert choices; respects navigation and visual viewport, follows scrolling, flips and bounds height, observes content size, and supports pinned mobile filters. Portals inside the nearest native/ARIA dialog when its trigger is there, keeping nested dropdown choices inside modal/filter dismissal boundaries; otherwise uses the existing body layer. Callers own semantics, focus, and actions. |
| `ReportForm` | `Frontend/src/shared/components/ui/ReportForm.tsx` | Candidate | Shared post-detail form for post and short reporting from detail/card entry points; reason, optional details, Cancel, pending/error/retry, and received confirmation. Reuses existing mutation hooks and API payloads. |
| `ReportModal` | `Frontend/src/shared/components/ui/ReportModal.tsx` | Candidate | Shared typed modal shell with Report this subject naming around post/card/question/answer forms; reuses ModalLayer and useDialogFocus for top-layer blocking, viewport bounds, scrolling, Close/Escape, and opener focus restoration. Backdrop does not dismiss. Inventory: [report audit](report-audit.md). |
| `ModalLayer` | `Frontend/src/shared/components/ui/ModalLayer.tsx` | Candidate | Typed native modal portal for existing form/confirmation/short-read panels; viewport bounds, background blocking, configurable backdrop dismissal, and opener-focus restoration. Feature content and existing focus hooks are preserved. |
| `NotificationsPage` | `Frontend/src/features/notification/pages/NotificationsPage.jsx` | Feature-only | Route-backed desktop inbox anchored beneath the navbar button using ViewportPopover; mobile retains ModalLayer/useDialogFocus, preserved background route/scroll, desktop navbar and signed-in mobile navbar entry beside search, confirmed read and per-row delete actions/unread badge refresh, loading/error/empty states, and cursor Load more. Direct `/notifications` opens over Home. Inventory: [notifications audit](notifications-audit.md). Existing filename retained. |
| `WritingPage` / `MemberProfile` | `Frontend/src/features/user/pages/WritingPage.tsx`, `pages/Profile/index.jsx` | Feature-only | Writing studio composes the existing management panels with URL-backed Published/Drafts/Analytics tabs with Stories/Shorts categories in Published and Drafts (legacy posts/shorts URLs remain readable) and shared Pill post-status filtering (All/Published/Scheduled/Unpublished, aria-pressed, wrapping, native keyboard activation); Shorts use WritingStudioShortCard in the shared responsive short grid with WritingPostMenu replacing discovery actions. Story rows retain detail links, like/comment counts, and WritingPostMenu. Owner menus provide Edit, Unpublish/Republish, and Delete. Existing API/query/mutation contracts are reused. |
| `AuthorPage` filters | `Frontend/src/features/user/pages/Author/index.jsx` | Feature-only | Published work reuses sorting-only FilterBar/FilterPopover/Select beside Posts/Shorts/Collections PublishedWritingTabs. Writing uses Newest/Oldest/Most appreciated; public author collections reuse CollectionCard, cursor Load more/retry, and separate Newest/Most saved sorting. Reset preserves category/query/hash and other-category sort. |
| `PublishedWritingTabs` | `Frontend/src/features/user/components/PublishedWritingTabs.tsx` | Feature-only | Personal/public profile Posts/Shorts and opt-in Author Collections categories using shared Pill, aria-selected/tabpanels, roving focus and arrow/Home/End selection. Posts defaults; category persists through URL/reload, with separate empty messages. |
| `DiscoveryPostCard` on writer profiles | `Frontend/src/features/discovery/components/DiscoveryPostCard.jsx` | Shared | Author and personal Profile use its grid variant for public articles; shorts dispatch to ShortCard. Member early access articles use the same grid with a Member early access badge. Viewer-aware public writer API excludes unpublished and scheduled writing. |
| `SavedPage` / `ReadingHistoryPage` | `Frontend/src/features/collection/pages/SavedPage.jsx`, `discovery/pages/ReadingHistory.jsx` | Feature-only | Library combines Saved, Collections, and History top tabs in that order. Saved has Stories/Shorts Pill categories, format-specific bookmarks, and legacy savedFormat links. Collections uses My/Saved Pill tabs to show one set at a time with visibility/sort Filters and cursor Load more. URL/reset state preserves other tabs; legacy savedSection=collections opens the Collections tab. History reuses Pill for URL-backed Stories/Shorts, filtering continuation and recent records while retaining reading-status/sort controls and standalone /history. |
| `EditProfilePage` | `Frontend/src/features/user/pages/Profile/EditProfilePage.tsx` | Feature-only | Guarded `/profile/edit` page reusing existing fields/API, shared PageFrame/Back, retained failed-save drafts, pending protection, and Save/Cancel return to Profile with its query. |
| `DeletePostDialog` | `Frontend/src/features/user/components/DeletePostDialog.tsx` | Feature-only | Writing studio Posts owner confirmation reusing Button, ModalHeader, ModalLayer, and dialog focus; explicit destructive confirmation, pending dismissal/repeat protection, inline failure/retry, and confirmed cache refresh. Behavior/evidence: [post deletion audit](post-deletion-audit.md). |
| `LoginModal` / `LoginPromptProvider` | `Frontend/src/features/auth/components/LoginModal.tsx`, `hooks/useLoginPrompt.tsx` | Feature-only | Reuses Login and ModalLayer for explicitly activated route prompts, gated actions, and session-expiry sign-in gates; preserves the full return URL and existing auth APIs. Dismissal and success close the modal in place. Contract: ui-rules.md, Sign-in access guards. |
| `useOverlayViewport` | `Frontend/src/shared/hooks/useOverlayViewport.ts` | Candidate | Visual-viewport size/offset styles shared by ModalLayer and existing Comments, mobile Search, and Account native dialogs; reacts to resize and visual viewport scroll. |
| `BackButton` | `Frontend/src/shared/components/ui/BackButton.tsx` | Candidate | Shared typed borderless arrow/label control with 44 px targets, subtle hover, one keyboard focus ring, history/parent fallback, and optional previous-step callback; AppLayout aligns detail/drill-down and writer-opportunity Back rows to the shared page frame with clear content separation; the opaque row stays sticky beneath the navbar inside the application scroll container. Authentication omits Back; onboarding retains its previous-step position. Contract: ui-rules.md; inventory/findings: [Back-button audit](back-button-audit.md). |
| `Avatar` | `Frontend/src/shared/components/ui/Avatar.jsx` | Candidate | Add fallback initials, sizes, loading behavior, and decorative/name semantics |
| `Pill` | `Frontend/src/shared/components/ui/Pill.jsx` | Candidate | Shared capsule selector with centered dynamic labels, active/inactive theme states, and 44px targets at every breakpoint; used by tabs and FilterBar topic/type choices. Preserves pressed/tab semantics; split static metadata into a separate contract before promotion |
| `Tag` | `Frontend/src/shared/components/ui/Tag.jsx` | Candidate | Clarify link, filter, and static variants |
| `Divider` | `Frontend/src/shared/components/ui/Divider.jsx` | Candidate | Ensure semantic/decorative behavior |
| `ImageBox` | `Frontend/src/shared/components/ui/ImageBox.jsx` | Candidate | Supports an optional aspect ratio alongside explicit height and the labelled placeholder fallback for missing or failed images; active post cards use the ratio for fluid covers. Promote after state and accessibility coverage mature |
| `SectionHeading` | `Frontend/src/shared/components/ui/SectionHeading.jsx` | Candidate | Support heading level and optional action without fixed styling assumptions |
| `AuthorMeta` | `Frontend/src/shared/components/ui/AuthorMeta.jsx` | Candidate | Compact card metadata plus an opt-in article variant with a 40 px avatar, emphasized writer name, and aligned plain-text date/read-time outside the avatar/name profile links. Future durable-link/normalized-DTO work remains separate. |
| `ArticleCard` | `Frontend/src/features/post/components/ArticleCard.jsx` | Candidate | Define one content contract and semantic stretched link |
| `FeaturedCard` | `Frontend/src/features/post/components/FeaturedCard.jsx` | Candidate | Confirm distinct editorial need; avoid duplicate card logic |
| `CompactCard` | `Frontend/src/features/post/components/CompactCard.jsx` | Candidate | Normalize interaction and metadata with ArticleCard |
| `HorizontalCard` | `Frontend/src/features/post/components/HorizontalCard.jsx` | Candidate | Normalize responsive media, writer link, actions, and state |
| `FeaturedPostCard` | `Frontend/src/features/discovery/components/FeaturedPostCard.tsx` | Feature-only | Shared Article of the Day and recent article winner cover/content composition; 16:9 cover on narrow screens and text-row-filling cover on desktop. Configurable label and separate reader-vote line for winners. Uses AuthorMeta, PostEngagementControls and PostCardMenu; Trending retains feed selection. |
| `QuestionResponseCard` | `Frontend/src/features/discovery/components/QuestionResponseCard.jsx` | Feature-only | Question detail article response with author/date/read time, serif title, optional excerpt, and Read response link; shorts retain ShortCard. |
| `QuestionResponseModal` | `Frontend/src/features/question/components/QuestionResponseModal.jsx` | Feature-only | Shared question feed/detail Add response choice: attach an eligible published owner post through the existing response-link endpoint, or write a new post through the existing question editor URL. Modal uses shared focus and header controls and retains loading, empty, retry, and mutation failure states. |
| `CompetitionEntryCard` | `Frontend/src/features/discovery/components/CompetitionEntryCard.jsx` | Feature-only | Competition detail article/short entry with a fluid 16:9 article cover, centered compact short presentation, winner/rank, unavailable article state, comment count, and entry reader-vote action separate from story appreciation. |
| `ReadingHistoryCard` | `Frontend/src/features/discovery/components/ReadingHistoryCard.tsx` | Feature-only | Extracted article-history row with shared stacked metadata (8 px gap), serif headline, sibling writer/story targets and existing progress/status. Reused by Continue reading/recent History in Library and standalone History. |
| `ShortCard` | `Frontend/src/features/discovery/components/ShortCard.jsx` | Candidate | Independent short presentation and compact-reader opener, reusing shared PostCardMenu and PostEngagementControls. The default owns 100% width, 250 px maximum width, and fixed 380 px height; Dedicated short-card grids opt into fluid 170 px minimum tracks across Home, Shorts, Search, Author, Profile, Writing studio, Collections, Saved, and History; they switch to two compact columns from 376 to 391 px and one centered card capped at 250 px below 376 px. Its portrait card has a 285 px minimum height normally or 270 px in the two-column phone band, with a visible one- or two-line excerpt and increased side padding through medium widths. Both retain the optional 16:9 cover, writer/menu row, and bottom-aligned footer. Default cards keep the full-width date/reading-time row, three-line title, and four-line excerpt; fluid grid cards omit the preview date, cap the title at two lines, and keep a one- or two-line excerpt. All short-card previews omit tags; the detailed short reader shows every tag. Standalone cards retain their default size; dedicated grids preserve caller gaps and fill available width. |
| `DiscoveryPostCard` | `Frontend/src/features/discovery/components/DiscoveryPostCard.jsx` | Candidate | Format dispatcher to the independent ShortCard; owns shared article list/grid cards with 16:9 fluid grid and narrow-list covers, wrapping phone metadata/topics, direct icon-count appreciation and a comments modal, existing engagement hooks, and the shared icon-led overflow menu. |
| `PostCardMenu` | `Frontend/src/features/discovery/components/PostCardMenu.jsx` | Candidate | Shared story overflow actions for discovery article/short cards and FeaturedPostCard. Save opens the Library/collection dialog; Share, Report, recommendation explanation, and hide remain menu commands where available. |
| `CommentsModal` | `Frontend/src/features/post/components/CommentsModal.tsx` | Feature-only | Native modal using the shared CommentsSection, paginated thread/composer, bounded internal scrolling, background blocking, keyboard focus containment, and Close/Escape/backdrop focus restoration |
| `CommentItem` | `Frontend/src/features/post/components/CommentItem.tsx` | Feature-only | Existing comment row extended with authenticated like/unlike/reply, owner edit/delete, modal edit/delete confirmation, inline replies with bottom clearance, failed-draft retention, pending protection, placeholders only for surviving reply branches, initially collapsed paginated replies, and a four-rendered-line Read more/Show less toggle. Reused by CommentsSection on articles, comment dialogs, and short readers. Inventory/evidence: [comment actions audit](comment-actions-audit.md). |
| `CommentActionDialog` | `Frontend/src/features/post/components/CommentActionDialog.tsx` | Feature-only | Owner edit/delete native modal reusing ModalLayer/ModalHeader/Button/dialog focus; pending dismissal/repeat protection, failed-text retention/retry, and deleted-row focus fallback. |
| `ShareMenu` | `Frontend/src/shared/components/ui/ShareMenu.tsx` | Candidate | Shared typed centered native share modal for all six entry points; content-specific title, Close, Copy Link / Share on X, canonical links, clipboard pending/recovery, focus containment/restoration, and Close/Escape/backdrop dismissal through ModalLayer. The existing filename is preserved. Inventory: [share audit](share-audit.md). |
| `AppreciationButton` | `Frontend/src/features/post/components/AppreciationButton.tsx` | Candidate | Shared presentational borderless transparent heart/count action for discovery cards, featured stories, articles, and short-read modals; the short reader opts into visible Like text beside the count. Selected filled-heart/action-text colors, 44 px target, icon-only muted pending state, and accessible pressed/label semantics remain. Callers retain existing authentication and mutations. |
| `PostEngagementControls` | `Frontend/src/features/discovery/components/PostEngagementControls.tsx` | Candidate | Shared appreciation/comment icon-count controls, with appreciation rendered by `AppreciationButton` for discovery cards, writer-profile article cards, and Explore Article of the Day; uses existing authentication, post-like cache updates/rollback (including writer articles), and CommentsModal with unique dialog IDs, 12 px counts, and 44 px targets |
| `MobileSearchDialog` | `Frontend/src/features/discovery/components/MobileSearchDialog.tsx` | Feature-only | Mobile full-screen native search dialog with animated opening/closing, existing empty-query topic/Popular-feed rows, and debounced live Search suggestions/Authors groups capped independently at five. Phrases run searches; authors open profiles. Inline arrow submission, keyboard selection/internal scrolling, recovery, and reduced motion are preserved. |
| `MobileProfileSheet` | `Frontend/src/features/user/components/MobileProfileSheet.tsx` | Feature-only | Mobile native Account bottom sheet with ordered signed-in Profile/Library/Writing studio links, Settings, Help, social links, focus containment/restoration, scrolling, and desktop-resize dismissal; no separate Write row. |
| `FormatChooser` | `Frontend/src/features/editor/components/FormatChooser.tsx` | Feature-only | Shared Post/Short modal opened by Writing studio’s Write a post button. Creates a typed draft with pending protection and retry, then opens `/studio?draft=<id>`. |
| `DeleteDraftButton` | `Frontend/src/features/editor/components/DeleteDraftButton.tsx` | Feature-only | Shared Write/Writing studio draft action and permanent-deletion confirmation, using Button, ModalHeader, ModalLayer, dialog focus, existing owner-scoped delete API and draft caches. Cancel/Close/Escape, pending guards, retained failures/retry, and focus fallback after row removal. |
| `MobileBlockMenu` | `Frontend/src/features/editor/components/MobileBlockMenu.tsx` | Feature-only | Native viewport-bounded editor bottom sheet for phone/tablet insertion choices from the active block's left-side + control (with × removal on the right), reusing ModalLayer/ModalHeader/dialog focus and safe-area padding. The editor owns active-block actions and mutations. |
| `TagPicker` | `Frontend/src/features/editor/components/TagPicker.tsx` | Feature-only | Searchable multi-tag combobox with public choices, custom creation, selected-count/group treatment and 44 px chip removal targets, duplicate/20-tag protection, keyboard selection/dismissal, viewport placement, debounced queries, and inline retry that preserves custom entry. Reuses Button/ViewportPopover; shared Select remains single-choice. |
| `Select` | `Frontend/src/shared/components/ui/Select.tsx` | Candidate | Controlled typed single-choice dropdown used by Theme and Language in Settings and existing feature filter/form choices. Optional option badges render compact pill tags beside labels in both the menu and selected value. Reuses ViewportPopover for matching-width, zero-gap bounded placement, preferring below with internal scrolling; 120 ms edge reveal and chevron rotation respect reduced motion. 44 px trigger/options, selected checkmark, active option, arrows/Home/End/typeahead, Enter/Space, Escape/Tab/outside dismissal, and trigger focus. Uses existing theme tokens, generated/explicit IDs, caller layout bounds, dynamic-option bounds, and required native form validation with trigger focus/error feedback. Captured Escape closes the dropdown before its parent dialog. Values, URLs, gates, and payloads stay with callers. |
| `ProfileSettings` | `Frontend/src/features/user/components/ProfileSettings.tsx` | Feature-only | Shared Select controls for Light, Dark, Use system theme, and the openable English-only language list; guests and members use the existing shared theme hook |
| `SignInPrompt` | `Frontend/src/shared/components/ui/SignInPrompt.tsx` | Candidate | Shared centered guest prompt with customizable message and one Sign In button opening LoginModal on explicit activation; reused by PrivateRoute, Profile, and private saved-story targets on Write. Routes wait for session restoration and keep private content unmounted until authenticated. |
| `FilterPopover` | `Frontend/src/shared/components/ui/FilterPopover.jsx` | Candidate | Shared filter panel capped at 360 px or 90vw with 16 px padding, a divided header, readable labels, bordered reset control, fixed viewport placement, pinned mobile position across result/filter changes, bounded internal scrolling, portal-aware outside dismissal, and keyboard focus containment; FilterBar separates choices from sort and uses 44 px targets |
| `Navbar` | `Frontend/src/shared/components/layout/Navbar.jsx` | Candidate | Global search has no type-selection buttons; desktop autocomplete debounces by 250 ms and shows independent Search suggestions/Authors groups capped at five, with full phrase labels, keyboard selection/internal scrolling, exact-input submission, and stale-response isolation. Account keyboard/focus behavior is preserved; separate contracts from the top-bar layout before promotion. |
| `Sidebar` | `Frontend/src/shared/components/layout/Sidebar.jsx` | Candidate | Write is public; Member Hub is shown only for restored signed-in accounts. Explore arrow inherits its label color via `currentColor`; retain existing route/hover styling and keyboard resizing/expanded behavior |
| `BottomBar` | `Frontend/src/shared/components/layout/BottomBar.jsx` | Candidate | Home, Explore, Shorts, Collections, and Account on every mobile application route for guests and members; Write lives in the Account sheet for guests and members. Explore and Account retain normal color when inactive. Retain safe-area/content-offset coverage |
| `Loader` variants | `Frontend/src/shared/components/layout/Loader.jsx` | Deprecated target | Replace oversized page loader with shared skeleton and progress patterns |
| `PageFrame` | `Frontend/src/shared/components/layout/PageFrame.jsx` | Candidate | Owns the shared application outer frame via app-page-frame (1120 px cap; 16/20/32 px gutters), reused by all content routes and shell Back rows. Article loading uses the same frame; standalone auth/onboarding and centered access/recovery surfaces retain their compositions. Regression inventory: [page alignment audit](page-alignment-audit.md). |
| `AppLayout` | `Frontend/src/shared/components/layout/AppLayout.jsx` | Candidate | Rename to AppShell and handle focus/skip link/scroll restoration |
| Question card | local to Questions page | Missing shared pattern | Extract after real question DTO and mutations exist |
| Competition card | local to Competitions page | Missing shared pattern | Extract after competition contract is stable |
| `CollectionCard` | `Frontend/src/features/collection/components/CollectionCard.jsx` | Candidate | Shared server-backed card in Collections, Saved, and Home with inset rounded cover, serif heading, divided wrapping metadata footer, ImageBox fallback, viewport-positioned action menu, and native delete confirmation. Preserve save/share/delete/hidden behavior, keyboard focus return, and the 44 px menu target; add typed props before promotion. Composition rules live in ui-rules.md. |
| Empty state | scattered text | Missing | Create composed reusable pattern |
| Error state | `Frontend/src/shared/components/layout/ServerUnavailable.jsx`, `Frontend/src/shared/components/ui/MissingResourceState.jsx`, plus feature-local states | Candidate | The shared server-unavailable variant replaces the application shell with a centered, chrome-free recovery page only when the API cannot be reached or a gateway reports it unavailable. The missing-resource variant gives dynamic content routes a specific unavailable message and parent-discovery link for invalid or missing route identifiers; other feature-level failures remain retryable and inline. |
| Skeleton | absent | Missing | Create text, card, list, and article primitives |
| Dialog | `ModalLayer` plus existing feature-native dialogs and `useDialogFocus` | Candidate | Shared viewport and top-layer behavior is available; keep feature-specific content, focus, and motion contracts while validating new modal uses. |
| Drawer | absent | Missing | Needed for mobile filters and article tools |
| Toast/status region | `Frontend/src/shared/hooks/useToast.jsx`, `Frontend/src/shared/components/ui/ToastViewport.jsx` | Candidate | Shared in-house action feedback with success, info, error, dismissal, reduced motion, and responsive placement |
| Form field | repeated inputs | Missing | Create label/help/error/input composition |
| Tabs | ad hoc pills | Missing | Create semantic tabs and route-tab guidance |
| Menu/popover | `ViewportPopover` plus existing caller keyboard/outside-dismiss handlers | Candidate | Shared viewport placement is available; keep semantic and action-specific keyboard behavior with callers and use portal-aware outside dismissal. |
| Save/reaction controls | feature-local | Feature-only initially | Promote only after API behavior stabilizes |
| Editor block | editor feature | Feature-only | Keep inside editor; share only primitive controls |

CollectionCard navigation uses the existing semantic title link stretched across the full card surface; its options trigger and actions remain independent above the link. Collections, Saved, and Home share this behavior without a layout change.

## Required primitive contracts


### Button

Current variants: `primary`, `secondary`, `ghost`, `action`, `menu`, `disclosure`, `danger`, `selector`. Primary/secondary retain existing pill styling; action is borderless icon/text; menu is a full-width icon/text row.

Sizes: `sm` (44 px minimum, 12 px label, 12 px horizontal padding), `md` (default; 44 px minimum, 13 px label, 18 px horizontal padding), `lg` (48 px minimum, 15 px label, 24 px horizontal padding). Small does not shrink the hit target. `buttonStyles.ts` owns shared appearance; Button owns promise/busy behavior, ButtonLink preserves router/anchor navigation, and IconButton requires label/icon props and matching minimum width.

Contract requirements:

- Native button attributes
- `aria-busy`, pending repeat protection, and stable label/icon content
- Leading/trailing icon slots
- No arbitrary colors through props
- Disabled and `aria-disabled` distinction documented
- Button renders a native button; implemented ButtonLink renders a router Link for to or anchor for href, sharing named styles and sizes

### IconButton

- Requires accessible label
- Sizes correspond to target dimensions
- Tooltip is supplementary, never the accessible name
- Supports pressed state when it is a toggle

### FormField

- Stable input ID and visible label
- Optional description
- Error message and invalid state
- Required/optional indication
- Character count slot when relevant
- Does not own business validation

### Dialog

- Accessible title and optional description
- Initial focus and restored trigger focus
- Focus containment
- Escape and explicit close behavior
- Prevents background interaction
- Does not close on backdrop when doing so risks losing work unless explicitly configured

### Skeleton

- Mirrors the approximate target layout
- Hidden from assistive technology when redundant with a loading status
- No continuous high-contrast shimmer under reduced motion

## Reuse decision tree

Before creating a component:

1. Is this a semantic HTML element with token styling? Use the native element.
2. Does a Stable registry component meet the contract? Reuse it.
3. Can a Candidate be safely extended without feature-specific props? Improve it.
4. Is the pattern repeated in at least two real contexts with the same behavior? Propose a shared pattern.
5. Does it contain domain logic or rapidly changing product behavior? Keep it feature-local.

Do not abstract based only on visual similarity. Two cards that look alike but have different interaction and information priorities may remain separate compositions over shared primitives.

## Component API rules

- Props describe meaning, not CSS implementation.
- Prefer `tone="danger"` over `red` and `size="sm"` over raw dimensions.
- Avoid more than two boolean presentation props; use a variant union when states are exclusive.
- Do not accept unrestricted `style` to bypass the design system on Stable components.
- Accept `className` only where compositional layout requires it; internal visual tokens remain owned by the component.
- Expose event callbacks with domain-relevant arguments.
- Controlled and uncontrolled behavior must be deliberate and documented.
- Reusable components do not fetch product data.
- All public props and emitted states are typed.

## State coverage

Every promoted component is reviewed for:

- Default
- Hover
- Focus-visible
- Pressed/selected
- Disabled
- Loading
- Empty content
- Long content and localization expansion
- Error/invalid when applicable
- Light and dark themes
- Narrow width and 200% zoom
- Reduced motion
- Keyboard and screen-reader behavior

## Promotion process

A component becomes Stable when:

1. It has at least two validated use cases or is a foundational accessibility primitive.
2. Its responsibility and non-goals are documented.
3. Props are typed and do not expose incidental styling.
4. Visual examples cover states and themes.
5. Interaction tests cover keyboard and accessible names.
6. It uses only registered tokens.
7. Existing duplicate implementations have a migration plan.
8. This registry is updated.

## Deprecation process

- Mark the component Deprecated in this registry.
- Identify the replacement and affected call sites.
- Prevent new imports through linting when practical.
- Migrate in bounded changes.
- Remove the old component after all consumers and tests move.

## Planned registry sequence

1. Button, ButtonLink, IconButton
2. FormField and input primitives
3. Skeleton, EmptyState, ErrorState
4. Dialog, Drawer, Menu, Popover
5. WriterIdentity and normalized ArticleCard family
6. Tabs and FilterBar
7. QuestionCard, CompetitionCard, CollectionCard after server contracts stabilize
8. MetricCard and accessible chart wrappers during analytics work


## Story format dispatch

DiscoveryPostCard chooses the independent ShortCard presentation for `format: short`; ShortCard supplies its compact reader when no page-level opener is given. Both cards reuse PostCardMenu. ShortReadModal owns series progression, deeper links, and focus restoration across successive shorts. PostPage dispatches canonical `/post/:id` reads by format. CollectionDetail owns Full articles/Short reads grouping, format-local ordering, and the owner-only direct Add to collection chooser. See [short format audit](short-format-audit.md).

The 2026-10-12 [post components audit](post-components-audit.md) records actual consumers across every route. ArticleCard, FeaturedCard, CompactCard and HorizontalCard have no application consumers; active discovery short cards use ShortCard, article list/grid cards use DiscoveryPostCard, and several article layouts remain page-local. The authorized correction repairs owner/question-response author contracts, viewer-aware appreciation/save propagation, History link semantics, affected serif headlines and body theme tokens. PostCardMenu is the shared story/featured-menu command owner, consuming ActionMenu and instance-specific IDs. Remaining local article metadata/layout consolidation and legacy-card removal are optional; the audit records the completed fixes and verification limits.
