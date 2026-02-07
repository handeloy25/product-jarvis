# Expert Review Board - Setup & Reference

This document provides reference information for the Expert Review Board feature and a template for running expert evaluations.

> **Installation:** Use `CLAUDE_CODE_PROMPT.md` to integrate this feature into Product Jarvis via Claude Code.

---

## Your Expert Board

| Expert | Specialty |
|--------|-----------|
| 🔵 Dr. Alex Chen | PhD Software Architect - code, architecture, scalability |
| 🟢 Jordan Martinez | Fortune 500 DevOps Director - infrastructure, deployment |
| 🟣 Sarah Kim | World-Class CPO - product strategy, prioritization |
| 🟠 Marcus Thompson | Elite Project Manager - timelines, resources, risk |
| 🩷 Elena Rodriguez | Top UI/UX Expert - user experience, design |
| 🔷 David Park | Head of Data & Analytics - data models, metrics |

## Quick Commands

```
"Alex, review the architecture"
"Sarah, should we build this?"
"Marcus, is this timeline realistic?"
"Full board review"
```

## After Installation

1. **Test the integration** - Visit `/expert-review` and verify personas load
2. **Run your first review** - Use the Full Board Review on current state
3. **Document the baseline** - Save the initial assessment for comparison

---

# Prompt for Your Planned Enhancements

Once the Expert Review system is installed, use this prompt to have the experts evaluate your proposed changes:

---

## Expert Evaluation Request: Product Jarvis Enhancements

**Review Type:** Full Board Review  
**Scope:** Proposed Changes

**Proposed Enhancements:**

### 1. Overhead & Fees Integration
- Add overhead costs calculation to Product Jarvis
- Include fees in total cost calculations
- Update ROI formulas to account for overhead

### 2. Actual Hours Tracking
- Add "Current Hours" field to tasks
- Allow manual updates by project managers (MVP1)
- Show variance: Estimated vs. Actual
- Dashboard indicators: on-target, over-budget, etc.
- Product page progress tracking per position and overall
- Future MVP2: Connect to project management tool for automatic updates

### 3. Service Tracking (New Module)
- Service departments also perform recurring services for business units
- Examples: SEO content creation, link building for Lines.com
- Services have position costs and software allocation (like products)
- New dashboard view: Products vs. Services
- Separate tracking from one-time product builds

### 4. Reports Function
- Monthly reports for Products
- Monthly reports for Services
- Show: targets, progress, variance
- High-level summary with drill-down capability
- Export functionality

### 5. Documentation Updates Required
- Executive deck
- Working reference
- README
- About page
- Assistant setup prompts
- All dependencies and cross-references

**Questions for the Board:**

1. What's the right architecture for adding Services alongside Products?
2. Is the data model flexible enough for these additions?
3. What's a realistic timeline for this scope?
4. What UX considerations for the new dashboards?
5. What risks are we not seeing?
6. What should be deferred to MVP2?

**Current State Context:**
[Paste your CHECKPOINT.md here]

---

*After running this evaluation, create tickets for the prioritized recommendations before starting implementation.*
