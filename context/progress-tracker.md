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

- 2026-09-08: The API root (`GET /`) now provides the same lightweight unauthenticated liveness response as `/health`, while unknown routes continue to return the normalized 404 payload. `Backend`: `npm run lint` and `npm test` passed (83 tests).
- 2026-09-08: Restored a restrained search focus cue (a subtle input underline alongside the existing container state) and retained competition history-back behavior on a semantic, phone-sized link. `Frontend`: `npm run lint` and `npm run build` passed. Focused Playwright checks could not run locally because the configured Chromium headless-shell executable is absent; the initial retry was also prevented from starting its managed server because port 8000 is already in use.
- 2026-09-08: The navbar account control now uses a transparent, clipped hit target and removes the avatar-only inherited border there, so the profile photo is the sole visible circle at compact and mobile sizes. `Frontend`: `npm run lint` and `npm run build` passed.
- 2026-09-08: The writer’s title and content fields reserve a small left inset, keeping their text clear of the editor-only left-edge focus marker. `Frontend`: `npm run lint` and `npm run build` passed.
- 2026-09-08: Article detail, search, and category results now prefer the current public profile’s Cloudinary avatar, display name, handle, and biography over stale post snapshots. All remaining user-avatar surfaces use the shared image-error-safe avatar component, so unavailable image URLs resolve to initials instead of a broken image. `Backend`: `npm run lint` and `npm test` passed (83 tests). `Frontend`: `npm run lint` and `npm run build` passed.
- 2026-09-08: Removed the global rectangular focus shadow for transparent controls. The writing editor’s title and content blocks now use a left-edge focus indicator only; other pages no longer receive that injected border treatment. `Frontend`: `npm run lint` and `npm run build` passed.
- 2026-09-08: The borderless editor title no longer receives the generic rectangular focus shadow; it retains an accessible, token-based baseline focus indicator in both themes. `Frontend`: `npm run lint` and `npm run build` passed.
- 2026-09-08: The dark authentication surface now differentiates the card, tab selection, and inputs with the existing semantic color tokens, improving focus and contrast without changing the global palette. `Frontend`: `npm run lint` and `npm run build` passed.
- 2026-09-08: Public authentication pages now occupy the dynamic viewport height and contain short-screen overflow within the auth surface, avoiding document-level scrolling caused by mobile browser chrome. `Frontend`: `npm run lint` and `npm run build` passed.
- 2026-09-08: The frontend image policy now permits local `blob:` URLs only for `img-src`, allowing the writer’s selected cover image to preview before it is uploaded while retaining the existing script, connection, and object restrictions. Both the development HTML policy and deployed headers match. `Frontend`: `npm run lint` and `npm run build` passed.
- 2026-09-08: Authentication screens now show the Ink Rider mark and use semantic theme tokens in both light and dark mode; the Google identity control follows the active theme. The personal profile now renders through the shared image-error-safe avatar component, and compact competition cards use a thumbnail-specific fallback cover rather than the full hero composition. `Frontend`: `npm run lint` and `npm run build` passed.
- 2026-09-08: Google sign-in now assigns a repository-managed Cloudinary avatar when Google does not provide one, existing empty Google profiles are repaired on their next sign-in, and failed avatar URLs fall back to initials. Detail-page back controls now use browser history, the recent competition-winner link preserves its competitions origin, the dark navigation logo uses theme tokens, and the competition cover fallback is an editorial CSS composition. `Backend`: `npm run lint` and `npm test` passed (83 tests). `Frontend`: `npm run lint` and `npm run build` passed.
- 2026-09-08: Discovery-read performance hardening bounded the legacy public post list to cursor pages (maximum 100 items), returned compact post DTOs rather than full article bodies, and reduced personalized-ranking candidates to a lean 120-document projection before loading only the selected display page. Backend contract tests and lint were rerun after the change.
- 2026-09-08: Documentation cleanup removed references to the local confidential-context directory from tracked context and local documentation, retaining one required reference in `AGENTS.md`. A repository-wide Markdown search verified the intended single remaining reference.
- 2026-09-08: Article-detail queries now wait for refresh-cookie session restoration before loading reader-specific save and appreciation state, preventing a reload from settling on an anonymous representation. `Frontend`: `npm run lint` and `npm run build` passed. The focused Playwright critical-flow check could not start locally because its backend requires configured isolated MongoDB settings.

## Update protocol

Update this file only after a verified change to implementation progress. Put detailed security, provider, deployment, test-run, and operational evidence in the corresponding ignored local companion rather than session narration here.
