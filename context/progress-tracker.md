# Ink-Rider progress tracker

Last reviewed: 2026-09-08

## Current milestone

The principal reading, publishing, discovery, questions, collections, short reads, membership, notifications, competitions, and staff-review surfaces are connected to persistent application data. This is a project-status summary, not a claim of production launch readiness.

## Verified product status

| Area | Status | Notes |
|---|---|---|
| Reading, discovery, search, profiles | Connected | Primary user flows use server-backed data. |
| Drafts, publishing, questions, collections, shorts | Connected | Continue to verify changes through the established test suites. |
| Membership and creator experiences | Connected | Live provider activation remains a release check. |
| Competitions and staff review | Partial | Core surfaces exist; protected enforcement lifecycle is not active. |
| Accessibility, browser, contract, database, and SEO checks | Available | Evidence is command- and environment-specific; rerun before relying on it. |

## Phase status

| Phase | Status | Tracked outcome |
|---|---|---|
| Baseline and contracts | Partial | Core contracts, fixtures, validation, warning-free package-local ESLint baselines, and repeatable verification exist; release activation remains. |
| Publishing, reading, discovery, and onboarding | Connected | The core reader and writer loop uses durable server-backed data. |
| Questions and opportunities | Connected | Questions are an independent reader-demand surface. |
| Competitions | Partial | Product flows and staff review exist; operational edge cases remain. |
| Collections and shorts | Connected | Persistent collections, short reads, series, and history are available. |
| Membership, AI, and audio | Partial | Product surfaces exist; configured-provider activation remains a release gate. |

## Product decisions in force

Primary articles remain publicly readable. Discovery and reader demand precede monetization, questions remain independent from stories, and responsive web is the current platform. Recommendations are explainable and diversity-aware before any opaque machine-learning expansion. Moderation enforcement remains bounded in policy and inactive in implementation until its full lifecycle is verified.

## Release gates

- Verify configured external providers and production-domain behavior.
- Complete and verify the moderation-enforcement lifecycle before activation.
- Verify monitoring, background processing, recovery, and deployment behavior in the target environment.
- Run the relevant automated checks after feature changes and record only dated, reproducible outcomes.

## Recent verification

- 2026-09-08: Article-detail queries now wait for refresh-cookie session restoration before loading reader-specific save and appreciation state, preventing a reload from settling on an anonymous representation. `Frontend`: `npm run lint` and `npm run build` passed. The focused Playwright critical-flow check could not start locally because its backend requires configured isolated MongoDB settings.

## Update protocol

Update this file only after a verified change to implementation progress. Put detailed security, provider, deployment, test-run, and operational evidence in the corresponding ignored local companion rather than session narration here.
