# Product Jarvis Deployment Guide

This guide covers deploying Product Jarvis with authentication, database, and TaskFlow integration.

**Last Updated:** 2026-02-02
**Integration Status:** Verified Working (all 5 sync tests passed)

---

## Quick Deployment Checklist

Use this checklist when deploying to production:

### Pre-Deployment
- [ ] Domain purchased (`productjarvis.io` or similar)
- [ ] Supabase project created
- [ ] Webhook secret generated: `openssl rand -base64 32`
- [ ] Webhook secret added to 1Password shared vault
- [ ] TaskFlow team notified of production URLs

### Deploy Backend
- [ ] Push code to GitHub
- [ ] Create Railway project, set root to `backend`
- [ ] Add all environment variables (see reference below)
- [ ] Verify `/docs` endpoint loads (FastAPI Swagger)
- [ ] Verify `/health` endpoint returns OK

### Deploy Frontend
- [ ] Create Vercel project, set root to `frontend`
- [ ] Set `VITE_API_URL` in Vercel project settings (NOT just .env)
- [ ] Deploy and verify frontend loads

### Configure Integration
- [ ] Update `TASKFLOW_WEBHOOK_URL` to production TF URL
- [ ] Coordinate with TaskFlow to update their `PJ_API_URL`
- [ ] Both teams use same webhook secret from 1Password

### Verify Integration
- [ ] Create product, set to "Approved" → verify TF project created
- [ ] Create ticket in TF → verify PJ task created
- [ ] Log time in TF → verify hours sync + auto-transition to "In Development"

---

## Prerequisites

- Python 3.11+
- Node.js 18+
- Supabase project (for production auth) - **see TaskFlow setup for consistency**
- PostgreSQL database (production) or SQLite (development)
- Domain name purchased (e.g., `productjarvis.io`)

---

## Environment Variables Reference

### Backend (`backend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `DATABASE_URL` | Yes | `sqlite:///./data/jarvis.db` | Database connection string |
| `AUTH_MODE` | Yes | `dev` | Auth mode: `dev` (no login) or `supabase` (real auth) |
| `SUPABASE_URL` | If auth=supabase | — | Supabase project URL |
| `SUPABASE_KEY` | If auth=supabase | — | Supabase anon/public key |
| `SUPABASE_JWT_SECRET` | If auth=supabase | — | JWT secret for token validation |
| `FRONTEND_URL` | Yes | `http://localhost:5173` | Frontend URL for redirects |
| `TASKFLOW_WEBHOOK_URL` | Yes | `http://localhost:8000/webhooks/pj` | TaskFlow webhook endpoint |
| `TASKFLOW_WEBHOOK_SECRET` | Yes | `taskflow-pj-secret-2026` | Shared secret for webhook auth |
| `TASKFLOW_WEBHOOKS_ENABLED` | Yes | `True` | Enable/disable webhooks |
| `CORS_ORIGINS` | Yes | `["http://localhost:5173"]` | Allowed CORS origins (JSON array) |
| `OPENAI_API_KEY` | Optional | — | For AI-powered valuation assistant |
| `ANTHROPIC_API_KEY` | Optional | — | For AI-powered features |

### Frontend (`frontend/.env`)

| Variable | Required | Default | Description |
|----------|----------|---------|-------------|
| `VITE_API_URL` | Yes | `http://localhost:8001` | Backend API URL |

---

## Quick Start (Development Mode)

Development mode requires no Supabase setup:

```bash
# Backend
cd backend
python -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
uvicorn main:app --reload --port 8001

# Frontend (new terminal)
cd frontend
npm install
npm run dev
```

Access at http://localhost:5173

---

## Production Deployment with Supabase

> **IMPORTANT:** For consistency with TaskFlow, follow the same Supabase setup process. Both apps can use separate Supabase instances but should follow the same patterns for easier team maintenance.

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com) and create a new project
2. Note your project URL and API keys from Settings > API
3. **Use the same approach as TaskFlow** for auth configuration

### 2. Configure Backend Environment Variables

Create `backend/.env`:

```bash
# Database (use Supabase PostgreSQL for production)
DATABASE_URL=postgresql://postgres:[password]@db.[project-ref].supabase.co:5432/postgres

# Authentication
AUTH_MODE=supabase
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_KEY=[your-anon-key]
SUPABASE_JWT_SECRET=[your-jwt-secret]

# Frontend URL
FRONTEND_URL=https://productjarvis.io

# TaskFlow Integration
TASKFLOW_WEBHOOK_URL=https://api.taskflow.io/webhooks/pj
TASKFLOW_WEBHOOK_SECRET=[generate-a-strong-secret]
TASKFLOW_WEBHOOKS_ENABLED=True

# CORS
CORS_ORIGINS=["https://productjarvis.io"]

# AI Features (optional)
OPENAI_API_KEY=[your-key]
ANTHROPIC_API_KEY=[your-key]
```

