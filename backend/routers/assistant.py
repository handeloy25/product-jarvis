from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
import os
from database import get_connection

router = APIRouter(prefix="/api/assistant", tags=["assistant"])

def get_portfolio_data() -> dict:
    with get_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT p.*, sd.name as requestor_department_name
            FROM products p
            LEFT JOIN service_departments sd ON p.requestor_type = 'service_department' AND p.requestor_id = sd.id
            ORDER BY p.created_at DESC
        """)
        product_rows = cursor.fetchall()
        
        cursor.execute("SELECT * FROM positions ORDER BY title")
        position_rows = cursor.fetchall()
        
        cursor.execute("SELECT * FROM software_costs ORDER BY name")
        software_rows = cursor.fetchall()
        
        cursor.execute("SELECT * FROM service_departments ORDER BY name")
        dept_rows = cursor.fetchall()
        
        products = []
        for prod in product_rows:
            cursor.execute("""
                SELECT t.*, p.title as position_title, p.department as position_department,
                       p.hourly_cost_min, p.hourly_cost_max
                FROM tasks t
                JOIN positions p ON t.position_id = p.id
                WHERE t.product_id = ?
            """, (prod["id"],))
            task_rows = cursor.fetchall()
            
            cursor.execute("""
                SELECT psa.*, sc.name as software_name, sc.monthly_cost
                FROM product_software_allocations psa
                JOIN software_costs sc ON psa.software_id = sc.id
                WHERE psa.product_id = ?
            """, (prod["id"],))
            software_alloc_rows = cursor.fetchall()
            
            cursor.execute("""
                SELECT psd.*, sd.name as department_name
                FROM product_service_departments psd
                JOIN service_departments sd ON psd.department_id = sd.id
                WHERE psd.product_id = ?
                ORDER BY psd.role DESC, sd.name
            """, (prod["id"],))
            dept_assign_rows = cursor.fetchall()
            
            cursor.execute("SELECT * FROM product_valuations WHERE product_id = ?", (prod["id"],))
            valuation_row = cursor.fetchone()
            
            labor_cost_min = sum(t["estimated_hours"] * t["hourly_cost_min"] for t in task_rows)
            labor_cost_max = sum(t["estimated_hours"] * t["hourly_cost_max"] for t in task_rows)
            labor_cost_avg = (labor_cost_min + labor_cost_max) / 2 if task_rows else 0
            
            software_cost = sum(
                (sa["monthly_cost"] * sa["allocation_percent"] / 100)
                for sa in software_alloc_rows
            )
            
            total_cost_min = labor_cost_min + software_cost
            total_cost_max = labor_cost_max + software_cost
            total_cost_avg = (total_cost_min + total_cost_max) / 2
            
            estimated_value = prod["estimated_value"] or 0
            
            if total_cost_avg > 0:
                roi = ((estimated_value - total_cost_avg) / total_cost_avg) * 100
                gain_pain = estimated_value / total_cost_avg
            else:
                roi = None
                gain_pain = None
            
            if roi is not None:
                if roi >= 100:
                    recommendation = "BUILD"
                elif roi >= 50:
                    recommendation = "CONSIDER"
                elif roi >= 0:
                    recommendation = "DEFER"
                else:
                    recommendation = "KILL"
            else:
                recommendation = "N/A (no costs assigned)"
            
            tasks = [{
                "name": t["name"],
                "position": t["position_title"],
                "department": t["position_department"],
                "hours": t["estimated_hours"],
                "cost_min": t["estimated_hours"] * t["hourly_cost_min"],
                "cost_max": t["estimated_hours"] * t["hourly_cost_max"]
            } for t in task_rows]
            
            software_allocations = [{
                "name": sa["software_name"],
                "monthly_cost": sa["monthly_cost"],
                "allocation_percent": sa["allocation_percent"],
                "allocated_monthly_cost": (sa["monthly_cost"] * sa["allocation_percent"] / 100)
            } for sa in software_alloc_rows]
            
            service_departments = [{
                "name": da["department_name"],
                "role": da["role"],
                "raci": da["raci"],
                "allocation_percent": da["allocation_percent"]
            } for da in dept_assign_rows]
            
            lead_dept = next((d["name"] for d in service_departments if d["role"] == "lead"), None)
            
            valuation = None
            if valuation_row:
                def safe_get(row, key):
                    try:
                        return row[key]
                    except (IndexError, KeyError):
                        return None
                valuation = {
                    "final_value_low": safe_get(valuation_row, "final_value_low"),
                    "final_value_high": safe_get(valuation_row, "final_value_high"),
                    "total_economic_value": safe_get(valuation_row, "total_economic_value"),
                    "strategic_multiplier": safe_get(valuation_row, "strategic_multiplier"),
                    "rice_score": safe_get(valuation_row, "rice_score"),
                    "confidence_level": safe_get(valuation_row, "confidence_level"),
                    "confidence_notes": safe_get(valuation_row, "confidence_notes"),
                    "annual_time_savings_value": safe_get(valuation_row, "annual_time_savings_value"),
                    "annual_error_reduction_value": safe_get(valuation_row, "annual_error_reduction_value"),
                    "annual_cost_avoidance_value": safe_get(valuation_row, "annual_cost_avoidance_value"),
                    "annual_risk_mitigation_value": safe_get(valuation_row, "annual_risk_mitigation_value"),
                    "adoption_adjusted_annual_value": safe_get(valuation_row, "adoption_adjusted_annual_value"),
                    "total_training_cost": safe_get(valuation_row, "total_training_cost"),
                    "expected_adoption_rate_percent": safe_get(valuation_row, "expected_adoption_rate_percent"),
                    "process_standardization_annual_value": safe_get(valuation_row, "process_standardization_annual_value"),
                    "three_year_revenue_projection": safe_get(valuation_row, "three_year_revenue_projection"),
                    "net_three_year_revenue": safe_get(valuation_row, "net_three_year_revenue"),
                    "year_1_revenue": safe_get(valuation_row, "year_1_revenue"),
                    "year_2_revenue": safe_get(valuation_row, "year_2_revenue"),
                    "year_3_revenue": safe_get(valuation_row, "year_3_revenue"),
                    "customer_ltv": safe_get(valuation_row, "customer_ltv"),
                    "ltv_cac_ratio": safe_get(valuation_row, "ltv_cac_ratio"),
                    "customer_payback_months": safe_get(valuation_row, "customer_payback_months"),
                    "customer_acquisition_cost": safe_get(valuation_row, "customer_acquisition_cost"),
                    "monthly_churn_rate_percent": safe_get(valuation_row, "monthly_churn_rate_percent"),
                    "annual_marketing_spend": safe_get(valuation_row, "annual_marketing_spend"),
                    "annual_sales_team_cost": safe_get(valuation_row, "annual_sales_team_cost"),
                    "reach_score": safe_get(valuation_row, "reach_score"),
                    "impact_score": safe_get(valuation_row, "impact_score"),
                    "strategic_alignment_score": safe_get(valuation_row, "strategic_alignment_score"),
                    "differentiation_score": safe_get(valuation_row, "differentiation_score"),
                    "urgency_score": safe_get(valuation_row, "urgency_score"),
                    "hours_saved_per_user_per_week": safe_get(valuation_row, "hours_saved_per_user_per_week"),
                    "number_of_affected_users": safe_get(valuation_row, "number_of_affected_users"),
                    "average_hourly_cost": safe_get(valuation_row, "average_hourly_cost"),
                    "total_potential_customers": safe_get(valuation_row, "total_potential_customers"),
                    "achievable_market_share_percent": safe_get(valuation_row, "achievable_market_share_percent"),
                    "average_deal_size": safe_get(valuation_row, "average_deal_size"),
                    "gross_margin_percent": safe_get(valuation_row, "gross_margin_percent"),
                }
            
            requestor_type = prod["requestor_type"] if "requestor_type" in prod.keys() else None
            requestor_id = prod["requestor_id"] if "requestor_id" in prod.keys() else None
            requestor_name = prod["requestor_department_name"] if requestor_type == "service_department" else prod["business_unit"]
            
            def safe_prod_get(key):
                try:
                    return prod[key]
                except (IndexError, KeyError):
                    return None
            
            products.append({
                "id": prod["id"],
                "name": prod["name"],
                "description": prod["description"],
                "business_unit": prod["business_unit"],
                "requestor_type": requestor_type,
                "requestor_id": requestor_id,
                "requestor_name": requestor_name,
                "status": prod["status"],
                "type": prod["product_type"],
                "estimated_value": estimated_value,
                "labor_cost_min": labor_cost_min,
                "labor_cost_max": labor_cost_max,
                "software_cost": software_cost,
                "total_cost_min": total_cost_min,
                "total_cost_max": total_cost_max,
                "roi_percent": round(roi, 1) if roi else None,
                "gain_pain_ratio": round(gain_pain, 2) if gain_pain else None,
                "recommendation": recommendation,
                "lead_department": lead_dept,
                "service_departments": service_departments,
                "tasks": tasks,
                "software_allocations": software_allocations,
                "valuation": valuation,
                "raw_valuation_output": safe_prod_get("raw_valuation_output"),
                "user_flow": safe_prod_get("user_flow"),
                "specifications": safe_prod_get("specifications"),
                "persona_feedback": safe_prod_get("persona_feedback"),
                "valuation_type": safe_prod_get("valuation_type"),
                "valuation_confidence": safe_prod_get("valuation_confidence")
            })
        
        positions = [{
            "id": p["id"],
            "title": p["title"],
            "department": p["department"],
            "hourly_cost_min": p["hourly_cost_min"],
            "hourly_cost_max": p["hourly_cost_max"]
        } for p in position_rows]
        
        software = [{
            "id": s["id"],
            "name": s["name"],
            "description": s["description"],
            "monthly_cost": s["monthly_cost"]
        } for s in software_rows]
        
        departments = [{
            "id": d["id"],
            "name": d["name"],
            "description": d["description"]
        } for d in dept_rows]
        
        total_investment_min = sum(p["total_cost_min"] for p in products)
        total_investment_max = sum(p["total_cost_max"] for p in products)
        total_value = sum(p["estimated_value"] for p in products)
        roi_values = [p["roi_percent"] for p in products if p["roi_percent"] is not None]
        
        valuations_with_rice = [p["valuation"]["rice_score"] for p in products if p["valuation"] and p["valuation"]["rice_score"]]
        total_portfolio_value_low = sum(p["valuation"]["final_value_low"] for p in products if p["valuation"] and p["valuation"]["final_value_low"])
        total_portfolio_value_high = sum(p["valuation"]["final_value_high"] for p in products if p["valuation"] and p["valuation"]["final_value_high"])
        
        return {
            "summary": {
                "total_products": len(products),
                "total_positions": len(positions),
                "total_software": len(software),
                "total_service_departments": len(departments),
                "total_investment_min": total_investment_min,
                "total_investment_max": total_investment_max,
                "total_projected_value": total_value,
                "average_roi": round(sum(roi_values) / len(roi_values), 1) if roi_values else None,
                "total_portfolio_value_low": total_portfolio_value_low,
                "total_portfolio_value_high": total_portfolio_value_high,
                "average_rice_score": round(sum(valuations_with_rice) / len(valuations_with_rice), 2) if valuations_with_rice else None,
                "products_with_valuations": len([p for p in products if p["valuation"]])
            },
            "products": products,
            "positions": positions,
            "software": software,
            "service_departments": departments
        }

def format_portfolio_for_ai(data: dict) -> str:
    lines = ["=== CURRENT PORTFOLIO DATA ===\n"]
    
    s = data["summary"]
    lines.append("PORTFOLIO SUMMARY:")
    lines.append(f"- Total Products: {s['total_products']}")
    lines.append(f"- Products with Valuations: {s['products_with_valuations']}")
    lines.append(f"- Total Positions: {s['total_positions']}")
    lines.append(f"- Total Software Tools: {s['total_software']}")
    lines.append(f"- Service Departments: {s['total_service_departments']}")
    lines.append(f"- Total Investment (Labor + Software): ${s['total_investment_min']:,.0f} - ${s['total_investment_max']:,.0f}")
    lines.append(f"- Total Projected Value: ${s['total_projected_value']:,.0f}")
    if s['average_roi']:
        lines.append(f"- Average ROI: {s['average_roi']}%")
    if s['total_portfolio_value_low'] and s['total_portfolio_value_high']:
        lines.append(f"- Total Portfolio Value (from valuations): ${s['total_portfolio_value_low']:,.0f} - ${s['total_portfolio_value_high']:,.0f}")
    if s['average_rice_score']:
        lines.append(f"- Average RICE Score: {s['average_rice_score']}")
    lines.append("")
    
    lines.append("SERVICE DEPARTMENTS:")
    for dept in data["service_departments"]:
        desc = f" - {dept['description']}" if dept['description'] else ""
        lines.append(f"- {dept['name']}{desc}")
    lines.append("")
    
    lines.append("PRODUCTS:")
    for p in data["products"]:
        lines.append(f"\n[{p['name']}] (ID: {p['id']})")
        requestor_type_display = "Business Unit" if p.get('requestor_type') == 'business_unit' or not p.get('requestor_type') else "Service Department"
        requestor_name = p.get('requestor_name') or p.get('business_unit') or 'Not assigned'
        lines.append(f"  Requested By: {requestor_name} ({requestor_type_display})")
        lines.append(f"  Status: {p['status']} | Type: {p['type']}")
        if p['description']:
            lines.append(f"  Description: {p['description']}")
        
        if p['service_departments']:
            dept_info = []
            for sd in p['service_departments']:
                role_label = "LEAD" if sd['role'] == 'lead' else "Supporting"
                alloc = f", {sd['allocation_percent']}%" if sd['allocation_percent'] else ""
                dept_info.append(f"{sd['name']} ({role_label}, {sd['raci']}{alloc})")
            lines.append(f"  Service Departments: {'; '.join(dept_info)}")
        else:
            lines.append(f"  Service Departments: None assigned")
        
        lines.append(f"  Estimated Value: ${p['estimated_value']:,.0f}")
        lines.append(f"  Labor Cost: ${p['labor_cost_min']:,.0f} - ${p['labor_cost_max']:,.0f}")
        if p['software_cost'] > 0:
            lines.append(f"  Software Cost (annual): ${p['software_cost']:,.0f}")
        lines.append(f"  Total Cost: ${p['total_cost_min']:,.0f} - ${p['total_cost_max']:,.0f}")
        if p['roi_percent']:
            lines.append(f"  ROI: {p['roi_percent']}% | Gain/Pain: {p['gain_pain_ratio']}x")
        lines.append(f"  Recommendation: {p['recommendation']}")
        
        if p.get('valuation'):
            v = p['valuation']
            lines.append(f"  VALUATION DATA:")
            if v['final_value_low'] and v['final_value_high']:
                lines.append(f"    Final Value Range: ${v['final_value_low']:,.0f} - ${v['final_value_high']:,.0f}")
            if v['total_economic_value']:
                lines.append(f"    Total Economic Value: ${v['total_economic_value']:,.0f}")
            if v['strategic_multiplier']:
                lines.append(f"    Strategic Multiplier: {v['strategic_multiplier']:.2f}x")
            lines.append(f"    Confidence: {v['confidence_level']}")
            if v['confidence_notes']:
                lines.append(f"    Confidence Notes: {v['confidence_notes']}")
            if v['rice_score']:
                lines.append(f"    RICE Score: {v['rice_score']:.2f}")
            
            if v['reach_score'] and v['impact_score']:
                lines.append(f"    Strategic Scores: Reach={v['reach_score']}, Impact={v['impact_score']}, Alignment={v['strategic_alignment_score']}, Differentiation={v['differentiation_score']}, Urgency={v['urgency_score']}")
            
            if p['type'] in ['Internal', 'Both']:
                lines.append(f"    Internal Value Drivers:")
                if v['annual_time_savings_value']:
                    lines.append(f"      - Time Savings: ${v['annual_time_savings_value']:,.0f}/yr ({v['hours_saved_per_user_per_week']} hrs/user/wk x {v['number_of_affected_users']} users @ ${v['average_hourly_cost']}/hr)")
                if v['annual_error_reduction_value']:
                    lines.append(f"      - Error Reduction: ${v['annual_error_reduction_value']:,.0f}/yr")
                if v['annual_cost_avoidance_value']:
                    lines.append(f"      - Cost Avoidance: ${v['annual_cost_avoidance_value']:,.0f}/yr")
                if v['annual_risk_mitigation_value']:
                    lines.append(f"      - Risk Mitigation: ${v['annual_risk_mitigation_value']:,.0f}/yr")
                if v.get('process_standardization_annual_value'):
                    lines.append(f"      - Process Standardization: ${v['process_standardization_annual_value']:,.0f}/yr")
                if v.get('adoption_adjusted_annual_value'):
                    adoption = v.get('expected_adoption_rate_percent') or 100
                    lines.append(f"      - Adoption-Adjusted Value: ${v['adoption_adjusted_annual_value']:,.0f}/yr ({adoption}% adoption)")
                if v.get('total_training_cost'):
                    lines.append(f"      - Training Cost: ${v['total_training_cost']:,.0f}")
            
            if p['type'] in ['External', 'Both']:
                lines.append(f"    External Value Drivers:")
                if v.get('net_three_year_revenue'):
                    lines.append(f"      - Net 3-Year Revenue: ${v['net_three_year_revenue']:,.0f}")
                if v['three_year_revenue_projection']:
                    lines.append(f"      - Gross 3-Year Revenue: ${v['three_year_revenue_projection']:,.0f}")
                if v.get('year_1_revenue') and v.get('year_2_revenue') and v.get('year_3_revenue'):
                    lines.append(f"      - Revenue by Year: Y1=${v['year_1_revenue']:,.0f}, Y2=${v['year_2_revenue']:,.0f}, Y3=${v['year_3_revenue']:,.0f}")
                if v['customer_ltv']:
                    lines.append(f"      - Customer LTV: ${v['customer_ltv']:,.0f}")
                if v.get('ltv_cac_ratio'):
                    lines.append(f"      - LTV:CAC Ratio: {v['ltv_cac_ratio']:.1f}x")
                if v.get('customer_payback_months'):
                    lines.append(f"      - Payback Period: {v['customer_payback_months']:.1f} months")
                if v.get('customer_acquisition_cost'):
                    lines.append(f"      - CAC: ${v['customer_acquisition_cost']:,.0f}")
                if v.get('monthly_churn_rate_percent'):
                    lines.append(f"      - Monthly Churn: {v['monthly_churn_rate_percent']}%")
                if v.get('annual_marketing_spend') or v.get('annual_sales_team_cost'):
                    gtm = (v.get('annual_marketing_spend') or 0) + (v.get('annual_sales_team_cost') or 0)
                    lines.append(f"      - Annual GTM Cost: ${gtm:,.0f}")
                if v['total_potential_customers']:
                    lines.append(f"      - Market: {v['total_potential_customers']:,} potential customers, {v['achievable_market_share_percent']}% target share")
                if v['average_deal_size']:
                    lines.append(f"      - Deal Size: ${v['average_deal_size']:,.0f}, Margin: {v['gross_margin_percent']}%")
        
        if p['tasks']:
            lines.append(f"  Tasks ({len(p['tasks'])}):")
            for t in p['tasks']:
                lines.append(f"    - {t['name']}: {t['hours']}h by {t['position']} (${t['cost_min']:,.0f}-${t['cost_max']:,.0f})")
        
        if p['software_allocations']:
            lines.append(f"  Software Allocations (monthly):")
            for sa in p['software_allocations']:
                lines.append(f"    - {sa['name']}: {sa['allocation_percent']}% of ${sa['monthly_cost']:,.0f}/mo = ${sa['allocated_monthly_cost']:,.0f}/mo")
        
        has_docs = any([p.get('raw_valuation_output'), p.get('user_flow'), p.get('specifications'), p.get('persona_feedback')])
        if has_docs:
            lines.append(f"  PRODUCT DOCUMENTS:")
            if p.get('valuation_type'):
                lines.append(f"    Valuation Method: {p['valuation_type'].title()} (Confidence: {p.get('valuation_confidence') or 'N/A'})")
            if p.get('raw_valuation_output'):
                lines.append(f"    Raw Valuation Output:")
                for line in p['raw_valuation_output'].split('\n')[:50]:
                    lines.append(f"      {line}")
                if len(p['raw_valuation_output'].split('\n')) > 50:
                    lines.append(f"      ... (truncated, {len(p['raw_valuation_output'].split(chr(10)))} total lines)")
            if p.get('specifications'):
                lines.append(f"    Specifications:")
                for line in p['specifications'].split('\n')[:30]:
                    lines.append(f"      {line}")
                if len(p['specifications'].split('\n')) > 30:
                    lines.append(f"      ... (truncated)")
            if p.get('user_flow'):
                lines.append(f"    User Flow:")
                for line in p['user_flow'].split('\n')[:30]:
                    lines.append(f"      {line}")
                if len(p['user_flow'].split('\n')) > 30:
                    lines.append(f"      ... (truncated)")
            if p.get('persona_feedback'):
                lines.append(f"    Persona Feedback:")
                for line in p['persona_feedback'].split('\n')[:30]:
                    lines.append(f"      {line}")
                if len(p['persona_feedback'].split('\n')) > 30:
                    lines.append(f"      ... (truncated)")
    
    lines.append("\nPOSITIONS (Team Roles):")
    for pos in data["positions"]:
        lines.append(f"- {pos['title']} ({pos['department']}): ${pos['hourly_cost_min']}-${pos['hourly_cost_max']}/hr")
    
    lines.append("\nSOFTWARE COSTS:")
    for sw in data["software"]:
        desc = f" - {sw['description']}" if sw['description'] else ""
        lines.append(f"- {sw['name']}: ${sw['monthly_cost']:,.0f}/mo{desc}")
    
    return "\n".join(lines)

def get_knowledge_base() -> list:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM knowledge_base ORDER BY category, title")
        rows = cursor.fetchall()
        return [{
            "title": row["title"],
            "content": row["content"],
            "category": row["category"]
        } for row in rows]

def get_lessons() -> list:
    from routers.learn import LESSONS
    return LESSONS

def format_knowledge_for_ai(entries: list, lessons: list = None) -> str:
    lines = []
    
    if lessons:
        lines.append("=== PRODUCT MANAGEMENT FRAMEWORKS (from Learn page) ===\n")
        for lesson in lessons:
            lines.append(f"\n## {lesson['title']} ({lesson['framework']})")
            lines.append(lesson["content"])
            lines.append(f"\nKey Takeaway: {lesson['key_takeaway']}")
            lines.append(f"Example: {lesson['example']}")
    
    if entries:
        lines.append("\n\n=== CUSTOM KNOWLEDGE BASE ===\n")
        lines.append("The following is custom knowledge the user has added:\n")
        current_category = None
        for entry in entries:
            if entry["category"] != current_category:
                current_category = entry["category"]
                lines.append(f"\n[{current_category}]")
            lines.append(f"\n## {entry['title']}")
            lines.append(entry["content"])
    
    return "\n".join(lines) if lines else ""

try:
    from anthropic import Anthropic
    ANTHROPIC_AVAILABLE = True
except ImportError:
    ANTHROPIC_AVAILABLE = False

BASE_SYSTEM_PROMPT = """You are a senior Head of Product with 15+ years of experience at top tech companies. You serve as the Product Strategy Expert for Product Jarvis, a decision-support system for product evaluation.

