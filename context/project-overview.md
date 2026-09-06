# Ink-Rider project overview

Last updated: 2026-08-24

## Product definition

Ink-Rider is a responsive writing community for curious readers and aspiring writers. Readers discover thoughtful writing, ask questions, connect with creators, discuss ideas, vote in competitions, and help judge work. Writers publish articles and short reads, show their talent, respond to people, participate in competitions, and gain recognition.

Ink-Rider is not intended to be a generic blogging CMS or a clone of any single publishing platform. Its core loop is:

1. People discover thoughtful writing through curated and personalized surfaces.
2. They save, follow, comment, ask questions, and participate in the community.
3. Anyone can publish, respond to readers, enter competitions, and judge work.
4. Reader behavior improves discovery while preserving quality, diversity, and writer visibility.
5. Membership and creator support come later, without placing primary articles behind a paywall.

The current product priority is a calm, editorial reading experience with moderate community depth. Ink-Rider should feel like more than a place to read, but it must not become a generic social feed or an unfocused collection of every possible creator feature.

## Problems the product solves

### Writers do not know what to write

Readers can ask for explanations or articles. Duplicate requests should increase demand on the existing question instead of fragmenting it. Writers get a ranked opportunity inbox based on topic relevance, audience demand, and freshness.

### New writers struggle to earn distribution

Ink-Rider creates additional paths to visibility through weekly competitions, themed prompts, reader-choice awards, collaboration, and deliberately diverse recommendations. Existing follower count must not be the only route to reach.

### Discovery feeds become repetitive popularity contests

The feed should balance relevance, freshness, quality, diversity, exploration, and explicit reader controls. Popular, Latest, and Past 24 hours are feed modes, not the complete recommendation strategy.

### Readers cannot quickly judge whether an article is useful

Articles can expose a short abstract, reading time, table of contents, and optional generated summary. Short-form series provide a separate fast-learning format without replacing the full article.

### Engagement signals can reward low-quality or toxic content

Ranking must use more than likes. Completion, saves, meaningful responses, follows after reading, reports, originality, and diversity all contribute. Readers can report spam, abuse, plagiarism, or harmful material.

### Paywalls interrupt discovery

Primary articles remain publicly readable. Membership pays for supporting creators and accessing extras such as early releases, workshops, behind-the-scenes material, audio, summaries, and direct creator interactions.

## Product principles

- Reader demand should produce useful writing opportunities.
- Primary knowledge stays accessible without an article paywall.
- Distribution should reward relevance and reader value, not only audience size.
- Recommendations should be explainable and controllable.
- Writers own their voice, formatting, and audience relationship.
- Reader privacy is not a monetization surface.
- Premium features enhance the experience; they do not degrade the free reading experience.
- Trust, moderation, accessibility, and performance are product features.

## Target users

### Emerging writer

Wants ideas, feedback, an audience, fair distribution, and a low-friction publishing workflow.

### Established writer or educator

Wants customizable publishing, direct audience demand, collections, analytics, workshops, and optional supporter experiences.

### Curious reader

Wants trustworthy discovery across topics, strong search, saved reading, concise previews, and control over recommendations.

### Time-constrained learner

Wants summaries, short series, audio, collections, and a path from quick understanding to deeper reading.

### Community participant

Wants to ask questions, vote, comment, join competitions, and influence what gets written next.

## Product surfaces and pages

Status meanings:

- **Connected:** uses persistent backend data for its primary job.
- **Partial:** some behavior is connected, but important states remain local or mocked.
- **Prototype:** primarily static data or temporary client state.
- **Planned:** not meaningfully represented yet.

