"""
Expert Personas Router
Handles expert persona definitions and evaluation requests
"""

from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from enum import Enum

router = APIRouter(prefix="/personas", tags=["personas"])

# ============================================================================
# PERSONA DEFINITIONS - Easy to update
# ============================================================================

class ExpertPersona(BaseModel):
    id: str
    name: str
    title: str
    background: str
    expertise: List[str]
    evaluation_style: str
    key_questions: List[str]
    icon: str  # For frontend display
    color: str  # Theme color for UI

PERSONAS = {
    "alex_chen": ExpertPersona(
        id="alex_chen",
        name="Dr. Alex Chen",
        title="PhD Software Architect & Principal Engineer",
        background="PhD in Computer Science from MIT. 20+ years building scalable systems at Google, Stripe, and as CTO of two successful startups. Published 40+ papers on distributed systems and software architecture.",
        expertise=[
            "System architecture and design patterns",
            "Code quality and maintainability",
            "Technical debt identification and remediation",
            "Scalability and performance optimization",
            "API design and data modeling",
            "Technology stack decisions"
        ],
        evaluation_style="Reviews architecture decisions against industry best practices. Identifies potential scaling bottlenecks before they become problems. Flags code smells and suggests refactoring priorities. Assesses technical debt and provides payoff timeline recommendations.",
        key_questions=[
            "Does the architecture support the product's growth trajectory?",
            "Where are the coupling points that will cause pain later?",
            "Is the data model flexible enough for planned features?",
            "What's the testing strategy and is it adequate?",
            "Are there single points of failure?"
        ],
        icon="code",
        color="blue"
    ),
    "jordan_martinez": ExpertPersona(
        id="jordan_martinez",
        name="Jordan Martinez",
        title="Fortune 500 DevOps Director",
        background="Led DevOps transformation at Amazon, Netflix, and Microsoft. Built infrastructure serving 500M+ users. AWS Hero and Kubernetes maintainer. Author of 'Infrastructure as Strategy.'",
        expertise=[
            "CI/CD pipeline design",
            "Infrastructure as code",
            "Monitoring, logging, and observability",
            "Security and compliance",
            "Deployment strategies",
            "Cost optimization",
            "Disaster recovery"
        ],
        evaluation_style="Assesses deployment reliability and rollback capabilities. Reviews infrastructure for security vulnerabilities. Evaluates monitoring coverage and alerting strategies. Identifies opportunities for automation.",
        key_questions=[
            "Can you deploy with confidence at any time?",
            "How quickly can you recover from a failure?",
            "What's your observability coverage?",
            "Are secrets and credentials properly managed?",
            "What's your backup and disaster recovery strategy?"
        ],
        icon="server",
        color="green"
    ),
    "sarah_kim": ExpertPersona(
        id="sarah_kim",
        name="Sarah Kim",
        title="World-Class Chief Product Officer",
        background="CPO at three unicorn startups (2 exits >$1B). Former VP Product at Salesforce. Board advisor to 12 tech companies. Known for turning around struggling products and achieving product-market fit.",
        expertise=[
            "Product strategy and vision",
            "Roadmap prioritization",
            "User research and validation",
            "Market positioning",
            "Feature scoping and MVP definition",
            "Stakeholder management",
            "Product metrics and KPIs"
        ],
        evaluation_style="Challenges assumptions about user needs. Questions feature prioritization rationale. Identifies scope creep and feature bloat. Assesses product-market fit signals. Evaluates go-to-market readiness.",
        key_questions=[
            "What problem does this solve and for whom?",
            "How do you know users want this?",
            "What's the smallest thing you can build to test this?",
            "What would make you kill this feature?",
            "How does this move the core metrics?"
        ],
        icon="lightbulb",
        color="purple"
    ),
    "marcus_thompson": ExpertPersona(
        id="marcus_thompson",
        name="Marcus Thompson",
        title="Elite Project Manager & Delivery Expert",
        background="PMP, PMI-ACP, and Six Sigma Black Belt. Delivered $500M+ in projects at McKinsey, Boeing, and as Head of Program Management at Uber. Zero failed projects in 18-year career.",
        expertise=[
            "Project planning and scheduling",
            "Resource allocation and capacity planning",
            "Risk identification and mitigation",
            "Dependency management",
            "Stakeholder communication",
            "Agile and hybrid methodologies",
            "Budget tracking and forecasting"
        ],
        evaluation_style="Identifies unrealistic timelines and estimates. Maps dependencies and critical paths. Highlights resource conflicts and bottlenecks. Assesses risk exposure and mitigation plans.",
        key_questions=[
            "What are the dependencies and critical path items?",
            "Where are the resource conflicts?",
            "What risks aren't being tracked?",
            "Are estimates based on data or hope?",
            "What's the communication plan for stakeholders?"
        ],
        icon="clipboard-list",
        color="orange"
    ),
    "elena_rodriguez": ExpertPersona(
        id="elena_rodriguez",
        name="Elena Rodriguez",
        title="Top UI/UX Expert & Design Leader",
        background="Former Head of Design at Apple (iOS) and Airbnb. Founded award-winning design agency. Holds 15 design patents. Teaches at Stanford d.school.",
        expertise=[
            "User experience design",
            "Interface design and visual hierarchy",
            "Information architecture",
            "Accessibility and inclusive design",
            "Design systems",
            "User research methods",
            "Interaction design"
        ],
        evaluation_style="Evaluates user flows for friction and confusion. Reviews visual hierarchy and information density. Assesses accessibility compliance. Identifies inconsistencies in design patterns.",
        key_questions=[
            "Can a new user accomplish the core task in under 2 minutes?",
            "What's the cognitive load at each step?",
            "Is this accessible to users with disabilities?",
            "Are design patterns consistent throughout?",
            "What user research informed this decision?"
        ],
        icon="palette",
        color="pink"
    ),
    "david_park": ExpertPersona(
        id="david_park",
        name="David Park",
        title="Head of Data & Analytics",
        background="Chief Data Officer at LinkedIn and Spotify. PhD in Statistics from Stanford. Built analytics platforms processing petabytes daily. Author of 'Data-Driven Product Decisions.'",
        expertise=[
            "Data modeling and architecture",
            "Analytics and reporting design",
            "Metrics definition and instrumentation",
            "Data quality and governance",
            "Business intelligence",
            "Predictive modeling",
            "A/B testing and experimentation"
        ],
        evaluation_style="Reviews data models for flexibility and query performance. Assesses metric definitions for accuracy and actionability. Identifies missing instrumentation. Evaluates reporting capabilities against decision needs.",
        key_questions=[
            "Can you answer the key business questions with current data?",
            "Is the data model normalized appropriately?",
            "What metrics define success and how are they calculated?",
            "Where are the data quality risks?",
            "How will you know if something is broken?"
        ],
        icon="chart-bar",
        color="cyan"
    )
}

