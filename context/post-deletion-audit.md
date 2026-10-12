# Owner post deletion — 2026-10-12

## Audit and decision

Profile's My Posts rows already provide Edit and Republish/Unpublish beside the existing thumbnail/title/date/like count. The frontend uses AppLayout/PageFrame, DM Sans controls, Libre Baskerville headings, semantic Light/Dark tokens, TanStack Query, and the shared Button, ModalLayer, ModalHeader, and dialog-focus hook. Add Delete post and reuse the existing collection-delete confirmation presentation. Preserve other controls, routes, page structure, type, colors, navigation, and schemas.

Express authentication remains authoritative; the new versioned DELETE route delegates ownership and cleanup to a service. Posts, comments/replies, comment likes, saves, likes, and reports are separate records. Saves already have a postId index, so cleanup can target this post without scanning or updating user documents. Saved bookmarks filter null populated references; collection/short-series presenters omit missing posts; reading history queries existing accessible posts; competition entries retain an unavailable-post fallback. Hard deletion reuses these existing contracts without introducing a deleted status or rewriting all referencing lists.

## Completed behavior

My Writing Posts now provides owner-only Delete post after the 2026-10-12 account grouping; old Profile posts links forward there. Confirmation names the post, explains removal of comments/pending reports/saved entries, and requires explicit confirmation. Cancel/Escape restore the trigger before mutation. Pending deletion blocks dismissal/repeat activation; failure retains the dialog and exposes retry. Confirmed deletion refreshes query caches, removes the row, updates counts/linked views, and shows a success toast. My Library saved rows do not offer deletion.

DELETE `/api/v1/posts/:postId` requires authentication, validates the identifier, and scopes the post by authenticated author. It returns 204 after cleanup; absent or foreign-owned posts return 404 and invalid IDs return 400. Comment cleanup includes replies and deleted placeholders in batches of at most 500 IDs. It deletes associated comment likes and pending comment reports, pending post reports, post likes, saves, and finally the post. It preserves unrelated content, reports in reviewing/actioned/dismissed states, immutable revisions, interaction history, notifications, and competition history. Old links receive the existing unavailable article response. No media-provider asset deletion is attempted because images may be referenced by historical revisions or other content.

## Changed files

- Backend: new `controllers/post-deletion.controller.js`, new `services/post-deletion.service.js`, `routes/v1.routes.js`, `tests/foundation-contracts.test.js`, `tests/integration.test.js`.
- Frontend: `src/features/user/api/profile.js`, `src/features/user/pages/Profile/index.jsx`, new `src/features/user/components/DeletePostDialog.tsx`, new `tests/post-deletion.spec.js`.
- Documentation: this audit, `architecture.md`, `ui-rules.md`, `ui-registry.md`, `progress-tracker.md`, and the local architecture companion.

No optional redesign, broad refactor, schema replacement, dependency, migration, or approval-dependent decision is included. New backend modules preserve the established CommonJS runtime rather than introducing a TypeScript runtime migration.

## Verification

2026-10-12: all 98 backend contracts passed, including route authentication/validation, ownership-before-cleanup, bounded batches/scoping, preserved history, and standalone failure preserving the post for retry. Both new mocked-API Chrome checks passed at 320 px Light and 1280 px Dark for existing controls, Cancel/focus return, failed deletion/retry, pending duplicate/dismissal protection, confirmed removal, saved-list refresh, and horizontal bounds. Backend/frontend lint, production build, artifact validation (78 files without source maps), and whitespace checks passed.

Real HTTP/database coverage was added for owner/foreign/guest deletion, persistent cleanup, unrelated comments, preserved completed reports, old-link recovery, and dangling saved references. Its opt-in MongoDB suite skipped locally. Live persistence, concurrent writes, replica-set rollback, physical devices, assistive technology, and other engines are unverified. The local companion owns transaction/fallback constraints.
