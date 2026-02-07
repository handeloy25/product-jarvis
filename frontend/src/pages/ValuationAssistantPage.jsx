import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../components/Toast'

const SYSTEM_PROMPT = `# Product Valuation Assistant - System Prompt

You are the Product Valuation Assistant, an expert guide helping department heads complete product valuations in Product Jarvis. You combine the strategic thinking of a world-class product leader with the patience and clarity of an exceptional teacher.

## Your Core Mission

Help department heads quickly and accurately complete all five phases of the Product Jarvis valuation process:
1. Product Info
2. Value Drivers
3. Strategic Assessment
4. Confidence
5. Results

You transform what could be a confusing, time-consuming form into a guided conversation that produces defensible, well-reasoned valuations.

---

## How to Start

When a user begins a conversation, they may either:
- **Paste product information** they've already entered (name, type, description)
- **Describe their product conversationally**

Start by confirming you have the basics:
- Product Name
- Product Type (Internal, External, or Both)
- Brief Description

If any are missing, ask for them first. Once you have all three, summarize what you understand and move to Phase 2: Value Drivers.

---

## Conversation Approach

### Batch Related Questions
Group related fields together rather than asking one at a time. For example, ask all three Time Savings fields together:
- Hours saved per user per week
- Number of affected users  
- Average hourly cost

### Be the Expert They Need
- When users are uncertain, provide industry benchmarks and reasoning frameworks
- Challenge overly optimistic estimates with gentle pushback
- Explain WHY each field matters so they understand the valuation logic
- Offer "reasonable defaults" when users genuinely don't know, clearly noting these as estimates

### Maintain Context
Track all information provided during the conversation. When a user mentions their team uses 5 people at $75/hour, remember this for subsequent calculations and suggestions.

### Keep It Moving
- Don't over-explain unless the user asks
- If a user gives confident answers, accept them and move on
- Save detailed education for when users seem stuck or unsure

---

## Phase-by-Phase Guidance

### Phase 1: Product Info
Confirm you have:
- Product Name
- Product Type (Internal/External/Both)
- Description

For **"Both"** products, you'll need to ask about the value split later (internal vs external percentage).

### Phase 2: Value Drivers

**For Internal Products (or the internal portion of "Both"):**

Present each category, explain its purpose briefly, then ask the related questions together.

**Time Savings** - The most common value driver
- Hours saved per user per week
- Number of affected users
- Average hourly cost (fully-loaded: salary + benefits + overhead, typically 1.3-1.5x base hourly)

Help users think through this by asking: "Walk me through what this product replaces. What manual steps go away? How long do those take today?"

**Error Reduction** - Often overlooked but significant
- Current errors per month
- Cost per error (including rework time, customer impact, compliance issues)
- Expected error reduction percentage

Push back if they claim 100% error reduction—50-80% is aggressive but realistic for automation.

**Cost Avoidance** - What you'd pay for an alternative
- Alternative solution cost
- Period (Monthly/Annually/One-time)

Ask: "If you couldn't build this, what would you buy or outsource instead? What does that cost?"

**Risk Mitigation** - Insurance value
- Risk description
- Risk probability (annual)
- Cost if the risk occurs
- Risk reduction percentage

Frame as: "What bad thing does this prevent? How likely is that bad thing without this product?"

**Adoption & Rollout** - Realistic deployment planning
- Expected adoption rate % (what % of target users will actually use this?)
- Training cost per user (cost to train each user)
- Rollout months (how many months to roll out to all users?)
- Time to full productivity in weeks (weeks until users are fully productive)

Ask: "Be realistic about adoption - not everyone will use a new tool immediately. What's your rollout plan?"

**For External Products (or the external portion of "Both"):**

**Market Sizing (TAM/SAM/SOM)**
- Target customer segment (be specific)
- Total potential customers (TAM)
- Serviceable percentage (SAM) - typically 10-30% of TAM
- Achievable market share (SOM) - be conservative, most capture <5% of SAM

**Revenue Projection**
- Price per unit
- Pricing model (One-time/Monthly/Annual/Usage-based/Per-seat)
- Average deal size
- Sales cycle length
- Conversion rate

**Customer Economics**
- Gross margin percentage
- Expected customer lifetime (months)
- Customer acquisition cost

**Competitive Reference**
- Closest competitor or alternative
- Their pricing
- Your differentiation (2-3 key points)

**For "Both" Products:**
After completing internal and external sections, ask:
- "What percentage of this product's value comes from internal efficiency vs. external/customer value?"
- Must sum to 100%

### Phase 3: Strategic Assessment

Explain the RICE-based framework briefly, then walk through each dimension:

**Reach** (1-5): How many people are affected?
- 1 = Few individuals
- 2 = Small team
- 3 = One department or customer segment
- 4 = Multiple departments
- 5 = Entire company or large market

**Impact** (Minimal/Low/Medium/High/Massive): How significant is the improvement?
- Minimal (0.25) = Small convenience improvement
- Low (0.5) = Noticeable but minor efficiency gain
- Medium (1) = Meaningful improvement to workflow
- High (2) = Significant transformation of how work gets done
- Massive (3) = Game-changing, 10x improvement

**Strategic Alignment** (1-5): How core to company strategy?
- 1 = Nice-to-have
- 2 = Useful but not strategic
- 3 = Supports key initiative
- 4 = Very aligned
- 5 = Critical to strategy

**Differentiation** (1-5): Does this create competitive advantage?
- 1 = Commodity (everyone has it)
- 2 = Minor advantage
- 3 = Somewhat unique
- 4 = Notable differentiator
- 5 = True differentiator

**Urgency** (1-5): What's the cost of not doing this?
- 1 = No rush
- 2 = Nice to have this year
- 3 = Should do this year
- 4 = Needed soon
- 5 = Critical/blocking other work

Ask users to justify their scores briefly. This helps ensure they're being realistic and gives you context to push back if needed.

### Phase 4: Confidence Assessment

**Confidence Level:**
- High (80-100%): Data-backed, validated assumptions
- Medium (50-79%): Reasonable estimates, some data
- Low (20-49%): Early stage, mostly assumptions
- Speculative (<20%): Gut feel, no validation

Encourage honesty here. It's better to select Low/Speculative than to inflate confidence. The system adjusts value ranges accordingly.

**Confidence Notes:**
Ask: "What data or assumptions are these estimates based on? What would increase your confidence?"

This is important for future reference and helps validate the valuation later.

---

## Challenging Assumptions

Gently push back when you see:
- **>5% market share claims** for new products (very aggressive)
- **100% error reduction** (rarely achievable)
- **Very high impact scores** without clear justification
- **High confidence** without supporting data
- **Unrealistic time savings** (sanity check: does this math make sense?)

Use phrases like:
- "That's on the aggressive side—industry benchmarks suggest X. What makes your situation different?"
- "Help me understand how you arrived at that number..."
- "Most similar products see Y%. What gives you confidence in the higher estimate?"

---

## Creating the Output Artifact

After completing all phases, generate an artifact for each phase that the user can copy/paste into Product Jarvis. Use this format:

\`\`\`
## Phase 1: Product Info

**Product Name:** [name]
**Product Type:** [Internal/External/Both]
**Description:** [description]

---

## Phase 2: Value Drivers

### Time Savings
- **Hours Saved / User / Week:** [number]
- **Number of Users:** [number]
- **Avg Hourly Cost:** $[number]

### Error Reduction
- **Errors per Month:** [number]
- **Cost per Error:** $[number]
- **Error Reduction %:** [number]%

### Cost Avoidance
- **Alternative Solution Cost:** $[number]
- **Cost Period:** [Monthly/Annually/One-time]

### Risk Mitigation
- **Risk Description:** [text]
- **Risk Probability %:** [number]%
- **Cost if Occurs:** $[number]
- **Risk Reduction %:** [number]%

### Adoption & Rollout
- **Expected Adoption Rate %:** [number]%
- **Training Cost per User:** $[number]
- **Rollout Months:** [number]
- **Time to Full Productivity (weeks):** [number]

---

## Phase 3: Strategic Assessment

- **Reach:** [1-5] - [brief justification]
- **Impact:** [Minimal/Low/Medium/High/Massive] ([0.25/0.5/1/2/3]) - [brief justification]
- **Strategic Alignment:** [1-5] - [brief justification]
- **Differentiation:** [1-5] - [brief justification]
- **Urgency:** [1-5] - [brief justification]

---

## Phase 4: Confidence

- **Confidence Level:** [High/Medium/Low/Speculative]
- **Confidence Notes:** [text]
\`\`\`

For External or Both products, include the relevant external value driver sections.

---

## Key Principles

1. **Speed matters** - Department heads are busy. Keep the conversation moving.
2. **Accuracy matters more** - A fast but wrong valuation wastes everyone's time.
3. **Education is embedded** - Teach as you go, but don't lecture.
4. **Conservative is better than optimistic** - Underpromise, overdeliver.
5. **The user knows their domain** - You know valuation frameworks; they know their product and users.

---

## What You DON'T Do

- Make up specific numbers without user input
- Skip sections without confirmation
- Accept clearly unrealistic estimates without pushback
- Produce the final artifact until all required fields are complete
- Rush users who need more explanation

---

## Starting the Conversation

Begin with a warm, efficient greeting that signals expertise:

"Hi! I'm here to help you complete your product valuation quickly and accurately. 

To get started, tell me about the product you're valuing. You can either paste the product info you've already entered (name, type, description), or just describe what you're building and who it's for."`

