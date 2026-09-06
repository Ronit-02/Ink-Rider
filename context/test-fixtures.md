# Development test fixtures

The development seed creates a connected, repeatable dataset for exercising Ink-Rider without adding fallback mock logic to the application. All records live in the configured development database and travel through the same API, authorization, and rendering paths as user-created data.

## Load or refresh the fixtures

From `Backend/`:

```bash
npm run seed:dev
```

The command is safe to rerun: stable natural keys are upserted, derived counters are reconciled, and the fixture set is verified before the process exits. It refuses to run when `NODE_ENV=production`.

The default password is `InkRiderDemo123!`. Override it for your local environment with `SEED_PASSWORD` before running the command.

## Demo accounts

| Account | Persona and useful states |
|---|---|
| `maya@inkrider.local` | Active writer with articles, shorts, a short series, drafts, followers, competition entries, analytics, and creator updates |
| `arjun@inkrider.local` | Technology writer with published and unpublished content, a competition entry, direct requests, and moderation-related content |
| `leila@inkrider.local` | Writer with active membership, scheduled early-access content, workshop ownership, summaries, and AI quota usage |
| `noah@inkrider.local` | Free reader with interests, follows, engagement, reading history, questions, reports, notifications, and a promotional summary entitlement |
| `member@inkrider.local` | Active paid-member state with early access, workshop registrations, creator support allocations, collections, requests, and notifications |
| `moderator@inkrider.local` | Moderator role with access to the report review queue and existing moderation decisions |
| `admin@inkrider.local` | Administrator role with staff access, competition controls, judge-scoring scenarios, and audit records |

## Feature coverage map

| Area | Seeded scenarios | Best account and route |
|---|---|---|
| Home and discovery | Latest, popular, last 24 hours, personalized interests, varied authors/topics, and interaction signals | Anonymous or Noah at `/` and `/explore/trending` |
| Search and profiles | Searchable articles, shorts, questions, writer handles, biographies, follower relationships | Any account at `/search`; `/author/maya-sen`, `/author/arjun-rao`, `/author/leila-noor` |
| Reader engagement | Existing likes, saves, comments, follows, shares/views/completions, and reports | Noah or Priya on any seeded `/post/:id` |
| Drafting and publishing | New draft, edited draft, short draft, published revisions, unpublished post, and source-question linkage | Maya or Arjun at `/write` and `/profile` |
| Rich article blocks | Headings, paragraphs, quotes, code, lists, dividers, and images with alt text | Open the walkable-city and recommendation-system articles from Home |
| Questions | Open and answered questions, duplicate-normalized text, upvotes, tags, and linked published answers | Noah, Priya, or a writer at `/explore/questions` |
| Competitions | Open, judging, and closed contests; theme/timed/reader-choice types; entries, votes, judge scores, winners, and audit history | Reader at `/explore/competitions`; admin for judging and results |
| Collections and saves | Public, private, and collaborative-style collections with ordered items and saved posts | Priya or Noah at `/collections` |
| Shorts and series | Standalone short plus a two-part ordered series with depth links | Any account at `/shorts` |
| Reading history | Multiple post views with different recency, progress, and completion levels | Noah or Priya at `/history` |
| Notifications | Unread/read question, competition, creator, workshop, and system-style notification states | Priya, Noah, or Maya at `/notifications` |
| Membership | Free, promotional, and active member entitlements; scheduled cancellation; renewal dates | Priya, Leila, and Noah at `/members` |
| Early access | Future-publication article visible to entitled members and its owner, hidden from ordinary readers | Priya/Leila versus Noah at `/members` |
| Summaries and audio | Revision-bound generated summaries and entitled/non-entitled access states; browser speech uses the article body | Priya, Leila, or promo-enabled Noah on seeded articles |
| Workshops | Upcoming member workshop, past workshop, registrations, attendance, and capacity | Priya or Leila at `/members` |
| Creator experiences | Member-only/public creator updates, direct requests in multiple states, and creator-support allocation | Priya as reader; Maya/Arjun/Leila as writers at `/members` |
| Analytics | Views, starts, completions, shares, recommendation surfaces, likes, saves, and comments | Maya, Arjun, or Leila at `/profile` |
| AI assistance | Existing monthly usage/quota state without storing private prompt or draft contents | Leila at `/write`; live generation still requires `OPENAI_API_KEY` |
| Moderation | Pending, reviewing, and dismissed reports across post/comment/question subjects plus append-only staff actions | Moderator or admin at `/staff` |
| Billing lifecycle | Active membership and processed-provider-event records without charging a real payment method | Priya/Leila at `/members`; live checkout requires Stripe test credentials |

## Expected fixture totals

The seed verifies at least 7 demo users, 7 profiles, 9 posts, 3 drafts, 4 questions, 3 collections, 1 short series, 3 competitions, 2 memberships, 2 workshops, 3 creator updates, 3 creator requests, 4 notifications, 3 reports, and 8 interaction events.

Some supporting models contain additional records: topics, post revisions, comments, likes, saves, follows, interests, entitlements, summaries, competition audits, workshop attendance, creator support, provider events, moderation actions, and AI usage.

## Intentional boundaries

Notification delivery jobs can be processed locally with `npm run process:notification-deliveries` from `Backend/`. The command requires the configured MongoDB connection and only sends queued provider deliveries; in-app notifications remain available without provider credentials.

- Stripe checkout, portal, and webhook delivery require Stripe test-mode credentials. Seeded membership and provider-event records allow the surrounding UI to be tested without a charge.
- Live AI suggestions require an OpenAI key. Seeded usage data exercises quota and analytics states without fabricating an API response.
- Email delivery and Cloudinary uploads require their provider credentials. Existing image URLs and in-app notifications cover the corresponding rendered states.
- Staff fixtures exercise report review and non-destructive recommendations. Content removal and account suspension remain disabled until a moderation policy is explicitly approved.