| Surface | Route | Current status | Target responsibility |
|---|---|---:|---|
| Home | `/` | Connected | Server-backed discovery feed plus article of the day, categories, writer picks, competition winner, collections, hot questions, and top authors |
| Explore trending | `/explore/trending` | Connected | Ranked, filterable discovery with explainable feed modes |
| Explore questions | `/explore/questions` | Connected | Independent question discovery, deduplication, voting, answering, and article requests |
| Question detail | `/explore/questions/:id` | Connected | Question context, short answers, follows, reports, and related published writing |
| Writer opportunities | `/opportunities` | Connected | Authenticated opportunity inbox ranked by topic fit, reader demand, and freshness |
| Explore competitions | `/explore/competitions` | Partial | Browse active and completed contests; staff and operational edge cases remain |
| Competition detail | `/explore/competitions/:id` | Partial | Rules, deadlines, entries, voting, judging, results, disqualification, and appeals |
| Search | `/search` | Connected | Unified server search across posts, writers, and shorts with URL-persisted filters |
| Article | `/post/:id` | Partial | Public reading, engagement, context, recommendations, summary, audio, and reports |
| Public writer profile | `/author/:handle` | Connected | Durable writer identity, published posts, follow state, creator support, and labelled direct-request controls; `/author` provides a writer-search recovery path |
| Collections | `/collections` | Connected | Browse, save, create, and manage curated reading sets |
| Collection detail | `/collections/:id` | Connected | Read, save, share, and manage a collection |
| Saved library | `/saved` | Connected | Private saved stories and saved public/unlisted collections |
| Writer/editor | `/write` and later `/write/:draftId` | Partial | Autosaved block editor, preview, validation, drafts, scheduling, and publication |
| Personal profile | `/profile` | Connected | Account, posts, bookmarks, history, following, interests, and analytics |
| Onboarding | `/onboarding` | Connected | Persist interests, initial follows, goals, and consent preferences |
| Authentication | `/login`, `/signup` | Connected | Account creation, verification, recovery, and session management |
| Settings | `/settings` | Connected | Account and appearance settings, with provider-dependent options isolated |
| Notifications | `/notifications` | Connected | Responses, requests, follows, competition events, and creator updates |
| Membership | `/membership` | Connected | Platform membership and creator-support management |
| Moderation | Internal/admin | Planned | Reports, review queues, appeals, enforcement, and audit history |

## Navigation model

### Global navigation

- Home
- Explore
  - For you
  - Trending
  - Latest
  - Questions
  - Competitions
- Search
- Collections
- Saved
- Write
- Notifications
- Profile menu

Desktop may use a compact side rail plus a global top bar. Mobile uses a bottom bar for Home, Explore, Search, Write, and Profile, with secondary destinations available from menus.

Every detail page must provide a stable parent path or back destination. Navigation must never depend solely on browser history.

## Core user flows

### Reader discovery flow

1. Reader lands on Home or Explore.
2. Feed records an impression when an item is actually visible.
3. Reader opens an article or short.
4. The product records reading depth, completion, and intentional actions.
5. Reader can save, follow, respond, share, report, or tune future recommendations.
6. The next feed uses those signals while preserving topic and author diversity.

### Reader request flow

1. Reader opens the independent Questions surface.
2. The system searches semantically and lexically for existing questions.
3. Reader upvotes an existing question or confirms a genuinely new one.
4. Writers can discover questions as community demand, without questions being structurally attached to stories.
5. Writers answer questions through the question flow or publish independently.
6. Participants receive notifications for answers, votes, follows, and moderation outcomes.

### Writer publishing flow

1. Writer starts from an idea, question, competition, or blank draft.
2. Draft autosaves title, cover, blocks, tags, metadata, and revision state.
3. Writer previews and validates the article.
4. Writer publishes immediately or schedules a release.
5. The post enters eligible discovery surfaces.
6. Writer sees performance, audience quality, and actionable feedback.

### Competition flow

1. Reader or writer discovers an open competition.
2. Writer reviews rules and submits an eligible owned post.
3. Staff, judges, and/or readers evaluate entries according to the contest mode.
4. Results lock at a defined time and winners receive durable recognition.
5. Winning and finalist work receives bounded promotion rather than permanent ranking privilege.

