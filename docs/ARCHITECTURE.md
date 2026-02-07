# Product Jarvis - Architecture

**Version:** 2.0 | **Last Updated:** January 2025

## Overview

Product Jarvis is a local decision-support system for product evaluation, services tracking, and portfolio management.

## Tech Stack

- **Frontend:** React 18 + Tailwind CSS + Vite
- **Backend:** Python 3.11+ + FastAPI + Pydantic
- **Database:** SQLite (local file)
- **AI:** Claude API (for Assistant feature)

## Project Structure

```
product-jarvis/
├── backend/
│   ├── main.py                    # FastAPI app entry point
│   ├── database.py                # SQLite connection & schema
│   ├── models/                    # Pydantic models
│   │   ├── product.py
│   │   ├── position.py
│   │   ├── service.py
│   │   └── ...
│   ├── routers/                   # API routes
│   │   ├── products.py
│   │   ├── services.py
│   │   ├── calculator.py
│   │   ├── reports.py
│   │   ├── admin.py
│   │   └── ...
│   └── services/                  # Shared business logic
│       └── calculation_service.py # DRY calculation functions
├── frontend/
│   └── src/
│       ├── components/            # Reusable UI components
│       │   └── Toast.jsx
│       └── pages/                 # Page components
│           ├── DashboardPage.jsx
│           ├── ProductsPage.jsx
│           ├── ServicesPage.jsx
│           ├── CalculatorPage.jsx
│           ├── ServiceCalculatorPage.jsx
│           ├── ReportsPage.jsx
│           ├── SettingsPage.jsx
│           └── ...
├── data/                          # SQLite database file
│   └── jarvis.db
└── docs/                          # Documentation
```

## Data Models

### Core Entities

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│    POSITIONS    │     │    SOFTWARE     │     │  SERVICE DEPTS  │
├─────────────────┤     ├─────────────────┤     ├─────────────────┤
│ id              │     │ id              │     │ id              │
│ title           │     │ name            │     │ name            │
│ department      │     │ description     │     │ description     │
│ hourly_cost_min │     │ monthly_cost    │     │ created_at      │
│ hourly_cost_max │     │ created_at      │     │ updated_at      │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

### Products & Tasks

```
┌─────────────────────┐         ┌─────────────────┐
│      PRODUCTS       │         │      TASKS      │
├─────────────────────┤    1:N  ├─────────────────┤
│ id                  │◄────────│ id              │
│ name                │         │ product_id (FK) │
│ description         │         │ position_id (FK)│
│ business_unit       │         │ name            │
│ requestor_type      │         │ estimated_hours │
│ requestor_id (FK)   │         │ actual_hours    │
│ status              │         │ created_at      │
│ product_type        │         │ updated_at      │
│ estimated_value     │         └─────────────────┘
│ fee_percent         │
│ created_at          │
│ updated_at          │
└─────────────────────┘
        │
        │ 1:N
        ▼
┌─────────────────────────┐
│ PRODUCT_SERVICE_DEPTS   │
├─────────────────────────┤
│ id                      │
│ product_id (FK)         │
│ department_id (FK)      │
│ role (lead/supporting)  │
│ raci                    │
│ allocation_percent      │
└─────────────────────────┘
```

### Services & Service Tasks

```
┌─────────────────────┐         ┌─────────────────────┐
│   SERVICE_TYPES     │    1:N  │      SERVICES       │
├─────────────────────┤◄────────├─────────────────────┤
│ id                  │         │ id                  │
│ name                │         │ name                │
│ description         │         │ description         │
│ is_recurring        │         │ service_dept_id (FK)│
│ department_id (FK)  │         │ business_unit       │
└─────────────────────┘         │ service_type_id (FK)│
        │                       │ status              │
        │ N:1                   │ fee_percent         │
        ▼                       │ created_at          │
┌─────────────────────┐         │ updated_at          │
│  SERVICE_DEPTS      │         └─────────────────────┘
└─────────────────────┘
                                        │
                                        │ 1:N
                                        ▼
                                ┌─────────────────────┐
                                │   SERVICE_TASKS     │
                                ├─────────────────────┤
                                │ id                  │
                                │ service_id (FK)     │
                                │ position_id (FK)    │
                                │ name                │
                                │ estimated_hours     │
                                │ actual_hours        │
                                │ is_recurring        │
                                │ recurrence_type     │
                                │ created_at          │
                                │ updated_at          │
                                └─────────────────────┘
```

### Software Allocations

```
┌────────────────────────────────┐
│ PRODUCT_SOFTWARE_ALLOCATIONS   │
├────────────────────────────────┤
│ id                             │
│ product_id (FK)                │
│ software_id (FK)               │
│ allocation_percent             │
└────────────────────────────────┘

┌────────────────────────────────┐
│ SERVICE_SOFTWARE_ALLOCATIONS   │
├────────────────────────────────┤
│ id                             │
│ service_id (FK)                │
│ software_id (FK)               │
│ allocation_percent             │
└────────────────────────────────┘
```

