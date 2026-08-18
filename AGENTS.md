# Ink-Rider agent instructions

This file is the repository-level operating contract for every coding agent working in Ink-Rider.

## Required reading before development

Before inspecting implementation details, planning, or changing code, every agent must read the entire project context:

1. Every file in `context/`.
2. The root `README.md`.
3. The relevant `Frontend/README.md` and package manifests.
4. Any existing task-specific instructions nearer to the files being changed.

Do not begin development until this reading is complete. If the context is missing, incomplete, or contradictory, report that fact and create a short audit before making implementation decisions.

## Preserve the existing project

Work strictly on top of the existing project. Ink-Rider must be extended on top of what is already built. Existing code, UI, design language, routes, schemas, APIs, folder structure, and business logic are the source of truth.

- Do not redesign the UI or replace the homepage/page structure.
- Do not change typography, colors, spacing, card structure, navigation, or interaction patterns merely for consistency or personal preference.
- Reuse existing components, styles, services, controllers, schemas, and API conventions before creating new ones.
- Do not rename, move, replace, or broadly refactor existing files unless the task explicitly requests it or the agent first presents the impact and receives approval.
- Prefer the smallest additive change that satisfies the requested feature.
- Apply this preservation rule equally to frontend and backend work.

## Required workflow

Before coding:

- First audit the current frontend and backend and report:
  - existing UI components, layout structure, typography, colors, and interaction patterns;
  - existing routes, APIs, schemas, services, and data flow;
  - exactly which files would need to change for the requested feature.
- State what will remain unchanged.
- Implement the smallest additive change possible and reuse existing components and conventions first.
- Separate required feature work from optional refactoring or visual improvements.
- Do not redesign pages, replace components, alter typography, colors, card styles, restructure navigation, rename or move files, refactor architecture, replace APIs, or change database models merely for consistency or improvement.
- If any change would modify an existing structure, show the proposed before/after impact and wait for explicit approval before coding.
- Ask for approval before any optional redesign, architecture migration, schema replacement, broad refactor, or other non-additive change.

During coding:

- Follow the conventions documented in `context/`.
- Keep unrelated changes out of the task.
- Preserve backward compatibility for existing routes, API contracts, and stored data unless a breaking change is explicitly approved.
- Use existing test, build, and verification commands.

After coding:

- Run proportionate tests/build checks.
- Update the relevant context documentation and `context/progress-tracker.md` with the completed work, verification result, and any remaining limitation.
- Ensure the context and progress tracker describe the completed behavior rather than the previous state.
- Clearly list changed files and any decisions that require user approval.

## Documentation maintenance

Every completed task must leave the context accurate. If a task changes architecture, routes, schemas, UI rules, scope, or progress, update the corresponding context file before finishing. Do not mark work complete while the progress tracker still describes the old behavior.
