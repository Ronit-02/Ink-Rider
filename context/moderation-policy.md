# Ink-Rider moderation policy

Last updated: 2026-08-25

## Decision

Moderators and administrators may enforce community-policy violations. Enforcement is reversible and scoped to the reported subject; it is not a substitute for author self-management or permanent deletion.

### Authority matrix

| Action | Moderator | Administrator |
|---|---|---|
| Record a review, dismiss a report, or recommend action | Yes | Yes |
| Temporarily unpublish a post or short | Yes, up to 72 hours while review is active | Yes, with an expiry or explicit indefinite review state |
| Extend or make an unpublication indefinite | No | Yes |
| Temporarily suspend a user | Yes, up to 7 days | Yes, up to 30 days |
| Indefinite or permanent suspension | No | No through the ordinary staff flow; requires a separately authorized platform-owner action |
| Enforce against another moderator | Admin only | Another administrator only |
| Enforce against an administrator | No | No; escalate to platform owner / incident process |

Emergency action is allowed when content or an account presents an immediate safety, privacy, fraud, or legal risk. A moderator may hide the content or suspend access for up to 24 hours, must record the emergency reason, and an administrator must review it before expiry. Emergency action does not remove the appeal right.

Unpublishing hides the current public representation from discovery, search, recommendations, and normal public reads. It preserves the post, immutable revisions, engagement records, reports, and evidence. It does not delete content or erase the author’s private management access unless a separate account action applies. A suspension blocks sign-in and authenticated mutations; it does not delete the account or its records.

## Required decision standard

Staff must identify a policy code, state the facts relied on, and choose the narrowest effective action. A report alone is not proof. Repeated reports, popularity, criticism, or disagreement with an opinion are not sufficient grounds without a policy violation. The subject and any linked revision must be snapshotted in the enforcement record so later edits cannot rewrite the basis for action.

Recommended policy codes are `spam`, `harassment`, `hate`, `toxicity`, `plagiarism`, `misinformation`, `privacy_safety`, `fraud`, and `legal_request`. The code list may expand only through a documented policy update.

## Appeals

- The affected author or account holder receives the action, policy code, duration/expiry, and a plain-language explanation. Reporter identity and restricted evidence are not disclosed.
- One appeal may be filed per enforcement action within 30 days. An appeal must identify the action and provide a concise explanation or new evidence.
- Appeals are decided within 14 days where practical. The original actor cannot decide the appeal; the system must enforce this separation.
- A moderator action is appealed to an administrator. An administrator action is appealed to another administrator or the platform owner. Emergency actions may remain in force while the appeal is pending when safety requires it.
- Outcomes are `upheld`, `modified`, or `reversed`, with a required decision note. A reversal republishes content or restores account access only when no other active enforcement blocks it.
- An appeal decision cannot mutate or erase the original action; it creates a new linked audit event and notifies the affected user.

## Audit rules

Every review, enforcement, expiry, restoration, appeal submission, appeal decision, and emergency override is an append-only audit event containing:

- actor, role, subject type and ID, report ID, and linked appeal ID where applicable;
- action, policy code, prior state, resulting state, start time, expiry time, and timestamp;
- reason/note, evidence references or snapshot hash, affected revision ID, and request/correlation ID;
- whether the action was ordinary, emergency, automatically expired, modified, or reversed.

Audit records are never hard-deleted or edited. Corrections are new events. Reports and evidence are staff-restricted; the affected user can see their own action history and appeal outcomes, while the public sees only the resulting availability. Audit access is itself logged. Retain moderation and appeal records for seven years after the last related action, or longer where a legal hold applies.

Enforcement must be idempotent, must not cascade to unrelated posts or accounts, and must not remove competition or engagement history. Expiry jobs must be safe to retry. A staff member may not approve their own appeal or silently change an earlier decision.

## Implementation boundary

The current application remains non-enforcing until the implementation work adds these controls. Existing staff review actions remain valid, and `recommend_remove` / `recommend_suspend` continue to mean recommendation until enforcement routes, durable action fields, notifications, appeal records, and audit checks are implemented and tested.
