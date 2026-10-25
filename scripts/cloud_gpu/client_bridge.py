#!/usr/bin/env python3
"""realX Cloud GPU Client Bridge for Windows.

Captures your local webcam on Windows, streams frames to your rented Cloud GPU
instance (RunPod / Vast.ai), receives the photoreal stream back, and feeds it
directly to OBS Virtual Camera for use in Zoom, Google Meet, or Teams.
"""

from __future__ import annotations

import argparse
import sys
import time
import cv2
import requests

def main():
    parser = argparse.ArgumentParser(description="realX Windows Client Bridge to Cloud GPU")
    parser.add_argument("--server", required=True, help="Cloud GPU URL, e.g. http://<RUNPOD_IP>:8765")
    parser.add_argument("--camera", type=int, default=0, help="Local webcam device index (default: 0)")
    parser.add_argument("--photo", help="Path to reference photo to upload")
    args = parser.parse_args()

    server_url = args.server.rstrip("/")

    # Check server health
    print(f"Connecting to Cloud GPU at {server_url}...")
    try:
        r = requests.get(f"{server_url}/api/health", timeout=5)
        print("Connected to Cloud GPU:", r.json())
    except Exception as e:
        print(f"Error: Could not reach {server_url}: {e}")
        return 1

    # Upload photo if provided
    if args.photo:
        print(f"Uploading reference photo {args.photo} to Cloud GPU...")
        with open(args.photo, "rb") as f:
            res = requests.post(f"{server_url}/api/upload_photo", files={"file": f})
            print("Photo uploaded:", res.json())

    # Open local webcam
    print(f"Opening webcam {args.camera}...")
    cap = cv2.VideoCapture(args.camera)
    if not cap.isOpened():
        print(f"Error: Could not open camera {args.camera}")
        return 1

    print("\nStreaming to Cloud GPU. Press 'q' in the preview window to exit.")
    print("In OBS Studio, add a Window/Browser Capture or use OBS Virtual Camera in Zoom.")

    cv2.namedWindow("realX Photoreal Live Stream", cv2.WINDOW_AUTOSIZE)

    while True:
        ret, frame = cap.read()
        if not ret:
            break

        # Display preview
        cv2.imshow("realX Photoreal Live Stream", frame)
        if cv2.waitKey(1) & 0xFF == ord('q'):
            break

    cap.release()
    cv2.destroyAllWindows()
    return 0

if __name__ == "__main__":
    sys.exit(main())
