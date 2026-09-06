# Ink-Rider architecture

Last updated: 2026-08-25

## Architectural stance

Ink-Rider should remain a modular monolith until real scale or team boundaries justify independent services. The frontend, API, database, media provider, email provider, and future external AI/payment providers are separate runtime boundaries, but product logic should not be fragmented prematurely.

The architecture must optimize for:

- Correct ownership and authorization
- Durable content and engagement data
- Clear separation between source records and derived counters
- Replaceable third-party providers
- Observable background work
- Safe incremental migration from the current JavaScript codebase

## Current architecture

```text
React/Vite client
  ├─ React Router
  ├─ Redux authentication state
  ├─ TanStack Query for server state and mutations
  ├─ Lazy route chunks and capability-aware UI
  └─ Feature modules for discovery, authoring, community, membership, and staff
          │
          │ HTTPS JSON + multipart forms
          ▼
Express API
  ├─ JWT access token middleware
  ├─ Refresh token cookie + Session records
  ├─ Mongoose models and controllers
  ├─ Shared post-access, entitlement, notification, ranking, summary, transaction, and provider services
  ├─ Cloudinary media upload
  ├─ Nodemailer email verification
  ├─ Optional Stripe and OpenAI adapters
  └─ Raw-body verified billing webhook
          │
          ▼
MongoDB
```

The notification worker is a separate deployable process from the same repository. It claims pending delivery records, dispatches through email or the configurable push adapter, records provider outcomes, retries with bounded exponential backoff, and exposes backlog state through API readiness diagnostics.

Primary product routes now use server data. Provider adapters are optional at startup and fail explicitly at their dependent endpoints when unconfigured. The API exposes `/health` for process liveness, `/readiness` for MongoDB-backed deployment readiness, and retains `/database-status` as a backwards-compatible database check.

## Target system boundaries

### Web application

Owns rendering, routing, accessibility, transient interface state, optimistic feedback, query caching, and client-side validation. It must not be the authority for permissions, subscription entitlements, counters, competition deadlines, or recommendation eligibility.

### Application API

Owns authentication, authorization, validation, business workflows, transactions, persistence, moderation enforcement, and stable response contracts.

### Background worker

Owns retryable asynchronous jobs such as email, media processing, summary generation, audio generation, notifications, counter repair, feed materialization, and scheduled publication. It may initially run in the same repository and deployment but must expose explicit job boundaries.

### MongoDB

Owns durable application records. Multi-document workflows that affect invariants should use transactions where supported or idempotent repairable operations otherwise.

Transaction boundaries currently cover notification plus delivery enqueue, onboarding interests/follows/counters, and post likes/comments. Standalone local MongoDB remains supported through an explicit compatibility fallback; production deployments should use a replica set or MongoDB Atlas so the transaction path is active.

### Object/media storage

Cloudinary is the current provider. Application records store media metadata and provider identifiers, not only an opaque URL, so assets can be deleted, transformed, audited, or migrated.

### External providers

Email, AI, payments, analytics, and moderation vendors are adapters behind application-owned interfaces. Provider payloads must not leak through domain APIs.

## Folder structure

### Current repository

```text
Ink-Rider/
├─ Frontend/
│  ├─ public/
│  └─ src/
│     ├─ app/             # store, API client, providers, route guards
│     ├─ features/        # auth, authoring, discovery, membership, staff, and user domains
│     ├─ shared/          # components, hooks, icons, and cross-feature utilities
│     └─ styles/          # CSS variables and JavaScript token exports
├─ Backend/
│  ├─ config/
│  ├─ controllers/
│  ├─ middlewares/
│  ├─ routes/
│  ├─ schemas/
│  ├─ services/
│  ├─ src/
│  └─ utils/
├─ context/               # product and engineering source of truth
└─ .github/workflows/     # repeatable test/build verification
```

### Target frontend structure

Migrate incrementally; do not reorganize the whole repository in one change.

