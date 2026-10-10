# Ink-Rider UI rules

Last reviewed: 2026-10-10

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
- Comment Like/Unlike uses the common icon-only pending treatment: keep the transparent surface, heart/count placement, and full-opacity count; fill only the heart with the muted token. Retain aria-busy and repeat protection through confirmed refresh.

## Fonts and editorial hierarchy

- ModalHeader's title column fills the space beside Close. Without a subtitle, vertically center the title against the 44 px Close target instead of reserving a second text row. With a subtitle, preserve the existing top-aligned title/subtitle layout. Title text retains its existing left alignment.

- All 14 modal families and the desktop Inbox reuse ModalHeader: 20 px bold Libre Baskerville title, optional 12 px secondary subtitle, bottom divider, 16 px phone/24 px wider gutters, 12 px vertical padding, and a borderless 44 px Close button with hover/focus feedback. Preserve existing title IDs, close labels, focus refs, placement, motion, form content, and dismissal rules. Account and sign-in titles are visible; mobile Search places its title row above the animated search field with one Close control. This approved 2026-10-10 contract supersedes earlier modal-specific sans-serif/uppercase/hidden header descriptions. Detailed inventory: [modal audit](modal-audit.md).

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
- Shared discovery post cards use a semantic stretched headline link for the excerpt and remaining card space, while only the writer avatar/name open the writer profile; publication dates and reading times are plain text. Category chips open the existing `/search?q=<category>` post search; menu, appreciation, comment, and cover targets remain independent. Only the grid writer name links to the writer; its reading time remains plain text without changing the compact presentation. Short-card categories open `/search?q=<category>&type=shorts`, selecting Shorts results through the existing search API, while the remaining short-card area retains the existing reading modal. Explore's Article of the Day follows the same identity/metadata distinction, with independent menu and engagement controls.
- Short discovery cards size to their content without a fixed aspect ratio, minimum height, or stretching to match taller grid neighbors. Preserve the existing 20 px gutters, cover placement, serif title, excerpt clamp, and divided category/engagement footer. Use 20 px between author metadata and title, 12 px before the excerpt, and 20 px before the footer divider with its existing 20 px top padding.
- Short-read detail author avatars and names open the writer profile; the separate reading-time label stays plain text. Identity links use the stored handle with the existing username fallback and dismiss the reader. Comments remain inline; the footer contains appreciation, save, and Share without a duplicate comments button. Share opens the same centered native modal used throughout the app, with a content-specific heading, Close, Copy Link, and Share on X for the canonical `/post/:id` URL. It opens above the existing reader; dismissal returns focus to Share and preserves the reader. Clipboard failures keep the options available for retry.
- Save and overflow actions remain separate buttons.
- Do not make a non-semantic outer `div` the only clickable target.
- Use a maximum of two metadata rows.
- Card images use stable aspect ratios to prevent layout shift.
- Avoid equal-height card grids when content density varies significantly.
- Below 768 px, list-style discovery cards follow writer/date, title, excerpt, cover, then a footer. The cover has a 16 px gap after the excerpt and the footer a 12 px gap after the cover. The footer reserves separate columns for wrapping topic chips on the left and appreciation/comment controls on the right, keeping tags clear of the actions. Text-only list cards use the same footer. Desktop, grid, and short-card compositions retain their existing layout. On phones, writer identity sits above publication metadata; long names, titles, and topics wrap within the card.
- All direct post appreciation controls use the shared `AppreciationButton`: borderless transparent action, 15 px heart, 12 px count, 44 px minimum target, outlined unselected heart, and filled heart with action text color when selected. Discovery list/grid/short cards, Article of the Day, article pages, and short-read modals share this presentation, including pending and keyboard-focus states. Existing authentication, optimistic updates, rollback, and menu commands are preserved.
- Writer-profile article cards use shared `PostEngagementControls` beside wrapping topic chips in the existing footer, replacing the static appreciation/comment sentence. Like/unlike retains reader-specific selected state and optimistic rollback; comments open the existing comments modal without navigating to the article. Covers, reading/date metadata, serif titles, tag links, grid, and article navigation are preserved.
- Appreciation and comment controls show an icon and numeric count with accessible names and 44 px targets. Appreciation uses the existing server-backed set/unset action and pending state. Comments open the shared comment list/composer in a native modal without opening the story or expanding the card. The modal blocks background interaction, contains keyboard focus, scrolls internally on narrow/short screens, and supports Close, Escape, and backdrop dismissal with focus returned to the comment button. Its paginated Load more action makes the full thread accessible; comments load only when the modal opens. Guests can read comments and receive the existing sign-in prompt to participate.
- Discovery-card overflow menus use leading icons for Save, Share, recommendation explanation, Not interested, and Report. Appreciation lives on the card rather than in this menu; keyboard navigation and trigger-focus restoration remain available.
- Wrapped reading-order post lists preserve 24 px above each card after the first, keeping author metadata clear of the previous divider. `DiscoveryPostCard` retains its default first-card alignment; collection lists explicitly enable flush top spacing only for index zero.
- List discovery cards group linked writer identity above publication date/reading time with an 8 px row gap and a 20 px gap before the headline. The overflow trigger is a quiet 44 px control with a centered three-dot SVG, hover feedback, and keyboard focus; it has no raised border/shadow. Shared appreciation/comment controls use borderless transparent surfaces, 12 px counts, subtle hover feedback, and 44 px targets.

