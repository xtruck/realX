"""Builds "Pip", the original character that ships with realX, as a VRM 1.0 file.

Pip is a mint-green mascot made of ellipsoids. It is not modelled on any real person
or existing character. The output is dedicated to the public domain (CC0 1.0).

    python scripts/make_character.py            # writes src/realx/web/avatars/pip.vrm

Only numpy is needed. The model is rigid parts attached to a standard humanoid
skeleton (T-pose, +Z forward, character's left on +X), with morph targets for blink
and mouth shapes, which is what the browser renderer drives.
"""

from __future__ import annotations

import json
import struct
import sys
from pathlib import Path

import numpy as np

OUT = Path(__file__).resolve().parents[1] / "src" / "realx" / "web" / "avatars" / "pip.vrm"

MINT = (0.55, 0.85, 0.75)
CORAL = (0.95, 0.52, 0.45)
CREAM = (1.0, 0.93, 0.80)
NAVY = (0.20, 0.25, 0.45)
LEAF = (0.35, 0.72, 0.38)
PINK = (1.0, 0.62, 0.66)
INK = (0.10, 0.10, 0.16)
WHITE = (1.0, 1.0, 1.0)
LIP = (0.55, 0.16, 0.22)


def ellipsoid(center, radii, n_lat: int = 14, n_lon: int = 24):
    """Positions, normals and triangle indices of an ellipsoid."""
    lat = np.linspace(0, np.pi, n_lat + 1)
    lon = np.linspace(0, 2 * np.pi, n_lon + 1)
    la, lo = np.meshgrid(lat, lon, indexing="ij")
    unit = np.stack([np.sin(la) * np.sin(lo), np.cos(la), np.sin(la) * np.cos(lo)], axis=-1).reshape(-1, 3)
    r = np.asarray(radii, dtype=np.float64)
    pos = unit * r + np.asarray(center, dtype=np.float64)
    nrm = unit / r
    nrm /= np.linalg.norm(nrm, axis=1, keepdims=True)
    idx = []
    w = n_lon + 1
    for i in range(n_lat):
        for j in range(n_lon):
            a, b, c, d = i * w + j, i * w + j + 1, (i + 1) * w + j, (i + 1) * w + j + 1
            idx += [a, b, c, b, d, c]
    return pos.astype(np.float32), nrm.astype(np.float32), np.array(idx, dtype=np.uint16)


ROLES = {  # material names let the renderer recolour the outfit without touching the skin
    MINT: "skin", CORAL: "outfit", CREAM: "belly", NAVY: "accent", LEAF: "leaf",
    PINK: "blush", INK: "ink", WHITE: "white", LIP: "lip",
}


class Builder:
    def __init__(self) -> None:
        self.blob = bytearray()
        self.views: list[dict] = []
        self.accessors: list[dict] = []
        self.materials: list[dict] = []
        self.meshes: list[dict] = []
        self.nodes: list[dict] = []
        self._mat_ids: dict[tuple, int] = {}

    def _view(self, data: bytes, target: int | None) -> int:
        while len(self.blob) % 4:
            self.blob.append(0)
        view = {"buffer": 0, "byteOffset": len(self.blob), "byteLength": len(data)}
        if target:
            view["target"] = target
        self.blob += data
        self.views.append(view)
        return len(self.views) - 1

    def _accessor(self, arr: np.ndarray, kind: str, comp: int, target: int | None, bounds: bool = False) -> int:
        acc = {"bufferView": self._view(arr.tobytes(), target), "componentType": comp, "count": len(arr), "type": kind}
        if bounds:
            acc["min"], acc["max"] = arr.min(axis=0).tolist(), arr.max(axis=0).tolist()
        self.accessors.append(acc)
        return len(self.accessors) - 1

    def material(self, color) -> int:
        key = tuple(color)
        if key not in self._mat_ids:
            rgba = [*color, 1.0]
            self.materials.append(
                {
                    "name": ROLES.get(key, f"mat{len(self.materials)}"),
                    "pbrMetallicRoughness": {"baseColorFactor": rgba, "metallicFactor": 0.0, "roughnessFactor": 1.0},
                    "extensions": {
                        "KHR_materials_unlit": {},
                        "VRMC_materials_mtoon": {
                            "specVersion": "1.0",
                            "shadeColorFactor": [c * 0.72 for c in color],
                            "shadingShiftFactor": -0.1,
                            "shadingToonyFactor": 0.85,
                            "giEqualizationFactor": 0.9,
                            "outlineWidthMode": "none",
                        },
                    },
                }
            )
            self._mat_ids[key] = len(self.materials) - 1
        return self._mat_ids[key]

    def mesh(self, name: str, center, radii, color, morphs: dict[str, tuple[float, float, float]] | None = None) -> int:
        pos, nrm, idx = ellipsoid(center, radii)
        prim = {
            "attributes": {
                "POSITION": self._accessor(pos, "VEC3", 5126, 34962, bounds=True),
                "NORMAL": self._accessor(nrm, "VEC3", 5126, 34962),
            },
            "indices": self._accessor(idx, "SCALAR", 5123, 34963),
            "material": self.material(color),
        }
        mesh: dict = {"name": name, "primitives": [prim]}
        if morphs:
            targets = []
            for scale in morphs.values():
                delta = ((np.asarray(scale) - 1.0) * (pos - np.asarray(center, dtype=np.float32))).astype(np.float32)
                targets.append({"POSITION": self._accessor(delta, "VEC3", 5126, 34962, bounds=True)})
            prim["targets"] = targets
            mesh["extras"] = {"targetNames": list(morphs)}
        self.meshes.append(mesh)
        return len(self.meshes) - 1

    def node(self, name: str, translation=(0, 0, 0), mesh: int | None = None, parent: int | None = None) -> int:
        n: dict = {"name": name}
        if any(translation):
            n["translation"] = [float(t) for t in translation]
        if mesh is not None:
            n["mesh"] = mesh
        self.nodes.append(n)
        i = len(self.nodes) - 1
        if parent is not None:
            self.nodes[parent].setdefault("children", []).append(i)
        return i


