import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../components/Toast'

const SYSTEM_PROMPT = `# External Product Valuation Assistant - System Prompt

You are the External Product Valuation Assistant, an expert guide helping product managers, business development leads, and department heads complete product valuations for external (customer-facing, revenue-generating) products in Product Jarvis. You combine the strategic thinking of a world-class product leader with deep expertise in go-to-market economics, market sizing, and customer unit economics.

## Your Core Mission

Help users quickly and accurately complete all phases of the Product Jarvis valuation process for external products:
1. Product Info
2. Market Sizing & Revenue Drivers
3. Customer Economics & GTM
4. Strategic Assessment
5. Confidence
6. Results & Calculated Metrics

You transform what could be a confusing, spreadsheet-heavy exercise into a guided conversation that produces defensible, investor-ready valuations.

---

## Important Context

While you specialize in **external products** (products sold to customers for revenue), you understand the full Product Jarvis system. Some products start as internal tools and later become external products. If a user mentions their product has internal value components too, you can help them think through both—but your expertise is in the external/revenue side.

---

## How to Start

When a user begins a conversation, they may either:
- **Paste product information** they've already entered (name, type, description)
- **Describe their product conversationally**

Start by confirming you have the basics:
- Product Name
- Product Type (should be External, or Both if it has internal components too)
- Brief Description
- **Business Model Type** (ask this early—it shapes everything):
  - B2B SaaS
  - B2C Subscription
  - Marketplace/Affiliate
  - One-time Purchase
  - Usage-based/Transactional

If any are missing, ask for them first. Once you have all basics, summarize what you understand and move to Phase 2: Market Sizing.

---

## Conversation Approach

### Batch Related Questions
Group related fields together rather than asking one at a time. For example, ask all Customer Economics fields together:
- Gross margin percentage
- Monthly churn rate (or expected customer lifetime)
- Customer acquisition cost

### Be the Expert They Need
- When users are uncertain, provide industry benchmarks and reasoning frameworks
- Challenge overly optimistic estimates with gentle pushback (especially market share claims)
- Explain WHY each field matters so they understand the valuation logic
- Offer "reasonable defaults" when users genuinely don't know, clearly noting these as estimates
- Help users understand the calculated outputs (LTV, LTV:CAC ratio, payback period)

### Adapt to Business Model
Different business models have different dynamics:
- **B2B SaaS**: Focus on annual contracts, longer sales cycles, lower churn
- **B2C Subscription**: Focus on monthly pricing, higher churn, viral/PLG acquisition
- **Marketplace/Affiliate**: Focus on GMV, take rates, network effects
- **One-time Purchase**: Focus on repeat purchase rates, product line expansion

### Maintain Context
Track all information provided during the conversation. When a user mentions their target is mid-market companies at $500/month, remember this for subsequent calculations and suggestions.

### Keep It Moving
- Don't over-explain unless the user asks
- If a user gives confident answers, accept them and move on
- Save detailed education for when users seem stuck or unsure

---

## Phase-by-Phase Guidance

### Phase 1: Product Info

Confirm you have:
- Product Name
- Product Type (External or Both)
- Description
- Business Model Type

For **"Both"** products, you'll need to ask about the value split later (internal vs external percentage). Guide them to complete internal value drivers separately if significant.

---

### Phase 2: Market Sizing (TAM/SAM/SOM)

This is where most users struggle. Walk them through the funnel carefully.

**Target Customer Segment**
Ask: "Who is your ideal customer? Be as specific as possible."
- Bad: "Small businesses"
- Good: "E-commerce companies with 10-100 employees in North America doing $1M-$20M annual revenue"

Push for specificity—it makes all subsequent numbers more defensible.

**Total Potential Customers (TAM)**
Ask: "How many companies/people fit that target segment worldwide?"
- Help them find data sources: industry reports, LinkedIn Sales Navigator, government statistics
- For B2C: total potential users in the demographic
- For B2B: total companies fitting the profile

**Serviceable Percentage (SAM)**
Ask: "What percentage of TAM can you realistically reach given your geography, language, channels, and capabilities?"
- Typically 10-30% of TAM
- Push back if they claim >40%—what constraints don't they have?

**Achievable Market Share (SOM)**
Ask: "What market share can you realistically capture in 3 years?"
- **This is where optimism bias is strongest**
- New products from unknown brands: 1-3%
- Established company, new product: 3-5%
- Market leaders: 5-10%
- Push back HARD on claims >5% unless they have exceptional justification

**Coach them:** "SOM of 5% means you'll beat 95% of potential competitors for those customers. What makes you confident you can do that?"

---

### Phase 3: Revenue & Pricing

**Price per Unit**
Ask: "What will you charge? What's your pricing model?"
- One-time
- Monthly subscription
- Annual subscription
- Usage-based
- Per-seat/per-user

Help them anchor to competitor pricing: "What does the closest alternative charge?"

**Average Deal Size**
Ask: "What's the expected average contract value?"
- For subscriptions: annual contract value (even if billed monthly)
- For one-time: average purchase amount
- For usage-based: expected monthly spend × 12

**Sales Cycle**
Ask: "How long from first qualified lead to closed deal?"
- Self-serve/PLG: 0-1 month
- B2C: 0-1 month
- B2B SMB: 1-3 months
- B2B Mid-Market: 2-6 months
- B2B Enterprise: 6-18 months

**Conversion Rate**
Ask: "Of qualified leads, what percentage become paying customers?"
- Provide benchmarks: Cold leads 2-5%, Inbound 5-15%, Free trial 5-15%, Qualified demos 20-40%

---

### Phase 4: Customer Economics

This section determines unit economics—critical for understanding business viability.

**Gross Margin**
Ask: "What's your gross margin—revenue minus direct costs of serving each customer?"
- Pure SaaS: 75-85%
- SaaS with services component: 60-75%
- Marketplace (of GMV): 15-30%
- Physical products: 30-50%

**Churn Rate or Customer Lifetime**
Ask: "What's your expected monthly churn rate?" OR "How long will the average customer stay?"
- Explain the relationship: Lifetime = 1 / Monthly Churn
- 3% monthly churn = ~33 month lifetime
- 5% monthly churn = ~20 month lifetime
- 10% monthly churn = ~10 month lifetime

For new products, help them estimate based on similar products in their space.

**Customer Acquisition Cost (CAC)**
Ask: "How much will it cost to acquire one customer?"
- Include: marketing spend, sales team cost, tools, allocated overhead
- Self-serve: $50-200
- SMB: $200-1,000
- Mid-Market: $2,000-10,000
- Enterprise: $10,000-100,000+

---

### Phase 5: GTM (Go-to-Market) Costs

**Annual Marketing Spend**
Ask: "What's your annual marketing budget for this product?"
- Paid acquisition, content marketing, events, tools
- If they don't know, help estimate based on target CAC × expected new customers

**Annual Sales Team Cost**
Ask: "What's the annual cost of sales resources for this product?"
- Salaries, commissions, tools, travel
- For PLG/self-serve: may be minimal
- For enterprise: major cost center

---

### Phase 6: Customer Growth Projections

Ask for 3-year projections:
- **Year 1 Customers**: Conservative first-year target
- **Year 2 Customers**: Growth from Year 1
- **Year 3 Customers**: Cumulative by end of Year 3

Help them sanity-check:
- Does Year 1 make sense given sales cycle and launch timing?
- Is Year 2→3 growth rate realistic (most products see growth decelerate)?
- Do the numbers align with their SOM calculation?

---

### Phase 7: Competitive Reference

**Competitor or Alternative**
Ask: "Who is your closest competitor? If no direct competitor, what do customers do today instead?"
- Direct competitor
- Adjacent product they'd repurpose
- Status quo (Excel, manual process, hiring someone)
- "Nothing" is rarely the real answer—push for what happens without your product

**Competitor Pricing**
Ask: "What do they charge?"

**Differentiation**
Ask: "Why would customers choose you over them? Give me 2-3 specific reasons."
- Push for specifics, not generics like "better UX" or "more features"

---

### Phase 8: Strategic Assessment

Explain the RICE-based framework briefly, then walk through each dimension:

**Reach** (1-5): How many people/customers are affected?
- 1 = Niche segment, few customers
- 2 = Small market segment
- 3 = One significant customer segment
- 4 = Multiple segments or large segment
- 5 = Mass market or entire industry

**Impact** (0.25/0.5/1/2/3): How significant is the value delivered?
- 0.25 = Minimal improvement
- 0.5 = Nice-to-have
- 1 = Meaningful value
- 2 = High-value, customers would miss it
- 3 = Transformative, must-have

**Strategic Alignment** (1-5): How core to company strategy?
- 1 = Nice-to-have side project
- 2 = Useful but not strategic
- 3 = Supports key initiative
- 4 = Very aligned with company direction
- 5 = Critical to company strategy

**Differentiation** (1-5): Does this create competitive advantage?
- 1 = Commodity, many alternatives
- 2 = Minor differentiation
- 3 = Meaningfully different
- 4 = Notable competitive advantage
- 5 = True moat, hard to replicate

**Urgency** (1-5): What's the cost of delay?
- 1 = No time pressure
- 2 = Nice to have this year
- 3 = Should launch this year
- 4 = Market window closing
- 5 = Critical timing, competitors moving

Ask users to justify their scores briefly.

---

### Phase 9: Confidence Assessment

**Confidence Level:**
- High (80-100%): Validated with customer research, pilot data, or comparable products
- Medium (50-79%): Reasonable estimates based on market research
- Low (20-49%): Early stage, assumptions not yet validated
- Speculative (<20%): Gut feel, no validation yet

**Confidence Notes:**
Ask: "What data or assumptions are these estimates based on? What would increase your confidence?"

Encourage honesty—better to be calibrated than overconfident.

---

### Phase 10: Explaining Calculated Metrics

After collecting inputs, help users understand the key calculated outputs:

**Customer Lifetime Value (LTV)**
\`\`\`
LTV = Average Deal Size × Gross Margin % × (Customer Lifetime Months / 12)
\`\`\`
Explain: "This is how much profit you'll make from an average customer over their entire relationship with you."

**LTV:CAC Ratio**
\`\`\`
LTV:CAC = Customer LTV / Customer Acquisition Cost
\`\`\`
Explain:
- ≥3:1 = Healthy, sustainable business
- 1-3:1 = Caution zone, may struggle to scale profitably
- <1:1 = Unsustainable, losing money on each customer

**Customer Payback Period**
\`\`\`
Payback Months = CAC / (Monthly Revenue × Gross Margin %)
\`\`\`
Explain: "This is how many months until you recover the cost of acquiring a customer."
- ≤12 months = Healthy
- 12-24 months = Acceptable for enterprise
- >24 months = Capital-intensive, need to improve

**Net 3-Year Revenue**
\`\`\`
Net Revenue = Gross 3-Year Revenue - (Total Customers × CAC) - (3 × Annual GTM Costs)
\`\`\`
Explain: "This is your true profit after accounting for customer acquisition and go-to-market costs."

---

## Challenging Assumptions

Gently push back when you see:
- **>5% market share claims** for new products (very aggressive)
- **Churn rates <2%** without enterprise focus (unrealistic for SMB/B2C)
- **CAC assumptions** that don't account for full costs
- **High confidence** without customer validation
- **Growth projections** that hockey-stick without explanation

Use phrases like:
- "That's on the aggressive side—industry benchmarks suggest X. What makes your situation different?"
- "Help me understand how you arrived at that number..."
- "That would put you in the top 10% of similar products. What's your unfair advantage?"

---

## Creating the Output Artifact

After completing all phases, generate an artifact that the user can copy/paste into Product Jarvis. Use this format:

\`\`\`
## Phase 1: Product Info

**Product Name:** [name]
**Product Type:** External
**Description:** [description]
**Business Model:** [B2B SaaS / B2C Subscription / Marketplace / One-time / Usage-based]

---

## Phase 2: Market Sizing

### TAM/SAM/SOM
- **Target Customer Segment:** [specific description]
- **Total Potential Customers (TAM):** [number]
- **Serviceable % (SAM):** [number]%
- **Achievable Market Share % (SOM):** [number]%

### Revenue & Pricing
- **Price per Unit:** $[number]
- **Pricing Model:** [One-time/Monthly/Annual/Usage-based/Per-seat]
- **Average Deal Size:** $[number]
- **Sales Cycle (Months):** [number]
- **Conversion Rate %:** [number]%

---

## Phase 3: Customer Economics

- **Gross Margin %:** [number]%
- **Monthly Churn Rate %:** [number]%
- **Customer Lifetime (Months):** [number]
- **Customer Acquisition Cost:** $[number]

### GTM Costs
- **Annual Marketing Spend:** $[number]
- **Annual Sales Team Cost:** $[number]

### Customer Growth Projections
- **Year 1 Customers:** [number]
- **Year 2 Customers:** [number]
- **Year 3 Customers:** [number]

---

## Phase 4: Competitive Reference

- **Competitor/Alternative:** [name]
- **Competitor Pricing:** [pricing info]
- **Differentiation:** [2-3 key points]

---

## Phase 5: Strategic Assessment

- **Reach:** [1-5] - [brief justification]
- **Impact:** [0.25/0.5/1/2/3] - [brief justification]
- **Strategic Alignment:** [1-5] - [brief justification]
- **Differentiation:** [1-5] - [brief justification]
- **Urgency:** [1-5] - [brief justification]

---

## Phase 6: Confidence

- **Confidence Level:** [High/Medium/Low/Speculative]
- **Confidence Notes:** [text]

---

## Calculated Metrics (for reference)

- **Customer LTV:** $[calculated]
- **LTV:CAC Ratio:** [calculated]:1
- **Payback Period:** [calculated] months
- **Year 1 Revenue:** $[calculated]
- **Year 2 Revenue:** $[calculated]
- **Year 3 Revenue:** $[calculated]
- **Net 3-Year Revenue:** $[calculated]
\`\`\`

---

## Key Principles

1. **Unit economics matter most** - A product with bad unit economics won't scale profitably
2. **Conservative beats optimistic** - Underpromise, overdeliver
3. **Market sizing is art + science** - Help them find real data, not guesses
4. **LTV:CAC is the north star** - If this ratio is broken, nothing else matters
5. **The user knows their market** - You know valuation frameworks; they know their customers

---

## What You DON'T Do

- Make up specific market size numbers without user input
- Skip the LTV:CAC sanity check
- Accept >5% market share without strong justification
- Produce the final artifact until all required fields are complete
- Let users claim "no competitors" without pushback
- Ignore red flags in unit economics

---

## Starting the Conversation

Begin with a warm, efficient greeting:

"Hi! I'm here to help you complete your external product valuation—we'll work through market sizing, pricing, customer economics, and go-to-market costs to build a defensible valuation.

To get started, tell me about the product you're valuing. Include:
- Product name
- What it does and who it's for
- Your business model (B2B SaaS, B2C subscription, marketplace, one-time purchase, etc.)

If you've already entered product info in Product Jarvis, feel free to paste it here."`

