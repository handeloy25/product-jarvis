# Expert Review Quick Reference Card

## Your Expert Advisory Board

| Expert | Domain | Call When... |
|--------|--------|--------------|
| 🔵 **Dr. Alex Chen** | Architecture & Code | Major technical decisions, tech debt concerns, scalability questions |
| 🟢 **Jordan Martinez** | DevOps & Infrastructure | Deployment prep, security review, infrastructure changes |
| 🟣 **Sarah Kim** | Product Strategy | Feature prioritization, scope questions, ROI validation |
| 🟠 **Marcus Thompson** | Project Management | Timeline reality checks, resource planning, risk assessment |
| 🩷 **Elena Rodriguez** | UI/UX Design | User flow review, accessibility audit, design consistency |
| 🔷 **David Park** | Data & Analytics | Data model review, metrics design, reporting architecture |

---

## Quick Commands

### Single Expert Reviews
```
"Alex, review the architecture"
"Sarah, should we build this feature?"
"Marcus, is this timeline realistic?"
"Elena, audit the dashboard UX"
"Jordan, check our deployment readiness"
"David, is the data model right for reporting?"
```

### Multi-Expert Reviews
```
"Full board review of current state"
"Pre-release review" (Jordan + Marcus + Elena)
"Technical review" (Alex + Jordan + David)
"Product review" (Sarah + Elena + Marcus)
```

---

## Review Scopes

| Scope | Use For |
|-------|---------|
| **Current State** | "How are we doing right now?" |
| **Proposed Changes** | "Is this plan feasible?" |
| **Documentation** | "Are our docs complete?" |
| **Specific Feature** | "Review just this feature" |
| **Full Codebase** | "Comprehensive audit" |

---

## What to Include in Context

### For Architecture Reviews (Alex)
- Current tech stack
- Data flow diagrams
- Problem areas
- Scaling concerns

### For Product Reviews (Sarah)
- Feature description
- User problem being solved
- ROI estimates
- Alternatives considered

### For Timeline Reviews (Marcus)
- Task breakdown
- Resource availability
- Dependencies
- Known risks

### For UX Reviews (Elena)
- User flows
- Screenshots
- User feedback
- Accessibility requirements

### For DevOps Reviews (Jordan)
- Deployment process
- Infrastructure diagram
- Monitoring setup
- Security concerns

### For Data Reviews (David)
- Data model/ERD
- Key metrics needed
- Reporting requirements
- Data sources

---

## Output You'll Get

### Single Expert
```
## [Expert] Assessment
### Overall Grade: A/B/C/D/F
### Strengths
### Critical Issues
### Recommendations (prioritized)
### Questions for Team
### Dependencies & Impacts
```

### Full Board
```
## Executive Summary
## Consensus View
## Individual Assessments (each expert)
## Prioritized Action Items
## Open Questions
## Suggested Next Review
```

---

## When to Trigger Reviews

| Milestone | Recommended Review |
|-----------|-------------------|
| Sprint planning | Marcus (timeline) |
| Before major feature | Sarah (strategy) + Alex (architecture) |
| Before UI release | Elena (UX audit) |
| Before production deploy | Full pre-release review |
| Monthly check-in | Full board review |
| After adding data models | David (data review) |
| Security concern | Jordan (security audit) |

---

## Tips for Best Results

1. **Be specific** - "Review the cost calculation module" > "Review the code"
2. **Include context** - Paste CHECKPOINT.md or relevant docs
3. **Ask specific questions** - Add targeted questions for focused feedback
4. **Start narrow** - Single expert first, expand if needed
5. **Act on feedback** - Create tickets from recommendations
6. **Track over time** - Compare grades across reviews

---

## Integration with Your Workflow

### Before Your Planned Enhancements
Run this sequence:
1. **Sarah Kim** - Validate the product value of overhead, services, and reports features
2. **Alex Chen** - Architecture review of how these changes affect the data model
3. **David Park** - Data model review for new tracking requirements
4. **Marcus Thompson** - Timeline reality check for the full scope

### After Implementation
1. **Elena Rodriguez** - UX audit of new interfaces
2. **Jordan Martinez** - Deployment and performance review
3. **Full Board** - Comprehensive pre-release review
