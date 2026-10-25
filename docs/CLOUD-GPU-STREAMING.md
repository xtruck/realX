# realX Cloud GPU Photoreal Streaming Guide

This guide describes how to run photorealistic real-time video calls with **whole face and body replacement from any picture** using a rented NVIDIA GPU instance (RunPod / Vast.ai) connected to your local Windows PC (OBS Virtual Camera / Zoom / Google Meet / Teams).

---

## 1. Prerequisites & Cloud GPU Cost

* **Hardware**: Standard Windows laptop (no NVIDIA GPU required locally).
* **Cloud GPU**: 1x NVIDIA RTX 4090 (24 GB VRAM) on [RunPod.io](https://runpod.io) or [Vast.ai](https://vast.ai).
* **Cost**: ~$0.34 to $0.44 per hour on RunPod Community Cloud. Adding $5 gives over 10 hours of active streaming.
* **Local Software**: OBS Studio (with OBS Virtual Camera enabled).

---

## 2. Step 1: Deploy on RunPod

1. Create an account at [RunPod.io](https://runpod.io) and add $5 credit.
2. Go to **Pods** -> **Deploy**.
3. Select **1x RTX 4090** (Community Cloud).
4. Select template: `RunPod PyTorch 2.1` (or official PyTorch CUDA 12.1 image).
5. In **Environment Variables & Ports**:
   - Expose HTTP Port: `8765`.
   - Container Disk: `30 GB`.
6. Click **Deploy**.

---

## 3. Step 2: Run the One-Click Setup Script

In the RunPod Web Terminal (or SSH):

```bash
# Clone the realX repository
git clone https://github.com/xtruck/realX.git /workspace/realx
cd /workspace/realx

# Run the automated GPU setup script
bash scripts/cloud_gpu/setup_cloud_gpu.sh

# Start the real-time server
python3 scripts/cloud_gpu/server.py --port 8765
```

---

## 4. Step 3: Connect from Your Windows Laptop

1. Open your browser and navigate to:
   ```
   http://<RUNPOD_PUBLIC_IP>:8765
   ```
2. Upload any target photo (headshot, portrait, or full-body picture).
3. The server immediately prepares the neural weights for real-time inference at 30+ FPS.

---

## 5. Step 4: Stream into Zoom, Google Meet, or Microsoft Teams

1. Open **OBS Studio**.
2. Add a **Browser Source** pointing to `http://<RUNPOD_PUBLIC_IP>:8765` (or Window Capture).
3. Click **Start Virtual Camera** in the bottom right panel of OBS.
4. In **Zoom**, **Google Meet**, or **Microsoft Teams**:
   - Go to Video Settings.
   - Select **OBS Virtual Camera** as your camera.
5. Your video call will now stream the photorealistic target face and body in real time!
