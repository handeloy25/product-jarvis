# Deploying Product Jarvis to Railway

This guide will help you deploy Product Jarvis to Railway via GitHub, making it accessible online.

## Prerequisites

1. **GitHub Account:** https://github.com
2. **Railway Account:** https://railway.app (sign up with GitHub)
3. **Anthropic API Key:** https://console.anthropic.com/settings/keys

---

## Step 1: Push to GitHub

### 1a. Create a GitHub Repository

1. Go to https://github.com/new
2. Create a new repository (e.g., `product-jarvis`)
3. Choose **Private** (recommended for business applications)
4. **Do NOT** initialize with README, .gitignore, or license (we already have these)
5. Click **Create repository**

### 1b. Push Your Code

Copy the commands from GitHub (it will show you something like this):

```bash
git remote add origin https://github.com/YOUR-USERNAME/product-jarvis.git
git add .
git commit -m "Initial commit: Product Jarvis setup"
git branch -M main
git push -u origin main
```

Run these commands in your project directory.

---

## Step 2: Deploy to Railway

### Option A: Deploy as Monorepo (Recommended)

Railway can deploy both frontend and backend from the same repository.

1. **Go to Railway Dashboard:** https://railway.app/dashboard
2. Click **New Project**
3. Select **Deploy from GitHub repo**
4. Authorize Railway to access your GitHub account
5. Select your `product-jarvis` repository

### 2a. Deploy Backend Service

1. Railway will detect the project automatically
2. Click **Add Service** → **GitHub Repo** → select `product-jarvis`
3. Name it: `product-jarvis-backend`
4. **Root Directory:** `/backend`
5. **Build Command:** `pip install -r requirements.txt`
6. **Start Command:** `uvicorn main:app --host 0.0.0.0 --port $PORT`

### 2b. Set Backend Environment Variables

In the backend service settings, add these variables:

```
ANTHROPIC_API_KEY=your-anthropic-api-key
TASKFLOW_WEBHOOK_URL=https://your-taskflow-url.com/webhooks/pj
TASKFLOW_WEBHOOK_SECRET=your-webhook-secret
TASKFLOW_WEBHOOKS_ENABLED=true
TASKFLOW_API_KEY=your-api-key
AUTH_MODE=dev
FRONTEND_URL=https://your-frontend-url.railway.app
PORT=8000
```

**Note:** Railway provides a `PORT` variable automatically. Your backend URL will be something like:
`https://product-jarvis-backend-production-xxxx.up.railway.app`

### 2c. Deploy Frontend Service

1. Click **Add Service** → **GitHub Repo** → select `product-jarvis` again
2. Name it: `product-jarvis-frontend`
3. **Root Directory:** `/frontend`
4. **Build Command:** `npm install && npm run build`
5. **Start Command:** `npx vite preview --host 0.0.0.0 --port $PORT`

### 2d. Set Frontend Environment Variables

In the frontend service settings, add:

```
VITE_API_URL=https://product-jarvis-backend-production-xxxx.up.railway.app
PORT=3000
```

Replace the URL with your actual backend URL from step 2b.

---

## Step 3: Configure Database Persistence

Railway provides ephemeral storage by default. For persistent SQLite:

### Option 1: Add Volume (Recommended)

1. In backend service → **Settings** → **Volumes**
2. Click **Add Volume**
3. Mount path: `/app/data`
4. This will persist your SQLite database across deployments

### Option 2: Use PostgreSQL (Production)

For production, consider switching to PostgreSQL:

1. In Railway dashboard → **New** → **Database** → **PostgreSQL**
2. Railway will auto-generate `DATABASE_URL`
3. Update `backend/database.py` to use PostgreSQL instead of SQLite

---

## Step 4: Verify Deployment

1. **Check Backend Health:**
   - Visit: `https://your-backend-url.railway.app/health`
   - Should return: `{"success": true, "data": {"status": "healthy"}}`

2. **Check API Docs:**
   - Visit: `https://your-backend-url.railway.app/docs`
   - You should see the interactive API documentation

3. **Open Frontend:**
   - Visit: `https://your-frontend-url.railway.app`
   - Product Jarvis dashboard should load

---

## Step 5: Set Up Custom Domain (Optional)

### Backend Domain

1. In backend service → **Settings** → **Domains**
2. Click **Generate Domain** or **Custom Domain**
3. Example: `api.productjarvis.com`

### Frontend Domain

1. In frontend service → **Settings** → **Domains**
2. Click **Generate Domain** or **Custom Domain**
3. Example: `productjarvis.com`