### Membership flow

1. Reader sees a clearly labeled benefit or creator-support prompt.
2. Reader purchases platform membership or supports an eligible writer.
3. Entitlements are resolved on the server.
4. Primary articles remain public; extras respect entitlement checks.
5. Cancellation changes future renewal without silently removing already paid access.

## Data architecture overview

The system owns four categories of data:

- **Identity:** users, profiles, roles, sessions, follows, preferences, blocks.
- **Content:** posts, post revisions, blocks, tags, shorts, collections, questions, answers.
- **Community:** comments, reactions, saves, reports, competition entries, subscriptions.
- **Discovery:** impressions, reads, completion, hides, topic affinities, rankings, experiments.

MongoDB is the current transactional datastore. Media is stored through Cloudinary. The frontend consumes the backend through versioned JSON APIs. Derived counters may be cached, but source event or relationship records remain authoritative.

See [architecture.md](architecture.md) for system boundaries, schemas, data flow, and invariants.

## Features in scope

### MVP foundation

- Authentication, verification, sessions, and profile basics
- Public writer identities with durable handles
- Draft creation, autosave, preview, publish, edit, and unpublish
- Long-form article reading
- Tags and topic taxonomy
- Server-backed Home, Explore, and Search
- Likes or appreciations, saves, comments, follows, shares, and reports
- Independent reader questions, duplicate detection, upvotes, answers, and moderation
- Basic writer analytics
- Moderation queue and enforcement primitives
- Event capture required for recommendations
- Accessible responsive UI, SEO metadata, loading states, and error states

### Growth scope after the core loop

- Explainable personalized recommendations
- Competitions and reader-choice voting
- Collections and collaborative collections
- Short-form posts and learning series
- Notifications
- Platform membership and creator support
- Early access, workshops, behind-the-scenes content, and direct requests
- Generated summaries and article audio
- Advanced writer analytics and experimentation

## Features out of scope for the initial build

- Native mobile applications; responsive web phone support is required now
- Real-time collaborative document editing
- General-purpose Notion replacement
- Full video hosting or YouTube-style creator tooling
- Advertising marketplace or sale of behavioral data
- Cryptocurrency, tokens, or speculative creator economies
- Complex machine-learning recommendation infrastructure before sufficient event data exists
- Multi-region active-active infrastructure
- Enterprise publication/team administration
- Arbitrary third-party embeds without a security and privacy review

“Out of scope” means deferred, not permanently rejected. A feature enters scope only through an updated build plan and explicit acceptance criteria.

## Success criteria

### MVP release gates

- A new user can sign up, verify, onboard, publish, and reload without losing state.
- A reader can discover, open, save, follow, comment, report, and later find the same persisted state.
- A reader question can be deduplicated, upvoted, answered, followed, and moderated as an independent community item.
- No primary route depends on mock data.
- Authorization tests cover every write endpoint.
- Core flows meet WCAG 2.2 AA keyboard and contrast expectations.
- Public article pages include correct canonical, Open Graph, and structured metadata.
- Operational logs do not contain passwords, tokens, OTPs, or private article content.

### Product health metrics

- Reader activation: completes one meaningful read and one intent signal within the first session.
- Writer activation: saves a draft and publishes or responds to a request within seven days.
- Demand fulfillment rate: percentage of qualified questions receiving a useful answer or response.
- Discovery quality: long-read completion, saves per impression, hides, reports, and author diversity.
- Writer opportunity fairness: distribution of qualified impressions across new and established writers.
- Retention: weekly returning readers and monthly returning writers.
- Trust: report rate, confirmed violation rate, appeal rate, and moderation response time.
- Performance: Core Web Vitals and API latency budgets defined per release phase.

Raw likes, page views, and account registrations are diagnostic metrics, not standalone definitions of success.

