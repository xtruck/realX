# A1: CI did not check that the committed web bundles are fresh

## Change
- `.github/workflows/ci.yml`, job `webapp`, new step after `npm test`: runs `npm run build`, then
  `git diff --ignore-cr-at-eol --exit-code -- ../src/realx/web`; on a diff it prints an `::error::` telling the
  developer to run `cd webapp && npm run build` and commit. It also fails if the build creates an untracked file in
  `src/realx/web`.
- `webapp/tools/check-bundles.mjs` + npm script `check:bundles`: the local equivalent. It snapshots every file in
  `src/realx/web`, runs `build.mjs`, compares ignoring CRLF/LF, restores the tree exactly, and exits 1 listing stale files.
- `CLAUDE.md` Commands: one line for `npm run check:bundles`.
- No shader or app code changed.

## Proof (Windows checkout, Node only)
- `npm ci --ignore-scripts && npm test`: 389 tests, 389 pass, 0 fail.
- Current tree: `npm run check:bundles` -> `bundles up to date (15 files in src/realx/web match a rebuild)`, exit 0.
- After appending `console.log("stale-proof");` to `webapp/src/dock/dock.js` (reverted afterwards):
  ```
  Stale bundles in src/realx/web (they do not match a rebuild from webapp/src):
    - dock.js
  Run `cd webapp && npm run build` and commit the result.
  ```
  exit 1. After `git checkout` of the source the check passes again and `git status` shows no stray changes.
- The CI diff command after a local rebuild on the current tree: `git diff --ignore-cr-at-eol --exit-code` exit 0.

## Not verified
- The workflow step itself has not run on GitHub Actions (Linux). Esbuild output should be byte-identical there
  since versions are pinned (esbuild 0.25.5 via the lockfile), but a first CI run confirms it.
