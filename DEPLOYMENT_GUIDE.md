# InsureScan Deployment Guide

## 🌐 Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                         USER BROWSER                         │
└─────────────────────────────────────────────────────────────┘
                              │
              ┌───────────────┴───────────────┐
              ▼                               ▼
┌─────────────────────────┐     ┌─────────────────────────┐
│     VERCEL (Frontend)   │     │    RENDER (Backend)     │
│                         │     │                         │
│  • React App            │────▶│  • Flask API            │
│  • Static Files         │     │  • AI Analysis          │
│  • Fast CDN             │     │  • PDF/OCR Processing   │
│                         │     │                         │
│  URL: your-app.vercel.app    │  URL: your-api.onrender.com
└─────────────────────────┘     └─────────────────────────┘
```

---

## 📦 PART 1: Deploy Backend on Render

### Step 1: Go to Render
1. Open https://render.com
2. Sign up / Log in with GitHub

### Step 2: Create New Web Service
1. Click **"New +"** → **"Web Service"**
2. Connect your GitHub account if not already
3. Find and select **"danger1406/INSURESCAN"**

### Step 3: Configure the Service
Fill in these settings:

| Setting | Value |
|---------|-------|
| **Name** | `insurescan-api` |
| **Region** | Choose closest to you |
| **Branch** | `main` |
| **Root Directory** | `backend` |
| **Runtime** | `Python 3` |
| **Build Command** | `pip install -r requirements.txt` |
| **Start Command** | `gunicorn app:app --bind 0.0.0.0:$PORT` |
| **Instance Type** | `Free` |

### Step 4: Add Environment Variables
Click **"Advanced"** → **"Add Environment Variable"**

Add these (get new keys from respective providers):
```
OPENROUTER_API_KEY = your-openrouter-key
GOOGLE_API_KEY = your-gemini-key
BYTEZ_API_KEY = your-bytez-key
```

### Step 5: Deploy
1. Click **"Create Web Service"**
2. Wait 3-5 minutes for build
3. Copy your URL (e.g., `https://insurescan-api.onrender.com`)

### Step 6: Test Backend
Visit: `https://your-render-url.onrender.com/`
Should show: `{"status": "healthy", "service": "InsureScan API"}`

---

## 🚀 PART 2: Deploy Frontend on Vercel

### Step 1: Go to Vercel
1. Open https://vercel.com
2. Sign up / Log in with GitHub

### Step 2: Import Project
1. Click **"Add New..."** → **"Project"**
2. Find and select **"danger1406/INSURESCAN"**

### Step 3: Configure the Project
Fill in these settings:

| Setting | Value |
|---------|-------|
| **Framework Preset** | `Create React App` |
| **Root Directory** | `frontend` (click Edit and type `frontend`) |
| **Build Command** | `npm run build` |
| **Output Directory** | `build` |
| **Install Command** | `npm install` |

### Step 4: Add Environment Variable
Click **"Environment Variables"** and add:

| Key | Value |
|-----|-------|
| `REACT_APP_API_URL` | `https://your-render-url.onrender.com` |

⚠️ **Replace with YOUR actual Render URL from Part 1!**

### Step 5: Deploy
1. Click **"Deploy"**
2. Wait 2-3 minutes for build
3. Your app will be live at `https://your-project.vercel.app`

---

## ✅ Verification Checklist

After deployment, verify:

- [ ] Render backend shows healthy status at `/`
- [ ] Vercel frontend loads the InsureScan homepage
- [ ] "Quick Demo" button works and shows analysis
- [ ] Dark/Light mode toggle works
- [ ] File upload triggers loading animation

---

## 🔧 Troubleshooting

### Render Issues:
- **Build fails**: Check requirements.txt has all dependencies
- **App crashes**: Check Render logs for errors
- **502 Gateway**: App is starting up, wait 30 seconds

### Vercel Issues:
- **404 error**: Check Root Directory is set to `frontend`
- **API errors**: Verify REACT_APP_API_URL is correct
- **CORS errors**: Backend needs to allow your Vercel domain

### CORS Fix (if needed):
In backend/app.py, update CORS to allow your Vercel domain:
```python
CORS(app, origins=["https://your-project.vercel.app"])
```

---

## 🔗 Final URLs

After successful deployment:

| Service | URL |
|---------|-----|
| **Frontend (Vercel)** | `https://insurescan.vercel.app` |
| **Backend (Render)** | `https://insurescan-api.onrender.com` |
| **API Health Check** | `https://insurescan-api.onrender.com/` |
| **API Demo Endpoint** | `https://insurescan-api.onrender.com/demo` |

---

## 📝 Notes

1. **Render Free Tier**: Sleeps after 15 mins of inactivity. First request takes ~30 seconds to wake up.

2. **API Keys**: Never commit to GitHub! Always use environment variables.

3. **Custom Domain**: Both Vercel and Render support custom domains in their settings.