### 3. Get Supabase JWT Secret

1. Go to Supabase Dashboard > Settings > API
2. Copy the "JWT Secret" from the JWT Settings section
3. This is required for validating Supabase access tokens

### 4. Database Migration (SQLite to PostgreSQL)

If migrating from local SQLite:

```bash
# Export data from SQLite
sqlite3 data/jarvis.db .dump > backup.sql

# Create tables in Supabase using the schema from database.py
# Then import data with appropriate modifications for PostgreSQL syntax
```

Alternatively, start fresh and seed data via the PJ Admin page.

### 5. Configure Supabase Authentication (TaskFlow Pattern)

Product Jarvis uses the same admin-invite-only auth pattern as TaskFlow:

#### Step 5.1: Configure Supabase Auth Settings

1. Go to Supabase Dashboard → **Authentication** → **Settings**
2. **Disable** "Enable email confirmations" (we use admin-invite flow instead)
3. Set **Site URL** to your frontend URL (e.g., `https://productjarvis.io`)
4. Add **Redirect URLs**: `https://productjarvis.io/auth/callback`

#### Step 5.2: Backend Environment Variables

```bash
AUTH_MODE=supabase
SUPABASE_URL=https://[project-ref].supabase.co
SUPABASE_KEY=eyJhbG...  # anon/public key from Settings → API
SUPABASE_JWT_SECRET=your-jwt-secret  # from Settings → API → JWT Settings
```

#### Step 5.3: Auth Flow (Admin-Invite-Only)

1. **Admin creates user** in Product Jarvis (employee/position record)
2. **Admin clicks "Invite"** → generates secure token, sends email with link
3. **User clicks link** → `https://productjarvis.io/accept-invite?token=xxx`
4. **User sets password** → creates Supabase Auth user account
5. **User logs in** → email/password → JWT stored in localStorage
6. **All API requests** include `Authorization: Bearer <jwt>` header

#### Step 5.4: Supabase Row Level Security (RLS)

Per TaskFlow's recommendation: **Disable RLS** since we handle authorization in the backend. This simplifies the setup.

1. Go to Supabase Dashboard → **Database** → **Tables**
2. For each table, click the table → **RLS Disabled** toggle

> **Note:** If you prefer database-level security, you can enable RLS and create policies, but this requires additional configuration.

#### Reference Files (to create)

When implementing auth, create these files following TaskFlow's pattern:
- `backend/services/auth_service.py` - SupabaseAuthService class
- `backend/routers/auth.py` - Login, invite, accept-invite endpoints
- `frontend/src/contexts/AuthContext.jsx` - Auth state management
- `frontend/src/pages/LoginPage.jsx` - Login form
- `frontend/src/pages/AcceptInvitePage.jsx` - Password setup form

---

## CRITICAL: Cross-App Configuration

Both Product Jarvis and TaskFlow must be configured to talk to each other. **Mismatched URLs are the #1 cause of integration failures.**

### Local Development Ports

| App | Backend Port | Frontend Port |
|-----|-------------|---------------|
| **Product Jarvis** | 8001 | 5173 |
| **TaskFlow** | 8000 | 5174 |

### Required Configuration in BOTH Apps

**Product Jarvis (`backend/config.py` or `.env`):**
```python
TASKFLOW_WEBHOOK_URL = "http://localhost:8000/webhooks/pj"  # TF backend port
TASKFLOW_WEBHOOK_SECRET = "your-shared-secret"
```

**TaskFlow (`backend/config.py` or `.env`):**
```python
PJ_API_URL = "http://localhost:8001/api"  # PJ backend port (NOT 8000!)
PJ_WEBHOOK_SECRET = "your-shared-secret"  # Must match PJ's secret
```

> **Common Mistake:** TaskFlow defaulting to port 8000 for `PJ_API_URL`. Product Jarvis runs on **8001**.

### Production URLs

| App | Frontend | API |
|-----|----------|-----|
| Product Jarvis | `https://productjarvis.io` | `https://api.productjarvis.io` |
| TaskFlow | `https://taskflow.io` | `https://api.taskflow.io` |

---

## TaskFlow Integration Configuration

### Webhook URLs

| Environment | PJ → TF Webhook URL |
|-------------|---------------------|
| Local Development | `http://localhost:8000/webhooks/pj` |
| Production | `https://api.taskflow.io/webhooks/pj` (or your domain) |

