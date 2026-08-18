# Ink-Rider library and third-party API rules

Last updated: 2026-08-25

## Purpose

Dependencies accelerate delivery but expand the security, performance, maintenance, privacy, and failure surface of the product. This document defines how libraries and external APIs are selected, isolated, used, upgraded, and removed.

## Dependency decision rule

Add a dependency only when it provides substantial, well-tested behavior that would be riskier or disproportionately expensive to maintain ourselves.

Before installation, record:

- The user or engineering problem it solves
- Why existing platform or installed capabilities are insufficient
- Bundle/runtime cost
- License compatibility
- Maintenance activity and release stability
- Security history and transitive dependency risk
- Browser/runtime support
- Accessibility quality for UI packages
- Data sent to external systems
- Replacement or removal strategy

One developer proposes a dependency; another review or an explicit architectural decision approves dependencies that affect security, editor output, payments, AI, analytics, or more than one feature.

## General usage rules

- Import from documented public entry points only.
- Use the narrowest import that preserves tree shaking.
- Do not copy undocumented library internals into application code.
- Wrap provider-specific or high-churn libraries behind application-owned adapters.
- Keep configuration in one module per library.
- Do not initialize SDKs during module import when that causes network calls or hidden global state.
- Pin intentional major versions and commit lockfiles.
- Review changelogs before upgrades; never bulk-upgrade critical providers blindly.
- Remove unused dependencies and obsolete adapters promptly.
- Do not add two libraries that solve the same problem without a migration plan.
- Never expose backend SDK secrets through `VITE_` environment variables.

## Current frontend libraries

### React and React DOM

- Components remain pure during render.
- Use Strict Mode in development.
- Do not add a second rendering or component framework.
- Prefer platform features and React composition over unnecessary abstractions.

### React Router

- Routes are the source of truth for navigable application state.
- Detail pages use durable identifiers or slugs.
- Filters and tabs that users may share or revisit belong in route segments or search parameters.
- Route guards improve UX but never replace server authorization.
- Every route defines loading, error, not-found, and unauthorized outcomes.
- Add a branded 404 instead of redirecting every unknown path home.

### TanStack Query

- Own all server state and mutation state.
- Define query-key factories by domain.
- Pass the framework-provided query function context rather than closing over unstable values.
- Set stale time, retry, refetch, and garbage collection intentionally per data type.
- Do not retry validation, authorization, or not-found errors.
- Mutation success updates or invalidates the smallest correct cache region.
- Optimistic updates require cancel, snapshot, rollback, and settle behavior.
- Do not duplicate query results into Redux.

Example query keys:

```ts
export const postKeys = {
  all: ['posts'] as const,
  detail: (postId: string) => [...postKeys.all, 'detail', postId] as const,
  feed: (input: FeedInput) => [...postKeys.all, 'feed', input] as const,
};
```

### Redux Toolkit

- Reserve for cross-cutting client state with clear ownership.
- Authentication state may contain the short-lived access token and minimal session identity.
- Do not persist access tokens to local storage.
- Do not store fetched posts, profiles, feeds, or collections in Redux.
- Reducers remain synchronous and side-effect free.

### Axios

- Use one configured application client per API origin.
- Request and response interceptors handle transport concerns, not domain behavior.
- Prevent refresh storms with a single in-flight refresh operation and queued retries.
- Do not clear all `localStorage` or `sessionStorage`; remove only Ink-Rider-owned keys.
- Normalize transport errors into application error types.
- Enforce request timeouts and cancellation for route changes/search.
- Do not log full request configurations or authorization headers.

### Framer Motion

- Use for interaction and layout motion that materially improves comprehension.
- Respect reduced-motion preferences.
- Prefer transform and opacity animations.
- Avoid using animation to conceal slow loading or block access to content.
- Do not use it for simple CSS hover/color transitions.

### Tailwind CSS

