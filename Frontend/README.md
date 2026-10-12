# Ink Rider

Editorial platform UI built with React + Vite.

## Quick Start

```bash
npm ci
npm run dev
```

Use Node.js 22 or newer. After a production build, run `npm run security:artifacts` to verify that no source maps are present.

Open [http://localhost:3000](http://localhost:3000).

Home inserts a horizontally scrollable shelf of up to four latest Short reads after the eighth story when shorts are available. Each item uses the existing short card and reader; See all opens `/shorts`.

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
| `/opportunities` | Writer opportunity inbox and reader-demand signals |
| `/explore/competitions` | Active and completed competitions |
| `/explore/competitions/:id` | Competition detail, entries, and voting |
| `/search` | Search — posts, writers, shorts, and questions; question categories select the Questions tab |
| `/post/:id` | Article reading with engagement, summary, and read aloud |
| `/author/:handle` | Public writer profile with Published work: Posts/Shorts/Collections pill categories, writing sorting, and paginated public collections sorted newest/most saved |
| `/collections` | Discover and manage collections |
| `/collections/:id` | Collection detail and reading list |
| `/saved` | Library - Saved stories/shorts, History, and owned/saved Collections with existing filters |
| `/shorts` | Short reads |
| `/shorts/series/:id` | Short-read series progression |
| `/history` | Private reading history |
| `/members` | Centered guest sign-in prompt or signed-in Member Hub and creator experiences |
| `/membership` | Public membership perks, sign-in, checkout, and membership management |
| `/notifications` | Centered guest sign-in prompt or signed-in inbox below the desktop notification button; mobile uses the existing modal; direct entries open over Home; each notification can be deleted |
| `/onboarding` | Onboarding interests and follows |
| `/write` | Draft list and Write new Post/Short chooser; saved drafts open with `?draft=`, guests compose locally with `?new=` |
| `/profile` | Profile - public identity, bio, editing, follower/following information, and Your published writing with Posts/Shorts pills, sorting Filters, and Edit in Writing studio; centered guest sign-in prompt |
| `/writing` | Writing studio - guarded Stories, Shorts, Drafts, and Analytics tabs; Shorts use the shared card grid with studio Edit/Unpublish/Delete actions; post status filters include Scheduled |
| `/profile/edit` | Signed-in profile editing page with the existing display-name/biography fields, Save, Cancel, and Back |
| `/settings` | Public appearance/language settings and member-only reading-interest settings |
| `/help` | Public guide to reading, writing, community participation, membership, settings, and recovery |

Write opens the saved-draft list with Write new at the top right. The shared-header modal asks Post or Short; signed-in selection creates the typed draft immediately, while guests start local composition. Existing `draft`, `edit`, and question-response links remain supported. Posts stack a full-width cover placeholder, tags, title, and body; Shorts omit the cover. Type is chosen before editing. Optional depth/release settings remain in Publishing options; autosave, Publish/Update, validation, tags, and slash shortcuts retain their existing behavior.

Saved draft rows in Write and Writing studio have Delete draft beside the continuation link. A confirmation dialog names the draft and explains permanent deletion; failed deletion retains it for retry. Pending requests block repeated deletion and dismissal. Confirmed deletion refreshes the shared draft list and restores focus to a remaining draft or the empty-list heading/tab.

Add content is removed. Desktop per-block +/× appear on hover or keyboard focus; + opens the existing typed insertion menu. Below 640 px, the active block exposes a compact toolbar for insertion, block type, and deletion. Insertion/type choices open a viewport-bounded native bottom sheet with Close/Escape and focus return. Guest Publish opens sign-in in place and preserves entered work; guest reload/navigation still discards local work. Saved drafts/edit links remain gated. Covers upload on publication and are not stored in drafts; the editor's Drafts button waits for saves and is disabled while an unuploaded cover is selected.

Restricted pages wait for session restoration, then show guests a centered message specific to the screen and a Sign In button. The login modal opens only after activating the button, and the full route/query/hash is preserved. Notifications uses this page state for guests and an anchored desktop inbox or mobile modal for signed-in accounts. Edit profile opens `/profile/edit`; Save and Cancel return to the profile with its query preserved. Old profileTab links for posts/drafts/analytics forward to Writing studio; bookmarks/history forward to Library.

On every mobile application page, Collections occupies the fourth bottom-bar position for guests and members. Write is available to guests and members in the Account sheet and desktop sidebar; Member Hub remains signed-in only in the sidebar.

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

Global search has no category/type-selection buttons. Desktop and mobile autocomplete pause 250 ms after typing, then show up to five complete Search suggestions from public post tags/titles and five Authors. Selecting a phrase opens `/search?q=<phrase>`; selecting an author opens their profile. Enter without a selection searches the exact input. Search-result tabs and filters retain their existing behavior.

Desktop Account and signed-in mobile Account list Profile, Library, then Writing studio. Write remains the separate public editor entry. Settings, Notifications, Membership, and Member Hub retain their existing destinations.

Library has Saved, History, and Collections top tabs. Saved has Stories (articles) and Shorts pill categories, sorting latest saved/most appreciated. Collections lists My collections and Saved collections with visibility and newest/most-saved filters. History separates Stories and Shorts with Saved-style pill tabs, filters reading status, and sorts recently read/oldest first over the API's recent records. Format selection applies to Continue reading and recent history, persists in the URL, and survives filter reset. URL selections survive reload/tab changes; reset preserves the other tab's filters. Headers use Library and Writing studio with explanatory descriptions and the top labels Reading and Publishing respectively.


Story presentation follows the stored format: shorts use ShortCard and the compact ShortReadModal across discovery, collections, saved/history, writer/profile, membership, questions, competitions, and series. Canonical `/post/:id` links dispatch to the short reader or existing full article page. Mixed collections show separate Full articles and Short reads sections; curator ordering applies within each format. See [format audit](../context/short-format-audit.md).
