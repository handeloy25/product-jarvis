# Sprint: Product Value Estimation System

**Created:** 2025-12-18  
**Status:** Awaiting Approval  
**Priority:** MVP Blocker

---

## Overview

Replace the simple `estimated_value` field with a robust, data-driven valuation system using the **Hybrid Value Framework (HVF)** - combining Economic Value Drivers, Strategic Assessment, and Confidence-Weighted estimates.

---

## User Input Fields by Product Type

### Universal Fields (All Product Types)

| Field | Type | Description for User |
|-------|------|---------------------|
| **Product Type** | Select | Is this an Internal tool (for employees), External product (for customers), or Both? |
| **Valuation Date** | Date | When is this estimate being made? Used for historical tracking. |
| **Confidence Level** | Select | How confident are you in these estimates? High (data-backed), Medium (reasonable assumptions), Low (early guesses), Speculative (gut feel) |
| **Confidence Notes** | Text | What data or assumptions is this estimate based on? What would increase your confidence? |

---

### Internal Product Inputs

#### Time Savings Driver

| Field | Type | Description for User |
|-------|------|---------------------|
| `hours_saved_per_user_per_week` | Number | How many hours per week will each user save by using this product? Think about manual tasks eliminated or streamlined. |
| `number_of_affected_users` | Number | How many employees will use this product regularly? |
| `average_hourly_cost` | Currency | What's the average fully-loaded hourly cost of these users? (Salary + benefits + overhead, typically 1.3-1.5x base hourly rate) |

#### Error Reduction Driver

| Field | Type | Description for User |
|-------|------|---------------------|
| `current_errors_per_month` | Number | How many errors/mistakes occur monthly in the process this product addresses? |
| `cost_per_error` | Currency | What's the average cost to fix each error? Include rework time, customer impact, compliance issues. |
| `expected_error_reduction_percent` | Percent | What percentage of these errors will this product eliminate? Be realistic - 100% is rarely achievable. |

#### Cost Avoidance Driver

| Field | Type | Description for User |
|-------|------|---------------------|
| `alternative_solution_cost` | Currency | If you didn't build this, what would you pay for an alternative? (Vendor software, outsourcing, contractors) |
| `alternative_solution_period` | Select | Is that cost Monthly, Annually, or One-time? |

#### Risk Mitigation Driver

| Field | Type | Description for User |
|-------|------|---------------------|
| `risk_description` | Text | What risk does this product mitigate? (Security breach, compliance failure, system outage, etc.) |
| `risk_probability_percent` | Percent | Without this product, what's the annual probability this risk occurs? |
| `risk_cost_if_occurs` | Currency | If this risk happens, what's the estimated cost? (Fines, lost revenue, remediation) |
| `risk_reduction_percent` | Percent | How much does this product reduce the probability or impact of this risk? |

---

### External Product Inputs

#### Market Sizing (Bottom-Up)

| Field | Type | Description for User |
|-------|------|---------------------|
| `target_customer_segment` | Text | Who is your ideal customer? Be specific (e.g., "Mid-size e-commerce companies with 10-100 employees") |
| `total_potential_customers` | Number | How many companies/people fit your target segment? This is your TAM in customer count. |
| `serviceable_percent` | Percent | What percentage can you realistically reach given your geography, channels, and capabilities? This gives your SAM. |
| `achievable_market_share_percent` | Percent | Of your SAM, what market share can you realistically capture in 3 years given competition? This is your SOM. Be conservative - most startups capture <5% of SAM. |

#### Revenue Projection

| Field | Type | Description for User |
|-------|------|---------------------|
| `price_per_unit` | Currency | What will you charge per unit/user/month? |
| `pricing_model` | Select | One-time purchase, Monthly subscription, Annual subscription, Usage-based, or Per-seat |
| `average_deal_size` | Currency | For B2B: What's the expected average contract value? For B2C: What's the average customer spend? |
| `sales_cycle_months` | Number | How long from first contact to closed deal? |
| `conversion_rate_percent` | Percent | Of qualified leads, what percentage become paying customers? Industry average is 2-5% for cold, 20-30% for warm leads. |

#### Customer Economics

| Field | Type | Description for User |
|-------|------|---------------------|
| `gross_margin_percent` | Percent | Revenue minus direct costs (hosting, support, COGS). SaaS typically 70-85%. |
| `expected_customer_lifetime_months` | Number | How long will the average customer stay? Calculate as: 1 / monthly churn rate. |
| `customer_acquisition_cost` | Currency | How much will you spend to acquire one customer? (Marketing + sales costs / new customers) |

#### Competitive Reference

| Field | Type | Description for User |
|-------|------|---------------------|
| `competitor_name` | Text | Who is your closest competitor or alternative solution? |
| `competitor_pricing` | Currency | What do they charge for a comparable offering? |
| `differentiation_summary` | Text | Why would customers choose you over them? |

---

### "Both" Product Type Inputs

Uses relevant fields from both Internal and External, plus:

| Field | Type | Description for User |
|-------|------|---------------------|
| `internal_value_weight` | Percent | What percentage of this product's value comes from internal efficiency vs. external revenue? (Must sum to 100% with external) |
| `external_value_weight` | Percent | What percentage comes from external/customer-facing value? |

---

### Strategic Assessment (All Types)

