# Our own real-time video-editing route: open models on a rented GPU

Written 2026-10-24. Decision document, **nothing built, run or measured**. The owner cancelled the paid vendor trial (too expensive) and wants an MIT-licensed
realX that does the same kind of thing at a low cost. This is what the public sources support. Figures come from pages read on 2026-10-24 and
move over time; check live prices before spending anything.

## 1. Why the vendor is expensive, and what a self-run version would cost

| Option | Price | One hour of use |
|---|---|---|
| Decart `lucy-2.5`, standard | $0.02 per second | **$72** |
| Decart `lucy-2.5`, fast mode | $0.04 per second | **$144** |
| Rented RTX 4090 (RunPod, Vast.ai marketplaces) | about $0.14 to $0.74 per hour depending on host and tier | **under $1** |
| Rented H100 (one) | about $0.9 to $2.9 per hour | **$1 to $3** |
| Four H100 (what one paper used for its top speed) | four times one H100 | **about $4 to $12** |

The gap is about two orders of magnitude. The catch is the model: the vendor sells a finished, tuned model; a self-run version needs an open
model that is fast enough on a rentable GPU and good enough on the owner's face and body. Section 3 says what exists.

## 2. How this kind of system works (from public sources)

- Decart describes its "live-stream diffusion" as generating each new frame from the previous frame, the current camera frame and a prompt, one
  frame after another, with training that keeps errors from piling up over a long stream. These are the company's own claims (a launch thread and
  press pages); no technical report was found, so the details are **not verified**. Reported speed: 24 fps (launch thread) or 30 fps (a cloud
  partner's page), with a delay under 40 ms.
- Research papers describe the same idea in the open: caching what the model computed for earlier frames so the next frame stays consistent
  (StreamV2V), and splitting the work across several GPUs for speed (StreamDiffusionV2).
- Nothing about the vendor's servers can or should be read from outside. The public papers and open code are the legitimate source.

## 3. Open pieces that exist, with licences read at the source

| Project | What it does | Licence (GitHub API, 2026-10-24) | Speed claims | Notes |
|---|---|---|---|---|
| **StreamDiffusionV2** | Live video-to-video with a video diffusion model; camera capture supported | **Apache-2.0** | 64.5 fps with a 1.3B model on **four H100**; 58 fps with a 14B model on four H100 | No single-GPU figure found. It also contains a `streamv2v` folder: **check that folder's origin and licence** before using it (StreamV2V itself is under a research licence). |
| **Self-Forcing** | Real-time autoregressive video generation, built on Wan 2.1 1.3B | **Apache-2.0** | Paper: 17 fps, sub-second delay on one H100; its README says it runs on one RTX 4090 (24 GB+ GPU memory) | A text-to-video base, not a camera editor on its own. |
| **Wan 2.1** (base models) | Open video model family | **Apache-2.0** | The 1.3B text-to-video model needs about 8 GB of GPU memory (third-party test) | The licence text does not address outputs. |
| **StreamDiffusion** (Daydream fork) | Fast image diffusion pipeline with live input | **Apache-2.0** | Image-based; not full-body video | Useful for prompt-based restyling, weaker on consistency. |
| StreamV2V | Streaming video-to-video | **UT Austin Research Licence**, not permissive | 20 fps on one A100 (paper) | **Avoid** for an MIT project. |
| Try-on models (IDM-VTON, Voost) | Image clothing change | **CC BY-NC-SA**, non-commercial | Not real time | **Avoid.** |

**What was not found:** an open model that, in real time, turns a live camera into *a specific person from a reference photo* with photoreal
full-body quality, which is what the vendor product advertises. The open pieces above are general "edit this video by prompt" systems. Reaching
identity-from-photo would need extra work (for example fine-tuning on the owner's own photos), and **that route is unproven here**.

## 4. Recommended route, in small paid steps

| Step | What | Cost | What it proves |
|---|---|---|---|
| 0 | Nothing: keep improving the local mesh compositor and keep all the safety rules | $0 | Keeps the product usable meanwhile |
| 1 | Rent **one** consumer GPU for 1 to 2 hours, install StreamDiffusionV2 (or Self-Forcing) from the open code, feed it a **clip of the owner** (not a live stream yet) and a prompt | about $1 | Real speed and look on one rentable GPU. If it is far below real time, stop here. |
| 2 | Same GPU, live camera of the owner, measure delay and fps | about $1 | Whether "live" is realistic at all on one card |
| 3 | Try giving the model the owner's identity: fine-tune on the owner's photos, or condition on a reference image | a few dollars | Whether photoreal identity is reachable with open parts |
| 4 | Only if steps 1 to 3 are good: build the client in realX (MIT), the server as a separate component with the Apache pieces, consent and label rules below | engineering time | A real feature |

Expected total to learn the answer: **a few dollars**, against $72 for one hour of the vendor. Each step is a stop-or-go decision.

## 5. Licence position (not legal advice)

Apache-2.0 code and weights are generally compatible with an MIT project if their notices are kept. Weights carry their own terms (Wan 2.1 is
Apache-2.0 per its licence file). `realX` has **no `LICENSE` file yet** (`REALX_ROADMAP.md`, P5): adding MIT is the owner's decision. Check each model
card and every dataset behind a fine-tune before shipping anything.

## 6. Rules that do not change

- The owner's own face and body, or a person who signed consent for that exact photo or video. No other person's likeness.
- Consent gate before any synthesized face or body, watermark after it, and the visible "Virtual" label with no off switch.
- **Camera video leaving the laptop for a rented GPU is a change to the rule in `FACEMESH.md`, `REMOTE.md` and `MISSION.md` (decision 3).** The owner
  has said a cheap cloud server is acceptable; that needs to be written as a decision before step 2. Proposed wording: "Camera video may be sent
  to a GPU server that the owner rents and controls, over an encrypted connection, only while a signed per-session consent is active, never to a third
  party's AI service, never stored, with the Virtual label added to the returned frames."
- Step 1 uses a pre-recorded clip of the owner, so it needs no change to that rule.

## 7. What the owner decides next

1. Approve step 1 (about $1, one clip of the owner, one rented GPU), or say no.
2. Approve the proposed wording for decision 3 (needed before live streaming, not before step 1).
3. Choose MIT for realX (adds a `LICENSE` file).

An agent does not rent the GPU, create the account or pay; the owner does. An agent can write the setup instructions and the measurement sheet.
