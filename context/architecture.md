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

- Version public APIs and maintain a clear compatibility path for breaking changes.
- Validate identifiers, allowlist client-controlled filters and sort keys, and paginate unstable result sets.
- Use stable success and failure response shapes.
- Map internal persistence objects to audience-appropriate public data-transfer objects.
- Support retry safety where a user action can be repeated.

Discovery lists use bounded cursor pages and compact presentation DTOs. Personalized ranking reads a bounded candidate projection, then loads only the selected page's display fields; it must not hydrate or parse full article bodies for every ranking candidate.

## Product data principles

Ink-Rider maintains identity, content, community, discovery, and optional member-experience records. Published content preserves its historical representation; drafts remain private to authorized people. Relationship and event records remain authoritative over derived counters, and private activity is not exposed through public discovery.
