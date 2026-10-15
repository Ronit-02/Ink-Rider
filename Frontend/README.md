# Ink Rider

Series cards offer owner-only Edit and Delete series, Share link, and Not interested from their three-dot menu. Collection cards likewise offer Edit collection to their owner; selecting Edit opens the existing detail-page modal.

Editorial platform UI built with React + Vite.

Application pages remember their main scroll position per browser history entry within the current tab. New navigation starts at the top; Back and Forward return to the saved position.

Article list-card categories remain on one line beside appreciation and comments. Only complete category pills that fit the available width are shown; hidden pills reappear when the card widens.
Question and writer-opportunity list cards use the same whole-pill fitting rule in their category rows. The older ArticleCard, FeaturedCard, and HorizontalCard preview components also use it when rendered. Detailed question and story views keep their existing tag layout.

Displayed API-backed titles and public user names capitalize their first alphabetic character consistently across cards, readers, lists, and profile surfaces; stored values and URL handles remain unchanged.

## Quick Start

```bash
npm ci
npm run dev
```

Use Node.js 22 or newer. After a production build, run `npm run security:artifacts` to verify that no source maps are present.

The page CSP and hosting `_headers` permit the existing Google Fonts stylesheet from `fonts.googleapis.com` and font files from `fonts.gstatic.com`. Keep both policies aligned when changing font sources.

