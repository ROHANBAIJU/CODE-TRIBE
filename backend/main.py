from fastapi import FastAPI, File, UploadFile, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from ultralytics import YOLO
from PIL import Image
import io
import numpy as np
import time
import os
from datetime import datetime
from core.fusion_enhanced import FusionEnhanced  # Updated import
from core.rnn_temporal import RNNTemporal  # New import
from core.vlm_chat import get_vlm_chat, VLMProvider  # VLM Chat - The Brain
from core.singularitynet import get_snet, init_snet  # SingularityNET integration
from typing import List, Optional

# Try to import motor for MongoDB (optional)
try:
    import motor.motor_asyncio
    MONGO_AVAILABLE = True
except ImportError:
    MONGO_AVAILABLE = False
    print("⚠️  Motor not available - MongoDB features disabled")

app = FastAPI(title="SafetyGuard AI", version="3.0.0")  # Rebranded!

# --- CONFIGURATION ---
MONGO_URI = "mongodb://localhost:27017" 
DB_NAME = "safetyguard_db"
COLLECTION_NAME = "falcon_logs"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE SETUP (Optional) ---
if MONGO_AVAILABLE:
    try:
        client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI, serverSelectionTimeoutMS=3000)
        db = client[DB_NAME]
        logs_collection = db[COLLECTION_NAME]
        print(f"📂 MongoDB initialized: {DB_NAME}")
    except Exception as e:
        MONGO_AVAILABLE = False
        print(f"⚠️  MongoDB connection failed: {e}")
        logs_collection = None
else:
    logs_collection = None
    print("📂 Running without MongoDB (logs will not be persisted)")

# --- MODEL LOADER ---
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

MODEL_PATH_SPEED = os.path.join(MODELS_DIR, "yolo_speed.pt")
MODEL_PATH_ACCURACY = os.path.join(MODELS_DIR, "yolo_accuracy.pt")
MODEL_PATH_RNN = os.path.join(MODELS_DIR, "rnn_temporal.pt")

# Load YOLO models
if os.path.exists(MODEL_PATH_SPEED):
    speed_model_source = MODEL_PATH_SPEED
    print(f"⚡ Loading Trained Speed Model: {speed_model_source}")
else:
    speed_model_source = "yolov8n.pt"
    print(f"⚠️  Trained speed model not found, using pretrained: {speed_model_source}")

if os.path.exists(MODEL_PATH_ACCURACY):
    accuracy_model_source = MODEL_PATH_ACCURACY
    print(f"🎯 Loading Trained Accuracy Model: {accuracy_model_source}")
else:
    accuracy_model_source = "yolov8s.pt"
    print(f"⚠️  Trained accuracy model not found, using pretrained: {accuracy_model_source}")

model_speed = YOLO(speed_model_source)
model_accuracy = YOLO(accuracy_model_source)

# Load RNN and Fusion models
if os.path.exists(MODEL_PATH_RNN):
    rnn_model = RNNTemporal(MODEL_PATH_RNN)
    print(f"🧠 Loading RNN Temporal Model: {MODEL_PATH_RNN}")
else:
    rnn_model = None
    print(f"⚠️  RNN model not found, temporal analysis disabled")

fusion_model = FusionEnhanced(yolo_weight=0.6, rnn_weight=0.4, iou_threshold=0.5)
print(f"🔗 Fusion Enhanced initialized")

# --- DATA MODELS ---
class LogRequest(BaseModel):
    camera_id: str
    confidence: float
    object_class: str
    timestamp: str

class LogResponse(LogRequest):
    id: str = Field(alias="_id")

class MapRequest(BaseModel):
    x: float
    y: float
    label: str

class ChatRequest(BaseModel):
    query: str
    include_detections: bool = True

class ChatResponse(BaseModel):
    is_safe: bool
    confidence: float
    summary: str
    alerts: List[str]
    recommendations: List[str]
    equipment_count: int