### Question card

- Question feed and detail categories reuse shared `Tag` typography, padding, and compact capsule background. Links retain transparent 44 px minimum hit areas around the visual tags, wrapping long labels without enlarging the filled capsule to the hit-target height. Category links on feed, detail, search results, and writer opportunities open `/search?q=<category>&type=questions`; hash-prefixed labels and existing capsule styling are preserved.
- The Questions page groups Ask a question and Filters together in its header actions, with a 12 px gap. Filters do not occupy a separate row between the header and question list; the existing topic/sort popover and URL state are preserved.
- Keep the question title as the strongest visual element.
- Question feed cards use the shared post-style stacked AuthorMeta above the title: photo/name, then date with an 8 px gap. The upvote control sits at the right of this author/date row, aligned at the top. Leave 20 px before the full-width question heading. Context, tags, and response footer use the full card width beneath it. Metadata has no orphan separator dots; long writer names wrap safely and their profile links remain available.
- Feed-card bodies separate author/date metadata, context/topics, response counts, and actions through whitespace. Below 640 px, author and date stack and actions sit below the counts. Context uses 14 px text with 24 px line height; activity counts emphasize the numbers. Feed cards do not list published article titles: when responses exist, View responses opens the question detail page at its Published responses heading, scrolls the section into view after data loads, and focuses the heading. Add response and View responses use regular-weight labels in compact buttons placed side by side with an 8 px gap and 44 px minimum targets. Add response uses the existing filled action colors and preserves guest sign-in/member article-editor behavior; View responses is outlined and appears only when published responses exist. Preserve the serif question heading, upvote control, topic pills, and preview truncation.
- Show demand count, answer state, topics, freshness, and whether a writer has claimed it.
- Voting is an explicit set/unset action with an accessible name.
- Question-feed author blocks, including their date, open the writer profile through the existing author link. Category chips open category queries in the Questions search tab. The Explore toolbar retains its questionTopic URL filter, with choices drawn from loaded question tags and the selected topic, and its existing loaded-feed/Load more behavior. The remaining card area uses a semantic stretched question-title link to details. Author/category links, upvote, Add response, and View responses remain independent targets.
- Duplicate or answered states are visible in text, not color alone.

### Competition card

- Competition-detail entry cards give writer identity and publication/read-time metadata separate wrapping rows; names and dates must remain readable in narrow grid cards, with no unused space reserved for the cover-overlay action. Winner labels remain separate from the title. Below 640 px, voting sits after the entry content with a 44 px minimum target, card gaps increase to 24 px, and titles/metadata use 18 px and 12–13 px text. At larger widths, retain the cover-overlay vote control and existing grid/card styling. Article links, vote state/counts, comments, rank, and unavailable-entry fallback remain available.
- Below 640 px, competition list cards place the compact cover beside stacked status/date metadata, followed by a full-width title and description. Use 24 px vertical card padding, 16 px between the cover row and title, 20 px titles, 14 px descriptions with 24 px line height, and 13 px date metadata. Status labels stay on one line; descriptions and long titles wrap without clipping. The Active/Inactive and Filters row wraps when space is limited. At 640 px and above, retain the existing horizontal thumbnail/text layout and type sizes.
- Show status, mode, deadline/results date, eligibility summary, and entry count.
- Countdown values use server-derived dates and tabular figures.
- Closed competitions never display an enabled submission action.
- Closed competition entry cards hide vote and remove-vote buttons, including for previously voted entries; article links and results remain visible.
- Entry author photos/names link to the stored public profile handle. A semantic stretched article-title link opens the post from the cover, metadata, results, and remaining card space, while author links and vote buttons remain independent targets. Entries without an available post retain their unavailable state.

### Collection card

