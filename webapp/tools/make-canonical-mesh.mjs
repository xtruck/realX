// Turns MediaPipe's canonical face mesh (canonical_face_model.obj, Apache-2.0) into src/facemesh/canonical.json.
//
//   node tools/make-canonical-mesh.mjs path/to/canonical_face_model.obj
//
// Source: https://github.com/google/mediapipe/blob/master/mediapipe/modules/face_geometry/data/canonical_face_model.obj
// The file is checked against a pinned hash, and every vertex must carry exactly one texture coordinate, so a changed
// or damaged download fails here instead of showing up as a distorted face later.
import { createHash } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const SOURCE_SHA256 = "8bac80443397e113f41a8b565ea72c59390bc031d9defab289dba7bc0c54e618";
const VERTICES = 468, TRIANGLES = 898;

const input = process.argv[2];
if (!input) { console.error("usage: node tools/make-canonical-mesh.mjs canonical_face_model.obj"); process.exit(2); }
const raw = readFileSync(input);
const sha = createHash("sha256").update(raw).digest("hex");
if (sha !== SOURCE_SHA256) { console.error(`unexpected file: sha256 ${sha}`); process.exit(1); }

const vt = [];
const triangles = [];
const uvOfVertex = new Map();   // vertex index -> texture coordinate index (they must agree on every corner)
for (const line of raw.toString("utf8").split(/\r?\n/)) {
  const p = line.trim().split(/\s+/);
  if (p[0] === "vt") vt.push([Number(p[1]), Number(p[2])]);
  else if (p[0] === "f") {
    if (p.length !== 4) throw new Error(`not a triangle: ${line}`);
    for (const corner of p.slice(1)) {
      const [v, t] = corner.split("/").map((n) => Number(n) - 1);
      if (uvOfVertex.has(v) && uvOfVertex.get(v) !== t) throw new Error(`vertex ${v} has two texture coordinates`);
      uvOfVertex.set(v, t);
      triangles.push(v);
    }
  }
}
if (vt.length !== VERTICES || triangles.length !== TRIANGLES * 3 || uvOfVertex.size !== VERTICES) {
  throw new Error(`expected ${VERTICES} vertices and ${TRIANGLES} triangles, got ${uvOfVertex.size} and ${triangles.length / 3}`);
}
const uv = [];
for (let v = 0; v < VERTICES; v++) {
  const [u, w] = vt[uvOfVertex.get(v)];
  uv.push(Number(u.toFixed(6)), Number(w.toFixed(6)));
}
const out = {
  source: "mediapipe canonical_face_model.obj (Apache-2.0)",
  sha256: sha,
  vertices: VERTICES,
  triangles,   // flat, 0-based vertex indices, 3 per triangle
  uv,          // flat, u v per vertex as in the OBJ (v counts from the bottom of the texture)
};
const target = join(dirname(fileURLToPath(import.meta.url)), "..", "src", "facemesh", "canonical.json");
writeFileSync(target, JSON.stringify(out) + "\n");
console.log(`wrote ${target}: ${VERTICES} vertices, ${TRIANGLES} triangles`);
