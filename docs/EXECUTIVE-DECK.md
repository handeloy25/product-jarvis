# Product Jarvis - Executive Deck

**Version:** 2.0 | **Date:** January 2025 | **Audience:** Leadership & Stakeholders

---

## TL;DR

> **Product Jarvis transforms gut-feel product decisions into data-driven portfolio management.**
>
> - Calculates true cost (labor + software + overhead + fees) per product
> - Tracks both **Products** (new initiatives) and **Services** (ongoing work)
> - Monitors progress with actual hours vs estimates
> - Recommends BUILD/CONSIDER/DEFER/KILL based on ROI

---

## Overview

Product Jarvis is a portfolio management system that helps our organization:
1. Make data-driven build/buy/defer decisions for **product initiatives**
2. Track and cost **services** provided by departments to business units
3. Monitor **progress** against estimates in real-time
4. Generate **reports** for executive visibility

---

## The Problem

| Challenge | Impact |
|-----------|--------|
| No visibility into true product costs | Over-commitment, budget overruns |
| Unclear ownership across departments | Delayed delivery, finger-pointing |
| Gut-feel prioritization | Wrong products get built |
| Services not tracked | Hidden resource consumption |
| No progress visibility | Surprises at delivery time |
| Hidden software/infrastructure costs | Inaccurate ROI calculations |

---

## The Solution: Product Jarvis

