# Product Jarvis - Deployment Handoff

## Quick Start

1. **Deployment Guide:** `DEPLOYMENT.md` - Complete step-by-step instructions for deploying to production
2. **Local Setup:** `LOCAL_SETUP_GUIDE.md` - Instructions for running locally during development

---

## Key Files by Purpose

### Deployment & Configuration
| File | Description |
|------|-------------|
| `DEPLOYMENT.md` | Production deployment checklist, environment variables, Railway/Vercel setup |
| `backend/config.py` | All backend configuration settings |
| `backend/requirements.txt` | Python dependencies |
| `frontend/package.json` | Node dependencies |

### Architecture & API
| File | Description |
|------|-------------|
| `docs/ARCHITECTURE.md` | System architecture overview |
| `docs/API.md` | API endpoint documentation |
| `README.md` | Project overview |

### Integration with TaskFlow
| File | Description |
|------|-------------|
| `docs/TASKFLOW_AUTH_REFERENCE.md` | Auth implementation reference shared between PJ and TaskFlow |
| `IMPLEMENTATION_PLAN_UNIFIED_FLOW.md` | Integration flow documentation |

---

## Environment Variables Required

### Product Jarvis Backend
```
AUTH_MODE=dev                              # or "supabase" for production
TASKFLOW_WEBHOOK_URL=http://localhost:8000/webhooks/pj
TASKFLOW_WEBHOOK_SECRET=<from-1password>
TASKFLOW_WEBHOOKS_ENABLED=true
TASKFLOW_API_KEY=<from-1password>
RATE_LIMIT_PER_MINUTE=60

# Production auth (when AUTH_MODE=supabase)
SUPABASE_URL=<your-supabase-url>
SUPABASE_KEY=<your-supabase-anon-key>
SUPABASE_JWT_SECRET=<your-supabase-jwt-secret>
FRONTEND_URL=https://productjarvis.io
```

### Secrets for 1Password
- **Webhook Secret:** Used by both PJ and TaskFlow for secure webhook communication
- **API Key:** Used by TaskFlow to authenticate requests to PJ task endpoints

---

## Folder Structure

```
product-jarvis/
├── backend/           # FastAPI Python backend
│   ├── main.py        # Entry point
│   ├── config.py      # Configuration
│   ├── database.py    # SQLite setup
│   ├── routers/       # API endpoints
│   ├── services/      # Business logic
│   └── models/        # Data models
├── frontend/          # React frontend
│   ├── src/
│   └── package.json
├── data/              # Database storage
│   └── jarvis.db      # SQLite database
└── docs/              # Documentation
```

---

## Deployment Checklist

1. Read `DEPLOYMENT.md` completely
2. Generate production webhook secret: `openssl rand -base64 32`
3. Add secrets to 1Password
4. Configure environment variables on hosting platform
5. Deploy backend (Railway recommended)
6. Deploy frontend (Vercel recommended)
7. Update CORS origins in backend for production domain
8. Coordinate with TaskFlow team on shared secrets

---

## Support Files

| File | Description |
|------|-------------|
| `PROGRESS.md` | Development progress log |
| `docs/WORKING-REFERENCE.md` | Working notes and reference |
| `docs/FRAMEWORKS.md` | Valuation frameworks documentation |
| `docs/PERSONAS.md` | User personas |
| `docs/QUICK_REFERENCE.md` | Quick reference guide |
