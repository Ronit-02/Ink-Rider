# Ink-Rider security assurance

Last reviewed: 2026-10-13

## Purpose

Security is a continuous release requirement, not a one-time certification. Ink-Rider protects accounts, private activity, authored work, and community participation through server-side authorization, input validation, safe handling of untrusted content, privacy-aware observability, and proportionate abuse controls.

## Tracked assurance commitments

- Every mutable capability requires server-side authentication and authorization.
- Public responses expose only information appropriate to the audience and never rely on client visibility as an access-control boundary.
- Untrusted text, URLs, and media are validated before use; content rendering must remain safe by default.
- Authentication, reporting, voting, search, and other abuse-prone flows receive proportionate rate and misuse controls.
- Logs, tests, documentation, build artifacts, and repositories must not disclose secrets or private content.
- Dependencies, production headers, transport configuration, and deployment behavior require review before release.

## Verification boundary

Source-level tests and build checks provide useful but incomplete evidence.

On 2026-10-13, the backend production dependency lockfile was refreshed with `npm audit fix`. `npm audit --omit=dev --audit-level=low` then reported zero vulnerabilities. The backend contract suite passed (106/106). A separate full dependency audit still reports three high findings through the development-only `nodemon` → `chokidar` → `braces` chain; npm's suggested forced fix would downgrade nodemon and was not applied.

On 2026-10-13, the frontend lockfile was refreshed for `brace-expansion` and `source-map-js`. `npm audit --audit-level=low` then reported zero vulnerabilities, and the frontend production build passed.
