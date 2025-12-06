# 🚀 SafetyGuard AI - Render Deployment Guide

This guide will help you deploy the SafetyGuard AI backend to [Render.com](https://render.com).

---

## 📋 Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Render Account** - Sign up at [render.com](https://render.com) (free tier available)
3. **API Keys** (Optional but recommended):
   - [Groq API Key](https://console.groq.com) - For VLM Chat "The Brain"
   - [Hugging Face Token](https://huggingface.co/settings/tokens) - For Falcon image generation

---

## 🎯 Step 1: Prepare Your Repository

### 1.1 Ensure Files Are Ready

Your repository should have these files (already configured):
- ✅ `render.yaml` - Render deployment configuration
- ✅ `requirements.txt` - Python dependencies
- ✅ `.env.example` - Environment variables template
- ✅ `backend/main.py` - FastAPI application with dynamic CORS

### 1.2 Push to GitHub

```bash
git add .
git commit -m "Add Render deployment configuration"
git push origin main
```

---

## 🚀 Step 2: Deploy to Render

### 2.1 Create New Web Service

1. Go to [Render Dashboard](https://dashboard.render.com/)
2. Click **"New +"** → **"Web Service"**
3. Connect your GitHub repository
4. Select your `CODE-TRIBE` repository

### 2.2 Configure Service (Auto-detected from render.yaml)

Render will auto-detect settings from `render.yaml`, but verify:

| Setting | Value |
|---------|-------|
| **Name** | `safetyguard-ai-backend` (or your choice) |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install --upgrade pip && pip install -r requirements.txt` |
| **Start Command** | `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` |
| **Plan** | **Free** |

### 2.3 Set Environment Variables

Click **"Advanced"** → **"Add Environment Variable"**

#### Required Variables:

```bash
# Python Configuration
PYTHON_VERSION=3.10.0

# CORS (Important! Update with your frontend URL later)
CORS_ORIGINS=http://localhost:5173,https://localhost:5173
```

#### Optional API Keys (Recommended):

```bash
# Groq API for VLM Chat
GROQ_API_KEY=your_actual_groq_api_key

# Hugging Face for Image Generation
HUGGINGFACE_API_KEY=your_actual_hf_token

# Optional: Other APIs
REPLICATE_API_KEY=your_replicate_key
STABILITY_API_KEY=your_stability_key
```

> **Note:** Leave MongoDB variables unset - not needed for deployment.

### 2.4 Deploy!

1. Click **"Create Web Service"**
2. Render will start building and deploying
3. Watch the logs for any errors
4. Deployment takes ~5-10 minutes on first deploy

---

## ✅ Step 3: Verify Deployment

### 3.1 Get Your Backend URL

Once deployed, you'll get a URL like:
```
https://safetyguard-ai-backend.onrender.com
```

### 3.2 Test Health Endpoint

Open in browser or use curl:
```bash
curl https://your-backend-url.onrender.com/system/health
```

Expected response:
```json
{
  "status": "nominal",
  "modules": ["Inference", "Falcon-Link", "RNN-Temporal", ...],
  "db_connection": "disabled",
  "rnn_temporal": "active",
  "gpu": "active",
  "version": "3.0.0"
}
```

### 3.3 Test API Documentation

Visit: `https://your-backend-url.onrender.com/docs`

You should see the FastAPI interactive documentation.

---

## 🔧 Step 4: Update CORS for Production

### 4.1 When You Deploy Frontend (Later)

After deploying your frontend to Vercel, you'll get a URL like:
```
https://safetyguard-ai.vercel.app
```

### 4.2 Update CORS_ORIGINS in Render

1. Go to your Render service
2. Navigate to **Environment** tab
3. Update `CORS_ORIGINS`:
   ```
   http://localhost:5173,https://safetyguard-ai.vercel.app
   ```
4. Save changes
5. Service will auto-redeploy

---

## ⚠️ Important Notes

### Free Tier Limitations

- **Spin Down**: Service goes to sleep after 15 minutes of inactivity
- **Cold Start**: First request after sleep takes ~30-60 seconds
- **750 hours/month** of runtime (enough for hobby projects)
- **No persistent disk** - use pretrained YOLO models (already configured)

### Model Files

The backend is configured to use pretrained YOLO models:
- `yolov8n.pt` - Speed model (downloads automatically)
- `yolov8s.pt` - Accuracy model (downloads automatically)

Custom trained models (`yolo_speed.pt`, `yolo_accuracy.pt`) are not used in production unless you:
1. Upload them to cloud storage (S3, Google Drive, etc.)
2. Download them on service startup

### WebSocket Support

WebSocket connections (`/ws/webcam`) work on Render free tier! ✅

---

## 🐛 Troubleshooting

### Build Fails

**Error:** `Could not find a version that satisfies the requirement torch==2.5.1`

**Solution:** Render uses CPU-only PyTorch. Update `requirements.txt`:
```bash
# Change this line:
torch==2.5.1

# To this (CPU-only):
torch==2.5.1+cpu --extra-index-url https://download.pytorch.org/whl/cpu
torchvision==0.20.1+cpu --extra-index-url https://download.pytorch.org/whl/cpu
```

### CORS Errors

**Error:** `Access-Control-Allow-Origin` errors in browser

**Solution:** Make sure `CORS_ORIGINS` includes your frontend URL:
```bash
CORS_ORIGINS=http://localhost:5173,https://your-app.vercel.app
```

### Service Crashes

**Error:** Service keeps restarting

**Solution:** Check logs in Render dashboard:
1. Click on your service
2. Go to **"Logs"** tab
3. Look for Python errors
4. Common issues:
   - Missing environment variables
   - Import errors (check `requirements.txt`)
   - Port binding (use `$PORT` in start command)

### Slow Cold Starts

**Issue:** First request takes 30+ seconds

**This is normal** for Render free tier! Solutions:
1. Upgrade to paid plan ($7/month) - no sleep
2. Use a cron job to ping your service every 10 minutes
3. Accept the trade-off for free hosting

---

## 📊 Monitoring Your Service

### View Logs

```bash
# In Render dashboard
Logs → Real-time logs
```

### Check Metrics

```bash
# In Render dashboard
Metrics → CPU, Memory, Response time
```

### Health Checks

Render automatically pings `/system/health` every 30 seconds

---

## 🎉 Next Steps

Once your backend is deployed:

1. ✅ Save your backend URL
2. ✅ Test all endpoints via `/docs`
3. ✅ Configure API keys if needed
4. 🔜 Deploy frontend to Vercel
5. 🔜 Update CORS with Vercel URL
6. 🔜 Test full integration

---

## 🆘 Need Help?

- **Render Docs**: https://render.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **GitHub Issues**: Report bugs in your repository

---

## 🏆 Success Checklist

- [ ] Backend deployed to Render
- [ ] Health endpoint returns `200 OK`
- [ ] API docs accessible at `/docs`
- [ ] Environment variables configured
- [ ] CORS origins set correctly
- [ ] All endpoints tested
- [ ] Cold start time acceptable
- [ ] Ready for frontend deployment

**Backend URL:** `https://______________________.onrender.com`

---

**Congratulations! Your SafetyGuard AI backend is live! 🎉**