### Valuations

```
┌─────────────────────────────────┐
│      PRODUCT_VALUATIONS         │
├─────────────────────────────────┤
│ id                              │
│ product_id (FK)                 │
│ valuation_date                  │
│ confidence_level                │
│                                 │
│ -- Internal Metrics --          │
│ hours_saved_per_user_per_week   │
│ number_of_affected_users        │
│ average_hourly_cost             │
│ expected_adoption_rate_percent  │
│ training_cost_per_user          │
│ ...                             │
│                                 │
│ -- External Metrics --          │
│ target_customer_segment         │
│ total_potential_customers       │
│ price_per_unit                  │
│ gross_margin_percent            │
│ customer_acquisition_cost       │
│ ...                             │
│                                 │
│ -- Calculated Values --         │
│ total_economic_value            │
│ final_value_low                 │
│ final_value_high                │
│ rice_score                      │
└─────────────────────────────────┘
```

## Database Schema (SQLite)

```sql
-- Positions
positions (
    id INTEGER PRIMARY KEY,
    title TEXT NOT NULL,
    department TEXT NOT NULL,
    hourly_cost_min REAL NOT NULL,
    hourly_cost_max REAL NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

-- Products
products (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    business_unit TEXT,
    service_department TEXT,
    requestor_type TEXT CHECK (IN ('business_unit', 'service_department')),
    requestor_id INTEGER REFERENCES service_departments(id),
    status TEXT DEFAULT 'Ideation',
    product_type TEXT DEFAULT 'Internal',
    estimated_value REAL DEFAULT 0,
    fee_percent REAL DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

-- Tasks (with actual hours tracking)
tasks (
    id INTEGER PRIMARY KEY,
    product_id INTEGER REFERENCES products(id) ON DELETE CASCADE,
    position_id INTEGER REFERENCES positions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    estimated_hours REAL NOT NULL,
    actual_hours REAL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP  -- For audit trail
)

-- Service Departments
service_departments (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL UNIQUE,
    description TEXT,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

-- Service Types (belong to a department)
service_types (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    is_recurring INTEGER DEFAULT 0,
    department_id INTEGER REFERENCES service_departments(id),
    created_at TIMESTAMP
)

-- Services
services (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    service_department_id INTEGER REFERENCES service_departments(id),
    business_unit TEXT NOT NULL,
    service_type_id INTEGER REFERENCES service_types(id),
    status TEXT DEFAULT 'Active',
    fee_percent REAL DEFAULT 0,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

-- Service Tasks
service_tasks (
    id INTEGER PRIMARY KEY,
    service_id INTEGER REFERENCES services(id) ON DELETE CASCADE,
    position_id INTEGER REFERENCES positions(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    estimated_hours REAL NOT NULL,
    actual_hours REAL,
    is_recurring INTEGER DEFAULT 0,
    recurrence_type TEXT,  -- weekly, monthly, quarterly, annually
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

-- Software Costs
software_costs (
    id INTEGER PRIMARY KEY,
    name TEXT NOT NULL,
    description TEXT,
    monthly_cost REAL NOT NULL,
    created_at TIMESTAMP,
    updated_at TIMESTAMP
)

-- Allocations
product_software_allocations (product_id, software_id, allocation_percent)
service_software_allocations (service_id, software_id, allocation_percent)
product_service_departments (product_id, department_id, role, raci, allocation_percent)
```

## Shared Calculation Service

All calculation logic is centralized in `backend/services/calculation_service.py`:

```python
from services.calculation_service import (
    calculate_hours_status,      # Returns: not_started, under, on_track, over
    calculate_hours_progress,    # Returns: percentage (0-100+)
    calculate_task_costs,        # Returns: task_cost_min/max, actual_cost_min/max
    calculate_overhead_and_fees, # Returns: overhead_min/max, fee_amount_min/max, total_min/max
    calculate_roi,               # Returns: roi_low, roi_high
    calculate_gain_pain,         # Returns: gain_pain_low, gain_pain_high
    get_recommendation,          # Returns: action, color, reasoning
    get_health_from_roi,         # Returns: (health_color, recommendation_text)
    process_task_row             # Returns: fully processed task dict
)
```

## API Design

See [API.md](API.md) for complete endpoint documentation.

### Key Patterns

- All responses follow: `{ success: boolean, data: any, error: string | null }`
- PATCH endpoints for partial updates (e.g., actual hours)
- Dashboard endpoints optimized with GROUP_CONCAT to avoid N+1 queries
- Admin endpoints for demo data management

## Component Hierarchy