---

## Deployment Architecture

```
GitHub Repository (product-jarvis)
    │
    ├── Railway Backend Service
    │   ├── Build: pip install -r requirements.txt
    │   ├── Start: uvicorn main:app --host 0.0.0.0 --port $PORT
    │   ├── URL: https://backend.railway.app
    │   └── Environment: ANTHROPIC_API_KEY, TASKFLOW_*, etc.
    │
    └── Railway Frontend Service
        ├── Build: npm install && npm run build
        ├── Start: npx vite preview --host 0.0.0.0 --port $PORT
        ├── URL: https://frontend.railway.app
        └── Environment: VITE_API_URL
```

---

## Environment Variables Summary

### Backend (.env)

```bash
ANTHROPIC_API_KEY=sk-ant-...
TASKFLOW_WEBHOOK_URL=https://taskflow.railway.app/webhooks/pj
TASKFLOW_WEBHOOK_SECRET=your-secret-here
TASKFLOW_WEBHOOKS_ENABLED=true
TASKFLOW_API_KEY=your-api-key-here
AUTH_MODE=dev
FRONTEND_URL=https://your-frontend.railway.app
PORT=8000
```

### Frontend (.env)

```bash
VITE_API_URL=https://your-backend.railway.app
PORT=3000
```

---

## Continuous Deployment

Railway automatically redeploys when you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push origin main
```

Railway will:
1. Detect the push
2. Rebuild both services
3. Deploy the new version
4. Keep the old version running until the new one is healthy

---

## Troubleshooting

### Backend Won't Start

**Error:** "Port already in use"
- **Solution:** Make sure the start command uses `--port $PORT`, not a hardcoded port

**Error:** "Module not found"
- **Solution:** Check that `requirements.txt` is in the `/backend` directory
- Verify build command: `pip install -r requirements.txt`

### Frontend Can't Connect to Backend

**Error:** API calls fail with CORS error
- **Solution:** Update `FRONTEND_URL` in backend environment variables
- Check that `VITE_API_URL` in frontend points to the correct backend URL

### Database Data Lost

**Error:** Data disappears after redeployment
- **Solution:** Add a volume (see Step 3) or switch to PostgreSQL

### Build Timeout

**Error:** Build takes too long and fails
- **Solution:** Railway has a 10-minute build timeout. If exceeded:
  - Optimize dependencies
  - Remove unnecessary build steps
  - Contact Railway support for extended timeout

---

## Cost Estimates

Railway pricing (as of 2026):

- **Hobby Plan:** $5/month per user
  - 500 hours of execution time
  - Shared resources
  - Good for development/testing

- **Pro Plan:** $20/month
  - Unlimited execution time
  - Better resources
  - Custom domains
  - Recommended for production

**Estimated Monthly Cost:**
- Backend service: ~$8-12
- Frontend service: ~$5-8
- PostgreSQL (optional): ~$5-10
- **Total:** ~$18-30/month

---

## Security Considerations

1. **API Keys:** Never commit `.env` files to GitHub
2. **Database:** Use Railway volumes or PostgreSQL for persistence
3. **Authentication:** Consider enabling `AUTH_MODE=supabase` for production
4. **HTTPS:** Railway provides free SSL certificates automatically
5. **Secrets:** Use Railway's environment variables, not hardcoded values

---

## Monitoring and Logs

### View Logs

1. Go to Railway dashboard
2. Click on a service (backend or frontend)
3. Click **Deployments** → Select active deployment
4. View **Build Logs** or **Deploy Logs**

### Monitor Performance

Railway provides:
- CPU usage
- Memory usage
- Network traffic
- Request count

Access these in the **Metrics** tab of each service.

---

## Next Steps After Deployment

1. **Test the Integration:**
   - Create a product in Product Jarvis
   - Change status to "In Development"
   - Verify webhook is sent to Task Flow

2. **Set Up Backups:**
   - Export database regularly
   - Use Railway's backup features
   - Consider offsite backups for critical data

3. **Monitor Usage:**
   - Check Railway usage dashboard
   - Set up billing alerts
   - Monitor API costs (Anthropic)

4. **Add Team Members:**
   - Invite team to Railway project
   - Share environment variable documentation
   - Set up role-based access

---

## Support

- **Railway Docs:** https://docs.railway.app
- **Railway Discord:** https://discord.gg/railway
- **GitHub Issues:** Create issues in your repository
- **Product Jarvis Docs:** See README.md

---

*Last Updated: February 2026*
