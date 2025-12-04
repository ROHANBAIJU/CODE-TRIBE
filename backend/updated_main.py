from fastapi import FastAPI, UploadFile, File, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from ultralytics import YOLO
import cv2
import numpy as np
from typing import List, Dict
import asyncio
import json
from pathlib import Path
import sys

# Get absolute paths
backend_dir = Path(__file__).parent.absolute()
project_root = backend_dir.parent
models_dir = backend_dir / "models"

print("=" * 60)
print("🚀 Initializing AstroGuard Vision Agent...")
print("=" * 60)
print(f"\n📂 Project Root: {project_root}")
print(f"📂 Backend Dir: {backend_dir}")
print(f"📂 Models Dir: {models_dir}")

# Check if models directory exists
if not models_dir.exists():
    print(f"\n❌ ERROR: Models directory not found: {models_dir}")
    print("   Creating directory...")
    models_dir.mkdir(parents=True, exist_ok=True)

# Model paths
yolo_speed_path = models_dir / "yolo_speed.pt"
rnn_model_path = models_dir / "rnn_temporal.pt"

print(f"\n📝 YOLO Path: {yolo_speed_path}")
print(f"📝 RNN Path: {rnn_model_path}")

# Check if models exist
if not yolo_speed_path.exists():
    print(f"\n❌ ERROR: YOLO model not found at {yolo_speed_path}")
    # Try to find it in training directory
    training_yolo = project_root / "training" / "runs" / "nano" / "astroguard_speed" / "weights" / "best.pt"
    if training_yolo.exists():
        print(f"✅ Found YOLO in training dir, copying...")
        import shutil
        shutil.copy(training_yolo, yolo_speed_path)
        print(f"✅ Copied to {yolo_speed_path}")
    else:
        print(f"   Training model not found at: {training_yolo}")
        print("   Run: python training/train_nano.py")
        sys.exit(1)

if not rnn_model_path.exists():
    print(f"\n❌ ERROR: RNN model not found at {rnn_model_path}")
    print("   Run: python training/train_rnn.py")
    sys.exit(1)

# Add backend to path for imports
sys.path.insert(0, str(backend_dir))

from core.fusion_enhanced import SpatioTemporalFusion
from core.rnn_temporal import RNNInferenceEngine

app = FastAPI(title="AstroGuard Vision Agent API")

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Initialize Models
print("\n" + "=" * 60)
print("🔧 Loading Models...")
print("=" * 60)

try:
    print("\n  ├─ Loading YOLO Speed Model...")
    yolo_speed = YOLO(str(yolo_speed_path))
    print("  ✅ YOLO loaded successfully")