```
App
├── Layout (nav, main content area)
├── ToastProvider (notifications)
└── Routes
    ├── DashboardPage (portfolio overview with filters, progress)
    ├── PositionsPage (CRUD, CSV import)
    ├── SoftwarePage (CRUD, CSV import)
    ├── ServiceDepartmentsPage (CRUD)
    ├── ProductsPage (CRUD, dept assignments, tasks)
    ├── ServicesPage (CRUD with service types)
    ├── CalculatorPage (cost analysis, actual hours)
    ├── ServiceCalculatorPage (service cost analysis)
    ├── ReportsPage (Products/Services reports, PDF export)
    ├── LearnPage (frameworks)
    ├── AssistantPage (AI chat)
    ├── KnowledgePage (knowledge base)
    ├── ValuationPage (detailed valuations)
    ├── ToolsPage (assistant setup guides)
    ├── ExpertReview (expert board)
    ├── SettingsPage (demo data, clear data)
    └── AboutPage
```

## Query Optimization

Dashboard endpoints use optimized queries to avoid N+1:

1. **Single query** for products with departments (using GROUP_CONCAT)
2. **Aggregate query** for task costs grouped by product_id
3. **Aggregate query** for software costs grouped by product_id

Same pattern applies to services dashboard.

## Audit Trail

- `tasks.updated_at` and `service_tasks.updated_at` track when hours were last modified
- PATCH endpoints automatically set timestamp on update

---

## Task Flow Integration

Product Jarvis integrates with Task Flow for project management and time tracking. The integration uses webhooks for real-time synchronization.

### Integration Architecture

```
┌─────────────────────┐                      ┌─────────────────────┐
│   Product Jarvis    │                      │     Task Flow       │
│     (Port 8000)     │                      │    (Port 8001)      │
├─────────────────────┤                      ├─────────────────────┤
│                     │  ──── Webhooks ────► │                     │
│ Products            │  product.in_dev      │ Projects            │
│ Services            │  service.created     │ Tickets             │
│ Departments         │  department.*        │ Employees           │
│ Positions           │  position.*          │ Time Entries        │
│                     │                      │                     │
│ Tasks (with costs)  │ ◄── API Calls ────── │ (creates tasks)     │
│                     │  POST /tasks         │                     │
│                     │  PATCH /tasks        │ (updates hours)     │
└─────────────────────┘                      └─────────────────────┘
```

### Webhook Configuration

```python
# backend/config.py
TASKFLOW_WEBHOOK_URL = "http://localhost:8001/webhooks/pj"
TASKFLOW_WEBHOOK_SECRET = "taskflow-pj-secret-2026"
TASKFLOW_WEBHOOKS_ENABLED = True
```

### Product Jarvis → Task Flow Webhooks

| Endpoint | Event | Trigger | Payload |
|----------|-------|---------|---------|
| `/webhooks/pj/product` | `product.in_development` | Product status → "In Development" | product_id, name, product_type, is_internal |
| `/webhooks/pj/service` | `service.created` | New service created | service_id, name, department_name, business_unit |
| `/webhooks/pj/department` | `department.created/updated` | Department created/updated | department_id, name, positions[] |
| `/webhooks/pj/position` | `position.created/updated` | Position created/updated | position_id, name, department_id |

### Task Flow → Product Jarvis API

| Endpoint | Method | Purpose |
|----------|--------|---------|
| `/api/positions` | GET | Fetch positions for employee assignment |
| `/api/products/{id}/tasks` | POST | Create task when ticket assigned |
| `/api/tasks/{id}` | PATCH | Update actual hours when time logged |

### Data Flow

1. **Organizational Sync:**
   - Product Jarvis creates/updates departments → webhook to Task Flow
   - Product Jarvis creates/updates positions → webhook to Task Flow (includes department_id)
   - Task Flow uses this data to link employees to cost roles

2. **Project Creation:**
   - Product approved in Product Jarvis (status → "In Development")
   - Webhook sends product data with `product_type: "product"` and `is_internal: true/false`
   - Task Flow creates project with type badge (Product/Service, Internal/External)

3. **Task & Time Tracking:**
   - Task Flow creates tickets and assigns employees with position_id
   - Task Flow calls Product Jarvis API to create tasks
   - Time logged in Task Flow → Product Jarvis actual_hours updated
   - Product Jarvis calculates costs (Task Flow never sees hourly rates)

### Security Boundary

Product Jarvis maintains cost confidentiality:
- Hourly rates stored only in Product Jarvis
- Task Flow sends hours, receives only task IDs
- Cost calculations happen server-side in Product Jarvis

### Webhook Service

Located at `backend/services/webhook_service.py`:

```python
async def send_product_webhook(product_id, name, description, product_type, service_department)
async def send_service_webhook(service_id, name, description, department_name, business_unit)
async def send_department_webhook(department_id, name, event, manager_name, positions)
async def send_position_webhook(position_id, name, department_id, event)
```

All webhooks:
- Use `X-Webhook-Secret` header for authentication
- Run as background tasks (non-blocking)
- Log success/failure with relevant IDs
- Return structured response with success status

---

*Document updated January 2025 - Version 2.1*