| Field | Type | Description for User |
|-------|------|---------------------|
| `reach_score` | 1-5 | **Reach**: How many people are affected? 1=Few individuals, 3=One department/segment, 5=Entire company or large market |
| `impact_score` | 0.25-3 | **Impact**: How significant is the improvement? 0.25=Minimal, 0.5=Low, 1=Medium, 2=High, 3=Massive/Transformative |
| `strategic_alignment_score` | 1-5 | **Strategic Alignment**: How core is this to company strategy? 1=Nice-to-have, 3=Supports key initiative, 5=Critical to strategy |
| `differentiation_score` | 1-5 | **Differentiation**: Does this create competitive advantage? 1=Commodity/everyone has it, 3=Somewhat unique, 5=True differentiator |
| `urgency_score` | 1-5 | **Urgency/Risk of Inaction**: What's the cost of not doing this? 1=No rush, 3=Should do this year, 5=Critical/blocking other work |

---

## Calculated Outputs

| Output | Formula | Display |
|--------|---------|---------|
| **Annual Time Savings Value** | `hours × users × rate × 52` | Currency |
| **Annual Error Reduction Value** | `errors × 12 × cost × reduction%` | Currency |
| **Annual Cost Avoidance Value** | `alternative_cost × (12 if monthly, 1 if annual)` | Currency |
| **Annual Risk Mitigation Value** | `probability% × cost × reduction%` | Currency |
| **Total Economic Value (Internal)** | Sum of above drivers | Currency |
| **3-Year Revenue Projection (External)** | `SOM_customers × avg_deal × 3 years` | Currency |
| **Customer LTV** | `avg_deal × margin% × lifetime_months/12` | Currency |
| **Strategic Multiplier** | Weighted average of scores → 0.5x to 2.0x | Multiplier |
| **Confidence Range** | Based on confidence level selection | Low/High % |
| **Final Value Range** | `Economic Value × Strategic Multiplier × Confidence Range` | Currency Range |
| **RICE Score** | `(Reach × Impact × Confidence%) / Effort` | Number |

---

## Confidence Level Ranges

| Confidence Level | Definition | Multiplier Range |
|------------------|------------|------------------|
| **High (80-100%)** | Data-backed, validated assumptions | 0.9x - 1.1x |
| **Medium (50-79%)** | Reasonable estimates, some data | 0.6x - 1.0x |
| **Low (20-49%)** | Early stage, mostly assumptions | 0.3x - 0.7x |
| **Speculative (<20%)** | Gut feel, no validation | 0.1x - 0.4x |

---

## Implementation Plan

### Phase 1: Database & API (Backend)

| Task | Description |
|------|-------------|
| 1.1 | Create `product_valuations` table with all input fields + calculated outputs |
| 1.2 | Create `valuation_history` table for tracking changes over time |
| 1.3 | Add valuation calculation service with formulas |
| 1.4 | Create CRUD endpoints for valuations |
| 1.5 | Add endpoint to get valuation history for a product |
| 1.6 | Add portfolio comparison endpoint (all products' valuations) |

### Phase 2: Valuation Wizard UI (Frontend)

| Task | Description |
|------|-------------|
| 2.1 | Create multi-step wizard component |
| 2.2 | Step 1: Product type selection + basic info |
| 2.3 | Step 2: Value driver inputs (dynamic based on type) |
| 2.4 | Step 3: Strategic assessment questionnaire |
| 2.5 | Step 4: Confidence rating + notes |
| 2.6 | Step 5: Results summary with calculated values |
| 2.7 | Add inline help tooltips with field descriptions |

### Phase 3: Valuation Dashboard (Frontend)

| Task | Description |
|------|-------------|
| 3.1 | Product valuation detail view with breakdown chart |
| 3.2 | Portfolio comparison view (table + chart) |
| 3.3 | Historical tracking chart per product |
| 3.4 | Export valuation report (PDF/CSV) |

### Phase 4: AI Assistant Integration

| Task | Description |
|------|-------------|
| 4.1 | Add valuation data to assistant context |
| 4.2 | Create conversational valuation flow ("Help me value this product") |
| 4.3 | Add valuation-specific suggested questions |
| 4.4 | Enable AI to critique/challenge valuation assumptions |

### Phase 5: Quick Estimate Mode (Hybrid)

| Task | Description |
|------|-------------|
| 5.1 | Create simplified "Quick Estimate" form (5-6 key fields) |
| 5.2 | Add "Expand to Full Valuation" option |
| 5.3 | Auto-suggest values based on product type templates |

---

## Estimated Effort

| Phase | Complexity | Estimate |
|-------|------------|----------|
| Phase 1 | Medium | 3-4 hours |
| Phase 2 | High | 4-5 hours |
| Phase 3 | Medium | 2-3 hours |
| Phase 4 | Medium | 2-3 hours |
| Phase 5 | Low | 1-2 hours |
| **Total** | | **12-17 hours** |

---

## Recommended MVP Implementation Order

1. **Phase 1** (Backend) - Required foundation
2. **Phase 2** (Wizard) - Core user experience
3. **Phase 5** (Quick Mode) - Hybrid approach
4. **Phase 3** (Dashboard) - Portfolio comparison
5. **Phase 4** (AI) - Enhancement

---

## Research References

- **Marty Cagan (SVPG)** - Four Big Risks framework (Value, Usability, Feasibility, Viability)
- **LeveragePoint** - Economic Value Estimation (EVE) methodology
- **Intercom** - RICE scoring framework
- **SaaS Capital** - Valuation multiples and ARR-based models
- **Antler/HubSpot** - TAM/SAM/SOM best practices

---

## Approval Status

- [ ] Plan reviewed by stakeholder
- [ ] Implementation approved
- [ ] Ready to begin development