- Use semantic CSS variables from [ui-tokens.md](ui-tokens.md).
- Extract repeated patterns into components or composed classes; do not create unreadable page-sized class strings repeatedly.
- Arbitrary values are for one-off layout constraints, not a substitute for tokens.
- Confirm Tailwind v4 syntax before adding configuration intended for v3.
- Global CSS owns reset, tokens, typography foundations, and cross-cutting accessibility behavior.

### UUID

- Client-generated IDs may identify unsaved editor blocks.
- Server resource IDs remain server-owned unless a documented idempotent create flow accepts client IDs.
- Do not treat a UUID as proof of authorization or trust.

## Current backend libraries

### Express

- Register security, parsing, request ID, logging, and error middleware centrally.
- Keep routes declarative and thin.
- Async errors flow to centralized error middleware.
- Set explicit body size limits.
- Avoid accepting multipart input on routes that do not require it.
- Document behavior that depends on Express 5 rather than older middleware assumptions.

### Mongoose

- Schemas define persistence, not public API DTOs.
- Declare indexes intentionally and verify them in deployment.
- Use `lean()` for read-only queries when document methods are unnecessary.
- Select only fields required by a response.
- Avoid unbounded populate operations and embedded arrays that grow without limit.
- Relationship collections are preferred for high-cardinality votes, saves, follows, comments, and entries.
- Multi-document invariant changes use transactions or idempotent repair logic.
- Schema changes include a migration, backfill, index plan, and rollback notes.

### JSON Web Tokens

- Access tokens are short-lived and contain minimal claims.
- Refresh sessions are revocable and rotated.
- Verify issuer, audience, algorithm, expiration, and session state as applicable.
- Do not place private profile or entitlement details in long-lived tokens.
- Token verification uses one configured module; controllers do not call `jwt.verify` directly.

### bcrypt

- Hash passwords and OTPs with parameters reviewed for the deployment environment.
- Enforce strong password rules independently of hashing.
- Never log raw or hashed credentials.
- OTP comparison endpoints are rate-limited and attempts are bounded.

### Multer

- Store temporary files only in a known temporary directory.
- Limit upload byte size and file count.
- Verify detected content type, not only extension or browser-provided MIME.
- Always clean up temporary files on success and failure.
- Reject unsupported images before sending them to a provider.

### Morgan or HTTP logging

- Production logs use structured output and request IDs.
- Redact query values or paths that may contain sensitive information.
- Do not log cookies, authorization headers, OTPs, or request bodies.
- Morgan may remain a development convenience, not the full observability strategy.

## External provider rules

### Cloudinary

- Access through a `MediaProvider` adapter.
- Store provider asset ID, secure URL, dimensions, format, bytes, owner, and purpose.
- Use server-generated upload authorization or server-side upload; never expose the API secret.
- Apply transformations through named presets.
- Delete replaced or abandoned assets through background cleanup.
- Provide a fallback when transformed media is temporarily unavailable.

### Email

- Access through an `EmailProvider` interface.
- Templates are versioned and previewable.
- Do not reveal whether an account exists in recovery flows.
- Queue delivery and retry transient failures.
- Track provider message IDs and delivery status without storing unnecessary message content.
- Development uses a safe test transport or sink.

### AI summarization and writing assistance

- No provider is selected until requirements and privacy review are complete.
- Access through task-specific interfaces such as `SummaryProvider`, not a generic SDK spread across controllers.
- Send only content required for the task.
- Do not train or retain user drafts through a provider unless the user-facing policy explicitly permits it.
- Store model/provider, prompt version, source revision, generation time, status, and moderation result.
- Generated summaries are clearly labeled and correctable.
- Timeouts, rate limits, refusal, and provider outage have explicit states.
- OpenAI Responses API calls are server-side, use `store: false`, and send only the writer-selected draft text needed for the requested transformation.
- The model name is configuration (`OPENAI_MODEL`); production prompt instructions remain versioned in application code.
- Extract text by walking all response message content rather than assuming the first output item contains text.
- AI suggestions are disclosed and never overwrite writer content without an explicit user action.
- Never let generated output execute as HTML, code, or trusted editor blocks without validation.

