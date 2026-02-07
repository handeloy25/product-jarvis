# Product Jarvis

A local decision-support system for product evaluation and portfolio management.

## Overview

Product Jarvis helps evaluate product requests, calculate true costs, analyze ROI, and make data-backed Build/Buy/Kill/Defer recommendations.

## Tech Stack

- **Frontend:** React 18 + Tailwind CSS + Vite
- **Backend:** Python 3.11+ + FastAPI
- **Database:** SQLite (local)

## Project Structure

```
product-jarvis/
├── backend/           # FastAPI backend
│   ├── main.py        # App entry point
│   ├── database.py    # SQLite connection
│   ├── models/        # Pydantic models
│   └── routers/       # API routes
├── frontend/          # React frontend
│   └── src/
│       ├── components/
│       └── pages/
├── data/              # SQLite database file
└── docs/              # Documentation
```

## Setup

### Prerequisites

- Python 3.11+
- Node.js 18+
- npm or yarn

### Backend Setup

```bash
cd backend

# Create virtual environment
python -m venv venv

# Activate virtual environment
source venv/bin/activate  # On macOS/Linux
# or: venv\Scripts\activate  # On Windows

# Install dependencies
pip install -r requirements.txt

# Run the server
uvicorn main:app --reload --port 8001
```

Backend runs at: http://localhost:8001

API docs at: http://localhost:8001/docs

> **Note:** Port 8001 is used to avoid conflicts with TaskFlow which runs on port 8000.

### Frontend Setup

```bash
cd frontend

# Install dependencies
npm install

# Run dev server
npm run dev
```

Frontend runs at: http://localhost:5173

## Modules

1. **Employee Cost Database** - Track employees and their fully-loaded hourly costs
2. **Product Tracker** - Log and manage products across the portfolio
3. **Services Tracker** - Track services provided by departments to business units (SEO, content, etc.)
4. **Cost Calculator** - Calculate labor costs, overhead, fees, ROI, and generate recommendations
5. **Reports** - Products and Services reports with progress tracking and PDF export
6. **Portfolio Dashboard** - Single view of all products with health and progress indicators
7. **Learning Engine** - Product frameworks and methodologies reference
8. **Expert Assistant** - Claude-powered product evaluation assistant with full portfolio context including product documents
9. **Knowledge Base** - Custom knowledge entries that provide context to the AI Assistant
10. **Valuation System** - Comprehensive value estimation for internal and external products
11. **Product Creation Wizard** - 4-step guided product creation with embedded Quick/Full valuation
12. **Product Documents** - Raw valuation output, specifications, user flow, and persona feedback
13. **Task Flow Integration** - Bi-directional sync with Task Flow for organizational structure, time tracking, and project management

## Key Features

- **Actual Hours Tracking** - PMs can update actual hours per task, with progress indicators
- **Overhead & Fees** - Calculate overhead (labor + software) and add fees on top
- **Services Module** - Track recurring and one-time services to business units
- **Reports** - Last 7/30 days reports with progress, expandable details, PDF export
- **User Guides** - In-app role-based guides for Department Heads, Project Managers, and Leadership

## External Tools (Claude Projects)

Setup guides for AI assistants that run as Claude Projects:

- **Internal Valuation Assistant** - Guides department heads through internal product valuations
- **External Valuation Assistant** - Guides product managers through external product valuations with market sizing, unit economics, and GTM analysis
- **Product Discovery Engine** - Transforms completed valuations into development-ready documentation (specs, user flows, personas)
- **Knowledge Builder** - Converts content into structured knowledge base entries and executive courses

## Development

### Running Both Servers

Terminal 1 (Backend):
```bash
cd backend && source venv/bin/activate && uvicorn main:app --reload --port 8001
```

Terminal 2 (Frontend):
```bash
cd frontend && npm run dev
```

## Task Flow Integration

Product Jarvis integrates with Task Flow for bi-directional sync of organizational structure, projects, and time tracking.

### Product Jarvis → Task Flow (Webhooks)

| Webhook | Trigger | Purpose |
|---------|---------|---------|
| `product.in_development` | Product status → "In Development" | Creates Task Flow project with `product_type: "product"` and `is_internal: true/false` |
| `service.created` | New service created | Creates Task Flow project with `project_type: "service"` |
| `department.created/updated` | Department created/updated | Syncs department with positions array |
| `position.created/updated` | Position created/updated | Syncs position with department_id |

### Task Flow → Product Jarvis (API)

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/positions` | GET | Fetch positions for employee assignment |
| `/api/products/{id}/tasks` | POST | Create task when ticket assigned |
| `/api/tasks/{id}` | PATCH | Update actual hours when time logged |

### Security Boundary

- Product Jarvis owns: positions, hourly rates, cost calculations
- Task Flow owns: employees, time entries, work assignments
- Task Flow never sees cost data; Product Jarvis calculates costs from hours received

### Configuration

```bash
# Environment variables (or defaults in config.py)
TASKFLOW_WEBHOOK_URL=http://localhost:8000/webhooks/pj
TASKFLOW_WEBHOOK_SECRET=taskflow-pj-secret-2026
TASKFLOW_WEBHOOKS_ENABLED=true
```

See [Task Flow Integration Test Plan](docs/TF_INTEGRATION_TEST_PLAN.md) for detailed webhook payloads and testing procedures.

## Documentation

- [Architecture](docs/ARCHITECTURE.md)
- [API Reference](docs/API.md)
- [Product Frameworks](docs/FRAMEWORKS.md)
- [Task Flow Integration Test Plan](docs/TF_INTEGRATION_TEST_PLAN.md)

## Build Progress

See [CHECKPOINT.md](CHECKPOINT.md) for current build status and session continuity.
