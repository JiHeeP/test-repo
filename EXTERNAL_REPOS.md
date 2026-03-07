# External Repositories Policy

This workspace may clone external repositories under `external/` for side-by-side development.

## Current

- `external/plna` -> `https://github.com/JiHeP/plna`

## Rules

1. `external/` is ignored by this repository (`.gitignore`) to avoid mixing commits.
2. Work on each external repo from its own directory:
   - `cd external/plna`
3. Commit/push from that repo directly.
4. Keep `workspace-coding` focused on orchestration/docs/templates.

## Quick Start (plna)

```bash
cd external/plna
git checkout main
git pull origin main
# work...
git add -A
git commit -m "feat: ..."
git push origin <branch>
```