Your expertise includes:
- Product management frameworks (MVS, BACK Matrix, 4 U's, Gain/Pain Ratio, RICE)
- Build vs Buy vs Kill vs Defer decisions
- ROI calculations and cost-benefit analysis
- Internal vs External product fit
- Prioritization and roadmapping
- Product valuation methodologies (Economic Value Estimation, Strategic Multipliers)
- TAM/SAM/SOM market sizing
- Customer LTV calculations
- Multi-department product ownership and RACI matrices
- Cost allocation across service departments

The organization model:
- Business Units (Brands like Lines.com, HighRoller.com, Refills.com) can request and fund products
- Service Departments (Technical, SEO, Performance Media, BI, AI) build products AND can also request products for their own needs
- Products can be requested by EITHER a Business Unit OR a Service Department (not both)
- Example: Lines.com (BU) requests "AI Pick Service" vs SEO (Dept) requests "SEO Content Generator"
- Products have one Lead department (accountable for building) and optionally Supporting departments
- The requestor and the lead department can be different (e.g., SEO requests it, Technical builds it)
- Each department assignment has a RACI designation (Responsible, Accountable, Consulted, Informed)
- Costs can be allocated by percentage across departments

When answering questions:
1. Be concise but thorough
2. Reference specific frameworks when applicable
3. Give actionable advice
4. Use examples to illustrate points
5. If asked about calculations, show the math

Key Frameworks Reference:
- MVS (Minimum Viable Segment): Focus on smallest segment that can sustain your product
- BACK Matrix: Critical+Blatant problems are the sweet spot
- 4 U's: Unworkable, Unavoidable, Urgent, Underserved (3+ = strong opportunity)
- Gain/Pain Ratio: Aim for 10x value delivery
- RICE: (Reach × Impact × Confidence) / Effort
- ROI: ((Value - Cost) / Cost) × 100

Valuation Framework Reference:
- Internal Products: Time savings, error reduction, cost avoidance, risk mitigation, process standardization
  - Adoption Adjustment: Accounts for expected adoption rate and ramp-up time
  - Training Costs: Deducted from value (cost per user × users × adoption rate)
- External Products: TAM/SAM/SOM, revenue projections, customer LTV, margins
  - LTV:CAC Ratio: Should be 3:1+ for healthy economics (LTV / Customer Acquisition Cost)
  - Customer Payback: Months to recoup CAC (ideally <12 months)
  - Net Revenue: Gross revenue minus CAC and GTM costs
  - Churn Rate: Monthly churn drives customer lifetime (1/churn = lifetime months)
- Strategic Multiplier: Based on Reach, Impact, Alignment, Differentiation, Urgency scores (0.5x - 2.0x)
- Confidence Levels: High (0.9-1.1x), Medium (0.6-1.0x), Low (0.3-0.7x), Speculative (0.1-0.4x)

When helping with valuations:
- Challenge overly optimistic assumptions (market share >5%, 100% error reduction, adoption >80%, etc.)
- For internal: Question adoption rates, suggest phased rollout, validate training costs
- For external: Check LTV:CAC ratio (3:1 minimum), validate payback period, question churn assumptions
- Ask probing questions to understand the basis for estimates
- Suggest ways to increase confidence level through data gathering
- Compare against industry benchmarks when relevant

Always be helpful, practical, and focused on helping the user make better product decisions."""

PROBLEM_SOLVING_PROMPT = """

PROBLEM-SOLVING MODE ACTIVATED:

You are now in creative problem-solving mode. The user is facing a challenge - likely something expensive, complex, or seemingly impossible. Your job is to think like a seasoned Head of Product who has seen it all.

Approach:
1. REFRAME THE PROBLEM: Is there a different way to look at this? What's the real underlying need?

2. QUESTION ASSUMPTIONS: What constraints are actually fixed vs. perceived? Challenge "we have to" and "we can't" thinking.

3. FIND THE 80/20: What's the minimum viable approach that captures most of the value? Can we phase this?

4. CREATIVE ALTERNATIVES: Generate 3-5 different approaches, ranging from scrappy to ideal:
   - The "Zero Budget" approach: How would you solve this with no money?
   - The "Partnership" approach: Who else has this problem or solution?
   - The "Flip It" approach: What if we did the opposite?
   - The "Borrow" approach: How have other industries solved similar problems?
   - The "Simplify" approach: What if we removed 80% of the scope?

5. TRADE-OFF ANALYSIS: For each option, clearly state what you gain and what you sacrifice.

6. RECOMMENDATION: Give your top recommendation with a clear rationale.

Be bold and creative. The user came to you because the obvious solutions aren't working. Think outside the box while staying practical."""

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    message: str
    context: Optional[str] = None
    history: Optional[List[ChatMessage]] = []
    mode: Optional[str] = "normal"
    include_data: Optional[bool] = False
    include_knowledge: Optional[bool] = False

class ChatResponse(BaseModel):
    response: str
    framework_refs: List[str] = []

def extract_framework_refs(text: str) -> List[str]:
    frameworks = []
    keywords = {
        "MVS": ["mvs", "minimum viable segment"],
        "BACK": ["back matrix", "back", "critical", "blatant", "latent"],
        "4 U's": ["4 u's", "four u's", "unworkable", "unavoidable", "urgent", "underserved"],
        "Gain/Pain": ["gain/pain", "gain pain", "value ratio"],
        "RICE": ["rice", "reach", "impact", "confidence", "effort"],
        "ROI": ["roi", "return on investment"],
        "Build/Buy/Kill": ["build", "buy", "kill", "defer"],
        "RACI": ["raci", "responsible", "accountable", "consulted", "informed"]
    }
    text_lower = text.lower()
    for framework, terms in keywords.items():
        if any(term in text_lower for term in terms):
            frameworks.append(framework)
    return frameworks

@router.post("")
async def chat(request: ChatRequest):
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    
    if not ANTHROPIC_AVAILABLE:
        return {
            "success": True,
            "data": {
                "response": "The Anthropic SDK is not installed. Please run: pip install anthropic",
                "framework_refs": []
            },
            "error": None
        }
    
    if not api_key:
        return {
            "success": True,
            "data": {
                "response": "No API key configured. To enable the AI assistant, set ANTHROPIC_API_KEY environment variable.",
                "framework_refs": []
            },
            "error": None
        }
    
    try:
        client = Anthropic(api_key=api_key)
        
        messages = []
        for msg in request.history:
            messages.append({"role": msg.role, "content": msg.content})
        
        user_message = request.message
        if request.context:
            user_message = f"Context: {request.context}\n\nQuestion: {request.message}"
        
        context_parts = []
        
        if request.include_data:
            portfolio_data = get_portfolio_data()
            portfolio_context = format_portfolio_for_ai(portfolio_data)
            context_parts.append(portfolio_context)
        
        if request.include_knowledge:
            knowledge_entries = get_knowledge_base()
            lessons = get_lessons()
            knowledge_context = format_knowledge_for_ai(knowledge_entries, lessons)
            if knowledge_context:
                context_parts.append(knowledge_context)
        
        if context_parts:
            user_message = "\n\n".join(context_parts) + f"\n\n---\nUSER QUESTION: {user_message}"
        
        messages.append({"role": "user", "content": user_message})
        
        system_prompt = BASE_SYSTEM_PROMPT
        if request.mode == "problem_solving":
            system_prompt = BASE_SYSTEM_PROMPT + PROBLEM_SOLVING_PROMPT
        
        if request.include_data:
            system_prompt += "\n\nYou have access to the user's current portfolio data (products, tasks, positions, software costs, service departments, ROI calculations). Use this data to provide specific, personalized advice. Reference specific products by name when relevant."
        
        if request.include_knowledge:
            system_prompt += "\n\nYou have access to detailed product management frameworks from the Learn page (MVS, BACK Matrix, 4 U's, Gain/Pain, RICE, ROI, Build/Buy/Kill, Internal vs External) plus any custom knowledge the user has added. Use these frameworks with their full detail, examples, and scoring criteria when answering questions."
        
        response = client.messages.create(
            model="claude-sonnet-4-20250514",
            max_tokens=2048,
            system=system_prompt,
            messages=messages
        )
        
        response_text = response.content[0].text
        framework_refs = extract_framework_refs(response_text)
        
        return {
            "success": True,
            "data": {
                "response": response_text,
                "framework_refs": framework_refs
            },
            "error": None
        }
        
    except Exception as e:
        return {
            "success": False,
            "data": None,
            "error": str(e)
        }

@router.get("/status")
def get_status():
    api_key = os.environ.get("ANTHROPIC_API_KEY")
    return {
        "success": True,
        "data": {
            "sdk_available": ANTHROPIC_AVAILABLE,
            "api_key_configured": bool(api_key),
            "ready": ANTHROPIC_AVAILABLE and bool(api_key)
        },
        "error": None
    }
