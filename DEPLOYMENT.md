# FinSage AI - Deployment Guide

## 🚀 Vercel Deployment (Frontend)

### Prerequisites
- Vercel account (https://vercel.com)
- GitHub repository with your code
- Render backend URL (from your backend deployment)

### Step 1: Connect GitHub to Vercel

1. Go to https://vercel.com/new
2. Select "Import Git Repository"
3. Connect your GitHub account and select the `finsage-ai` repository
4. Click "Import"

### Step 2: Configure Environment Variables

In Vercel Dashboard, go to your project **Settings > Environment Variables** and add:

```
VITE_API_URL = https://your-render-backend-url.onrender.com
```

Replace `your-render-backend-url` with your actual Render backend URL (without trailing slash).

**Example:**
```
VITE_API_URL = https://finsage-api-production.onrender.com
```

### Step 3: Configure Build Settings

When Vercel asks for build settings:
- **Build Command**: `cd frontend && npm run build`
- **Output Directory**: `frontend/dist/public`
- **Install Command**: `npm install` (default)

### Step 4: Deploy

1. Click "Deploy"
2. Wait for build to complete (~2-3 minutes)
3. Your frontend will be live at `https://your-project-name.vercel.app`

---

## 🔧 Render Backend Deployment

### Step 1: Push Backend Code

Ensure your backend is pushed to GitHub with all code and dependencies.

### Step 2: Create New Service on Render

1. Go to https://render.com/dashboard
2. Click "New+" → "Web Service"
3. Connect your GitHub repository
4. Select the branch containing your backend code

### Step 3: Configure Service

- **Name**: `finsage-api` (or your preferred name)
- **Environment**: `Python` (or your backend language)
- **Build Command**: `pip install -r requirements.txt` (or equivalent)
- **Start Command**: `gunicorn app:app` (or your app entry point)

### Step 4: Set Environment Variables

In Render Dashboard, go to **Environment**:
- Add any required env vars for your backend
- For database URLs, API keys, etc.

### Step 5: Deploy

1. Click "Create Web Service"
2. Build and deployment will start automatically
3. Copy the service URL (looks like `https://finsage-api-production.onrender.com`)

---

## 🔗 Connect Frontend to Backend

After both are deployed:

### Update Vercel Environment Variable

1. Go to Vercel dashboard → Your project → Settings → Environment Variables
2. Update `VITE_API_URL` with your Render backend URL
3. Trigger a redeployment (or manually redeploy from git)

### Example Setup

```
Frontend: https://finsage-ai.vercel.app
Backend:  https://finsage-api-production.onrender.com

VITE_API_URL in Vercel: https://finsage-api-production.onrender.com
```

---

## 🧪 Local Development

### Setup

1. **Install dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Create `.env.local`** (copy from `.env.example`)
   ```bash
   VITE_API_URL=http://localhost:8000
   ```

3. **Start dev server**
   ```bash
   npm run dev
   ```

   Frontend will run at `http://localhost:5173`

4. **Ensure backend is running** at `http://localhost:8000`

### Build Locally
```bash
npm run build
npm run preview
```

---

## ✅ Deployment Checklist

- [ ] GitHub repository is up to date
- [ ] All TypeScript errors fixed (`npm run check`)
- [ ] Backend is deployed on Render
- [ ] Render backend URL is noted
- [ ] Vercel project is created
- [ ] `VITE_API_URL` env var set in Vercel
- [ ] Build passes in Vercel (`npm run build` works locally)
- [ ] Frontend is deployed on Vercel
- [ ] Test API calls from deployed frontend to backend
- [ ] CORS is configured on backend (if needed)

---

## 🐛 Troubleshooting

### Build Fails in Vercel

**Error: "Cannot find module"**
- Ensure all imports use `@/` alias correctly
- Check that `@` points to `client/src` in `tsconfig.json`
- Run `npm install` locally and commit lock file

**Error: "TypeScript compilation failed"**
- Run `npm run check` locally
- Fix any type errors
- Verify Node.js version compatibility

### API Calls Fail in Production

**Error: "CORS error" or "Failed to fetch"**
- Ensure `VITE_API_URL` is set correctly in Vercel
- Check backend CORS configuration
- Backend must allow requests from your Vercel domain

**Error: "404 Not Found"**
- Verify API endpoint paths match between frontend and backend
- Check backend routes are deployed correctly

### Vercel Build Takes Too Long

- Clear Vercel build cache and rebuild
- Optimize dependencies in `package.json`
- Consider using pnpm instead of npm (add `.npmrc` with `use-pnpm=true`)

---

## 📚 Useful Links

- **Vercel Docs**: https://vercel.com/docs
- **Render Docs**: https://render.com/docs
- **Environment Variables**: https://vitejs.dev/guide/env-and-mode.html
- **GitHub Actions (CI/CD)**: https://docs.github.com/en/actions

---

## 🎯 Next Steps

1. Deploy backend first
2. Deploy frontend
3. Test all API endpoints from prod
4. Set up monitoring/logging
5. Configure custom domain (optional)

**Questions?** Check Vercel and Render documentation, or review the error logs in their dashboards.
