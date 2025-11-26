"""
AstroGuard Fusion Testing Script
=================================
Displays 3 simultaneous detection windows:
1. YOLOv8-Nano (Speed Model)
2. YOLOv8-Small (Accuracy Model)  
3. Weighted Box Fusion (Combined Result)

Each window shows:
- Real-time detection with bounding boxes
- Detection logs (class, confidence, bbox)
- Performance metrics (inference time, object count)

Usage:
    python test_fusion.py                         # Interactive menu
    python test_fusion.py --source 0              # Webcam
    python test_fusion.py --source image.jpg      # Single image
    python test_fusion.py --source video.mp4      # Video file
"""

import cv2
import numpy as np
import os
import sys
import time
import argparse
from pathlib import Path
from ultralytics import YOLO
from collections import deque
from tkinter import Tk, filedialog

# Add parent directory to path to import fusion module
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from core.fusion import apply_wbf


class DetectionLogger:
    """Manages detection logs for display"""
    def __init__(self, max_logs=10):
        self.logs = deque(maxlen=max_logs)
        
    def add_log(self, class_name, confidence, bbox):
        timestamp = time.strftime("%H:%M:%S")
        self.logs.append({
            "time": timestamp,
            "class": class_name,
            "conf": confidence,
            "bbox": bbox
        })
        
    def get_logs(self):
        return list(self.logs)
    
    def clear(self):
        self.logs.clear()


