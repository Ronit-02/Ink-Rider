# Short format rendering audit

## Compact series item list — 2026-10-16

Series detail presents posts and shorts as numbered compact rows rather than embedding discovery cards in full-width rows. Each row uses the existing display font and theme colors for a linked title, at most two preview lines, reading time, and the shared item action menu. A short title opens the existing short reader in place; an article title opens its canonical post route. The number, text, and action occupy separate responsive columns, including at 320 px. Series data and other card surfaces are unchanged.

Post-series rows with a cover use the existing `ImageBox` at a 16:9 ratio. The cover sits beside the text on wider screens and above it within the content column on narrow screens. Posts without covers and short-series rows keep the compact text layout.

## Series reader progression — 2026-10-16

The short series detail page opens its ordered short cards in one shared reader. The reader receives the published series item IDs, so its existing wheel, touch, and external Up/Down controls advance through those list items. Within a short, the series section follows the body and names the next short beside an Open next short in series action. Full posts likewise name the next post after the body and use Open next post in series. Both reuse the existing post detail `seriesContext` title and ID; no route, API, or schema change is needed.

## Add to series entry points — 2026-10-15

Released owner shorts now expose the same format-aware Add to series flow as articles in shared card overflow menus, Writing studio management menus, and the detailed short-reader footer. The shared dialog lists only matching short series and preserves current membership, capacity, pending, failure, and focus behavior. Article cards and the full article reader use the same dialog with story-series choices. The backend append operation retains ownership, release, format, order, 50-part, and single-series rules without changing the schema or existing creation/update routes. Focused verification and the complete changed behavior are recorded in the progress tracker.

## Scope and findings — 2026-10-12

Request: display and open shorts with the existing short components everywhere, and separate full articles and shorts in mixed collections.

The stored Post format already distinguishes `article` and `short`. Discovery summaries omitted that field, search/writer/competition/response queries omitted it in some projections, and collection detail rendered every item through the article card. Several independent history, profile, member, question, competition, and series rows also assumed an article. Canonical `/post/:id` links always mounted the full article page. No schema migration is needed.

## Required implementation inventory

- Backend summary/data flow: `services/post-presenter.service.js`, `controllers/search.controller.js`, `controllers/writer.controller.js`, `controllers/competition.controller.js`, `controllers/question.controller.js`, and `controllers/short-series.controller.js`. Preserve format in existing responses and enrich series entries using the existing presenter.
- Shared frontend presentation: `features/discovery/components/DiscoveryPostCard.jsx`, `ShortCard.jsx`, and `ShortReadModal.jsx`. Dispatch short formats through the existing short card, open the compact reader by default, and retain series/deeper links and opener focus across progression.
- The `/shorts` page passes its currently loaded and topic-filtered card IDs to `ShortReadModal`. The reader keeps a stable responsive frame and advances within that ordered list with a 520 ms bottom-to-top or top-to-bottom slide. Wheel/touch gestures at the reading pane edge and wheel gestures over the surrounding overlay outside the modal work at every size; medium and large screens also show external Up/Down controls on the right. The inline Previous/Next and position strip is removed. The compact comments disclosure and appreciation actions stay in the fixed footer, with expanded comments keeping wheel and touch scrolling inside their bounded region without changing the active short. Its existing dimmed backdrop also applies a small blur so surrounding page content does not distract from reading or the modal actions. Navigation does not change the page or request more feed pages. Other reader entry points continue using their existing series or canonical progression.
- Canonical reading: `features/post/pages/index.jsx`. Select the reader by fetched format while retaining `/post/:id` and existing article rendering. Series progression replaces the current short URL so dismissing returns to the originating page.
- Collections: `features/collection/pages/CollectionDetail.jsx` and `SavedPage.jsx`. Preserve format in saved normalization; render nonempty Full articles and Short reads sections, with order controls operating within each format and the existing combined `postIds` write contract.
- Independent frontend rows: `features/user/pages/Author/index.jsx`, `features/user/pages/Profile/index.jsx`, `features/discovery/pages/ReadingHistory.jsx`, `features/membership/pages/MemberHub.jsx`, `features/discovery/pages/Explore/QuestionDetail.jsx`, `CompetitionDetail.jsx`, `CompetitionsTab.jsx`, `TrendingTab.jsx`, and `features/discovery/pages/ShortSeriesDetail.jsx`. Reuse ShortCard for short entries; the featured article slot selects an article.
- Regression coverage: `Frontend/tests/short-format.spec.js`, `Frontend/tests/collection-detail.spec.js`, and `Backend/tests/foundation-contracts.test.js`.