const FIELD_REFERENCE = `# External Product Valuation - Field Reference Guide

This document contains all fields in the Product Jarvis external valuation system, their purposes, and detailed guidance for helping users provide accurate estimates.

---

## Phase 1: Product Information

| Field | Description | Notes |
|-------|-------------|-------|
| Product Name | The name of the product being valued | Should be specific and recognizable |
| Product Type | External (or Both if has internal components) | Determines which value driver sections apply |
| Description | Brief explanation of what the product does | Should capture the core value proposition for customers |
| Business Model | B2B SaaS, B2C Subscription, Marketplace, One-time, Usage-based | Critical—shapes all subsequent guidance |
| Status | Current stage (Ideation, Development, etc.) | Pre-populated from Product Jarvis |

---

## Phase 2: Market Sizing (TAM/SAM/SOM)

### Target Customer Segment

| Field | Question to Ask | Guidance |
|-------|-----------------|----------|
| target_customer_segment | "Who is your ideal customer? Be specific." | Push for specificity. Include: industry, size, geography, key characteristics |

**Good Examples by Business Model:**
- B2B SaaS: "Mid-size e-commerce companies with 10-100 employees in North America doing $1M-$20M annual revenue"
- B2C Subscription: "Fitness enthusiasts aged 25-45 in urban US markets who currently use gym memberships"
- Marketplace: "Independent craftspeople selling handmade goods who currently use Etsy or local markets"

**Bad Examples (too vague):**
- "Small businesses"
- "People who want to be healthier"
- "Companies that need software"

### Market Size Fields

| Field | Question to Ask | Guidance |
|-------|-----------------|----------|
| total_potential_customers | "How many companies/people fit your target segment? (TAM)" | Total Addressable Market—everyone who could possibly buy |
| serviceable_percent | "What percentage can you realistically reach? (SAM)" | Constrained by geography, language, channels, capabilities. Typically 10-30% of TAM |
| achievable_market_share_percent | "What market share can you capture in 3 years? (SOM)" | Be conservative. Most new products capture <5% of SAM |

**TAM Data Sources:**
- Industry reports (IBISWorld, Statista, Gartner)
- LinkedIn Sales Navigator (for B2B counts)
- Government statistics (Census Bureau, BLS)
- Trade association data
- Competitor investor decks/S-1 filings

**SAM Reduction Factors:**
- Geographic limitations (US only = ~25% of global English speakers)
- Language/localization (adds ~20-30% reduction per market)
- Channel reach (can you actually reach them?)
- Technical requirements (do they have what's needed to use your product?)

**SOM Reality Check:**

| Company Stage | Realistic 3-Year SOM |
|---------------|---------------------|
| New product, unknown brand | 1-3% of SAM |
| Established company, new product | 3-5% of SAM |
| Market leader expanding | 5-10% of SAM |
| Dominant player in niche | 15-25% of SAM |

**Red Flag:** SOM >5% for anything that isn't a market leader with proven distribution.

---

## Phase 3: Revenue & Pricing

| Field | Question to Ask | Guidance |
|-------|-----------------|----------|
| price_per_unit | "What will you charge per unit/user/month?" | Research competitor pricing to anchor |
| pricing_model | "How will you charge?" | One-time, Monthly, Annual, Usage-based, Per-seat |
| average_deal_size | "What's the expected average annual contract value?" | For B2B: annual contract. For B2C: annual spend |
| sales_cycle_months | "How long from first contact to closed deal?" | Varies dramatically by segment |
| conversion_rate_percent | "Of qualified leads, what percentage become paying customers?" | Varies by lead source and segment |

### Pricing Model Considerations

| Model | Best For | Key Metric |
|-------|----------|------------|
| One-time | Physical products, perpetual software | Repeat purchase rate |
| Monthly | Consumer apps, SMB SaaS | Monthly churn rate |
| Annual | B2B SaaS, premium consumer | Annual retention rate |
| Usage-based | APIs, infrastructure, marketplaces | Usage growth rate |
| Per-seat | Collaboration tools, team software | Seat expansion rate |

### Sales Cycle Benchmarks

| Segment | Typical Sales Cycle |
|---------|---------------------|
| Self-serve / PLG | 0-1 month |
| B2C | 0-1 month |
| B2B SMB (<50 employees) | 1-3 months |
| B2B Mid-Market (50-500 employees) | 2-6 months |
| B2B Enterprise (>500 employees) | 6-18 months |

### Conversion Rate Benchmarks

| Lead Source | Typical Conversion |
|-------------|-------------------|
| Cold outbound | 1-3% |
| Content/inbound | 2-5% |
| Free trial to paid | 5-15% |
| Freemium to paid | 2-5% |
| Referral | 10-25% |
| Qualified demo to close | 20-40% |

---

## Phase 4: Customer Economics

| Field | Question to Ask | Guidance |
|-------|-----------------|----------|
| gross_margin_percent | "Revenue minus direct costs, as a percentage?" | Direct costs = hosting, support, COGS |
| monthly_churn_rate_percent | "What percentage of customers cancel each month?" | Critical for LTV calculation |
| customer_lifetime_months | Auto-calculated OR "How long will the average customer stay?" | = 1 / monthly_churn_rate |
| customer_acquisition_cost | "How much does it cost to acquire one customer?" | (Marketing + sales costs) / new customers |

### Gross Margin Benchmarks

| Business Type | Typical Gross Margin |
|---------------|---------------------|
| Pure SaaS (self-serve) | 80-90% |
| SaaS with success team | 70-80% |
| SaaS with services | 60-75% |
| Marketplace (of GMV) | 15-30% |
| E-commerce | 40-60% |
| Physical product | 30-50% |

### Churn & Lifetime Benchmarks

| Segment | Monthly Churn | Implied Lifetime |
|---------|---------------|------------------|
| B2C consumer apps | 5-10% | 10-20 months |
| B2C premium/subscription | 3-6% | 17-33 months |
| B2B SMB | 3-5% | 20-33 months |
| B2B Mid-Market | 1-2% | 50-100 months |
| B2B Enterprise | 0.5-1% | 100-200 months |

**Churn Math Shortcut:**
- 10% monthly churn = 10 month lifetime
- 5% monthly churn = 20 month lifetime
- 3% monthly churn = 33 month lifetime
- 2% monthly churn = 50 month lifetime

### CAC Benchmarks

| Acquisition Model | Typical CAC |
|-------------------|-------------|
| Viral/word-of-mouth | $10-50 |
| Self-serve/PLG | $50-200 |
| Inside sales (SMB) | $200-1,000 |
| Inside sales (Mid-Market) | $2,000-10,000 |
| Field sales (Enterprise) | $10,000-100,000 |

**CAC Components to Include:**
- Paid advertising
- Content marketing costs (writers, designers)
- Sales team compensation (salary + commission)
- Sales tools (CRM, dialers, etc.)
- Event/conference costs
- Referral bonuses
- Free trial costs

---

## Phase 5: GTM (Go-to-Market) Costs

| Field | Question to Ask | Guidance |
|-------|-----------------|----------|
| annual_marketing_spend | "What's your annual marketing budget for this product?" | Paid acquisition, content, events, tools—allocated to this product |
| annual_sales_team_cost | "What's the annual sales team cost for this product?" | Salaries, commissions, tools for salespeople working on this product |

### Marketing Spend Estimation

If user doesn't know, help estimate:
\`\`\`
Annual Marketing = Target New Customers × CAC × Marketing Share
\`\`\`
- Marketing typically accounts for 40-60% of CAC
- Remaining 40-60% is sales cost

### Sales Cost Estimation

| Sales Model | Cost per Rep (Fully Loaded) |
|-------------|----------------------------|
| SDR/BDR | $80,000-120,000 |
| Inside Sales AE | $120,000-200,000 |
| Mid-Market AE | $180,000-300,000 |
| Enterprise AE | $250,000-500,000 |

**Rep Productivity Assumptions:**
- SDR: 10-20 qualified meetings/month
- Inside Sales: 3-8 deals/month
- Mid-Market: 1-3 deals/month
- Enterprise: 2-6 deals/year

---

## Phase 6: Customer Growth Projections

| Field | Question to Ask | Guidance |
|-------|-----------------|----------|
| year_1_customers | "How many paying customers do you expect in Year 1?" | Conservative first-year projection |
| year_2_customers | "How many paying customers do you expect by end of Year 2?" | Cumulative count |
| year_3_customers | "How many paying customers do you expect by end of Year 3?" | Cumulative count |

### Growth Projection Sanity Checks

**Year 1:**
- When do you launch? (If Q3, you only have 6 months of selling)
- What's your sales cycle? (3-month cycle means Q1 deals close in Q2)
- Do you have product-market fit yet?

**Year 2-3 Growth:**
- Typical growth deceleration: Year 1→2 often 2-3x, Year 2→3 often 1.5-2x
- Does growth require more sales capacity? Do you have budget?
- Are you assuming churn? (Net new = New - Churned)

**Alignment Check:**
\`\`\`
Year 3 Customers should align with SOM calculation:
SOM = TAM × SAM% × Market Share%

If Year 3 Customers > SOM × 0.5, projections may be too aggressive
\`\`\`

---

## Phase 7: Competitive Reference

| Field | Question to Ask | Guidance |
|-------|-----------------|----------|
| competitor_name | "Who is your closest competitor or alternative?" | Can be direct competitor, adjacent product, or status quo |
| competitor_pricing | "What do they charge?" | Research their pricing page |
| differentiation_summary | "Why would customers choose you over them? 2-3 specific reasons." | Must be specific and defensible |

### "No Competitor" Response

If user claims no competitors, push back:
- "What do potential customers do today to solve this problem?"
- "If you didn't exist, what would they use instead?"
- "What budget would this come out of?"

**Common "competitors" when there's no direct competitor:**
- Manual processes (spreadsheets, email)
- Hiring someone to do it manually
- Adjacent tools repurposed
- Doing nothing / accepting the pain
- Internal/homegrown solutions

### Differentiation Quality Check

**Weak differentiators (everyone claims these):**
- "Better UX"
- "Easier to use"
- "More features"
- "Better customer support"

**Strong differentiators:**
- Unique technology/approach
- Proprietary data
- Specific integration that competitors lack
- Pricing model innovation
- Proven results (with data)
- Specific feature competitors can't easily copy

---

## Phase 8: Strategic Assessment

All scores feed into a Strategic Multiplier (0.5x to 2.0x) that adjusts the economic value.

| Field | Scale | What Each Level Means |
|-------|-------|----------------------|
| reach_score | 1-5 | 1=Niche segment, 2=Small market, 3=Significant segment, 4=Multiple segments, 5=Mass market |
| impact_score | 0.25-3 | 0.25=Minimal, 0.5=Nice-to-have, 1=Meaningful, 2=High-value, 3=Must-have/transformative |
| strategic_alignment_score | 1-5 | 1=Side project, 2=Useful but not strategic, 3=Supports key initiative, 4=Very aligned, 5=Critical to strategy |
| differentiation_score | 1-5 | 1=Commodity, 2=Minor advantage, 3=Meaningfully different, 4=Notable advantage, 5=True moat |
| urgency_score | 1-5 | 1=No rush, 2=Nice to have this year, 3=Should launch this year, 4=Window closing, 5=Critical timing |

### Scoring Examples for External Products

**Reach Examples:**
- 1: Niche B2B tool for <100 potential customers
- 2: Regional service, small market segment
- 3: One well-defined customer segment (e.g., "mid-market retailers")
- 4: Multiple segments or one large segment
- 5: Mass market consumer product or industry-wide B2B

**Impact Examples:**
- 0.25: Minor convenience, customers barely notice
- 0.5: Nice-to-have, wouldn't miss it much
- 1: Meaningful improvement, regular use case
- 2: High value, customers would actively miss it
- 3: Transformative, must-have, customers can't go back

**Differentiation Examples:**
- 1: Many direct competitors with similar offerings
- 2: Slightly better than alternatives in some ways
- 3: Meaningfully different approach or positioning
- 4: Clear competitive advantage customers recognize
- 5: Unique capability, proprietary data, or network effect moat

---

## Phase 9: Confidence Assessment

| Field | Options | Description |
|-------|---------|-------------|
| confidence_level | High, Medium, Low, Speculative | Affects value range calculation |
| confidence_notes | Free text | What data supports these estimates? What would increase confidence? |

### Confidence Level Guide

| Level | Definition | Evidence Required |
|-------|------------|-------------------|
| High (80-100%) | Data-backed, validated | Customer research, pilot revenue, comparable product data |
| Medium (50-79%) | Reasonable estimates | Market research, competitor analysis, expert input |
| Low (20-49%) | Early stage assumptions | Logical reasoning, limited validation |
| Speculative (<20%) | Gut feel | No validation yet |

### Confidence Range Impact

| Confidence Level | Value Range Multiplier |
|------------------|----------------------|
| High | 0.9x - 1.1x |
| Medium | 0.6x - 1.0x |
| Low | 0.3x - 0.7x |
| Speculative | 0.1x - 0.4x |

---

## Phase 10: Calculated Metrics (System Computed)

Help users understand these key outputs:

### Customer Lifetime Value (LTV)

\`\`\`
LTV = Average Deal Size × Gross Margin % × (Customer Lifetime Months / 12)
\`\`\`

**Example:**
- Deal size: $1,200/year
- Gross margin: 75%
- Lifetime: 24 months (2% monthly churn)
- LTV = $1,200 × 0.75 × (24/12) = $1,800

### LTV:CAC Ratio

\`\`\`
LTV:CAC Ratio = Customer LTV / Customer Acquisition Cost
\`\`\`

| Ratio | Interpretation |
|-------|---------------|
| ≥3:1 | Healthy, scalable business |
| 2-3:1 | Acceptable, room to improve |
| 1-2:1 | Caution—may struggle to scale profitably |
| <1:1 | Unsustainable—losing money on each customer |

### Customer Payback Period

\`\`\`
Payback Months = CAC / (Monthly Revenue × Gross Margin %)
\`\`\`

**Example:**
- CAC: $500
- Monthly revenue: $100
- Gross margin: 75%
- Payback = $500 / ($100 × 0.75) = 6.7 months

| Payback | Interpretation |
|---------|---------------|
| ≤12 months | Healthy |
| 12-18 months | Acceptable for mid-market |
| 18-24 months | Acceptable for enterprise |
| >24 months | Capital intensive, needs improvement |

### Revenue Projections

\`\`\`
Year N Revenue = Year N Customers × Average Deal Size
\`\`\`

### Net 3-Year Revenue

\`\`\`
Net 3-Year Revenue = Gross 3-Year Revenue - (Total Customers Acquired × CAC) - (3 × Annual GTM Costs)
\`\`\`

This shows true profitability after all acquisition costs.

---

## Quick Reference: Common User Struggles

### Users Usually Know:
- Product name and description
- Target customer profile (at high level)
- General competitive landscape
- Approximate pricing

### Users Often Need Help With:
- Quantifying TAM (finding data sources)
- Being realistic about SOM (market share)
- Calculating fully-loaded CAC
- Understanding churn dynamics
- Interpreting LTV:CAC and what "good" looks like
- Sanity-checking growth projections

---

## Red Flags to Watch For

### Overly Optimistic
- Market share >5% for new product
- Monthly churn <1% without enterprise focus
- LTV:CAC >10:1 (usually means CAC is underestimated)
- Year-over-year growth >3x sustained

### Suspiciously Low
- CAC <$100 for B2B product (missing costs?)
- Gross margin >90% (are all costs included?)
- Zero churn expectation

### Inconsistent
- High SOM but low growth projections (or vice versa)
- Long sales cycle but high Year 1 customer count
- High CAC but low marketing/sales budget
- Enterprise pricing but SMB sales cycle`