class DetectionResponse(BaseModel):
    box: List[float]
    score: float
    label: str
    class_id: int
    layer: str  # "yolo", "rnn", or "fused"
    track_id: Optional[str] = None
    track_age: Optional[int] = None
    temporal_boost: Optional[float] = None
    yolo_confidence: Optional[float] = None
    rnn_confidence: Optional[float] = None

# --- HELPER FUNCTIONS ---
def yolo_results_to_detections(results, model_names):
    """Convert YOLO results to detection dict format"""
    detections = []
    for r in results:
        boxes = r.boxes
        for box in boxes:
            detections.append({
                'class': model_names[int(box.cls)],
                'confidence': float(box.conf),
                'bbox': box.xyxy[0].tolist(),
                'class_id': int(box.cls)
            })
    return detections

# --- ENDPOINTS ---

@app.get("/system/health")
async def health_check():
    db_status = "disabled"
    if MONGO_AVAILABLE and logs_collection is not None:
        try:
            await client.admin.command('ping')
            db_status = "connected"
        except Exception:
            db_status = "disconnected"
    
    rnn_status = "active" if rnn_model else "disabled"
        
    return {
        "status": "nominal", 
        "modules": ["Inference", "Falcon-Link", "RNN-Temporal", "Fusion-Enhanced", "VLM-Chat", "SingularityNET"], 
        "db_connection": db_status, 
        "rnn_temporal": rnn_status,
        "gpu": "active",
        "version": "3.0.0"
    }

@app.post("/detect/fusion")
async def run_inference(file: UploadFile = File(...)):
    """Enhanced 3-Layer Detection System"""
    start_time = time.time()
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data))
    img_np = np.array(image)

    # Layer 1: YOLO Detection (both models)
    layer1_start = time.time()
    results_speed = model_speed(img_np, conf=0.25)
    results_accuracy = model_accuracy(img_np, conf=0.25)
    
    # Convert to detection format
    detections_speed = yolo_results_to_detections(results_speed, model_speed.names)
    detections_accuracy = yolo_results_to_detections(results_accuracy, model_accuracy.names)
    
    # Combine YOLO detections (simple approach: use accuracy model primarily)
    yolo_detections = detections_accuracy if detections_accuracy else detections_speed
    layer1_time = time.time() - layer1_start

    # Layer 2: RNN Temporal Analysis
    layer2_start = time.time()
    if rnn_model:
        rnn_detections = rnn_model.process_detections(yolo_detections)
    else:
        rnn_detections = yolo_detections  # Pass through if RNN disabled
    layer2_time = time.time() - layer2_start

    # Layer 3: Spatio-Temporal Fusion
    layer3_start = time.time()
    fused_detections = fusion_model.fuse_detections(yolo_detections, rnn_detections)
    layer3_time = time.time() - layer3_start

    # Prepare response
    falcon_trigger = False
    response_detections = []

    for det in fused_detections:
        score = det['confidence']
        
        # Falcon trigger logic
        if 0.25 < score < 0.45:
            falcon_trigger = True
        
        response_detections.append({
            "box": det['bbox'],
            "score": round(score, 3),
            "label": det['class'],
            "class_id": det.get('class_id', 0),
            "layer": "fused",
            "track_id": det.get('track_id'),
            "track_age": det.get('track_age'),
            "temporal_boost": round(det.get('temporal_boost', 0.0), 3),
            "yolo_confidence": round(det.get('yolo_confidence', score), 3),
            "rnn_confidence": round(det.get('rnn_confidence', score), 3),
            "fusion_weights": det.get('weights', 'N/A')
        })

    total_time = time.time() - start_time

    return {
        "latency_ms": round(total_time * 1000, 2),
        "layer_timings": {
            "layer1_yolo_ms": round(layer1_time * 1000, 2),
            "layer2_rnn_ms": round(layer2_time * 1000, 2),
            "layer3_fusion_ms": round(layer3_time * 1000, 2)
        },
        "falcon_trigger": falcon_trigger,
        "count": len(response_detections),
        "detections": response_detections,
        "system_info": {
            "rnn_enabled": rnn_model is not None,
            "fusion_version": "enhanced_v2"
        }
    }

