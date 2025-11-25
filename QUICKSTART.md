# 🚀 AstroGuard - Quick Start Guide

## Start Backend

```powershell
# Terminal 1 - Backend
cd d:\CODE-TRIBE\backend
uvicorn main:app --reload --port 8000
```

Backend will run at: **http://localhost:8000**

---

## Start Frontend

```powershell
# Terminal 2 - Frontend
cd d:\CODE-TRIBE\frontend
npm run dev
```

Frontend will run at: **http://localhost:5173**

---

## Access the App

1. Open browser: **http://localhost:5173**
2. Click **"Upload Image"** button
3. Select a test image with safety equipment
4. View real-time detection results!

---

## Navigation

- **Dashboard** - Main detection view with metrics
- **Fusion** - See 3-layer architecture in action  
- **Falcon** - Track synthetic data generation
- **Station Map** - Equipment location visualization

---

## Test the Backend Directly

```powershell
# Health check
curl http://localhost:8000/system/health

# Upload image for detection (use Postman or similar)
POST http://localhost:8000/detect/fusion
Body: form-data, key="file", value=<select image>
```

---

## Stop Servers

Press `Ctrl+C` in each terminal window.

---

## Troubleshooting

**Port already in use:**
```powershell
# Change backend port
uvicorn main:app --reload --port 8001

# Update frontend .env
VITE_API_URL=http://localhost:8001
```

**Dependencies missing:**
```powershell
# Backend
pip install -r requirements.txt

# Frontend
cd frontend
npm install
```

---

**✨ You're ready to go! Upload an image and see AstroGuard in action.**
