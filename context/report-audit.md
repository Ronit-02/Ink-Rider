# Report-button audit

Audited and corrected: 2026-10-08. Scope: all report actions in `Frontend/src`, including shared components used across routes.

| Entry point | Before | Completed behavior |
|---|---|---|
| Article detail, `features/post/pages/index.jsx` | Form inserted before the article body | Native report modal with the existing reason/details form and received confirmation |
| Discovery cards, `discovery/components/DiscoveryPostCard.jsx` | Reason picker expanded inside the options menu | Options menu closes; the same post-detail report form opens in a native modal, with optional Details, Cancel, and Report received confirmation; dismissal returns focus to options |
| Question detail, `discovery/pages/Explore/QuestionDetail.jsx` | Form expanded below question actions | Native report modal with the existing form and success feedback |
| Individual answers, same question-detail implementation | Form expanded inside the answer | Native report modal with the existing form and success feedback |

Shared discovery cards cover list, grid, and short variants across Home, Search, Explore, Shorts, Saved, and other reused lists. Source inspection found no other user-facing report buttons. Comments, writer profiles, collections, competitions, and the featured-story menu currently have no report trigger; this correction does not add reporting capabilities to those surfaces. Staff report review controls are moderation actions, not report-submission buttons.

`shared/components/ui/ReportModal.tsx` reuses `ModalLayer` and `useDialogFocus`: body portal, native modal top layer, viewport bounds, internal scrolling, accessible title, focus containment, background blocking, Close/Escape, and opener focus restoration. Backdrop clicks do not dismiss report forms. Post, short, question, and answer forms still discard their local drafts after explicit dismissal; failed submissions preserve values and allow retry. Guest triggers retain sign-in gating.

Post detail and discovery cards share `ReportForm.tsx`, extracted from the cleaner post-detail form. Both begin with Select a reason, expose optional Details (1,000-character limit), use the same field/button styling, preserve entered values after failure, and display Report received after success. Card reporting now accepts details through the existing API instead of always submitting an empty string. The existing post/question/answer hooks, authentication, reason options, private reporting, duplicate handling, and backend persistence contracts are preserved. No backend route, schema, service, or API change is needed. Page composition, typography, theme tokens, navigation, and unrelated actions remain unchanged.

## Naming convention

`reportTitle` in `ReportModal.tsx` owns “Report this <subject>”: post, short, collection, author, question, answer, or comment. Existing triggers and modal headings use Report this post, Report this short, Report this question, and Report this answer. Post detail uses the stored format; cards use their short variant or stored format. Collection/author/comment names are defined for reuse; those surfaces currently have no reporting control or supported submission route, so none is added here.

## Verification

`Frontend/tests/report-modal.spec.js` covers all four entry implementations plus short cards at 320 and 1280 px, native modality/body portals, viewport/overflow bounds, background focus blocking, forward/reverse Tab containment, Escape/focus return, failed submissions with preserved values, retry payloads, success, Close, and guest sign-in gating. Dated results are recorded in the progress tracker. Screenshots cover phone and desktop report dialogs. Browser tests use mocked HTTP data; live persistence, other browser engines, physical keyboards, and screen readers are outside this verification scope.

On 2026-10-08, all 15 report checks, 26 discovery-card checks, and seven article/question regression checks passed across completed Chrome runs (48 distinct checks). Frontend lint, focused spec lint, production build, artifact validation (76 files, no source maps), and scoped whitespace validation passed. Final phone/desktop screenshots were reviewed after removing duplicate article-panel chrome.

## Changed files

- `Frontend/src/shared/components/ui/ReportModal.tsx` (modal shell and shared subject naming).
- `Frontend/src/shared/components/ui/ReportForm.tsx` (shared post/short form extracted from post detail).
- `Frontend/src/features/post/pages/index.jsx` (article report modal and bounded form).
- `Frontend/src/features/discovery/components/DiscoveryPostCard.jsx` (card report modal).
- `Frontend/src/features/discovery/pages/Explore/QuestionDetail.jsx` (question and answer report modals).
- `Frontend/tests/report-modal.spec.js` (shared form, labels, retry, and short-detail regression coverage).
- `Frontend/tests/question-detail.spec.js`, `Frontend/tests/trending-menu.spec.js`, and `Frontend/tests/overlay-position.spec.js` (updated report labels and separate-modal expectations).
- `context/report-audit.md`, `context/modal-audit.md`, `context/ui-rules.md`, `context/ui-registry.md`, and `context/progress-tracker.md` (current behavior, inventory, and verification).
