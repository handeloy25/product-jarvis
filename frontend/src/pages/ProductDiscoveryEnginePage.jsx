import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useToast } from '../components/Toast'

const SYSTEM_PROMPT = `# Product Discovery Engine - System Prompt

You are the Product Discovery Engine, an AI assistant that transforms completed product valuations into development-ready documentation. You help product managers and development leads create user flows, specifications, personas, and pre-mortem analyses.

## Your Core Mission

Take the raw output from a Product Jarvis valuation and generate:
1. **User Flow** - Visual journey with Mermaid diagrams
2. **Specifications** - Lean PRD with task breakdown by role
3. **Persona Feedback** - User persona + pre-mortem analysis

You auto-detect whether the product is Internal or External and adapt your outputs accordingly.

---

## How to Start

When a user provides their valuation output, analyze it to understand:
- Product name and description
- Product type (Internal vs External)
- Key value drivers
- Target users/customers
- Strategic context

Then offer to generate the three document types in sequence.

---

## Document 1: User Flow

Create a visual journey using Mermaid syntax. Include:
- Entry points
- Key decision nodes
- Happy path and error paths
- Integration points

Output format:
\`\`\`mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Action]
    B -->|No| D[Alternative]
\`\`\`

---

## Document 2: Specifications (Lean PRD)

Structure:
1. **Problem Statement** (2-3 sentences)
2. **Solution Overview** (2-3 sentences)
3. **User Stories** (3-5 key stories in "As a... I want... So that..." format)
4. **Task Breakdown by Role** - List tasks with estimated hours per role type
5. **Success Metrics** - 3-5 measurable outcomes
6. **Out of Scope** - What we're NOT building

---

## Document 3: Persona (with Feedback)

This is a TWO-STEP process to ensure quality:

### Step 1: Present Persona for Approval
First, create and present the persona profile WITHOUT generating the full document:
- Name, role, company/context
- Goals (3 items)
- Pain points (3 items)
- Current behavior and workarounds
- A representative quote

Ask: "Does this persona feel realistic for your users? Once you approve, I'll generate the complete persona document with their detailed feedback."

### Step 2: Generate Combined Persona Document (after approval)
Once the user approves the persona, generate a SINGLE combined document containing:

1. **Persona Profile** (the approved persona details)
2. **Pre-Mortem Analysis** - "It's 6 months after launch and this product failed. Why?"
   - Technical risks
   - Adoption risks  
   - Market/competitive risks
   - Early warning signs
3. **Devil's Advocate** - Challenge 3 key assumptions in the valuation
4. **Prioritized Recommendations** - Top 5 recommendations, ranked by impact

IMPORTANT: Output everything in ONE document. Do not create separate persona and feedback documents.

---

## Conversation Flow

1. User pastes valuation output
2. You analyze and confirm understanding
3. Generate User Flow (offer to refine)
4. Generate Specifications (offer to refine)
5. **Present Persona for approval** (profile only, no document yet)
6. User approves persona
7. Generate **combined Persona document** (profile + pre-mortem + devil's advocate + recommendations)
8. Provide final artifacts ready for copy/paste into Product Jarvis

---

## Tone

- Be direct and practical
- Focus on actionable outputs
- Ask clarifying questions when needed
- Offer options when there's ambiguity

---

## Starting the Conversation

"Hi! I'm the Product Discovery Engine. I transform completed valuations into development-ready docs: user flows, specs, and personas.

Paste your Raw Valuation Output from Product Jarvis, and I'll generate all three documents for you.

Note: For the persona, I'll first show you the profile for approval before generating the full document with feedback."`

const PRD_TEMPLATE = `# Lean PRD Template

## Product Name
[From valuation]

## Problem Statement
[2-3 sentences describing the core problem]

## Solution Overview
[2-3 sentences describing how this product solves it]

---

## User Stories

### Primary User: [Role]

1. As a [role], I want [capability] so that [benefit]
2. As a [role], I want [capability] so that [benefit]
3. As a [role], I want [capability] so that [benefit]

### Secondary User: [Role]

4. As a [role], I want [capability] so that [benefit]
5. As a [role], I want [capability] so that [benefit]

---

## Task Breakdown by Role

### Development
| Task | Est. Hours | Notes |
|------|------------|-------|
| [Task 1] | X | |
| [Task 2] | X | |

### Design
| Task | Est. Hours | Notes |
|------|------------|-------|
| [Task 1] | X | |

### QA
| Task | Est. Hours | Notes |
|------|------------|-------|
| [Task 1] | X | |

---

## Success Metrics

| Metric | Current | Target | Timeline |
|--------|---------|--------|----------|
| [Metric 1] | X | Y | Z weeks |
| [Metric 2] | X | Y | Z weeks |

---

## Out of Scope

- [Feature/capability NOT included]
- [Feature/capability NOT included]
- [Feature/capability NOT included]

---

## Dependencies

- [External system/team dependency]
- [Data/API dependency]

---

## Risks & Mitigations

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| [Risk 1] | High/Med/Low | High/Med/Low | [Action] |`

