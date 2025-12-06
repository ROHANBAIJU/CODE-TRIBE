# 🎨 SafetyGuard AI - Vercel Frontend Deployment Guide

This guide will help you deploy the SafetyGuard AI frontend to [Vercel](https://vercel.com).

---

## 📋 Prerequisites

1. **GitHub Account** - Your code must be in a GitHub repository
2. **Vercel Account** - Sign up at [vercel.com](https://vercel.com) (free tier available)
3. **Backend URL** - Your deployed Render backend URL (e.g., `https://safetyguard-ai-backend.onrender.com`)

---

## 🎯 Step 1: Prepare Frontend Configuration

### 1.1 Create Environment Files

Create these files in the `frontend/` directory:

**`frontend/.env.production`** (for Vercel deployment):
```bash
VITE_API_URL=https://your-backend-url.onrender.com
```

**`frontend/.env.development`** (for local development):
```bash
VITE_API_URL=http://localhost:8000
```

Replace `your-backend-url.onrender.com` with your actual Render backend URL.

### 1.2 Update API Service

Check that `frontend/src/services/api.ts` uses the environment variable:

```typescript
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';
```

If not already done, update it to use `import.meta.env.VITE_API_URL`.

### 1.3 Create Vercel Configuration

Create `vercel.json` in the **root directory** (not inside frontend):

```json
{
  "buildCommand": "cd frontend && npm install && npm run build",
  "outputDirectory": "frontend/dist",
  "framework": "vite",
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

---

## 🚀 Step 2: Deploy to Vercel

### 2.1 Push to GitHub

```bash
git add .
git commit -m "Add Vercel deployment configuration"
git push origin main
```

### 2.2 Import Project to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Click **"Import Git Repository"**
4. Select your `CODE-TRIBE` repository
5. Click **"Import"**

### 2.3 Configure Project Settings

Vercel will show configuration screen:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Root Directory** | `frontend` |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |

### 2.4 Add Environment Variable

1. Scroll to **"Environment Variables"** section
2. Add variable:
   - **Name**: `VITE_API_URL`
   - **Value**: `https://your-backend-url.onrender.com`
   - **Environments**: Select **Production**, **Preview**, and **Development**
3. Click **"Add"**

### 2.5 Deploy!

1. Click **"Deploy"**
2. Vercel will start building
3. Build takes ~2-5 minutes
4. Watch the build logs for any errors

---

## ✅ Step 3: Verify Deployment

### 3.1 Get Your Frontend URL

Once deployed, you'll get a URL like:
```
https://code-tribe.vercel.app
```
or
```
https://safetyguard-ai.vercel.app
```

### 3.2 Test the Application

1. **Open your Vercel URL** in browser
2. **Upload an image** to test detection
3. **Check browser console** for any errors
4. **Test all features:**
   - Image upload & detection
   - AI Chat (VLM)
   - AstroOps pipeline
   - SingularityNet panel

### 3.3 Check API Calls

Open browser DevTools (F12) → Network tab:
- API calls should go to your Render backend
- Status should be `200 OK`
- No CORS errors

---

## 🔧 Step 4: Update Backend CORS

### 4.1 Add Vercel URL to Backend

1. Go to your **Render Dashboard**
2. Select your backend service
3. Go to **"Environment"** tab
4. Update `CORS_ORIGINS`:
   ```
   http://localhost:5173,https://your-app.vercel.app
   ```
5. Click **"Save Changes"**
6. Service will auto-redeploy (~2-3 minutes)

### 4.2 Test CORS

After backend redeploys:
1. Refresh your Vercel app
2. Try uploading an image
3. Should work without CORS errors ✅

---

## 🎨 Step 5: Custom Domain (Optional)

### 5.1 Add Custom Domain

1. In Vercel project settings
2. Go to **"Domains"** tab
3. Click **"Add"**
4. Enter your domain: `safetyguard.ai` (example)
5. Follow DNS configuration instructions

### 5.2 Update Backend CORS

Add your custom domain to backend `CORS_ORIGINS`:
```
http://localhost:5173,https://your-app.vercel.app,https://safetyguard.ai
```

---

## ⚠️ Important Notes

### Free Tier Features

✅ **Unlimited deployments**  
✅ **Automatic HTTPS**  
✅ **100GB bandwidth/month**  
✅ **Automatic preview deployments** for PRs  
✅ **Edge network (CDN)**  
✅ **Zero downtime** deployments  

### Environment Variables

- `VITE_API_URL` - **Required** - Points to your Render backend
- Variables must start with `VITE_` to be exposed in frontend
- Changes require redeployment

### WebSocket Configuration

For webcam detection (`/ws/webcam`):
```typescript
// In your frontend code
const wsUrl = API_BASE_URL.replace('https://', 'wss://').replace('http://', 'ws://');
const ws = new WebSocket(`${wsUrl}/ws/webcam`);
```

Make sure your API service handles this correctly.

---

## 🐛 Troubleshooting

### Build Fails

**Error:** `Module not found` or dependency errors

**Solution:**
```bash
# Test build locally first
cd frontend
npm install
npm run build

# If successful, commit and redeploy
git add .
git commit -m "Fix dependencies"
git push
```

### API Calls Fail (404)

**Error:** API endpoints return 404

**Solution:** Check `VITE_API_URL` environment variable:
1. Vercel Dashboard → Your Project → Settings → Environment Variables
2. Verify URL is correct: `https://your-backend.onrender.com` (no trailing slash)
3. Redeploy to apply changes

### CORS Errors

**Error:** `Access-Control-Allow-Origin` in console

**Solution:** 
1. Verify backend `CORS_ORIGINS` includes your Vercel URL
2. Check backend logs for CORS configuration
3. Backend should log: `🌐 CORS Origins: ['http://localhost:5173', 'https://your-app.vercel.app']`

### Images Not Uploading

**Error:** File upload fails or times out

**Solution:**
1. Check Render backend is running (not spun down)
2. Increase timeout in frontend API calls
3. Verify file size is reasonable (<10MB)

### Environment Variables Not Working

**Issue:** Frontend still uses localhost

**Solution:**
1. Variables must start with `VITE_`
2. Redeploy after adding variables
3. Clear browser cache
4. Check in browser console: `console.log(import.meta.env.VITE_API_URL)`

---

## 🔄 Redeployment

### Automatic Deployments

Vercel automatically deploys when you push to GitHub:
```bash
git add .
git commit -m "Update feature"
git push origin main
# Vercel auto-deploys in ~2 minutes
```

### Manual Deployment

1. Vercel Dashboard → Your Project
2. Click **"Deployments"** tab
3. Click **"Redeploy"** on latest deployment

### Preview Deployments

Every pull request gets a preview URL:
- Automatic preview deployment
- Separate URL for testing
- No impact on production

---

## 📊 Monitoring

### View Deployment Logs

1. Vercel Dashboard → Your Project
2. Click **"Deployments"**
3. Click on specific deployment
4. View build logs and runtime logs

### Analytics (Pro Plan)

- Page views
- Performance metrics
- User analytics
- Core Web Vitals

---

## 🎉 Success Checklist

- [ ] Frontend deployed to Vercel
- [ ] Environment variable `VITE_API_URL` set
- [ ] Can access app via Vercel URL
- [ ] Image upload works
- [ ] Detections display correctly
- [ ] AI Chat works
- [ ] No CORS errors
- [ ] Backend CORS updated with Vercel URL
- [ ] All features tested
- [ ] WebSocket (webcam) works
- [ ] Mobile responsive

---

## 🌐 Final URLs

**Frontend:** `https://______________________.vercel.app`  
**Backend:** `https://______________________.onrender.com`  
**API Docs:** `https://______________________.onrender.com/docs`

---

## 🚀 Next Steps

1. ✅ Test full application flow
2. ✅ Share demo link for hackathon
3. ✅ Monitor Vercel analytics
4. 📱 Test on mobile devices
5. 🎥 Record demo video
6. 📝 Update README with live demo links

---

## 🆘 Need Help?

- **Vercel Docs**: https://vercel.com/docs
- **Vite Docs**: https://vitejs.dev
- **GitHub Issues**: Report bugs in your repository

---

**Congratulations! Your SafetyGuard AI is fully deployed! 🎉**

**Live Demo:** `https://your-app.vercel.app`
