# Comment actions — 2026-10-10

## Four-line comment disclosure — 2026-10-10

CommentItem now clamps comment/reply text to four rendered lines initially and shows Read more only when the full text exceeds that height at its current width. Activating it expands in place and exposes Show less. The existing type sizes, line height, preserved line breaks, and wrapping remain intact. A local ResizeObserver and font-readiness measurement account for responsive/modal width and font loading; edited text resets its disclosure state. The 44 px toggle uses the existing Button, aria-expanded/aria-controls, native keyboard behavior, and no authentication or API call. Deleted placeholders and comments of four lines or fewer have no disclosure. All article, comment-dialog, and short-reader surfaces reuse this implementation.

Changed CommentItem.tsx, comment-actions.spec.js, UI rules/registry, this audit, and progress tracker. All 19 mocked-API Chrome checks passed, including five new article/dialog threshold and guest-resize checks: exactly four explicit lines, five-line collapse/expansion, Show less, keyboard focus, edit refresh, nested replies, and naturally wrapped text at 320/1280 px. Existing composer, like/unlike, edit/reply/delete, pending/retry, and guest checks also passed. Phone Light/article and desktop Dark/dialog screenshots were visually reviewed. Frontend lint/build, artifact validation (78 files, no source maps), and scoped whitespace checks passed. Live persistence, physical devices, assistive technology, and other engines were not exercised.

## Current like pending contract — 2026-10-10

The application-wide icon loading correction supersedes the earlier whole-control fade below. CommentItem uses Button action: the heart alone receives muted fill/stroke, while the count stays fully opaque and the target stays transparent/borderless. Placement, dimensions, confirmed refresh, rollback/retry, and other comment actions are preserved. Current verification and changed-file inventory are owned by [button loading audit](button-loading-audit.md).

## Earlier like pending appearance correction — 2026-10-10

The global filled busy-button rule exposed the entire 44 px comment Like hit area as a pill behind its top-aligned heart/count. A delayed-request regression reproduced that background before the fix. CommentItem now identifies this control with `data-comment-like`; a narrowly scoped CSS override keeps the pending surface/border transparent, retains secondary text color, and fades to 60% opacity. Geometry, confirmed count/heart state, wait cursor, aria-busy, disabled protection through refresh, guest gating, and error/retry behavior are preserved. Other buttons retain their existing busy treatment.

Changed CommentItem.tsx, global.css, comment-actions.spec.js, this audit, button-loading audit, UI rules, and progress tracker. All 14 distinct mocked-API Chrome checks passed across full and focused runs: the 12 existing comment checks plus two compact delayed-like/retry cases. Coverage includes unchanged pending bounds/transparency on article and modal surfaces at 320/1280 px, both themes, one request, confirmed Like/Unlike, failed unlike retaining its previous state, and retry. Compact phone Dark and desktop Light pending screenshots were visually reviewed. Frontend lint/build, artifact validation, and scoped whitespace results are recorded in the progress tracker. Live persistence, physical devices, assistive technology, and other browser engines were not exercised.

## Comment presentation update — 2026-10-10

Follow-up spacing correction: CommentItem rows now use 12 px top/4 px bottom padding. Like/Reply/Edit/Delete use 8 px horizontal padding, zero extra inter-button gap, and top-aligned content with 4 px clearance after the comment body; the heart follows the label baseline. The 44 px hit targets and all action behavior remain intact. Changed CommentItem.tsx, this audit, UI rules, and progress tracker. All 12 existing mocked-API Chrome checks, frontend build, artifact validation (78 files, no source maps), and scoped whitespace validation passed. Desktop Light and compact phone Dark screenshots were reviewed; live persistence and physical-device behavior were not exercised.

The requested design update replaces the oversized tinted composer with the existing surface token, a 14 px border radius (matching ordinary app cards), 12/16 px compact/article padding, and a visible avatar circle. Its label/input/footer share one alignment; the footer separates a readable 12 px counter from a permanently visible 44 px Comment button, disabled for blank input. Cancel remains available when content is entered. The input can resize vertically and relies on the composer's focus treatment. Rows stack name/date, use secondary-color 12 px timestamps, 13/14 px compact/article content, and closer quiet actions without shrinking hit targets. This supersedes the earlier unchanged-presentation boundary only for the requested comment area.

Frontend changes: CommentsSection.jsx, CommentItem.tsx, and comment-actions.spec.js. Documentation: this audit, UI rules, and progress tracker. Existing Avatar/Button, DM Sans/Libre Baskerville, semantic palette, page/modal shells, routes, APIs, schemas, server state, authentication, and comment actions are preserved; no backend or dependency change.

