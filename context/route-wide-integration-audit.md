# Route-wide integration audit

Last reviewed: 2026-09-08

## Scope

The integration suite exercises persisted HTTP route families alongside focused contract tests. It is intended to catch wiring failures that unit-level controller or service coverage can miss.

## Ongoing expectations

- Add or revise integration coverage when a persisted route family changes.
- Exercise representative read, mutation, authorization, and failure paths.
- Treat historical test totals and one-off remediation results as evidence for their recorded run only; rerun the relevant suite for current status.

Detailed historical findings and CI topology remain local operational context.