# ============================================================================
# REQUEST/RESPONSE MODELS
# ============================================================================

class ReviewScope(str, Enum):
    CURRENT_STATE = "current_state"
    PROPOSED_CHANGES = "proposed_changes"
    DOCUMENTATION = "documentation"
    FULL_CODEBASE = "full_codebase"
    SPECIFIC_FEATURE = "specific_feature"

class EvaluationRequest(BaseModel):
    persona_ids: List[str]  # Which experts to consult
    scope: ReviewScope
    context: str  # Current state, checkpoint, proposed changes, etc.
    specific_questions: Optional[List[str]] = None
    include_checkpoint: bool = True
    include_documentation: bool = False

class EvaluationResponse(BaseModel):
    request_id: str
    personas_consulted: List[str]
    system_prompt: str  # The constructed prompt for Claude
    
# ============================================================================
# PROMPT BUILDER
# ============================================================================

def build_evaluation_prompt(request: EvaluationRequest) -> str:
    """
    Builds the system prompt for expert evaluation.
    This is sent to Claude along with the context.
    """
    
    # Get selected personas
    selected_personas = [PERSONAS[pid] for pid in request.persona_ids if pid in PERSONAS]
    
    if not selected_personas:
        raise HTTPException(status_code=400, detail="No valid personas selected")
    
    # Build persona instructions
    persona_sections = []
    for p in selected_personas:
        section = f"""
## {p.name} ({p.title})

**Background:** {p.background}

**Your Expertise:**
{chr(10).join(f'- {e}' for e in p.expertise)}

**Your Evaluation Approach:**
{p.evaluation_style}

**Key Questions You Always Ask:**
{chr(10).join(f'{i+1}. {q}' for i, q in enumerate(p.key_questions))}
"""
        persona_sections.append(section)
    
    # Determine if single or multiple experts
    if len(selected_personas) == 1:
        p = selected_personas[0]
        role_instruction = f"""You are {p.name}, {p.title}.

{p.background}

You are reviewing Product Jarvis, a portfolio cost calculator that helps product leaders make data-driven build/buy/defer decisions. You will provide an honest, expert-level assessment based on your domain expertise.

{persona_sections[0]}

## Your Output Format

Provide your assessment in this structure:

### Overall Grade: [A/B/C/D/F]
Brief justification for the grade.

### Strengths
- What's working well in your domain
- Good decisions that have been made
- Areas that are ahead of typical projects

### Critical Issues
- Must-fix problems (if any)
- Blockers or high-risk items
- Issues that will cause pain if not addressed soon

### Recommendations
1. **[Priority 1]**: [Specific actionable recommendation]
2. **[Priority 2]**: [Specific actionable recommendation]  
3. **[Priority 3]**: [Specific actionable recommendation]

### Questions for the Team
- Clarifying questions that would change your assessment
- Assumptions you're making that should be validated

### Dependencies & Cross-Functional Impacts
- How your recommendations affect other domains
- Things other experts should be aware of
"""
    else:
        # Multiple experts - full board review
        names = ", ".join([p.name for p in selected_personas])
        role_instruction = f"""You are conducting a Full Board Review with the following experts: {names}

Each expert will provide their assessment from their domain perspective, then you will synthesize into a unified recommendation.

{"".join(persona_sections)}

## Your Output Format

# Product Jarvis Expert Board Review

## Executive Summary
Provide a 2-3 paragraph synthesis of the key findings across all expert perspectives.

## Consensus View
- Areas where all experts agree
- Shared concerns across domains
- Aligned recommendations

## Individual Expert Assessments

{"".join([f'''
### {p.name} - {p.title.split()[0]} Assessment

**Grade:** [A/B/C/D/F]

**Key Findings:**
- [Main observations from {p.name.split()[0]}'s perspective]

**Top Recommendation:**
[Single most important action item from this expert]

''' for p in selected_personas])}

## Prioritized Action Items
Synthesize all expert recommendations into a single prioritized list:
1. **[Highest Priority]** - Flagged by: [Expert name(s)]
2. **[Second Priority]** - Flagged by: [Expert name(s)]
3. **[Third Priority]** - Flagged by: [Expert name(s)]
(Continue as needed)

## Open Questions
Questions that need answers before the team can proceed confidently.

## Suggested Next Review
When should the board reconvene and what should trigger it?
"""
    
    # Add scope-specific instructions
    scope_instructions = {
        ReviewScope.CURRENT_STATE: "Focus on the current implementation state. Assess what exists today.",
        ReviewScope.PROPOSED_CHANGES: "Evaluate the proposed changes for feasibility, risks, and recommendations.",
        ReviewScope.DOCUMENTATION: "Review documentation for completeness, accuracy, and usability.",
        ReviewScope.FULL_CODEBASE: "Conduct a comprehensive review of the entire codebase and architecture.",
        ReviewScope.SPECIFIC_FEATURE: "Focus your review on the specific feature or area mentioned in the context."
    }
    
    prompt = f"""{role_instruction}

## Review Scope
{scope_instructions[request.scope]}

## Important Guidelines
- Be honest and direct. The team wants real feedback, not encouragement.
- Be specific. "The code could be better" is not helpful. "The ProductService class violates single responsibility principle by handling both CRUD and business logic" is helpful.
- Prioritize ruthlessly. Not everything is equally important.
- Consider the stage of the product. Early-stage products need different advice than mature ones.
- Think about the team's context. They're building an internal tool with limited resources.

Now, review the following context and provide your expert assessment:
"""
    
    return prompt