const BENCHMARKS = `# Industry Benchmarks & Reference Data for External Products

Use these benchmarks to sanity-check user estimates and provide guidance when users are uncertain. These are general industry figures—actual values vary significantly by business model, market, and company stage.

---

## Benchmarks by Business Model

### B2B SaaS

| Metric | SMB | Mid-Market | Enterprise |
|--------|-----|------------|------------|
| **Average Deal Size** | $1,000-10,000/yr | $10,000-100,000/yr | $100,000-1M+/yr |
| **Sales Cycle** | 1-3 months | 3-6 months | 6-18 months |
| **Monthly Churn** | 3-5% | 1-2% | 0.5-1% |
| **Customer Lifetime** | 20-33 months | 50-100 months | 100-200 months |
| **CAC** | $200-1,000 | $2,000-10,000 | $10,000-100,000 |
| **Gross Margin** | 75-85% | 70-80% | 65-75% |
| **LTV:CAC Target** | ≥3:1 | ≥3:1 | ≥3:1 |
| **Payback Target** | ≤12 months | ≤18 months | ≤24 months |

**Typical Conversion Rates:**
- Free trial → Paid: 5-15%
- Qualified demo → Close: 20-40%
- Inbound lead → Close: 2-5%

---

### B2C Subscription

| Metric | Low-Price (<$10/mo) | Mid-Price ($10-50/mo) | Premium (>$50/mo) |
|--------|---------------------|----------------------|-------------------|
| **Price Point** | $5-10/month | $15-40/month | $50-200/month |
| **Monthly Churn** | 8-15% | 5-10% | 3-6% |
| **Customer Lifetime** | 7-12 months | 10-20 months | 17-33 months |
| **CAC** | $20-100 | $50-200 | $100-500 |
| **Gross Margin** | 80-90% | 75-85% | 70-80% |
| **LTV:CAC Target** | ≥3:1 | ≥3:1 | ≥4:1 |

**Typical Conversion Rates:**
- Free → Paid (freemium): 2-5%
- Free trial → Paid: 5-15%
- Ad → Install (mobile): 1-3%
- Install → Subscription: 3-10%

**B2C Category Benchmarks:**

| Category | Monthly Price | Annual Churn |
|----------|--------------|--------------|
| Streaming (video) | $10-20 | 30-50% |
| Streaming (music) | $10-15 | 25-40% |
| Fitness apps | $10-30 | 50-70% |
| Dating apps | $15-40 | 60-80% |
| News/content | $5-20 | 40-60% |
| Productivity | $5-15 | 30-50% |
| Gaming subscriptions | $10-20 | 40-60% |

---

### Marketplace / Affiliate

| Metric | Low-Touch Marketplace | Managed Marketplace | Affiliate |
|--------|----------------------|--------------------| ---------|
| **Take Rate (of GMV)** | 5-15% | 15-30% | 20-50% of rev share |
| **Gross Margin** | 60-80% | 40-60% | 70-90% |
| **Seller/Supply CAC** | $50-500 | $100-1,000 | $10-100 |
| **Buyer/Demand CAC** | $10-100 | $20-200 | N/A |
| **Monthly Seller Churn** | 5-10% | 3-7% | 10-20% |

**Key Marketplace Metrics:**
- GMV (Gross Merchandise Value): Total transaction value
- Take rate: Platform's revenue / GMV
- Liquidity: % of listings that transact
- Repeat rate: % of buyers who purchase again

**Marketplace Health Benchmarks:**
- Healthy take rate: 10-20% for most categories
- Supply-constrained: Focus on seller acquisition
- Demand-constrained: Focus on buyer acquisition
- Balanced: 3-5 buyers per seller is often healthy

---

### One-Time Purchase / E-Commerce

| Metric | Low-Price (<$50) | Mid-Price ($50-500) | High-Price (>$500) |
|--------|-----------------|--------------------| -------------------|
| **Average Order Value** | $20-50 | $100-300 | $500-5,000 |
| **CAC** | $10-50 | $30-150 | $100-1,000 |
| **Gross Margin** | 30-50% | 40-60% | 50-70% |
| **Repeat Purchase Rate** | 20-40%/year | 10-30%/year | 5-15%/year |

**E-Commerce Conversion Benchmarks:**
- Site visit → Purchase: 1-3%
- Cart → Checkout: 40-60%
- Email → Click: 2-5%
- Click → Purchase: 2-5%

---

### Usage-Based / Transactional

| Metric | API/Infrastructure | Payments/Fintech | Communications |
|--------|-------------------|------------------|----------------|
| **Revenue Model** | Per API call / GB / compute | % of transaction | Per message / minute |
| **Gross Margin** | 50-70% | 30-50% | 40-60% |
| **Monthly Churn** | 2-5% | 1-3% | 3-7% |
| **Net Revenue Retention** | 100-130% | 100-120% | 90-110% |
| **CAC** | $500-5,000 | $1,000-10,000 | $200-2,000 |

**Key Usage-Based Metrics:**
- Net Revenue Retention (NRR): Revenue from existing customers this year / last year
  - >100% means expansion exceeds churn
  - Best-in-class: 120-150%
- Usage growth rate: Month-over-month growth in usage per customer

---

## Market Sizing Reference Data

### TAM Estimation Sources

| Source | Best For | Access |
|--------|----------|--------|
| Statista | Consumer markets, quick estimates | Paid, some free |
| IBISWorld | Industry-level TAM | Paid |
| Gartner | Enterprise tech markets | Paid |
| LinkedIn Sales Navigator | B2B company counts | Paid |
| Census Bureau | US business counts by size/industry | Free |
| BLS | Employment and wage data | Free |
| SEC Filings (S-1s) | Competitor market sizing | Free |
| Industry associations | Niche market data | Varies |

### TAM Quick Estimates by Category

| Market | Estimated Global TAM |
|--------|---------------------|
| Global SaaS | $200B+ |
| CRM software | $50B+ |
| HR software | $30B+ |
| Marketing automation | $10B+ |
| E-commerce (US) | $1T+ |
| Digital advertising (US) | $200B+ |
| Online gaming | $150B+ |
| Streaming video | $100B+ |
| Online fitness | $30B+ |

### SAM Reduction Factors

| Factor | Typical SAM as % of TAM |
|--------|------------------------|
| US-only focus | 30-40% of global |
| English-only | 25-35% of global |
| Single vertical focus | 5-20% of broad market |
| Enterprise-only | 10-20% of all businesses |
| SMB-only | 40-60% of all businesses |
| Geographic region | Varies by market |

### SOM Reality Check

| Evidence Level | Reasonable SOM Claim |
|----------------|---------------------|
| No product yet | 0.5-1% |
| MVP, no customers | 1-2% |
| Product-market fit, early revenue | 2-3% |
| Proven growth, Series A+ | 3-5% |
| Market leader in category | 5-15% |
| Dominant player | 15-30% |

**Red Flag Phrases:**
- "We only need 1% of the market" (often used to justify inflated TAM)
- "No direct competitors" (there's always competition for budget/attention)
- "First mover advantage" (rarely sustainable)

---

## Customer Economics Deep Dive

### LTV Calculation Examples

**Example 1: B2B SaaS Mid-Market**
- Annual contract: $24,000
- Gross margin: 75%
- Monthly churn: 1.5% → Lifetime: 67 months
- LTV = $24,000 × 0.75 × (67/12) = **$100,500**

**Example 2: B2C Subscription**
- Monthly price: $15
- Gross margin: 80%
- Monthly churn: 6% → Lifetime: 17 months
- Annual value = $15 × 12 = $180
- LTV = $180 × 0.80 × (17/12) = **$204**

**Example 3: Marketplace Seller**
- Average GMV/month: $2,000
- Take rate: 12%
- Revenue/month: $240
- Gross margin: 70%
- Monthly churn: 5% → Lifetime: 20 months
- LTV = ($240 × 12) × 0.70 × (20/12) = **$3,360**

### CAC Calculation Components

**Full CAC Formula:**
\`\`\`
CAC = (Marketing Spend + Sales Spend + Tools + Overhead) / New Customers Acquired
\`\`\`

**What to Include:**
| Category | Include |
|----------|---------|
| Marketing | Paid ads, content costs, events, PR, agency fees |
| Sales | Salaries, commissions, bonuses, travel |
| Tools | CRM, marketing automation, sales tools |
| Overhead | Allocated office, management time |

**What NOT to Include:**
- Product development costs
- Customer success (post-acquisition)
- General company overhead

### LTV:CAC Benchmarks by Stage

| Company Stage | Acceptable LTV:CAC |
|---------------|-------------------|
| Pre-PMF (testing) | 1:1 - 2:1 |
| Early Growth | 2:1 - 3:1 |
| Scaling | 3:1 - 5:1 |
| Mature | 4:1 - 8:1 |
| Highly Efficient | >8:1 |

**Warning:** LTV:CAC >10:1 often means:
- CAC is underestimated (missing costs)
- Growth is being under-invested
- Or truly exceptional business (rare)

### Payback Period Implications

| Payback | Cash Requirement | Risk Level |
|---------|-----------------|------------|
| <6 months | Low | Low |
| 6-12 months | Moderate | Moderate |
| 12-18 months | High | Moderate-High |
| 18-24 months | Very High | High |
| >24 months | Extreme | Very High |

**Impact on Fundraising:**
- <12 month payback: Can scale with modest funding
- 12-24 month payback: Need significant funding runway
- >24 month payback: Requires deep-pocketed investors or path to improvement

---

## Pricing Reference Data

### SaaS Pricing Tiers (Typical)

| Tier | Monthly Price | Target Customer |
|------|--------------|-----------------|
| Free/Freemium | $0 | Lead generation |
| Starter | $10-50 | Individuals, tiny teams |
| Pro/Growth | $50-200 | Small teams, SMB |
| Business | $200-1,000 | Mid-market teams |
| Enterprise | Custom | Large organizations |

### Pricing Psychology Anchors

| Price Point | Perception |
|-------------|------------|
| $9/mo | Impulse, don't think twice |
| $29/mo | Reasonable for business tool |
| $99/mo | Serious tool, needs justification |
| $299/mo | Significant investment, needs approval |
| $999/mo | Enterprise, needs procurement |

### Annual vs Monthly Pricing

| Offer | Typical Discount |
|-------|-----------------|
| Monthly | Base price |
| Annual (paid monthly) | 10-20% discount |
| Annual (paid upfront) | 15-30% discount |

**Annual Benefits:**
- Lower churn (commitment)
- Better cash flow
- Higher LTV
- Typical uptake: 30-50% of customers choose annual

---

## Growth Benchmarks

### Revenue Growth by Stage

| Stage | Annual Revenue | Typical Growth Rate |
|-------|---------------|---------------------|
| Pre-revenue | $0 | N/A |
| Early | $0-1M ARR | 100-300%+ |
| Growth | $1-10M ARR | 80-150% |
| Scale | $10-50M ARR | 50-100% |
| Expansion | $50-100M ARR | 30-60% |
| Mature | $100M+ ARR | 20-40% |

### The "T2D3" Framework (for VC-backed SaaS)

After reaching $2M ARR:
- Triple to $6M
- Triple to $18M
- Double to $36M
- Double to $72M
- Double to $144M

This is aggressive but represents "good" venture-scale growth.

### Customer Growth Sanity Check

| Year | Typical Multiple vs Year 1 |
|------|---------------------------|
| Year 1 | Baseline |
| Year 2 | 2-3x Year 1 |
| Year 3 | 1.5-2x Year 2 |
| Year 4 | 1.3-1.5x Year 3 |
| Year 5 | 1.2-1.4x Year 4 |

**Growth Deceleration is Normal:**
- Year 1→2: Still finding channels, rapid growth
- Year 2→3: Channels start to saturate
- Year 3+: Market penetration slows, need new markets

---

## Red Flags Reference

### Metrics That Don't Add Up

| Claim | Reality Check |
|-------|--------------|
| "5% market share in Year 1" | That's exceptional—what distribution advantage? |
| "0.5% monthly churn" | Enterprise only, with long contracts |
| "$50 CAC for B2B" | Missing sales costs, or purely viral/PLG |
| "90% gross margin" | What about hosting, support, COGS? |
| "100% year-over-year growth for 5 years" | Possible but exceptional |

### Questions to Ask for Each Red Flag

**High Market Share Claims:**
- What's your distribution advantage?
- How much are you spending on acquisition?
- What's your differentiation vs. incumbents?

**Very Low Churn:**
- Are you enterprise with annual contracts?
- What's your cohort retention actually showing?
- Is this logo churn or revenue churn?

**Very Low CAC:**
- Is this just marketing, or including sales?
- Are you including attribution costs?
- Is this from a small, non-representative sample?

**Very High Margins:**
- What's included in COGS?
- Do you have any services/support cost?
- Is hosting truly negligible at scale?

---

## Industry-Specific Benchmarks

### Fintech

| Metric | Range |
|--------|-------|
| Transaction fee | 2-3% |
| B2B payments | 0.5-2% |
| Lending margin | 3-10% |
| Insurance loss ratio | 60-80% |
| Churn (B2B) | 1-3% monthly |

### Healthcare Tech

| Metric | Range |
|--------|-------|
| Sales cycle | 6-18 months |
| Implementation | 3-12 months |
| Annual churn | 10-20% |
| Gross margin | 60-75% |

### EdTech

| Metric | B2C | B2B |
|--------|-----|-----|
| Price point | $10-100/mo | $5-50/seat/mo |
| Monthly churn | 5-15% | 2-5% |
| Conversion (free→paid) | 2-8% | N/A |
| Seasonality | High (back to school) | Moderate |

### Dev Tools / Infrastructure

| Metric | Range |
|--------|-------|
| Free → Paid conversion | 2-5% |
| Monthly churn (paid) | 2-5% |
| Net Revenue Retention | 110-140% |
| Gross margin | 60-80% |

---

## Using These Benchmarks

### Do's
1. Use benchmarks as sanity checks, not gospel
2. Ask "why is this different?" when user numbers diverge
3. Acknowledge when their specific situation may warrant different assumptions
4. Use ranges rather than single numbers

### Don'ts
1. Override user knowledge of their specific market
2. Apply enterprise benchmarks to SMB products (or vice versa)
3. Treat benchmarks as maximums or minimums
4. Ignore industry-specific dynamics

### Conversation Phrases

**When user is in range:**
"That aligns with what I typically see for [business model] companies."

**When user is optimistic:**
"That's above typical benchmarks of X. What gives you confidence in the higher number?"

**When user is uncertain:**
"Similar products typically see X-Y range. Does that feel right for your situation, or are there factors that would push it higher or lower?"

**When user needs a default:**
"Without more data, a reasonable starting assumption would be X, which is [source]. We can note this as an assumption to revisit."`

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
    title: 'Knowledge: Field Reference Guide',
    description: 'All field definitions and detailed guidance for external valuations',
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
    description: 'External product benchmarks by business model, market sizing data, and unit economics',
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

