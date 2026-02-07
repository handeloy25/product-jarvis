# Quick Start: Deploy to Railway

Your Product Jarvis repository is ready to deploy! Follow these simple steps.

## Step 1: Push to GitHub

### Create GitHub Repository

1. Go to: https://github.com/new
2. Repository name: `product-jarvis` (or your preferred name)
3. **Choose Private** (recommended for business apps)
4. **DO NOT** check any boxes (README, .gitignore, license)
5. Click **Create repository**

### Push Your Code

GitHub will show you commands. Copy and run them:

```bash
# Add GitHub as remote origin
git remote add origin https://github.com/YOUR-USERNAME/product-jarvis.git

# Push to GitHub
git push -u origin master
```

**Replace `YOUR-USERNAME` with your actual GitHub username!**

---

## Step 2: Deploy Backend to Railway

### Create Railway Project

1. Go to: https://railway.app/dashboard
2. Click **New Project**
3. Click **Deploy from GitHub repo**
4. If asked, authorize Railway to access GitHub
5. Select your `product-jarvis` repository

### Configure Backend Service

Railway will create one service. Configure it:

1. **Service Name:** `product-jarvis-backend`
2. Click **Settings** → **Service Settings**
3. **Root Directory:** `/backend`
4. **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

### Add Backend Environment Variables

Click **Variables** tab and add:

```
ANTHROPIC_API_KEY=your-actual-api-key-here
PORT=8000
```

**Get your Anthropic API key from:** https://console.anthropic.com/settings/keys

**Optional Variables (for Task Flow integration):**
```
TASKFLOW_WEBHOOK_URL=https://your-taskflow-url.com/webhooks/pj
TASKFLOW_WEBHOOK_SECRET=taskflow-pj-secret-2026
TASKFLOW_WEBHOOKS_ENABLED=true
TASKFLOW_API_KEY=pj-taskflow-dev-key-2026
FRONTEND_URL=https://your-frontend-url.railway.app
```

### Get Backend URL

After deployment completes:
1. Go to **Settings** → **Domains**
2. Click **Generate Domain**
3. Copy the URL (e.g., `https://backend-production-xxxx.up.railway.app`)
4. **Save this URL** - you'll need it for the frontend!

---

## Step 3: Deploy Frontend to Railway

### Add Frontend Service

1. In your Railway project dashboard
2. Click **New** → **GitHub Repo**
3. Select `product-jarvis` again
4. **Service Name:** `product-jarvis-frontend`

### Configure Frontend Service

1. Click **Settings** → **Service Settings**
2. **Root Directory:** `/frontend`
3. **Build Command:** `npm install && npm run build`
4. **Start Command:** `npx vite preview --host 0.0.0.0 --port $PORT`

### Add Frontend Environment Variables

Click **Variables** tab and add:

```
VITE_API_URL=https://your-backend-url.railway.app
PORT=3000
```

**Replace `your-backend-url.railway.app` with the actual backend URL from Step 2!**

### Get Frontend URL

After deployment completes:
1. Go to **Settings** → **Domains**
2. Click **Generate Domain**
3. Copy the URL (e.g., `https://frontend-production-xxxx.up.railway.app`)
4. **This is your Product Jarvis URL!**

---

## Step 4: Update Backend FRONTEND_URL

Go back to your backend service and update the environment variable:

```
FRONTEND_URL=https://your-actual-frontend-url.railway.app
```

Click **Redeploy** after updating.

---

## Step 5: Test Your Deployment

1. **Visit your frontend URL:** `https://your-frontend-url.railway.app`
2. You should see the Product Jarvis dashboard!
3. **Test the API:** Visit `https://your-backend-url.railway.app/docs`
4. You should see the interactive API documentation

---

## Step 6: Add Database Persistence (Important!)

Railway uses ephemeral storage by default. To persist your SQLite database:

### Option 1: Add a Volume (Recommended for SQLite)

1. Go to backend service → **Settings** → **Volumes**
2. Click **New Volume**
3. **Mount Path:** `/app/data`
4. This will persist your database across deployments

### Option 2: Use PostgreSQL (Recommended for Production)

1. In Railway dashboard → **New** → **Database** → **PostgreSQL**
2. Railway automatically adds `DATABASE_URL` to your backend
3. Update `backend/database.py` to use PostgreSQL instead of SQLite

---

## Summary

You should now have:

- ✅ Code pushed to GitHub
- ✅ Backend deployed to Railway
- ✅ Frontend deployed to Railway
- ✅ Both services talking to each other
- ✅ Database persistence configured
- ✅ Application accessible online!

## Your URLs

**Frontend (Product Jarvis):**
`https://your-frontend-url.railway.app`

**Backend API:**
`https://your-backend-url.railway.app`

**API Docs:**
`https://your-backend-url.railway.app/docs`

---

## Next Steps

1. **Share the frontend URL** with your team
2. **Set up custom domain** (optional) - see RAILWAY_DEPLOYMENT.md
3. **Enable authentication** for production use
4. **Monitor usage** in Railway dashboard
5. **Set up backups** for your database

---

## Need Help?

- Full deployment guide: See `RAILWAY_DEPLOYMENT.md`
- Local setup: See `LOCAL_SETUP_GUIDE.md`
- API reference: See `docs/API.md`
- Railway docs: https://docs.railway.app

---

## Cost Estimate

- Backend service: ~$8-12/month
- Frontend service: ~$5-8/month
- **Total: ~$13-20/month**

Railway Hobby Plan: $5/month per user (500 hours)
Railway Pro Plan: $20/month (unlimited hours)

---

**You're all set! 🚀**