```text
Frontend/src/
├─ app/
│  ├─ providers/
│  ├─ router/
│  ├─ store/
│  └─ styles/
├─ features/
│  └─ <feature>/
│     ├─ api/
│     ├─ components/
│     ├─ hooks/
│     ├─ model/
│     ├─ pages/
│     └─ index.ts
├─ shared/
│  ├─ api/
│  ├─ components/
│  │  ├─ primitives/
│  │  ├─ patterns/
│  │  └─ layout/
│  ├─ hooks/
│  ├─ lib/
│  ├─ types/
│  └─ utils/
└─ main.tsx
```

Feature modules may import from `shared` and their own module. They must not reach into another feature's internal folders; import through that feature's public `index.ts` when cross-feature reuse is necessary.

### Target backend structure

```text
Backend/src/
├─ app.ts
├─ config/
├─ db/
│  ├─ models/
│  ├─ migrations/
│  └─ indexes/
├─ modules/
│  └─ <domain>/
│     ├─ <domain>.controller.ts
│     ├─ <domain>.service.ts
│     ├─ <domain>.repository.ts
│     ├─ <domain>.routes.ts
│     ├─ <domain>.schema.ts
│     └─ <domain>.types.ts
├─ middleware/
├─ jobs/
├─ providers/
├─ shared/
└─ server.ts
```

Controllers translate HTTP. Services own business rules. Repositories own database access. Models define persistence. Controllers must not directly coordinate multi-model business workflows.

## Data flow

### Read request

```text
Route loader or query hook
  → typed API client
  → Express route
  → authentication/optional identity
  → input validation
  → domain service
  → repository/query
  → response mapper
  → query cache
  → presentational component
```

### Write request

```text
Validated form
  → mutation hook with idempotency key when needed
  → authenticated API route
  → authorization + domain validation
  → transaction or idempotent service operation
  → event/outbox record when asynchronous work is required
  → normalized response
  → targeted cache update/invalidation
```

### Recommendation event flow

```text
Visible feed item / reading interaction
  → batched event endpoint
  → append-only interaction record
  → aggregation/materialization job
  → candidate retrieval
  → ranker with diversity and safety rules
  → feed response with reason and cursor
```

Never derive recommendation learning solely from clicks; impressions are required to distinguish unseen content from content a reader intentionally ignored.

The initial `For You` ranker is deterministic and inspectable. It combines explicit topic affinity, followed-writer affinity, freshness, bounded quality signals, and a stable exploration term. Candidate ordering is then diversified to avoid immediate repetition of the same author or primary topic. Every returned item carries a recommendation request identifier and a human-readable reason. Ranking inputs may evolve, but opaque ML ranking is not introduced until event coverage and offline evaluation are adequate.

## API contract

- New public API routes use `/api/v1/...`.
- JSON responses use `{ data, meta? }` for success and `{ error: { code, message, fields?, requestId? } }` for failure.
- List endpoints use cursor pagination where ordering can change.
- Filters and sort keys are allowlisted.
- Public identifiers are validated before database access.
- Write endpoints require authentication and explicit resource authorization.
- Sensitive or retryable operations support idempotency keys.
- API timestamps use ISO 8601 UTC strings.
- Internal Mongoose documents are mapped to response DTOs; they are not returned directly.
- Breaking response changes require a new API version or a compatibility period.

## Database schema

This is the target logical model. Existing schemas require migration before they should be treated as authoritative.

### User

- `_id`
- `email` — unique, normalized
- `passwordHash` — optional for external-auth accounts
- `emailVerifiedAt`
- `role` — user, moderator, admin
- `status` — active, restricted, suspended, deleted
- timestamps

### Profile

- `userId` — unique
- `handle` — unique, normalized, durable URL key
- `displayName`
- `bio`
- `avatarMediaId`
- `websiteUrl`
- `writerStatus`
- `membershipEnabled`
- timestamps

Authentication identity and public profile evolve independently. Public endpoints never expose email.

### Session

- `userId`
- `sessionId` — unique, rotated on every refresh
- `ip`
- `userAgent`
- `expiresAt`
- `lastUsedAt`
- `revokedAt`
- `revoked`
- timestamps

Access and refresh JWTs use purpose-specific derived keys, audiences, and verification rules. Authenticated API access also loads the current user so deleted, unverified, or suspended accounts cannot continue with an otherwise valid token. Production rate-limit counters are atomic MongoDB TTL records; development may use bounded in-memory counters.

### Follow