- The Collections view/filter toolbar wraps complete controls when its available width is limited. Shared collection cards in Collections, Saved, and Home use the approved inset-cover reference: a rounded bordered surface with 16 px gutters, 20 px top padding, text beside a 120 px-high rounded cover occupying 34% of the content width, and a full-width divided footer. Titles use the existing display serif at 18 px regular weight; descriptions use 13 px body text. The footer uses 12 px story-count/curator metadata, wraps long names, and uses singular “story” for one item. Cards have a 216 px minimum height and grow with content. The compact circular cover-menu control retains a 44 px target and existing keyboard behavior. Theme tokens, title/description clamping, ImageBox fallback, grid, navigation, and collection actions are preserved. Long unbroken text wraps within its column.
- Show curator, purpose, item count, visibility, and a representative cover.
- Collection save is independent from opening the collection.
- The full collection-detail curator row (avatar, name, and counts) is a keyboard-accessible link to the author’s stored profile handle. If the handle is unavailable, use the existing `/author` writer-search recovery page rather than inventing a handle from the display name. Preserve the row’s presentation.
- Collection detail uses the post-detail bookmark and share icons in circular bordered controls with accessible labels and 44 px targets. Bookmark retains the confirmed saved state; during save/removal it retains the bookmark icon/action label, fills only its icon with the muted token while retaining its normal surface, disables repeat actions, and stays pending until the mutation and active collection reads finish refreshing. Preserve the previous saved state on failure; Share opens the same two-option popup as post detail: Copy Link and Share on X, with existing icons, the shared centered share modal, initial focus, native keyboard containment, Close/Escape/backdrop dismissal, action focus return, and toast feedback. Hide Save for owners as before. This screen has no Follow button; author-profile following remains available.
- The collection-title link stretches across the entire card, including its description, cover, metadata footer, and padding, to open `/collections/:id`. Keep the options button and menu above that link so save, share, delete, and hide actions remain independent. The link retains native keyboard and browser navigation behavior.
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
- Async loading uses `aria-busy` plus `disabled`, retaining the existing label/icon instead of inserting a spinner or loading label. For icon-led buttons, the shared rule in `global.css` fills/strokes only SVG icons with `--color-text-muted`; non-SVG glyphs use `data-button-icon` and the same muted color. Labels/counts stay at full opacity, surfaces retain their normal styling, and the cursor is wait. Text-only buttons retain the existing 60% accent/40% surface pending fill. Shared `Button`, `AppreciationButton`, and native feature buttons use this same treatment in both themes. Existing optimistic saved/followed/voted state and counts may still update. Validation/permission-disabled states remain separate. Keep actionable menus visible until successful completion; failures restore the control for retry. Preserve recovery views during no-data query refetch via retainRetryView so Retry itself remains visible and busy; initial loads retain their skeletons. Source inventory, boundaries, and browser coverage live in [button loading audit](button-loading-audit.md).
- Reuse `Button` primary/secondary pills, borderless `action` for icon/text controls, and full-width `menu` rows. Leading/trailing icon slots mark decorative glyphs for pending styling. Existing native controls with SVGs receive the common treatment automatically; mark text glyphs with `data-button-icon`. Compact engagement controls use `data-button-style="action"` for transparent borders/surfaces, including selected states, while preserving geometry and keyboard focus. Dropdown triggers, primary pills, and dedicated circular icon controls retain their normal structure.
- Disabled controls must remain legible and should explain unmet prerequisites nearby.
- A button triggers an action; a link navigates.
- Do not pair primary and ghost buttons mechanically on every surface.

## Settings dropdowns

- Theme and Language use shared typed `Select` with the existing 420 px maximum width, theme colors, body typography, rounded borders, and 44 px targets. The anchored list reuses ViewportPopover with zero gap at the field edge and prefers downward opening when at least one 44 px option fits; otherwise it flips above. It reveals from the attached edge over 120 ms without moving or scaling the panel, and its chevron rotates over the same interval; reduced motion is immediate. It shows a checkmark for selection and a surface highlight for the active option, and scrolls internally within viewport bounds. Keyboard support includes arrows, Home/End, typeahead, Enter/Space selection, Escape and Tab dismissal; pointer selection and outside dismissal remain available. Focus stays on the trigger while navigating and after selection. Language opens with English as its sole supported choice; the existing availability message remains.

## Profile editing

- Edit profile navigates to guarded `/profile/edit` inside AppLayout/PageFrame rather than replacing the profile header. Reuse the existing display-name and optional biography fields, 80/500-character limits, theme/typography, and profile update API. Initialize the editable draft once so background refetches do not overwrite entered work; failed saves retain values and permit retry. Save waits for profile cache refresh, then returns to `/profile` with the original query/tab; Cancel returns without a write. The shared Back row supports history and a direct-entry Profile fallback.

## Inputs and forms

### Sign-in access guards

- Protected routes wait for session restoration, then show an otherwise empty page with a centered, screen-specific message and one Sign In button. Entry does not open authentication automatically or mount private content/queries. PrivateRoute accepts a customizable message (generic fallback: “Sign in to access this page.”); Profile says “Sign in to view your profile.” and Member Hub says “Sign in to access members page.” Saved, History, Opportunities, Notifications, Onboarding, and Staff use their own messages. Write is public for new composition; saved-draft/edit targets retain a sign-in prompt. Center the message/button group within the available content viewport between navigation bars, or the full viewport for Onboarding. Guest History omits the page Back row; signed-in History retains it. Clicking Sign In opens the shared modal without changing the URL; dismissal returns focus to that button and leaves the prompt. Shared gated actions still open the same modal above their current page, including above reader/comment dialogs.
- The auth modal retains “Sign in to Ink Rider” as a screen-reader-only dialog title and has no visible header label above the tabs. The logo remains absent, including during embedded email verification. Standalone login/signup and verification pages keep their brand/home link. The header contains only right-aligned Close and uses the embedded form's horizontal gutters (16 px, 24 px from 640 px, and 40 px from 1024 px); the tabs or verification content follow with an 8 px gap and no duplicate top padding. Login and native ModalLayer retain explicit Close, Escape, background blocking, keyboard containment, viewport-bounded scrolling, and opener focus restoration. Close uses a borderless 24 px rounded-stroke SVG cross with a transparent 44 × 44 px hit area; its keyboard focus ring is rounded and replaces the global square outline, with no resting boundary. Backdrop clicks preserve the form. Failed sign-in keeps entered values and permits retry; gated actions are not automatically replayed after login.
- Password and Google sign-in retain the originating pathname, query parameters, and hash. Modal sign-in closes in place. Navbar Sign In navigates to the standalone `/login` page and passes the full originating URL as its return destination. Mobile Account, Membership, Profile, Write Publish/private-story prompts, protected routes, gated feature actions, and failed session refresh use the shared modal. Mobile Account completes its closing animation before opening authentication. Direct `/login` visits and explicit sign-out navigation retain the standalone login page. Only local application destinations are accepted; external URLs and login/signup loops fall back to Home. Account creation retains email verification and onboarding. Verification of an existing account returns to its originating page.
- After an established session fails refresh, the API client clears the session and requests this modal instead of performing a full-page login redirect. Server authentication and authorization remain authoritative.

