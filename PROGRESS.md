# Product Jarvis - Progress & Resume Instructions

**Last Updated:** 2026-01-27

---

## Quick Resume

Tell Claude:
> "Read PROGRESS.md and resume where we left off."

---

## Current Status

**Bug Fix: Edit Product Modal** - 2026-01-27
- Fixed regression where RACI (Service Departments) and Documents sections were missing from Edit Product modal
- Root cause: Conditional rendering logic checked `!createdProductId` first, which was always true when editing
- Fix: Reordered conditional to check `product` first (edit mode), then `createdProductId` (post-create), then basic form (create)
- File modified: `frontend/src/pages/ProductsPage.jsx` (lines 571-869)

**UI Overhaul: COMPLETE** - 2026-01-27
- Converted top navigation to collapsible sidebar ✅
- Added data visualizations (charts) to Dashboard, Service Departments, Business Units pages ✅
- Implemented role-based access system ✅

**Role System: COMPLETE** - 2026-01-27
- Four roles: Executive, Project Manager, Department Head, Business Unit Head
- Executive & PM have full access to all views
- Department Head sees only their department's products/services
- Business Unit Head sees only their BU's requested products/services
- Role selector in sidebar with department/BU dropdown when applicable
- Persisted to localStorage (no authentication for MVP)

**TaskFlow Integration: COMPLETE (Products AND Services)**
- Phase 1 (TF→PJ): Tasks, hours, positions sync ✅
- Phase 2 (PJ→TF Products): Webhook on "In Development" creates TF project ✅
- Phase 3 (PJ→TF Services): Webhook on service creation creates TF project ✅
- Phase 4 (TF→PJ): Due date sync for task dependencies ✅

**All Integration Tests Passed** - 2026-01-23

**Due Date Sync Tested & Working** - 2026-01-23

---

## How to Start

### Terminal 1 - PJ Backend (port 8000)
```bash
cd /Users/seanbrooks/Projects/claude-code-projects/product-jarvis/backend
source .venv/bin/activate
python -m uvicorn main:app --host 0.0.0.0 --port 8000 --reload
```

### Terminal 2 - PJ Frontend (port 5180)
```bash
cd /Users/seanbrooks/Projects/claude-code-projects/product-jarvis/frontend
npm run dev -- --port 5180
```

### Terminal 3 - TF Backend (port 8001)
```bash
cd /Users/seanbrooks/Projects/claude-code-projects/task-flow/backend
source venv/bin/activate  # or use system python with deps installed
python -m uvicorn main:app --host 0.0.0.0 --port 8001 --reload
```

### Terminal 4 - TF Frontend (port 3000)
```bash
cd /Users/seanbrooks/Projects/claude-code-projects/task-flow/frontend
npm run dev
```

### Access
- PJ App: http://localhost:5180
- PJ API Docs: http://localhost:8000/docs
- TF App: http://localhost:3000
- TF API Docs: http://localhost:8001/docs

---

## What's Working

### Product Integration (PJ → TF)
1. Create Product in PJ → change status to "In Development"
2. Webhook fires → TF creates Project with "Product" badge
3. Project linked via `pj_product_id`
4. Create Ticket in TF → Task syncs to PJ Calculator
5. Log time in TF → actual hours and costs update in PJ

### Service Integration (PJ → TF)
1. Create Service in PJ
2. Webhook fires → TF creates Project with "Service" badge
3. Project linked via `pj_service_id`
4. Create Ticket in TF → Task syncs to PJ Service Calculator
5. Log time in TF → actual hours and costs update in PJ

### Verified Test Results (2026-01-23)

**Product Test:**
- Created "Test Integration Product" in PJ
- Changed status to "In Development" → webhook fired
- Project appeared in TF with Product badge
- Created ticket assigned to Jordan Tech (pj_position_id=3)
- Task synced to PJ Calculator with estimated costs ($200-$300)
- Logged 6h in TF → PJ showed 6h actual with calculated costs