except Exception as e:
    print(f"  ❌ Failed to load YOLO: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("  ├─ Loading RNN Temporal Engine...")
    rnn_engine = RNNInferenceEngine(
        model_path=str(rnn_model_path),
        device="cpu"  # Change to "cuda" if GPU available
    )
    print("  ✅ RNN loaded successfully")
except Exception as e:
    print(f"  ❌ Failed to load RNN: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

try:
    print("  └─ Initializing Spatio-Temporal Fusion...")
    fusion_engine = SpatioTemporalFusion(
        iou_threshold=0.5,
        temporal_weight=0.3
    )
    print("  ✅ Fusion engine initialized")
except Exception as e:
    print(f"  ❌ Failed to initialize fusion: {e}")
    import traceback
    traceback.print_exc()
    sys.exit(1)

print("\n" + "=" * 60)
print("✅ AstroGuard Online!")
print("=" * 60)


@app.get("/")
async def root():
    return {
        "message": "AstroGuard Vision Agent Online ✓",
        "version": "2.0 - RNN Enhanced",
        "capabilities": [
            "Real-time object detection (YOLO)",
            "Temporal tracking (LSTM)",
            "Activity recognition (GRU)",
            "Anomaly detection (ConvLSTM)",
            "Spatio-temporal fusion (WBF)"
        ]
    }


@app.get("/health")
async def health():
    return {
        "status": "healthy",
        "models": {
            "yolo_speed": "loaded",
            "rnn_temporal": "loaded",
            "fusion": "ready"
        }
    }


@app.post("/detect")
async def detect_image(file: UploadFile = File(...)):
    """
    Single image detection (no temporal processing)
    """
    contents = await file.read()
    nparr = np.frombuffer(contents, np.uint8)
    frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
    
    if frame is None:
        return {"error": "Invalid image"}
    
    # Run YOLO detection
    results = yolo_speed(frame, verbose=False)[0]
    
    # Extract detections
    detections = []
    for box in results.boxes:
        det = {
            'bbox': box.xyxy[0].cpu().numpy().tolist(),
            'confidence': float(box.conf[0]),
            'class_id': int(box.cls[0]),
            'class_name': results.names[int(box.cls[0])]
        }
        detections.append(det)
    
    return {
        "detections": detections,
        "count": len(detections)
    }


@app.websocket("/stream")
async def video_stream(websocket: WebSocket):
    """
    Real-time video stream processing with RNN temporal reasoning
    """
    await websocket.accept()
    
    frame_count = 0
    
    try:
        print("📹 WebSocket client connected")
        
        while True:
            # Receive frame from frontend
            data = await websocket.receive_bytes()
            nparr = np.frombuffer(data, np.uint8)
            frame = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if frame is None:
                continue
            
            frame_count += 1
            h, w = frame.shape[:2]
            
            # Step 1: YOLO Speed Detection with Tracking
            results = yolo_speed.track(frame, persist=True, verbose=False)[0]
            
            # Step 2: Extract detections with tracking IDs
            yolo_detections = []
            for box in results.boxes:
                track_id = int(box.id[0]) if box.id is not None else -1
                
                det = {
                    'bbox': box.xyxy[0].cpu().numpy().tolist(),
                    'bbox_normalized': box.xyxyn[0].cpu().numpy().tolist(),
                    'confidence': float(box.conf[0]),
                    'class_id': int(box.cls[0]),
                    'class_name': results.names[int(box.cls[0])],
                    'track_id': track_id
                }
                yolo_detections.append(det)
            
            # Step 3: RNN Temporal Processing
            enhanced_detections = rnn_engine.process_detections(frame, yolo_detections)
            
            # Step 4: Spatio-Temporal Fusion
            if len(enhanced_detections) > 0:
                boxes_list = [[d['bbox_normalized'] for d in enhanced_detections]]
                scores_list = [[d['confidence'] for d in enhanced_detections]]
                labels_list = [[d['class_id'] for d in enhanced_detections]]
                
                fused_metadata = fusion_engine.fuse_detections(
                    boxes_list, 
                    scores_list, 
                    labels_list, 
                    enhanced_detections,
                    (h, w)
                )
            else:
                fused_metadata = []
            
            # Step 5: Cleanup old tracks
            active_track_ids = [d['track_id'] for d in enhanced_detections if d['track_id'] != -1]
            rnn_engine.cleanup_old_tracks(active_track_ids)
            
            # Step 6: Send results back
            alerts = [m for m in fused_metadata if m.get('alert')]
            
            response = {
                "frame_id": frame_count,
                "timestamp": frame_count / 30.0,
                "detections": fused_metadata,
                "detection_count": len(fused_metadata),
                "alerts": alerts,
                "alert_count": len(alerts)
            }
            
            await websocket.send_json(response)
            
    except WebSocketDisconnect:
        print("📹 WebSocket client disconnected")
    except Exception as e:
        print(f"❌ WebSocket error: {e}")
        try:
            await websocket.close()
        except:
            pass


@app.post("/train/trigger")
async def trigger_retraining(failure_type: str, severity: str = "medium"):
    """
    Trigger AstroOps self-healing pipeline
    """
    print(f"🔄 Retraining triggered: {failure_type} (severity: {severity})")
    
    return {
        "status": "retraining_triggered",
        "failure_type": failure_type,
        "severity": severity,
        "pipeline": {
            "synthetic_data_generation": "queued",
            "model_training": "pending",
            "deployment": "pending"
        },
        "estimated_time": "15-30 minutes"
    }


if __name__ == "__main__":
    import uvicorn
    print("\n" + "=" * 60)
    print("🌐 Starting Uvicorn Server...")
    print("=" * 60)
    print(f"\n  📍 URL: http://0.0.0.0:8000")
    print(f"  📚 Docs: http://0.0.0.0:8000/docs")
    print(f"  🔧 Health: http://0.0.0.0:8000/health")
    print(f"\n  Press CTRL+C to quit\n")
    
    uvicorn.run(app, host="0.0.0.0", port=8000, log_level="info")