- Every field has a persistent visible label. Placeholder text is supplementary.
- Help and error text is associated with `aria-describedby`.
- Validate on submit and after a visited field changes; do not punish users while they are typing.
- Preserve entered values after recoverable server errors.
- Required fields are identified in text.
- Search uses a search landmark and submit behavior.
- OTP inputs support paste, keyboard navigation, and a single accessible group label.
- Rich editor shortcuts must have discoverable pointer and keyboard alternatives.

## Navigation bars and sidebars

### Back navigation

- Use shared `BackButton` with an 18 px rounded-stroke arrow, Back label, 13 px medium body text, transparent borderless resting state, subtle theme-based hover surface, 8 px radius, one keyboard focus ring, and a 44 px minimum target at every width. AppLayout explicitly opts in post, author, question, competition, collection, and series detail routes, plus Search, Membership, profile editing, and signed-in History drill-down pages. Settings and Help have no page Back control. Its separate row uses the current shared 1120 px app-page-frame and responsive 16/20/32 px gutters; the arrow aligns with the content edge. The row stays sticky at top: 0 inside the application scroll container beneath the fixed navbar, with an opaque page background and layer 20 below navigation/overlays. Back remains visible and usable while content scrolls; initial placement and history/parent destinations are preserved. Following content has 16 px clearance, increasing to 24 px at 768 px and above, including loading, missing-resource, and inline-error states. Scoped spacing does not alter primary pages; feature pages must not duplicate Back. Primary destinations (Home, Explore tabs, Shorts, Collections, Saved, Profile, Write, Opportunities, Members, Notifications, Staff) and recovery routes have no Back, regardless of navigation history. Login, signup, and verification have no Back control; their brand link returns home. Onboarding has only a previous-step action with a distinct accessible name. The [Back-button audit](back-button-audit.md) owns the route inventory and detailed findings.
- Back uses the previous BrowserRouter entry when its index is positive. Fresh/direct entries replace the route with its parent: question/competition detail to the corresponding Explore feed, collection detail to Collections, series detail to Shorts, History and profile editing to Profile, and other opted-in routes to Home. Query strings and hashes are preserved by history navigation. The server-unavailable surface remains a chrome-free retry page.

### Top bar

- Guest desktop navbar authentication shows only Sign In; there is no Sign Up button in the top bar. Account creation remains available in the login/signup flow and mobile Account sheet.

- The desktop Join link uses a compact 36 px minimum pill height. Shared filter/category Pill controls retain their existing 44 px targets.

- At 768 px and above, the top bar contains brand/home, search, a Join link to `/membership`, notifications, and account access. Search fills available space up to 660 px. Below 768 px, Join is a row in the existing Account sheet for guests and signed-in accounts, using its animated dismissal before navigation. The mode control is in Settings.
- Below 768 px, the top bar contains only the existing Ink Rider logo mark and a full search field filling the remaining width, including on the Search route. Account actions are available through the Account sheet in the bottom bar; appearance controls live in Settings.
- Focusing or tapping mobile navbar search opens a native full-screen modal above all application chrome. Its search field expands from the header position across the top with a 280 ms transition. Close and Escape reverse the expansion and fade the modal before dismissal; reduced-motion users receive immediate opening and closing. The mobile input has one explicit close control and no field underline; the container border provides its focus cue. Suggested topics use unbulleted list rows. Trending-search rows are title-based suggestions from the existing Popular stories feed, labelled with that source rather than represented as search-frequency rankings. Typed autocomplete uses the existing unified search API after a 250 ms pause and shows separate Search suggestions and Authors groups, capped independently at five. Search phrases come from publicly released post tags/titles; selecting one runs its complete query, while authors open their profiles. Arrow keys select suggestions and scroll only the dialog to keep the active row visible; Enter opens the selection or searches the exact input. An arrow button immediately after the close control submits the current query; there is no bottom full-results button. Close and Escape restore navbar focus; background interaction is blocked, and desktop resize dismisses the modal. Loading, empty, retry, and query submission remain available. The Search page renders its result heading, filters, tabs, and results without a duplicate search input or submit button; global navbar search remains available at every viewport width.
- Remains visually stable across routes.
- Desktop global search has no All/Articles/Authors selection buttons. Its autocomplete uses the same 250 ms debounce and content-phrase/author groups as mobile, with complete wrapping labels and five items per group. Exact phrases rank before phrase-prefix and word-prefix matches; supporting-publication counts break relevance ties. Duplicate phrases are normalized, private/unreleased metadata is excluded, and fewer than five matches stay fewer than five. Changing input clears selection and suppresses old suggestions; late responses remain isolated by query. Arrow selection scrolls only the bounded dropdown; Escape/Tab dismiss it. Search-results page tabs and filters remain separate and unchanged.
- Global search must not use a separate mock-data implementation from the search results page.

### Desktop navigation

- Write is available in the sidebar to guests and signed-in accounts. Member Hub appears only after session restoration confirms a signed-in account; direct guest /members access still shows its centered sign-in prompt.

- Settings uses the shared PageFrame width and responsive gutters, matching the other standard application pages. Its existing preference controls and signed-in reading-interest behavior are preserved.

