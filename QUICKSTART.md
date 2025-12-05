# 🚀 SafetyGuard AI - Quick Start Guide

> Get up and running in under 5 minutes!

---

## Prerequisites

- **Python 3.10+**
- **Node.js 18+**
- **MongoDB** (optional - will use mock if unavailable)
- **NVIDIA GPU** (optional - for faster inference)

---

## ⚡ Fastest Setup (2 Commands)

### Backend
```bash
cd backend
pip install -r ../requirements.txt
python -m uvicorn main:app --reload
```

### Frontend
```bash
cd frontend
npm install && npm run dev
```

**Access:** 
- Frontend: http://localhost:5173
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/docs

---

## 🐳 Docker Setup (Recommended for Demo)

```bash
# Copy environment template
cp .env.example .env

# Start everything
docker-compose up -d

# Check status
docker-compose ps
```

**Access:** http://localhost

---

## 🔑 API Keys (Optional but Recommended)

### Groq API (for VLM Chat "The Brain")
1. Go to https://console.groq.com
2. Create an account and get API key
3. Add to `.env`: `GROQ_API_KEY=your_key_here`

Without Groq, the system uses a mock VLM with smart responses.

---

## 🧪 Test the API

```bash
# Health check
curl http://localhost:8000/system/health

# SingularityNET status
curl http://localhost:8000/snet/status

# VLM chat status
curl http://localhost:8000/chat/status
```

---

## 📱 Using the Dashboard

1. **Upload Image** - Click "Upload Image" button
2. **View Detections** - See safety equipment detected with bounding boxes
3. **AI Chat** - Toggle "AI Chat" to ask questions about safety
4. **AstroOps** - Toggle "AstroOps" to see self-healing pipeline
5. **SNet** - Toggle "SNet" to see SingularityNET integration

### Example Chat Queries:
- "Is this area safe for workers?"
- "What safety equipment is visible?"
- "Are there any hazards I should know about?"
- "Rate the overall safety of this zone"

---

## 🎮 Demo Script

For hackathon demo, follow this sequence:

1. **Show Dashboard** - Overview of the platform
2. **Upload Test Image** - From `datasets/TESTING DATASET/images/`
3. **Point out Detections** - Show bounding boxes and confidence scores
4. **Open AI Chat** - Ask "Is this sector safe?"
5. **Trigger AstroOps** - Click "Simulate Failure" to show self-healing
6. **Show SNet Panel** - Connect wallet, show marketplace services

---

## ⚠️ Troubleshooting

### Backend won't start
```bash
# Make sure you're in the right directory
cd backend

# Check if models exist
ls models/

# If no models, the system will use pretrained YOLO (still works!)
```

### Frontend errors
```bash
# Clear cache and reinstall
cd frontend
rm -rf node_modules package-lock.json
npm install
npm run dev
```

### MongoDB connection fails
The system will log a warning but continue working. Detection features work without MongoDB.

---

## 📞 Support

For hackathon support, contact the CODE-TRIBE team.

**Good luck with the demo! 🏆**
