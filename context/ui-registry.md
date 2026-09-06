# Ink-Rider UI registry

Last updated: 2026-08-24

## Purpose

The UI registry is the source of truth for reusable components and patterns. It prevents duplicate card, button, modal, author, and loading implementations from drifting across features.

This file records component responsibility and maturity. It does not replace component examples or tests.

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
| `Button` | `Frontend/src/shared/components/ui/Button.jsx` | Candidate | Add typed props, sizes, loading, focus-visible, icon slots, and link guidance |
| `Avatar` | `Frontend/src/shared/components/ui/Avatar.jsx` | Candidate | Add fallback initials, sizes, loading behavior, and decorative/name semantics |
| `Pill` | `Frontend/src/shared/components/ui/Pill.jsx` | Candidate | Interactive selectors expose pressed state and 44px phone targets; split static metadata into a separate contract before promotion |
| `Tag` | `Frontend/src/shared/components/ui/Tag.jsx` | Candidate | Clarify link, filter, and static variants |
| `Divider` | `Frontend/src/shared/components/ui/Divider.jsx` | Candidate | Ensure semantic/decorative behavior |
| `ImageBox` | `Frontend/src/shared/components/ui/ImageBox.jsx` | Candidate | Preserve explicit media sizing and labelled placeholder fallback for missing or failed images; promote after state and accessibility coverage mature |
| `SectionHeading` | `Frontend/src/shared/components/ui/SectionHeading.jsx` | Candidate | Support heading level and optional action without fixed styling assumptions |
| `AuthorMeta` | `Frontend/src/shared/components/ui/AuthorMeta.jsx` | Candidate | Rename to `WriterIdentity`; use durable writer link and normalized DTO |
| `ArticleCard` | `Frontend/src/features/post/components/ArticleCard.jsx` | Candidate | Define one content contract and semantic stretched link |
| `FeaturedCard` | `Frontend/src/features/post/components/FeaturedCard.jsx` | Candidate | Confirm distinct editorial need; avoid duplicate card logic |
| `CompactCard` | `Frontend/src/features/post/components/CompactCard.jsx` | Candidate | Normalize interaction and metadata with ArticleCard |
| `HorizontalCard` | `Frontend/src/features/post/components/HorizontalCard.jsx` | Candidate | Normalize responsive media, writer link, actions, and state |
| `Navbar` | `Frontend/src/shared/components/layout/Navbar.jsx` | Candidate | Global search and the account menu now have keyboard and focus behavior; separate their contracts from the top-bar layout before promotion |
| `Sidebar` | `Frontend/src/shared/components/layout/Sidebar.jsx` | Candidate | Add keyboard resize or remove resizing; add expanded semantics |
| `BottomBar` | `Frontend/src/shared/components/layout/BottomBar.jsx` | Candidate | Add profile destination and safe-area/content-offset tests |
| `Loader` variants | `Frontend/src/shared/components/layout/Loader.jsx` | Deprecated target | Replace oversized page loader with shared skeleton and progress patterns |
| `AppLayout` | `Frontend/src/shared/components/layout/AppLayout.jsx` | Candidate | Rename to AppShell and handle focus/skip link/scroll restoration |
| Question card | local to Questions page | Missing shared pattern | Extract after real question DTO and mutations exist |
| Competition card | local to Competitions page | Missing shared pattern | Extract after competition contract is stable |
| Collection card | local to Collections page | Missing shared pattern | Extract after collection API is connected |
| Empty state | scattered text | Missing | Create composed reusable pattern |
| Error state | scattered/raw messages | Missing | Create inline and page variants |
| Skeleton | absent | Missing | Create text, card, list, and article primitives |
| Dialog | duplicated local modals | Missing | Create accessible dialog primitive or approve a vetted library |
| Drawer | absent | Missing | Needed for mobile filters and article tools |
| Toast/status region | `Frontend/src/shared/hooks/useToast.jsx`, `Frontend/src/shared/components/ui/ToastViewport.jsx` | Candidate | Shared in-house action feedback with success, info, error, dismissal, reduced motion, and responsive placement |
| Form field | repeated inputs | Missing | Create label/help/error/input composition |
| Tabs | ad hoc pills | Missing | Create semantic tabs and route-tab guidance |
| Menu/popover | ad hoc dropdowns | Missing | Create accessible shared behavior |
| Save/reaction controls | feature-local | Feature-only initially | Promote only after API behavior stabilizes |
| Editor block | editor feature | Feature-only | Keep inside editor; share only primitive controls |

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

