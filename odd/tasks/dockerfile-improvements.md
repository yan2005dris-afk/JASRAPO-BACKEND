# Feature: Dockerfile improvements (pnpm-containerization skill)

## Objective
Apply the findings of the pnpm-containerization review to the three Dockerfiles in the
JASRAPO-BACKEND repo: `backend/Dockerfile`, `external/open-api-facturacion-sri/Dockerfile`,
and the dead `backend/.dockerignore` artifact.

## Scope & Constraints
- One Dockerfile per service (Hard Rule #1). No multi-target root Dockerfile.
- Pin Node via the pnpm runtime, not the base image (Hard Rule #2).
- Keep the pnpm/npm store in a BuildKit cache mount — never bake it into a layer (Hard Rule #3).
- `allowBuilds` must list every package that needs a postinstall script (Hard Rule #4).
- No `set this to true or false` placeholders in `allowBuilds` (Hard Rule #5).
- For pnpm services, the root `pnpm-lock.yaml` covers the workspace (single-package backend
  workspace, so no per-service drift).
- For non-pnpm services (open-api-facturacion-sri uses npm), apply the cache-mount pattern
  via `--mount=type=cache,target=/root/.npm` instead.
- Run `hadolint` on every modified Dockerfile before committing.
- Conventional Commits, one work-unit per commit on a feature branch.

## Tasks
- [x] Task 1: Migrate `backend/Dockerfile` base from `node:22-alpine` to `ghcr.io/pnpm/pnpm:12`
      with `pnpm runtime set node 24 -g`, drop the curl-based pnpm installer, and add
      `HEALTHCHECK` in the runner stage.
- [x] Task 2: Refactor `external/open-api-facturacion-sri/Dockerfile` to add a
      `--mount=type=cache,target=/root/.npm` cache mount, switch to `npm ci` (drop
      `--legacy-peer-deps` if a `package-lock.json` exists), and add a non-root `USER node`.
- [x] Task 3: Delete dead artifact `backend/.dockerignore` (the build context is the repo
      root, so this nested ignore is never read). **Superseded by Task 3b** (see iteration note).
- [x] Task 3b (iteration): Restore `backend/.dockerignore` as a defensive per-service ignore
      after the user flagged the removal. The file is harmless to keep.
- [x] Task 4: Verify with `hadolint` (DLxxxx warnings reviewed), `git status` clean per
      task, and capture commit SHAs as evidence.
- [x] Task 5 (iteration): Drop `corepack enable && corepack prepare pnpm@12.3.4 --activate`
      from the backend Dockerfile. The `ghcr.io/pnpm/pnpm:12` base ships pnpm 12.x but does
      NOT include corepack, npm, or node. The user's `pc up --build` failed with
      `corepack: not found`. Replaced with `pnpm runtime set node 24 -g` (which is what
      actually installs Node 24 in the pnpm runtime). Verified locally: pnpm 12.9.1 +
      Node 24.21.0 in the base image.

## Evidence (commit SHAs)
- Task 1: 2172153e18752e3b848d62b6d52ff48903395659
- Task 2: fc82bf76f174a3a8bda5295a183784e577a2ff24
- Task 3: edf5b0da9b1419fdbe8ecae0523f1213e61f1fb2 (superseded by 3b)
- Task 3b: e5cecaf8 (restore)
- Task 4: hadolint run on `backend/Dockerfile` and `external/open-api-facturacion-sri/Dockerfile`; no new errors or warnings.
- Task 5: 85e387fd (drop corepack; verified locally with `podman build --target base`)

## Verification
- `hadolint backend/Dockerfile` → 0 errors, only accepted warnings.
- `hadolint external/open-api-facturacion-sri/Dockerfile` → 0 errors, only accepted warnings.
- No bake-in of pnpm store / node_modules into image layers (cache mount present on every
  package install).
- `pnpm-workspace.yaml` `allowBuilds` left untouched (already complete for backend).

## Out of scope
- Updating the git worktrees (`JASRAPO-BACKEND-worktrees/pr252-fix`,
  `JASRAPO-BACKEND-worktrees/pr261-mergefix`): they are detached from `develop` and the
  user owns their propagation.
- Fixing the vendored `external/open-api-facturacion-sri/.git` antipattern.
- Repairing the empty `dependencies`/`devDependencies` in
  `external/open-api-facturacion-sri/package.json` (would prevent `nest build` from
  succeeding today; flagged for follow-up).