**Service Test:**
- Created "Test Service 10" in PJ
- Project appeared in TF with Service badge
- Created "Service Task Test" ticket assigned to Jordan Tech
- Task synced to PJ Service Calculator (Task ID #20)
- Logged 2h in TF → PJ showed 2h actual (50%), $100-$150 actual cost

**Due Date Sync Test (2026-01-23):**
- Changed due date on ticket in TF
- Due date synced to corresponding task in PJ
- `delay_reason` field gracefully ignored (no errors)

---

## Configuration

### TF Backend (config.py)
```python
PJ_API_URL = "http://localhost:8000/api"
PJ_MOCK_MODE = False
PJ_WEBHOOK_SECRET = "taskflow-pj-secret-2026"
```

### PJ Backend (config.py)
```python
TASKFLOW_WEBHOOK_URL = "http://localhost:8001/api/webhooks/pj"
TASKFLOW_WEBHOOK_SECRET = "taskflow-pj-secret-2026"
TASKFLOW_WEBHOOKS_ENABLED = True
```

---

## Files Modified for UI Overhaul & Role System (2026-01-27)

### New Files
- `frontend/src/contexts/RoleContext.jsx` - Role state management with localStorage persistence

### Frontend Modified
- `frontend/src/App.jsx` - Complete rewrite: collapsible sidebar, grouped navigation, RoleSelector component
- `frontend/src/pages/DashboardPage.jsx` - Added StatusDonutChart, HealthBarChart, role-based filtering
- `frontend/src/pages/ProductsPage.jsx` - Added role-based filtering, dynamic title
- `frontend/src/pages/ServicesPage.jsx` - Added role-based filtering, dynamic title
- `frontend/src/pages/ServiceDepartmentsPage.jsx` - Added DepartmentStatsChart
- `frontend/src/pages/BusinessUnitsPage.jsx` - Added BusinessUnitStatsChart

### Backend Modified
- `backend/routers/service_departments.py` - Added `/stats` endpoint for chart data
- `backend/routers/business_units.py` - Added `/stats` endpoint for chart data

### Key Components Added

**RoleContext** (`frontend/src/contexts/RoleContext.jsx`):
- ROLES enum: EXECUTIVE, PROJECT_MANAGER, DEPARTMENT_HEAD, BU_HEAD
- State: role, selectedDepartmentId, selectedBusinessUnitId
- Computed: hasFullAccess, isDepartmentHead, isBUHead
- All persisted to localStorage

**Sidebar Navigation** (`frontend/src/App.jsx`):
- Collapsible sidebar (collapsed state in localStorage)
- Grouped navigation: Core, Data, Products, Insights, AI Tools, System
- Role-based filtering via `fullAccessOnly` flag on groups/items
- Icons for each nav item

**RoleSelector** (`frontend/src/App.jsx`):
- Dropdown to switch roles
- Shows department/BU picker when relevant role selected
- Color-coded by role (purple=Exec, blue=PM, green=Dept, orange=BU)

**Charts** (SVG-based, no external library):
- StatusDonutChart - product status distribution
- HealthBarChart - product health distribution
- DepartmentStatsChart - horizontal bar chart of department workload
- BusinessUnitStatsChart - horizontal bar chart of BU product counts

---

## Files Modified for Due Date Sync (2026-01-23)

### PJ Backend
- `database.py` - Added `due_date` column to `tasks` and `service_tasks` tables
- `models/task.py` - Added `due_date` field to TaskUpdate schema, `extra="ignore"` for graceful handling
- `models/service.py` - Added `due_date` field to ServiceTaskUpdate schema, `extra="ignore"` for graceful handling
- `routers/calculator.py` - Updated PATCH /api/tasks/{id} to accept and store `due_date`
- `routers/services.py` - Updated PATCH /api/service-tasks/{id} to accept and store `due_date`

**Note:** `delay_reason` is silently ignored (TF owns that data). PJ stores `due_date` for schedule visibility.

---

## Files Modified for Service Integration (2026-01-23)

### PJ Backend
- `database.py` - Added migration for service_tasks columns (external_id, status, assignee_name)
- `models/service.py` - Added TaskStatus type and new fields to ServiceTaskCreate/Update
- `routers/services.py` - Added webhook trigger on service creation, GET /api/service-tasks/{id}
- `services/webhook_service.py` - Added send_service_webhook()

### PJ Frontend
- `frontend/src/pages/ProductsPage.jsx` - Fixed edit form bug (createdProductId initialization)

### TF Backend
- `models/project.py` - Added pj_service_id column
- `models/sync_queue.py` - Added pj_service_id column
- `schemas/project.py` - Made pj_product_id optional, added pj_service_id
- `schemas/webhook.py` - Added ServiceWebhookPayload
- `routers/webhooks.py` - Added /webhooks/pj/service endpoint
- `services/webhook_service.py` - Added create_project_from_service()
- `services/pj_sync.py` - Added create_service_task(), updated methods with is_service_task param
- `services/ticket_service.py` - Updated to use correct sync method based on project type
- `services/time_service.py` - Updated to pass is_service_task flag

---

## Bug Fixes Applied

1. **PJ Product Edit Form Not Saving Status:**
   - Root cause: `createdProductId` was initialized to `product?.id || null` when editing
   - This caused the edit form to show "Assign Departments" view instead of actual form
   - Fix: Changed to `useState(null)`

2. **TF Projects 500 Error After Service Integration:**
   - Root cause: `ProjectResponse` schema had `pj_product_id: int` (required)
   - Service-linked projects have null `pj_product_id`
   - Fix: Made `pj_product_id` optional and added `pj_service_id` to schema

---

## Architecture

```
Product Jarvis (PJ)                         TaskFlow (TF)
─────────────────────                       ──────────────

PRODUCTS:
1. Product status → "In Development"
         ──webhook──▶                       2. Project created (Product badge)
                                               pj_product_id linked

                                            3. PM creates tickets
         ◀──POST /products/{id}/tasks──
4. Tasks created in PJ Calculator

                                            5. Employees log time
         ◀──PATCH /tasks/{id}──
6. actual_hours + costs updated

SERVICES:
1. Service created
         ──webhook──▶                       2. Project created (Service badge)
                                               pj_service_id linked

                                            3. PM creates tickets
         ◀──POST /services/{id}/tasks──
4. Tasks created in PJ Service Calculator

                                            5. Employees log time
         ◀──PATCH /service-tasks/{id}──
6. actual_hours + costs updated
```

---

## Key API Endpoints

### TaskFlow Integration
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/positions` | GET | TF fetches positions to link employees |
| `/api/products/{id}/tasks` | POST | TF creates product tasks |
| `/api/services/{id}/tasks` | POST | TF creates service tasks |
| `/api/tasks/{id}` | GET/PATCH | TF fetches/updates product task (accepts `due_date`) |
| `/api/service-tasks/{id}` | GET/PATCH | TF fetches/updates service task (accepts `due_date`) |

### TF Webhooks
| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/webhooks/pj/product` | POST | PJ sends product.in_development event |
| `/api/webhooks/pj/service` | POST | PJ sends service.created event |

---

## Future Enhancements

1. **Delete Sync** - When ticket deleted in TF, remove task in PJ
2. **Bulk Reconciliation** - Sync existing data between systems
3. **Error Handling UI** - Dashboard for failed syncs
4. **API Key Authentication** - Add X-API-Key for TF→PJ calls
5. **Webhook Retry Queue** - Handle failed webhook deliveries

---

## Related Documentation

- [README.md](README.md) - Project overview
- [CHECKPOINT_TF_INTEGRATION.md](CHECKPOINT_TF_INTEGRATION.md) - Original integration details
- [docs/TF_INTEGRATION_TEST_PLAN.md](docs/TF_INTEGRATION_TEST_PLAN.md) - Test procedures