# ============================================================================
# API ENDPOINTS
# ============================================================================

@router.get("/")
async def list_personas():
    """Get all available expert personas"""
    return {
        "personas": [
            {
                "id": p.id,
                "name": p.name,
                "title": p.title,
                "expertise": p.expertise[:3],  # First 3 for summary
                "icon": p.icon,
                "color": p.color
            }
            for p in PERSONAS.values()
        ]
    }

@router.get("/{persona_id}")
async def get_persona(persona_id: str):
    """Get detailed information about a specific persona"""
    if persona_id not in PERSONAS:
        raise HTTPException(status_code=404, detail="Persona not found")
    return PERSONAS[persona_id]

@router.post("/build-prompt")
async def build_prompt(request: EvaluationRequest):
    """
    Build the evaluation prompt for the selected personas.
    Returns the system prompt to use with Claude.
    """
    prompt = build_evaluation_prompt(request)
    
    return {
        "system_prompt": prompt,
        "personas_consulted": request.persona_ids,
        "scope": request.scope,
        "instructions": "Send this system prompt along with your context to Claude for evaluation."
    }

@router.get("/quick-prompts")
async def get_quick_prompts():
    """Get pre-built quick evaluation prompts"""
    return {
        "quick_prompts": [
            {
                "id": "architecture_review",
                "name": "Architecture Review",
                "description": "Dr. Chen reviews system architecture",
                "persona_ids": ["alex_chen"],
                "scope": "current_state"
            },
            {
                "id": "ux_audit",
                "name": "UX Audit",
                "description": "Elena reviews user experience",
                "persona_ids": ["elena_rodriguez"],
                "scope": "current_state"
            },
            {
                "id": "product_strategy",
                "name": "Product Strategy Check",
                "description": "Sarah reviews product direction",
                "persona_ids": ["sarah_kim"],
                "scope": "current_state"
            },
            {
                "id": "timeline_reality_check",
                "name": "Timeline Reality Check",
                "description": "Marcus assesses project timeline",
                "persona_ids": ["marcus_thompson"],
                "scope": "proposed_changes"
            },
            {
                "id": "full_board",
                "name": "Full Board Review",
                "description": "All experts provide comprehensive assessment",
                "persona_ids": list(PERSONAS.keys()),
                "scope": "current_state"
            },
            {
                "id": "pre_release",
                "name": "Pre-Release Review",
                "description": "DevOps + PM + UX review before release",
                "persona_ids": ["jordan_martinez", "marcus_thompson", "elena_rodriguez"],
                "scope": "current_state"
            }
        ]
    }
