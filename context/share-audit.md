# Share-control audit

Audited and standardized: 2026-10-08. Scope: every share entry point in `Frontend/src`, including shared cards rendered across routes.

## Inventory and completed behavior

The final user preference is the centered share modal reference, superseding the earlier anchored-popup preference on the same date.

| Entry point | Previous behavior | Completed behavior |
|---|---|---|
| Post detail (`features/post/pages/index.jsx`) | Anchored Copy Link / Share on X menu | Shared centered modal; canonical post URL |
| Short detail (`discovery/components/ShortReadModal.jsx`) | Centered nested modal with title and Close | Shared centered modal above the existing reader dialog |
| Collection detail (`collection/pages/CollectionDetail.jsx`) | Separate duplicate anchored menu | Shared centered modal; canonical collection URL |
| Discovery list/grid/short cards (`discovery/components/DiscoveryPostCard.jsx`) | Share link immediately copied | Share link opens the shared centered modal |
| Article of the Day (`discovery/pages/Explore/TrendingTab.jsx`) | Share link immediately copied, with silent copy failures | Shared centered modal with action feedback |
| Collection cards (`collection/components/CollectionCard.jsx`) | Share link immediately copied | Shared centered modal |

Source searches covered share handlers, ShareIcon, clipboard writes, native sharing, and X intent links. These six implementations cover their reused route surfaces (including Search, Home, Explore, Shorts, Saved, and collection reading lists). No other application share entry points were found. There is no backend sharing API or persistence mutation: sharing copies a public route or opens the existing X composer intent.

`ShareMenu.tsx` owns the final reference presentation: centered 320 px maximum-width rounded bordered panel, 16 px padding, content-specific title, Close, and two icon-led rows for Copy Link and Share on X. It reuses ModalLayer, useDialogFocus, the existing icons, theme colors, typography, and quiet shadow. Initial focus selects Copy Link; native Tab/Shift+Tab stays within the dialog. Close, Escape, and backdrop dismissal restore the trigger. The background is blocked. Opening share from short reading adds a native modal above the reader; closing it preserves the reader, comments, and reading position. Clipboard failures show existing toast feedback and retain options for retry; pending copy disables duplicate actions. X receives the URL only in a separate window with opener isolation; external publication is not claimed as verified.

The existing `ShareMenu.tsx` filename and caller contract are retained to avoid unrelated file moves. Detail triggers expose `aria-haspopup="dialog"`. The three overflow-menu entry points close their existing options menu before opening Share, then return focus to that options trigger. ViewportPopover's earlier dialog-container support remains available to its existing callers, but sharing now uses ModalLayer.

Page layout, typography, palette, share entry controls, author navigation, comments, appreciation/save/report actions, routes, API contracts, and schemas are preserved. The shared menu replaces duplicate sharing implementations only; unrelated refactoring is outside scope.

## Verification

On 2026-10-08, all 12 shared-modal checks and five existing detail/share checks completed successfully (17 distinct checks), after two stale collection menu assertions were updated to the dialog contract. Frontend lint, production build, artifact validation (76 files, no source maps), and whitespace checks passed; phone screenshots matched the supplied modal reference. Current modal verification is also recorded in the dated progress entry. `Frontend/tests/share-menu.spec.js` exercises all six entry points at 320/1280 px, both themes, centered bounds, accessible titles, Close/Escape/backdrop dismissal, focus containment/restoration, copy/X URLs, clipboard recovery, and preservation of the short reader. Existing article, collection, and short-detail tests use the modal contract. Live clipboard permissions, actual external X publication, other browser engines, physical phone keyboard/safe areas, and live persistence remain outside these mocked-API checks. The repository ESLint configuration excludes TSX; Vite compilation and browser tests cover the typed component.
