from fastapi import APIRouter, HTTPException
from datetime import datetime, date
import json
from models.valuation import Valuation, ValuationCreate, ValuationUpdate, ValuationHistory
from database import get_connection
from services.valuation_calculator import calculate_all

router = APIRouter(prefix="/api/valuations", tags=["valuations"])

INPUT_FIELDS = [
    "valuation_date", "confidence_level", "confidence_notes",
    "hours_saved_per_user_per_week", "number_of_affected_users", "average_hourly_cost",
    "current_errors_per_month", "cost_per_error", "expected_error_reduction_percent",
    "alternative_solution_cost", "alternative_solution_period",
    "risk_description", "risk_probability_percent", "risk_cost_if_occurs", "risk_reduction_percent",
    "target_customer_segment", "total_potential_customers", "serviceable_percent", "achievable_market_share_percent",
    "price_per_unit", "pricing_model", "average_deal_size", "sales_cycle_months", "conversion_rate_percent",
    "gross_margin_percent", "expected_customer_lifetime_months", "customer_acquisition_cost",
    "competitor_name", "competitor_pricing", "differentiation_summary",
    "internal_value_weight", "external_value_weight",
    "reach_score", "impact_score", "strategic_alignment_score", "differentiation_score", "urgency_score",
]

CALCULATED_FIELDS = [
    "annual_time_savings_value", "annual_error_reduction_value", "annual_cost_avoidance_value",
    "annual_risk_mitigation_value", "total_economic_value", "three_year_revenue_projection",
    "customer_ltv", "strategic_multiplier", "final_value_low", "final_value_high", "rice_score",
]

ALL_FIELDS = INPUT_FIELDS + CALCULATED_FIELDS

def row_to_valuation(row) -> dict:
    result = {
        "id": row["id"],
        "product_id": row["product_id"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
    }
    for field in ALL_FIELDS:
        result[field] = row[field]
    return result

def get_product_type(product_id: int) -> str:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT product_type FROM products WHERE id = ?", (product_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Product not found")
        return row["product_type"]

def get_product_effort_hours(product_id: int) -> float:
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT COALESCE(SUM(estimated_hours), 0) as total FROM tasks WHERE product_id = ?", (product_id,))
        row = cursor.fetchone()
        return row["total"] if row else 0

def save_history_snapshot(product_id: int, valuation_data: dict):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO valuation_history 
               (product_id, valuation_date, confidence_level, total_economic_value, 
                three_year_revenue_projection, strategic_multiplier, final_value_low, 
                final_value_high, rice_score, snapshot_json, created_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (
                product_id,
                valuation_data.get("valuation_date") or date.today().isoformat(),
                valuation_data.get("confidence_level"),
                valuation_data.get("total_economic_value"),
                valuation_data.get("three_year_revenue_projection"),
                valuation_data.get("strategic_multiplier"),
                valuation_data.get("final_value_low"),
                valuation_data.get("final_value_high"),
                valuation_data.get("rice_score"),
                json.dumps(valuation_data),
                datetime.now().isoformat(),
            )
        )
        conn.commit()

