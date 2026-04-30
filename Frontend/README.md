# Ink Rider

Editorial platform UI built with React + Vite.

## Quick Start

```bash
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

## Pages

| Route | Page |
|---|---|
| `/` | Home — Article of Day, Top Recommendations, Browse Categories, Browse Collections |
| `/explore` | Explore — Trending, Questions, Competitions |
| `/search` | Search — Posts, Authors, Shorts |
| `/post/:id` | Post Detail — with AI Summary & Read Aloud |
| `/artist` | Artist Profile — public / subscriber view |
| `/onboarding` | 3-step onboarding flow |
| `/write` | Write editor |

## Project Structure

```
src/
├── components/
│   ├── article/          # FeaturedCard, CompactCard, ArticleCard, HorizontalCard
│   ├── layout/           # Navbar, AppLayout
│   └── ui/               # Avatar, Button, Pill, Tag, Divider, ImageBox, AuthorMeta, SectionHeading
├── data/                 # articles, authors, categories, collections
├── hooks/
│   └── useAuth.jsx       # Auth context + signIn / signUp / completeOnboarding
├── pages/
│   ├── Artist/
│   ├── Explore/          # TrendingTab, QuestionsTab, CompetitionsTab
│   ├── Home/             # HeroSection, CategoriesSection, CollectionsSection
│   ├── Onboarding/       # StepInterests, StepFollow, StepFeatures
│   ├── Post/             # PostBody, AuthorBio, AIPanel
│   ├── Search/           # AuthorsTab, ShortsTab
│   └── Write/
├── styles/
│   ├── global.css        # Reset, scrollbar, utility classes
│   └── tokens.js         # Colors, fonts, spacing, radius, transitions
├── App.jsx               # React Router setup
└── main.jsx              # Entry point
```

## Tech Stack

- **React 18** with hooks
- **React Router v6** for client-side routing
- **Vite** for bundling
- **Inline styles** with a centralized token system (no CSS-in-JS library needed)
- Google Fonts: Libre Baskerville + DM Sans