```
┌─────────────────────────────────────────────────────────────────────────┐
│                         PRODUCT JARVIS FLOW                              │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│   REQUESTORS                    BUILDERS                    OUTPUT       │
│   ──────────                    ────────                    ──────       │
│                                                                          │
│   ┌──────────────┐             ┌──────────────┐                         │
│   │  BUSINESS    │             │   SERVICE    │                         │
│   │   UNITS      │────────────▶│ DEPARTMENTS  │                         │
│   │              │  request    │              │                         │
│   │ Lines.com    │  products   │ Technical    │                         │
│   │ HighRoller   │     &       │ SEO          │                         │
│   │ Refills      │  services   │ Design       │                         │
│   │ Cryptocash   │             │ CRO          │                         │
│   └──────────────┘             │ Perf Mktg    │                         │
│          │                     │ Data & AI    │                         │
│          │                     └──────┬───────┘                         │
│          │                            │                                  │
│   ┌──────┴───────┐                    │                                  │
│   │   SERVICE    │                    │                                  │
│   │ DEPARTMENTS  │────────────────────┤                                  │
│   │              │  request           │                                  │
│   │ (can also    │  internal          ▼                                  │
│   │  request     │  tools or   ┌─────────────┐    ┌─────────────┐       │
│   │  products)   │  external   │  PRODUCTS   │    │  SERVICES   │       │
│   └──────────────┘  products   │             │    │             │       │
│                                │ • Internal  │    │ • Recurring │       │
│                                │ • External  │    │ • One-time  │       │
│                                └──────┬──────┘    └──────┬──────┘       │
│                                       │                  │               │
│                                       ▼                  ▼               │
│                           ┌────────────────────────────────────┐        │
│                           │         COST CALCULATOR            │        │
│                           │  ┌────────┐ ┌────────┐ ┌────────┐ │        │
│                           │  │ Labor  │ │Software│ │  Fee   │ │        │
│                           │  │ Costs  │ │ Costs  │ │Markup  │ │        │
│                           │  └────────┘ └────────┘ └────────┘ │        │
│                           │         = TOTAL OVERHEAD           │        │
│                           └────────────────┬───────────────────┘        │
│                                            │                             │
│                                            ▼                             │
│                           ┌────────────────────────────────────┐        │
│                           │         PROGRESS TRACKING          │        │
│                           │    Est. Hours vs Actual Hours      │        │
│                           │  ┌────────────────────────────┐   │        │
│                           │  │████████████░░░░░░░│ 65%    │   │        │
│                           │  └────────────────────────────┘   │        │
│                           └────────────────┬───────────────────┘        │
│                                            │                             │
│                                            ▼                             │
│                           ┌────────────────────────────────────┐        │
│                           │           ROI ANALYSIS             │        │
│                           │   ≥100% → BUILD   (Green)          │        │
│                           │   50-99% → CONSIDER (Yellow)       │        │
│                           │   0-49%  → DEFER   (Orange)        │        │
│                           │   < 0%   → KILL    (Red)           │        │
│                           └────────────────────────────────────┘        │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## Organizational Model

### Business Units (Brands) - The Requestors

| Brand | Role |
|-------|------|
| Lines.com | Requests products & services |
| HighRoller.com | Requests products & services |
| Refills.com | Requests products & services |
| Cryptocashback.com | Requests products & services |

### Service Departments - The Builders

| Department | Focus Area |
|------------|------------|
| Technical | Engineering, infrastructure, platform |
| SEO | Search optimization, content strategy |
| Performance Marketing | Paid acquisition, campaign management |
| Design | UX/UI design, branding |
| CRO | Conversion rate optimization |
| Data & Analytics | BI, data pipelines, ML/AI |

### Key Insight: Departments Can Also Request Products

Service departments aren't just builders—they can request internal tools to improve their service delivery:

| Example | Requestor | Type | Purpose |
|---------|-----------|------|---------|
| SEO Content Generator | SEO Dept | Internal | Helps SEO team serve all brands faster |
| Landing Page Builder | Technical Dept | External | B2B SaaS product to sell |

---

## Products vs Services

### Products
**One-time initiatives** that create new value.

| Type | Description | Example |
|------|-------------|---------|
| Internal | For our brands/departments | Lines.com Mobile App |
| External | To sell B2B or B2C | Affiliate Tracking Platform |

### Services
**Ongoing or recurring work** provided to business units.

| Type | Description | Example |
|------|-------------|---------|
| Recurring | Monthly/quarterly cadence | SEO Retainer for Refills.com |
| One-time | Project-based | Q1 CRO Audit for HighRoller.com |

---

## Key Features

### 1. Position-Based Costing
- Define positions with hourly rate ranges
- Assign positions to product/service tasks
- Calculate labor costs with min/max confidence ranges
- Bulk import via CSV

### 2. Software Cost Allocation
- Track all software subscriptions centrally
- Allocate % of each tool to products/services
- Roll up true infrastructure costs

### 3. Overhead & Fee Calculation
```
Overhead = Labor Costs + Software Costs
Fee = Overhead × Fee %
Total = Overhead + Fee
```

Departments can add fees when providing services to business units.

### 4. Actual Hours Tracking
- PMs update actual hours per task
- Progress indicators: Not Started, Under, On Track, Over Budget
- Visual progress bars on Calculator and Dashboard

### 5. Services Module
- Track recurring and one-time services
- Service Types belong to departments (e.g., SEO owns "Link Building", Technical owns "Ongoing Support")
- When creating a service, only that department's service types are available
- Task recurrence: Weekly, Monthly, Quarterly, Annually
- Same cost calculation as products

### 6. Reports
- Products Report: Ideation & In Development items
- Services Report: Active services
- Period filters: Last 7 days, Last 30 days
- Expandable task-level detail
- PDF export

### 7. Value Estimation

**For Internal Products:**
- Time savings, error reduction, cost avoidance
- Adoption rate adjustment, training costs
- Process standardization value

**For External Products:**
- TAM/SAM/SOM market sizing
- LTV:CAC ratio (target 3:1+)
- Customer payback period
- 3-year revenue projection

### 8. AI-Powered Tools

| Tool | Purpose |
|------|---------|
| Internal Valuation Assistant | Guides internal product valuations |
| External Valuation Assistant | Guides external product valuations |
| Product Discovery Engine | Transforms valuations into specs, flows, personas |
| Knowledge Builder | Converts content to knowledge entries |
| Expert Assistant | AI advisor with full portfolio + document context |

### 9. User Roles & Responsibilities

| Role | Responsibilities |
|------|------------------|
| **Business Unit Head** | Request products for their brand, complete initial valuation |
| **Department Head** | Request products/internal tools for their department, complete initial valuation |
| **Project Manager (PM)** | Enrich products with specs, user flow, personas; assign department RACI; track progress |
| **Leadership** | Review portfolio, make final decisions (Build/Backlog/Kill) |

### 10. Product Lifecycle Workflow

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        PRODUCT LIFECYCLE                                 │
├─────────────────────────────────────────────────────────────────────────┤
│                                                                          │
│  PHASE 1: INTAKE                    PHASE 2: ENRICHMENT                 │
│  ─────────────────                  ───────────────────                 │
│  Owner: BU/Dept Head                Owner: Project Manager              │
│                                                                          │
│  ┌──────────────────┐               ┌──────────────────┐                │
│  │ Create Product   │               │ Add Specs        │                │
│  │ via Wizard       │──────────────▶│ Add User Flow    │                │
│  │                  │               │ Add Personas     │                │
│  │ • Basic Info     │               │ Assign RACI      │                │
│  │ • Valuation      │               │ Track Progress   │                │
│  │ • Raw Output     │               │                  │                │
│  └──────────────────┘               └────────┬─────────┘                │
│                                              │                           │
│                                              ▼                           │
│                                     PHASE 3: DECISION                   │
│                                     ─────────────────                   │
│                                     Owner: Leadership                   │
│                                                                          │
│                                     ┌──────────────────┐                │
│                                     │ Review Portfolio │                │
│                                     │                  │                │
│                                     │ • Cost vs Value  │                │
│                                     │ • ROI Analysis   │                │
│                                     │ • Strategic Fit  │                │
│                                     │                  │                │
│                                     │ Decision:        │                │
│                                     │ BUILD / BACKLOG  │                │
│                                     │ / KILL           │                │
│                                     └──────────────────┘                │
│                                                                          │
└─────────────────────────────────────────────────────────────────────────┘
```

