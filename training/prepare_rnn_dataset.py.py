"""
Prepare temporal sequence dataset for RNN training FROM IMAGES
(Modified for image-only datasets - creates synthetic sequences)

This script creates:
1. Synthetic temporal sequences from static images
2. Activity labels (stationary, moving, obstructed, etc.)
3. Anomaly labels (0 = normal, 1 = anomaly)
"""

import cv2
import numpy as np
import torch
from ultralytics import YOLO
from pathlib import Path
import json
from tqdm import tqdm
from collections import defaultdict
import sys
import random

# Add backend to path
sys.path.append(str(Path(__file__).parent.parent))
from backend.core.rnn_temporal import FeatureExtractor


class SyntheticTemporalAugmenter:
    """
    Create synthetic temporal sequences from static images
    by applying progressive transformations
    """
    def __init__(self, sequence_length: int = 16):
        self.sequence_length = sequence_length
    
    def generate_sequence(self, image: np.ndarray, bbox: list) -> list:
        """
        Generate a temporal sequence from a single detection
        
        Simulates temporal changes:
        - Slight position shifts (simulates camera shake/object movement)
        - Brightness variations (simulates lighting changes)
        - Small rotations (simulates camera angle changes)
        - Occlusions (simulates partial blocking)
        
        Returns:
            list of 16 augmented image crops
        """
        x1, y1, x2, y2 = map(int, bbox)
        h, w = image.shape[:2]
        
        # Ensure bbox is valid
        x1, y1 = max(0, x1), max(0, y1)
        x2, y2 = min(w, x2), min(h, y2)
        
        # Check minimum size
        if (x2 - x1) < 10 or (y2 - y1) < 10:
            # Too small, create dummy sequence
            dummy_crop = np.zeros((50, 50, 3), dtype=np.uint8)
            return [dummy_crop] * self.sequence_length
        
        sequence = []
        
        for frame_idx in range(self.sequence_length):
            # Progressive transformations
            progress = frame_idx / self.sequence_length
            
            # 1. Position shift (simulate movement)
            shift_x = int(np.sin(progress * 2 * np.pi) * 5)
            shift_y = int(np.cos(progress * 2 * np.pi) * 5)
            
            new_x1 = max(0, min(w, x1 + shift_x))
            new_y1 = max(0, min(h, y1 + shift_y))
            new_x2 = max(0, min(w, x2 + shift_x))
            new_y2 = max(0, min(h, y2 + shift_y))
            
            # Extract crop
            crop = image[new_y1:new_y2, new_x1:new_x2].copy()
            
            if crop.size == 0 or crop.shape[0] < 10 or crop.shape[1] < 10:
                # Skip too small crops, use original
                crop = image[y1:y2, x1:x2].copy()
                if crop.size == 0:
                    # If still empty, create a dummy crop
                    crop = np.zeros((50, 50, 3), dtype=np.uint8)
            
            # 2. Brightness variation (simulate lighting)
            brightness_factor = 1.0 + (np.sin(progress * np.pi) * 0.15)
            crop = np.clip(crop * brightness_factor, 0, 255).astype(np.uint8)
            
            # 3. Add noise (simulate sensor noise)
            if random.random() > 0.7:
                noise = np.random.normal(0, 3, crop.shape).astype(np.int16)
                crop = np.clip(crop.astype(np.int16) + noise, 0, 255).astype(np.uint8)
            
            # 4. Simulate occlusion (15% chance) - ONLY if crop is large enough
            if random.random() > 0.85 and crop.shape[0] > 40 and crop.shape[1] > 40:
                occ_h = min(crop.shape[0] // 4, 20)
                occ_w = min(crop.shape[1] // 4, 20)
                occ_y = random.randint(0, crop.shape[0] - occ_h - 1)
                occ_x = random.randint(0, crop.shape[1] - occ_w - 1)
                crop[occ_y:occ_y+occ_h, occ_x:occ_x+occ_w] = 0
            
            sequence.append(crop)
        
        return sequence


def create_temporal_dataset_from_images(
    images_dir: str,
    yolo_model_path: str,
    output_dir: str,
    sequence_length: int = 16,
    device: str = 'cpu',
    max_images: int = None
):
    """
    Create temporal dataset from static images with synthetic sequences
    
    Args:
        images_dir: Path to directory with training images
        yolo_model_path: Path to trained YOLO model
        output_dir: Where to save sequences
        sequence_length: Number of frames per sequence
        device: 'cpu' or 'cuda'
        max_images: Limit number of images to process (None = all)
    """
    
    output_path = Path(output_dir)
    output_path.mkdir(parents=True, exist_ok=True)
    
    # Initialize
    print("🚀 Initializing RNN Dataset Preparation (Image-Based)")
    print(f"  ├─ Images Dir: {images_dir}")
    print(f"  ├─ YOLO Model: {yolo_model_path}")
    print(f"  └─ Output: {output_dir}\n")
    
    yolo = YOLO(yolo_model_path)
    feature_extractor = FeatureExtractor(device=device)
    augmenter = SyntheticTemporalAugmenter(sequence_length=sequence_length)
    
    # Get image files
    images_path = Path(images_dir)
    image_files = list(images_path.glob("*.png")) + list(images_path.glob("*.jpg"))
    
    if max_images:
        image_files = image_files[:max_images]
    
    print(f"📸 Found {len(image_files)} images\n")
    
    sequences_data = []
    sequence_id = 0
    skipped_detections = 0
    
    pbar = tqdm(image_files, desc="Processing images")
    
    for img_path in pbar:
        try:
            # Read image
            image = cv2.imread(str(img_path))
            if image is None:
                continue
            
            # Run YOLO detection
            results = yolo(image, verbose=False)[0]
            
            if len(results.boxes) == 0:
                continue
            
            # Process each detection
            for box in results.boxes:
                try:
                    bbox = box.xyxy[0].cpu().numpy().tolist()
                    class_id = int(box.cls[0])
                    confidence = float(box.conf[0])
                    
                    # Validate bbox size
                    x1, y1, x2, y2 = bbox
                    if (x2 - x1) < 10 or (y2 - y1) < 10:
                        skipped_detections += 1
                        continue
                    
                    # Generate synthetic temporal sequence
                    sequence_crops = augmenter.generate_sequence(image, bbox)
                    
                    # Extract features for each frame in sequence
                    features_list = []
                    for crop in sequence_crops:
                        # Create a temporary full image with crop
                        temp_img = np.zeros_like(image)
                        h_crop, w_crop = crop.shape[:2]
                        temp_img[:h_crop, :w_crop] = crop
                        
                        # Extract features
                        features = feature_extractor.extract(temp_img, [0, 0, w_crop, h_crop])
                        features_list.append(features)
                    
                    # Generate pseudo-labels based on image filename and augmentation
                    activity_label = _generate_activity_label_from_filename(img_path.name)
                    anomaly_label = _generate_anomaly_label(confidence)
                    
                    sequences_data.append({
                        'sequence_id': sequence_id,
                        'image_source': img_path.name,
                        'features': np.stack(features_list),  # (16, 2048)
                        'activity_label': activity_label,     # 0-4
                        'anomaly_label': anomaly_label,       # 0 or 1
                        'metadata': {
                            'bbox': bbox,
                            'class_id': class_id,
                            'confidence': confidence
                        }
                    })
                    
                    sequence_id += 1
                    
                except Exception as e:
                    skipped_detections += 1
                    continue
            
            pbar.set_postfix({'sequences': sequence_id, 'skipped': skipped_detections})
            
        except Exception as e:
            continue
    
    pbar.close()
    
    # Save to disk
    print(f"\n💾 Saving sequences...")
    print(f"  ├─ Total sequences: {len(sequences_data)}")
    print(f"  ├─ Skipped (too small): {skipped_detections}")
    
    if len(sequences_data) == 0:
        print("❌ No sequences created! Check your YOLO model and images.")
        return
    
    # Split train/val
    np.random.shuffle(sequences_data)
    split_idx = int(0.8 * len(sequences_data))
    
    train_data = sequences_data[:split_idx]
    val_data = sequences_data[split_idx:]
    
    torch.save(train_data, output_path / 'train_sequences.pt')
    torch.save(val_data, output_path / 'val_sequences.pt')
    
    print(f"  ├─ Train sequences: {len(train_data)}")
    print(f"  └─ Val sequences: {len(val_data)}")
    
    # Save metadata
    with open(output_path / 'dataset_info.json', 'w') as f:
        json.dump({
            'total_sequences': len(sequences_data),
            'train_sequences': len(train_data),
            'val_sequences': len(val_data),
            'sequence_length': sequence_length,
            'feature_dim': 2048,
            'activity_labels': ['stationary', 'being_moved', 'obstructed', 'missing', 'normal'],
            'source': 'synthetic_from_images',
            'total_images_processed': len(image_files),
            'skipped_detections': skipped_detections
        }, f, indent=2)
    
    print("\n✅ Dataset preparation complete!")
    print(f"📊 Created {len(sequences_data)} synthetic temporal sequences from {len(image_files)} images")


def _generate_activity_label_from_filename(filename: str) -> int:
    """
    Generate activity label from image filename
    
    Labels:
    0 = stationary
    1 = being_moved
    2 = obstructed
    3 = missing
    4 = normal
    """
    filename_lower = filename.lower()
    
    if 'cluttered' in filename_lower:
        return 2  # obstructed
    elif 'light' in filename_lower and 'uncluttered' in filename_lower:
        return 4  # normal
    elif 'hallway' in filename_lower:
        return 0  # stationary (in hallway)
    elif 'room' in filename_lower:
        return 4  # normal
    else:
        return 4  # default to normal


def _generate_anomaly_label(confidence: float) -> int:
    """
    Generate anomaly label based on detection confidence
    
    0 = normal
    1 = anomaly
    """
    # Low confidence = potential anomaly
    return 0 if confidence > 0.6 else 1


if __name__ == '__main__':
    import argparse
    
    parser = argparse.ArgumentParser()
    parser.add_argument('--images', required=True, help='Path to images directory')
    parser.add_argument('--yolo', default='training/runs/nano/astroguard_speed/weights/best.pt', 
                       help='Path to YOLO model')
    parser.add_argument('--output', default='training/rnn_dataset', help='Output directory')
    parser.add_argument('--device', default='cpu', help='Device (cpu/cuda)')
    parser.add_argument('--max-images', type=int, default=None, help='Max images to process')
    
    args = parser.parse_args()
    
    create_temporal_dataset_from_images(
        images_dir=args.images,
        yolo_model_path=args.yolo,
        output_dir=args.output,
        device=args.device,
        max_images=args.max_images
    )