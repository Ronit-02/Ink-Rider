# Ink Rider

Editorial platform UI built with React + Vite.

## Quick Start

```bash
npm ci
npm run dev
```

Use Node.js 22 or newer. After a production build, run `npm run security:artifacts` to verify that no source maps are present.

Open [http://localhost:3000](http://localhost:3000).

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
| `/explore/questions` | Reader questions, votes, and answers |
| `/explore/questions/:id` | Question detail, answers, follows, reports, and related writing |
| `/opportunities` | Writer opportunity inbox and reader-demand signals |
| `/explore/competitions` | Active and completed competitions |
| `/explore/competitions/:id` | Competition detail, entries, and voting |
| `/search` | Search — posts, writers, shorts, and questions; question categories select the Questions tab |
| `/post/:id` | Article reading with engagement, summary, and read aloud |
| `/author/:handle` | Public writer profile |
| `/collections` | Discover and manage collections |
| `/collections/:id` | Collection detail and reading list |
| `/saved` | Saved stories and collections library |
| `/shorts` | Short reads |
| `/shorts/series/:id` | Short-read series progression |
| `/history` | Private reading history |
| `/members` | Centered guest sign-in prompt or signed-in Member Hub and creator experiences |
| `/membership` | Public membership perks, sign-in, checkout, and membership management |
| `/notifications` | Centered guest sign-in prompt or signed-in inbox below the desktop notification button; mobile uses the existing modal; direct entries open over Home |
| `/onboarding` | Onboarding interests and follows |
| `/write` | Public writer editor; guest Publish opens sign-in, authenticated drafts autosave and publish |
| `/profile` | Centered guest sign-in prompt or personal profile, history, and account activity; mobile Account navigation opens an account sheet with a public Write link |
| `/profile/edit` | Signed-in profile editing page with the existing display-name/biography fields, Save, Cancel, and Back |
| `/settings` | Public appearance/language settings and member-only reading-interest settings |
| `/help` | Public guide to reading, writing, community participation, membership, settings, and recovery |

New writing is public; guests compose locally and Publish opens the shared sign-in modal. Writing stays in the mounted editor through dismissal or in-place login, then authenticated autosave begins; guest reload/navigation discards local work. Saved-draft and edit links remain sign-in gated.

Restricted pages wait for session restoration, then show guests a centered message specific to the screen and a Sign In button. The login modal opens only after activating the button, and the full route/query/hash is preserved. Notifications uses this page state for guests and an anchored desktop inbox or mobile modal for signed-in accounts. Edit profile opens `/profile/edit`; Save and Cancel return to the profile with its query-selected tab preserved.

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

Global search has no category/type-selection buttons. Desktop and mobile autocomplete pause 250 ms after typing, then show up to five complete Search suggestions from public post tags/titles and five Authors. Selecting a phrase opens `/search?q=<phrase>`; selecting an author opens their profile. Enter without a selection searches the exact input. Search-result tabs and filters retain their existing behavior.
