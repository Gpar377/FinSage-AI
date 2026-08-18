# 🚀 FinSage AI - Quick Deployment Guide

## Overview

**Frontend**: Vercel  
**Backend**: Render.com  
**All free tier!**

---

## ⚡ 5-Minute Setup

### 1️⃣ Deploy Backend First (5 min)

```bash
# Make sure everything is committed to GitHub
git push origin main

# Go to: https://render.com/dashboard
# Click "New +" → "Web Service"
# Connect your GitHub repo
# Render will auto-deploy using render.yaml
```

✅ You'll get a URL like: `https://finsage-api-production.onrender.com`

### 2️⃣ Deploy Frontend (5 min)

```bash
# Go to: https://vercel.com/new
# Connect GitHub repo
# In Environment Variables, add:
#   VITE_API_URL = https://finsage-api-production.onrender.com
# Click Deploy
```

✅ You'll get a URL like: `https://finsage-ai.vercel.app`

---

## 📋 What's Already Configured

### Frontend Changes ✅
- ✅ Environment variable support (`.env.example` created)
- ✅ API URL is configurable (not hardcoded)
- ✅ All 6 pages updated to use dynamic API URL
- ✅ `vercel.json` deployment config ready
- ✅ Build verified locally (passes all checks)

### Backend Changes ✅
- ✅ CORS properly configured for production
- ✅ Environment variable support (`.env.example` created)
- ✅ `render.yaml` deployment config ready
- ✅ JWT and security settings included

---

## 🎯 Deployment Checklist

### Before Deploying

- [ ] All changes committed to GitHub
- [ ] Backend code is at `./backend/main.py`
- [ ] Frontend code is at `./frontend/client/`
- [ ] `render.yaml` in repo root
- [ ] `vercel.json` in repo root
- [ ] `.env.example` files created

### During Deployment

**Render Backend:**
- [ ] Service created on Render
- [ ] Build completed successfully
- [ ] Check logs for any errors
- [ ] Test `/docs` endpoint returns Swagger UI

**Vercel Frontend:**
- [ ] Project created on Vercel
- [ ] Environment variables set
- [ ] Build completed successfully
- [ ] Frontend loads in browser

### After Deployment

- [ ] Visit frontend URL
- [ ] Try TaxWizard (calls backend)
- [ ] Try FIRE Path Planner (calls backend)
- [ ] Check browser console for errors
- [ ] Verify no CORS errors

---

## 🔗 API Integration

All 6 pages automatically use the right API URL:

| Page | API Endpoint |
|------|-------------|
| TaxWizard | `/api/tax/calculate` |
| FIRE Path Planner | `/api/fire/plan` |
| MF Portfolio X-Ray | `/api/portfolio/sample` |
| Money Health Score | `/api/health-score/calculate` |
| Couples Money Planner | `/api/couples/optimize` |
| Life Event Advisor | `/api/life-event/advice` |

**How it works:**
```
Frontend reads: VITE_API_URL from environment
                    ↓
All API calls use: ${VITE_API_URL}/api/endpoint
                    ↓
Vercel environment: VITE_API_URL = https://finsage-api-production.onrender.com
```

---

## 🚨 Common Issues & Fixes

### "Cannot connect to API"
- ✅ Check `VITE_API_URL` is set in Vercel
- ✅ Check Render backend is "Live"
- ✅ Verify Render backend URL is correct

### "CORS error in console"
- ✅ Render config has FRONTEND_URL set
- ✅ FRONTEND_URL should be your Vercel URL
- ✅ Restart Render service after changing env var

### "Build failed on Vercel"
- ✅ Check TypeScript check: `npm run check` in frontend/
- ✅ All imports use `@/` alias
- ✅ Check error in Vercel logs

### "Build failed on Render"
- ✅ Check `requirements.txt` is in `backend/` folder
- ✅ Check Python version compatibility
- ✅ View Render logs for error details

---

## 📱 Local Development

While testing locally before deployment:

```bash
# Terminal 1: Start backend
cd backend
pip install -r requirements.txt
uvicorn main:app --reload

# Terminal 2: Start frontend
cd frontend
npm install
VITE_API_URL=http://localhost:8000 npm run dev
```

Frontend: http://localhost:5173  
Backend: http://localhost:8000

---

## 📊 Architecture

```
┌─────────────────────────────────────────────────────┐
│           User's Browser                            │
│  https://finsage-ai.vercel.app                      │
│  (Vercel Hosting)                                   │
└──────────────────┬──────────────────────────────────┘
                   │
                   │ HTTP API Calls
                   │ VITE_API_URL = https://...onrender.com
                   ↓
┌─────────────────────────────────────────────────────┐
│     Backend: FastAPI + Python Engines               │
│  https://finsage-api-production.onrender.com        │
│  (Render Hosting)                                   │
│                                                     │
│  • Tax Calculation Engine                           │
│  • FIRE Planning Engine                             │
│  • Portfolio Analysis Engine                        │
│  • Health Score Engine                              │
└─────────────────────────────────────────────────────┘
```

---

## 🎓 What We Configured

### New Files Created
1. **vercel.json** - Vercel build & deployment config
2. **render.yaml** - Render automated deployment
3. **DEPLOYMENT.md** - Detailed step-by-step guide
4. **RENDER_DEPLOYMENT.md** - Render-specific guide
5. **frontend/.env.example** - Frontend env template
6. **backend/.env.example** - Backend env template
7. **.env.production** - Production env config

### Code Changes
1. **frontend/client/src/config/api.ts** - Centralized API config
2. **All 6 page files** - Updated to use dynamic API URL
3. **backend/core/config.py** - Better CORS handling
4. **backend/main.py** - Updated CORS configuration

### Zero Breaking Changes
- ✅ Local development still works with `localhost:8000`
- ✅ All tests still pass
- ✅ No dependency changes
- ✅ Fully backwards compatible

---

## 🔐 Security Notes

- [ ] Change `JWT_SECRET` on Render (don't use demo key in prod)
- [ ] Use strong random secret: `openssl rand -hex 32`
- [ ] Never commit `.env` files (only `.env.example`)
- [ ] HTTPS only in production (both Vercel and Render)
- [ ] Rate limiting is enabled on both frontend & backend

---

## 📚 Next Steps

1. **Review changes** in git diff
2. **Commit and push** to GitHub
3. **Deploy backend** on Render (5 min)
4. **Deploy frontend** on Vercel (5 min)
5. **Test thoroughly** from production URLs
6. **Monitor logs** for issues

---

## 🆘 Need Help?

Check these resources:
- **Vercel Errors**: View logs at Dashboard → Deployments
- **Render Errors**: View logs at Service → Logs
- **CORS Issues**: Check browser console (F12 → Network)
- **API Issues**: Test manually: `curl https://backend-url/docs`

---

## ✨ You're Almost There!

Everything is set up and ready. Just:
1. Commit these changes
2. Push to GitHub
3. Click deploy on Render & Vercel
4. Done! 🎉

**Backend + Frontend = Fully Deployed FinSage AI**