class FusionTester:
    """Main testing class for 3-window fusion visualization"""
    
    def __init__(self, source=0):
        self.source = source
        
        # Initialize models
        base_dir = Path(__file__).parent
        speed_model_path = base_dir / "models" / "yolo_speed.pt"
        accuracy_model_path = base_dir / "models" / "yolo_accuracy.pt"
        
        if speed_model_path.exists():
            print(f"⚡ Loading Trained Speed Model: {speed_model_path}")
            self.model_speed = YOLO(str(speed_model_path))
        else:
            print("⚠️  Trained speed model not found, using yolov8n.pt")
            self.model_speed = YOLO("yolov8n.pt")
            
        if accuracy_model_path.exists():
            print(f"🎯 Loading Trained Accuracy Model: {accuracy_model_path}")
            self.model_accuracy = YOLO(str(accuracy_model_path))
        else:
            print("⚠️  Trained accuracy model not found, using yolov8s.pt")
            self.model_accuracy = YOLO("yolov8s.pt")
        
        # Detection loggers
        self.logger_speed = DetectionLogger()
        self.logger_accuracy = DetectionLogger()
        self.logger_fusion = DetectionLogger()
        
        # Class colors for visualization
        self.colors = {
            'OxygenTank': (0, 255, 65),       # Terminal green
            'NitrogenTank': (0, 191, 255),    # Deep sky blue
            'FirstAidBox': (255, 255, 0),      # Yellow
            'FireAlarm': (0, 0, 255),          # Red
            'SafetySwitchPanel': (255, 150, 0), # Orange
            'EmergencyPhone': (255, 0, 255),   # Magenta
            'FireExtinguisher': (252, 61, 33)  # SpaceX orange
        }
        
        # Performance metrics
        self.fps_speed = 0
        self.fps_accuracy = 0
        self.fps_fusion = 0
        
    def get_color(self, class_name):
        """Get color for class name"""
        return self.colors.get(class_name, (0, 255, 65))
    
    def draw_detections(self, img, results, model_name, logger):
        """Draw bounding boxes and labels on image"""
        output = img.copy()
        detections = []
        
        if len(results[0].boxes) > 0:
            for box in results[0].boxes:
                # Get box coordinates (xyxy format)
                x1, y1, x2, y2 = map(int, box.xyxy[0])
                conf = float(box.conf[0])
                cls_id = int(box.cls[0])
                class_name = results[0].names[cls_id]
                
                # Get color
                color = self.get_color(class_name)
                
                # Draw box
                cv2.rectangle(output, (x1, y1), (x2, y2), color, 2)
                
                # Draw label background
                label = f"{class_name} {conf:.2f}"
                (label_w, label_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                cv2.rectangle(output, (x1, y1 - label_h - 10), (x1 + label_w + 10, y1), color, -1)
                
                # Draw label text
                cv2.putText(output, label, (x1 + 5, y1 - 5), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 0), 1, cv2.LINE_AA)
                
                # Log detection
                logger.add_log(class_name, conf, (x1, y1, x2, y2))
                detections.append((class_name, conf, (x1, y1, x2, y2)))
        
        return output, detections
    
    def draw_fusion_detections(self, img, boxes, scores, labels, logger):
        """Draw WBF fusion results"""
        output = img.copy()
        h, w = img.shape[:2]
        
        for box, score, label_id in zip(boxes, scores, labels):
            # Convert normalized coords to pixel coords
            x1, y1, x2, y2 = box
            x1, y1, x2, y2 = int(x1 * w), int(y1 * h), int(x2 * w), int(y2 * h)
            
            # Get class name
            class_name = self.model_speed.names[int(label_id)]
            
            # Get color
            color = self.get_color(class_name)
            
            # Draw box (thicker for fusion)
            cv2.rectangle(output, (x1, y1), (x2, y2), color, 3)
            
            # Draw label background
            label = f"{class_name} {score:.2f} ⚡"
            (label_w, label_h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.6, 2)
            cv2.rectangle(output, (x1, y1 - label_h - 10), (x1 + label_w + 10, y1), color, -1)
            
            # Draw label text
            cv2.putText(output, label, (x1 + 5, y1 - 5), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 0, 0), 2, cv2.LINE_AA)
            
            # Log detection
            logger.add_log(class_name, score, (x1, y1, x2, y2))
        
        return output
    
    def add_info_panel(self, img, title, fps, logger, inference_time=0, falcon_trigger=False):
        """Add information panel to image"""
        output = img.copy()
        h, w = output.shape[:2]
        
        # Scale text size based on image size
        scale = w / 640.0  # Base scale on 640px width
        font_scale_title = 1.0 * scale
        font_scale_metrics = 0.7 * scale
        font_scale_logs = 0.5 * scale
        thickness_title = max(2, int(2 * scale))
        thickness_text = max(1, int(1 * scale))
        
        # Create semi-transparent overlay
        overlay = output.copy()
        
        # Title bar
        if "Fusion" in title:
            title_color = (0, 255, 65)  # Green for fusion
        elif "Nano" in title:
            title_color = (0, 191, 255)  # Orange for speed
        else:
            title_color = (33, 150, 243)  # Blue for accuracy
        
        title_height = int(60 * scale)
        cv2.rectangle(overlay, (0, 0), (w, title_height), (20, 27, 45), -1)
        cv2.putText(overlay, title, (int(10 * scale), int(40 * scale)), 
                   cv2.FONT_HERSHEY_SIMPLEX, font_scale_title, title_color, thickness_title, cv2.LINE_AA)
        
        # Metrics panel
        metrics_height = int(150 * scale)
        cv2.rectangle(overlay, (0, title_height), (w, metrics_height), (20, 27, 45), -1)
        
        # FPS
        cv2.putText(overlay, f"FPS: {fps:.1f}", (int(10 * scale), int(90 * scale)), 
                   cv2.FONT_HERSHEY_SIMPLEX, font_scale_metrics, (255, 255, 255), thickness_text, cv2.LINE_AA)
        
        # Inference time
        cv2.putText(overlay, f"Inference: {inference_time:.1f}ms", (int(10 * scale), int(120 * scale)), 
                   cv2.FONT_HERSHEY_SIMPLEX, font_scale_metrics, (255, 255, 255), thickness_text, cv2.LINE_AA)
        
        # Object count
        logs = logger.get_logs()
        current_objects = len(logs) if logs else 0
        cv2.putText(overlay, f"Objects: {current_objects}", (int(10 * scale), int(145 * scale)), 
                   cv2.FONT_HERSHEY_SIMPLEX, font_scale_metrics, (255, 255, 255), thickness_text, cv2.LINE_AA)
        
        # Falcon trigger indicator (only for fusion)
        if falcon_trigger:
            cv2.putText(overlay, "FALCON TRIGGERED", (w - int(280 * scale), int(145 * scale)), 
                       cv2.FONT_HERSHEY_SIMPLEX, font_scale_metrics * 0.8, (252, 61, 33), thickness_title, cv2.LINE_AA)
        
        # Logs panel
        log_panel_start = metrics_height
        cv2.rectangle(overlay, (0, log_panel_start), (w, h), (10, 14, 26), -1)
        cv2.putText(overlay, "Detection Logs:", (int(10 * scale), log_panel_start + int(30 * scale)), 
                   cv2.FONT_HERSHEY_SIMPLEX, font_scale_logs, (156, 163, 175), thickness_text, cv2.LINE_AA)
        
        # Display logs
        log_spacing = int(30 * scale)
        for i, log in enumerate(logs[-8:]):  # Show last 8 logs
            y_pos = log_panel_start + int(65 * scale) + (i * log_spacing)
            log_text = f"{log['time']} | {log['class'][:15]:15s} | {log['conf']:.2f}"
            cv2.putText(overlay, log_text, (int(10 * scale), y_pos), 
                       cv2.FONT_HERSHEY_SIMPLEX, font_scale_logs, (200, 200, 200), thickness_text, cv2.LINE_AA)
        
        # Blend overlay
        cv2.addWeighted(overlay, 0.7, output, 0.3, 0, output)
        
        return output
    
    def run(self):
        """Main testing loop"""
        # Check if source is an image file
        is_image = False
        if isinstance(self.source, str):
            if Path(self.source).suffix.lower() in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff']:
                is_image = True
                print(f"📷 Loading image: {self.source}")
                frame = cv2.imread(self.source)
                if frame is None:
                    print(f"❌ Error: Could not read image {self.source}")
                    return
        
        if not is_image:
            # Open video source
            cap = cv2.VideoCapture(self.source)
            
            if not cap.isOpened():
                print(f"❌ Error: Could not open source {self.source}")
                return
            
            print(f"📹 Source opened: {self.source}")
        
        print("Press 'q' to quit, 's' to save screenshot")
        
        # FPS calculation
        fps_start_time = time.time()
        fps_counter = 0
        
        while True:
            if not is_image:
                ret, frame = cap.read()
                if not ret:
                    print("End of stream")
                    break
            
            # Resize for processing (optional, for faster inference)
            # frame = cv2.resize(frame, (640, 480))
            
            # Clear logs for new frame
            self.logger_speed.clear()
            self.logger_accuracy.clear()
            self.logger_fusion.clear()
            
            # --- LAYER 1: Speed Model ---
            start_time = time.time()
            results_speed = self.model_speed(frame, conf=0.25, verbose=False)
            time_speed = (time.time() - start_time) * 1000
            img_speed, detections_speed = self.draw_detections(
                frame, results_speed, "Speed", self.logger_speed
            )
            
            # --- LAYER 2: Accuracy Model ---
            start_time = time.time()
            results_accuracy = self.model_accuracy(frame, conf=0.25, verbose=False)
            time_accuracy = (time.time() - start_time) * 1000
            img_accuracy, detections_accuracy = self.draw_detections(
                frame, results_accuracy, "Accuracy", self.logger_accuracy
            )
            
            # --- LAYER 3: WBF Fusion ---
            start_time = time.time()
            boxes, scores, labels = apply_wbf(
                [results_speed[0], results_accuracy[0]], 
                weights=[1, 2]
            )
            time_fusion = (time.time() - start_time) * 1000
            
            # Check for Falcon trigger (confidence between 0.25-0.45)
            falcon_trigger = any(0.25 < score < 0.45 for score in scores)
            
            img_fusion = self.draw_fusion_detections(
                frame, boxes, scores, labels, self.logger_fusion
            )
            
            # Calculate FPS
            fps_counter += 1
            if time.time() - fps_start_time > 1.0:
                self.fps_speed = fps_counter / (time.time() - fps_start_time)
                self.fps_accuracy = self.fps_speed
                self.fps_fusion = self.fps_speed
                fps_counter = 0
                fps_start_time = time.time()
            
            # Add info panels
            img_speed = self.add_info_panel(
                img_speed, "Layer 1: YOLOv8-Nano (Speed)", 
                self.fps_speed, self.logger_speed, time_speed
            )
            
            img_accuracy = self.add_info_panel(
                img_accuracy, "Layer 2: YOLOv8-Small (Accuracy)", 
                self.fps_accuracy, self.logger_accuracy, time_accuracy
            )
            
            img_fusion = self.add_info_panel(
                img_fusion, "Layer 3: WBF Fusion (Combined)", 
                self.fps_fusion, self.logger_fusion, time_fusion, falcon_trigger
            )
            
            # Resize windows to fit screen
            # Larger size for images/videos, smaller for webcam
            if is_image:
                display_height = 700
            else:
                display_height = 500
                
            aspect_ratio = frame.shape[1] / frame.shape[0]
            display_width = int(display_height * aspect_ratio)
            
            img_speed = cv2.resize(img_speed, (display_width, display_height))
            img_accuracy = cv2.resize(img_accuracy, (display_width, display_height))
            img_fusion = cv2.resize(img_fusion, (display_width, display_height))
            
            # Display windows
            cv2.imshow("AstroGuard - Speed Model", img_speed)
            cv2.imshow("AstroGuard - Accuracy Model", img_accuracy)
            cv2.imshow("AstroGuard - Fusion Result", img_fusion)
            
            # Handle keyboard input
            key = cv2.waitKey(1 if not is_image else 0) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('s'):
                # Save screenshots
                timestamp = time.strftime("%Y%m%d_%H%M%S")
                cv2.imwrite(f"speed_{timestamp}.jpg", img_speed)
                cv2.imwrite(f"accuracy_{timestamp}.jpg", img_accuracy)
                cv2.imwrite(f"fusion_{timestamp}.jpg", img_fusion)
                print(f"📸 Screenshots saved: {timestamp}")
            
            # For static images, process once and wait for keypress
            if is_image:
                break
        
        # Cleanup
        if not is_image:
            cap.release()
        cv2.destroyAllWindows()
        print("✅ Testing complete")


