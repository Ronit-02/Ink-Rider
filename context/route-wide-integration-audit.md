# Route-wide integration audit

Date: 2026-08-25

## Repository context

- All ten canonical files in `context/`, the root `README.md`, and `Frontend/README.md` were read before implementation.
- `Backend/README.md` is referenced by `AGENTS.md` but is absent from the repository. Backend setup and verification instructions are currently represented by the root README and `Backend/package.json`.

## Existing test boundary

- `Backend/tests/integration.test.js` was an opt-in MongoDB suite with four tests covering authorization, optimistic revision conflicts, idempotent engagement counters, and Stripe webhook idempotency.
- CI already provisions MongoDB 7 and runs the suite with `RUN_DB_INTEGRATION=true`.

## Coverage decision

The smallest additive change was to retain the four existing tests and add two route-wide tests in the same suite:

1. A real HTTP read matrix covering health/SEO and every persisted API route family.
2. A real HTTP mutation matrix asserting durable database state across drafts, onboarding, questions, collections, follows, engagement, interaction events, notifications, competitions, short series, provider boundaries, and staff review.

The fixtures use unique per-run records and clean up by the generated user IDs/prefix. No application mock data, route changes, schema replacement, or UI redesign was introduced.

## Finding resolved

The new route read matrix exposed a production 500 in the writer-opportunity route: `publicPostClause` was referenced without being imported. The route now imports the existing helper from `post-access.service.js`.

## Verification

- `RUN_DB_INTEGRATION=true npm run test:integration`: 6/6 passing.
- `npm test` from `Backend`: 75/75 passing.
- `npm run build` from `Frontend`: passing.
