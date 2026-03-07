# Skills Structure Policy

## Single Source of Truth

For this repository, the canonical local skills live in:

- `workspace-coding/skills/`

Do not maintain duplicate copies of the same shared skills in nested project folders.

## Scope by Location

- `skills/` (repo root): shared local skills used across this workspace
- `concept-learning-studying/skills/`: project-specific skills only
- `/opt/homebrew/lib/node_modules/openclaw/skills`: global OpenClaw bundled skills (managed by installation)
- `/opt/homebrew/lib/node_modules/openclaw/extensions/*/skills`: extension-provided skills (managed by installation)

## Cleanup Decision (2026-03-07)

Removed duplicates from `concept-learning-studying/skills/`:

- `meta-skill-forge`
- `thinking-muscle-trainer`

Reason: these already exist in root `skills/` and should be managed in one place.

## Operating Rule

When adding a new skill:

1. If project-specific, place it under that project's `skills/`.
2. If reusable across workspace, place it under root `skills/`.
3. Avoid duplicate names across both locations unless intentionally forked.
