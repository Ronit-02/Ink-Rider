# Ink-Rider build plan

Last updated: 2026-08-23

## Implementation snapshot

Phases 0–6 now have working vertical slices. Phase 5 is complete against its current acceptance criteria; the other phases remain in hardening because database integration, browser E2E, accessibility/security audits, provider activation, or operational edge cases are still open. The canonical live status is [progress-tracker.md](progress-tracker.md).

Current execution order:

1. Questions and community interaction as a separate product surface.
2. Publishing and writer experience hardening.
3. Competitions and community judging hardening.
4. Monetization and premium experiences only after the core community loop is reliable.

The existing P0 release gates remain continuous work across these phases: database-backed verification, browser coverage, security, accessibility, provider activation, and production observability.

## Planning rules

- Build a reliable vertical slice before expanding horizontally.
- Each phase ends with demonstrable user behavior and automated acceptance checks.
- Do not present local state or mock data as a completed feature.
- Do not start ML recommendations, payments, or AI generation before their required data and safety foundations exist.
- Repair data contracts before polishing screens that depend on them.
- Preserve the current stack and migrate incrementally.

## Confirmed product direction — 2026-08-23

- Ink-Rider is a responsive web community for curious readers and aspiring writers.
- The core loop is: discover thoughtful writing, read, save or follow, discuss, publish, participate, and return.
- Every account can read, write, comment, ask, vote, and participate; there is no progressive-role system.
- Questions are a separate community surface and are not conceptually attached to stories.
- Home combines editorial curation with personalized discovery; quality and diversity are more important than raw engagement.
- Publishing is open to signed-in users, with curation, reporting, moderation, explanations, and appeals.
- Competitions are open to community participation and judging, with fraud and moderation safeguards added as operational maturity improves.
- Saved stories are private by default; public collections are opt-in.
- The product is moderate and community-oriented rather than an aggressive social feed.
- Phone and desktop support the same core capabilities through responsive web UI; native-only features are deferred.
- Monetization follows reader retention and community health rather than leading the product.

## Completed implementation phase — Responsive reading and discovery hardening

This phase is complete. Its acceptance criteria are covered by the responsive route matrix and the full browser verification run.

### Acceptance criteria

- Home, Explore, Search, article reading, Saved, and profile discovery work cleanly at phone and desktop widths.
- Curated sections and personalized results have a clear hierarchy without turning Home into a dashboard.
- Story actions, saves, follows, comments, filters, loading, empty, error, and unauthorized states are consistent across responsive surfaces.
- Discovery preserves author/topic diversity and gives readers meaningful control over recommendations.
- Keyboard, screen-reader, reduced-motion, and performance checks are recorded for the responsive reading path.
- The browser critical flow is added to automated verification where the current test harness supports it.

### Following phases

1. Questions and community: independent question feed, answers, upvotes, follows, reports, moderation, and notifications.
2. Publishing and writer experience: open publishing, writer profiles, feedback, creator updates, and opportunity surfaces.
3. Competitions and judging: open submissions, community voting, results, recognition, fraud controls, and appeals.
4. Monetization: membership, creator support, workshops, early access, summaries, audio, and advanced analytics.

## Phase 0 — Baseline and contract repair

Goal: make the repository safe to change and remove contradictions in the existing backend.

### Deliverables

- Add root developer setup, environment examples, and health checks.
- Establish formatting, linting, unit tests, API integration tests, and CI.
- Define normalized API success and error envelopes.
- Replace `req.user.id`/`req.user._id` ambiguity with `req.auth.userId`.
- Reconcile User, Profile, Post, Follow, Save, Reaction, and Comment models.
- Add required unique, sparse, and compound indexes.
- Add input validation and centralized error handling.
- Repair collection detail and missing/durable author routes.
- Remove unsafe logging and confirm refresh-cookie behavior by environment.
- Create repeatable seed data for local development and tests.
- Document migration and rollback procedures.

### Exit criteria

- All existing backend routes have contract tests.
- Authorization tests prove users cannot mutate another user's resources.
- The frontend and backend start from documented commands.
- Production builds pass without source errors.
- No primary schema field is referenced only by controllers or only by models.

## Phase 1 — Complete publishing and reading loop

Goal: a writer can publish durable content and a reader can engage with it.

### Writer work

- Persistent drafts with autosave and conflict/version handling
- Title, cover, tags/topics, blocks, preview, publish, edit, unpublish
- Stable public post URLs and writer handles
- Image metadata and cleanup
- Draft and publication validation
- Simple post-management screen

### Reader work

- Server-backed article page
- Structured block rendering with sanitization
- Qualified views, reading progress, completion
- Save, reaction, comment, follow, share tracking, report
- Loading, empty, unauthorized, deleted, and error states
- Article metadata, canonical URL, Open Graph data, and structured data

### Exit criteria

- One browser-level test covers signup → draft → publish → read → save → comment → reload.
- No article interaction depends on mock data.
- Published revisions render consistently after edits.
- Core reading and writing flows meet accessibility acceptance checks.

## Phase 2 — Discovery, search, and onboarding

Goal: replace demo discovery with useful server-backed content discovery.

