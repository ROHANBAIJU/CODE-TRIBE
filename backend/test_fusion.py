"""
AstroGuard RNN-Enhanced Detection Testing
==========================================
Tests the complete pipeline with EMA temporal tracking
"""
import sys
import os
import time
import cv2
import numpy as np
import argparse
from pathlib import Path
from ultralytics import YOLO
from collections import deque
from tkinter import Tk, filedialog

# Add parent directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from core.fusion_enhanced import SpatioTemporalFusion
from core.rnn_temporal import RNNTemporal  # ✅ Changed to RNNTemporal


class DetectionLogger:
    """Manages detection logs for display"""
    def __init__(self, max_logs=10):
        self.logs = deque(maxlen=max_logs)
        
    def add_log(self, class_name, confidence, track_age=None, trend=None, activity=None, anomaly=None):
        timestamp = time.strftime("%H:%M:%S")
        log_entry = {
            "time": timestamp,
            "class": class_name,
            "conf": confidence,
        }
        if track_age is not None:
            log_entry["age"] = track_age
        if trend:
            log_entry["trend"] = trend
        if activity:
            log_entry["activity"] = activity
        if anomaly is not None:
            log_entry["anomaly"] = anomaly
        self.logs.append(log_entry)
        
    def get_logs(self):
        return list(self.logs)
    
    def clear(self):
        self.logs.clear()