## Writing studio management cards — 2026-10-13

Writing studio Shorts now use the existing centered/left-aligned responsive short grid and a dedicated `WritingStudioShortCard` that reuses shared ShortCard presentation while replacing its discovery menu with the same owner `WritingPostMenu` used by article rows. Edit, Unpublish/Republish, and Delete continue through existing APIs and dialogs. Public Profile/Author and discovery ShortCard menus are unchanged.

## Short tags — 2026-10-13

Short-card previews omit tag chips in every layout. The detailed `ShortReadModal` displays every tag below author metadata. Heart and comment controls occupy their own footer row in previews. Tag values and search destinations reuse the existing post data and tag links; APIs, storage, routes, card geometry, and the reader layout are unchanged.

## Short header — 2026-10-13

Short cards across every caller now place writer identity beside the overflow action and date/reading time on a separate full-width row. The author avatar/name sits lower to align with the center of the 44 px overflow target; the target itself stays in its normal position. When both date and reading time are present, their separator dot stays attached between them and cannot wrap by itself. Article card metadata and the shared AuthorMeta contract remain unchanged.

## Separate short-card presentation — 2026-10-13

`ShortCard.jsx` now owns short-card markup and interactions. `DiscoveryPostCard.jsx` dispatches short formats to that component and retains article list/grid presentation. Shared discovery actions live in `PostCardMenu.jsx`, reused by both card components and FeaturedPostCard. Short callers and owner menu overrides keep their existing props and behavior.

## Preservation and behavior

Reuse existing short card typography, theme variables, borders, metadata/actions and compact ModalLayer reader; existing full article cards/pages, page frames, navigation, editor, ownership/voting/publication controls and APIs remain intact. These changes correct format selection and add the requested collection sections; they introduce no optional redesign, route replacement, or database model change. Missing format on legacy posts defaults to article.

Ordinary short card clicks open the reader in place. Modified clicks retain canonical links; direct links open the same compact reader. Series previous/next remain compact, Go deeper opens its full article, and short opens use the existing interaction event endpoint. Collection grouping preserves relative order within each format; moving a short never moves an article.

Verification results are recorded in the dated progress tracker entry. Browser coverage uses mocked APIs; it does not validate a live database or deployment.

## Short series reader navigation — 2026-10-16

The short reader now uses the same single navigation row as the full article footer after the short body. A next-part row shows the next part number and title and advances within the reader when activated. The final part shows a matching row linking to the series overview. The prior separate series title link, part count, next-title text, and button in this section are superseded; the reader's other actions and list navigation remain unchanged.

### Compact short series strip — 2026-10-16

The short reader's next-part control is a compact full-width strip fixed directly above the Comments/action footer, outside the scrollable story pane. It uses a small part label, one-line title, and arrow; a single button advances to the next short. The last part uses the same strip to open the series overview. Long story content continues to scroll independently beneath the fixed strip. This supersedes the larger in-content navigation row described above.

## Short reader footer actions — 2026-10-16

The compact short reader footer now presents Like, Comment, Save, and Share in that order. Comment toggles the existing inline composer and discussion pane; the separate Comments disclosure row is removed. The Series action is removed from this footer. The fixed series progression strip above the footer remains available when a short belongs to a series. Other Add to series entry points are unchanged.

### Series completion context — 2026-10-16

The short reader shows the final-part Series complete strip only when opened from a series detail page. A final short opened from a standalone card, feed, search, or canonical post route has no completion strip. Next-part navigation remains available wherever series context exists, and series-detail readers still show the completion link at the end.
