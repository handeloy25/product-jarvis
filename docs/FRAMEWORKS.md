# Product Evaluation Frameworks

Quick reference cards for the frameworks used in product evaluation decisions.

---

## 1. MVS (Minimum Viable Segment)

**Purpose:** Identify who you're building for first.

| Question | Answer |
|----------|--------|
| **Who is the user?** | The person who uses the product |
| **Who is the customer?** | The person who pays for the product |
| **Are they the same?** | Simplifies alignment if yes |

**Key Insight:** Start with a segment small enough to dominate, but large enough to matter.

---

## 2. BACK Matrix

**Purpose:** Prioritize problems worth solving.

```
                    LATENT ←────────────────→ BLATANT
                    (User doesn't know)        (User knows)
    ┌─────────────────────────────────────────────────────┐
    │                    │                                │
C   │    ASPIRATIONAL    │         CRITICAL              │
R   │    Nice-to-have    │     Obvious Must-Have         │
I   │    Low priority    │      Highest priority         │
T   │                    │                                │
I   ├────────────────────┼────────────────────────────────┤
C   │                    │                                │
A   │    LOW PRIORITY    │        KNEE-JERK              │
L   │    Ignore these    │    Quick fixes, low value     │
    │                    │                                │
    └─────────────────────────────────────────────────────┘
```

**Sweet Spot:** Critical + Blatant = Obvious Must-Have

---

## 3. The 4 U's

**Purpose:** Validate problem severity.

| U | Question | Scoring |
|---|----------|---------|
| **Unworkable** | Does the current situation fundamentally not work? | If yes → Strong signal |
| **Unavoidable** | Must they deal with this? (Regulatory, competitive) | If yes → Captive market |
| **Urgent** | Is there time pressure to solve this? | If yes → Faster sales |
| **Underserved** | Are existing solutions inadequate? | If yes → Market opportunity |

**Scoring:** More U's = Stronger opportunity

---

## 4. Gain/Pain Ratio

**Purpose:** Quantify value proposition strength.

```
Gain/Pain Ratio = Value Delivered / Cost to Customer
```

**Targets:**
- **10x ratio** = Compelling (clear winner)
- **3-5x ratio** = Competitive (needs differentiation)
- **<3x ratio** = Weak (reconsider)

**Components:**
- **Gain:** Time saved, money saved, revenue generated, risk reduced
- **Pain:** Price, implementation time, switching costs, learning curve

---

## 5. RICE Scoring

**Purpose:** Prioritize features objectively.

```
RICE Score = (Reach × Impact × Confidence) / Effort
```

| Factor | Definition | Scale |
|--------|------------|-------|
| **Reach** | How many users affected per quarter | Actual number |
| **Impact** | How much it affects each user | 0.25 (minimal) to 3 (massive) |
| **Confidence** | How sure are we about estimates | 0.5 (low) to 1 (high) |
| **Effort** | Person-weeks to implement | Actual estimate |

**Example:**
- Reach: 500 users
- Impact: 2 (high)
- Confidence: 0.8
- Effort: 4 weeks
- **RICE = (500 × 2 × 0.8) / 4 = 200**

---

## 6. Build / Buy / Kill / Defer Decision Matrix

**Purpose:** Decide what to do with a product idea.

### BUILD if:
- Unique competitive advantage needed
- High strategic value
- No adequate external solution
- Team has capability
- ROI > 10x over 12 months

### BUY if:
- Commodity capability
- Faster time to value
- Total cost of ownership < build cost
- Vendor reliability is high

### KILL if:
- Negative or marginal ROI
- Doesn't align with strategy
- High opportunity cost
- User need isn't validated

### DEFER if:
- Positive ROI but lower priority
- Dependencies not ready
- Resource constraints
- Need more validation data

---

## 7. Internal vs. External Fit Score

**Purpose:** Decide if a product should be internal tooling or external SaaS.

| Factor | Internal Tool | External Product |
|--------|---------------|------------------|
| **User base** | Only us | Market demand |
| **Revenue potential** | None (cost center) | Direct revenue |
| **Maintenance burden** | We own it | Shared with market |
| **Competitive advantage** | Process efficiency | Market positioning |
| **Documentation needs** | Minimal | Extensive |
| **Support requirements** | Internal only | External customers |

**Scoring:**
- Count factors favoring each
- If tie → Default to internal (simpler)

---

## Quick Decision Flowchart

```
START
  │
  ▼
Is the problem CRITICAL + BLATANT? ──No──→ DEFER or KILL
  │
  Yes
  ▼
Does it have 3+ of the 4 U's? ──No──→ DEFER
  │
  Yes
  ▼
Is Gain/Pain ratio > 10x? ──No──→ Consider BUY or DEFER
  │
  Yes
  ▼
Can we BUILD it faster than BUY? ──No──→ BUY
  │
  Yes
  ▼
Is it for internal use only? ──Yes──→ BUILD (Internal Tool)
  │
  No
  ▼
BUILD (External Product)
```

---

## Framework Application Template

When evaluating a new product idea:

1. **MVS:** Who exactly is this for?
2. **BACK:** Where does this problem sit in the matrix?
3. **4 U's:** Score each U (yes/no)
4. **Gain/Pain:** Calculate the ratio
5. **RICE:** Score against other priorities
6. **Decision:** Build / Buy / Kill / Defer
7. **Type:** Internal tool or external product?