MOUTH_SHAPES = {  # scale of the mouth ellipsoid per shape: width, height, depth
    "aa": (0.9, 6.0, 1.0),
    "ih": (1.25, 2.6, 1.0),
    "ou": (0.55, 4.2, 1.0),
    "ee": (1.55, 1.6, 1.0),
    "oh": (0.75, 5.0, 1.0),
    "happy": (1.7, 1.4, 1.0),
}
BLINK = {"blink": (1.0, 0.08, 1.0)}


def build() -> bytes:
    b = Builder()
    root = b.node("Pip")
    hips = b.node("hips", (0, 0.42, 0), b.mesh("hips_mesh", (0, 0.03, 0), (0.15, 0.10, 0.12), NAVY), root)
    spine = b.node("spine", (0, 0.08, 0), parent=hips)
    chest = b.node("chest", (0, 0.12, 0), b.mesh("body", (0, -0.06, 0), (0.17, 0.20, 0.14), CORAL), spine)
    b.node("belly", (0, -0.10, 0.12), b.mesh("belly_mesh", (0, 0, 0), (0.10, 0.11, 0.035), CREAM), chest)
    neck = b.node("neck", (0, 0.10, 0), parent=chest)
    head = b.node("head", (0, 0.05, 0), b.mesh("head_mesh", (0, 0.20, 0), (0.27, 0.24, 0.24), MINT), neck)

    for side, sx in (("left", 1.0), ("right", -1.0)):
        b.node(f"ear_{side}", (sx * 0.20, 0.40, -0.02), b.mesh(f"ear_{side}_mesh", (0, 0, 0), (0.08, 0.10, 0.05), MINT), head)
        b.node(f"blush_{side}", (sx * 0.15, 0.13, 0.19), b.mesh(f"blush_{side}_mesh", (0, 0, 0), (0.045, 0.025, 0.012), PINK), head)
    b.node("stem", (0, 0.45, 0), b.mesh("stem_mesh", (0, 0.04, 0), (0.014, 0.07, 0.014), LEAF), head)
    b.node("leaf", (0.05, 0.53, 0), b.mesh("leaf_mesh", (0, 0, 0), (0.07, 0.022, 0.03), LEAF), head)

    binds: dict[str, list[tuple[int, int]]] = {"blink": [], "blinkLeft": [], "blinkRight": []}
    eyes = {}
    for side, sx in (("left", 1.0), ("right", -1.0)):
        eye = b.node(f"eye_{side}", (sx * 0.095, 0.21, 0.20), b.mesh(f"sclera_{side}", (0, 0, 0), (0.060, 0.075, 0.030), WHITE, BLINK), head)
        pupil = b.node(f"pupil_{side}", (0, 0, 0.020), b.mesh(f"pupil_{side}_mesh", (0, 0, 0), (0.034, 0.048, 0.014), INK, BLINK), eye)
        eyes[side] = eye
        key = "blinkLeft" if side == "left" else "blinkRight"
        for n in (eye, pupil):
            binds["blink"].append((n, 0))
            binds[key].append((n, 0))

    mouth = b.node("mouth", (0, 0.095, 0.203), b.mesh("mouth_mesh", (0, 0, 0), (0.030, 0.006, 0.010), LIP, MOUTH_SHAPES), head)
    mouth_binds = {name: [(mouth, i)] for i, name in enumerate(MOUTH_SHAPES)}

    for side, sx in (("left", 1.0), ("right", -1.0)):
        up = b.node(f"upperArm_{side}", (sx * 0.16, 0.06, 0), b.mesh(f"upperArm_{side}_mesh", (sx * 0.06, 0, 0), (0.075, 0.040, 0.040), CORAL), chest)
        lo = b.node(f"lowerArm_{side}", (sx * 0.12, 0, 0), b.mesh(f"lowerArm_{side}_mesh", (sx * 0.055, 0, 0), (0.070, 0.035, 0.035), CORAL), up)
        b.node(f"hand_{side}", (sx * 0.11, 0, 0), b.mesh(f"hand_{side}_mesh", (sx * 0.03, 0, 0), (0.045, 0.045, 0.045), CREAM), lo)
        ul = b.node(f"upperLeg_{side}", (sx * 0.075, -0.03, 0), b.mesh(f"upperLeg_{side}_mesh", (0, -0.07, 0), (0.060, 0.090, 0.060), NAVY), hips)
        ll = b.node(f"lowerLeg_{side}", (0, -0.14, 0), b.mesh(f"lowerLeg_{side}_mesh", (0, -0.07, 0), (0.050, 0.085, 0.050), MINT), ul)
        b.node(f"foot_{side}", (0, -0.14, 0), b.mesh(f"foot_{side}_mesh", (0, -0.06, 0.03), (0.065, 0.050, 0.100), INK), ll)

    by_name = {n["name"]: i for i, n in enumerate(b.nodes)}
    bones = {
        "hips": "hips", "spine": "spine", "chest": "chest", "neck": "neck", "head": "head",
        "leftEye": "eye_left", "rightEye": "eye_right",
    }
    for side in ("left", "right"):
        S = side
        bones.update({
            f"{S}UpperArm": f"upperArm_{S}", f"{S}LowerArm": f"lowerArm_{S}", f"{S}Hand": f"hand_{S}",
            f"{S}UpperLeg": f"upperLeg_{S}", f"{S}LowerLeg": f"lowerLeg_{S}", f"{S}Foot": f"foot_{S}",
        })
    human_bones = {k: {"node": by_name[v]} for k, v in bones.items()}

    def expr(entries):
        return {"morphTargetBinds": [{"node": n, "index": i, "weight": 1.0} for n, i in entries]}

    presets = {name: expr(e) for name, e in {**binds, **mouth_binds}.items()}
    vrm = {
        "specVersion": "1.0",
        "meta": {
            "name": "Pip",
            "version": "1.0",
            "authors": ["realX project"],
            "copyrightInformation": "CC0 1.0 Universal. An original character, not based on any real person.",
            "licenseUrl": "https://vrm.dev/licenses/1.0/",
            "avatarPermission": "everyone",
            "allowExcessivelyViolentUsage": False,
            "allowExcessivelySexualUsage": False,
            "commercialUsage": "corporation",
            "allowPoliticalOrReligiousUsage": False,
            "allowAntisocialOrHateUsage": False,
            "creditNotation": "unnecessary",
            "allowRedistribution": True,
            "modification": "allowModificationRedistribution",
        },
        "humanoid": {"humanBones": human_bones},
        "expressions": {"preset": presets},
    }

    bin_chunk = bytes(b.blob) + b"\0" * (-len(b.blob) % 4)
    gltf = {
        "asset": {"version": "2.0", "generator": "realx scripts/make_character.py"},
        "extensionsUsed": ["VRMC_vrm", "VRMC_materials_mtoon", "KHR_materials_unlit"],
        "extensions": {"VRMC_vrm": vrm},
        "scene": 0,
        "scenes": [{"nodes": [root]}],
        "nodes": b.nodes,
        "meshes": b.meshes,
        "materials": b.materials,
        "accessors": b.accessors,
        "bufferViews": b.views,
        "buffers": [{"byteLength": len(bin_chunk)}],
    }
    js = json.dumps(gltf, separators=(",", ":")).encode()
    js += b" " * (-len(js) % 4)
    total = 12 + 8 + len(js) + 8 + len(bin_chunk)
    return (
        struct.pack("<4sII", b"glTF", 2, total)
        + struct.pack("<I4s", len(js), b"JSON") + js
        + struct.pack("<I4s", len(bin_chunk), b"BIN\0") + bin_chunk
    )


def main() -> int:
    data = build()
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_bytes(data)
    print(f"wrote {OUT} ({len(data) / 1024:.0f} KB)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