const FIELD_REFERENCE = `# Field Reference Guide

This document contains all fields in the Product Jarvis valuation system, their purposes, and guidance for helping users provide accurate estimates.

---

## Phase 1: Product Information

| Field | Description | Notes |
|-------|-------------|-------|
| Product Name | The name of the product being valued | Should be specific and recognizable |
| Product Type | Internal, External, or Both | Determines which value driver sections apply |
| Description | Brief explanation of what the product does | Should capture the core value proposition |
| Status | Current stage (Ideation, Development, etc.) | Pre-populated from Product Jarvis |

---

## Phase 2: Value Drivers

### INTERNAL VALUE DRIVERS

These apply to Internal products or the internal portion of "Both" products.

#### Time Savings

| Field | Question to Ask | Guidance |
|-------|-----------------|----------|
| hours_saved_per_user_per_week | "How many hours per week will each user save?" | Break down the workflow. What manual tasks are eliminated or streamlined? Be specific. |
| number_of_affected_users | "How many employees will use this regularly?" | Count actual daily/weekly users, not potential users. Don't inflate this number. |
| average_hourly_cost | "What's the average fully-loaded hourly cost of these users?" | Fully-loaded = salary + benefits + overhead. Typically 1.3-1.5x base hourly rate. |

**Calculation:** Annual Time Savings = hours_saved × users × hourly_cost × 52 weeks

**Coaching Tips:**
- Help users think through the before/after workflow
- Common mistake: overestimating hours saved by not accounting for learning curve
- If they say "everyone will use it," push for a realistic number

#### Error Reduction

| Field | Question to Ask | Guidance |
|-------|-----------------|----------|
| current_errors_per_month | "How many errors/mistakes occur monthly in the process this addresses?" | Include data entry errors, rework, customer complaints, compliance issues |
| cost_per_error | "What's the average cost to fix each error?" | Include rework time, customer impact, compliance fines, opportunity cost |
| expected_error_reduction_percent | "What percentage of these errors will be eliminated?" | 100% is rarely achievable. 50-80% is aggressive but possible for automation |

**Calculation:** Annual Error Reduction = errors_per_month × 12 × cost_per_error × reduction%

**Coaching Tips:**
- Many users underestimate the cost of errors (don't forget time spent investigating, apologizing to customers, etc.)
- Push back on 100% reduction claims
- Ask about error types: some are more costly than others

#### Cost Avoidance

| Field | Question to Ask | Guidance |
|-------|-----------------|----------|
| alternative_solution_cost | "If you didn't build this, what would you pay for an alternative?" | Research vendor software, outsourcing, or contractor costs |
| alternative_solution_period | "Is that cost Monthly, Annually, or One-time?" | Affects the annualization calculation |

**Calculation:** 
- Monthly: cost × 12
- Annually: cost × 1
- One-time: cost ÷ 3 (amortized over 3 years)

**Coaching Tips:**
- Alternatives include: vendor software, hiring contractors, outsourcing, expanding headcount
- If they can't think of an alternative, ask "What would happen if this product didn't exist?"

#### Risk Mitigation

| Field | Question to Ask | Guidance |
|-------|-----------------|----------|
| risk_description | "What risk does this product mitigate?" | Security breach, compliance failure, system outage, data loss, key-person dependency |
| risk_probability_percent | "Without this product, what's the annual probability this risk occurs?" | 5% = once every 20 years, 20% = once every 5 years |
| risk_cost_if_occurs | "If this risk happens, what's the estimated cost?" | Include fines, lost revenue, remediation costs, reputation damage |
| risk_reduction_percent | "How much does this product reduce the probability or impact?" | 50% reduction is significant; be conservative |

**Calculation:** Annual Risk Mitigation = probability% × cost_if_occurs × reduction%

**Coaching Tips:**
- Frame as "insurance value"
- Help users think through worst-case scenarios
- Common risks: compliance fines, security breaches, key person leaving, system failures

#### Adoption & Rollout

| Field | Question to Ask | Guidance |
|-------|-----------------|----------|
| expected_adoption_rate_percent | "What % of target users will actually use this?" | Be realistic - 100% adoption is rare. Even mandatory tools see 70-90% actual usage. |
| training_cost_per_user | "What will it cost to train each user?" | Include trainer time, materials, lost productivity during training. |
| rollout_months | "How many months to roll out to all users?" | Phased rollouts reduce risk. 1-3 months for small teams, 3-6 for departments, 6-12 for company-wide. |
| time_to_full_productivity_weeks | "Weeks until users are fully productive?" | Learning curve matters. Simple tools: 1-2 weeks. Complex tools: 4-8 weeks. |

**Coaching Tips:**
- Adoption rate directly affects realized value - a tool saving 10 hrs/week with 50% adoption only saves 5 hrs/week in practice
- Training costs are often underestimated - include trainer time and user productivity loss
- Longer rollouts mean delayed value realization but lower risk

---

### EXTERNAL VALUE DRIVERS

These apply to External products or the external portion of "Both" products.

#### Market Sizing (TAM/SAM/SOM)

| Field | Question to Ask | Guidance |
|-------|-----------------|----------|
| target_customer_segment | "Who is your ideal customer? Be specific." | Example: "Mid-size e-commerce companies with 10-100 employees in North America" |
| total_potential_customers | "How many companies/people fit your target segment? (TAM)" | Use industry reports, LinkedIn Sales Navigator, government data |
| serviceable_percent | "What percentage can you realistically reach? (SAM)" | Consider geography, channels, language, capabilities. Typically 10-30% of TAM |
| achievable_market_share_percent | "What market share can you capture in 3 years? (SOM)" | Most startups capture <5% of SAM. Established companies: 10-20% |

**Calculation:** SOM Customers = TAM × serviceable% × market_share%

**Coaching Tips:**
- TAM = Total Addressable Market (everyone who could possibly buy)
- SAM = Serviceable Addressable Market (those you can actually reach)
- SOM = Serviceable Obtainable Market (realistic 3-year target)
- Push back hard on market share claims >5% for new products

#### Revenue Projection

| Field | Question to Ask | Guidance |
|-------|-----------------|----------|
| price_per_unit | "What will you charge per unit/user/month?" | Research competitor pricing |
| pricing_model | "How will you charge?" | One-time, Monthly, Annual, Usage-based, Per-seat |
| average_deal_size | "What's the expected average contract value?" | For B2B: annual contract. For B2C: average customer spend |
| sales_cycle_months | "How long from first contact to closed deal?" | B2C: 0-1 month. B2B SMB: 1-3 months. B2B Enterprise: 3-12 months |
| conversion_rate_percent | "Of qualified leads, what percentage become paying customers?" | Cold leads: 2-5%. Warm leads: 20-30% |

**Coaching Tips:**
- Price anchoring: ask about competitors first
- Longer sales cycles require more working capital
- Conversion rates vary dramatically by channel

#### Customer Economics

| Field | Question to Ask | Guidance |
|-------|-----------------|----------|
| gross_margin_percent | "Revenue minus direct costs, as a percentage?" | SaaS typically 70-85%. Physical products: 30-50% |
| expected_customer_lifetime_months | "How long will the average customer stay?" | Calculate as: 1 / monthly churn rate. 5% monthly churn = 20 months |
| customer_acquisition_cost | "How much does it cost to acquire one customer?" | (Marketing + sales costs) / new customers |

**Calculation:** Customer LTV = avg_deal × gross_margin% × (lifetime_months / 12)

**Coaching Tips:**
- LTV:CAC ratio should be at least 3:1 for sustainable business
- Churn rate is the silent killer—push for realistic estimates

#### Competitive Reference

| Field | Question to Ask | Guidance |
|-------|-----------------|----------|
| competitor_name | "Who is your closest competitor or alternative?" | Can be direct competitor or status quo (Excel, manual process) |
| competitor_pricing | "What do they charge?" | Research their pricing page |
| differentiation_summary | "Why would customers choose you over them?" | 2-3 key differentiators |

**Coaching Tips:**
- "No competitors" is a red flag—there's always an alternative (even doing nothing)
- Status quo is often the biggest competitor

---

### FOR "BOTH" PRODUCTS

| Field | Question to Ask | Guidance |
|-------|-----------------|----------|
| internal_value_weight | "What percentage of value comes from internal efficiency?" | Must sum to 100% with external |
| external_value_weight | "What percentage comes from external/customer value?" | Must sum to 100% with internal |

---

## Phase 3: Strategic Assessment

All scores feed into a Strategic Multiplier (0.5x to 2.0x) that adjusts the economic value.

| Field | Scale | What Each Level Means |
|-------|-------|----------------------|
| reach_score | 1-5 | 1=Few individuals, 2=Small team, 3=One department/segment, 4=Multiple departments, 5=Entire company or large market |
| impact_score | Minimal/Low/Medium/High/Massive | Minimal (0.25)=Small convenience, Low (0.5)=Minor efficiency gain, Medium (1)=Meaningful improvement, High (2)=Significant transformation, Massive (3)=Game-changing 10x improvement |
| strategic_alignment_score | 1-5 | 1=Nice-to-have, 2=Useful but not strategic, 3=Supports key initiative, 4=Very aligned, 5=Critical to strategy |
| differentiation_score | 1-5 | 1=Commodity/everyone has it, 2=Minor advantage, 3=Somewhat unique, 4=Notable differentiator, 5=True differentiator |
| urgency_score | 1-5 | 1=No rush, 2=Nice to have this year, 3=Should do this year, 4=Needed soon, 5=Critical/blocking other work |

**Strategic Multiplier Calculation:**
Each score is normalized to 0-1, averaged, then mapped: 0.5 + (avg × 1.5)

**Coaching Tips:**
- Ask users to justify each score
- Most products cluster around 3s—push for specificity
- Very high scores (5s) should have clear justification
- Urgency of 5 means other work is blocked

---

## Phase 4: Confidence Assessment

| Field | Options | Description |
|-------|---------|-------------|
| confidence_level | High, Medium, Low, Speculative | Affects the value range calculation |
| confidence_notes | Free text | What data supports these estimates? What would increase confidence? |

**Confidence Range Multipliers:**
- High (80-100%): 0.9x - 1.1x
- Medium (50-79%): 0.6x - 1.0x
- Low (20-49%): 0.3x - 0.7x
- Speculative (<20%): 0.1x - 0.4x

**Coaching Tips:**
- Encourage honesty—Low/Speculative is fine for early-stage products
- Ask what data would move them to the next confidence level
- Confidence notes are valuable for future reference

---

## Phase 5: Results (System Calculated)

The system calculates:
- **Total Economic Value** = Sum of all value drivers
- **Strategic Multiplier** = Based on strategic assessment scores
- **Final Value Range** = Economic Value × Strategic Multiplier × Confidence Range
- **RICE Score** = (Reach × Impact × Confidence%) / (Effort / 40)

---

## Quick Reference: What Users Typically Know vs. Need Help With

### Users Usually Know:
- Product name, type, description
- Who will use it and how many
- Hourly costs for their team
- General time savings estimates
- What alternatives exist
- Strategic importance to their work

### Users Often Need Help With:
- Quantifying error costs
- Estimating error reduction percentages
- Market sizing (TAM/SAM/SOM)
- Appropriate confidence levels
- Understanding the strategic assessment scales
- Converting intuition into defensible numbers`

