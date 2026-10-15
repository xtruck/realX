# Comparative analysis: realX and the tools around it (2026-10-15)

Method: **public information only**. Official documentation, public repositories' licence files and READMEs, public
policy pages. No proprietary code was analysed, no private API was probed, no account was used. Where a fact could not
be confirmed it is marked **unverified**. Nothing here licenses copying: for every tool below, realX takes ideas, never code.

## 1. The tools

| Tool | What it is | Licence / terms (checked) | Consent and provenance, as published |
|---|---|---|---|
| **Akool** (face swap, live face swap, API) | Hosted service. Image and video face swap, multi-face, a live face-swap product | Commercial service. Docs: generated files kept 7 days | Docs reviewed show endpoints, limits and models (Classic, HD Optimized). **No consent rule and no watermark mention found in the API docs** (unverified elsewhere) |
| **HeyGen** (avatar video, streaming avatar, API) | Hosted avatar video and real-time avatar service | Commercial service. Moderation policy effective 2024-07-25 | **Official consent flow** for digital twins: proof the depicted person agreed, `POST /v3/avatars/{group_id}/consent`, webcam flow by default. Photo and prompt-made avatars need none. Policy forbids avatars of other people without explicit consent |
| **FaceFusion** | Open-source face manipulation platform (CLI + UI, batch jobs, benchmark) | Code **OpenRAIL-AS**, not permissive (GitHub: `NOASSERTION`). See `FACEFUSION-STUDY.md` | Ships a content analyser (NSFW classifiers); no consent mechanism found in the files read |
| **LivePortrait** (KwaiVGI) | Portrait animation from a driving video or expression | `LICENSE` is MIT **plus** a note that InsightFace models are non-commercial research only; default human path needs InsightFace `buffalo_l`. See `PORTRAIT.md` | Not a product; no consent layer |
| **Deep-Live-Cam** | Real-time face swap from one image, one-click video deepfake | Code **AGPL-3.0** (checked on GitHub). Models it depends on were not reviewed here: **unverified** | Not reviewed here: **unverified** |
| **realX** | Browser full-body tracking driving a VRM avatar, relay to OBS, control room | Own code; permissive-only dependencies | Consent gate, visible DIGITAL HOST disclosure, watermark ordering, blocked models |

## 2. Feature comparison

| Capability | Akool | HeyGen | FaceFusion | LivePortrait | Deep-Live-Cam | realX today |
|---|---|---|---|---|---|---|
| Face swap on real footage | yes | no (avatars) | yes | no | yes | **no, by design** (blocked models); a mesh-texture study exists in `SWAP-CPU.md` |
| Cartoon / avatar character | no | yes (stock + custom) | no | no | no | **yes** (VRM Pip, outfits, gestures) |
| Real-time / live | live face swap | streaming avatar | live camera mode | not real time on CPU | yes | **yes**, 14 Hz pose in simulation, display 48-60 fps (laptop CPU) |
| Expression transfer | n/a | lip-sync from text/audio | expression restorer/editor | **core feature** | via swap | **52 blendshapes + gaze + mouth from microphone** |
| Full body (arms, hands, fingers, legs) | no | upper-body avatars | no | no | no | **yes**, from one webcam |
| Background removal | not reviewed | yes | `background_remover` processor | no | not reviewed | **yes**, local PP-HumanSeg (Apache-2.0) |
| OBS integration | virtual camera route (unverified) | unverified | no | no | virtual camera (unverified) | **Browser Source** with transparency, plus a validated OBS Virtual Camera procedure |
| Runs fully local | no (cloud) | no (cloud) | yes | yes | yes | **yes**; camera pictures never leave the page |
| GPU required | cloud | cloud | recommended | yes for speed | recommended | **no**, CPU/integrated |
| Batch jobs / queue | API | API | **jobs, batch** | scripts | no | no (live tool) |
| Benchmark command | no | no | **yes** | no | no | **yes** (`realx bench`, browser bench) |
| Content-safety filter | platform moderation | moderation policy | NSFW classifiers | no | not reviewed | **not yet** (`CONTENT-FILTER.md` study in progress) |

## 3. Features worth adding to realX (and why)

Ranked by value for a CPU-only, personal-use tool, each tied to a rule.

1. **Expression transfer quality**: realX already tracks 52 blendshapes. Next: tune smoothing with a real person on a real
   webcam (never done; see `PROGRESS.md`). No new model needed.
2. **OBS transparency and clean output**: already done via Browser Source. Add a one-page "OBS in 5 minutes" in
   `OBS.md` once the owner fills its validation table.
3. **Local background cut-out**: done. Possible gain: quality on hair/dark clothing (known soft edge).
4. **Consent flow modelled on HeyGen's idea, not its code**: before any likeness of a real person is used, record who
   agreed, for how long, with a revocable code. realX already has `realx cohost` (grant, check, revoke). Gap: a visible
   on-screen state for "consent valid until ...".
5. **Content-safety filter**: only if a model passes the licence gate (`CONTENT-FILTER.md`).
6. **Benchmark cold/warm and DirectML test**: in progress in parallel sessions (`FACEFUSION-STUDY.md` ideas 1 and 3).
7. **Live face-swap**: stays out. Reasons: licences (InsightFace non-commercial; FaceFusion OpenRAIL-AS;
   Deep-Live-Cam AGPL), and the rule against passing a person off as someone real. Allowed direction: owner's own
   face or a consenting, labelled person (`SWAP-CPU.md`).

## 4. Ethical guarantees, side by side

| Guarantee | HeyGen (published) | Akool (published) | realX |
|---|---|---|---|
| Consent before using a real person's likeness | yes, proof required for digital twins | **not found** | **yes**, consent vault, revocable, checked per image and per frame |
| Visible disclosure | not found in pages read | not found | **yes**, DIGITAL HOST bar on likeness modes; "Virtual character" tag on camera pages that `?badge=off` cannot hide |
| Provenance mark | not reviewed | not found | baseline LSB watermark (does not survive heavy compression); robust mark (TrustMark/AudioSeal) and C2PA are planned |
| Moderation | written policy | not found | blocked-model list, pipeline ordering rule, planned content filter |
| Data stays local | no | no | yes: camera/mic never leave the page; only small body numbers are sent |

## 5. Sources

* Akool docs (public): <https://docs.akool.com/ai-tools-suite/faceswap>, <https://docs.akool.com/ai-tools-suite/live-faceswap.md>
* HeyGen avatar consent: <https://developers.heygen.com/docs/avatar-consent>; moderation policy: <https://www.heygen.com/moderation-policy>
* FaceFusion repository and licence file: <https://github.com/facefusion/facefusion>
* LivePortrait licence: <https://github.com/KwaiVGI/LivePortrait/blob/main/LICENSE>; local analysis in `PORTRAIT.md`
* Deep-Live-Cam repository (licence field): <https://github.com/hacksider/Deep-Live-Cam>

## 6. Limits of this document

Feature cells for Akool, HeyGen and Deep-Live-Cam come from search snippets and documentation indexes, not from using the
products. "Not found" means not found in the pages read, not that it does not exist. Re-check before relying on a cell.
