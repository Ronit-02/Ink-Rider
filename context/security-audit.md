# Ink-Rider security assurance

Last reviewed: 2026-09-08

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

Source-level tests and build checks provide useful but incomplete evidence. Production controls and prior remediation history are maintained in `sensitive context/security-audit.local.md` when available and must be verified in the target environment.