- At 768 px and above, Help sits directly above Settings in the bottom sidebar group, separated from the primary link stack by a divider, for guests and members. Help opens public `/help`, a product guide using PageFrame, PageHeader, and existing theme/typography/link conventions; it provides links to reading, writing, community, membership, and settings surfaces. Both links retain existing active-route styling. `/settings` offers Light/Dark/Use system theme selection and an openable English-only language selector to everyone. Existing reading-interest queries and mutations mount only for signed-in members; guests see App preferences only, without a reading-interest sign-in prompt.

- Active destination is indicated by text weight plus shape/border, not color alone.
- Expandable groups expose `aria-expanded` and preserve current-route visibility.
- Resizing is optional; if retained, it must have a keyboard mechanism and persisted bounds.

### Mobile bottom bar

- The mobile Account sheet has no visible title at the top. Its screen-reader-only heading names the dialog “Account”, while the drag indicator and right-aligned Close button remain visible; guest/member menu options are preserved.

- Explore and Account retain the normal accent/text color before activation; they do not use the muted inactive color. The mobile and desktop sidebar Explore arrow explicitly use `currentColor` so the SVG stroke matches its label and follows the existing route/hover colors. Explore retains `aria-current` and Account retains expanded/dialog semantics. Other bottom-bar items keep their existing active/inactive styling.
- Contains no more than five primary destinations.
- Respects safe-area inset and does not cover page actions.
- Labels remain visible; do not rely on icons alone.
- Mobile navigation consistently has Home, Explore, Shorts, Collections, and an Account button for guests and members across application routes. Collections links to `/collections` in the fourth position and remains visible when navigating away from Home; its active state covers collection detail routes. The Account sheet includes a public Write link to `/write`, using the existing menu row and close-before-navigation behavior. Desktop Write is also public. Shorts uses the shared quick-read lightning icon.
- Below 768 px, Profile opens a native modal bottom sheet without changing the current route. It slides up from the bottom and slides down before dismissal or navigation, with a fading backdrop and immediate transitions for reduced motion. Guests get Sign Up and Sign In; members get their identity and a My profile link to `/profile`, plus Sign Out. Both get Write, Settings, expandable Help with existing discovery links, and Instagram/LinkedIn homepage links (temporary destinations requested by the user). Close, Escape, and backdrop dismiss the sheet and restore trigger focus. The sheet uses the full phone width up to 480 px and is centered at a maximum width of 480 px on wider mobile viewports. It contains keyboard focus, leaves a 16 px top inset, scrolls internally on short screens, and respects the bottom safe area. Resizing to 768 px or wider dismisses it. The Profile page has no gear; its guest prompt and member content are preserved, with private queries gated on session restoration.

### Reading progress bar

- Represents article progress only after the reading container is known.
- Does not animate width with a duration that makes it lag behind scrolling.
- It is supplementary and does not need to be announced continuously by assistive technology.
- The article reads scroll position from AppLayout's `[data-app-scroll="true"]` container, which owns application scrolling; it must not bind to the article's nested `<main>` element or `window` while that shell is present.

## Tabs, pills, filters, and badges

### Tabs

- Use tabs only when sections share one context and switching does not represent navigation history.
- Use links/route segments when a state should be bookmarkable or support browser navigation.
- Implement keyboard arrow navigation and proper tab semantics for real tabs.

### Filter chips and pills

- Shared `Pill` selectors use the action-button capsule proportions: centered dynamic labels, 18px horizontal padding, 8px vertical padding, full rounding, and a 44px minimum height at every breakpoint. Active/inactive competition choices and `FilterBar` topic/type choices reuse this component and its selected/unselected theme states.
- Filter triggers keep their icon, label, and active count on one line with intrinsic minimum width. Responsive header rows wrap the entire filter control when necessary rather than squeezing its label into multiple lines.
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

- Notifications opens a 360 px-wide viewport-bounded popover below the desktop navbar notification button, using the same ViewportPopover placement as Account. It is right-aligned to the trigger with the existing 8 px gap; Close, Escape, outside click, and reactivating the trigger dismiss it. Mobile Account retains the existing centered native modal. Preserve the underlying page, query/hash, scroll, and opener focus; direct `/notifications` entries use Home as the background and dismissal destination. ViewportPopover owns desktop placement; ModalLayer owns mobile background blocking. The existing focus hook, Close/Escape, internal scrolling, and opener-focus return apply to both; desktop background surfaces remain interactive. Use the shared ModalHeader with Inbox as its visible and accessible title; retain 16 px body gutters and 32 px empty-state vertical padding. The borderless Close cross retains its transparent 44 px hit area and rounded keyboard-focus ring. Keep themed rows, read links, unread badge polling, Mark all read, loading/error/empty feedback, and global service-outage recovery. Cursor Load more exposes older activity with retained first-page content on failure. Read mutations wait for confirmed invalidation; failure retains the modal for retry. Inventory/evidence: [notifications audit](notifications-audit.md).

- Every existing report trigger opens shared `ReportModal` above the page, never an inline page/menu form. Post detail and discovery cards reuse the same post-detail `ReportForm`, including optional Details and received confirmation; question/answer reporting retain their existing forms/hooks. Triggers and modal titles use “Report this post/short/question/answer”; short format/variants use short. The shared naming convention also defines “Report this collection/author/comment” for those subjects. The native modal blocks background interaction, contains focus, fits the viewport, scrolls internally, and supports Close/Escape with opener focus restoration. Backdrop clicks retain the form. Guests retain sign-in gating; recoverable submission failures preserve values and retry. Inventory: [report-button audit](report-audit.md).

