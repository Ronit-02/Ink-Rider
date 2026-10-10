# Ink-Rider UI registry

Last reviewed: 2026-10-10

## Purpose

The UI registry is the source of truth for reusable components and patterns. It prevents duplicate card, button, modal, author, and loading implementations from drifting across features.

This file records component responsibility and maturity. It does not replace component examples or tests.

The [modal audit](modal-audit.md) inventories the current 14 modal families, the approved shared header, related overlays, and dated behavioral evidence. It also retains historical findings; the header update fixes the listed close-target sizes but does not claim to resolve unrelated draft-loss, contrast, or eligible-list recovery findings. Comment presentation has its own current audit. Candidate dialog status does not imply full acceptance.

## Component layers

### Primitives

Low-level, product-agnostic controls with accessibility behavior built in.

Examples: Button, IconButton, TextField, TextArea, Select, Checkbox, Avatar, Badge, Divider, Skeleton, VisuallyHidden.

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
| `ModalHeader` | `Frontend/src/shared/components/ui/ModalHeader.tsx` | Candidate | Shared Comments-reference header for all 14 modal families and desktop Inbox: serif 20 px title, optional 12 px subtitle, divider, responsive gutters, borderless 44 px Close with caller-owned label/ref/action. Existing shells, focus, motion, and data contracts remain with callers. |
| `Button` | `Frontend/src/shared/components/ui/Button.jsx` | Candidate | Primary/secondary pills plus borderless action and full-width menu variants, with leading/trailing icon slots. Icon-led pending states mute/fill only the icon; text-only actions retain their existing fill. aria-busy and explicit mutations/returned promises prevent repeats. Labels, geometry, and focus stay stable. Source inventory: [button loading audit](button-loading-audit.md). Typed props, sizes, and link guidance remain candidates. |
| `retainRetryView` | `Frontend/src/shared/utils/retainRetryView.js` | Utility | Keeps an existing query recovery view mounted during no-data refetch so its Retry button can show the shared pending fill. Preserves first-load skeletons, query data/cache, and request behavior. |
| `ViewportPopover` | `Frontend/src/shared/components/ui/ViewportPopover.tsx` | Candidate | Typed portal placement shared by card/featured/collection/share/account menus, search suggestions, filters, and editor insert choices; respects navigation and visual viewport, follows scrolling, flips and bounds height, observes content size, and supports pinned mobile filters. Portals inside an open native dialog when its trigger is there; otherwise uses the existing body layer. Callers own semantics, focus, and actions. |
| `ReportForm` | `Frontend/src/shared/components/ui/ReportForm.tsx` | Candidate | Shared post-detail form for post and short reporting from detail/card entry points; reason, optional details, Cancel, pending/error/retry, and received confirmation. Reuses existing mutation hooks and API payloads. |
| `ReportModal` | `Frontend/src/shared/components/ui/ReportModal.tsx` | Candidate | Shared typed modal shell with Report this subject naming around post/card/question/answer forms; reuses ModalLayer and useDialogFocus for top-layer blocking, viewport bounds, scrolling, Close/Escape, and opener focus restoration. Backdrop does not dismiss. Inventory: [report audit](report-audit.md). |
| `ModalLayer` | `Frontend/src/shared/components/ui/ModalLayer.tsx` | Candidate | Typed native modal portal for existing form/confirmation/short-read panels; viewport bounds, background blocking, configurable backdrop dismissal, and opener-focus restoration. Feature content and existing focus hooks are preserved. |
| `NotificationsPage` | `Frontend/src/features/notification/pages/NotificationsPage.jsx` | Feature-only | Route-backed desktop inbox anchored beneath the navbar button using ViewportPopover; mobile retains ModalLayer/useDialogFocus, preserved background route/scroll, desktop navbar and signed-in mobile Account entry, confirmed read actions/unread badge refresh, loading/error/empty states, and cursor Load more. Direct `/notifications` opens over Home. Inventory: [notifications audit](notifications-audit.md). Existing filename retained. |
| `EditProfilePage` | `Frontend/src/features/user/pages/Profile/EditProfilePage.tsx` | Feature-only | Guarded `/profile/edit` page reusing existing fields/API, shared PageFrame/Back, retained failed-save drafts, pending protection, and Save/Cancel return to Profile with its query-selected tab. |
| `LoginModal` / `LoginPromptProvider` | `Frontend/src/features/auth/components/LoginModal.tsx`, `hooks/useLoginPrompt.tsx` | Feature-only | Reuses Login and ModalLayer for explicitly activated route prompts, gated actions, and session-expiry sign-in gates; preserves the full return URL and existing auth APIs. Dismissal and success close the modal in place. Contract: ui-rules.md, Sign-in access guards. |
| `useOverlayViewport` | `Frontend/src/shared/hooks/useOverlayViewport.ts` | Candidate | Visual-viewport size/offset styles shared by ModalLayer and existing Comments, mobile Search, and Account native dialogs; reacts to resize and visual viewport scroll. |
| `BackButton` | `Frontend/src/shared/components/ui/BackButton.tsx` | Candidate | Shared typed borderless arrow/label control with 44 px targets, subtle hover, one keyboard focus ring, history/parent fallback, and optional previous-step callback; AppLayout aligns detail/drill-down Back rows to the shared page frame with clear content separation; the opaque row stays sticky beneath the navbar inside the application scroll container. Authentication omits Back; onboarding retains its previous-step position. Contract: ui-rules.md; inventory/findings: [Back-button audit](back-button-audit.md). |
| `Avatar` | `Frontend/src/shared/components/ui/Avatar.jsx` | Candidate | Add fallback initials, sizes, loading behavior, and decorative/name semantics |
| `Pill` | `Frontend/src/shared/components/ui/Pill.jsx` | Candidate | Shared capsule selector with centered dynamic labels, active/inactive theme states, and 44px targets at every breakpoint; used by tabs and FilterBar topic/type choices. Preserves pressed/tab semantics; split static metadata into a separate contract before promotion |
| `Tag` | `Frontend/src/shared/components/ui/Tag.jsx` | Candidate | Clarify link, filter, and static variants |
| `Divider` | `Frontend/src/shared/components/ui/Divider.jsx` | Candidate | Ensure semantic/decorative behavior |
| `ImageBox` | `Frontend/src/shared/components/ui/ImageBox.jsx` | Candidate | Preserve explicit media sizing and labelled placeholder fallback for missing or failed images; promote after state and accessibility coverage mature |
| `SectionHeading` | `Frontend/src/shared/components/ui/SectionHeading.jsx` | Candidate | Support heading level and optional action without fixed styling assumptions |
| `AuthorMeta` | `Frontend/src/shared/components/ui/AuthorMeta.jsx` | Candidate | Compact card metadata plus an opt-in article variant with a 40 px avatar, emphasized writer name, and aligned plain-text date/read-time outside the avatar/name profile links. Future durable-link/normalized-DTO work remains separate. |
| `ArticleCard` | `Frontend/src/features/post/components/ArticleCard.jsx` | Candidate | Define one content contract and semantic stretched link |
| `FeaturedCard` | `Frontend/src/features/post/components/FeaturedCard.jsx` | Candidate | Confirm distinct editorial need; avoid duplicate card logic |
| `CompactCard` | `Frontend/src/features/post/components/CompactCard.jsx` | Candidate | Normalize interaction and metadata with ArticleCard |
| `HorizontalCard` | `Frontend/src/features/post/components/HorizontalCard.jsx` | Candidate | Normalize responsive media, writer link, actions, and state |
| `DiscoveryPostCard` | `Frontend/src/features/discovery/components/DiscoveryPostCard.jsx` | Candidate | Shared list/grid/short discovery card with wrapping phone metadata/topics, direct icon-count appreciation and a comments modal, existing engagement hooks, and an icon-led overflow menu; preserve its variants and story links |
| `CommentsModal` | `Frontend/src/features/post/components/CommentsModal.tsx` | Feature-only | Native modal using the shared CommentsSection, paginated thread/composer, bounded internal scrolling, background blocking, keyboard focus containment, and Close/Escape/backdrop focus restoration |
| `CommentItem` | `Frontend/src/features/post/components/CommentItem.tsx` | Feature-only | Existing comment row extended with authenticated like/unlike/reply, owner edit/delete, inline confirmation/forms, failed-draft retention, pending protection, deleted placeholders, on-demand paginated replies, and a four-rendered-line Read more/Show less toggle. Reused by CommentsSection on articles, comment dialogs, and short readers. Inventory/evidence: [comment actions audit](comment-actions-audit.md). |
| `ShareMenu` | `Frontend/src/shared/components/ui/ShareMenu.tsx` | Candidate | Shared typed centered native share modal for all six entry points; content-specific title, Close, Copy Link / Share on X, canonical links, clipboard pending/recovery, focus containment/restoration, and Close/Escape/backdrop dismissal through ModalLayer. The existing filename is preserved. Inventory: [share audit](share-audit.md). |
| `AppreciationButton` | `Frontend/src/features/post/components/AppreciationButton.tsx` | Candidate | Shared presentational borderless transparent heart/count action for discovery cards, featured stories, articles, and short-read modals; selected filled-heart/action-text colors, 44 px target, icon-only muted pending state, and accessible pressed/label semantics. Callers retain existing authentication and mutations. |
| `PostEngagementControls` | `Frontend/src/features/discovery/components/PostEngagementControls.tsx` | Candidate | Shared appreciation/comment icon-count controls, with appreciation rendered by `AppreciationButton` for discovery cards, writer-profile article cards, and Explore Article of the Day; uses existing authentication, post-like cache updates/rollback (including writer articles), and CommentsModal with unique dialog IDs, 12 px counts, and 44 px targets |
| `MobileSearchDialog` | `Frontend/src/features/discovery/components/MobileSearchDialog.tsx` | Feature-only | Mobile full-screen native search dialog with animated opening/closing, existing empty-query topic/Popular-feed rows, and debounced live Search suggestions/Authors groups capped independently at five. Phrases run searches; authors open profiles. Inline arrow submission, keyboard selection/internal scrolling, recovery, and reduced motion are preserved. |
| `MobileProfileSheet` | `Frontend/src/features/user/components/MobileProfileSheet.tsx` | Feature-only | Mobile native bottom sheet with upward/downward motion, guest/member account choices, public Write, Settings, inline Help, temporary social homepage links, focus containment/restoration, internal scrolling, and desktop-resize dismissal |
| `Select` | `Frontend/src/shared/components/ui/Select.tsx` | Candidate | Controlled typed single-choice dropdown used by Theme and Language in Settings. Reuses ViewportPopover for matching-width, zero-gap bounded placement, preferring below with internal scrolling; 120 ms edge reveal and chevron rotation respect reduced motion. 44 px trigger/options, selected checkmark, active option, arrows/Home/End/typeahead, Enter/Space, Escape/Tab/outside dismissal, and trigger focus. Uses existing theme tokens; other native selects retain their contracts. |
| `ProfileSettings` | `Frontend/src/features/user/components/ProfileSettings.tsx` | Feature-only | Shared Select controls for Light, Dark, Use system theme, and the openable English-only language list; guests and members use the existing shared theme hook |
| `SignInPrompt` | `Frontend/src/shared/components/ui/SignInPrompt.tsx` | Candidate | Shared centered guest prompt with customizable message and one Sign In button opening LoginModal on explicit activation; reused by PrivateRoute, Profile, and private saved-story targets on Write. Routes wait for session restoration and keep private content unmounted until authenticated. |
| `FilterPopover` | `Frontend/src/shared/components/ui/FilterPopover.jsx` | Candidate | Shared filter panel with a divided header, readable labels, bordered reset control, fixed viewport placement, pinned mobile position across result/filter changes, bounded internal scrolling, portal-aware outside dismissal, and keyboard focus containment; FilterBar separates choices from sort and uses 44 px targets |
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

Current variants: `primary`, `secondary`, `ghost`, `action`, `menu`. Primary/secondary retain existing pill styling; action is borderless icon/text; menu is a full-width icon/text row.

Sizes: `sm`, `md`, `lg`, with `md` default.

Contract requirements:

- Native button attributes
- `aria-busy`, pending repeat protection, and stable label/icon content
- Leading/trailing icon slots
- No arbitrary colors through props
- Disabled and `aria-disabled` distinction documented
- Does not render a link; a separate `ButtonLink` may share styles

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

