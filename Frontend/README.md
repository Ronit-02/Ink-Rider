# Ink Rider

Editorial platform UI built with React + Vite.

## Quick Start

```bash
npm install
npm run dev
```

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
| `/search` | Search — posts, writers, and shorts |
| `/post/:id` | Article reading with engagement, summary, and read aloud |
| `/author/:handle` | Public writer profile |
| `/collections` | Discover and manage collections |
| `/collections/:id` | Collection detail and reading list |
| `/saved` | Saved stories and collections library |
| `/shorts` | Short reads |
| `/shorts/series/:id` | Short-read series progression |
| `/history` | Private reading history |
| `/members` | Member Hub and creator experiences |
| `/notifications` | Notifications and unread activity |
| `/onboarding` | Onboarding interests and follows |
| `/write` | Writer editor and publishing |
| `/profile` | Personal profile, history, and account activity |
| `/settings` | Account and appearance settings |

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
- **React Router v6** for client-side routing
- **Vite** for bundling
- **Inline styles** with a centralized token system (no CSS-in-JS library needed)
- Google Fonts: Libre Baskerville + DM Sans

The frontend uses server-backed API data for primary routes. Keep feature behavior in its feature module, reuse shared components before adding new ones, and keep route filters and tabs in the URL when they need to be shareable.