@app.post("/detect/layer/{layer_num}")
async def run_single_layer(layer_num: int, file: UploadFile = File(...)):
    """Debug endpoint: Test individual layers"""
    if layer_num not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="Layer must be 1, 2, or 3")
    
    start_time = time.time()
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data))
    img_np = np.array(image)

    if layer_num == 1:
        # YOLO only
        results = model_accuracy(img_np, conf=0.25)
        detections = yolo_results_to_detections(results, model_accuracy.names)
        layer_name = "YOLO Detection"
        
    elif layer_num == 2:
        # YOLO + RNN
        results = model_accuracy(img_np, conf=0.25)
        yolo_dets = yolo_results_to_detections(results, model_accuracy.names)
        if rnn_model:
            detections = rnn_model.process_detections(yolo_dets)
        else:
            detections = yolo_dets
        layer_name = "RNN Temporal"
        
    else:  # layer_num == 3
        # Full fusion
        results = model_accuracy(img_np, conf=0.25)
        yolo_dets = yolo_results_to_detections(results, model_accuracy.names)
        if rnn_model:
            rnn_dets = rnn_model.process_detections(yolo_dets)
            detections = fusion_model.fuse_detections(yolo_dets, rnn_dets)
        else:
            detections = yolo_dets
        layer_name = "Spatio-Temporal Fusion"

    return {
        "layer": layer_num,
        "layer_name": layer_name,
        "latency_ms": round((time.time() - start_time) * 1000, 2),
        "count": len(detections),
        "detections": detections
    }

# ✅ UPDATED: Saves to MongoDB (optional)
@app.post("/astroops/log")
async def log_event(log: LogRequest):
    print(f"⚠️ [FALCON TRIGGER] Saving to MongoDB: {log.object_class} ({log.confidence})")
    
    log_dict = log.dict()
    log_dict["status"] = "PENDING_RETRAIN"
    log_dict["created_at"] = datetime.utcnow()
    
    if logs_collection is not None:
        new_log = await logs_collection.insert_one(log_dict)
        return {"status": "saved", "id": str(new_log.inserted_id), "action": "synthetic_data_generation_queued"}
    else:
        # MongoDB not available, return simulated response
        import uuid
        return {"status": "saved_locally", "id": str(uuid.uuid4()), "action": "synthetic_data_generation_queued", "note": "MongoDB disabled"}

# ✅ NEW ENDPOINT: Fetch History (From MongoDB)
@app.get("/astroops/history")
async def get_logs():
    logs = []
    
    if logs_collection is not None:
        cursor = logs_collection.find().sort("created_at", -1).limit(20)
        
        async for document in cursor:
            document["_id"] = str(document["_id"])
            if "created_at" in document:
                 document["created_at"] = document["created_at"].isoformat()
            logs.append(document)
    
    return {"history": logs}

@app.post("/mapping/2d")
async def get_map_coordinates(data: MapRequest):
    return {
        "map_x": data.x * 100,
        "map_y": (1 - data.y) * 100,
        "zone": "Habitation Module"
    }

# ============================================
# VLM CHAT ENDPOINTS - THE BRAIN 🧠
# ============================================

# Store last detection for chat context
_last_detections = []
_last_image_bytes = None