- Use a popover for lightweight contextual choices.
- Use a dialog only when the user must complete or dismiss a focused task.
- Prefer a drawer or full page for complex editing on small screens.
- Opening moves focus appropriately; closing restores focus to the trigger.
- Escape closes dismissible overlays.
- Dialogs trap focus and prevent background interaction.
- Outside-click dismissal must not be the only close mechanism.
- Positioning must account for viewport collision.
- Anchored overlays use shared `ViewportPopover` outside clipping cards and page scroll containers. Story, featured-story, collection, article-share, desktop account, search-suggestion, and editor insert menus follow their trigger during page scrolling, choose the available side, stay clear of application navigation, and scroll internally when needed. They reposition on window/visual-viewport resizing and content-size changes. Menus with scrolling page triggers dismiss when that trigger leaves the usable viewport. The 200 overlay layer matches existing account-dropdown layering above the application's 100 navigation layer; native modal dialogs remain above these overlays. Actions, keyboard selection, outside dismissal, and trigger-focus restoration stay with their existing callers.
- Shared filter panels use this viewport layer with mobile pinning: filter badges, header wrapping, and result changes retain the opening position; actual page scrolling or viewport resizing recalculates placement. Panels stay between application navigation bars and scroll internally on short screens. Panel interactions count as inside clicks even though the panel renders outside its trigger container.
- All active modal surfaces fit the visual viewport, including changes in its size/offset. Collection creation/deletion, short-series creation, question creation, competition entry, and short-read dialogs use shared native `ModalLayer` outside page/card containers. Comments, mobile search, and the Account sheet retain their existing native dialogs and animations with shared `useOverlayViewport` bounds. Form/confirmation panels scroll internally; short reads and comments retain their header/body/footer scrolling composition. The modal top layer prevents navigation and other background surfaces from covering controls or receiving input. Existing dismissal rules remain: delete confirmation has explicit Cancel/Escape; other existing backdrop, Close, and Escape actions are preserved. Focus returns to the opener, including the collection options button after cancelling deletion.
- Shared filter panels retain the existing header/body/footer layout with a divided header, readable sentence-case labels, separated Topic and Sort groups, and a bordered Reset filters button. FilterBar choices, select, reset, and close controls use 44 px targets. Reset restores all filters owned by the surface in one URL update and preserves unrelated parameters; Trending and Questions supply atomic reset handlers. Changes apply immediately, and the panel stays open after reset with default selections and no active-filter badge.

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

## Explore trending

- The Explore section tab bar hides its horizontal scrollbar while retaining horizontal scrolling and semantic, keyboard-accessible links on narrow screens. Its active underline and existing spacing/styles are preserved.

- Article of the Day preserves its featured cover/headline layout and shows the shared writer avatar, linked writer identity, publication date, and reading time above the story headline. The Article of the day label occupies a separate card header above the cover, spanning both desktop columns. The borderless, transparent overflow trigger sits at the right of the author metadata row beneath the cover on mobile and retains hover/focus feedback; the existing desktop cover/content columns remain intact. Writer/date rows have an 8 px gap; the headline follows with 20 px separation. Engagement controls remain beneath the excerpt. Its direct appreciation/comment counts use the same `PostEngagementControls` as discovery story cards, including optimistic appreciation with rollback, guest sign-in, and the existing comments modal with focus restoration. The cover and headline have separate story links; metadata links and action buttons are never nested inside a story link. Long writer names wrap, and unavailable avatars use the existing initials fallback.

- Keep the “Trending now” page title and description above Article of the Day. Below the featured card, the shared serif `SectionHeading` labels the feed “Trending stories,” with Filters aligned to the right. The heading/control row wraps when needed on narrow screens and has 16 px of bottom margin before the feed; feed loading, error, empty, and populated states follow this row.

## Search results

- Search has Posts, Writers, Shorts, and Questions tabs using the existing scrolling tab row, selected underline, and arrow/Home/End keyboard navigation. `type=questions` selects reader-question results and survives reload. Questions reuse the Explore QuestionCard with existing writer/detail links, upvotes, answer/article counts, Add response, and View responses. Query, topic, time, and sort remain in the URL; changing tabs preserves them and Reset filters preserves the query/type and unrelated parameters. Loading, empty, error, and retry use existing search feedback patterns.
- Question queries wait for session restoration and partition caches by viewer identity to preserve reader-specific upvote state. Votes retain guest sign-in gating, pending protection, and failure recovery; confirmed votes refresh active question search results before pending ends.

## Membership page


- `/membership` is public and reuses PageFrame, PageHeader, Button, and current token-based member cards. Ink Rider Pro displays a provisional ₹199/month launch price pending final pricing and payment integration. Perks explain early access, creator extras, workshops, summaries/read aloud, direct writer requests, analytics, and AI writing assistance, with availability/capacity/usage qualifications and separate creator support. Primary articles remain public; checkout owns the final charge and renewal details. The provisional price is display-only and does not configure the billing provider.
- Guest Sign In to join returns password/Google sign-ins to this page. Account creation retains the existing verification/onboarding flow. Signed-in accounts wait for server entitlements before checkout is enabled; failed access lookup offers retry. Active/trialing subscriptions get Manage membership and Open Member Hub rather than duplicate checkout. Billing uses the existing checkout/portal APIs. A 503 with `PROVIDER_NOT_CONFIGURED` from those two APIs remains a feature-level failure with a payment-unavailable message; actual connection failures and other gateway outages retain global recovery.

