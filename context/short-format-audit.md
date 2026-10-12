# Short format rendering audit

## Scope and findings — 2026-10-12

Request: display and open shorts with the existing short components everywhere, and separate full articles and shorts in mixed collections.

The stored Post format already distinguishes `article` and `short`. Discovery summaries omitted that field, search/writer/competition/response queries omitted it in some projections, and collection detail rendered every item through the article card. Several independent history, profile, member, question, competition, and series rows also assumed an article. Canonical `/post/:id` links always mounted the full article page. No schema migration is needed.

## Required implementation inventory

- Backend summary/data flow: `services/post-presenter.service.js`, `controllers/search.controller.js`, `controllers/writer.controller.js`, `controllers/competition.controller.js`, `controllers/question.controller.js`, and `controllers/short-series.controller.js`. Preserve format in existing responses and enrich series entries using the existing presenter.
- Shared frontend presentation: `features/discovery/components/DiscoveryPostCard.jsx`, `ShortCard.jsx`, and `ShortReadModal.jsx`. Dispatch short formats through the existing short card, open the compact reader by default, and retain series/deeper links and opener focus across progression.
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
