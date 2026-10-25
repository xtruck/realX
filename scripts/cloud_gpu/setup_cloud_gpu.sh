#!/usr/bin/env bash
# ==============================================================================
# realX - Cloud GPU One-Click Setup Script (RunPod / Vast.ai / Ubuntu 22.04+)
# ==============================================================================
set -euo pipefail

echo "============================================================"
echo " Starting realX Cloud GPU Photoreal Video Call Stack Setup"
echo "============================================================"

# Check for NVIDIA GPU
if ! command -v nvidia-smi &> /dev/null; then
    echo "ERROR: nvidia-smi not found. This script requires an NVIDIA GPU (RTX 4090 / 3090 / A10G recommended)."
    exit 1
fi

nvidia-smi --query-gpu=gpu_name,memory.total --format=csv,noheader

# 1. System packages
echo "[1/5] Installing system dependencies..."
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y -qq git wget curl ffmpeg libgl1-mesa-glx libglib2.0-0 build-essential

# 2. Python environment & CUDA dependencies
echo "[2/5] Installing Python libraries (PyTorch, ONNXRuntime-GPU, TensorRT)..."
python3 -m pip install --upgrade pip
python3 -m pip install \
    torch torchvision torchaudio --index-url https://download.pytorch.org/whl/cu121
python3 -m pip install \
    onnxruntime-gpu \
    opencv-python-headless \
    numpy \
    pillow \
    fastapi \
    "uvicorn[standard]" \
    python-multipart \
    aiortc \
    aiohttp \
    av \
    tqdm

# 3. Create models directory
MODELS_DIR="/workspace/models"
mkdir -p "$MODELS_DIR"
echo "[3/5] Setting up neural model weights in $MODELS_DIR..."

# Inswapper 128 (face swapper)
if [ ! -f "$MODELS_DIR/inswapper_128.onnx" ]; then
    echo "Downloading inswapper_128.onnx..."
    wget -q --show-progress -O "$MODELS_DIR/inswapper_128.onnx" \
        "https://huggingface.co/ezioruan/inswapper_128.onnx/resolve/main/inswapper_128.onnx"
fi

# GFPGAN v1.4 (face restorer / photoreal enhancer)
if [ ! -f "$MODELS_DIR/GFPGANv1.4.onnx" ]; then
    echo "Downloading GFPGANv1.4.onnx..."
    wget -q --show-progress -O "$MODELS_DIR/GFPGANv1.4.onnx" \
        "https://huggingface.co/facefusion/models-3.0.0/resolve/main/GFPGANv1.4.onnx"
fi

# MediaPipe models
if [ ! -f "$MODELS_DIR/face_landmarker.task" ]; then
    echo "Downloading MediaPipe Face Landmarker..."
    wget -q --show-progress -O "$MODELS_DIR/face_landmarker.task" \
        "https://storage.googleapis.com/mediapipe-models/face_landmarker/face_landmarker/float16/latest/face_landmarker.task"
fi

# 4. Create launch runner
echo "[4/5] Preparing server launch script..."
cat << 'EOF' > /workspace/start_server.sh
#!/usr/bin/env bash
cd /workspace
python3 /workspace/scripts/cloud_gpu/server.py --port 8765 --host 0.0.0.0
EOF
chmod +x /workspace/start_server.sh

echo "============================================================"
echo " Setup complete! To start the server, run:"
echo "   /workspace/start_server.sh"
echo " Or run server.py with your target reference photo."
echo "============================================================"