const PERSONA_FRAMEWORK = `# Persona Framework

## Two-Step Process

### Step 1: Persona Profile (for approval)
Present this to the user for approval before generating the full document:

- **Name:** [Realistic name]
- **Role:** [Job title]
- **Company/Context:** [Industry, size]
- **Experience:** [Years in role]

**Goals:**
1. [Primary goal related to product]
2. [Secondary goal]
3. [Career/personal goal]

**Pain Points:**
1. [Current frustration this product addresses]
2. [Related frustration]
3. [Context frustration]

**Current Behavior:**
- Tools used: [List]
- Workarounds: [How they solve this today]
- Time spent: [Estimate]

**Quote:**
> "[A realistic quote that captures their perspective]"

---

## Step 2: Combined Persona Document (after approval)

Once approved, generate this SINGLE document:

\`\`\`markdown
# Persona: [Name]

## Profile

| Attribute | Details |
|-----------|--------|
| **Name** | [Name] |
| **Role** | [Job title] |
| **Company/Context** | [Industry, size] |
| **Experience** | [Years in role] |

### Goals
1. [Primary goal]
2. [Secondary goal]
3. [Career/personal goal]

### Pain Points
1. [Frustration 1]
2. [Frustration 2]
3. [Frustration 3]

### Current Behavior
- **Tools used:** [List]
- **Workarounds:** [How they solve this today]
- **Time spent:** [Estimate]

### Quote
> "[Realistic quote]"

---

## Pre-Mortem Analysis

*"It's 6 months after launch and this product failed. Why?"*

### Most Likely Failure Mode
[Description of the most probable way this fails]

### Risk Categories

| Category | Risk | Likelihood | Impact |
|----------|------|------------|--------|
| Technical | [Risk] | High/Med/Low | High/Med/Low |
| Adoption | [Risk] | High/Med/Low | High/Med/Low |
| Market | [Risk] | High/Med/Low | High/Med/Low |

### Early Warning Signs
- [Signal 1]
- [Signal 2]
- [Signal 3]

---

## Devil's Advocate

| Assumption | Challenge | If Wrong... |
|------------|-----------|-------------|
| [Assumption 1] | [What if wrong?] | [Impact] |
| [Assumption 2] | [What if wrong?] | [Impact] |
| [Assumption 3] | [What if wrong?] | [Impact] |

---

## Prioritized Recommendations

1. **[Action]** - [Why this is #1 priority]
2. **[Action]** - [Why important]
3. **[Action]** - [Why important]
4. **[Action]** - [Why important]
5. **[Action]** - [Why important]
\`\`\`

---

## Persona Types by Product Type

### Internal Products
- **Power User:** Heavy daily user who will maximize features
- **Occasional User:** Uses weekly/monthly for specific tasks
- **Stakeholder:** Consumes outputs but doesn't use directly

### External Products
- **Champion:** Internal buyer who advocates for purchase
- **End User:** Daily user who needs to adopt
- **Economic Buyer:** Signs the check, cares about ROI`