class RNNFusionTester:
    """RNN-enhanced testing with EMA temporal reasoning"""
    
    def __init__(self, source=0):
        self.source = source
        
        # Initialize models
        base_dir = Path(__file__).parent
        yolo_model_path = base_dir / "models" / "yolo_speed.pt"
        rnn_model_path = base_dir / "models" / "rnn_temporal.pt"
        
        print("=" * 60)
        print("🚀 Initializing AstroGuard RNN-Enhanced Detection")
        print("=" * 60)
        
        # Load YOLO
        if yolo_model_path.exists():
            print(f"\n⚡ Loading YOLO Model: {yolo_model_path}")
            self.yolo = YOLO(str(yolo_model_path))
        else:
            print(f"\n⚠️  YOLO model not found at {yolo_model_path}, using default YOLOv8n")
            self.yolo = YOLO("yolov8n.pt")
        
        # ✅ Load RNN Temporal (EMA-based)
        print(f"🧠 Loading RNN Temporal Engine with EMA: {rnn_model_path}")
        self.rnn_temporal = RNNTemporal(
            model_path=str(rnn_model_path) if rnn_model_path.exists() else None,
            sequence_length=5,
            conf_threshold=0.5
        )
        
        # Initialize fusion
        print("⚡ Initializing Spatio-Temporal Fusion...")
        self.fusion_engine = SpatioTemporalFusion(
            iou_threshold=0.5,
            temporal_weight=0.3
        )
        
        print("✅ All systems online!\n")
        
        # Detection loggers (one per layer)
        self.logger_yolo = DetectionLogger()
        self.logger_rnn = DetectionLogger()
        self.logger_fusion = DetectionLogger()
        
        # Class colors
        self.colors = {
            'fire_extinguisher': (252, 61, 33),
            'default': (0, 255, 65)
        }
        
        # Performance metrics
        self.fps = 0
        self.frame_count = 0
        
    def get_color(self, class_name):
        """Get color for class name"""
        return self.colors.get(class_name, self.colors['default'])
    
    def draw_yolo_detections(self, img, results, logger):
        """Draw YOLO detections (NO temporal info)"""
        output = img.copy()
        detections = []
        
        if len(results[0].boxes) > 0:
            boxes = results[0].boxes
            for box in boxes:
                x1, y1, x2, y2 = box.xyxy[0].cpu().numpy()
                conf = float(box.conf[0])
                cls = int(box.cls[0])
                class_name = results[0].names[cls]
                
                # Draw bounding box
                color = self.get_color(class_name)
                cv2.rectangle(output, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
                
                # Draw label
                label = f"{class_name}: {conf:.3f}"
                (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
                cv2.rectangle(output, (int(x1), int(y1) - h - 10), (int(x1) + w, int(y1)), color, -1)
                cv2.putText(output, label, (int(x1), int(y1) - 5), 
                           cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
                
                # Log detection
                logger.add_log(class_name, conf)
                
                detections.append({
                    'bbox': [float(x1), float(y1), float(x2), float(y2)],
                    'confidence': conf,
                    'class': class_name,
                    'class_id': cls
                })
        
        return output, detections
    
    def draw_rnn_detections(self, img, enhanced_detections, logger):
        """Draw RNN-enhanced detections WITH EMA temporal tracking"""
        output = img.copy()
        
        for det in enhanced_detections:
            x1, y1, x2, y2 = det['bbox']
            conf = det['confidence']
            class_name = det['class']
            
            # Get temporal info
            track_age = det.get('track_age', 0)
            trend = det.get('trend', 'new')
            temporal_boost = det.get('temporal_boost', 0.0)
            
            # Draw bounding box
            color = self.get_color(class_name)
            cv2.rectangle(output, (int(x1), int(y1)), (int(x2), int(y2)), color, 2)
            
            # Draw enhanced label with temporal info
            label = f"{class_name}: {conf:.3f}"
            temp_label = f"Age:{track_age} +{temporal_boost:.3f} {trend}"
            
            # Main label
            (w, h), _ = cv2.getTextSize(label, cv2.FONT_HERSHEY_SIMPLEX, 0.5, 1)
            cv2.rectangle(output, (int(x1), int(y1) - h - 10), (int(x1) + w, int(y1)), color, -1)
            cv2.putText(output, label, (int(x1), int(y1) - 5), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.5, (255, 255, 255), 1, cv2.LINE_AA)
            
            # Temporal label
            (w2, h2), _ = cv2.getTextSize(temp_label, cv2.FONT_HERSHEY_SIMPLEX, 0.4, 1)
            cv2.rectangle(output, (int(x1), int(y2)), (int(x1) + w2, int(y2) + h2 + 10), (0, 0, 0), -1)
            cv2.putText(output, temp_label, (int(x1), int(y2) + h2 + 5), 
                       cv2.FONT_HERSHEY_SIMPLEX, 0.4, (255, 255, 255), 1, cv2.LINE_AA)
            
            # Log detection
            logger.add_log(class_name, conf, track_age=track_age, trend=trend)
        
        return output
    
    def draw_fusion_detections(self, img, enhanced_detections, logger):
        """Draw fusion detections (same as RNN for now)"""
        # For now, fusion just passes through RNN detections
        return self.draw_rnn_detections(img, enhanced_detections, logger)
    
    def add_info_panel(self, img, title, fps, logger, inference_time=0, color=(0, 255, 65)):
        """Add information panel to image"""
        output = img.copy()
        h, w = output.shape[:2]
        
        scale = w / 640.0
        font_scale_title = 0.8 * scale
        font_scale_text = 0.45 * scale
        thickness_title = max(2, int(2 * scale))
        thickness_text = max(1, int(1 * scale))
        
        # Create overlay
        overlay = output.copy()
        
        # Title bar
        title_height = int(50 * scale)
        cv2.rectangle(overlay, (0, 0), (w, title_height), (20, 27, 45), -1)
        cv2.putText(overlay, title, (int(10 * scale), int(35 * scale)), 
                   cv2.FONT_HERSHEY_SIMPLEX, font_scale_title, color, thickness_title, cv2.LINE_AA)
        
        # Metrics panel
        metrics_height = int(130 * scale)
        cv2.rectangle(overlay, (0, title_height), (w, title_height + metrics_height), (30, 37, 55), -1)
        
        # FPS and latency
        y_offset = title_height + int(30 * scale)
        fps_text = f"FPS: {fps:.1f}"
        cv2.putText(overlay, fps_text, (int(10 * scale), y_offset), 
                   cv2.FONT_HERSHEY_SIMPLEX, font_scale_text, color, thickness_text, cv2.LINE_AA)
        
        # Detection count
        detections = logger.get_logs()
        det_count = len(detections)
        det_text = f"Detections: {det_count}"
        cv2.putText(overlay, det_text, (int(w//2), y_offset), 
                   cv2.FONT_HERSHEY_SIMPLEX, font_scale_text, (255, 255, 255), thickness_text, cv2.LINE_AA)
        
        # Latency
        y_offset += int(25 * scale)
        latency_text = f"Latency: {inference_time:.1f}ms"
        cv2.putText(overlay, latency_text, (int(10 * scale), y_offset), 
                   cv2.FONT_HERSHEY_SIMPLEX, font_scale_text, (200, 200, 200), thickness_text, cv2.LINE_AA)
        
        # Active tracks (if RNN layer)
        if "RNN" in title and hasattr(self.rnn_temporal, 'tracks'):
            active_tracks = len(self.rnn_temporal.tracks)
            track_text = f"Active Tracks: {active_tracks}"
            cv2.putText(overlay, track_text, (int(w//2), y_offset), 
                       cv2.FONT_HERSHEY_SIMPLEX, font_scale_text, (0, 255, 255), thickness_text, cv2.LINE_AA)
        
        # Recent detections log
        y_offset += int(30 * scale)
        cv2.putText(overlay, "Recent Detections:", (int(10 * scale), y_offset), 
                   cv2.FONT_HERSHEY_SIMPLEX, font_scale_text * 0.9, (150, 150, 150), thickness_text, cv2.LINE_AA)
        
        y_offset += int(20 * scale)
        for log in list(detections)[-3:]:  # Show last 3
            log_text = f"{log['time']} | {log['class']} | {log['conf']:.3f}"
            if 'age' in log:
                log_text += f" | Age:{log['age']} | {log.get('trend', '')}"
            cv2.putText(overlay, log_text, (int(10 * scale), y_offset), 
                       cv2.FONT_HERSHEY_SIMPLEX, font_scale_text * 0.8, (180, 180, 180), thickness_text, cv2.LINE_AA)
            y_offset += int(18 * scale)
        
        # Blend overlay
        output = cv2.addWeighted(overlay, 0.7, output, 0.3, 0)
        
        return output
    
    def run(self):
        """Run the complete 3-layer pipeline"""
        # Open video source
        cap = cv2.VideoCapture(self.source)
        
        if not cap.isOpened():
            print(f"❌ Error: Could not open source {self.source}")
            return
        
        print(f"✅ Source opened: {self.source}")
        print("Press 'q' to quit, 'p' to pause, 's' to save screenshot\n")
        
        paused = False
        frame_times = deque(maxlen=30)
        
        while True:
            if not paused:
                ret, frame = cap.read()
                if not ret:
                    print("\n✅ Testing complete")
                    break
                
                frame_start = time.time()
                self.frame_count += 1
                
                # ===== LAYER 1: YOLO Detection =====
                start_yolo = time.time()
                results = self.yolo(frame, verbose=False)
                time_yolo = (time.time() - start_yolo) * 1000
                fps_yolo = 1000.0 / time_yolo if time_yolo > 0 else 0
                
                # Draw YOLO layer
                frame1, yolo_detections = self.draw_yolo_detections(frame.copy(), results, self.logger_yolo)
                frame1 = self.add_info_panel(frame1, "Layer 1: YOLO Detection", fps_yolo, 
                                            self.logger_yolo, time_yolo, (0, 255, 65))
                
                # ===== LAYER 2: RNN Temporal (EMA) =====
                start_rnn = time.time()
                enhanced_detections = self.rnn_temporal.process_detections(yolo_detections)
                time_rnn = (time.time() - start_rnn) * 1000
                # ✅ FIX: Prevent infinity FPS by setting minimum time
                time_rnn = max(time_rnn, 0.01)  # Minimum 0.01ms
                fps_rnn = 1000.0 / time_rnn if time_rnn > 0 else 0
                
                # Draw RNN layer
                frame2 = self.draw_rnn_detections(frame.copy(), enhanced_detections, self.logger_rnn)
                frame2 = self.add_info_panel(frame2, "Layer 2: RNN Temporal (EMA)", fps_rnn, 
                                            self.logger_rnn, time_rnn, (65, 105, 225))
                
                # ===== LAYER 3: Fusion =====
                start_fusion = time.time()
                # Fusion currently just passes through RNN detections
                fusion_detections = enhanced_detections
                time_fusion = (time.time() - start_fusion) * 1000
                # ✅ FIX: Prevent infinity FPS
                time_fusion = max(time_fusion, 0.01)
                fps_fusion = 1000.0 / time_fusion if time_fusion > 0 else 0
                
                # Draw Fusion layer
                frame3 = self.draw_fusion_detections(frame.copy(), fusion_detections, self.logger_fusion)
                frame3 = self.add_info_panel(frame3, "Layer 3: Fusion", fps_fusion, 
                                            self.logger_fusion, time_fusion, (0, 255, 65))
                
                # Calculate overall FPS
                frame_time = time.time() - frame_start
                frame_times.append(frame_time)
                avg_fps = len(frame_times) / sum(frame_times) if frame_times else 0
                
                # Print metrics every 10 frames
                if self.frame_count % 10 == 0:
                    print(f"\n📊 Frame {self.frame_count}:")
                    print(f"   YOLO:     {time_yolo:5.1f}ms | {len(yolo_detections)} objects")
                    print(f"   RNN:      {time_rnn:5.1f}ms")
                    for det in enhanced_detections:
                        print(f"   └─ {det['class']}: conf={det['confidence']:.3f} age={det.get('track_age', 0)} boost=+{det.get('temporal_boost', 0):.3f} trend={det.get('trend', 'new')}")
                    if hasattr(self.rnn_temporal, 'tracks'):
                        active = len(self.rnn_temporal.tracks)
                        avg_age = sum(t['age'] for t in self.rnn_temporal.tracks.values()) / active if active > 0 else 0
                        print(f"   Tracking: {active} active, avg_age={avg_age:.1f}")
                
                # Display all three layers
                cv2.imshow("AstroGuard - YOLO Detection", frame1)
                cv2.imshow("AstroGuard - RNN Temporal (EMA)", frame2)
                cv2.imshow("AstroGuard - Fusion Result", frame3)
            
            # Handle key presses
            key = cv2.waitKey(1) & 0xFF
            if key == ord('q'):
                break
            elif key == ord('p'):
                paused = not paused
                print("⏸️  Paused" if paused else "▶️  Resumed")
            elif key == ord('s'):
                timestamp = time.strftime("%Y%m%d_%H%M%S")
                cv2.imwrite(f"screenshot_yolo_{timestamp}.jpg", frame1)
                cv2.imwrite(f"screenshot_rnn_{timestamp}.jpg", frame2)
                cv2.imwrite(f"screenshot_fusion_{timestamp}.jpg", frame3)
                print(f"📸 Screenshots saved: screenshot_*_{timestamp}.jpg")
        
        cap.release()
        cv2.destroyAllWindows()


def select_file_interactive():
    """Interactive file selection"""
    print("\n" + "=" * 60)
    print("🚀 AstroGuard RNN-Enhanced Testing")
    print("=" * 60)
    print("\nSelect Detection Source:")
    print("  [1] 📹 Live Webcam")
    print("  [2] 🖼️  Image File")
    print("  [3] 🎬 Video File")
    print("  [q] ❌ Quit")
    print("-" * 60)
    
    while True:
        choice = input("\nYour choice: ").strip().lower()
        
        if choice == 'q':
            print("👋 Goodbye!")
            sys.exit(0)
        elif choice == '1':
            return 0  # Webcam
        elif choice == '2':
            root = Tk()
            root.withdraw()
            file_path = filedialog.askopenfilename(
                title="Select Image File",
                filetypes=[("Image files", "*.jpg *.jpeg *.png *.bmp"), ("All files", "*.*")]
            )
            root.destroy()
            if file_path:
                return file_path
            print("❌ No file selected")
        elif choice == '3':
            root = Tk()
            root.withdraw()
            file_path = filedialog.askopenfilename(
                title="Select Video File",
                filetypes=[("Video files", "*.mp4 *.avi *.mov *.mkv"), ("All files", "*.*")]
            )
            root.destroy()
            if file_path:
                return file_path
            print("❌ No file selected")
        else:
            print("❌ Invalid choice. Please try again.")


def main():
    parser = argparse.ArgumentParser(description="AstroGuard RNN-Enhanced Testing")
    parser.add_argument("--source", type=str, default=None, help="Video source (0 for webcam, or path to video/image)")
    args = parser.parse_args()
    
    if args.source is None:
        source = select_file_interactive()
    else:
        # Try to convert to int for webcam, otherwise use as path
        try:
            source = int(args.source)
        except ValueError:
            source = args.source
    
    tester = RNNFusionTester(source=source)
    tester.run()


if __name__ == "__main__":
    main()