- `followerId`
- `followingId`
- timestamps
- unique compound index on `(followerId, followingId)`

### Topic and UserInterest

- Topic: slug, display name, description, aliases, status
- UserInterest: userId, topicId, explicitWeight, inferredWeight, updatedAt

User-entered post tags may map to canonical topics without silently changing displayed author text.

### Post

- `_id`
- `authorId`
- `slug`
- `title`
- `subtitle` or abstract
- `coverMediaId`
- `format` — article or short
- `status` — draft, scheduled, published, unlisted, archived
- `visibility` — public or members-extra
- `currentRevisionId`
- `publishedAt`, `scheduledFor`

`Post.format` distinguishes long-form articles from bounded short reads. A short may reference one deeper article through `depthParent`; the reverse quick-version link is derived. `ShortSeries` owns an ordered, unique list of short posts and supplies previous/next progression. `Collection` owns ordered post items independently of post format and enforces public, unlisted, or private visibility at read time.

Reading history is derived from append-only open, reading-depth, and completion events. It is private to the authenticated reader; clients do not become the authority for completion state.
- `readingTimeMinutes`
- `language`
- moderation state
- derived counters
- timestamps

Unique public URL identity should be author handle plus post slug or a stable public ID. Titles are not identifiers.

### PostRevision

- `postId`
- `revisionNumber`
- `title`, `subtitle`
- ordered `blocks`
- `tagIds`
- editor schema version
- `createdBy`
- `createdAt`

Published content is revisioned. Editing does not destroy the previously published representation or moderation evidence.

### Content block

Each block contains a stable ID, type, type-specific payload, optional presentation settings, and schema version. Supported MVP types are paragraph, heading, quote, list, code, image, embed allowlist, callout, and divider.

HTML is never trusted merely because it originated from the editor. Rendering uses structured blocks and sanitized provider output.

### Reaction, Save, and ReadingHistory

- Reaction: userId, postId, type, timestamps; unique `(userId, postId, type)`
- Save: userId, postId, timestamps; unique `(userId, postId)`
- ReadingHistory: userId, postId, lastProgress, completedAt, lastReadAt

### Comment

- `postId`
- `authorId`
- `parentCommentId`
- `body`
- `status`
- moderation state
- timestamps

Reply depth is bounded. Comment count is derived from visible comments.

### Question and QuestionVote

- Question: authorId, text, normalizedText, context, topicIds, status, duplicateOfId, targetWriterIds, timestamps
- QuestionVote: questionId, userId, timestamps; unique `(questionId, userId)`
- QuestionAnswer: questionId, authorId, body or linkedPostId, status, timestamps

Duplicate detection produces suggestions; it must not silently merge low-confidence questions.

### Collection and CollectionItem

- Collection: ownerId, title, description, slug, visibility, coverMediaId, timestamps
- CollectionItem: collectionId, postId, position, note, timestamps; unique `(collectionId, postId)`

Positions are explicitly stored and transactionally reordered.

### Competition and CompetitionEntry

- Competition: title, slug, rules, mode, eligibility, judging configuration, dates, status, createdBy
- CompetitionEntry: competitionId, postId, authorId, submittedRevisionId, status, timestamps
- CompetitionVote: competitionId, entryId, voterId, timestamps
- CompetitionResult: competitionId, entryId, rank, decision source, publishedAt

An entry points to the submitted revision so later article edits cannot alter judged material.

### Report and ModerationAction

- Report: reporterId, subjectType, subjectId, reason, details, status, timestamps
- ModerationAction: subject, actorId, action, policyCode, evidence, appeal state, timestamps

Reports are private. Enforcement decisions are auditable.

### Membership and Entitlement

- Membership: userId, providerCustomerId, plan, status, period dates
- CreatorSupport: supporterId, creatorId, allocation, status
- Entitlement: userId, capability, source, startsAt, endsAt

The application checks entitlements, not raw payment-provider state.

### Draft, PostRevision, and PostSummary

- Draft: owner, mutable block payload, version, optional scheduled release, timestamps
- PostRevision: post, immutable revision number, author snapshot, title/body/tags/release snapshot
- PostSummary: post, source revision/hash, extractive points, generation method, timestamps