const PREMORTEM_FRAMEWORK = `# Pre-Mortem & Devil's Advocate Framework

## Pre-Mortem Exercise

### Scenario
"It's [6 months/1 year] after launch. This product has failed to meet expectations. What went wrong?"

### Categories of Failure

#### 1. Technical Failures
- Integration broke or was too complex
- Performance didn't scale
- Security/compliance issue emerged
- Technical debt made iteration impossible

#### 2. Adoption Failures
- Users didn't change existing behavior
- Training/onboarding was insufficient
- Value wasn't clear enough
- Workflow disruption was too high

#### 3. Market/Competitive Failures
- Competitor launched something better
- Market shifted during development
- Pricing was wrong
- Timing was off

#### 4. Organizational Failures
- Lost executive sponsorship
- Key team members left
- Priorities shifted mid-project
- Resources were reallocated

---

## Devil's Advocate Questions

For each key assumption in the valuation, ask:

1. **Value Assumption:** "What if the estimated value is 50% lower? Does it still make sense?"

2. **Adoption Assumption:** "What if only 30% of target users adopt? What's the impact?"

3. **Timeline Assumption:** "What if this takes 2x longer than estimated? What breaks?"

4. **Cost Assumption:** "What if costs are 50% higher? Does ROI still work?"

5. **Competitive Assumption:** "What if a competitor launches something similar in 3 months?"

---

## Output Format

### Pre-Mortem Analysis

**Most Likely Failure Mode:**
[Description of the most probable way this fails]

**Early Warning Signs:**
- [Signal 1]
- [Signal 2]
- [Signal 3]

**Mitigation Actions:**
1. [Specific action to reduce risk]
2. [Specific action to reduce risk]

### Devil's Advocate Findings

| Assumption | Challenge | Recommended Action |
|------------|-----------|-------------------|
| [Assumption 1] | [What if wrong?] | [Action] |
| [Assumption 2] | [What if wrong?] | [Action] |
| [Assumption 3] | [What if wrong?] | [Action] |

### Prioritized Recommendations

1. **[Action]** - [Why this is #1 priority]
2. **[Action]** - [Why important]
3. **[Action]** - [Why important]
4. **[Action]** - [Why important]
5. **[Action]** - [Why important]`

const MERMAID_GUIDE = `# Mermaid Syntax Quick Reference

## Flowchart (User Flows)

\`\`\`mermaid
flowchart TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process]
    B -->|No| D[Alternative]
    C --> E[End]
    D --> E
\`\`\`

### Node Shapes
- \`[Text]\` - Rectangle (process)
- \`{Text}\` - Diamond (decision)
- \`(Text)\` - Rounded (start/end)
- \`([Text])\` - Stadium (database)
- \`[[Text]]\` - Subroutine

### Arrows
- \`-->\` - Arrow
- \`---\` - Line
- \`--text-->\` - Arrow with label
- \`-..->\` - Dotted arrow

### Direction
- \`TD\` - Top to Down
- \`LR\` - Left to Right
- \`BT\` - Bottom to Top
- \`RL\` - Right to Left

---

## Sequence Diagrams

\`\`\`mermaid
sequenceDiagram
    User->>System: Request
    System->>Database: Query
    Database-->>System: Data
    System-->>User: Response
\`\`\`

---

## Journey Diagrams

\`\`\`mermaid
journey
    title User Onboarding Journey
    section Discovery
      Find product: 3: User
      Read landing page: 4: User
    section Signup
      Create account: 5: User
      Verify email: 3: User
    section First Use
      Complete tutorial: 4: User
      Create first item: 5: User
\`\`\`

---

## Tips for Product Docs

1. Keep flows under 15 nodes for readability
2. Use subgraphs to group related steps
3. Label all decision outcomes
4. Include error/exception paths
5. Add notes for complex steps`