def select_file_interactive():
    """Interactive file selection with file dialog"""
    print("\n" + "=" * 60)
    print("🚀 AstroGuard Fusion Testing - Interactive Mode")
    print("=" * 60)
    print("\nSelect Detection Source:")
    print("  [1] 📹 Live Webcam")
    print("  [2] 🖼️  Image File")
    print("  [3] 🎬 Video File")
    print("  [q] ❌ Quit")
    print("-" * 60)
    
    while True:
        choice = input("\nEnter your choice (1/2/3/q): ").strip().lower()
        
        if choice == 'q':
            print("👋 Exiting...")
            sys.exit(0)
        
        elif choice == '1':
            print("\n✅ Webcam selected")
            return 0
        
        elif choice == '2':
            print("\n📂 Opening file browser for image selection...")
            # Hide Tkinter root window
            root = Tk()
            root.withdraw()
            root.attributes('-topmost', True)
            
            file_path = filedialog.askopenfilename(
                title="Select Image File",
                filetypes=[
                    ("Image files", "*.jpg *.jpeg *.png *.bmp *.tiff *.webp"),
                    ("JPEG files", "*.jpg *.jpeg"),
                    ("PNG files", "*.png"),
                    ("All files", "*.*")
                ]
            )
            root.destroy()
            
            if file_path:
                print(f"✅ Selected: {file_path}")
                return file_path
            else:
                print("❌ No file selected. Please try again.")
                continue
        
        elif choice == '3':
            print("\n📂 Opening file browser for video selection...")
            # Hide Tkinter root window
            root = Tk()
            root.withdraw()
            root.attributes('-topmost', True)
            
            file_path = filedialog.askopenfilename(
                title="Select Video File",
                filetypes=[
                    ("Video files", "*.mp4 *.avi *.mov *.mkv *.flv *.wmv"),
                    ("MP4 files", "*.mp4"),
                    ("AVI files", "*.avi"),
                    ("All files", "*.*")
                ]
            )
            root.destroy()
            
            if file_path:
                print(f"✅ Selected: {file_path}")
                return file_path
            else:
                print("❌ No file selected. Please try again.")
                continue
        
        else:
            print("❌ Invalid choice. Please enter 1, 2, 3, or q")


def main():
    parser = argparse.ArgumentParser(description="AstroGuard Fusion Testing")
    parser.add_argument(
        "--source", 
        type=str, 
        default=None,
        help="Video source: 0 for webcam, or path to image/video file (skip for interactive menu)"
    )
    
    args = parser.parse_args()
    
    # If no source provided, use interactive menu
    if args.source is None:
        source = select_file_interactive()
    else:
        # Convert source to int if it's a webcam index
        try:
            source = int(args.source)
        except ValueError:
            source = args.source
    
    print("\n" + "=" * 60)
    print("🎯 Starting AstroGuard Fusion Detection")
    print("=" * 60 + "\n")
    
    tester = FusionTester(source=source)
    tester.run()


if __name__ == "__main__":
    main()
