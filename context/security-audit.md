# Application security audit and remediation

**Completed:** 2026-09-06  
**Scope:** React/Vite frontend, Express/Mongoose backend, authentication, authorization, sessions, OTP verification, dependencies, uploads, browser policy, errors, configuration, CI, and container builds.

## Outcome

The source-level findings from the application-security review were remediated without redesigning the UI, changing route names, or replacing domain models. Both npm dependency graphs now report zero known advisories. Backend contract tests pass 81/81, the production frontend build passes, and the generated 64-file artifact set contains no source maps. The database integration suite remains opt-in and was skipped locally because `RUN_DB_INTEGRATION=true` was not configured; CI retains the MongoDB-backed run.

Security is an ongoing release gate rather than a permanent “bug-free” state. Provider credentials, TLS termination, deployed CSP/HSTS headers, proxy topology, live Google/email/payment flows, and new advisories still require deployment-time and continuous verification.

## Findings and fixes

| Finding | Resolution |
|---|---|
| Suspended or deleted accounts could use valid access tokens | `validateToken` and `optionalAuth` now load current user state. Normal authentication requires an existing, verified, active account. Token refresh independently applies the same rule and revokes remaining sessions when the account is no longer eligible. |
| Access and refresh JWTs shared one unconstrained secret | Separate signing keys are derived from the configured high-entropy root secret. Tokens carry a purpose and use fixed HS256, issuer, and audience checks. Access and refresh tokens cannot be substituted for one another. Production rejects JWT secrets shorter than 32 bytes. |
| OTPs used `Math.random()` and had no attempt bound | OTP and avatar selection randomness now use `crypto.randomInt`. OTP verification atomically consumes one of five permitted attempts; expired, exhausted, and unknown codes return the same public failure. OTP documents remain TTL-expiring. |
| Authentication messages exposed account/provider state | Password authentication validates the password before exposing the verified-account flow, uses a dummy hash for timing consistency, and returns generalized invalid-credential responses. Signup collisions no longer reveal Google linkage. OTP resend returns the same response for missing, verified, suspended, and eligible accounts. |
| Google credentials were sent in a URL query | Google ID tokens are verified with Google's official server library, including audience and claim validation. Provider work is bounded by the configured timeout and credentials are never placed in URLs or logs. |
| Refresh sessions accumulated and rotation was delayed | Sessions now carry `expiresAt`, `lastUsedAt`, and `revokedAt`, with a TTL index. Every successful refresh rotates its session identifier and token. Refresh lookup binds the session to both user and identifier. Existing pre-hardening refresh tokens intentionally require a fresh login. |
| Cookie-authenticated endpoints lacked an origin check | Refresh, logout, and logout-all reject browser requests with an origin different from the configured frontend origin. The refresh cookie is narrowed to `/api/auth`; auth responses are marked `no-store`. Production rejects insecure cookies. |
| Rate limiting was process-local and unbounded | Development retains a bounded in-memory implementation. Production is required to use the shared MongoDB-backed atomic counter with TTL cleanup and hashed client/account keys. Authentication has both IP and account limits, while all API mutations have a broad abuse ceiling. Proxy trust is explicit and constrained. |
| Uploads trusted shallow file signatures | Uploads retain byte and type limits, then use Sharp to decode, pixel-bound, rotate, re-encode, and strip metadata before provider upload. Temporary files are removed on every validation failure. Multer was upgraded past the audited DoS versions. |
| URL validation relied on a prefix regex | Profile and workshop URLs now use a shared URL parser that permits only HTTP(S), requires a host, rejects credentials, and rejects control characters. |
| Browser and API headers were incomplete | The API emits CSP, frame, MIME, referrer, permissions, COOP, CORP, and production HSTS controls. The frontend HTML has a CSP compatible with its API, HTTPS images, and Google Identity Services. |
| Client request IDs were accepted without limits | Supplied IDs must match a restricted character set and 128-character limit; otherwise the API generates a UUID. |
| Source-map prevention was implicit | Vite now explicitly sets `build.sourcemap: false`. A standalone artifact verifier fails if a `.map` file or `sourceMappingURL` is found, and CI executes it after every build. |
| Known npm advisories affected both projects | Axios, React Router, Vite, Mongoose, Morgan, Multer, Nodemailer, and transitive dependencies were upgraded. Unnecessary `crypto`, `fs`, and direct `mongodb` package entries were removed. Both final audits report zero vulnerabilities. |
| Container dependency, secret, and privilege posture | API and worker images now use Node 22, deterministic `npm ci`, production-only backend dependencies, and the non-root `node` user. Docker context rules explicitly exclude nested environment files, private-key material, Git metadata, dependencies, builds, and test reports. |
| CI actions used mutable major-version tags | Official checkout, Node setup, and artifact upload actions were upgraded to their current major releases and pinned to the immutable commits referenced by those tags. |
| Secret-file exclusions depended only on package folders | Root Git and Docker ignore policies now exclude nested environment variants and private-key files while retaining committed `.env.example` templates. No real environment file is tracked. |

## Preserved behavior

- The `/write` route remains protected by the existing frontend `PrivateRoute`.
- Draft and publishing APIs remain protected server-side and owner-scoped.
- Existing visual design, typography, colors, layout, navigation, editor interaction, response DTOs, public route families, and domain data remain unchanged.
- Access tokens remain short-lived and held in frontend memory; refresh tokens remain HTTP-only cookies.

## Operational requirements

- Run Node 22 in development, CI, containers, and production. Package manifests reject runtimes older than Node 20.19.
- Use a random production `JWT_SECRET` of at least 32 bytes. Changing the secret invalidates all sessions.
- Set `NODE_ENV=production`, `COOKIE_SECURE=true`, an exact HTTPS `FRONTEND_URL`, and `RATE_LIMIT_BACKEND=mongo` in production.
- Set `TRUST_PROXY` only to the verified proxy-hop count or supported trusted subnet name. Leaving it blank is safer than trusting arbitrary forwarded headers.
- Serve the frontend over HTTPS and reproduce CSP/HSTS at the static host or edge. The HTML CSP is defense in depth; response headers remain preferred.
- Run `npm audit`, backend tests, frontend build, and `npm run security:artifacts` continuously. A zero-advisory result is time-specific and must be rechecked.

## Verification evidence

- Backend contracts: 81 passed, 0 failed on Node 24.19 (supported by the Node 22+ baseline).
- Backend database integration command: completed with one explicit skip because the local opt-in flag/database was unavailable.
- Frontend production build: passed with Vite 8.2.2; 694 modules transformed.
- Source-map artifact gate: passed across 64 generated files.
- Backend production dependency audit: 0 vulnerabilities.
- Frontend full dependency audit: 0 vulnerabilities.
- Git whitespace validation: passed after the final documentation updates.