## Writer article requests

- Writer-profile Follow uses the same authentication-scoped query key as the profile read. Its optimistic label/follower-count update, confirmed response, and failure rollback must update that active cache entry; guest and authenticated profile caches stay separate. Existing Follow/Following button styles, pending protection, and sign-in modal gating are preserved.

- On eligible writer profiles, Request an article opens the existing direct-request fields in shared ModalLayer. Guests receive the shared sign-in modal. The modal has a named title, Close/Escape dismissal, focus containment/restoration, and internal scrolling. Draft fields survive dismissal/reopening on the profile; dirty drafts disable backdrop dismissal. Successful requests clear the fields, and reopening after success starts another request.
- Missing direct-request membership capability or a server entitlement rejection displays “Direct creator requests are available to members.” in that modal with a Become a member link styled as an action button to `/membership`. Pending entitlement reads show Checking membership; failed reads offer Try again. Other submission failures preserve the form and its retry action. Existing request limits, backend authorization, and API contracts remain authoritative.

## Article page

- Comment rows use 12 px top and 4 px bottom padding. Like/Reply/Edit/Delete have 8 px horizontal padding with no extra inter-button gap; their labels sit 4 px below the body rather than vertically centered in the retained 44 px targets. Keep the heart and text baseline visually aligned.
- Shared comments use a surface-colored bordered composer with 14 px rounding and 12/16 px compact/article gutters, keeping the existing initials avatar distinct against the surface. The 13 px visible label and 14 px resizable input align above a divided footer with a 12 px secondary-color counter and always-visible 44 px Comment button (disabled for blank input); Cancel appears for entered content. The composer owns the focus ring. Comment rows stack 13 px writer names above 12 px secondary-color dates, with 13/14 px compact/article body text and tightly spaced 44 px quiet actions aligned to the text. Reuse existing fonts, theme tokens, Avatar, Button, and shared comment behavior across articles, comments dialogs, and short readers.
- Post headers use the opt-in `AuthorMeta` article variant: a 40 px avatar beside a 14 px semibold writer name and aligned 12 px publication/read-time text below it. The avatar links to the profile with a 44 px minimum height; the name has its own profile link, and date/read-time text remains outside both links; names wrap and date/read-time separators appear only between available values. Default card metadata remains compact. Engagement controls form a named Article actions group: the shared borderless appreciation action, labeled borderless Save/Saved, labeled quiet Share, and a quiet icon-only Report with an accessible name and tooltip. All four controls have 44 px minimum targets. Leave 20 px between stacked identity/actions rows, or 24 px when desktop wrapping is needed. Below 640 px, engagement actions follow on their own row; from 640 px they sit beside the writer group and wrap beneath it when space is limited.
- Below 1280 px, Article overview and Read aloud use labeled 44 px controls below the header actions, with the selected member tool or access panel inline before the article body. Tools must not precede Back or the cover. At 1280 px and above, retain the existing sticky icon rail and side panels, preserving readable article width when a panel opens. Only one tool/panel instance mounts at a time; guest sign-in and membership capability checks are preserved.
- Keep title, abstract, writer context, publication date, reading time, and cover hierarchy clear.
- Generated summaries are labeled, tied to an article revision, and never impersonate author-written abstracts.
- Article actions remain reachable without obstructing reading.
- On narrow screens, summary and audio tools become a drawer or inline section rather than squeezing the article column.
- Comments follow the article and reuse the shared CommentItem on article, comment-modal, and short-reader surfaces. Like/Unlike uses the existing outlined/filled heart shape plus a numeric count, with action wording only in the accessible label. Like and Reply are available with guest sign-in gating; Edit/Delete are owner-only. Inline editing/reply fields retain failed submissions and use the existing 1,000-character limit. Delete requires confirmation and preserves other people's replies through a deleted placeholder. Replies load on demand with cursor pagination; nested indentation is bounded on phones. Controls retain existing button styling, theme tokens, 44 px action targets, pending protection, and error/retry feedback. Comment totals include active replies and exclude deleted placeholders. Detailed scope/evidence: [comment actions audit](comment-actions-audit.md).
- Related recommendations explain the relationship and avoid repeating the same writer excessively.

- Comment and reply text shows at most four rendered lines initially. Show Read more only when the actual text exceeds four lines at its current width; expand in place and replace it with Show less. Recalculate after layout/font changes and edits, preserve explicit line breaks, and keep the toggle keyboard accessible with aria-expanded/aria-controls and a 44 px target. This local reading action is available to guests and reuses CommentItem in article, comment-dialog, and short-reader views; it makes no API request.

## Editor