Verification: all 12 distinct mocked-API Chrome checks completed successfully (eight added phone/desktop Light/Dark article/dialog cases and four existing action checks). New cases cover long names, horizontal bounds, 44 px submit targets, blank disabling, counter updates, Cancel, posting, one request, and cleared input. Phone Light/article, phone Dark/dialog, and desktop Light/article screenshots were visually reviewed. Frontend lint/build and artifact validation passed (78 files, no source maps). Localhost sandbox failures preceded the completed runs; a test-only ambiguous section selector was corrected. Live persistence, physical devices/keyboards, screen readers, and other engines were not exercised. Modal draft preservation remains a separate known limitation.

## Audit and completed behavior

The existing CommentsSection is shared by articles, CommentsModal, and short reading. Previously it rendered avatar/name/date/text rows and a paginated top-level list/composer. The backend supported listing/creation and already stored parentCommentId, but did not expose replies, editing, deletion, or comment likes.

CommentItem extends those rows with a heart/count like control, Reply, and owner-only Edit/Delete. The heart uses the existing article-appreciation shape: outlined when unselected, filled when liked, with Like/Unlike kept only in the accessible label. Editing and replying use labelled inline fields with the existing 1,000-character limit. Delete requires an explicit inline confirmation; the user approved preserving replies with deleted placeholders. Failed writes retain the form and confirmed content, show feedback, and allow retry. Busy controls prevent repeat activation. Guests can read comments/replies and open the existing sign-in modal from participation actions.

Replies load on demand with their own cursor pages and Load more control. Replies can themselves receive replies; indentation is bounded so deeper discussions remain usable on phones. Deletion clears only the selected comment text, hides public author identity and like controls, and leaves the discussion accessible through a deleted placeholder. The displayed total counts active comments and replies, excluding placeholders. Existing stored comments require no rewrite.

Frontend server state remains in TanStack Query, partitioned by restored viewer identity and parent comment. Confirmed actions refresh comment queries and update existing post-count caches. The backend retains Express routes/controllers, engagement service, post-access checks, Mongoose records, and the existing transaction helper. Server ownership and post scoping govern edits/deletes; likes use a separate unique relationship. Existing comment GET/POST contracts are extended without removing their fields; new mutation routes are versioned.

Typography, theme palette, page structure, navigation, existing comment-row composition, modal behavior, article likes, question answers, and unrelated working-tree changes are preserved. No dependency, optional refactor, or redesign is included.

## Changed files

- Backend: `controllers/engagement.controller.js`, `services/engagement.service.js`, `schemas/comment.schema.js`, new `schemas/comment-like.schema.js`, `routes/post.routes.js`, `routes/v1.routes.js`, `scripts/backfill-engagement-counts.js`, `scripts/seed-development.js`, `tests/foundation-contracts.test.js`, `tests/integration.test.js`.
- Frontend: `src/features/post/api/comments.js`, `src/features/post/hooks/useComments.js`, `src/features/post/pages/CommentsSection.jsx`, new `src/features/post/components/CommentItem.tsx`, new `tests/comment-actions.spec.js`.
- Documentation: this audit, UI rules/registry, progress tracker, and the matching local architecture companion.

## Verification

On 2026-10-10, all 92 backend contracts passed, including batched/viewer-specific presentation, deleted-content privacy, ownership/post scoping, explicit like operations, mutation authentication, and repeat-deletion counter behavior. Backend/frontend lint, frontend production build, artifact validation (78 files without source maps), and scoped whitespace checks passed.

All 14 distinct mocked-API Chrome checks completed across focused runs: four comment-action checks, five existing writer engagement checks, and five article-reading checks. New coverage includes 320 px Light/1280 px Dark, edit failure/retry, held like pending state, unlike, reply pagination/creation, delete cancellation/failure/retry, preserved replies/counts, guest gating, compact dialog keyboard editing, and opener focus restoration. Phone Light/desktop Dark thread screenshots were visually reviewed. The initial compact fixture lacked the writer join date; completing that fixture resolved its failure without a product change.

The database integration suite skipped because its opt-in service is disabled. New real-HTTP persistence coverage is present but unrun. Live persistence, external providers, physical phones, assistive technology, and other browser engines are not claimed as verified. No approval decision remains.

The subsequent 2026-10-10 heart-icon adjustment passed all four focused comment-action browser checks, including visible count-only text and outlined/filled SVG states at 320/1280 px. Production build, artifact validation, focused spec lint, and scoped whitespace checks passed. Changed files for this adjustment: CommentItem.tsx, comment-actions.spec.js, this audit, UI rules, and progress tracker; backend behavior is unchanged.