### Deliverables

- Persist onboarding interests and initial follows.
- Implement canonical topics and tag mapping.
- Build server-backed Home, Trending, Latest, and Past 24 hours feeds.
- Add unified search for posts, writers, questions, and collections.
- Add cursor pagination and stable filters.
- Record impressions, opens, reading depth, completion, saves, follows, hides, and reports.
- Add “Why am I seeing this?” and “Not interested” controls.
- Ensure diversity constraints across author and topic repetition.

### Initial ranking approach

Use a deterministic weighted ranker based on freshness, topic affinity, follow relationships, quality signals, and exploration. Log rank inputs and reasons. Do not begin with an opaque ML model.

### Exit criteria

- Primary discovery pages contain no local article datasets.
- Every ranked item carries a recommendation request ID and reason.
- Offline fixtures and online metrics can reproduce ranking behavior.
- Readers can deliberately tune or reset inferred interests.

## Phase 3 — Reader demand and writer opportunities

Goal: deliver Ink-Rider's central product differentiator.

### Deliverables

- Ask-question flow with lexical and semantic duplicate suggestions
- Confirm-new-question path for low-confidence matches
- Question votes, topics, target writers, status, and moderation
- Writer opportunity inbox ranked by fit, demand, and freshness
- Claim, answer, decline, and publish-from-question workflows
- Notify question participants when answers or moderation outcomes change
- Question detail page with answers and related writing
- Demand analytics for writers and staff

### Exit criteria

- Duplicate detection prevents obvious fragmentation without forced incorrect merges.
- A reader request can become a linked published post end to end.
- Writers can control which direct requests they accept.
- Abuse limits and report controls cover questions and answers.

## Phase 4 — Competitions and creator growth

Goal: create a fair, recurring route to discovery for writers.

### Deliverables

- Competition administration, rules, eligibility, schedules, and judging modes
- Submission using immutable post revisions
- Reader voting with fraud and eligibility controls
- Judge scoring and tie handling
- Results publication, finalist/winner badges, and bounded promotion
- Theme-based, timed, collaborative, and reader-choice configurations
- Competition notifications and audit history

### Exit criteria

- Competition state transitions are enforced by server time.
- Votes and judge results are reproducible and auditable.
- Promotion has explicit duration and does not permanently distort recommendations.
- Staff can resolve disqualifications and appeals without editing database records manually.

## Phase 5 — Collections, shorts, and richer learning

Goal: help readers organize knowledge and consume it at different depths.

### Deliverables

- Persistent personal and public collections with ordered items
- Save/share/follow collection behavior
- Article and short-form content types with explicit presentation rules
- Short series and progression between entries
- Reading history and continue-reading
- Writer-curated learning paths

### Exit criteria

- Shorts are a real content format, not filtered mock articles.
- Collection reordering is durable and accessible by keyboard.
- Readers can move between summary, short, and long-form depth without losing context.

## Phase 6 — Membership, creator support, AI, and audio

Goal: add sustainable premium value without locking primary knowledge.

### Foundations

- Finalize platform membership versus creator-support policy.
- Implement server-side entitlements.
- Add verified, idempotent payment webhooks and billing recovery.
- Define data retention, model/provider policy, and human-readable AI disclosures.

### Premium experiences

- Generated article summaries with source revision and regeneration state
- Text-to-speech audio with progress and accessible transcript controls
- Early-release scheduling
- Workshops and attendance entitlements
- Behind-the-scenes creator posts
- Direct creator requests with limits and abuse controls
- Advanced writer analytics

### Exit criteria

- Every premium surface checks a named server-side entitlement.
- Primary published articles remain publicly readable.
- AI output is traceable to a source revision and can be corrected or removed.
- Payment and AI provider outages degrade gracefully.

## Continuous workstreams

These are required throughout every phase:

- Accessibility and responsive behavior
- Moderation and privacy review
- Observability, error monitoring, and performance budgets
- Database indexes and query profiling
- Documentation and progress tracking
- Content design and realistic seed fixtures
- Security review of authentication, uploads, rich content, and external callbacks

## Definition of done for a feature

A feature is complete only when:

- Product behavior and non-goals are documented.
- Persistent data and authorization rules are defined.
- Success, loading, empty, error, and permission states exist.
- Keyboard, screen-reader, mobile, and reduced-motion behavior is considered.
- Unit or integration tests cover domain rules.
- A browser-level test covers the critical path when appropriate.
- Analytics events and privacy implications are reviewed.
- Logs and operational diagnostics are sufficient.
- Documentation and [progress-tracker.md](progress-tracker.md) are updated.

## Original first implementation slice — completed

The project began with Phase 0 and the smallest Phase 1 vertical slice:

1. Normalize authenticated identity and core schemas.
2. Add seeded users and posts.
3. Replace mock article IDs with Mongo-backed posts.
4. Implement durable writer handles and article slugs.
5. Complete save, reaction, comment, follow, and report behavior.
6. Connect one simple Home feed to real posts.
7. Verify the flow with integration and browser-level tests.

This slice is complete and unlocked the later product systems. Future work should follow the current execution order above rather than restarting this sequence.
