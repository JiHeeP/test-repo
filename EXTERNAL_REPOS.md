# External Repositories Policy

This workspace may clone external repositories under `external/` for side-by-side development.

## Current

- `external/plna` -> `https://github.com/JiHeeP/plna`
- `external/forfun` -> `https://github.com/JiHeeP/forfun`

## Rules

1. `external/` is ignored by this repository (`.gitignore`) to avoid mixing commits.
2. Work on each external repo from its own directory:
   - `cd external/plna`
3. Commit/push from that repo directly.
4. Keep `workspace-coding` focused on orchestration/docs/templates.

## Quick Start (any external repo)

```bash
cd external/<repo-name>   # e.g., plna or forfun
git checkout main
git pull origin main
# work...
git add -A
git commit -m "feat: ..."
git push origin <branch>
```