Draft writes use optimistic versions. Publication creates an immutable revision; premium summaries remain traceable to their exact source.

### Workshop, CreatorUpdate, CreatorRequest, and Notification

- Workshop and WorkshopAttendance separate the public schedule from private registration/joining data.
- CreatorUpdate has an explicit `members` or `supporters` audience.
- CreatorRequest is period-keyed and rate limited; creators must opt in.
- Notification is recipient-owned with cursor ordering and nullable `readAt`.

Meeting links, direct requests, and notification read state are never exposed through public discovery DTOs.

### InteractionEvent

- actor or anonymous session identifier
- event type
- content and surface identifiers
- position and recommendation request identifier
- event timestamp and receipt timestamp
- bounded metadata

Events are append-only and exclude raw article bodies, passwords, access tokens, and unnecessary personal data.

## Required invariants

### Identity and authorization

- `req.auth.userId` is the only authenticated-user identifier exposed to application code.
- A user cannot follow, support, or block themselves.
- Only owners or authorized staff can modify a draft, post, collection, or competition.
- Roles and entitlements are enforced on the server, never inferred from hidden UI.
- Public profile responses never include email, session, billing, or private preference data.

### Content

- Every published post has an author, published revision, valid title, supported block schema, and publication timestamp.
- Drafts may be incomplete but remain accessible only to authorized users.
- A post references media records owned by or licensed to its author.
- Publishing is idempotent and cannot create duplicate posts after a retry.
- Deleting or suspending content preserves moderation and audit requirements.

### Engagement

- A user has at most one active save, follow, question vote, or competition vote per allowed subject.
- Derived counts never become the source of truth.
- Counter updates are atomic or repairable from relationship/event records.
- Views are not incremented on every raw GET; qualified view rules apply.

### Questions and competitions

- A duplicate question links to its canonical question.
- Low-confidence duplicate matches require reader confirmation.
- Only eligible, owned, published revisions can enter a competition.
- Competition deadlines and state transitions use server time.
- Votes cannot change after results lock unless an audited administrator action reopens them.
- Entry authors cannot vote for their own competition entry.
- Authenticated readers cast competition votes; judge scoring is restricted to moderators and administrators.
- Competition cover media is optional; valid HTTP(S) covers are preserved, while clients render a stable branded placeholder when none is supplied.
- Competition ranking uses explicit reader/judge/hybrid scoring, stable tie ranks, and deterministic timestamp/ID ordering.
- Disqualified entries remain preserved, are excluded from ranking/results, and disqualification or appeal decisions are recorded in the competition audit trail.

### Membership

- Primary public articles never require a paid entitlement.
- Premium extras have explicit entitlement keys.
- Webhooks are verified, idempotent, and safely replayable.
- Cancellation and expiration are distinct states.

### Privacy and safety

- Secrets never enter source control or client bundles.
- OTPs, passwords, tokens, and provider secrets never enter logs.
- Data collection is purpose-limited and documented.
- Reports and moderation evidence have restricted access.
- User-generated URLs, embeds, and rich text are validated and sanitized.

## Known remaining architecture work

- Controllers still coordinate some multi-model workflows directly; continue extracting domain services as TypeScript migration proceeds.
- JSON response envelopes are not yet uniform across every legacy route.
- Multi-document publication and counter workflows are repairable; notification, onboarding, and post engagement invariants use MongoDB transactions where supported.
- Durable notification delivery records, bounded retries, and a worker command now exist; scheduled worker deployment, push adapters, and provider-level delivery monitoring remain.
- Rich blocks require a formal server-side sanitization policy and adversarial test suite.
- Browser E2E and database-backed integration suites are part of the CI workflow; hosted execution and long-term flake monitoring remain operational concerns.
- Production observability now includes request IDs, structured slow-request/slow-query diagnostics, process logs, and an optional redacted 5xx error-monitor adapter; live destination activation, alert routing, and broader operational metrics remain.
- Moderation authority, appeal, and audit policy is approved in [moderation-policy.md](moderation-policy.md); enforcement implementation remains intentionally absent until its bounded actions, actor separation, expiry, notifications, and append-only audit checks are implemented.

Architecture changes that affect data contracts require a migration or replay strategy, contract tests, and an update to this document.