### Text-to-speech

- Generate from a specific published revision.
- Store voice, provider, source revision, duration, media ID, and generation state.
- Provide text access and ordinary reading when audio fails.
- Do not clone a writer's voice without explicit, revocable consent and a separate safety review.

### Payments

- Stripe Checkout is the selected hosted billing boundary; the application does not collect card details.
- Client success redirects never grant entitlement.
- Verified server webhooks are authoritative.
- Webhook processing is idempotent and replayable.
- Store provider IDs and normalized billing state, not full payment details.
- Secrets and webhook signing keys stay server-side.
- Entitlement checks use the application entitlement service.
- Create Checkout Sessions only on the backend in `subscription` mode with the configured recurring Price ID.
- Verify `Stripe-Signature` against the unmodified raw request body and reject timestamps outside the tolerance window.
- Subscription create/update/delete events own lifecycle state; invoice payment failures move access to `past_due`.
- Persist a provider event receipt before processing so webhook retries cannot provision twice.
- Provider outages return a safe 502/503 and never interrupt public article reading.

### Product analytics and recommendation events

- Define an event dictionary before SDK installation.
- Collect only events tied to product decisions or reliability.
- Impression semantics require visibility, surface, position, and recommendation request ID.
- Respect consent and deletion policies.
- Keep sensitive text, private drafts, emails, and exact search content out unless specifically justified.
- Product behavior must remain functional when analytics is blocked.

## Environment variables

- Commit `.env.example`, never `.env` values.
- Validate required variables at process start with environment-specific requirements.
- Separate public frontend configuration from server secrets.
- Name variables by provider and purpose.
- Rotate exposed credentials immediately.
- Tests inject deterministic fake adapters rather than depending on developer credentials.
- `SLOW_REQUEST_MS`, `SLOW_QUERY_MS`, and `RESPONSE_BUDGET_MS` control redacted thresholded diagnostics for HTTP requests and MongoDB commands; keep them disabled from user-facing responses and tune them per environment.
- `PROVIDER_TIMEOUT_MS` bounds outbound Stripe and OpenAI requests; provider timeouts return safe outage states and never expose credentials or upstream response text.
- The default route-class budgets are 750 ms for discovery reads, 500 ms for interaction events, 1,500 ms for API mutations, and 2,000 ms for billing webhooks; unclassified routes use `RESPONSE_BUDGET_MS`.
- `ERROR_MONITOR_URL` optionally receives redacted 5xx and response-budget alerts with a bounded `ERROR_MONITOR_TIMEOUT_MS`; delivery failures never change the API response or expose provider errors to readers.
- Competition fraud analysis is read-only and can be run with `npm run competition:fraud-analysis` from `Backend`; pass a positive minute count to override the default ten-minute window. The protected staff review surface can append advisory `confirmed`, `false_positive`, or `needs_investigation` dispositions to competition audit records after recomputing the aggregate signal. Outputs contain only aggregate signal counts/types and review notes, never raw fingerprints or voter IDs; dispositions do not execute enforcement.

## Adapter contract

Provider adapters should expose application concepts:

```ts
export type UploadedMedia = {
  providerAssetId: string;
  secureUrl: string;
  width: number;
  height: number;
  format: string;
  bytes: number;
};

export interface MediaProvider {
  uploadImage(input: UploadImageInput): Promise<UploadedMedia>;
  deleteAsset(providerAssetId: string): Promise<void>;
}
```

Controllers and UI components must not depend on Cloudinary, Stripe, or an AI vendor's raw response objects.

## Upgrade and incident policy

- Automated update proposals still require tests and changelog review.
- Critical security fixes are prioritized and may use an expedited review.
- Major upgrades receive a dedicated change with migration notes.
- Provider outages are tracked separately from application defects.
- Every critical provider has documented timeout, retry, fallback, and disable behavior.
- If a library becomes unmaintained, vulnerable, or disproportionately costly, create a removal plan rather than indefinitely pinning it.
