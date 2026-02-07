# Product Jarvis - API Documentation

**Version:** 2.0 | **Last Updated:** January 2025

## Base URL

```
http://localhost:8000/api
```

## Response Format

All endpoints return:

```json
{
  "success": true,
  "data": {...},
  "error": null
}
```

Error responses:
```json
{
  "success": false,
  "data": null,
  "error": "Error message"
}
```

---

## Health Check

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Check API health |

**Response:**
```json
{ "success": true, "data": { "status": "healthy" }, "error": null }
```

---

## Positions

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/positions` | List all positions |
| POST | `/api/positions` | Create position |
| PUT | `/api/positions/{id}` | Update position |
| DELETE | `/api/positions/{id}` | Delete position |
| POST | `/api/positions/import` | Bulk import from CSV |

**Position Object:**
```json
{
  "id": 1,
  "title": "Senior Developer",
  "department": "Technical",
  "hourly_cost_min": 75.0,
  "hourly_cost_max": 110.0
}
```

---

## Software

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/software` | List all software |
| POST | `/api/software` | Create software |
| PUT | `/api/software/{id}` | Update software |
| DELETE | `/api/software/{id}` | Delete software |
| POST | `/api/software/import` | Bulk import from CSV |

**Software Object:**
```json
{
  "id": 1,
  "name": "AWS",
  "description": "Cloud infrastructure",
  "monthly_cost": 8500.0
}
```

---

## Service Departments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/service-departments` | List all departments |
| POST | `/api/service-departments` | Create department |
| PUT | `/api/service-departments/{id}` | Update department |
| DELETE | `/api/service-departments/{id}` | Delete department |

**Department Object:**
```json
{
  "id": 1,
  "name": "Technical",
  "description": "Software development and engineering"
}
```

---

## Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |

**Product Object:**
```json
{
  "id": 1,
  "name": "SEO Content Generator",
  "description": "AI-powered content tool",
  "business_unit": null,
  "requestor_type": "service_department",
  "requestor_id": 2,
  "status": "In Development",
  "product_type": "Internal",
  "estimated_value": 180000.0,
  "fee_percent": 0.0
}
```

**Product Statuses:** `Ideation`, `In Development`, `Launched`, `On Hold`, `Cancelled`

**Product Types:** `Internal`, `External`

**Requestor Types:** `business_unit`, `service_department`

---

## Product Department Assignments

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/{id}/departments` | List department assignments |
| POST | `/api/products/{id}/departments` | Add department to product |
| PUT | `/api/products/{id}/departments/{aid}` | Update assignment |
| DELETE | `/api/products/{id}/departments/{aid}` | Remove assignment |

**Assignment Object:**
```json
{
  "id": 1,
  "product_id": 1,
  "department_id": 1,
  "department_name": "Technical",
  "role": "lead",
  "raci": "Accountable",
  "allocation_percent": 60.0
}
```

**Roles:** `lead`, `supporting`

**RACI Values:** `Responsible`, `Accountable`, `Consulted`, `Informed`

---

## Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/{id}/tasks` | List tasks for product |
| POST | `/api/products/{id}/tasks` | Add task to product |
| PUT | `/api/products/{id}/tasks/{tid}` | Update task |
| DELETE | `/api/products/{id}/tasks/{tid}` | Delete task |
| PATCH | `/api/tasks/{id}` | Update actual hours |

**Task Object:**
```json
{
  "id": 1,
  "product_id": 1,
  "position_id": 2,
  "position_title": "Senior Developer",
  "name": "Backend API development",
  "estimated_hours": 120.0,
  "actual_hours": 95.0,
  "updated_at": "2025-01-05T10:30:00"
}
```

**PATCH Request (actual hours):**
```json
{ "actual_hours": 95.0 }
```

---

## Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | List all services |
| POST | `/api/services` | Create service |
| PUT | `/api/services/{id}` | Update service |
| DELETE | `/api/services/{id}` | Delete service |

**Service Object:**
```json
{
  "id": 1,
  "name": "Technical Support for Lines.com",
  "description": "Ongoing support and maintenance",
  "service_department_id": 1,
  "service_department_name": "Technical",
  "business_unit": "Lines.com",
  "service_type_id": 1,
  "service_type_name": "Ongoing Support",
  "status": "Active",
  "fee_percent": 8.0
}
```

**Service Statuses:** `Active`, `Paused`, `Completed`, `Cancelled`

---

## Service Types

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/service-types` | List all service types |
| GET | `/api/service-types?department_id=1` | List service types for a department |
| POST | `/api/service-types` | Create service type |
| PUT | `/api/service-types/{id}` | Update service type |
| DELETE | `/api/service-types/{id}` | Delete service type |

**Service Type Object:**
```json
{
  "id": 1,
  "name": "Ongoing Support",
  "description": "Monthly support and maintenance",
  "is_recurring": true,
  "department_id": 1,
  "department_name": "Technical"
}
```

**Note:** Service types belong to a specific department. When creating a service, only service types for the selected department are available.

---

## Service Tasks

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services/{id}/tasks` | List tasks for service |
| POST | `/api/services/{id}/tasks` | Add task to service |
| PUT | `/api/services/{id}/tasks/{tid}` | Update task |
| DELETE | `/api/services/{id}/tasks/{tid}` | Delete task |
| PATCH | `/api/service-tasks/{id}` | Update actual hours |