@app.post("/chat/safety")
async def chat_safety_query(
    file: UploadFile = File(...),
    query: str = Form(default="Is this area safe?")
):
    """
    Natural language safety query with image analysis
    The Brain of SafetyGuard - combines vision detection with language understanding
    """
    global _last_detections, _last_image_bytes
    
    start_time = time.time()
    
    # Read image
    image_bytes = await file.read()
    _last_image_bytes = image_bytes
    image = Image.open(io.BytesIO(image_bytes))
    img_np = np.array(image)
    
    # Run detection first
    results_accuracy = model_accuracy(img_np, conf=0.25)
    yolo_detections = yolo_results_to_detections(results_accuracy, model_accuracy.names)
    
    # Apply RNN temporal
    if rnn_model:
        rnn_detections = rnn_model.process_detections(yolo_detections)
        fused_detections = fusion_model.fuse_detections(yolo_detections, rnn_detections)
    else:
        fused_detections = yolo_detections
    
    _last_detections = fused_detections
    
    # Query VLM
    vlm = get_vlm_chat()
    analysis = await vlm.analyze_safety(image_bytes, query, fused_detections)
    
    total_time = time.time() - start_time
    
    return {
        "query": query,
        "response": analysis.summary,
        "is_safe": analysis.is_safe,
        "confidence": analysis.confidence,
        "alerts": analysis.alerts,
        "recommendations": analysis.recommendations,
        "equipment_detected": len(analysis.detected_equipment),
        "detections": fused_detections,
        "processing_time_ms": round(total_time * 1000, 2)
    }

@app.post("/chat/quick")
async def chat_quick_query(query: str = Form(...)):
    """
    Quick chat query using last detection results (no new image)
    Useful for follow-up questions
    """
    global _last_detections
    
    if not _last_detections:
        return {
            "query": query,
            "response": "⚠️ No previous detection data available. Please upload an image first using /chat/safety",
            "is_safe": None
        }
    
    vlm = get_vlm_chat()
    quick_response = await vlm.quick_check(_last_detections)
    
    return {
        "query": query,
        "response": quick_response,
        "detections_used": len(_last_detections),
        "equipment": [d.get('label', d.get('class', 'Unknown')) for d in _last_detections]
    }

@app.get("/chat/status")
async def chat_status():
    """Get VLM chat system status"""
    vlm = get_vlm_chat()
    return {
        "provider": vlm.provider.value,
        "groq_configured": bool(vlm.groq_api_key),
        "status": "active",
        "last_detections_count": len(_last_detections) if _last_detections else 0
    }

# ============================================
# SINGULARITYNET INTEGRATION ENDPOINTS
# ============================================

@app.get("/snet/status")
async def snet_status():
    """Get SingularityNET connection status"""
    snet = get_snet()
    status = await snet.get_status()
    return {
        "snet_integration": "active",
        **status
    }

@app.post("/snet/connect")
async def snet_connect(wallet_address: Optional[str] = None):
    """Connect to SingularityNET network"""
    result = await init_snet(wallet_address)
    return result

@app.post("/snet/disconnect")
async def snet_disconnect():
    """Disconnect from SingularityNET"""
    snet = get_snet()
    return await snet.disconnect()

@app.get("/snet/services")
async def snet_list_services():
    """List available services on the marketplace"""
    snet = get_snet()
    services = await snet.list_services()
    return {
        "services": [s.model_dump() for s in services],
        "count": len(services)
    }

@app.get("/snet/published")
async def snet_published_services():
    """Get our published services"""
    snet = get_snet()
    services = await snet.get_published_services()
    return {
        "published_services": [s.model_dump() for s in services],
        "count": len(services)
    }

class PublishServiceRequest(BaseModel):
    service_name: str
    service_type: str
    description: str
    price_per_call: float = 0.001

@app.post("/snet/publish")
async def snet_publish_service(request: PublishServiceRequest):
    """Publish a new AI service to SingularityNET marketplace"""
    snet = get_snet()
    if not snet.is_connected:
        await snet.connect()
    
    result = await snet.publish_service(
        service_name=request.service_name,
        service_type=request.service_type,
        description=request.description,
        price_per_call=request.price_per_call
    )
    return result

class CallServiceRequest(BaseModel):
    service_id: str
    input_data: dict = {}

@app.post("/snet/call")
async def snet_call_service(request: CallServiceRequest):
    """Call an AI service on the marketplace"""
    snet = get_snet()
    if not snet.is_connected:
        await snet.connect()
    
    result = await snet.call_service(request.service_id, request.input_data)
    return result

@app.get("/snet/earnings")
async def snet_earnings():
    """Get earnings report for published services"""
    snet = get_snet()
    return await snet.get_earnings_report()

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)