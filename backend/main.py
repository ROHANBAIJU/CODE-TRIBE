from fastapi import FastAPI, File, UploadFile, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field
from ultralytics import YOLO
from PIL import Image
import io
import numpy as np
import time
import os
import motor.motor_asyncio # <--- NEW: MongoDB Async Driver
from datetime import datetime
from core.fusion import apply_wbf
from typing import List, Optional

app = FastAPI(title="AstroGuard API", version="1.3.0")

# --- CONFIGURATION ---
# 1. MongoDB Connection String
# For Local MongoDB: "mongodb://localhost:27017"
# For MongoDB Atlas: "mongodb+srv://<user>:<password>@cluster.mongodb.net/..."
MONGO_URI = "mongodb://localhost:27017" 
DB_NAME = "astroguard_db"
COLLECTION_NAME = "falcon_logs"

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# --- DATABASE SETUP (Motor Async) ---
client = motor.motor_asyncio.AsyncIOMotorClient(MONGO_URI)
db = client[DB_NAME]
logs_collection = db[COLLECTION_NAME]

print(f"📂 MongoDB initialized: {DB_NAME}")

# --- MODEL LOADER ---
# Get absolute path to models directory
BASE_DIR = os.path.dirname(os.path.abspath(__file__))
MODELS_DIR = os.path.join(BASE_DIR, "models")

MODEL_PATH_SPEED = os.path.join(MODELS_DIR, "yolo_speed.pt")
MODEL_PATH_ACCURACY = os.path.join(MODELS_DIR, "yolo_accuracy.pt")

# Check if trained models exist, otherwise fall back to pretrained
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

# --- DATA MODELS ---
class LogRequest(BaseModel):
    camera_id: str
    confidence: float
    object_class: str
    timestamp: str

class LogResponse(LogRequest):
    id: str = Field(alias="_id") # Maps MongoDB '_id' to 'id'

class MapRequest(BaseModel):
    x: float
    y: float
    label: str

# --- ENDPOINTS ---

@app.get("/system/health")
async def health_check():
    # Ping MongoDB to check connection
    try:
        await client.admin.command('ping')
        db_status = "connected"
    except Exception:
        db_status = "disconnected"
        
    return {"status": "nominal", "modules": ["Inference", "Falcon-Link", "MongoDB"], "db_connection": db_status, "gpu": "active"}

@app.post("/detect/fusion")
async def run_inference(file: UploadFile = File(...)):
    start_time = time.time()
    image_data = await file.read()
    image = Image.open(io.BytesIO(image_data))
    img_np = np.array(image)

    results_1 = model_speed(img_np, conf=0.25)
    results_2 = model_accuracy(img_np, conf=0.25)

    boxes, scores, labels = apply_wbf([results_1[0], results_2[0]], weights=[1, 2])

    detections = []
    falcon_trigger = False

    for box, score, label in zip(boxes, scores, labels):
        if 0.25 < score < 0.45:
            falcon_trigger = True
            
        detections.append({
            "box": box.tolist(),
            "score": round(float(score), 2),
            "label": model_speed.names[int(label)],
            "class_id": int(label)
        })

    return {
        "latency_ms": round((time.time() - start_time) * 1000, 2),
        "falcon_trigger": falcon_trigger,
        "count": len(detections),
        "detections": detections
    }

# ✅ UPDATED: Saves to MongoDB
@app.post("/astroops/log")
async def log_event(log: LogRequest):
    print(f"⚠️ [FALCON TRIGGER] Saving to MongoDB: {log.object_class} ({log.confidence})")
    
    # Prepare document
    log_dict = log.dict()
    log_dict["status"] = "PENDING_RETRAIN"
    log_dict["created_at"] = datetime.utcnow()
    
    # Insert into MongoDB
    new_log = await logs_collection.insert_one(log_dict)
    
    return {"status": "saved", "id": str(new_log.inserted_id), "action": "synthetic_data_generation_queued"}

# ✅ NEW ENDPOINT: Fetch History (From MongoDB)
@app.get("/astroops/history")
async def get_logs():
    logs = []
    # Find last 20 logs, sorted by time descending
    cursor = logs_collection.find().sort("created_at", -1).limit(20)
    
    async for document in cursor:
        # Convert ObjectId to string for JSON serialization
        document["_id"] = str(document["_id"])
        # Handle datetime serialization if needed, or just rely on string timestamp
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

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)