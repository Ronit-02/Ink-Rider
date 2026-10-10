# Page alignment audit

Scope: 2026-10-10, existing working tree. Horizontal application-page alignment and responsive overflow; this is not a page redesign.

## Cause and correction

Home and most content routes used the 1120 px PageFrame. Search centered a separate 920 px wrapper, History 850 px, Staff 1060 px, Write 1040 px, and the writer profile 1080 px. Writer loading/error states used 900/720 px wrappers; article loading centered an 800 px skeleton. The shell had a separate route-specific Back width table. Centering these different widths shifted page origins relative to Home once enough desktop space was available. The scroll container also did not reserve scrollbar space.

PageFrame and all Back rows now share app-page-frame, defined once in global CSS: 1120 px maximum width, centered in available sidebar-adjusted space, and 16/20/32 px gutters at the existing 640/768 px breakpoints. Search, History, Staff, Write, and writer-profile states reuse PageFrame. Article loading is inside PageFrame with a left-aligned 760 px skeleton column matching its ordinary reading column; short-reader modal skeleton sizing remains unchanged. The app scroll container uses scrollbar-gutter: stable.

The phone audit also reproduced clipped Staff section tabs at 320 px. The existing tab row now wraps whole controls. Typography, semantic Light/Dark palette, cards, nav destinations, internal cover/writing-control insets, article reading width, auth/onboarding compositions, centered access/recovery prompts, query behavior, and interactions are preserved. No API/controller/service/schema changes are required. Frontend server state still flows through TanStack Query and the existing API to Express services/Mongoose records.

## Route coverage and prevention

The new page-alignment browser spec inventories every configured route and fails when a route is added without updating the audit inventory. Its common-frame matrix includes Home; three Explore feeds and two detail routes; all four Search tabs; post, writer, collection, and short-series detail; Collections; Saved; Shorts; History; Opportunities; Members; Membership; Write; Profile and Edit profile; Settings; Help; and Staff. It compares every page's measured content origin against Home and the expected frame/gutters at 320/768/1280/1920 px in both themes, checks a single main landmark, Back alignment, and document/main/scroll-container overflow.

Separate checks cover detail/Search/History loading, missing, and ordinary error states; short-to-long scrollbar changes; keyboard sidebar resizing; guest protected prompts/private draft; writer-search and unknown-route recovery; standalone login/signup/verification; all three onboarding steps; notifications over Home; and secondary Staff, Profile, Saved, and Member panels. Screenshots and measurements are generated under the ignored frontend cache for review.

The 2026-10-10 standalone profile edit page reuses PageFrame and the existing shell Back row. It is included in the common-frame surface inventory and explicit route list; focused phone/desktop edit checks verify overflow. The original full alignment matrix is not claimed as rerun by this feature change.

## Changed files

- Shared implementation: `Frontend/src/shared/components/layout/PageFrame.jsx`, `AppLayout.jsx`, `Frontend/src/styles/global.css`, and `Frontend/src/shared/components/ui/Skeleton.jsx`.
- Pages: `Frontend/src/features/discovery/pages/Search/index.jsx`, `ReadingHistory.jsx`, `Frontend/src/features/user/pages/Author/index.jsx`, `Frontend/src/features/editor/pages/index.jsx`, `Frontend/src/features/staff/pages/StaffConsole.jsx`, and `Frontend/src/features/post/pages/index.jsx`.
- Verification: `Frontend/tests/page-alignment.spec.js` and `Frontend/tests/editor-layout.spec.js` (large-screen shared-frame expectation).
- Documentation: this audit, UI rules/registry, Back audit, and progress tracker.

## Verification

Verified on 2026-10-10 with installed Chrome and mocked HTTP fixtures: all 17 distinct page-alignment checks passed across the full matrix and focused follow-up runs; all 31 existing editor-layout, Back-navigation, and Search-filter checks passed; all four existing Back surface matrices passed at 320/1280 px in Light/Dark. The writer-profile override that removed Back clearance was removed, resolving the earlier documented initial-spacing failure. Frontend lint, production build, and security artifact validation passed (78 files, no source maps).

Every inventoried route's phone Light and desktop Dark screenshots were visually reviewed, together with guest/auth/onboarding/recovery and secondary-panel screenshots at 320/1280 px. Automated frame/overflow measurements cover 320/768/1280/1920 px in both themes; the existing editor suite additionally covers 390/2560 px. Browser runs used a temporary ignored Playwright config selecting installed Chrome and a task-owned local Vite server because the bundled Chromium executable was unavailable. Screenshots/measurements remain in `Frontend/node_modules/.cache/page-alignment/`.

Tests do not mutate a live database or activate providers. Physical devices, assistive technology, and other browser engines were not exercised. Future regression coverage reduces recurrence risk; it cannot guarantee that every future content or browser condition is defect-free. No approval decisions remain.
