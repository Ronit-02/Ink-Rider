# Development test fixtures

Last reviewed: 2026-09-08

## Purpose and safety

The development seed creates a connected, repeatable dataset that exercises the same application paths as user-created data without adding fallback mock logic. Fixtures are strictly non-production: use them only in isolated development or test environments, and never document or commit fixture credentials, account identifiers, tokens, or provider values.

Fixtures support product verification without creating real charges or fabricating provider success. Extend the set when a feature needs representative persisted state.

## Feature coverage map

| Area | Seeded scenarios |
|---|---|
| Discovery and search | Feeds, topics, varied authors, interaction signals, searchable writing, questions, and public profiles. |
| Reading and engagement | Structured content, accessible media alternatives, saves, reactions, comments, follows, sharing, progress, and reports. |
| Publishing | Drafts, revisions, publication states, short reads, source-question linkage, and writer-facing management. |
| Questions and opportunities | Open and answered questions, duplicate-aware states, votes, tags, linked responses, and reader demand. |
| Competitions | Multiple lifecycle states, entries, votes, judging, results, and review history. |
| Collections, shorts, and history | Ordered collections, saved items, short series, depth links, and varied reading progress. |
| Membership experiences | Member states, early access, summaries, browser speech, workshops, creator updates, requests, support, and analytics. |
| Notifications and moderation review | Read/unread activity, report lifecycle states, and non-destructive staff review scenarios. |
| Provider-independent lifecycle states | Billing, AI-use, media, email, and delivery-adjacent UI states without requiring live provider calls. |

## Intentional boundaries

Fixtures do not activate provider behavior. Live payment, AI, email, and media actions require separate authorized configuration and fresh verification. Staff fixtures exercise review and recommendations only; destructive moderation enforcement remains unavailable until its verified lifecycle is active.