- Write prioritizes the draft: a compact header pairs the page title and live autosave status with Publish/Update; the format selector precedes visibly labeled title and story fields. The shared outer page frame is capped at 1120 px and aligns with other application pages; the existing writing-control gutter still aligns title and body fields. Title and body text share the same left alignment after a 96 px gutter containing the existing + and × block controls on the left. Controls retain 40 px targets and are visible below 640 px, otherwise revealed on hover or focus. Blocks reserve at least 40 px height to avoid control overlap. Writing-field focus retains its 2 px left-edge marker, blending 55% focus color with the canvas for a lighter treatment in both themes. The writing area reserves space for composition and ends with formatting guidance and a word count.
- Write uses one column on desktop and phone: format selector, Story details, title, then body. Cover upload, tags, short-read depth links, and eligible public-release settings share the full-width expandable Story details panel above the writing area, initially collapsed at every width. There is no side partition or sticky details sidebar. Native disclosure keyboard behavior preserves entered values when toggled. An empty cover uses a compact upload control; selecting a cover shows the preview, and removing it clears the pending upload and restores article publication requirements.
- Write has no writing-assistant controls or requests, including for members. Publish prerequisites appear below Story details. Existing fonts, theme tokens, guest access, navigation, draft/publishing APIs, early-access settings, and revision behavior are preserved.
- While slash insert choices are open, Up/Down and Enter belong to the menu rather than moving between editor blocks. Selection wraps through available options, stays stable through autosave rerenders, and resets when the filter or option types change. The selected option scrolls immediately inside the menu without moving the application page. Empty filters handle arrows/Enter safely; Escape closes the menu and Tab dismisses it while retaining normal focus navigation. Keyboard interception is limited to the active editor field and menu.

- New composition on `/write` is public after session restoration. Guests use the same editor layout, formatting, tags, and cover selection; Publish remains enabled to open the shared login modal even when prerequisites are incomplete. Guest drafting makes no draft, entitlement, depth-option, or publication requests and is held only in the mounted editor (reload/navigation discards it). The status reads “Sign in to save your draft.” Close/Escape, failed login/retry, and in-place password/Google login preserve the editor state. After sign-in, existing authenticated autosave begins with the entered content and normal Publish validation applies; publication requires another explicit click. Saved-draft (`draft`) and existing-post (`edit`) targets remain sign-in gated so private work is never loaded for guests. Signup retains the existing verification/onboarding flow.

- Autosave state is visible: saving, saved, offline, conflict, and error.
- Keyboard behavior never overrides native paste without preserving rich and plain-text expectations.
- Slash commands are optional accelerators; toolbar alternatives remain available.
- Block drag handles support keyboard reordering.
- Image blocks require alt text or an explicit decorative designation.
- Publishing validates title, content, media, topics, and audience settings.
- Preview uses the production renderer, not a parallel visual approximation.
- Destructive navigation warns only when unsaved work actually exists.

## Application page alignment

- All application content pages reuse `PageFrame` and its `app-page-frame` CSS contract: 100% available width capped at 1120 px, centered within the space after the sidebar, with 16 px gutters below 640 px, 20 px from 640 px, and 32 px from 768 px. AppLayout Back rows use the same class. Search, History, Author (including loading/error), Staff, and Write no longer define independent centered outer widths.
- Narrow reading columns, profile-cover insets, writing block controls, and bounded preference controls remain inside this common frame. Their internal offsets express content hierarchy rather than a different page origin. Preserve existing vertical spacing and feature composition.
- The application scroll container reserves a stable scrollbar gutter so short, empty, loading, and long pages do not shift the shared origin. Authentication/onboarding retain their standalone compositions; guest access prompts and centered recovery screens retain their own centering.
- New application content pages must reuse PageFrame. `Frontend/tests/page-alignment.spec.js` checks route inventory, common horizontal origin, Back alignment, responsive gutters, sidebar resizing, scrollbar changes, loading/recovery, and overflow. New routes must be added to its visual matrix or documented as a centered standalone/access/recovery surface. Findings and dated verification belong in [page alignment audit](page-alignment-audit.md).

## Responsive rules

- Authentication keeps its existing split desktop/card layout and 380 px card cap below 1024 px. At 1024 px and above, login/signup and verification cards grow up to 448 px, with 40 px horizontal and 48 px vertical card padding and 40 px form-column gutters. Phones retain reduced card gutters; short screens scroll the form column. Authentication has no Back button; the existing brand link returns home. Verification digits share the available width; the Google control uses the available form width and recalculates on resize.

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
- Respect reduced motion and system color preference. With no explicit saved Light/Dark choice, startup and the shared theme hook use `prefers-color-scheme` and follow its live changes; automatic system selection must not be stored as a manual preference. Explicit Light/Dark Settings choices persist under `ink-theme` and take priority across routes/reloads. Use system theme clears that override and immediately resumes system detection and live updates. Browsers without preference detection fall back to dark.
- The global reduced-motion mode disables non-essential animation and transition timing and turns off smooth scrolling; interaction and focus behavior remain available.
- Announce asynchronous form results with appropriate live regions.
- Test primary flows using keyboard only and at 200% zoom.


## Sharing

All six share entry points use shared `ShareMenu`: post/short/collection detail controls and Share link in discovery, featured-story, and collection-card options. Each opens the centered reference modal with a content-specific title, Close, Copy Link, and Share on X instead of copying immediately. Preserve existing trigger placement and sharing URLs. The panel uses 320 px maximum width, 16 px padding, 14 px rounding, existing theme colors/shadow, the shared ModalHeader heading/divider/Close treatment, and icon-led 13 px rows with 44 px targets. Native modality blocks the background, contains keyboard focus, and supports Close/Escape/backdrop dismissal with trigger focus restoration. Copy failures keep the modal open for retry; pending copy disables duplicate actions. Opening share over a short reader preserves the underlying reader and its comments. The [share audit](share-audit.md) owns the full inventory and verification scope.
