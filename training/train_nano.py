"""
AstroGuard Layer 1 Training: YOLOv8-Nano (Speed-Optimized)
Goal: Fast inference (<20ms) for global context detection
"""

from ultralytics import YOLO
import torch
import os
from pathlib import Path
from multiprocessing import freeze_support

def main():
    print("=" * 60)
    print("🚀 AstroGuard Layer 1: YOLO-Nano Training (Speed Model)")
    print("=" * 60)

    # Check CUDA availability
    if torch.cuda.is_available():
        print(f"✅ GPU Detected: {torch.cuda.get_device_name(0)}")
        print(f"✅ CUDA Version: {torch.version.cuda}")
        print(f"✅ GPU Memory: {torch.cuda.get_device_properties(0).total_memory / 1e9:.2f} GB")
    else:
        print("⚠️ WARNING: No GPU detected! Training will be very slow.")
        exit(1)

    # Paths
    this_dir = Path(__file__).parent
    data_yaml = this_dir / "data.yaml"

    # Verify dataset config exists
    if not data_yaml.exists():
        print(f"❌ ERROR: {data_yaml} not found!")
        exit(1)

    print(f"\n📂 Dataset Config: {data_yaml}")

    # Initialize YOLOv8-Nano model
    print("\n🔧 Initializing YOLOv8-Nano (yolov8n.pt)...")
    model = YOLO("yolov8n.pt")  # Pretrained nano model

    # Training configuration - Optimized for RTX 3050 (4GB VRAM)
    print("\n⚙️ Training Configuration:")
    config = {
        "data": str(data_yaml),
        "epochs": 150,              # Sufficient epochs with early stopping
        "batch": 16,                # Reduced for 4GB VRAM (was 32)
        "imgsz": 640,               # Standard YOLO input size
        "device": 0,                # GPU 0
        "patience": 20,             # ⭐ Early stopping patience (stops if no improvement for 20 epochs)
        "save": True,               # Save checkpoints
        "save_period": 10,          # Save every 10 epochs
        "cache": False,             # Disable caching to save RAM
        "workers": 4,               # Reduced workers to save memory
        "project": str(this_dir / "runs" / "nano"),
        "name": "astroguard_speed",
        "exist_ok": True,
        "pretrained": True,
        "optimizer": "AdamW",       # Better than SGD for small datasets
        "lr0": 0.001,               # Initial learning rate
        "lrf": 0.0001,              # Final learning rate
        "momentum": 0.937,
        "weight_decay": 0.0005,
        "warmup_epochs": 3,         # Warm up learning rate
        "warmup_momentum": 0.8,
        "mosaic": 1.0,              # Mosaic augmentation (full)
        "mixup": 0.1,               # Mixup augmentation
        "copy_paste": 0.1,          # Copy-paste augmentation
        "degrees": 15.0,            # Rotation augmentation
        "translate": 0.1,           # Translation
        "scale": 0.5,               # Scale augmentation
        "shear": 0.0,               # Shear
        "perspective": 0.0,         # Perspective
        "flipud": 0.5,              # Vertical flip (space orientation)
        "fliplr": 0.5,              # Horizontal flip
        "hsv_h": 0.015,             # HSV-Hue augmentation
        "hsv_s": 0.7,               # HSV-Saturation
        "hsv_v": 0.4,               # HSV-Value (brightness)
        "plots": True,              # Generate training plots
        "val": True,                # Validate during training
        "verbose": True,            # Detailed logging
    }

    for key, value in config.items():
        if key not in ["data", "project", "name"]:
            print(f"  {key}: {value}")

    # Start training
    print("\n" + "=" * 60)
    print("🎯 STARTING TRAINING - Layer 1 (YOLO-Nano)")
    print("=" * 60)
    print("💡 TIP: Training will auto-stop if no improvement for 20 epochs")
    print("💡 Best weights will be saved to: runs/nano/astroguard_speed/weights/best.pt")
    print("=" * 60 + "\n")

    try:
        results = model.train(**config)
        
        print("\n" + "=" * 60)
        print("✅ TRAINING COMPLETED SUCCESSFULLY!")
        print("=" * 60)
        print(f"📊 Best mAP@0.5: {results.results_dict.get('metrics/mAP50(B)', 'N/A')}")
        print(f"💾 Best weights: runs/nano/astroguard_speed/weights/best.pt")
        print("=" * 60)
        
    except Exception as e:
        print(f"\n❌ ERROR during training: {e}")
        exit(1)

if __name__ == '__main__':
    freeze_support()
    main()