### TF → PJ API URLs

| Environment | TF calls PJ at |
|-------------|----------------|
| Local Development | `http://localhost:8001/api` |
| Production | `https://api.productjarvis.io/api` (or your domain) |

### Webhook Events (PJ → TF)

| Event | Trigger | Endpoint |
|-------|---------|----------|
| `product.approved` | Product status → "Approved" | `POST /webhooks/pj/product` |
| `service.created` | New service created | `POST /webhooks/pj/service` |
| `department.created` | Department added | `POST /webhooks/pj/department` |
| `department.updated` | Department modified | `POST /webhooks/pj/department` |
| `position.created` | Position added | `POST /webhooks/pj/position` |
| `position.updated` | Position modified | `POST /webhooks/pj/position` |

### API Endpoints (TF → PJ)

| Action | Endpoint | Method |
|--------|----------|--------|
| Create product task | `/api/products/{id}/tasks` | POST |
| Update product task | `/api/tasks/{id}` | PATCH |
| Create service task | `/api/services/{id}/tasks` | POST |
| Update service task | `/api/service-tasks/{id}` | PATCH |

### Auto-Transition Logic

When TaskFlow logs the first `actual_hours > 0` on any task for a product in "Approved" status, Product Jarvis automatically transitions that product to "In Development".

---

## Frontend Build

```bash
cd frontend
npm run build
```

Deploy the `dist/` folder to your hosting provider.

Configure environment variable:
```
VITE_API_URL=https://api.productjarvis.io
```

---

## Hosting Recommendations

> **Note:** Use the same hosting stack as TaskFlow for consistency. The team deploying both apps will benefit from identical infrastructure patterns.

### Recommended Stack (Matching TaskFlow)

| Component | Recommended | Why | Alternatives |
|-----------|-------------|-----|--------------|
| **Backend** | **Railway** | Easy Python deployment, auto-scaling, $5/mo hobby | Render, Fly.io, DigitalOcean App Platform, AWS |
| **Frontend** | **Vercel** | Instant deploys from GitHub, free tier, great for React | Netlify, Cloudflare Pages |
| **Database** | **Supabase PostgreSQL** | Consistent with auth provider | Railway Postgres, Neon, PlanetScale, AWS RDS |
| **Email** | **Resend** | Simple API, good deliverability, free tier | SendGrid, Postmark, Mailgun |

### Step-by-Step Deployment

#### Option A: Railway (Backend) + Vercel (Frontend) - RECOMMENDED

**Backend on Railway:**

