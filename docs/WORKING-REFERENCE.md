# Product Jarvis - Working Reference Guide

**Version:** 3.0 | **Last Updated:** January 2026 | **Audience:** Project Managers, Department Leads, Engineers

---

## Table of Contents
1. [Quick Start](#quick-start)
2. [Core Concepts](#core-concepts)
3. [Setting Up Your Data](#setting-up-your-data)
4. [Creating Products](#creating-products)
5. [Services Module](#services-module)
6. [Assigning Departments](#assigning-departments)
7. [Adding Tasks](#adding-tasks)
8. [Actual Hours Tracking](#actual-hours-tracking)
9. [Software Allocations](#software-allocations)
10. [Overhead & Fees](#overhead--fees)
11. [Running the Calculator](#running-the-calculator)
12. [Value Estimation](#value-estimation)
13. [Dashboard & Reporting](#dashboard--reporting)
14. [Reports](#reports)
15. [AI Assistant](#ai-assistant)
16. [Settings & Demo Data](#settings--demo-data)
17. [API Reference](#api-reference)
18. [Troubleshooting](#troubleshooting)

---

## Quick Start

### Starting the Application

**Terminal 1 - Backend:**
```bash
cd /Users/seanbrooks/Projects/claude-code-projects/product-jarvis/backend
source .venv/bin/activate
uvicorn main:app --reload --port 8000
```

**Terminal 2 - Frontend:**
```bash
cd /Users/seanbrooks/Projects/claude-code-projects/product-jarvis/frontend
npm run dev
```

### URLs
| Resource | URL |
|----------|-----|
| Frontend App | http://localhost:5173 |
| Backend API | http://localhost:8000 |
| API Documentation | http://localhost:8000/docs |

### Navigation Structure
- Dashboard
- Positions
- Software
- Departments
- Products (with Creation Wizard, Flow/Specs columns)
- Services
- Calculator
- Reports
- Learn
- Assistant (with product document context)
- Knowledge
- Tools
  - User Guides (expandable)
    - Department & BU Head Guide
    - Project Manager Guide
    - Leadership Guide
  - Internal Valuation Assistant
  - External Valuation Assistant
  - Product Discovery Engine
  - Knowledge Builder
- Settings
- About

---

## User Guides

Product Jarvis includes in-app user guides accessible via **Tools → User Guides**:

| Guide | Audience | What It Covers |
|-------|----------|----------------|
| Department & BU Head Guide | Business Unit Heads, Service Department Heads | Creating products, completing valuations, success criteria |
| Project Manager Guide | PMs | Enriching products, generating docs, RACI, tracking hours |
| Leadership Guide | Executives | Portfolio review, decision-making, key metrics |

Each guide includes step-by-step instructions, "You're done when..." criteria, and links to relevant tools.

---

## User Roles & Responsibilities

Product Jarvis supports four primary user roles, each with distinct responsibilities in the product lifecycle:

| Role | Primary Responsibilities |
|------|-------------------------|
| **Business Unit Head** | Request products for their brand; complete initial valuation using the 4-step wizard |
| **Department Head** | Request products/internal tools for their department; complete initial valuation using the 4-step wizard |
| **Project Manager (PM)** | Enrich products with specifications, user flows, and personas; assign department RACI; track actual hours and progress |
| **Leadership** | Review portfolio via Dashboard; evaluate cost vs value; make final Build/Backlog/Kill decisions |

### Product Lifecycle by Role

**Phase 1: Intake** (Owner: Business Unit Head or Department Head)
- Create product via the 4-step wizard
- Provide basic info, select valuation method
- Complete Quick Estimate or Full Valuation
- Paste raw valuation output for audit trail

**Phase 2: Enrichment** (Owner: Project Manager)
- Add detailed specifications (lean PRD)
- Create user flow diagrams
- Document user personas and pre-mortem analysis
- Assign service departments with RACI designations
- Add tasks with position assignments and hour estimates
- Track actual hours as work progresses

**Phase 3: Decision** (Owner: Leadership)
- Review products on Dashboard with filters
- Analyze cost ranges, estimated value, and ROI
- Consider strategic alignment and portfolio balance
- Make Build/Backlog/Kill decision

---

## Core Concepts

### Organizational Hierarchy

```
Business Units (Brands)              Service Departments (Builders)
├── Lines.com                        ├── Technical
├── HighRoller.com          ──▶      ├── SEO
├── Refills.com                      ├── Performance Marketing
├── Cryptocashback.com               ├── Design
└── [Other brands]                   ├── CRO
                                     └── Data & Analytics
```

- **Business Units**: The brands that request and fund products/services
- **Service Departments**: The teams that build products and deliver services
- **Products**: Initiatives that create new value (internal tools or external products to sell)
- **Services**: Ongoing or one-time work provided by departments to business units

### Who Can Request Products

Both Business Units AND Service Departments can request products:

| Requestor Type | Example | Product Type |
|----------------|---------|--------------|
| Business Unit | Lines.com requests a Mobile App | Internal (for their customers) |
| Service Department | SEO Dept requests an SEO Content Generator | Internal (to improve their service delivery) |
| Service Department | Technical requests a Landing Page Builder SaaS | External (to sell B2B) |

### Product Types

| Type | Description | Example |
|------|-------------|---------|
| **Internal** | Built for our use (brands or departments) | Lines.com Mobile App, SEO Content Generator |
| **External** | Built to sell (B2B or B2C) | Landing Page Builder SaaS, Affiliate Tracking Platform |

### Cost Components

| Component | Description | How It's Calculated |
|-----------|-------------|---------------------|
| Labor Cost | People time | Position hourly rate × estimated hours |
| Software Cost | Tool subscriptions | Monthly cost × allocation % |
| Overhead | Total direct costs | Labor + Software |
| Fee | Markup on overhead | Overhead × fee % |
| Total with Fee | Final cost | Overhead + Fee |

### RACI Matrix

| Letter | Role | Who Uses It |
|--------|------|-------------|
| **R** - Responsible | Does the work | Engineering teams, designers |
| **A** - Accountable | Owns the outcome | Product leads, department heads |
| **C** - Consulted | Provides expertise | SMEs, stakeholders |
| **I** - Informed | Needs updates | Executives, dependent teams |

### Department Roles

| Role | Rules | Use Case |
|------|-------|----------|
| **Lead** | Exactly one per product | Primary accountable department |
| **Supporting** | Zero or more per product | Contributing departments |

---

## Setting Up Your Data

### Step 1: Configure Service Departments

Navigate to **Departments** in the navigation.

**Typical departments:**
- Technical
- SEO
- Performance Marketing
- Design
- CRO
- Data & Analytics

**To add a department:**
1. Enter name in the input field
2. Add optional description
3. Click "Add Department"

### Step 2: Configure Positions

Navigate to **Positions** in the navigation.

**Required fields:**
| Field | Description | Example |
|-------|-------------|---------|
| Title | Position name | Senior Developer |
| Department | Internal department | Technical |
| Min Hourly Cost | Lower rate bound | $75 |
| Max Hourly Cost | Upper rate bound | $110 |

**Bulk import via CSV:**

Click "Import CSV" button on the Positions page.

Required columns: `Title, Department, Hourly Cost Min, Hourly Cost Max`

```csv
Title,Department,Hourly Cost Min,Hourly Cost Max
Senior Developer,Technical,$75,$110
Product Manager,Product,$65,$95
UX Designer,Design,$55,$85
SEO Specialist,SEO,$45,$70
```

### Step 3: Configure Software Costs

Navigate to **Software** in the navigation.

**Required fields:**
| Field | Description | Example |
|-------|-------------|---------|
| Name | Software name | AWS |
| Monthly Cost | Total monthly spend | $8,500 |
| Description | What it's used for (optional) | Cloud infrastructure |

**Bulk import via CSV:**

Required columns: `Name, Monthly Cost`
Optional column: `Description`

```csv
Name,Monthly Cost,Description
AWS,$8500,Cloud infrastructure
Figma,$750,Design and prototyping
SEMrush,$450,SEO and competitive research
Hotjar,$300,User behavior analytics
```

---

## Creating Products

Navigate to **Products** → Click **"Add Product"** to launch the creation wizard.

### Product Creation Wizard (4 Steps)

**Step 1: Basic Info**
| Field | Description | Options/Example |
|-------|-------------|-----------------|
| Name | Product name | "SEO Content Generator" |
| Description | What the product does | Free text |
| Product Type | Internal or External | Internal (for us), External (to sell) |
| Requestor Type | Who is requesting | Business Unit or Service Department |
| Requestor | The specific requestor | Lines.com OR SEO Department |

**Step 2: Choose Method**
| Method | Time | Confidence | Use When |
|--------|------|------------|----------|
| Quick Estimate | ~2 min | Low | Early exploration, rough sizing |
| Full Valuation | ~15 min | Higher | Serious consideration, budget requests |

**Step 3: Valuation**
- **Quick**: Simple calculator (hours saved × users × hourly cost)
- **Full**: Multi-section form with all value drivers:
  - Internal: time savings, error reduction, cost avoidance, risk mitigation, adoption, strategic
  - External: market sizing, revenue, customer economics, GTM, growth, strategic

**Step 4: Raw Output**
- Paste the raw output from valuation assistants (REQUIRED)
- Provides audit trail for leadership review

### Product Statuses

| Status | When to Use |
|--------|-------------|
| Ideation | Initial scoping, not yet approved |
| In Development | Active development |
| Launched | Delivered and deployed |
| On Hold | Paused, may resume later |
| Cancelled | Not proceeding |

### Internal vs External Products

| Type | Requestor Examples | Purpose |
|------|-------------------|---------|
| **Internal** | Lines.com, SEO Dept, Technical Dept | Tools for our teams or brands |
| **External** | Technical Dept, Data & Analytics | Products to sell to other businesses (B2B) or consumers (B2C) |

**Note:** An internal product can become external if you decide to productize and sell it.

---

## Services Module

Navigate to **Services** in the navigation.

Services represent ongoing or one-time work that departments provide to business units.

### Service Structure

```
Service Department → Business Unit → Service Type → Tasks
     (who)              (for whom)      (what kind)    (work items)
```

### Service Types

Navigate to Services page to manage service types. Each service type belongs to a specific department.

| Field | Description | Example |
|-------|-------------|---------|
| Department | Which department offers this | SEO |
| Name | Service type name | Link Building |
| Description | What it covers | SEO link acquisition and outreach |
| Is Recurring | Repeats on schedule | Yes/No |

**Example service types by department:**

| Department | Service Types |
|------------|--------------|
| Technical | Ongoing Support, Ad-hoc Development |
| SEO | Link Building, Technical SEO Audit, Keyword Research |
| Performance Marketing | Campaign Management, Ad-hoc Campaign |
| Design | UI/UX Design, Design Retainer |
| CRO | CRO Testing, CRO Audit |
| Data & Analytics | Data Analysis, Dashboard Build |

When creating a service, selecting a department will filter the service type dropdown to only show that department's service types.

### Creating a Service

1. Click "Add Service" on Services page
2. Enter service name (e.g., "Technical Support for Lines.com")
3. Select the providing department
4. Select the business unit being served
5. Choose the service type
6. Set status (Active, Paused, Completed, Cancelled)
7. Set Fee % if applicable

### Service Tasks

Tasks on services can be:

| Type | Description | Example |
|------|-------------|---------|
| One-time | Single occurrence | "Initial setup" |
| Recurring | Repeats on schedule | "Monthly reporting" |

**Recurrence options:**
- Weekly
- Monthly
- Quarterly
- Annually

### Service Calculator

Click "Open Calculator" on any service to see:
- Task breakdown with costs
- Software allocations
- Overhead calculation
- Fee calculation
- Progress tracking (actual vs estimated hours)

---

## Assigning Departments

After creating a product, expand its row to access the **Departments** section.

### Adding a Department Assignment

1. Click "Add Department" button
2. Select department from dropdown
3. Choose role: **Lead** or **Supporting**
4. Select RACI: Responsible, Accountable, Consulted, or Informed
5. Enter allocation % (optional - defaults to equal split)
6. Click "Add"

### Rules

| Rule | Description |
|------|-------------|
| One Lead Required | Every product must have exactly one lead department |
| RACI Required | Each assignment needs a RACI designation |
| Allocation Optional | If not specified, costs split equally among departments |
| No Duplicates | Can't assign same department twice |

---

## Adding Tasks

Tasks represent work items with estimated hours assigned to positions.

### From Products Page

1. Expand product row
2. Go to **Tasks** section
3. Enter task name (e.g., "Backend API development")
4. Select position (e.g., "Senior Developer")
5. Enter estimated hours
6. Click "Add Task"

### From Calculator Page

1. Navigate to Calculator
2. Select a product
3. Scroll to Tasks section
4. Add tasks inline

### Task Best Practices

| Practice | Why |
|----------|-----|
| Break down large tasks | Better accuracy, easier tracking |
| Use consistent naming | Easier to compare across products |
| Include all phases | Discovery, design, dev, QA, deploy |
| Account for meetings | PM time, reviews, standups |

---

## Actual Hours Tracking

Track progress by updating actual hours worked on each task.

### How It Works

1. Navigate to **Calculator** and select a product
2. In the Tasks table, find the **Actual Hours** column
3. Enter hours worked in the input field
4. Changes auto-save with visual feedback (spinner → checkmark)

### Progress Indicators

| Status | Condition | Color |
|--------|-----------|-------|
| Not Started | 0 actual hours | Gray |
| Under Budget | Actual < 90% of estimated | Blue |
| On Track | Actual 90-110% of estimated | Green |
| Over Budget | Actual > 110% of estimated | Red |

### Where Progress Shows

- **Calculator Page**: Progress bar and status badge per task
- **Dashboard**: Overall product progress indicator
- **Reports**: Progress summary per product/service

---

## Software Allocations

Allocate a percentage of each software subscription to products that use it.

### From Calculator Page

1. Open product in Calculator
2. Scroll to Software Costs section
3. Add allocations with percentages

### Allocation Rules

| Rule | Description |
|------|-------------|
| Max 100% per software | Total allocations across all products ≤ 100% |
| Calculated monthly | Monthly cost × allocation % |
| Annualized in totals | Monthly × 12 for annual views |

---

## Overhead & Fees

### Understanding Overhead

**Overhead** = Labor Costs + Software Costs

This represents the true cost to deliver the product or service.

### Adding Fees

Fees allow departments to charge a markup on their overhead costs to business units.

1. On Product or Service, set the **Fee %** field (e.g., 10%)
2. Calculator will show:
   - Overhead (Labor + Software)
   - Fee Amount (Overhead × Fee %)
   - Total with Fee (Overhead + Fee Amount)

### Fee Use Cases

| Scenario | Fee % | Purpose |
|----------|-------|---------|
| Internal tool for department | 0% | No markup for internal use |
| Service to business unit | 8-12% | Cover management overhead |
| External product development | 0% | Revenue comes from sales, not fees |

---

## Running the Calculator

Navigate to **Calculator** and select a product.

### Cost Summary

| Metric | Description |
|--------|-------------|
| Labor Cost (Min/Max) | Sum of (hours × hourly rate range) |
| Software Cost | Sum of allocated software costs |
| Overhead | Labor + Software |
| Fee Amount | Overhead × Fee % |
| Total with Fee | Overhead + Fee |

### Progress Summary

| Metric | Description |
|--------|-------------|
| Total Estimated Hours | Sum of all task estimates |
| Total Actual Hours | Sum of hours logged |
| Overall Progress | Actual / Estimated as percentage |
| Status | Not Started, Under, On Track, Over |

### ROI Calculation

```
ROI = ((Estimated Value - Total Cost) / Total Cost) × 100
```

### Recommendation Thresholds

| ROI Range | Recommendation | Action |
|-----------|----------------|--------|
| ≥ 100% | **BUILD** | Proceed immediately |
| 50-99% | **CONSIDER** | Evaluate further, maybe optimize |
| 0-49% | **DEFER** | Low priority, revisit later |
| < 0% | **KILL** | Do not proceed |

---

## Value Estimation

### Quick Estimate

For simple products, enter a dollar value directly in the product's "Estimated Value" field.

### Full Valuation (Valuation Page)

Navigate to **Valuation** for comprehensive value estimation.

### Internal Product Valuation

| Field | Description | Example |
|-------|-------------|---------|
| Hours Saved / User / Week | Time saved per user per week | 2 hours |
| Number of Users | Employees who will use it | 50 users |
| Average Hourly Cost | Fully-loaded hourly rate | $65/hr |
| Expected Adoption Rate % | % who will actually use it | 75% |
| Training Cost per User | Cost to train each user | $200 |

### External Product Valuation

| Field | Description | Example |
|-------|-------------|---------|
| Total Potential Customers (TAM) | Total market size | 100,000 |
| Serviceable % (SAM) | % you can realistically reach | 20% |
| Achievable Market Share % (SOM) | % you can capture | 5% |
| Average Deal Size | Contract value per customer | $1,000 |
| Customer Acquisition Cost (CAC) | Cost to acquire one customer | $500 |

### Key Metrics

| Metric | Healthy | Caution | Unsustainable |
|--------|---------|---------|---------------|
| LTV:CAC Ratio | ≥ 3:1 | 1-3:1 | < 1:1 |
| Payback Period | ≤ 12 mo | 12-18 mo | > 18 mo |
| Monthly Churn | < 3% | 3-5% | > 5% |

---

## Dashboard & Reporting

Navigate to **Dashboard** for portfolio overview.

### Filters

| Filter | Options |
|--------|---------|
| Requested By | All, Lines.com, HighRoller.com, etc. |
| Lead Department | All, Technical, SEO, etc. |

### Product Cards

Each card shows:
- Product name and requestor
- Lead department badge
- Status and product type
- Cost range and estimated value
- **Progress indicator** with status badge
- ROI and recommendation

---

## Reports

Navigate to **Reports** for detailed product and service reports.

### Report Types

| Tab | Shows |
|-----|-------|
| Products | Products in Ideation or In Development |
| Services | Services with Active status |

### Period Selection

- Last 7 Days
- Last 30 Days

### Report Contents

Each product/service shows:
- Name, requestor, status
- Estimated vs Actual Hours
- Progress percentage and status
- Cost breakdown
- Expandable task-level detail
- Hours by Position summary

### PDF Export

Click "Export PDF" to open print dialog for saving as PDF.

---

## AI Assistant

Navigate to **Assistant** for natural language portfolio queries.

### What the Assistant Can Access

When "Include portfolio data" is checked:
- All products with costs, values, ROI, recommendations
- **Product documents** (raw valuation output, specifications, user flow, persona feedback)
- Valuation details (method used, confidence level, all input data)
- Service departments and RACI assignments
- Tasks with estimated and actual hours
- Software allocations
- Positions and hourly rates

### Example Queries

| Question | What You Get |
|----------|-------------|
| "What's our highest ROI product?" | Top product with cost/value breakdown |
| "Show me all Technical department products" | Filtered list with roles |
| "Which products are over budget?" | Products with actual > estimated hours |
| "Compare Lines.com vs HighRoller products" | Side-by-side analysis |
| "Review the specifications for SEO Content Generator" | Feedback on product spec document |
| "What are the risks identified in persona feedback?" | Pre-mortem analysis summary |

---

## Settings & Demo Data

Navigate to **Settings** for application management.

### Load Demo Data

Click "Load Demo Data" to populate the system with sample data including:
- 8 positions with realistic salary ranges
- 6 software tools with costs
- 6 service departments
- 5 products (internal and external)
- 3 services with tasks and progress

### Clear All Data

Click "Clear All Data" in the Danger Zone to remove all data and start fresh.

**Warning:** This action cannot be undone and will delete:
- All positions, software, departments
- All products with tasks and allocations
- All services with tasks and allocations
- All knowledge base entries

---

## API Reference

### Products

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/products` | List all products |
| POST | `/api/products` | Create product |
| PUT | `/api/products/{id}` | Update product |
| DELETE | `/api/products/{id}` | Delete product |
| PATCH | `/api/tasks/{id}` | Update task (actual hours) |

### Services

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/services` | List all services |
| POST | `/api/services` | Create service |
| PUT | `/api/services/{id}` | Update service |
| DELETE | `/api/services/{id}` | Delete service |
| PATCH | `/api/service-tasks/{id}` | Update service task |

### Service Types

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/service-types` | List all service types |
| GET | `/api/service-types?department_id=1` | List service types for a department |
| POST | `/api/service-types` | Create service type (requires department_id) |

### Calculator

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/calculator/{id}` | Get product cost analysis |
| GET | `/api/services/{id}/calculator` | Get service cost analysis |

### Dashboard

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/dashboard` | Product portfolio summary |
| GET | `/api/services-dashboard` | Services portfolio summary |

### Reports

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/reports/products` | Products report |
| GET | `/api/reports/services` | Services report |

### Admin

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/admin/seed-demo-data` | Load demo data |
| DELETE | `/api/admin/clear-all-data` | Clear all data |

---

## Troubleshooting

### Common Issues

**"No lead department assigned"**
- Every product needs exactly one Lead department
- Go to product → Departments → add one with Role = Lead

**"Calculator shows $0"**
- Add tasks with hours and positions
- Add software allocations if applicable

**Progress not updating**
- Enter actual hours in the Calculator page
- Changes auto-save (watch for checkmark indicator)

**Demo data not loading**
- Clear existing data first via Settings → Clear All Data
- Then click Load Demo Data

### Database Location

SQLite database: `data/jarvis.db`

To reset: Delete the file and restart backend (will recreate empty)

---

## Quick Reference Card

### ROI Thresholds
| ROI | Action |
|-----|--------|
| ≥100% | BUILD |
| 50-99% | CONSIDER |
| 0-49% | DEFER |
| <0% | KILL |

### Hours Status
| Status | Condition |
|--------|-----------|
| Not Started | 0 hours |
| Under Budget | < 90% |
| On Track | 90-110% |
| Over Budget | > 110% |

### Business Units (Brands)
- Lines.com
- HighRoller.com
- Refills.com
- Cryptocashback.com

### Service Departments
- Technical
- SEO
- Performance Marketing
- Design
- CRO
- Data & Analytics

---

*Document updated January 2026 - Version 3.0*