**Service Task Object:**
```json
{
  "id": 1,
  "service_id": 1,
  "position_id": 2,
  "position_title": "Senior Developer",
  "name": "Production support",
  "estimated_hours": 40.0,
  "actual_hours": 35.0,
  "is_recurring": true,
  "recurrence_type": "monthly",
  "updated_at": "2025-01-05T10:30:00"
}
```

**Recurrence Types:** `weekly`, `monthly`, `quarterly`, `annually`, `null` (one-time)

---

## Product Software Allocations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products/{id}/software` | List software allocations |
| POST | `/api/products/{id}/software` | Add allocation |
| PUT | `/api/products/{id}/software/{aid}` | Update allocation |
| DELETE | `/api/products/{id}/software/{aid}` | Remove allocation |

---

## Service Software Allocations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services/{id}/software` | List software allocations |
| POST | `/api/services/{id}/software` | Add allocation |
| DELETE | `/api/services/{id}/software/{aid}` | Remove allocation |

---

## Calculator

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calculator/{id}` | Get product cost analysis |

**Response includes:**
```json
{
  "product": {...},
  "tasks": [...],
  "software_allocations": [...],
  "service_departments": [...],
  "labor_cost_min": 15250.0,
  "labor_cost_max": 22100.0,
  "software_cost": 350.0,
  "overhead_min": 15600.0,
  "overhead_max": 22450.0,
  "fee_percent": 0.0,
  "fee_amount_min": 0.0,
  "fee_amount_max": 0.0,
  "total_with_fee_min": 15600.0,
  "total_with_fee_max": 22450.0,
  "total_estimated_hours": 295.0,
  "total_actual_hours": 263.0,
  "hours_progress": 89.15,
  "hours_status": "on_track",
  "roi_low": 702.0,
  "roi_high": 1053.0,
  "recommendation": {
    "action": "BUILD",
    "color": "green",
    "reasoning": "Strong ROI indicates high value relative to cost"
  }
}
```

**Hours Status Values:** `not_started`, `under`, `on_track`, `over`

---

## Service Calculator

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services/{id}/calculator` | Get service cost analysis |

**Response:** Same structure as product calculator

---

## Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Product portfolio summary |

**Query Parameters:**
- `business_unit` - Filter by requestor business unit
- `service_department` - Filter by lead department

**Response:**
```json
{
  "products": [
    {
      "id": 1,
      "name": "SEO Content Generator",
      "requestor_display": "SEO",
      "status": "In Development",
      "product_type": "Internal",
      "estimated_value": 180000.0,
      "lead_department": "Technical",
      "supporting_departments": ["SEO"],
      "labor_cost_min": 15250.0,
      "labor_cost_max": 22100.0,
      "software_cost": 350.0,
      "total_estimated_hours": 295.0,
      "total_actual_hours": 263.0,
      "hours_progress": 89.15,
      "hours_status": "on_track",
      "health": "green",
      "recommendation": "BUILD"
    }
  ],
  "summary": {
    "total_products": 5,
    "total_cost_min": 85000.0,
    "total_cost_max": 125000.0,
    "total_value": 6500000.0
  }
}
```

---

## Services Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services-dashboard` | Services portfolio summary |

**Query Parameters:**
- `business_unit` - Filter by business unit served
- `service_department` - Filter by providing department

---

## Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/products` | Products report |
| GET | `/api/reports/services` | Services report |

**Query Parameters:**
- `days` - Period filter: `7` or `30` (default: 30)

**Response includes:**
- Products/Services in active states (Ideation/In Development for products, Active for services)
- Task breakdown with progress
- Hours by position summary
- Cost calculations

---

## Valuations

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/valuations/{product_id}` | Get product valuation |
| POST | `/api/valuations/{product_id}` | Create/update valuation |

---

## Knowledge Base

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/knowledge` | List knowledge entries |
| POST | `/api/knowledge` | Create entry |
| PUT | `/api/knowledge/{id}` | Update entry |
| DELETE | `/api/knowledge/{id}` | Delete entry |

---

## Assistant

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/assistant/chat` | Send message to AI assistant |

**Request:**
```json
{
  "message": "What's our highest ROI product?",
  "conversation_history": []
}
```

---

## Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/seed-demo-data` | Load demo data |
| DELETE | `/api/admin/clear-all-data` | Clear all data |

**Seed Response:**
```json
{
  "success": true,
  "data": {
    "message": "Demo data seeded successfully",
    "counts": {
      "positions": 8,
      "software": 6,
      "service_departments": 6,
      "service_types": 13,
      "products": 5,
      "services": 3
    }
  }
}
```

**Clear Response:**
```json
{
  "success": true,
  "data": { "message": "All data cleared successfully" }
}
```

---

## Interactive API Docs

Full interactive documentation available at:
- **Swagger UI:** http://localhost:8000/docs
- **ReDoc:** http://localhost:8000/redoc

---

*Document updated January 2025 - Version 2.0*