@router.get("/product/{product_id}", response_model=dict)
def get_valuation_by_product(product_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM product_valuations WHERE product_id = ?", (product_id,))
        row = cursor.fetchone()
    if not row:
        return {"success": True, "data": None, "error": None}
    return {"success": True, "data": row_to_valuation(row), "error": None}

@router.post("", response_model=dict, status_code=201)
def create_valuation(valuation: ValuationCreate):
    product_type = get_product_type(valuation.product_id)
    effort_hours = get_product_effort_hours(valuation.product_id)
    
    input_data = valuation.model_dump(exclude_unset=True)
    calculated = calculate_all(input_data, product_type, effort_hours)
    
    now = datetime.now().isoformat()
    val_date = valuation.valuation_date.isoformat() if valuation.valuation_date else date.today().isoformat()
    
    columns = ["product_id", "valuation_date", "created_at", "updated_at"]
    values = [valuation.product_id, val_date, now, now]
    
    for field in INPUT_FIELDS:
        if field == "valuation_date":
            continue
        columns.append(field)
        val = getattr(valuation, field, None)
        values.append(val)
    
    for field in CALCULATED_FIELDS:
        columns.append(field)
        values.append(calculated.get(field))
    
    placeholders = ", ".join(["?"] * len(columns))
    col_str = ", ".join(columns)
    
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM product_valuations WHERE product_id = ?", (valuation.product_id,))
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Valuation already exists for this product. Use PUT to update.")
        
        cursor.execute(f"INSERT INTO product_valuations ({col_str}) VALUES ({placeholders})", values)
        conn.commit()
        valuation_id = cursor.lastrowid
        cursor.execute("SELECT * FROM product_valuations WHERE id = ?", (valuation_id,))
        row = cursor.fetchone()
    
    result = row_to_valuation(row)
    save_history_snapshot(valuation.product_id, result)
    
    update_product_estimated_value(valuation.product_id, calculated.get("final_value_high"))
    
    return {"success": True, "data": result, "error": None}

@router.put("/product/{product_id}", response_model=dict)
def update_valuation(product_id: int, valuation: ValuationUpdate):
    product_type = get_product_type(product_id)
    effort_hours = get_product_effort_hours(product_id)
    
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM product_valuations WHERE product_id = ?", (product_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Valuation not found for this product")
        
        existing_data = dict(existing)
        update_data = valuation.model_dump(exclude_unset=True)
        
        for field in INPUT_FIELDS:
            if field in update_data:
                existing_data[field] = update_data[field]
        
        calculated = calculate_all(existing_data, product_type, effort_hours)
        
        now = datetime.now().isoformat()
        updates = {"updated_at": now}
        
        for field in INPUT_FIELDS:
            if field in update_data:
                val = update_data[field]
                if isinstance(val, date):
                    val = val.isoformat()
                updates[field] = val
        
        for field in CALCULATED_FIELDS:
            updates[field] = calculated.get(field)
        
        set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
        values = list(updates.values()) + [product_id]
        cursor.execute(f"UPDATE product_valuations SET {set_clause} WHERE product_id = ?", values)
        conn.commit()
        
        cursor.execute("SELECT * FROM product_valuations WHERE product_id = ?", (product_id,))
        row = cursor.fetchone()
    
    result = row_to_valuation(row)
    save_history_snapshot(product_id, result)
    
    update_product_estimated_value(product_id, calculated.get("final_value_high"))
    
    return {"success": True, "data": result, "error": None}

@router.delete("/product/{product_id}", response_model=dict)
def delete_valuation(product_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM product_valuations WHERE product_id = ?", (product_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Valuation not found for this product")
        cursor.execute("DELETE FROM product_valuations WHERE product_id = ?", (product_id,))
        conn.commit()
    
    update_product_estimated_value(product_id, 0)
    
    return {"success": True, "data": {"deleted": product_id}, "error": None}

@router.get("/product/{product_id}/history", response_model=dict)
def get_valuation_history(product_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "SELECT * FROM valuation_history WHERE product_id = ? ORDER BY created_at DESC",
            (product_id,)
        )
        rows = cursor.fetchall()
    
    history = []
    for row in rows:
        history.append({
            "id": row["id"],
            "product_id": row["product_id"],
            "valuation_date": row["valuation_date"],
            "confidence_level": row["confidence_level"],
            "total_economic_value": row["total_economic_value"],
            "three_year_revenue_projection": row["three_year_revenue_projection"],
            "strategic_multiplier": row["strategic_multiplier"],
            "final_value_low": row["final_value_low"],
            "final_value_high": row["final_value_high"],
            "rice_score": row["rice_score"],
            "created_at": row["created_at"],
        })
    
    return {"success": True, "data": history, "error": None}

@router.get("/portfolio", response_model=dict)
def get_portfolio_valuations():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.id, p.name, p.status, p.product_type, 
                   v.confidence_level, v.total_economic_value, v.three_year_revenue_projection,
                   v.strategic_multiplier, v.final_value_low, v.final_value_high, v.rice_score,
                   v.valuation_date, v.updated_at as valuation_updated_at
            FROM products p
            LEFT JOIN product_valuations v ON p.id = v.product_id
            ORDER BY v.final_value_high DESC NULLS LAST, p.name
        """)
        rows = cursor.fetchall()
    
    portfolio = []
    for row in rows:
        portfolio.append({
            "product_id": row["id"],
            "product_name": row["name"],
            "product_status": row["status"],
            "product_type": row["product_type"],
            "confidence_level": row["confidence_level"],
            "total_economic_value": row["total_economic_value"],
            "three_year_revenue_projection": row["three_year_revenue_projection"],
            "strategic_multiplier": row["strategic_multiplier"],
            "final_value_low": row["final_value_low"],
            "final_value_high": row["final_value_high"],
            "rice_score": row["rice_score"],
            "valuation_date": row["valuation_date"],
            "valuation_updated_at": row["valuation_updated_at"],
            "has_valuation": row["final_value_high"] is not None,
        })
    
    return {"success": True, "data": portfolio, "error": None}

def update_product_estimated_value(product_id: int, value: float | None):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            "UPDATE products SET estimated_value = ?, updated_at = ? WHERE id = ?",
            (value or 0, datetime.now().isoformat(), product_id)
        )
        conn.commit()