const BENCHMARKS = `# Industry Benchmarks & Reference Data

Use these benchmarks to sanity-check user estimates and provide guidance when users are uncertain. These are general industry figures—actual values vary by company, industry, and role.

---

## Hourly Cost Benchmarks

### Fully-Loaded Hourly Rates by Role Level

Fully-loaded cost = base salary + benefits + overhead (typically 1.3-1.5x base)

| Role Level | Base Hourly | Fully-Loaded Range |
|------------|-------------|-------------------|
| Entry Level | $20-30 | $26-45 |
| Mid-Level IC | $35-55 | $45-80 |
| Senior IC | $55-85 | $70-125 |
| Manager | $50-75 | $65-110 |
| Director | $75-100 | $95-150 |
| VP/Executive | $100-175 | $130-260 |

### By Function (Mid-Level, Fully-Loaded)

| Function | Typical Range |
|----------|---------------|
| Administrative | $35-50 |
| Customer Service | $40-55 |
| Sales | $55-80 |
| Marketing | $55-85 |
| Operations | $50-75 |
| Finance/Accounting | $55-85 |
| Engineering | $75-120 |
| Data Science | $80-130 |
| Product Management | $75-115 |
| Legal | $85-150 |

---

## Time Savings Benchmarks

### Typical Time Savings by Automation Type

| Automation Type | Typical Savings |
|-----------------|-----------------|
| Manual data entry → automated | 2-5 hours/week |
| Report generation | 1-4 hours/week |
| Approval workflows | 0.5-2 hours/week |
| Search/lookup tasks | 1-3 hours/week |
| Communication/coordination | 0.5-2 hours/week |
| Quality checks (automated) | 1-3 hours/week |

### Reality Check Questions
- Is the claimed time savings more than 50% of someone's job? (Unusual for a single tool)
- Does the math work? 5 hours/week × 50 users = 250 hours/week = 6+ FTEs
- Are there diminishing returns? First users often save more than later adopters

---

## Error Cost Benchmarks

### Cost Per Error by Type

| Error Type | Typical Cost Range |
|------------|-------------------|
| Simple data correction | $10-50 |
| Customer-facing error (apology, credit) | $50-200 |
| Order/fulfillment error | $100-500 |
| Compliance documentation error | $200-2,000 |
| Financial reporting error | $500-10,000 |
| Security incident (minor) | $5,000-50,000 |
| Major compliance violation | $10,000-1,000,000+ |
| Data breach | $150-300 per record |

### Error Reduction Benchmarks

| Intervention Type | Realistic Reduction |
|-------------------|---------------------|
| Better training alone | 10-30% |
| Process automation | 40-70% |
| Automated validation | 50-80% |
| Full system replacement | 60-90% |

**Red Flag:** Claims of 100% error reduction. Even the best systems have edge cases.

---

## Market Sizing Benchmarks

### Typical SAM as % of TAM

| Factor | SAM % of TAM |
|--------|--------------|
| Single geography focus | 10-20% |
| Language/localization limits | 15-30% |
| Channel reach constraints | 10-25% |
| Technical requirements | 20-40% |
| General B2B SaaS | 15-35% |

### Typical SOM as % of SAM (3-Year)

| Company Stage | Realistic SOM |
|---------------|---------------|
| New product, unknown brand | 1-3% |
| Established company, new product | 3-5% |
| Market leader, new product | 5-10% |
| Dominant player in niche | 15-25% |

**Red Flag:** SOM >10% for anything but market leaders in established positions.

---

## SaaS/Subscription Benchmarks

### Pricing

| Market | Typical Per-User Monthly |
|--------|-------------------------|
| SMB SaaS | $10-50 |
| Mid-Market SaaS | $50-200 |
| Enterprise SaaS | $100-500+ |

### Sales Cycles

| Segment | Typical Sales Cycle |
|---------|---------------------|
| Self-serve/PLG | 0-1 month |
| SMB | 1-3 months |
| Mid-Market | 2-6 months |
| Enterprise | 6-18 months |

### Conversion Rates

| Lead Type | Typical Conversion |
|-----------|-------------------|
| Cold outbound | 1-3% |
| Inbound (content) | 2-5% |
| Referral | 10-25% |
| Free trial to paid | 5-15% |
| Qualified demo to close | 20-40% |

### Customer Lifetime & Churn

| Segment | Monthly Churn | Implied Lifetime |
|---------|---------------|------------------|
| SMB | 3-8% | 12-33 months |
| Mid-Market | 1-3% | 33-100 months |
| Enterprise | 0.5-1.5% | 67-200 months |

### Gross Margins

| Business Type | Typical Gross Margin |
|---------------|---------------------|
| Pure SaaS | 75-85% |
| SaaS with services | 60-75% |
| Marketplace | 15-30% (of GMV) |
| Physical product | 30-50% |

### CAC Benchmarks

| Segment | Typical CAC |
|---------|-------------|
| Self-serve | $50-200 |
| SMB | $200-1,000 |
| Mid-Market | $2,000-10,000 |
| Enterprise | $10,000-100,000 |

**Healthy LTV:CAC Ratio:** 3:1 or higher

---

## Adoption & Rollout Benchmarks

### Expected Adoption Rates

| Tool Type | Typical Adoption |
|-----------|------------------|
| Mandatory tools (required for job) | 85-95% |
| Productivity tools (helpful but optional) | 50-70% |
| Self-serve tools (available on request) | 20-40% |
| Complex/learning-heavy tools | 40-60% |

### Training Costs

| Training Type | Cost per User |
|---------------|---------------|
| Self-paced video/docs | $50-150 |
| Group training session | $100-300 |
| One-on-one training | $200-500 |
| Intensive workshop | $500-1,500 |

### Time to Full Productivity

| Tool Complexity | Weeks to Full Productivity |
|-----------------|----------------------------|
| Simple (single-purpose) | 1-2 weeks |
| Moderate (multi-feature) | 2-4 weeks |
| Complex (replaces workflow) | 4-8 weeks |
| Enterprise platform | 8-12 weeks |

### Rollout Timeline

| Scope | Typical Rollout |
|-------|----------------|
| Small team (<10) | 1-2 months |
| Department (10-50) | 2-4 months |
| Multiple departments | 3-6 months |
| Company-wide | 6-12 months |

---

## Risk Benchmarks

### Probability Reference Points

| Frequency | Annual Probability |
|-----------|-------------------|
| Once every 20 years | 5% |
| Once every 10 years | 10% |
| Once every 5 years | 20% |
| Once every 2 years | 50% |
| Annually | 100% |

### Common Risk Costs

| Risk Type | Typical Cost Range |
|-----------|-------------------|
| Key person departure | 0.5-2x annual salary (hiring + ramp) |
| Minor system outage (hours) | $5,000-50,000 |
| Major system outage (days) | $50,000-500,000 |
| Minor data breach | $50,000-200,000 |
| Major data breach | $1M-10M+ |
| Compliance fine (minor) | $10,000-100,000 |
| Compliance fine (major) | $100,000-10M+ |
| Failed audit | $50,000-500,000 |

---

## Strategic Assessment Calibration

### What Each Score Should Look Like

**Reach Score Examples:**
- 1: A tool for 2-3 specialists
- 2: Used by a small team (5-10 people)
- 3: Entire department (20-50) or one customer segment
- 4: Multiple departments (100+) or multiple segments
- 5: Company-wide or large market (1000+)

**Impact Score Examples:**
- Minimal (0.25): Small convenience improvement
- Low (0.5): Noticeable but minor efficiency gain
- Medium (1): Meaningful improvement to workflow
- High (2): Significant transformation of how work gets done
- Massive (3): Game-changing, 10x improvement

**Strategic Alignment Examples:**
- 1: Interesting idea, not connected to any initiative
- 2: Helpful, but company would be fine without it
- 3: Supports an OKR or strategic initiative
- 4: Key enabler for major company goal
- 5: Without this, a critical initiative fails

**Differentiation Examples:**
- 1: Competitors have the same thing
- 2: Slightly better than competitors
- 3: Meaningfully different approach
- 4: Clear advantage customers notice
- 5: Unique capability competitors can't easily copy

**Urgency Examples:**
- 1: Could do this anytime in the next few years
- 2: Would be nice to have this year
- 3: Should be done this year
- 4: Delays are costly, need it soon
- 5: Other work is blocked until this ships

---

## Red Flags to Watch For

### Overly Optimistic Estimates
- Time savings >10 hours/person/week from a single tool
- Error reduction of 100%
- Market share projections >5% for new products
- High confidence with no supporting data
- All strategic scores at 4-5

### Suspiciously Low Estimates
- Hourly costs below $30 fully-loaded (missing overhead?)
- Zero errors in current process (are they measuring?)
- No risks identified (everything has risks)

### Inconsistencies
- High reach + low impact = most people barely affected?
- High urgency + low strategic alignment = political priority?
- High market share + long sales cycle = math doesn't work?

---

## Using These Benchmarks

1. **Don't lead with benchmarks** - Ask the user first, then use benchmarks to validate
2. **Acknowledge variation** - "Industry benchmarks suggest X, but your situation may differ"
3. **Push for specificity** - If their number differs from benchmarks, ask why
4. **Use ranges, not points** - Benchmarks are guides, not rules
5. **Context matters** - A 10-hour/week time savings might be realistic for a heavy-use tool`

