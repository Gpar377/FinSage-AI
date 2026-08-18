# FinSage AI Backend - Render Deployment Guide

## 🚀 Why Render Instead of Vercel?

For Python backends with financial calculations:
- **Persistent servers** (no cold starts)
- **No request timeouts** (perfect for calculations)
- **Free tier** with 750 hours/month
- **Native Python/FastAPI support**
- **Simple one-click deployment**

---

## Step 1: Prepare Your Repository

Ensure your GitHub repo has the backend at the root level:

```
finsage-ai/
├── backend/
│   ├── main.py
│   ├── requirements.txt
│   ├── routers/
│   ├── engines/
│   └── ...
├── frontend/
│   ├── client/
│   └── ...
└── render.yaml  (deployment config)
```

---

## Step 2: Deploy on Render

### Option A: Using `render.yaml` (Recommended)

1. Push all code to GitHub
2. Go to https://render.com/dashboard
3. Click **"New +"** → **"Web Service"**
4. Select your GitHub repository
5. Select the branch (usually `main`)
6. Click **"Connect"**

Render will automatically:
- Read `render.yaml` configuration
- Install Python dependencies
- Start the FastAPI server

### Option B: Manual Configuration

If `render.yaml` doesn't work:

1. Go to https://render.com/dashboard
2. Click **"New +"** → **"Web Service"**
3. Connect GitHub repository

**Configure as follows:**

| Setting | Value |
|---------|-------|
| **Name** | `finsage-api` |
| **Environment** | `Python 3` |
| **Build Command** | `pip install -r backend/requirements.txt` |
| **Start Command** | `uvicorn backend.main:app --host 0.0.0.0 --port $PORT` |
| **Region** | `Oregon` (or closest to you) |
| **Plan** | `Free` |

---

## Step 3: Set Environment Variables

In Render Dashboard → **Environment**:

```
ENVIRONMENT = production
DEBUG = false
FRONTEND_URL = https://your-frontend.vercel.app
JWT_SECRET = (generate a strong random key)
```

### Generate JWT_SECRET

```bash
# On Mac/Linux
openssl rand -hex 32

# On Windows (PowerShell)
[BitConverter]::ToString([byte[]](1..32|%{Get-Random -Max 256})) -replace ' ',''
```

---

## Step 4: Connect Frontend to Backend

1. Copy your Render backend URL (looks like: `https://finsage-api-production.onrender.com`)

2. Update Vercel environment variable:
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Set `VITE_API_URL = https://finsage-api-production.onrender.com`
   - Trigger redeploy

3. Update Render FRONTEND_URL:
   - In Render Dashboard → Environment Variables
   - Set `FRONTEND_URL = https://your-frontend.vercel.app`
   - Redeploy

---

## Step 5: Test the Connection

### Test Backend Health
```bash
curl https://finsage-api-production.onrender.com/docs
```

Should return Swagger UI documentation.

### Test API Endpoint
```bash
curl https://finsage-api-production.onrender.com/api/tax/calculate \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"gross_salary": 1800000, "hra_received": 360000}'
```

### Test from Frontend
1. Go to your Vercel frontend: `https://your-app.vercel.app`
2. Try using TaxWizard or other modules
3. Check browser console for any errors

---

## 🔄 Deployment Flow

```
1. Push code to GitHub
   ↓
2. Render automatically detects changes
   ↓
3. Render builds and deploys
   ↓
4. Your API is live at: https://finsage-api-production.onrender.com
   ↓
5. Frontend at Vercel calls this URL
```

---

## ✅ Verification Checklist

- [ ] Backend code pushed to GitHub
- [ ] `render.yaml` exists in repo root
- [ ] Render service created and deployed
- [ ] Backend URL is live (test `/docs`)
- [ ] Environment variables set on Render
- [ ] `VITE_API_URL` set on Vercel
- [ ] Frontend can call backend APIs
- [ ] No CORS errors in browser console

---

## 🐛 Troubleshooting

### Build Fails

**Error: "No such file or directory: 'backend/main.py'"**
- Ensure backend folder is in repo root
- Check `render.yaml` build command uses correct path

**Error: "pip install failed"**
- Ensure `requirements.txt` is in `backend/` folder
- Check Python version compatibility

### Backend Deployed but Not Responding

**Error: "Cannot reach backend"**
- Verify Render service is showing "Live"
- Check if service has crashed (view logs)
- Ensure `FRONTEND_URL` is set on Render

**Error: "CORS error"**
- Backend's CORS in `main.py` needs to allow Vercel domain
- Update `FRONTEND_URL` env var on Render
- Restart service

### Cold Start / Slow Response

This shouldn't happen on Render's free tier for persistent services, but if it does:
- Render is spinning down the free tier server after 15 min inactivity
- Consider upgrading to paid plan for continuous availability
- Or keep pinging the server to keep it alive

---

## 📊 Monitoring

### View Logs
1. Go to Render Dashboard → Your Service
2. Click **"Logs"** tab
3. Tail logs to see real-time requests

### Health Check
Render automatically health-checks your service. If it fails:
- Check service logs for errors
- Verify environment variables are set
- Make sure `uvicorn` is starting correctly

---

## 🚀 Next: Frontend Deployment

Once backend is live:

1. Note the backend URL
2. Go to Vercel → Environment Variables
3. Set `VITE_API_URL = [your-render-url]`
4. Redeploy frontend
5. Test all features

---

## 📚 Useful Links

- **Render Docs**: https://render.com/docs
- **FastAPI Docs**: https://fastapi.tiangolo.com
- **Uvicorn Docs**: https://www.uvicorn.org
- **Render Pricing**: https://render.com/pricing

---

## 💡 Pro Tips

1. **Free tier sleep**: Render spins down free tier services after 15 min inactivity. For production, upgrade to paid.
2. **Auto-deploy**: Any push to GitHub automatically triggers Render rebuild
3. **Zero-downtime**: New builds deploy without stopping old version
4. **Logs are your friend**: Always check logs first when debugging

---

**Status**: Your backend will be live at `https://finsage-api-production.onrender.com` ✅
