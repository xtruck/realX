// Mira's hair physics, with the real three-vrm spring-bone solver and no browser: the hair hangs, stays out of the head and
// body, lags when the head turns, and is pushed by a hand that moves into it. Numbers are metres in the character's own space.
import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import * as THREE from "three";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";
import { VRMLoaderPlugin } from "@pixiv/three-vrm";
import { allFinite, collectHairTips, healHair, tipPositions } from "../src/hair.js";

const FILE = new URL("../../src/realx/web/avatars/mira.vrm", import.meta.url);
const HEAD_COLLIDER = { y: 0.20, r: 0.225 };       // as written by scripts/make_character.py
const PALM = { x: 0.03, r: 0.055 };
const STEP = 1 / 60;

async function loadMira() {
  const buf = readFileSync(FILE);
  const loader = new GLTFLoader();
  loader.register((p) => new VRMLoaderPlugin(p));
  const gltf = await new Promise((res, rej) => loader.parse(buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength), "", res, rej));
  const vrm = gltf.userData.vrm;
  vrm.humanoid.autoUpdateHumanBones = false;       // this test moves raw bones itself; the page drives normalised ones
  vrm.scene.updateMatrixWorld(true);
  return vrm;
}

const at = (o) => o.getWorldPosition(new THREE.Vector3());
const named = (vrm, name) => vrm.scene.getObjectByName(name);
const hairJoints = (vrm) => { const out = []; vrm.scene.traverse((o) => { if (/^hair_\d+_\d+$/.test(o.name)) out.push(o); }); return out; };
const tips = (vrm) => { const out = []; vrm.scene.traverse((o) => { if (/^hair_\d+_tip$/.test(o.name)) out.push(o); }); return out; };
function run(vrm, steps) { for (let i = 0; i < steps; i++) vrm.update(STEP); }

test("the model has hair strands, and colliders for the body and the hands", async () => {
  const vrm = await loadMira();
  assert.equal(tips(vrm).length, 11);
  assert.ok(vrm.springBoneManager.joints.size >= 60, "every strand segment is a simulated joint");
  assert.ok(vrm.springBoneManager.colliders.length >= 20);
});

test("hair settles hanging below the base of the head, none in front of the chest", async () => {
  const vrm = await loadMira();
  run(vrm, 300);
  const head = at(named(vrm, "head"));
  for (const tip of tips(vrm)) {
    const p = at(tip);
    assert.ok(p.y < head.y - 0.05, `a strand hangs below the base of the head, down to the shoulders (y ${p.y.toFixed(3)})`);
    assert.ok(p.z < 0.15, `no strand ends up in front of the chest (z ${p.z.toFixed(3)})`);
  }
});

test("hair never passes through the head", async () => {
  const vrm = await loadMira();
  run(vrm, 200);
  const head = at(named(vrm, "head")).add(new THREE.Vector3(0, HEAD_COLLIDER.y, 0));
  for (const joint of hairJoints(vrm)) {
    assert.ok(at(joint).distanceTo(head) >= HEAD_COLLIDER.r * 0.9, `${joint.name} is outside the skull`);
  }
});

test("hair lags behind a quick turn of the head, then catches up", async () => {
  const vrm = await loadMira();
  run(vrm, 200);
  const head = named(vrm, "head");
  const strand = named(vrm, "hair_5_tip");          // the one straight down the back
  const local = () => head.worldToLocal(at(strand));
  const rest = local();
  let worstLag = 0;
  for (let i = 0; i < 12; i++) { head.rotation.y += 0.07; vrm.scene.updateMatrixWorld(true); vrm.update(STEP); worstLag = Math.max(worstLag, local().distanceTo(rest)); }
  assert.ok(worstLag > 0.01, `the strand swings against the turn (lag ${worstLag.toFixed(3)} m)`);
  head.rotation.y = 0; run(vrm, 300);
  assert.ok(local().distanceTo(rest) < 0.05, "and hangs back where it was once the head is still");
});

test("a hand moved into a strand pushes it out of the way", async () => {
  const free = await loadMira();
  run(free, 240);
  const restPos = at(named(free, "hair_1_3"));      // a front-side strand, about mid-length

  const vrm = await loadMira();
  run(vrm, 240);
  const strand = named(vrm, "hair_1_3");
  const hand = named(vrm, "hand_left");
  // put the palm sphere's centre exactly on the strand: the strand has to move out of it
  hand.position.copy(hand.parent.worldToLocal(restPos.clone().add(new THREE.Vector3(-0.02, 0.0, 0.015)).sub(new THREE.Vector3(PALM.x, 0, 0))));
  vrm.scene.updateMatrixWorld(true);
  run(vrm, 90);
  const pushed = at(strand);
  const palm = at(hand).add(new THREE.Vector3(PALM.x, 0, 0));
  assert.ok(pushed.distanceTo(restPos) > 0.03, `the strand moved (${pushed.distanceTo(restPos).toFixed(3)} m)`);
  assert.ok(pushed.distanceTo(palm) >= PALM.r * 0.9, "and is outside the hand, not through it");
});

test("with the hand taken away the strand swings back", async () => {
  const vrm = await loadMira();
  run(vrm, 240);
  const strand = named(vrm, "hair_1_3");
  const rest = at(strand);
  const hand = named(vrm, "hand_left");
  const home = hand.position.clone();
  hand.position.copy(hand.parent.worldToLocal(rest.clone().add(new THREE.Vector3(-0.02, 0.0, 0.015)).sub(new THREE.Vector3(PALM.x, 0, 0))));
  vrm.scene.updateMatrixWorld(true);
  run(vrm, 60);
  hand.position.copy(home);
  vrm.scene.updateMatrixWorld(true);
  run(vrm, 400);
  assert.ok(at(strand).distanceTo(rest) < 0.05, "it returns to hanging where it was");
});

test("a hand sphere landing exactly on a hair joint breaks the solver, and the guard repairs it", async () => {
  const vrm = await loadMira();
  run(vrm, 240);
  const tipsList = collectHairTips(vrm.scene);
  const scratch = new THREE.Vector3();
  assert.ok(allFinite(tipPositions(tipsList, scratch)));
  const joint = named(vrm, "hair_1_3");
  const hand = named(vrm, "hand_left");
  hand.position.copy(hand.parent.worldToLocal(at(joint).sub(new THREE.Vector3(PALM.x, 0, 0))));   // exactly on it: distance 0
  vrm.scene.updateMatrixWorld(true);
  vrm.update(STEP);
  const broken = tipPositions(tipsList, scratch);
  assert.equal(allFinite(broken), false, "this is the failure the guard exists for");
  assert.equal(healHair(vrm, broken), true, "healHair notices and resets the simulation");
  hand.position.set(0.11, 0, 0);                                                                  // the hand moves on
  vrm.scene.updateMatrixWorld(true);
  run(vrm, 120);
  assert.ok(allFinite(tipPositions(tipsList, scratch)), "and the hair works again");
  assert.equal(healHair(vrm, tipPositions(tipsList, scratch)), false, "nothing to repair when the hair is healthy");
});
