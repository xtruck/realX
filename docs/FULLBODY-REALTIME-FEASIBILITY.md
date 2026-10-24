# Real-time, photoreal full-body replacement: how the examples do it, and what realX can honestly do

Written 2026-10-24 after the owner's aim: real-time, photorealistic full-body replacement, "like CALL ME and Lucy 2.5". Decision document:
no code, nothing measured, nothing run. Sources are public pages and the file index of an app installed on the owner's laptop.

## What the two examples turn out to be

| | CALL ME 2.0.26 (installed on the owner's laptop) | Decart Lucy 2.5 |
|---|---|---|
| What the evidence shows | A desktop shell around a website: screens for login, subscription, wallet and crypto payment, settings, an admin dashboard and a preview window; a WebSocket client library; an updater. **Its package holds no AI model files and no native modules** (0 of 16 362 files; checked by listing the archive's file index only, nothing extracted or read). A separate native part only outputs a virtual camera. | A hosted model reached through a WebRTC realtime API (public developer docs), with reference image and text prompt, short-lived client tokens. Claimed 30 fps, 1080p, "near-zero latency" (Decart's own figures). |
| Where the heavy work happens | **Not on the laptop.** Inference of an app with no local model is a remote service (*inference from the missing files*, not observed traffic). | In Decart's cloud (the pages do not say otherwise; they do not say whether anything runs on a device). |
| How the picture reaches other programs | A Windows 11 virtual camera: see `VCAM-MF-DESIGN.md`. | An SDK returns the edited video stream to your own app. |

So the "backend" of both is **a rented data-centre GPU service**. The part that can be learned from CALL ME is the laptop side (thin client,
virtual camera output), which is already designed in `VCAM-MF-DESIGN.md`. The model side cannot be learned from the laptop: it is not there.
Looking inside the services' servers is not possible or permitted, and was not attempted.

## What can realistically run where

| Tier | Where | Honest capability today | Rules touched |
|---|---|---|---|
| A. Mesh compositor (today) | The owner's laptop (UHD 620), browser | A consented photo wrapped on the live face; 18 to 27 fps depending on options; body and clothes as flat puppets. Not photoreal full-body, and `CPU-STATUS.md` says so. | None |
| B. Per-identity model on a remote GPU | A GPU we rent or own, camera stream sent there | The highest realism of the licence-clean options (`PHOTOREAL-NEXT.md` option 2). Needs training video of the consenting person and a latency measurement that does not exist yet. | **Camera pictures leave the computer**: `FACEMESH.md`, `REMOTE.md` and `MISSION.md` decision 3 forbid it until the owner decides in writing. |
| C. A third-party live editing API (for example Lucy) | The vendor's cloud | Photoreal full-body edits, by the vendor's claims. | Same rule as B; plus the vendor's terms, price (two sources disagree), and **no consent or provenance statement on the pages read**. |
| D. Open-source swap tools on the laptop | The laptop | Fast only with a strong GPU; the usual swap weights are non-commercial or blocked. | `LICENSE-AUDIT.md`: blocked; not an option. |

Plain consequence: **photoreal full-body in real time is a data-centre-GPU job.** It cannot be done on this laptop by any amount of
tuning, and no licence-clean model that does it is available to download today. The way to the owner's aim is tier B or C, which needs
decisions that only the owner can make.

## Rules that stay, whatever tier is chosen

- A consent gate before any synthesized face or body, and a watermark after it, structurally (`SAFETY.md`, `pipeline.py` validation).
- The visible "Virtual" label stays on the picture with no off switch. The more photoreal the result, the more this matters: viewers
  cannot tell by looking, which is exactly why the label exists.
- No blocked model weights. The person shown must be the person who consented, bound to that photo or video.

## Decisions needed from the owner

1. **May camera video leave the computer for a remote GPU** (tier B or C)? If yes: which provider, what is sent, how long it is kept,
   and a signed per-session consent. If no: the ceiling is tier A.
2. **Own model (B) or vendor API (C)?** B is more work and needs training video; C is fast to try but depends on a vendor's terms and
   price and has no stated consent or provenance features.
3. **A paid trial of one vendor with the owner's own face only** is the cheapest honest way to measure latency and quality before any
   design: one session, own face, own account, nothing else.

## What I can do next without those decisions (and will queue)

- Keep improving tier A, which is where the work stays on the laptop.
- Prepare the safe plumbing a remote tier would need regardless: a per-session consent token bound to the media stream, a sender that
  cannot start without it, and tests that prove no camera data leaves while remote mode is off.
- Build the Windows virtual camera backend from `VCAM-MF-DESIGN.md` once the owner approves the administrator-install step.
