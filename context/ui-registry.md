# Ink-Rider UI registry

Last reviewed: 2026-10-07

## Purpose

The UI registry is the source of truth for reusable components and patterns. It prevents duplicate card, button, modal, author, and loading implementations from drifting across features.

This file records component responsibility and maturity. It does not replace component examples or tests.

The [2026-10-07 modal audit](modal-audit.md) inventories all nine modal types and related overlays, records current browser coverage, and owns the remaining draft-loss, contrast, target-size, eligible-list recovery, and comment-wrapping findings. Candidate dialog status does not mean those findings are resolved.

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
| `Button` | `Frontend/src/shared/components/ui/Button.jsx` | Candidate | Shared muted pending treatment via aria-busy; disables repeated activation while explicit mutations or returned async click promises are pending. Retains variants, label/icon, dimensions and focus styling. Source-wide inventory: [button loading audit](button-loading-audit.md). Typed props, sizes, icon slots, and link guidance remain candidates. |
| `ViewportPopover` | `Frontend/src/shared/components/ui/ViewportPopover.tsx` | Candidate | Typed portal placement shared by card/featured/collection/share/account menus, search suggestions, filters, and editor insert choices; respects navigation and visual viewport, follows scrolling, flips and bounds height, observes content size, and supports pinned mobile filters. Portals inside an open native dialog when its trigger is there; otherwise uses the existing body layer. Callers own semantics, focus, and actions. |
| `ReportForm` | `Frontend/src/shared/components/ui/ReportForm.tsx` | Candidate | Shared post-detail form for post and short reporting from detail/card entry points; reason, optional details, Cancel, pending/error/retry, and received confirmation. Reuses existing mutation hooks and API payloads. |
| `ReportModal` | `Frontend/src/shared/components/ui/ReportModal.tsx` | Candidate | Shared typed modal shell with Report this subject naming around post/card/question/answer forms; reuses ModalLayer and useDialogFocus for top-layer blocking, viewport bounds, scrolling, Close/Escape, and opener focus restoration. Backdrop does not dismiss. Inventory: [report audit](report-audit.md). |
| `ModalLayer` | `Frontend/src/shared/components/ui/ModalLayer.tsx` | Candidate | Typed native modal portal for existing form/confirmation/short-read panels; viewport bounds, background blocking, configurable backdrop dismissal, and opener-focus restoration. Feature content and existing focus hooks are preserved. |
| `useOverlayViewport` | `Frontend/src/shared/hooks/useOverlayViewport.ts` | Candidate | Visual-viewport size/offset styles shared by ModalLayer and existing Comments, mobile Search, and Account native dialogs; reacts to resize and visual viewport scroll. |
| `BackButton` | `Frontend/src/shared/components/ui/BackButton.tsx` | Candidate | Shared typed back control with 44 px targets, keyboard focus, history/parent fallback, and optional previous-step callback; AppLayout opts in detail/drill-down routes only. Auth reuses page Back; onboarding reuses previous-step Back only. Placement and navigation rules live in ui-rules.md. |
| `Avatar` | `Frontend/src/shared/components/ui/Avatar.jsx` | Candidate | Add fallback initials, sizes, loading behavior, and decorative/name semantics |
| `Pill` | `Frontend/src/shared/components/ui/Pill.jsx` | Candidate | Shared capsule selector with centered dynamic labels, active/inactive theme states, and 44px targets at every breakpoint; used by tabs and FilterBar topic/type choices. Preserves pressed/tab semantics; split static metadata into a separate contract before promotion |
| `Tag` | `Frontend/src/shared/components/ui/Tag.jsx` | Candidate | Clarify link, filter, and static variants |
| `Divider` | `Frontend/src/shared/components/ui/Divider.jsx` | Candidate | Ensure semantic/decorative behavior |
| `ImageBox` | `Frontend/src/shared/components/ui/ImageBox.jsx` | Candidate | Preserve explicit media sizing and labelled placeholder fallback for missing or failed images; promote after state and accessibility coverage mature |
| `SectionHeading` | `Frontend/src/shared/components/ui/SectionHeading.jsx` | Candidate | Support heading level and optional action without fixed styling assumptions |
| `AuthorMeta` | `Frontend/src/shared/components/ui/AuthorMeta.jsx` | Candidate | Rename to `WriterIdentity`; use durable writer link and normalized DTO |
| `ArticleCard` | `Frontend/src/features/post/components/ArticleCard.jsx` | Candidate | Define one content contract and semantic stretched link |
| `FeaturedCard` | `Frontend/src/features/post/components/FeaturedCard.jsx` | Candidate | Confirm distinct editorial need; avoid duplicate card logic |
| `CompactCard` | `Frontend/src/features/post/components/CompactCard.jsx` | Candidate | Normalize interaction and metadata with ArticleCard |
| `HorizontalCard` | `Frontend/src/features/post/components/HorizontalCard.jsx` | Candidate | Normalize responsive media, writer link, actions, and state |
| `DiscoveryPostCard` | `Frontend/src/features/discovery/components/DiscoveryPostCard.jsx` | Candidate | Shared list/grid/short discovery card with wrapping phone metadata/topics, direct icon-count appreciation and a comments modal, existing engagement hooks, and an icon-led overflow menu; preserve its variants and story links |
| `CommentsModal` | `Frontend/src/features/post/components/CommentsModal.tsx` | Feature-only | Native modal using the shared CommentsSection, paginated thread/composer, bounded internal scrolling, background blocking, keyboard focus containment, and Close/Escape/backdrop focus restoration |
| `ShareMenu` | `Frontend/src/shared/components/ui/ShareMenu.tsx` | Candidate | Shared typed centered native share modal for all six entry points; content-specific title, Close, Copy Link / Share on X, canonical links, clipboard pending/recovery, focus containment/restoration, and Close/Escape/backdrop dismissal through ModalLayer. The existing filename is preserved. Inventory: [share audit](share-audit.md). |
| `AppreciationButton` | `Frontend/src/features/post/components/AppreciationButton.tsx` | Candidate | Shared presentational article-style heart/count capsule for discovery cards, featured stories, articles, and short-read modals; selected action colors, 44 px target, pending state, and accessible pressed/label semantics. Callers retain existing authentication and mutations. |
| `PostEngagementControls` | `Frontend/src/features/discovery/components/PostEngagementControls.tsx` | Candidate | Shared appreciation/comment icon-count controls, with appreciation rendered by `AppreciationButton` for discovery cards, writer-profile article cards, and Explore Article of the Day; uses existing authentication, post-like cache updates/rollback (including writer articles), and CommentsModal with unique dialog IDs, 12 px counts, and 44 px targets |
| `MobileSearchDialog` | `Frontend/src/features/discovery/components/MobileSearchDialog.tsx` | Feature-only | Mobile full-screen native search dialog with animated opening/closing, unbulleted topic and Popular-feed search suggestions, debounced live results, an inline arrow submit control after Close, keyboard selection, recovery, and reduced-motion behavior |
| `MobileProfileSheet` | `Frontend/src/features/user/components/MobileProfileSheet.tsx` | Feature-only | Mobile native bottom sheet with upward/downward motion, guest/member account choices, member-only Write, Settings, inline Help, temporary social homepage links, focus containment/restoration, internal scrolling, and desktop-resize dismissal |
| `ProfileSettings` | `Frontend/src/features/user/components/ProfileSettings.tsx` | Feature-only | Theme and English-only language controls embedded in the Settings page; guests and members use the existing shared theme hook |
| `SignInPrompt` | `Frontend/src/shared/components/ui/SignInPrompt.tsx` | Candidate | Shared centered guest prompt with one Sign In link for Profile and Write |
| `FilterPopover` | `Frontend/src/shared/components/ui/FilterPopover.jsx` | Candidate | Shared filter panel with a divided header, readable labels, bordered reset control, fixed viewport placement, pinned mobile position across result/filter changes, bounded internal scrolling, portal-aware outside dismissal, and keyboard focus containment; FilterBar separates choices from sort and uses 44 px targets |
| `Navbar` | `Frontend/src/shared/components/layout/Navbar.jsx` | Candidate | Global search and the account menu now have keyboard and focus behavior; separate their contracts from the top-bar layout before promotion |
| `Sidebar` | `Frontend/src/shared/components/layout/Sidebar.jsx` | Candidate | Explore arrow inherits its label color via `currentColor`; retain existing route/hover styling and keyboard resizing/expanded behavior |
| `BottomBar` | `Frontend/src/shared/components/layout/BottomBar.jsx` | Candidate | Home, Explore, Shorts, Collections, and Account on every mobile application route for guests and members; Write lives in the signed-in Account sheet. Explore and Account retain normal color when inactive. Retain safe-area/content-offset coverage |
| `Loader` variants | `Frontend/src/shared/components/layout/Loader.jsx` | Deprecated target | Replace oversized page loader with shared skeleton and progress patterns |
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

Variants: `primary`, `secondary`, `tertiary`, `quiet`, `danger`.

Sizes: `sm`, `md`, `lg`, with `md` default.

Contract requirements:

- Native button attributes
- `isLoading` and loading label
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

