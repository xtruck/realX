# Avatar renderer

Source of `src/realx/web/avatar.bundle.js`: three.js and @pixiv/three-vrm (both MIT)
plus `src/avatar.js`, bundled by esbuild so the local server can serve one script under
a strict Content-Security-Policy. The bundle is committed, so end users need no Node.

    cd webapp && npm ci && npm run build

Versions are pinned in `package.json` and `package-lock.json`. Rebuild and re-run the
tests (`tests/test_character.py` drives the bundle in a real browser) after changing them.
