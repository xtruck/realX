# Step 1: test an open video model on one rented GPU, with a clip of yourself

**Status: prepared, NOT started.** Nothing has been rented, paid, installed or sent. Written 2026-10-24 for the owner. It follows
`OWN-REALTIME-ROUTE.md`, step 1. **You** rent the GPU and run the commands; an agent does not create accounts, pay, or log in.

**Goal in one sentence:** find out how fast and how good an open, Apache-2.0 video model is on one ordinary rentable graphics card, using a
short pre-recorded clip of you. No live camera, no stream, so no change to realX's privacy rules.

**Expected cost:** about **$1 to $2** for 1 to 2 hours (a rented RTX 4090 is listed at roughly $0.14 to $0.74 an hour, prices move), plus a few cents of
storage. **Spend cap you set yourself: $5.** If a page shows a higher price, stop and ask.

## A. Prepare your clip on your own laptop (10 minutes, free)

1. Film **10 to 20 seconds of yourself, alone**, with your phone or webcam. Plain background, good light, face and upper body in view, simple slow
   movements (turn the head, wave, talk).
2. Nobody else in the shot, no screens showing other people, nothing private in view.
3. Save as `me.mp4`. Keep a copy only on your computer and on the rented machine.
4. Choose 2 short prompts that describe an *edit*, not a real person. Examples: `"a person in a red jacket, realistic"` and
   `"a cartoon character, soft colours"`. Do not name or describe another real person.

## B. Rent one GPU (you do this; 10 minutes)

1. Pick **one** provider. Two commonly used ones are RunPod and Vast.ai (both rent by the hour; neither was tested here). Read the
   price page yourself before you pay.
2. Create the account yourself. Add **at most $5** of credit, and turn off automatic recharge if the site offers it.
3. Rent **one NVIDIA RTX 4090 (24 GB)**, **Linux**, with a PyTorch/CUDA image. The project's README lists "Linux with NVIDIA GPU" and says it supports
   a single GPU; 24 GB matches what Self-Forcing lists as its tested size. Choose the cheapest *reliable* tier, not the very cheapest unknown host.
4. Note the hourly price shown: ______ $/hour.
5. Connect with the provider's terminal or SSH. **Never type your personal passwords or GitHub login on that machine.** It is a throwaway computer.

## C. Install the model on the rented machine (about 20 to 40 minutes, mostly downloading)

These commands come from the project's own README (read 2026-10-24); the first line of trouble you meet, stop and ask me.

```bash
conda create -n streamdiffusionv2 python=3.10 -y     # if conda is not there, use: python3 -m venv sd2 && source sd2/bin/activate
conda activate streamdiffusionv2
pip install streamdiffusionv2
# optional, faster:
pip install "streamdiffusionv2[flash-attn]"

# model files (Apache-2.0 on Hugging Face; several GB each, size not checked)
huggingface-cli download --resume-download Wan-AI/Wan2.1-T2V-1.3B --local-dir wan_models/Wan2.1-T2V-1.3B
huggingface-cli download --resume-download jerryfeng/StreamDiffusionV2 --local-dir ./ckpts --include "wan_causal_dmd_v2v/*"
```

If `huggingface-cli` is missing: `pip install -U huggingface_hub`. If you have a newer card (a Blackwell-generation RTX 5090) the README adds one
extra `pip install torch==... torchvision==...` line; copy it from the README on GitHub.

Upload `me.mp4` to the rented machine (the provider's file upload, or `scp`).

## D. Run the test and time it

Create `run_test.py` on the rented machine. It is the README's single-GPU example with a stopwatch added. **It was not run by an agent**; if it fails, send me the
exact error text.

```python
import time
import numpy as np
from streamdiffusionv2 import StreamDiffusionV2Pipeline, export_video, load_video

PROMPT = "a person in a red jacket, realistic"     # change to your second prompt for run 2
stream = StreamDiffusionV2Pipeline(checkpoint_folder="ckpts/wan_causal_dmd_v2v", mode="single")
stream.prepare(PROMPT)

video = load_video("me.mp4", height=480, width=832)
decoded_chunks = []
noise_scale = stream.noise_scale

t0 = time.perf_counter()
for video_chunk in stream.chunk_video(video):
    encoded_chunk = stream.encode_chunk(video, video_chunk, previous_noise_scale=noise_scale,
                                        initial_noise_scale=stream.noise_scale)
    noise_scale = encoded_chunk.noise_scale
    denoised_chunk = stream.denoise_chunk(encoded_chunk)
    if denoised_chunk is None:
        continue
    decoded_chunks.append(stream.decode_chunk(denoised_chunk))
elapsed = time.perf_counter() - t0

output = np.concatenate(decoded_chunks, axis=0)
frames = output.shape[0]
print(f"frames={frames}  seconds={elapsed:.1f}  speed={frames/elapsed:.1f} frames/second")
export_video(output, "outputs/me_edit.mp4", fps=16)
```

Run it: `python run_test.py`. The first run includes warm-up, so **run it twice and write down the second run's speed.** Then download
`outputs/me_edit.mp4` to your laptop to look at it.

Optional second try, as the README suggests: add the faster picture decoder (`--use_taehv` for its shell script, or `USE_TAEHV=1`) and run again.

## E. Measurement sheet (you fill it in; empty on purpose)

| Item | Result |
|---|---|
| Date, provider, GPU model, price per hour | |
| Install worked first try? Any error (copy text) | |
| Speed run 1 / run 2 (frames per second printed) | |
| Real time needs about 24 to 30 frames per second. Is the second run near that? | |
| Time from pressing run to first output (seconds) | |
| Quality 1-5 on your face: stays recognisable? | |
| Quality 1-5: hands and arms | |
| Quality 1-5: no flicker or melting between frames | |
| Does it follow your prompt (jacket, cartoon)? | |
| Does it use your *photo* as a reference? (this setup takes a text prompt only; note anything you see) | |
| Total time rented and total cost | |

## F. Read the result (provisional thresholds, chosen before any measurement)

| Second-run speed on one RTX 4090 | Meaning | Next |
|---|---|---|
| 20 to 30 or more | Real time is plausible on one cheap card | Step 2: live camera (needs the written decision 3) |
| 8 to 20 | Interactive but not smooth | Try the faster decoder, fewer steps, smaller picture; re-measure; consider two cards |
| Under 8 | Not real time on one card | Stop; ask me about two or four cards (the paper's 64 fps used four H100) or a smaller model |

Quality matters as much as speed. If the face is not recognisable even on a clip, a faster card will not fix that.

## G. Stop paying (do this even if the test failed)

1. Download what you want to keep (`me_edit.mp4`, the numbers).
2. **Terminate/delete the rented machine and its disk** from the provider's page. "Stop" or "pause" can keep billing for storage.
3. Check the provider's balance page the next day: nothing should be running.
4. Delete `me.mp4` and the output from the rented machine before you terminate it, if it is a shared host.
5. Remove the card or turn off recharging if you do not plan to use it again.

## Safety notes

- Only your own clip. The result is an AI edit: if you ever show it, label it as AI-edited.
- The code is downloaded from the internet (PyPI and Hugging Face). Run it **only on the rented machine**, never on your laptop, and keep nothing personal there.
- This step sends no live camera feed and changes no realX file or rule.
- Licences read 2026-10-24: StreamDiffusionV2 code Apache-2.0; its checkpoint and Wan 2.1 1.3B Apache-2.0 on Hugging Face. The project's `streamv2v`
  folder is a separate research-licensed project; do not copy from it into realX.