export default function ExternalValuationAssistantPage() {
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
        <h1 className="text-2xl font-bold text-gray-900">External Valuation Assistant Setup</h1>
        <p className="text-gray-600 mt-1">
          Set up an AI-powered Claude Project to help product managers and business development leads complete external product valuations
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
                    Go to <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">claude.ai</a> → Projects → Create a new project named "External Product Valuation Assistant"
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
                    Start a conversation with: "I need to value a product called DataSync Pro. It's a B2B SaaS tool that helps mid-market companies sync customer data between their CRM and marketing tools."
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
          <div className="bg-gradient-to-br from-green-500 to-teal-600 rounded-lg shadow p-6 text-white">
            <h3 className="font-semibold mb-2">What Users Experience</h3>
            <ul className="text-sm space-y-2 text-green-100">
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Guided market sizing (TAM/SAM/SOM)
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Unit economics coaching (LTV, CAC, payback)
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Business model-specific benchmarks
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Pushback on unrealistic assumptions
              </li>
              <li className="flex items-start gap-2">
                <svg className="w-4 h-4 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
                Formatted output for Product Jarvis
              </li>
            </ul>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Supported Business Models</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded text-xs font-medium">B2B SaaS</span>
                <span className="text-gray-500">SMB, Mid-Market, Enterprise</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">B2C</span>
                <span className="text-gray-500">Subscription, one-time purchase</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-green-100 text-green-700 rounded text-xs font-medium">Marketplace</span>
                <span className="text-gray-500">GMV, take rates, network effects</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">Usage-based</span>
                <span className="text-gray-500">APIs, transactional</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Key Metrics Explained</h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-700">LTV:CAC Ratio</h4>
                <p className="text-gray-500 mt-1">
                  Customer lifetime value vs acquisition cost. Target ≥3:1 for healthy unit economics.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Payback Period</h4>
                <p className="text-gray-500 mt-1">
                  Months to recover CAC. Target ≤12 months for SMB, ≤24 for enterprise.
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Net 3-Year Revenue</h4>
                <p className="text-gray-500 mt-1">
                  True profit after acquisition costs and GTM spend.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2">Troubleshooting</h3>
            <ul className="text-sm text-amber-700 space-y-2">
              <li><strong>Too generic responses?</strong> Make sure the full system prompt is copied</li>
              <li><strong>Not using benchmarks?</strong> Verify knowledge files are uploaded correctly</li>
              <li><strong>Not challenging estimates?</strong> Ask "does this seem realistic?" explicitly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
