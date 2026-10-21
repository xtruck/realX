// Fails if the committed bundles in src/realx/web differ from a fresh `npm run build` of webapp/src.
// Line endings are ignored (a Windows checkout rebuilds with CRLF). The files on disk are restored afterwards,
// so the check never modifies the tree; to fix a failure run `cd webapp && npm run build` and commit.
import { execFileSync } from "node:child_process";
import { readdirSync, readFileSync, writeFileSync, statSync, rmSync } from "node:fs";
import { join, relative, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const webDir = join(root, "..", "src", "realx", "web");

function snapshot(dir, out = new Map()) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) snapshot(p, out);
    else out.set(relative(webDir, p).replaceAll("\\", "/"), readFileSync(p));
  }
  return out;
}
const norm = (b) => b.toString("latin1").replace(/\r\n/g, "\n");

const before = snapshot(webDir);
execFileSync(process.execPath, ["build.mjs"], { cwd: root, stdio: "pipe" });
const after = snapshot(webDir);

const stale = [];
for (const [name, buf] of after) {
  if (!before.has(name)) stale.push(`${name} (missing from the committed tree)`);
  else if (norm(before.get(name)) !== norm(buf)) stale.push(name);
}
// put the tree back exactly as it was
for (const [name, buf] of before) writeFileSync(join(webDir, name), buf);
for (const name of after.keys()) if (!before.has(name)) rmSync(join(webDir, name));

if (stale.length) {
  console.error("Stale bundles in src/realx/web (they do not match a rebuild from webapp/src):");
  for (const n of stale) console.error("  - " + n);
  console.error("Run `cd webapp && npm run build` and commit the result.");
  process.exit(1);
}
console.log(`bundles up to date (${after.size} files in src/realx/web match a rebuild)`);