Open [http://localhost:3000](http://localhost:3000).

Home shows Short reads in groups of up to four using the existing short card and reader. At every width, groups recur after the sixth story and then every eighth story when more shorts are available. ShortCard grids on Home, Shorts, Search, Author, Profile, Writing studio, Collections, Saved, and History fill up to four responsive columns at a 170 px minimum, with two compact columns from 376 to 391 px and one centered, 250 px maximum card below 376 px; See all opens `/shorts`.
Across pages, actions beside page or section headings stay in the right column and align to the heading block's vertical center from the small-screen breakpoint upward; below that breakpoint, the action wraps to a new left-aligned row after the heading content. Heading text wraps within its column. The Home feed tabs stay visible at the top of the content scroll pane, support native touch dragging with gentle snap points, and show an edge fade while more choices remain off-screen. Short-card excerpts fill their remaining space and clamp above the action footer.
Home Writer's picks and Browse categories use the existing grid-style discovery cards in horizontal carousels at every width; category choices also scroll horizontally. Story and category tracks support touch swipes and continuous desktop mouse dragging without snap, hide native scrollbars, and show only a short swipe/drag text cue when content overflows. Home section headings include short descriptions, and inserted sections use tighter vertical spacing. Home feed and section dividers remain visible. Public Author, personal Profile, and Member Hub early releases keep their existing responsive grids. Article covers keep the shared 16:9 ratio; short-card sizing stays separate.
CollectionCard grids on Home, Collections, Library, and Author fill their available width: one column below 600 px, two from 600 px, and three from 1024 px. Home keeps two columns at wider sizes for its two featured collections.
Series cards fill responsive columns across the available page width with a 420 px minimum track, so intermediate and small layouts remain one column instead of compressing the card content. Cards use a compact fixed ratio: 2:1 on narrow screens and 5:2 from 600 px. Each card pairs the series cover or existing fallback with its format/date, part count, title, description, writer identity, and View cue in one linked horizontal composition.
Home Top authors uses one ranked row per column below 540 px, two columns from 540 px, and four from 1024 px; long writer names and counts stay within each row.
Competition Entries uses one column below 540 px, two from 540 px, and three from 1024 px. Article entry covers remain 16:9, while compact short entries stay centered within their grid tracks.

## Browser verification

The Playwright suite starts isolated API and Vite servers by default:

```bash
npm run test:e2e
```

To validate SEO metadata against a deployed public article, provide the deployment origin and a published article path:

```bash
SEO_CRAWL_URL=https://inkrider.example SEO_CRAWL_POST_PATH=/post/<published-id> npm run test:seo
```

The verifier fails when the article route, title, description, canonical URL, Open Graph fields, or Article JSON-LD are missing or inconsistent. It only performs a read-only crawl.

For a faster local rerun against already-warmed services, start the backend on
`127.0.0.1:8000` and the frontend on `127.0.0.1:3000`, configure the backend
`FRONTEND_URL` as `http://127.0.0.1:3000` and the frontend `VITE_API_URL` as
`http://127.0.0.1:8000`, then set `E2E_BASE_URL=http://127.0.0.1:3000` before
running Playwright. The frontend and backend origins must use the same hostname
(`localhost` or `127.0.0.1`) when credentials and CORS are involved. CI does
not use this mode and continues to own its clean server processes.

## Pages

| Route | Page |
|---|---|
| `/` | Home — personalized and editorial discovery |
| `/explore/trending` | Trending stories and filters |
| `/explore/questions` | Reader questions, votes, and Add response modal for attaching a published post or writing a new one |
| `/explore/questions/:id` | Question detail, existing short answers, response choices, follows, reports, and related writing |
| `/opportunities` | Writer opportunity inbox and reader-demand signals; shared Back returns to the previous page or Profile on direct entry |
| `/explore/competitions` | Active and completed competitions |
| `/explore/competitions/:id` | Competition detail, entries, and voting |
| `/search` | Search — posts, writers, shorts, and questions; question categories select the Questions tab |
| `/post/:id` | Article reading with engagement, summary, and read aloud |
| `/author/:handle` | Public writer profile with Published work: Posts/Shorts/Collections pill categories, writing sorting, and paginated public collections sorted newest/most saved |
| `/collections` | Discover and manage collections |
| `/collections/:id` | Collection detail and reading list |
| `/saved` | Library - Saved stories/shorts, My/Saved Collections, and History with existing filters |
| `/shorts` | Short reads |
| `/series` | Story and short series browsing and creation |
| `/series/:id` | Series reading order and owner editing |
| `/shorts/series/:id` | Existing short-series links remain supported |
| `/history` | Private reading history |
| `/members` | Centered guest sign-in prompt or signed-in Member Hub and creator experiences |
| `/membership` | Public membership perks, sign-in, checkout, and membership management |
| `/notifications` | Centered guest sign-in prompt or signed-in inbox below the desktop or mobile notification button; the mobile navbar button beside search opens the native modal near its trigger; direct entries open over Home; each notification can be deleted |
| `/onboarding` | Onboarding interests and follows |
| `/studio?draft=`, `?edit=`, `?new=`, or `?question=` | Existing editor for drafts, post edits, local guest composition, and question responses |
| `/profile` | Profile - public identity, bio, icon-only Edit profile, follower/following information, and Your published writing with Posts/Shorts pills, sorting Filters, and Edit in Writing studio; centered guest sign-in prompt. The phone Account sheet provides account navigation. |
| `/studio` | Guarded Writing studio opening on Analytics, followed by Published (Stories/Shorts), Drafts (Stories/Shorts), and Ideas; basic released-post counts are visible to writers, while detailed performance requires membership; Ideas shows ranked reader questions in compact opportunity rows and links to the full reader-demand feed; Write a post opens the Post/Short chooser; old `/write` and `/writing` URLs redirect here with their queries preserved |
| `/profile/edit` | Signed-in profile editing page with the existing display-name/biography fields, Save, Cancel, and Back |
| `/settings` | Public appearance/language settings and member-only reading-interest settings |
| `/help` | Public guide to reading, writing, community participation, membership, settings, and recovery |

Writing studio owns the draft list. Its Write a post button opens the shared-header Post/Short chooser; selecting a type opens `/studio?new=article|short`, and the editor creates a server draft only after title or story content is entered. Existing draft, edit, guest `?new=`, and question-response editor links remain supported under `/studio`. The editor shows an Editing label above Write Post/Write Short (or Edit Post/Edit Short), a shared Back control, and writing instructions beside Publish/Update. Title and story fields keep a 12 px text inset from the focus edge; loaded multiline titles and blocks grow to fit. Publish/Update stays disabled until title and story have content, then opens a dialog for tags, article cover, an optional short link to a full post (including None), and eligible release time; its final action checks the existing requirements. Disabled buttons show a reason on hover. Block +/× controls are available at all widths, and desktop retains slash formatting. Type is chosen before editing. Autosave retains its existing behavior.

On the full article page, a story's series navigation appears after the article body as one button: Next post in the series, or View the series for the final part. The earlier series panel above the body is removed. Short-read modal progression remains unchanged. On `/series`, Create a series first asks whether to create a Posts or Shorts series and only then loads eligible published writing. A popover multi-select replaces the checkbox list and provides Select all/Clear all while displaying the chosen reading order.

When both formats are returned, the article page's writer recommendations, question detail's published responses, Member Hub early releases, and Trending place posts and short reads in separate titled sections with their existing format-specific cards.

Writers can add a released post or short to one of their existing matching-format series from shared card menus, Writing studio management menus, the full article actions, and the short-reader footer. The picker reports existing membership and full series, and a post must be removed from its current series before it can be assigned to another.

Saved draft rows in Writing studio place icon-only Continue writing and Delete draft actions to the right of the title and saved details at all widths. A confirmation dialog names the draft and explains permanent deletion; failed deletion retains it for retry. Pending requests block repeated deletion and dismissal. Confirmed deletion refreshes the draft list and restores focus to a remaining draft or the selected tab.

Add content is removed. At all widths, the active block has + on the left and × on the right; both align with its first text line. Hovering a row on pointer devices also reveals its controls and a left marker. Blank space in the writing area shows the text cursor and clicking it focuses the nearest title or story input. Below 1024 px, a 24 px gutter on each side keeps the writing column centered while leaving 44 px control targets, and + opens a viewport-bounded insertion sheet with Close/Escape and focus return. On desktop, + opens the anchored insert menu and typing / also opens formatting choices. The Instructions button opens a concise writing guide. Guest Publish opens sign-in in place and preserves entered work; guest reload/navigation still discards local work. Saved drafts/edit links remain gated. Covers upload on publication and are not stored in drafts; Back waits for saves and is disabled while an unuploaded cover is selected.

Restricted pages wait for session restoration, then show guests a centered message specific to the screen and a Sign In button. The login modal opens only after activating the button, and the full route/query/hash is preserved. Notifications uses this page state for guests and an inbox aligned below its navbar trigger; desktop uses an anchored popover and mobile retains a native modal. Edit profile opens `/profile/edit`; Save and Cancel return to the profile with its query preserved. Old profileTab links for posts/drafts/analytics forward to Writing studio; bookmarks/history forward to Library.

The shared API client refreshes an access token shortly before its expiry so simultaneous focus refetches do not send expired credentials. The existing response-side 401 retry remains for unexpected expiry or revocation, and a failed refresh clears the session and opens the sign-in prompt.

On every mobile application page, Collections occupies the fourth bottom-bar position for guests and members. Write is available to guests and members in the Account sheet and desktop sidebar; signed-in notifications are beside navbar search instead of in the Account sheet. Member Hub remains signed-in only in the sidebar.

Theme defaults to the browser/system color preference and follows changes until the visitor explicitly chooses Light or Dark in Settings. That saved choice takes priority on later visits. Choosing Use system theme in Settings clears the override and resumes live system preference updates; browsers without preference detection fall back to dark. Theme and the English-only language option use the shared accessible dropdown. Settings and Help have no page Back control.

## Project Structure

```
src/
├── app/                  # Providers, API client, and application state
├── features/             # Auth, discovery, collections, editor, membership, posts, questions, and users
│   ├── discovery/        # Home, Explore, Search, shorts, and reading history
│   ├── post/             # Article reading, blocks, comments, and AI tools
│   └── ...
├── shared/               # Layout, reusable UI, icons, hooks, and feedback states
├── styles/               # Global CSS and design tokens
├── App.jsx               # React Router setup and route guards
└── main.jsx              # Application entry point
```

## Tech Stack

- **React 18** with hooks
- **React Router v7** for client-side routing
- **Vite** for bundling
- **Inline styles** with a centralized token system (no CSS-in-JS library needed)
- Google Fonts: Libre Baskerville + DM Sans

The frontend uses server-backed API data for primary routes. Keep feature behavior in its feature module, reuse shared components before adding new ones, and keep route filters and tabs in the URL when they need to be shareable.

Save on discovery post/short card menus, article pages, and short readers opens one dialog. Save in your Library is selected by default; Add to a collection can be selected alone or alongside it. Collection choices show Public, Unlisted, or Private badges, with pagination, retry, and creation of a new collection containing the story. Duplicate addition is safe and the short reader stays open underneath. Guests open sign-in from Save. A collection owner can add an eligible published story directly from collection detail beside Save order.

Global search has no category/type-selection buttons. Desktop and mobile autocomplete pause 250 ms after typing, then show up to five complete Search suggestions from public post tags/titles and five Authors. Selecting a phrase opens `/search?q=<phrase>`; selecting an author opens their profile. Enter without a selection searches the exact input. Search-result Filters show only topic and time choices represented in the current unfiltered result set; Writers has no Filters panel. Other list filters use the available data in their current tab or section. Paginated lists reveal additional choices as pages load.
An empty global search shows Trending searches from the Popular feed and six suggested topics on mobile, tablet, and desktop. Selecting either immediately opens results for that text. Clearing a desktop search returns to these prompts. Typed autocomplete retains its existing behavior.
The mobile search dialog keeps the clear and submit targets adjacent and lets its search field follow the dialog width as the visual viewport changes with the on-screen keyboard. Focusing the field does not scroll the dialog unexpectedly.

Desktop Account and signed-in mobile Account list Profile, Library, then Writing studio. The desktop sidebar also links to Writing studio; the separate Write navigation entry is removed. Settings, Membership, and Member Hub retain their existing destinations; mobile Notifications opens from the navbar beside search.

Library has Saved, Collections, and History top tabs in that order. Saved has Stories (articles) and Shorts pill categories, sorting latest saved/most appreciated. Collections switches between My collections and Saved collections with pill controls, retaining visibility and newest/most-saved filters. History separates Stories and Shorts with Saved-style pill tabs, filters reading status, and sorts recently read/oldest first over the API's recent records. Format selection applies to Continue reading and recent history, persists in the URL, and survives filter reset. URL selections survive reload/tab changes; reset preserves the other tab's filters. Headers use Library and Writing studio with explanatory descriptions and the top labels Reading and Publishing respectively.


Story presentation follows the stored format: shorts use ShortCard and the compact ShortReadModal across discovery, collections, saved/history, writer/profile, membership, questions, competitions, and series. The modal keeps one responsive width and height as content changes. On `/shorts`, the reader browses the currently loaded, filtered card list with a 520 ms vertical slide between items; scrolling or swiping at the reading pane's edge, or scrolling over the surrounding overlay outside the modal, moves to the adjacent listed short without leaving the page. Medium/large screens also show Up/Down controls beside the modal. The comments disclosure and appreciation actions stay in its fixed bottom area; expanded comments keep wheel and touch scrolling inside their bounded pane without changing the active short. The reader has no inline Previous/Next or position strip. Canonical `/post/:id` links dispatch to the short reader or existing full article page. Mixed collections show separate Full articles and Short reads sections; curator ordering applies within each format. See [format audit](../context/short-format-audit.md).

Series creation supports moving selected posts or shorts earlier and later before saving. Library includes an owned Series section for story and short series. Post covers and tags are optional at publication.
# Edit-modal deletion

Owners can delete a collection or series from its detail page's edit modal after an inline confirmation. Deleting the container keeps its posts and returns to Collections or Series.

Series detail offers a Share button beside the owner Edit button, using the shared link-copy and Share on X dialog.

The Edit series modal adds eligible writing through the shared dropdown, excluding posts and shorts already present in that series.

The article series footer uses a single next-part navigation row, with a matching series-overview row on the final part.

Article text and the series footer now fill the available post content width.

The short reader footer has Like, Comment, Save, and Share; Comment toggles the inline comments pane, and the former Series footer action is removed.

On article pages, the Add a comment composer opens inside the collapsible Comments section and is hidden when the section is closed.
