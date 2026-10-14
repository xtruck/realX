# Overnight progress log

Owner delegated full authority on 2026-10-14: push to main, repo stays public, make
all decisions, test without asking. This file is the loop's memory. Update it after
each step so a resumed session knows exactly where to continue.

## Done

- [x] M0 foundation: docs, pipeline core, consent gate, watermark, 34 tests
- [x] Security/architecture/code review by ECC agents, fixes applied
- [x] YuNet detector (MIT, CPU), model manifest with pinned hashes, blocked list
- [x] Fast-motion tracker: no id switches under dance/jump/sprint/spin with blur+noise
- [x] Avatar overlay tier, synthetic motion source, `scripts/motion_check.py`
- [x] 46 tests green; pushed to main (5ee8cdc)

## Measured (CPU-only i5-7300U, 640x480, blur+noise stress)

| motion | coverage | ids | median err | p95 err |
|---|---|---|---|---|
| detection only, dance/jump/sprint | 48% / 64% / 44% | 1 | 3 px | 7 px |
| realX, dance | 94% | 1 | ~7 px | ~76 px |
| realX, jump | 96% | 1 | ~4 px | ~20 px |
| realX, sprint | 94% | 1 | ~8 px | ~116 px |

## Next (in order)

- [ ] Voice: DSP stages (gate, normalize, pitch shift), consent + audio watermark,
      A/V delay matching, `realx voice` CLI, tests
- [ ] Server + web UI (MJPEG preview, stats, controls, safety panel), tests
- [ ] ECC audit pass 2 (architect, security, python review) and fixes
- [ ] REA / web research for innovative ideas; write docs/IDEAS.md; implement best ones
- [ ] ECC audit pass 3, full test run, push to main
- [ ] Update README with real usage and measured results

## Decisions taken without the owner (review in the morning)

- Avatar tier first, because it runs on the CPU-only laptop and needs no restricted model.
- YuNet (MIT) chosen over InsightFace (non-commercial) for detection.
- `inswapper_128` and `buffalo_l` stay blocked in code until a license is obtained.
- Repo left public as instructed; no models or secrets are committed.
