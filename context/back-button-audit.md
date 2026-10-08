# Back-button visual audit

Audited and corrected: 2026-10-08. Scope: every BackButton caller and every route opted in by AppLayout in the existing working tree.

## Inventory

| Surface | Placement owner | Completed placement |
|---|---|---|
| Article `/post/:id` | AppLayout | Dedicated row aligned with article content, before tags/cover and reading tools |
| Writer `/author/:handle` | AppLayout | Matches the 1080 px profile wrapper and 24/32 px gutters; leaves space above the cover |
| Question `/explore/questions/:id` | AppLayout | Dedicated row before question identity/title |
| Competition `/explore/competitions/:id` | AppLayout | Dedicated row before competition cover |
| Collection `/collections/:id` | AppLayout | Dedicated row before collection cover |
| Series `/shorts/series/:id` | AppLayout | Dedicated row before series label/title |
| Search `/search` | AppLayout | Matches the existing 920 px wrapper and 20/32 px gutters |
| History `/history` | AppLayout | Matches the existing 850 px wrapper and 20/32 px gutters |
| Membership `/membership` | AppLayout | Dedicated row before page heading |
| Settings `/settings` | AppLayout | Dedicated row before page heading |
| Help `/help` | AppLayout | Dedicated row before page heading |
| Login `/login` | Login form | Existing form position above the brand |
| Signup `/signup` | Login form | Existing form position above the brand |
| Email verification | Verification form | Existing form position above the brand |
| Onboarding steps 2 and 3 | Onboarding | Existing previous-step position beside Skip and Next/Get Started; step 1 has no Back |

Source search found no other Back controls or independent history-back handlers. Primary routes retain no Back. Authentication verification is a state inside the existing login/signup component, not a new route.

## Findings and corrections

- The filled rounded pill carried excessive visual weight. Back now uses a borderless, transparent arrow-and-label presentation with 13 px medium body text, an 18 px rounded-stroke arrow, an 8 px gap/radius, subtle theme-based hover feedback, and a 44 px minimum hit height. Disabled behavior remains available.
- Keyboard focus previously combined the global outline with a component ring. The shared control now explicitly opts out of the global outline and retains one visible focus ring.
- The writer cover began at the Back control's bottom edge (zero clearance), so its focus treatment touched the cover. Content now starts at least 16 px after Back, or 24 px at desktop widths.
- Search and History reused the wider shell Back row despite narrower page wrappers. At 1280 px, Back was respectively 80 and 115 px left of the content. Their row width/gutters now match those existing pages; the arrow aligns with the content edge. Writer gutters also match its existing wrapper.
- Scoped spacing after the shell's Back row replaces inconsistent 32–48 px gaps with 16 px on narrow screens and 24 px at 768 px and above. Primary-page spacing and auth/onboarding composition are unchanged.

No covering element was found over the actual Back hit area on the audited populated pages. The concrete collision was writer-cover/focus clearance, alongside the alignment and duplicate-focus defects. Rounded corners were excluded from hit sampling because they are intentionally outside the rounded target.

## Architecture and change boundary

React Router still owns browser-history Back and fresh-entry parent fallbacks. AppLayout owns application Back rows; authentication and onboarding reuse the same component in their existing positions. The existing DM Sans/Libre Baskerville typography, semantic theme palette, global navigation, feature content, and page widths remain intact. The backend's Express routes, controllers/services, Mongoose records, API DTOs, authentication, and entitlement flow require no change for this presentation correction. Mocked HTTP responses supply populated UI for repeatable verification without live data mutations.

Implementation files: `Frontend/src/shared/components/ui/BackButton.tsx`, `Frontend/src/shared/components/layout/AppLayout.jsx`, and `Frontend/src/styles/global.css`. Verification files: new `Frontend/tests/back-layout-audit.spec.js` and updated `Frontend/tests/back-navigation.spec.js`. This report owns detailed audit findings; UI rules and registry own the reusable contract.

## Verification boundary

The visual matrix captures all 15 route/state variants at 320 and 1280 px in saved Light/Dark themes. Automated checks cover loaded content alignment, at least 16 px clearance, unobstructed hit areas, 44 px targets, keyboard focus, horizontal overflow, detail loading/missing/ordinary-error recovery, intermediate responsive widths, short authentication/onboarding forms, and existing history/parent behavior. Screenshots and measurements are local generated evidence under `Frontend/node_modules/.cache/back-layout-audit/`.

Final dated command results are recorded in the progress tracker after completion. Physical phone safe areas/keyboards, real browser zoom, screen-reader announcements, Firefox/WebKit, and live persistence are outside these Chromium/mock-API checks. The repository lint configuration excludes TSX; Vite compilation and browser checks cover BackButton. No optional redesign or backend migration is part of this task.