const EXAMPLE_OUTPUTS = `# Example Outputs

## Example 1: Internal Product - Dashboard Tool

### User Flow
\`\`\`mermaid
flowchart TD
    A([User Login]) --> B[Dashboard Home]
    B --> C{Select Report Type}
    C -->|Sales| D[Sales Dashboard]
    C -->|Marketing| E[Marketing Dashboard]
    C -->|Operations| F[Operations Dashboard]
    D --> G[Apply Filters]
    E --> G
    F --> G
    G --> H[View Results]
    H --> I{Export?}
    I -->|Yes| J[Select Format]
    I -->|No| K([End])
    J --> L[Download]
    L --> K
\`\`\`

### Spec Excerpt
**Problem:** Department heads spend 4+ hours/week manually compiling reports from 5 different systems.

**Solution:** Unified dashboard pulling from all data sources with customizable views per role.

**Task Breakdown:**
| Task | Role | Hours |
|------|------|-------|
| API integrations (5 systems) | Backend Dev | 40 |
| Dashboard components | Frontend Dev | 32 |
| Filter/query logic | Backend Dev | 16 |
| UI/UX design | Designer | 20 |
| Testing | QA | 16 |

---

## Example 2: External Product - B2B SaaS

### Persona
**Name:** Sarah Chen
**Role:** Head of Operations, Mid-Market E-commerce
**Context:** 50-person company, $15M revenue, high growth

**Goals:**
1. Reduce order processing time by 50%
2. Eliminate manual data entry errors
3. Free up team for strategic work

**Pain Points:**
1. Orders from 3 channels don't sync automatically
2. Inventory mismatches cause overselling
3. Current "solution" is a spreadsheet nightmare

**Quote:** "I have three people whose entire job is copying data between systems. There has to be a better way."

### Pre-Mortem Analysis

**Most Likely Failure Mode:**
Integration complexity with legacy systems causes 3-month delay, allowing competitor to capture early adopters.

**Early Warning Signs:**
- API documentation gaps in customer systems
- Integration timeline slipping by >2 weeks
- Beta customers asking for features outside scope

**Mitigation Actions:**
1. Pre-qualify customers by technical readiness
2. Build integration partner network
3. Define hard scope boundaries in contracts`

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
    id: 'prd-template',
    title: 'Knowledge: PRD Template',
    description: 'Lean PRD structure with task breakdown format',
    destination: 'Project Knowledge (upload as file)',
    content: PRD_TEMPLATE,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
      </svg>
    )
  },
  {
    id: 'persona-framework',
    title: 'Knowledge: Persona Framework',
    description: 'Template for creating realistic user personas',
    destination: 'Project Knowledge (upload as file)',
    content: PERSONA_FRAMEWORK,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    )
  },
  {
    id: 'premortem-framework',
    title: 'Knowledge: Pre-Mortem Framework',
    description: 'Pre-mortem and devil\'s advocate analysis templates',
    destination: 'Project Knowledge (upload as file)',
    content: PREMORTEM_FRAMEWORK,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
      </svg>
    )
  },
  {
    id: 'mermaid-guide',
    title: 'Knowledge: Mermaid Syntax Guide',
    description: 'Quick reference for Mermaid diagram syntax',
    destination: 'Project Knowledge (upload as file)',
    content: MERMAID_GUIDE,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z" />
      </svg>
    )
  },
  {
    id: 'example-outputs',
    title: 'Knowledge: Example Outputs',
    description: 'Sample user flows, specs, and persona feedback',
    destination: 'Project Knowledge (upload as file)',
    content: EXAMPLE_OUTPUTS,
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
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

export default function ProductDiscoveryEnginePage() {
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
        <h1 className="text-2xl font-bold text-gray-900">Product Discovery Engine Setup</h1>
        <p className="text-gray-600 mt-1">
          Transform completed valuations into development-ready documentation
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
                    Go to <a href="https://claude.ai" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">claude.ai</a> → Projects → Create a new project named "Product Discovery Engine"
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
                    Copy each knowledge file below and upload them to the project's Knowledge section
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
                    Paste your Raw Valuation Output from any product in Product Jarvis and ask it to generate documentation
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
            <h3 className="font-semibold mb-2">Workflow</h3>
            <ol className="text-sm space-y-3 text-indigo-100">
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">1</span>
                <span>Complete Raw Valuation Output in Product Jarvis</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">2</span>
                <span>Paste into Product Discovery Engine</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">3</span>
                <span>Review generated User Flow, Specs, Persona Feedback</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="flex-shrink-0 w-5 h-5 bg-white/20 rounded-full flex items-center justify-center text-xs font-bold">4</span>
                <span>Copy outputs back to Product Jarvis documents</span>
              </li>
            </ol>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Deliverables</h3>
            <div className="space-y-4 text-sm">
              <div>
                <h4 className="font-medium text-gray-700">User Flow</h4>
                <p className="text-gray-500 mt-1">
                  Mermaid diagrams showing user journey, decision points, and error paths
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Specifications</h4>
                <p className="text-gray-500 mt-1">
                  Lean PRD with user stories and task breakdown by role
                </p>
              </div>
              <div>
                <h4 className="font-medium text-gray-700">Persona Feedback</h4>
                <p className="text-gray-500 mt-1">
                  User persona with pre-mortem analysis and prioritized recommendations
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow border p-6">
            <h3 className="font-semibold text-gray-900 mb-3">Product Types</h3>
            <div className="space-y-3 text-sm">
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-purple-100 text-purple-700 rounded text-xs font-medium">Internal</span>
                <span className="text-gray-500">Tools for company use</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-1 bg-orange-100 text-orange-700 rounded text-xs font-medium">External</span>
                <span className="text-gray-500">Products to sell</span>
              </div>
            </div>
            <p className="text-xs text-gray-400 mt-3">
              The engine auto-detects type from your valuation output
            </p>
          </div>

          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <h3 className="font-semibold text-amber-800 mb-2">Troubleshooting</h3>
            <ul className="text-sm text-amber-700 space-y-2">
              <li><strong>Missing diagrams?</strong> Ensure Mermaid Guide is uploaded</li>
              <li><strong>Generic outputs?</strong> Paste more detail from valuation</li>
              <li><strong>Wrong product type?</strong> Specify Internal/External explicitly</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
