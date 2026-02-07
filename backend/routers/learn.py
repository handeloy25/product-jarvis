from fastapi import APIRouter
from typing import List

router = APIRouter(prefix="/api/learn", tags=["learn"])

LESSONS = [
    {
        "id": "mvs-intro",
        "framework": "MVS",
        "title": "Minimum Viable Segment",
        "category": "fundamentals",
        "summary": "Identify who you're building for first",
        "content": """The Minimum Viable Segment (MVS) helps you focus on the smallest user segment that can sustain your product.

**Key Questions:**
- **Who is the user?** The person who actually uses the product
- **Who is the customer?** The person who pays for the product
- **Are they the same?** Alignment simplifies everything

**Why MVS Matters:**
Starting too broad dilutes your value proposition. A segment should be:
- Small enough to dominate
- Large enough to matter
- Specific enough to serve well

**Finding Your MVS:**
1. List all potential users
2. Group by common needs
3. Pick the group with the most urgent, unmet need
4. Validate you can reach them""",
        "key_takeaway": "Start narrow, dominate a segment, then expand. Don't try to please everyone from day one.",
        "example": "Slack started with tech teams, not all businesses. Stripe started with developers, not all merchants."
    },
    {
        "id": "back-matrix",
        "framework": "BACK",
        "title": "BACK Problem Matrix",
        "category": "fundamentals",
        "summary": "Prioritize problems worth solving",
        "content": """The BACK Matrix helps categorize problems by how visible and painful they are.

**Two Axes:**
- **Latent → Blatant:** Does the user know they have this problem?
- **Aspirational → Critical:** How painful is the problem?

**The Four Quadrants:**

| | Latent | Blatant |
|---|---|---|
| **Critical** | Aspirational (nice-to-have) | **Must-Have (GOLD)** |
| **Non-Critical** | Ignore | Knee-jerk (quick fix) |

**Sweet Spot:** Critical + Blatant
- User knows they have a problem
- Problem causes real pain
- They're actively seeking solutions
- Willing to pay to solve it""",
        "key_takeaway": "Chase Critical+Blatant problems. Users know they hurt, and they'll pay to stop the pain.",
        "example": "Accounting software for tax season (Critical+Blatant) vs a nicer calendar app (Aspirational+Latent)."
    },
    {
        "id": "four-us",
        "framework": "4 U's",
        "title": "The 4 U's Validation",
        "category": "fundamentals",
        "summary": "Validate problem severity with four questions",
        "content": """The 4 U's help validate if a problem is worth solving. Score each as yes or no.

**The 4 U's:**

**1. Unworkable**
Does the current situation fundamentally not work?
- Systems break down
- Critical failures occur
- Can't meet requirements

**2. Unavoidable**
Must they deal with this problem?
- Regulatory requirements
- Competitive pressure
- Industry standards

**3. Urgent**
Is there time pressure?
- Deadlines approaching
- Costs increasing
- Opportunities expiring

**4. Underserved**
Are existing solutions inadequate?
- Current tools don't work well
- No good alternatives exist
- Market gap is clear

**Scoring:**
- 4 U's = Exceptional opportunity
- 3 U's = Strong opportunity
- 2 U's = Moderate, needs validation
- 0-1 U's = Weak, reconsider""",
        "key_takeaway": "Count your U's. 3+ means you have a problem worth solving.",
        "example": "GDPR compliance was 4 U's: Unworkable (fines), Unavoidable (law), Urgent (deadline), Underserved (no easy tools)."
    },
    {
        "id": "gain-pain",
        "framework": "Gain/Pain",
        "title": "Gain/Pain Ratio",
        "category": "prioritization",
        "summary": "Quantify your value proposition strength",
        "content": """The Gain/Pain Ratio measures how much value you deliver relative to the cost.

**The Formula:**
```
Gain/Pain = Value Delivered / Cost to Customer
```

**What Counts as Gain:**
- Time saved
- Money saved
- Revenue generated
- Risk reduced
- Efficiency improved

**What Counts as Pain:**
- Price paid
- Implementation time
- Switching costs
- Learning curve
- Ongoing maintenance

**Target Ratios:**
- **10x+ ratio** = Compelling (obvious choice)
- **3-5x ratio** = Competitive (needs differentiation)
- **<3x ratio** = Weak (hard sell)

**Calculating Value:**
If your tool saves 5 hours/week at $50/hr = $250/week = $13,000/year
If it costs $1,000/year → Gain/Pain = 13x""",
        "key_takeaway": "Aim for 10x value. If you can't quantify it, you can't sell it.",
        "example": "A $500/year tool that saves $5,000 in accounting costs = 10x ratio = easy sell."
    },
    {
        "id": "rice-scoring",
        "framework": "RICE",
        "title": "RICE Prioritization",
        "category": "prioritization",
        "summary": "Prioritize features objectively with data",
        "content": """RICE helps prioritize features by combining reach, impact, confidence, and effort.

**The Formula:**
```
RICE = (Reach × Impact × Confidence) / Effort
```

**The Factors:**

**Reach (per quarter)**
How many users will this affect?
- Use actual numbers
- Example: 500 users/quarter

**Impact (0.25 to 3)**
How much will each user benefit?
- 3 = Massive impact
- 2 = High impact
- 1 = Medium impact
- 0.5 = Low impact
- 0.25 = Minimal impact

**Confidence (0.5 to 1)**
How sure are you about these estimates?
- 1.0 = High confidence (data-backed)
- 0.8 = Medium confidence
- 0.5 = Low confidence (gut feeling)

**Effort (person-weeks)**
How long will this take to build?
- Use team weeks
- Include design, dev, testing""",
        "key_takeaway": "RICE removes emotion from prioritization. Higher score = higher priority.",
        "example": "Feature A: (500×2×0.8)/4 = 200 | Feature B: (100×3×1.0)/2 = 150 → Do Feature A first."
    },
    {
        "id": "build-buy-kill",
        "framework": "Decision",
        "title": "Build / Buy / Kill / Defer",
        "category": "decision",
        "summary": "Decide what to do with a product idea",
        "content": """Use this framework to make clear decisions about product ideas.

**BUILD if:**
- Unique competitive advantage needed
- High strategic value
- No adequate external solution exists
- Team has the capability
- ROI > 100% over 12 months

**BUY if:**
- Commodity capability (not differentiating)
- Faster time to value matters
- Total cost of ownership < build cost
- Vendor is reliable and stable

**KILL if:**
- Negative or marginal ROI
- Doesn't align with strategy
- High opportunity cost
- User need isn't validated
- Better alternatives exist

**DEFER if:**
- Positive ROI but lower priority
- Dependencies aren't ready
- Resource constraints
- Need more validation data

**Decision Flow:**
1. Calculate expected ROI
2. Assess strategic alignment
3. Evaluate build vs buy costs
4. Check resource availability
5. Make the call""",
        "key_takeaway": "Default to DEFER if uncertain. Killing a bad idea early saves months of wasted effort.",
        "example": "Auth system? BUY (commodity). Core recommendation engine? BUILD (differentiator)."
    },
    {
        "id": "internal-external",
        "framework": "Fit Score",
        "title": "Internal vs External Products",
        "category": "decision",
        "summary": "Decide if a product should be internal or external",
        "content": """Not every good idea should be an external product. Use this to decide.

**Factors to Consider:**

| Factor | Internal Tool | External Product |
|--------|---------------|------------------|
| User base | Only us | Market demand |
| Revenue | None (cost center) | Direct revenue |
| Maintenance | We own it all | Shared with market |
| Advantage | Process efficiency | Market positioning |
| Docs | Minimal | Extensive |
| Support | Internal only | Customer support |

**Score Each Factor:**
+1 for internal fit
+1 for external fit

**If Tie → Default to Internal**
Internal tools are simpler:
- No customer support
- Faster iteration
- Lower risk
- Less documentation

**When to Go External:**
- Clear market demand exists
- Revenue potential is significant
- You'd use it even if you didn't build it
- Competitive advantage from market presence""",
        "key_takeaway": "When in doubt, build internal first. You can always externalize a proven internal tool.",
        "example": "Slack was an internal tool before becoming a product. GitHub started as internal version control."
    },
    {
        "id": "roi-calculation",
        "framework": "ROI",
        "title": "Calculating Product ROI",
        "category": "advanced",
        "summary": "Measure return on investment for product decisions",
        "content": """ROI (Return on Investment) quantifies whether a product is worth building.

**The Formula:**
```
ROI = ((Value - Cost) / Cost) × 100
```

**Example:**
- Development cost: $50,000
- Monthly value generated: $10,000
- 12-month value: $120,000
- ROI = (($120,000 - $50,000) / $50,000) × 100 = **140%**

**What Counts as Cost:**
- Development hours × hourly rate
- Infrastructure costs
- Opportunity cost of team time
- Maintenance and support

**What Counts as Value:**
- Revenue generated
- Costs saved
- Time saved × hourly rate
- Risk reduction (harder to quantify)

**ROI Thresholds:**
- **>100%** = Strong BUILD signal
- **50-100%** = CONSIDER carefully
- **0-50%** = Likely DEFER
- **<0%** = KILL

**Time Horizon:**
- Use 12-month projections
- Include ramp-up time
- Factor in ongoing maintenance""",
        "key_takeaway": "If you can't estimate ROI, you don't understand the value. Get data before building.",
        "example": "Tool saves 10 hrs/week × $75/hr × 52 weeks = $39,000/year value. If it costs $15,000 to build, ROI = 160%."
    },
    {
        "id": "pm-cost-calculator-guide",
        "framework": "Guide",
        "title": "Using the Cost Calculator",
        "category": "fundamentals",
        "summary": "A step-by-step guide for project managers",
        "content": """This guide walks Project Managers through using the Positions and Calculator pages.

**Step 1: Set Up Positions**

Before calculating costs, you need positions defined:
1. Go to **Positions** page
2. Click **Add Position**
3. Enter position details:
   - **Title**: Job title (e.g., "Senior Developer", "Junior Designer")
   - **Department**: Which team this role belongs to
   - **Hourly Rate Range**: Min and max hourly cost

**Why Ranges?**
Using ranges instead of exact rates:
- Accounts for salary variations within a role
- Gives realistic cost estimates (low/high)
- Helps with budgeting scenarios

**Step 2: Create Your Product**

On the **Products** page:
1. Click **Add Product**
2. Fill in:
   - **Business Unit**: Which team/brand owns this (SEO, Marketing, Lines.com, etc.)
   - **Name**: Product/project name
   - **Description**: What it does
   - **Status**: Draft → Ideation → Approved/Backlog/Kill → In Development → Live → Deprecated
   - **Type**: Internal (employee tools) or External (customer-facing)
   - **Estimated Value**: Expected monthly value in dollars

**Step 3: Add Tasks in Calculator**

Go to **Calculator**, select your product, then:
1. Click **Add Task**
2. Enter task details:
   - **Task Name**: Specific work item (e.g., "Backend API Development")
   - **Position**: Which position will do this work
   - **Hours**: Estimated hours to complete

**Step 4: Add Software Costs**

If your project uses paid software:
1. In Calculator, scroll to **Software Costs**
2. Click **Add Software**
3. Enter allocation percentage (if software is shared across projects)

**Step 5: Review Results**

The calculator shows:
- **Labor Cost Range**: Total (Min - Max) based on position rates
- **Software Cost**: Monthly allocated software expenses
- **Total Cost Range**: Labor + Software
- **ROI Range**: Return on investment estimates
- **Recommendation**: BUILD / CONSIDER / DEFER / KILL

**Tips for Accurate Estimates:**
- Be realistic with hour estimates (developers often underestimate)
- Include all phases: design, development, testing, deployment
- Factor in meetings, code reviews, and documentation time
- Update actuals as work progresses""",
        "key_takeaway": "Good estimates come from breaking work into small tasks and using realistic position rate ranges.",
        "example": "A 3-week feature might be: Design (20hrs Junior), Backend (40hrs Senior), Frontend (30hrs Mid), QA (15hrs Junior) = 105 total hours."
    }
]

@router.get("")
def get_all_lessons():
    return {
        "success": True,
        "data": LESSONS,
        "error": None
    }

@router.get("/categories")
def get_categories():
    categories = {
        "fundamentals": {"name": "Fundamentals", "description": "Core frameworks for understanding problems", "count": 0},
        "prioritization": {"name": "Prioritization", "description": "How to rank and order work", "count": 0},
        "decision": {"name": "Decision Making", "description": "Build, buy, or kill frameworks", "count": 0},
        "advanced": {"name": "Advanced", "description": "Deep dives and calculations", "count": 0}
    }
    for lesson in LESSONS:
        categories[lesson["category"]]["count"] += 1
    return {
        "success": True,
        "data": categories,
        "error": None
    }

@router.get("/{lesson_id}")
def get_lesson(lesson_id: str):
    for lesson in LESSONS:
        if lesson["id"] == lesson_id:
            return {"success": True, "data": lesson, "error": None}
    return {"success": False, "data": None, "error": "Lesson not found"}

@router.get("/framework/{framework}")
def get_lessons_by_framework(framework: str):
    matches = [l for l in LESSONS if l["framework"].lower() == framework.lower()]
    return {"success": True, "data": matches, "error": None}
