"""
Falcon Duality AI - Image Retrieval & Augmentation System
Retrieves images from training dataset and creates augmented versions for self-healing
"""

import os
import random
from pathlib import Path
from PIL import Image, ImageEnhance, ImageOps, ImageFilter
from typing import List, Dict, Optional, Tuple
from datetime import datetime
import base64
import io
import shutil


class FalconDualityAI:
    """
    Falcon Duality AI - Training Data Retrieval & Augmentation
    
    This module:
    1. Finds images containing specific safety classes from training dataset
    2. Creates augmented versions (rotation, brightness, contrast, etc.)
    3. Outputs images for retraining to improve detection accuracy
    """
    
    # Class mapping (must match YOLO training classes)
    CLASSES = {
        0: "OxygenTank",
        1: "NitrogenTank", 
        2: "FirstAidBox",
        3: "FireAlarm",
        4: "SafetySwitchPanel",
        5: "EmergencyPhone",
        6: "FireExtinguisher"
    }
    
    # Reverse mapping
    CLASS_TO_ID = {v: k for k, v in CLASSES.items()}
    
    def __init__(self, base_path: Optional[str] = None):
        """
        Initialize Falcon Duality AI
        
        Args:
            base_path: Base path to CODE-TRIBE project (auto-detected if None)
        """
        if base_path is None:
            # Auto-detect base path
            current_file = Path(__file__).resolve()
            self.base_path = current_file.parent.parent.parent  # backend/core -> backend -> CODE-TRIBE
        else:
            self.base_path = Path(base_path)
        
        # Training dataset paths
        self.dataset_dir = self.base_path / "training" / "train" / "train2"
        self.labels_dir = self.dataset_dir / "labels"
        self.images_dir = self.dataset_dir / "images"
        
        # Output directory for generated/augmented images
        self.output_dir = self.base_path / "datasets" / "FALCON-GENERATED"
        self.output_dir.mkdir(parents=True, exist_ok=True)
        
        # Augmentation log
        self.augmentation_log: List[Dict] = []
        
        print(f"🦅 Falcon Duality AI initialized")
        print(f"   📂 Dataset: {self.dataset_dir}")
        print(f"   💾 Output: {self.output_dir}")
    
    def find_images_with_class(self, class_name: str) -> List[Path]:
        """
        Find all images containing the specified class
        
        Args:
            class_name: Name of the safety class (e.g., "OxygenTank")
        
        Returns:
            List of image paths containing the class
        """
        if class_name not in self.CLASS_TO_ID:
            print(f"⚠️ Unknown class: {class_name}")
            print(f"   Available classes: {list(self.CLASS_TO_ID.keys())}")
            return []
        
        class_id = self.CLASS_TO_ID[class_name]
        matching_images = []
        
        print(f"🔍 Searching for {class_name} (class {class_id}) in training dataset...")
        
        if not self.labels_dir.exists():
            print(f"❌ Labels directory not found: {self.labels_dir}")
            return []
        
        label_files = list(self.labels_dir.glob("*.txt"))
        print(f"   📄 Found {len(label_files)} label files")
        
        for label_file in label_files:
            try:
                with open(label_file, 'r') as f:
                    lines = f.readlines()
                
                for line in lines:
                    parts = line.strip().split()
                    if len(parts) > 0 and int(parts[0]) == class_id:
                        # Found matching class - check for image
                        # Try different extensions
                        for ext in ['.png', '.jpg', '.jpeg', '.PNG', '.JPG', '.JPEG']:
                            image_path = self.images_dir / (label_file.stem + ext)
                            if image_path.exists():
                                matching_images.append(image_path)
                                break
                        break  # Found class in this file, move to next
            except Exception as e:
                print(f"   ⚠️ Error reading {label_file.name}: {e}")
                continue
        
        print(f"✅ Found {len(matching_images)} images with {class_name}")
        return matching_images
    
    def augment_image(
        self, 
        image_path: Path, 
        output_subdir: Optional[str] = None,
        base_name: Optional[str] = None
    ) -> List[Dict]:
        """
        Create augmented versions of an image
        
        Args:
            image_path: Path to source image
            output_subdir: Subdirectory in output folder (default: class name)
            base_name: Base name for output files (default: original filename)
        
        Returns:
            List of dicts with augmentation info and paths
        """
        if not image_path.exists():
            print(f"❌ Image not found: {image_path}")
            return []
        
        # Open image
        img = Image.open(image_path)
        
        # Ensure RGB mode (handle RGBA, grayscale, etc.)
        if img.mode != 'RGB':
            img = img.convert('RGB')
        
        # Setup output directory
        if output_subdir:
            aug_output_dir = self.output_dir / output_subdir
        else:
            aug_output_dir = self.output_dir
        aug_output_dir.mkdir(parents=True, exist_ok=True)
        
        if base_name is None:
            base_name = image_path.stem
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        augmented = []
        
        # Define augmentations
        augmentations = [
            ("original", lambda x: x),
            ("rotated_15deg", lambda x: x.rotate(15, expand=True, fillcolor=(0, 0, 0))),
            ("rotated_-15deg", lambda x: x.rotate(-15, expand=True, fillcolor=(0, 0, 0))),
            ("rotated_90deg", lambda x: x.rotate(90, expand=True)),
            ("brightness_130", lambda x: ImageEnhance.Brightness(x).enhance(1.3)),
            ("brightness_70", lambda x: ImageEnhance.Brightness(x).enhance(0.7)),
            ("flipped_horizontal", lambda x: ImageOps.mirror(x)),
            ("flipped_vertical", lambda x: ImageOps.flip(x)),
            ("contrast_130", lambda x: ImageEnhance.Contrast(x).enhance(1.3)),
            ("contrast_70", lambda x: ImageEnhance.Contrast(x).enhance(0.7)),
            ("saturation_120", lambda x: ImageEnhance.Color(x).enhance(1.2)),
            ("saturation_80", lambda x: ImageEnhance.Color(x).enhance(0.8)),
            ("sharpness_150", lambda x: ImageEnhance.Sharpness(x).enhance(1.5)),
            ("blur_slight", lambda x: x.filter(ImageFilter.GaussianBlur(radius=1))),
        ]
        
        print(f"🎨 Augmenting: {image_path.name}")
        
        for aug_name, aug_func in augmentations:
            try:
                # Apply augmentation
                aug_img = aug_func(img.copy())
                
                # Save
                filename = f"{base_name}_{aug_name}_{timestamp}.png"
                output_path = aug_output_dir / filename
                aug_img.save(output_path, 'PNG')
                
                # Get file size
                size_kb = output_path.stat().st_size / 1024
                
                aug_info = {
                    "augmentation": aug_name,
                    "source": str(image_path),
                    "output": str(output_path),
                    "filename": filename,
                    "size_kb": round(size_kb, 1),
                    "timestamp": timestamp
                }
                augmented.append(aug_info)
                
                print(f"   ✅ {aug_name} ({size_kb:.1f} KB)")
                
            except Exception as e:
                print(f"   ❌ {aug_name} failed: {e}")
                continue
        
        return augmented
    
    def process_class(
        self, 
        class_name: str, 
        num_samples: int = 3,
        random_select: bool = True
    ) -> Dict:
        """
        Process a class: find images and create augmented versions
        
        Args:
            class_name: Safety class name
            num_samples: Number of images to process
            random_select: If True, randomly select images; if False, use first N
        
        Returns:
            Dict with processing results
        """
        print("=" * 80)
        print(f"🦅 FALCON DUALITY AI - PROCESSING CLASS: {class_name}")
        print("=" * 80)
        
        start_time = datetime.now()
        
        # Find images
        matching_images = self.find_images_with_class(class_name)
        
        if not matching_images:
            return {
                "success": False,
                "class": class_name,
                "error": f"No images found with {class_name}",
                "images_found": 0,
                "augmented_count": 0
            }
        
        # Select images to process
        num_to_process = min(num_samples, len(matching_images))
        if random_select:
            selected_images = random.sample(matching_images, num_to_process)
        else:
            selected_images = matching_images[:num_to_process]
        
        print(f"\n🎲 Selected {num_to_process} images for augmentation:")
        for img in selected_images:
            print(f"   - {img.name}")
        print()
        
        # Process each image
        all_augmented = []
        for idx, image_path in enumerate(selected_images, 1):
            print(f"\n📷 Processing Image {idx}/{num_to_process}")
            
            base_name = f"{class_name}_{idx}"
            augmented = self.augment_image(
                image_path, 
                output_subdir=class_name,
                base_name=base_name
            )
            all_augmented.extend(augmented)
        
        # Calculate stats
        end_time = datetime.now()
        processing_time = (end_time - start_time).total_seconds()
        total_size = sum(a["size_kb"] for a in all_augmented)
        
        result = {
            "success": True,
            "class": class_name,
            "images_found": len(matching_images),
            "images_processed": num_to_process,
            "augmented_count": len(all_augmented),
            "total_size_kb": round(total_size, 1),
            "processing_time_sec": round(processing_time, 2),
            "output_directory": str(self.output_dir / class_name),
            "augmentations": all_augmented,
            "timestamp": start_time.isoformat()
        }
        
        # Log
        self.augmentation_log.append(result)
        
        # Print summary
        print("\n" + "=" * 80)
        print("✅ AUGMENTATION COMPLETE!")
        print("=" * 80)
        print(f"📊 Images Generated: {len(all_augmented)}")
        print(f"💾 Total Size: {total_size:.1f} KB")
        print(f"⏱️ Processing Time: {processing_time:.2f} seconds")
        print(f"📂 Output: {self.output_dir / class_name}")
        print("=" * 80)
        
        return result
    
    def get_augmented_images_base64(self, class_name: str, limit: int = 5) -> List[Dict]:
        """
        Get augmented images as base64 for API response
        
        Args:
            class_name: Safety class name
            limit: Maximum number of images to return
        
        Returns:
            List of dicts with base64 image data
        """
        output_subdir = self.output_dir / class_name
        
        if not output_subdir.exists():
            return []
        
        images = []
        for img_path in list(output_subdir.glob("*.png"))[:limit]:
            try:
                with open(img_path, "rb") as f:
                    img_data = f.read()
                
                images.append({
                    "filename": img_path.name,
                    "base64": base64.b64encode(img_data).decode('utf-8'),
                    "size_kb": round(len(img_data) / 1024, 1)
                })
            except Exception as e:
                print(f"⚠️ Error reading {img_path.name}: {e}")
                continue
        
        return images
    
    def cleanup_generated(self, class_name: Optional[str] = None):
        """
        Clean up generated augmented images
        
        Args:
            class_name: Specific class to clean, or None for all
        """
        if class_name:
            target_dir = self.output_dir / class_name
            if target_dir.exists():
                shutil.rmtree(target_dir)
                print(f"🗑️ Cleaned up: {target_dir}")
        else:
            if self.output_dir.exists():
                shutil.rmtree(self.output_dir)
                self.output_dir.mkdir(parents=True, exist_ok=True)
                print(f"🗑️ Cleaned up all generated images")
    
    def get_statistics(self) -> Dict:
        """Get statistics about the training dataset"""
        stats = {
            "classes": self.CLASSES,
            "dataset_path": str(self.dataset_dir),
            "output_path": str(self.output_dir),
            "class_counts": {}
        }
        
        if not self.labels_dir.exists():
            stats["error"] = "Labels directory not found"
            return stats
        
        # Count images per class
        for class_id, class_name in self.CLASSES.items():
            count = len(self.find_images_with_class(class_name))
            stats["class_counts"][class_name] = count
        
        return stats


# Standalone test
if __name__ == "__main__":
    print("=" * 80)
    print("🦅 FALCON DUALITY AI - STANDALONE TEST")
    print("=" * 80)
    
    # Initialize
    falcon = FalconDualityAI()
    
    # Test with OxygenTank
    result = falcon.process_class("OxygenTank", num_samples=2)
    
    print("\n📋 Result:")
    print(f"   Success: {result['success']}")
    print(f"   Images Found: {result.get('images_found', 0)}")
    print(f"   Augmented: {result.get('augmented_count', 0)}")