1. Push code to GitHub repository
2. Create Railway account at [railway.app](https://railway.app)
3. Click "New Project" → "Deploy from GitHub repo"
4. Select the repository, set root directory to `backend`
5. Add environment variables (see section above)
6. Railway auto-detects Python and deploys
7. Note your Railway URL (e.g., `product-jarvis-api.up.railway.app`)

**Frontend on Vercel:**

1. Create Vercel account at [vercel.com](https://vercel.com)
2. Click "Import Project" → select GitHub repo
3. Set root directory to `frontend`
4. Add environment variable:
   ```
   VITE_API_URL=https://product-jarvis-api.up.railway.app
   ```
5. Deploy!

#### Option B: Render (All-in-One)

1. Create Render account at [render.com](https://render.com)
2. Create Web Service for backend:
   - Root: `backend`
   - Build: `pip install -r requirements.txt`
   - Start: `uvicorn main:app --host 0.0.0.0 --port $PORT`
3. Create Static Site for frontend:
   - Root: `frontend`
   - Build: `npm install && npm run build`
   - Publish: `dist`
4. Set environment variables in dashboard

#### Option C: DigitalOcean Droplet (Self-Managed)

1. Create Ubuntu 22.04 droplet ($6/mo)
2. SSH in and install dependencies:
   ```bash
   apt update && apt install python3.11 nodejs npm nginx certbot
   ```
3. Clone repo, set up venv, install requirements
4. Configure nginx as reverse proxy
5. Use systemd for process management
6. Set up SSL with Let's Encrypt

#### Option D: AWS (Enterprise)

- **ECS/Fargate** for containerized deployment
- **RDS PostgreSQL** for database
- **CloudFront** for frontend CDN
- **Route 53** for DNS

---

## Domain Configuration

1. **Purchase domains:**
   - `productjarvis.io` (or your preferred domain)
   - Consider `taskflow.io` to match (if not already purchased)

2. **DNS Setup:**
   - `productjarvis.io` → Frontend (Vercel/Netlify)
   - `api.productjarvis.io` → Backend (Railway/Render)

3. **Update environment variables** with production URLs

4. **Update TaskFlow config** to point to production PJ URL

---

## Security Checklist

- [ ] `AUTH_MODE=supabase` in production (not `dev`)
- [ ] Strong `TASKFLOW_WEBHOOK_SECRET` generated (use: `openssl rand -hex 32`)
- [ ] Same secret configured in TaskFlow
- [ ] CORS restricted to production domain only
- [ ] HTTPS enabled on all endpoints
- [ ] API keys not committed to repository
- [ ] Database credentials secured
- [ ] No sensitive data in frontend bundle

---

## Staging Environment (Optional)

If you want a staging environment before production:

1. Create separate Supabase project for staging
2. Deploy to staging URLs:
   - `staging.productjarvis.io`
   - `api-staging.productjarvis.io`
3. Configure TaskFlow staging to point to PJ staging
4. Test full integration before promoting to production

---

## Post-Deployment Checklist

- [ ] Backend responds at `/docs` (FastAPI Swagger UI)
- [ ] Frontend loads dashboard
- [ ] Products can be created and viewed
- [ ] Status changes to "Approved" trigger TF webhook
- [ ] TF can create tasks via API
- [ ] TF can update task hours via API
- [ ] Auto-transition works (first hours → "In Development")
- [ ] HTTPS working on both frontend and backend
- [ ] Auth working (if enabled)

---

## Product Status Flow

```
Draft → Ideation → [LEADERSHIP REVIEW] → Approved ──webhook──► TaskFlow
                                       → Backlog (no webhook, re-reviewable)
                                       → Kill (no webhook)

Approved → (TaskFlow logs first hours) → In Development → Live → Deprecated
```

**Key Points:**
- Only "Approved" triggers webhook to TaskFlow
- "Backlog" products can be re-reviewed later
- "Kill" products are terminated (no TF project)
- First time logged in TF auto-transitions product to "In Development"

---

## Troubleshooting

### Webhook not reaching TaskFlow
- Verify `TASKFLOW_WEBHOOK_URL` is correct and accessible
- Check `TASKFLOW_WEBHOOKS_ENABLED = True`
- Review PJ backend logs for webhook delivery errors
- Test endpoint directly: `curl -X POST https://taskflow-url/webhooks/pj/product`

### Auth not working
- Verify `AUTH_MODE=supabase` (not `dev`)
- Confirm `SUPABASE_JWT_SECRET` matches Supabase dashboard
- Check CORS includes your frontend domain

### Database connection issues
- Verify `DATABASE_URL` format is correct for PostgreSQL
- Check Supabase connection pooling settings
- Ensure IP allowlist includes your server

### CORS errors
- Update `CORS_ORIGINS` to include your production domain
- Format must be JSON array: `["https://productjarvis.io"]`

---

## Rollback Procedures

### Backend Rollback (Railway)

1. Go to Railway Dashboard → Your Project → Deployments
2. Find the last working deployment
3. Click "..." → "Redeploy"
4. Verify application is responding

### Backend Rollback (Render)

1. Go to Render Dashboard → Your Service → Events
2. Find last successful deploy
3. Click "Rollback to this deploy"

### Frontend Rollback (Vercel)

1. Go to Vercel Dashboard → Your Project → Deployments
2. Find the last working deployment
3. Click "..." → "Promote to Production"

### Database Rollback

If a database migration caused issues:

```bash
# Connect to Supabase PostgreSQL
psql $DATABASE_URL

# List recent changes (if using migration tool)
# Or restore from backup:
# Supabase Dashboard → Database → Backups → Restore
```

> **Tip:** Take a database backup before any migration: Supabase Dashboard → Database → Backups → Create Backup

---

## Monitoring & Alerting

### Application Monitoring

#### Option 1: Railway/Render Built-in Logs

Both platforms provide real-time logs:
- Railway: Dashboard → Project → Logs
- Render: Dashboard → Service → Logs

#### Option 2: External Monitoring (Recommended for Production)

| Tool | Purpose | Free Tier |
|------|---------|-----------|
| **Sentry** | Error tracking | 5K errors/month |
| **Better Uptime** | Uptime monitoring | 10 monitors |
| **Logtail** | Log aggregation | 1GB/month |

**Sentry Setup:**
```bash
pip install sentry-sdk[fastapi]
```

```python
# main.py
import sentry_sdk
sentry_sdk.init(dsn="your-sentry-dsn", traces_sample_rate=0.1)
```

### Health Check Endpoints

Add health check endpoint for monitoring services:

```python
# Add to main.py or create routers/health.py
@app.get("/health")
def health_check():
    return {"status": "healthy", "timestamp": datetime.now().isoformat()}

@app.get("/health/db")
def db_health():
    try:
        with get_connection() as conn:
            conn.execute("SELECT 1")
        return {"database": "connected"}
    except Exception as e:
        return {"database": "error", "detail": str(e)}
```

### Recommended Alerts

Set up alerts for:
- [ ] Application down (uptime monitor)
- [ ] Error rate spike (Sentry)
- [ ] Database connection failures
- [ ] Webhook delivery failures (log monitoring)
- [ ] High response times (>2s)

### Webhook Monitoring

Monitor PJ → TF webhook success rate:

```python
# Add logging to webhook_service.py
logger.info(f"Webhook sent: {url} - Status: {response.status_code}")
logger.error(f"Webhook failed: {url} - Error: {error}")
```

Search logs for webhook failures:
```bash
# Railway/Render logs
grep "Webhook failed" logs.txt
```

---

## Hosting Gotchas (from TaskFlow)

Based on TaskFlow's production experience:

| Issue | Solution |
|-------|----------|
| Railway free tier sleeps after inactivity | Use paid tier ($5/mo) for reliable webhooks |
| Vercel env vars not loading | Set `VITE_API_URL` in Vercel project settings, not just `.env` |
| Railway URL changes on deploy | Set custom domain to avoid URL changes |
| CORS errors after deploy | Verify `CORS_ORIGINS` includes new domain |
| Supabase RLS blocking queries | Disable RLS or create proper policies |

---

## Support

For issues:
- Review `CLAUDE.md` for codebase conventions
- Check the `INTEGRATION-TEST-PLAN.md` for testing procedures
- Contact the development team

---

## Verified Integration Test Results (2026-02-02)

All integration tests passed on local development:

| Test | Result | Details |
|------|--------|---------|
| Product Approved → TF Project | ✓ PASS | Product 18 → Project 7 created via webhook |
| TF Ticket → PJ Task | ✓ PASS | Ticket 43 → Task 40 created via API |
| Time Sync (actual_hours) | ✓ PASS | 2.0 hours synced from TF to PJ |
| Auto-Transition | ✓ PASS | Product "Approved" → "In Development" on first hours |
| Task Name Sync | ✓ PASS | Name updates sync correctly |

### Test Data Used

```
Product Jarvis:
  - Product ID: 18 "Integration Test Product 2026"
  - Task ID: 40 "New Backend API Development"
  - Position ID: 11 "Integration Tester"

TaskFlow:
  - Project ID: 7 (pj_product_id=18)
  - Ticket ID: 43 "Backend API Development"
```

### Issue Found & Fixed During Testing

**Problem:** TaskFlow's `PJ_API_URL` was defaulting to port 8000, but PJ runs on 8001.

**Fix:** Updated TaskFlow `backend/config.py`:
```python
PJ_API_URL: str = "http://localhost:8001/api"  # Changed from 8000
```

This fix is documented in the "CRITICAL: Cross-App Configuration" section above.

---

## Related Documentation

- `INTEGRATION-TEST-PLAN.md` - Full test suite (11 test scenarios)
- `docs/TASKFLOW_AUTH_REFERENCE.md` - Auth implementation reference from TaskFlow
- TaskFlow `DEPLOYMENT.md` - Reference for consistent setup

---

## Appendix: Full Local Development Setup

### Terminal 1 - Product Jarvis Backend
```bash
cd /path/to/product-jarvis/backend
source .venv/bin/activate
uvicorn main:app --reload --port 8001
```

### Terminal 2 - Product Jarvis Frontend
```bash
cd /path/to/product-jarvis/frontend
npm run dev  # Runs on port 5173
```

### Terminal 3 - TaskFlow Backend
```bash
cd /path/to/task-flow/backend
source venv/bin/activate
uvicorn main:app --reload --port 8000
```

### Terminal 4 - TaskFlow Frontend
```bash
cd /path/to/task-flow/frontend
npm run dev  # Runs on port 5174
```

### Quick Verification Commands

```bash
# Check PJ is running
curl http://localhost:8001/api/products | head -c 100

# Check TF is running
curl http://localhost:8000/api/projects | head -c 100

# Test webhook manually
curl -X POST "http://localhost:8000/webhooks/pj/product" \
  -H "Content-Type: application/json" \
  -H "X-Webhook-Secret: taskflow-pj-secret-2026" \
  -d '{"event":"product.approved","product_id":9999,"name":"Test Product","service_department":"Tech"}'
```