const DOCUMENTS = [
  {
    id: 'system-prompt',
    title: 'System Prompt',
    description: 'Core instructions for the assistant - paste into Project Instructions',
    destination: 'Project Instructions (system prompt)',
    content: SYSTEM_PROMPT,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    )
  },
  {
    id: 'field-reference',
    title: 'Knowledge: Field Reference',
    description: 'All field definitions and coaching guidance',
    destination: 'Project Knowledge (upload as file)',
    content: FIELD_REFERENCE,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    id: 'benchmarks',
    title: 'Knowledge: Industry Benchmarks',
    description: 'Industry benchmarks for sanity-checking estimates',
    destination: 'Project Knowledge (upload as file)',
    content: BENCHMARKS,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    )
  }
]

function CopyButton({ content, label }) {
  const { addToast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(content)
      setCopied(true)
      addToast(`${label} copied to clipboard`, 'success')
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      addToast('Failed to copy to clipboard', 'error')
    }
  }

  return (
    <button
      onClick={handleCopy}
      className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
        copied
          ? 'bg-green-100 text-green-700'
          : 'bg-indigo-600 text-white hover:bg-indigo-700'
      }`}
    >
      {copied ? (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
          Copied!
        </>
      ) : (
        <>
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
          </svg>
          Copy to Clipboard
        </>
      )}
    </button>
  )
}

function DocumentAccordion({ document, isOpen, onToggle }) {
  return (
    <div className="border rounded-lg overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center justify-between p-4 bg-gray-50 hover:bg-gray-100 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-white rounded-lg border text-indigo-600">
            {document.icon}
          </div>
          <div className="text-left">
            <h3 className="font-medium text-gray-900">{document.title}</h3>
            <p className="text-sm text-gray-500">{document.description}</p>
          </div>
        </div>
        <svg
          className={`w-5 h-5 text-gray-400 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {isOpen && (
        <div className="border-t">
          <div className="p-4 bg-white">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm text-gray-500">
                <span className="font-medium">Destination:</span> {document.destination}
              </span>
              <CopyButton content={document.content} label={document.title} />
            </div>
            <div className="bg-gray-50 rounded-lg p-4 max-h-96 overflow-y-auto">
              <pre className="text-xs text-gray-700 whitespace-pre-wrap font-mono">
                {document.content}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default function ValuationAssistantPage() {
  const [openDoc, setOpenDoc] = useState(null)

  return (
    <div>
      <div className="mb-6">
        <Link to="/tools" className="text-indigo-600 hover:text-indigo-800 text-sm flex items-center gap-1 mb-2">
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Back to Tools
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Internal Valuation Assistant Setup</h1>
        <p className="text-gray-600 mt-1">
          Set up an AI-powered Claude Project to help department heads complete internal product valuations
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Setup Guide</h2>
            
            <div className="space-y-6">
              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold">
                  1
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Create the Claude Project</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Go to <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">claude.ai</a> → Projects → Create a new project named "Product Valuation Assistant"
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold">
                  2
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Add the System Prompt</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Copy the <strong>System Prompt</strong> below and paste it into the project's "Instructions" field
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold">
                  3
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Add Knowledge Files</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Copy each knowledge file below and upload them to the project's Knowledge section (or paste as .md files)
                  </p>
                </div>
              </div>

              <div className="flex gap-4">
                <div className="flex-shrink-0 w-8 h-8 bg-indigo-100 text-indigo-600 rounded-full flex items-center justify-center font-semibold">
                  4
                </div>
                <div>
                  <h3 className="font-medium text-gray-900">Test It</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Start a conversation with: "I need to value a product called [X], it's an internal tool that [does Y]"
                  </p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Configuration Files</h2>
            <p className="text-sm text-gray-600 mb-4">
              Click each file to expand and copy its contents
            </p>
            
            <div className="space-y-3">
              {DOCUMENTS.map(doc => (
                <DocumentAccordion
                  key={doc.id}
                  document={doc}
                  isOpen={openDoc === doc.id}
                  onToggle={() => setOpenDoc(openDoc === doc.id ? null : doc.id)}
                />
              ))}
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg shadow p-6 text-white">
            <h3 className="font-semibold mb-2">What Department Heads Experience</h3>
            <ul className="text-sm space-y-2 text-indigo-100">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Describe their product in plain language
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Get guided through each valuation field
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Receive coaching on realistic estimates
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Get a formatted report to copy into Product Jarvis
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Customization Options</h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-700">Add Company-Specific Data</h4>
                <p className="text-gray-500 mt-1">
                  Create a third knowledge file with your company's hourly rates, team sizes, and strategic initiatives
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Adjust the Tone</h4>
                <p className="text-gray-500 mt-1">
                  Modify the "Starting the Conversation" section in the system prompt
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Add More Benchmarks</h4>
                <p className="text-gray-500 mt-1">
                  Extend the benchmarks file with industry-specific or historical data
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2">Troubleshooting</h3>
            <ul className="text-sm text-amber-700 space-y-2">
              <li><strong>Too many one-by-one questions?</strong> Add "Always batch at least 3 related questions" to the prompt</li>
              <li><strong>Not enough pushback?</strong> Add examples of good pushback to the system prompt</li>
              <li><strong>Output format issues?</strong> Update the artifact section with exact field names</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
