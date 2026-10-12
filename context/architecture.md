# Ink-Rider architecture

Last updated: 2026-09-08

## Architectural stance

Ink-Rider remains a modular monolith until demonstrated scale or team boundaries justify independent services. The web application, application API, durable storage, media delivery, background processing, and optional external integrations are distinct runtime responsibilities, but product logic must not be fragmented prematurely.

The architecture optimizes for:

- Correct ownership and authorization.
- Durable content and community data.
- Clear separation between authoritative records and derived presentation data.
- Replaceable external integrations.
- Observable asynchronous work.
- Safe incremental migration from the current JavaScript codebase.

## System boundaries

### Web application

Owns rendering, routing, accessibility, transient interface state, optimistic feedback, query caching, and client-side validation. It is never authoritative for permissions, entitlements, counters, deadlines, or recommendation eligibility.

### Application API

Owns authentication, authorization, validation, business workflows, persistence, moderation workflow, and stable public response contracts.

### Background processing

Owns retryable asynchronous work such as delivery, processing, scheduled publication, aggregation, and repair. Job boundaries must remain explicit even when processes share a repository or deployment.

### Durable data and integrations

Durable storage owns authoritative application records. Workflows affecting multiple records must preserve invariants through an appropriate transactional or repairable design. External providers are accessed through application-owned interfaces; raw provider payloads must not become domain API contracts.

## Repository and migration direction

The current project separates frontend and backend applications and keeps product context and repeatable verification in the repository. Evolve its structure incrementally: feature modules may use shared code and their own internals, but should not depend on another feature’s private folders. Server-side responsibilities remain separated between HTTP translation, business rules, and persistence access.

Do not reorganize the repository, migrate language, or replace architecture wholesale as part of feature work. Any architecture change affecting public contracts or stored data requires a migration or replay strategy, contract coverage, and an update to this document.

## Data-flow principles

Read flows validate input, resolve the appropriate identity, execute an owning domain query or service, map a stable response, and render it through accessible UI. Write flows validate user input, enforce authorization, preserve domain invariants, and update client state from the authoritative response.

Recommendation learning distinguishes viewed content from intentional interaction, keeps ranking explainable and diversity-aware, and does not introduce opaque machine-learning ranking before adequate event coverage and offline evaluation exist.

## Public contract principles

Picked-post collection addition extends the existing ordered reference model with an authenticated owner-scoped operation. It accepts publicly released posts and shorts from any writer, appends without overwriting the existing order, prevents duplicates under repeated/concurrent additions, and retains the existing collection size bound. Legacy reference arrays remain readable and convert only on a targeted append. Existing collection creation/read/update contracts and schemas are preserved. The frontend reuses existing creation for create-with-story and partitions the private picker cache by viewer. Behavior and verification are owned by [collection items audit](collection-items-audit.md).

Comment lists and direct reply counts exclude deleted leaves and entirely deleted branches, while retaining deleted ancestors needed to reach surviving replies. Visibility filtering occurs before cursor limits. Existing soft-deletion records, mutation authorization/idempotency, response fields, active-comment totals, and schemas remain preserved. UI behavior and verification are owned by [comment actions audit](comment-actions-audit.md).

Owner post deletion uses the existing relationship model and missing-reference handling. Saves are post-indexed records, so cleanup does not rewrite user accounts. Existing collections, short series, and reading history omit unavailable posts; old article links use the existing missing-resource response and competition history retains its unavailable-entry state. Completed moderation history and immutable revisions remain preserved. Behavior, changed files, and verification are owned by [post deletion audit](post-deletion-audit.md).

Public writer-profile article summaries include the viewer's `isLiked` and `isBookmarked` state, resolved with batched reads of existing like/save relationships. Guests receive false without a relationship lookup. The frontend waits for session restoration and partitions writer queries by viewer identity; shared post-cache updates also cover writer articles for appreciation and comment-count changes. Existing response fields, routes, and persistence models are preserved.

- Version public APIs and maintain a clear compatibility path for breaking changes.
- Validate identifiers, allowlist client-controlled filters and sort keys, and paginate unstable result sets.
- Use stable success and failure response shapes.
- Map internal persistence objects to audience-appropriate public data-transfer objects.
- Support retry safety where a user action can be repeated.

Discovery lists use bounded cursor pages and compact presentation DTOs. Personalized ranking reads a bounded candidate projection, then loads only the selected page's display fields; it must not hydrate or parse full article bodies for every ranking candidate.

Unified search also supports explicit reader-question results. It matches question text, context, and tags with the existing topic/time filters and bounded limits, excludes closed questions, and reuses the question-list presenter for public author identity, viewer upvote state, answer counts, and accessible published responses. Existing post/writer/short search behavior and stored models are preserved. Search caches for questions are viewer-specific and refresh after confirmed upvotes.

Global autocomplete returns independent groups of up to five complete search phrases and five public writers. Phrases come from publicly released post tags and titles, with normalized deduplication, exact/phrase-prefix/word-prefix ranking, and supporting-publication counts. It does not read article bodies or search history. Selecting a phrase runs unified search; selecting a writer opens their profile. Full-result contracts and persistence models remain unchanged.

Competition detail entry author data includes the stored public profile handle, resolved through one batch profile read, so entry cards can link directly to the writer without guessing a handle from the display name.

Editor tag suggestions use additive public GET `/api/v1/tags?q=...`, returning at most 50 value/label choices from active canonical topics and tags on publicly released posts. Queries are bounded and treated as literal text; only tag metadata is projected from posts. Drafts, unpublished posts, and future releases do not supply suggestions. Custom tags remain existing string values in draft/post writes, without creating canonical topics or changing schemas. Lookup failure does not block custom tag entry.

## Product data principles

Ink-Rider maintains identity, content, community, discovery, and optional member-experience records. Published content preserves its historical representation; drafts remain private to authorized people. Relationship and event records remain authoritative over derived counters, and private activity is not exposed through public discovery.


## Format propagation in reading summaries

Post.format remains the stored source of truth. The existing discovery presenter emits format with an article default for legacy data; search/writer/competition/question projections retain it, and short-series detail entries reuse discovery summaries. The frontend dispatches cards and canonical readers by format, with no new routes or database model. Collection grouping is a presentation concern; its existing combined postIds ordering API remains unchanged.

## Story summary state

Existing discovery presentation is reused by owner posts and published question responses with populated public author identity. Owner responses retain management fields and omit bodies; question summaries retain legacy identifiers. Collection, history and early-access reads pass viewer identity; competition nested posts and writer/saved summaries expose existing appreciation/save relationships. This is additive response mapping over current routes and schemas. Frontend updates traverse the owning summary query shapes, with competition votes separate from story likes. See [post components audit](post-components-audit.md) for scope and verification.