### 11. Product Creation Wizard (4 Steps)

1. **Basic Info** - Name, description, product type (Internal/External), requestor
2. **Choose Method** - Quick Estimate (~2 min) OR Full Valuation (~15 min)
3. **Valuation** - Complete either Quick calculator or Full multi-section form
4. **Raw Output** - Paste valuation output for audit trail

### 12. Product Documents

Each product can have 4 document types:
| Document | Purpose |
|----------|---------|
| Raw Valuation Output | Paste from valuation assistants (audit trail) |
| Specifications | Lean PRD with task breakdown |
| User Flow | Mermaid diagrams, journey maps |
| Persona Feedback | User personas + pre-mortem analysis |

---

## Dashboard Preview

```
┌────────────────────────────────────────────────────────────────┐
│                    PORTFOLIO DASHBOARD                          │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  Filters: [Requested By ▼] [Lead Department ▼]                 │
│                                                                 │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐            │
│  │  PRODUCTS   │  │ TOTAL COST  │  │ TOTAL VALUE │            │
│  │      5      │  │  $125,000   │  │   $450,000  │            │
│  └─────────────┘  └─────────────┘  └─────────────┘            │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ SEO Content Generator                     In Dev    │      │
│  │ Requested by: SEO Dept    Lead: Technical           │      │
│  │ Progress: ████████████████░░░░ 78%    On Track     │      │
│  │ Cost: $15K-$22K    Value: $180K    ROI: 718%       │      │
│  │                                          [BUILD]    │      │
│  └─────────────────────────────────────────────────────┘      │
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ Lines.com Mobile App Redesign             In Dev    │      │
│  │ Requested by: Lines.com   Lead: Technical           │      │
│  │ Progress: ████████░░░░░░░░░░░░ 42%    Under        │      │
│  │ Cost: $45K-$65K    Value: $450K    ROI: 592%       │      │
│  │                                          [BUILD]    │      │
│  └─────────────────────────────────────────────────────┘      │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## Reports Preview

```
┌────────────────────────────────────────────────────────────────┐
│                      PRODUCTS REPORT                            │
│                      Last 30 Days                               │
├────────────────────────────────────────────────────────────────┤
│                                                                 │
│  ┌─────────────────────────────────────────────────────┐      │
│  │ SEO Content Generator                               │      │
│  │ SEO Dept • In Development • Internal                │      │
│  ├─────────────────────────────────────────────────────┤      │
│  │ Estimated: 295 hrs    Actual: 263 hrs               │      │
│  │ Progress: ████████████████░░░░ 89%    On Track     │      │
│  │ Cost: $15,250 - $22,100                             │      │
│  │                                                      │      │
│  │ [▼ Show Tasks]                                      │      │
│  │                                                      │      │
│  │ Hours by Position:                                  │      │
│  │   Senior Developer: 180 hrs (est) / 175 hrs (act)  │      │
│  │   Product Manager: 40 hrs (est) / 38 hrs (act)     │      │
│  │   UX Designer: 30 hrs (est) / 28 hrs (act)         │      │
│  └─────────────────────────────────────────────────────┘      │
│                                                                 │
│                    [Export PDF]                                │
│                                                                 │
└────────────────────────────────────────────────────────────────┘
```

---

## Implementation Benefits

| Benefit | Before Jarvis | After Jarvis |
|---------|---------------|--------------|
| Cost visibility | Spreadsheets, guesses | Real-time calculations |
| Ownership clarity | Email chains | RACI matrix per product |
| Prioritization | Loudest voice wins | Data-driven ROI ranking |
| Progress tracking | Status meetings | Real-time dashboards |
| Service costs | Hidden | Fully tracked with fees |
| Executive reporting | Manual compilation | One-click PDF export |

---

## What's Included

### Pages & Features

| Page | Purpose |
|------|---------|
| Dashboard | Portfolio overview with filters and progress |
| Positions | Manage roles and hourly rates |
| Software | Track tool costs and allocations |
| Departments | Service departments that deliver work |
| Products | Product backlog with tasks and departments |
| Services | Services tracker with recurring tasks |
| Calculator | Full cost breakdown with progress |
| Reports | Products and Services reports with PDF export |
| Learn | Product frameworks reference |
| Assistant | AI-powered portfolio queries |
| Knowledge | Custom knowledge base for AI context |
| Tools | AI assistant setup guides |
| Settings | Demo data management |

---

## Demo Data

The system includes a "Load Demo Data" feature for presentations:

| Category | Items |
|----------|-------|
| Positions | 8 roles (PM, Developer, Designer, etc.) |
| Software | 6 tools (AWS, Figma, SEMrush, etc.) |
| Departments | 6 service departments |
| Products | 5 products (3 internal, 2 external) |
| Services | 3 services with progress |

Access via **Settings → Load Demo Data**

---

## Next Steps for Rollout

1. **Pilot Phase** (2 weeks)
   - Load existing product backlog
   - Assign department ownership
   - Begin tracking actual hours

2. **Training Phase** (1 week)
   - PM training on product/service entry
   - Department leads on RACI assignment
   - Finance on cost validation

3. **Full Rollout** (Ongoing)
   - All new products require Jarvis analysis
   - Weekly reports to leadership
   - Quarterly portfolio reviews

---

## Key Takeaways

| What | Why It Matters |
|------|----------------|
| **True cost visibility** | No more budget surprises |
| **Products AND Services** | Complete resource picture |
| **Progress tracking** | Early warning on overruns |
| **Clear RACI ownership** | Accountability at every level |
| **ROI-based prioritization** | Right products get built first |
| **Executive reports** | One-click visibility |

---

## Questions?

Contact the Product Operations team or access Product Jarvis at:
- **App**: http://localhost:5173
- **API Docs**: http://localhost:8000/docs
- **Demo**: Settings → Load Demo Data

---

*Document updated January 2026 - Version 3.0*
