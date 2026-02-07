from fastapi import APIRouter, HTTPException, Depends
from datetime import datetime
from models.task import TaskCreate, TaskUpdate, TaskWithPosition
from database import get_connection
from services.calculation_service import (
    calculate_hours_status,
    calculate_hours_progress,
    calculate_task_costs,
    calculate_overhead_and_fees,
    calculate_roi,
    calculate_gain_pain,
    get_recommendation,
    get_health_from_roi,
    process_task_row
)
from auth import verify_api_key, rate_limit
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["calculator"])


def check_and_transition_product_to_in_development(conn, product_id: int) -> bool:
    cursor = conn.cursor()
    cursor.execute("SELECT status FROM products WHERE id = ?", (product_id,))
    product = cursor.fetchone()
    if not product:
        return False

    if product["status"] == "Approved":
        cursor.execute(
            "UPDATE products SET status = ?, updated_at = ? WHERE id = ?",
            ("In Development", datetime.now().isoformat(), product_id)
        )
        conn.commit()
        logger.info(f"Product {product_id} auto-transitioned from 'Approved' to 'In Development' (first hours logged)")
        return True
    return False

@router.get("/api/products/{product_id}/tasks", response_model=dict)
def list_product_tasks(product_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")
        
        cursor.execute("""
            SELECT t.*, p.title as position_title, p.hourly_cost_min, p.hourly_cost_max
            FROM tasks t
            JOIN positions p ON t.position_id = p.id
            WHERE t.product_id = ?
            ORDER BY t.created_at DESC
        """, (product_id,))
        rows = cursor.fetchall()
        
        tasks = []
        for row in rows:
            costs = calculate_task_costs(
                row["estimated_hours"],
                row["actual_hours"] or 0,
                row["hourly_cost_min"],
                row["hourly_cost_max"]
            )
            tasks.append({
                "id": row["id"],
                "product_id": row["product_id"],
                "position_id": row["position_id"],
                "name": row["name"],
                "estimated_hours": row["estimated_hours"],
                "actual_hours": row["actual_hours"],
                "created_at": row["created_at"],
                "position_title": row["position_title"],
                "hourly_cost_min": row["hourly_cost_min"],
                "hourly_cost_max": row["hourly_cost_max"],
                **costs
            })
    
    return {"success": True, "data": tasks, "error": None}

@router.post("/api/products/{product_id}/tasks", response_model=dict, status_code=201)
def create_task(product_id: int, task: TaskCreate, _api_key: str = Depends(verify_api_key), _rate: str = Depends(rate_limit)):
    with get_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")
        
        cursor.execute("SELECT * FROM positions WHERE id = ?", (task.position_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Position not found")
        
        now = datetime.now().isoformat()
        cursor.execute(
            """INSERT INTO tasks (product_id, position_id, name, estimated_hours, external_id, status, assignee_name, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (product_id, task.position_id, task.name, task.estimated_hours, task.external_id, task.status, task.assignee_name, now, now)
        )
        conn.commit()
        task_id = cursor.lastrowid
        
        cursor.execute("""
            SELECT t.*, p.title as position_title, p.hourly_cost_min, p.hourly_cost_max
            FROM tasks t
            JOIN positions p ON t.position_id = p.id
            WHERE t.id = ?
        """, (task_id,))
        row = cursor.fetchone()
        
        costs = calculate_task_costs(
            row["estimated_hours"],
            row["actual_hours"] or 0,
            row["hourly_cost_min"],
            row["hourly_cost_max"]
        )
        result = {
            "id": row["id"],
            "product_id": row["product_id"],
            "position_id": row["position_id"],
            "name": row["name"],
            "estimated_hours": row["estimated_hours"],
            "actual_hours": row["actual_hours"],
            "external_id": row["external_id"] if "external_id" in row.keys() else None,
            "status": row["status"] if "status" in row.keys() else "open",
            "assignee_name": row["assignee_name"] if "assignee_name" in row.keys() else None,
            "created_at": row["created_at"],
            "updated_at": row["updated_at"] if "updated_at" in row.keys() else None,
            "position_title": row["position_title"],
            "hourly_cost_min": row["hourly_cost_min"],
            "hourly_cost_max": row["hourly_cost_max"],
            **costs
        }

    return {"success": True, "data": result, "error": None}

@router.get("/api/tasks/{task_id}", response_model=dict)
def get_task(task_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT t.*, p.title as position_title, p.hourly_cost_min, p.hourly_cost_max
            FROM tasks t
            JOIN positions p ON t.position_id = p.id
            WHERE t.id = ?
        """, (task_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Task not found")

        costs = calculate_task_costs(
            row["estimated_hours"],
            row["actual_hours"] or 0,
            row["hourly_cost_min"],
            row["hourly_cost_max"]
        )
        result = {
            "id": row["id"],
            "product_id": row["product_id"],
            "position_id": row["position_id"],
            "name": row["name"],
            "estimated_hours": row["estimated_hours"],
            "actual_hours": row["actual_hours"],
            "external_id": row["external_id"] if "external_id" in row.keys() else None,
            "status": row["status"] if "status" in row.keys() else "open",
            "assignee_name": row["assignee_name"] if "assignee_name" in row.keys() else None,
            "created_at": row["created_at"],
            "updated_at": row["updated_at"] if "updated_at" in row.keys() else None,
            "position_title": row["position_title"],
            "hourly_cost_min": row["hourly_cost_min"],
            "hourly_cost_max": row["hourly_cost_max"],
            **costs
        }

    return {"success": True, "data": result, "error": None}

@router.patch("/api/tasks/{task_id}", response_model=dict)
def update_task(task_id: int, task_update: TaskUpdate, _api_key: str = Depends(verify_api_key), _rate: str = Depends(rate_limit)):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Task not found")
        
        updates = ["updated_at = ?"]
        values = [datetime.now().isoformat()]
        
        if task_update.name is not None:
            updates.append("name = ?")
            values.append(task_update.name)
        if task_update.position_id is not None:
            cursor.execute("SELECT * FROM positions WHERE id = ?", (task_update.position_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Position not found")
            updates.append("position_id = ?")
            values.append(task_update.position_id)
        if task_update.estimated_hours is not None:
            updates.append("estimated_hours = ?")
            values.append(task_update.estimated_hours)
        if task_update.actual_hours is not None:
            updates.append("actual_hours = ?")
            values.append(task_update.actual_hours)
            if task_update.actual_hours > 0 and (existing["actual_hours"] is None or existing["actual_hours"] == 0):
                check_and_transition_product_to_in_development(conn, existing["product_id"])
        if task_update.external_id is not None:
            updates.append("external_id = ?")
            values.append(task_update.external_id)
        if task_update.status is not None:
            updates.append("status = ?")
            values.append(task_update.status)
        if task_update.assignee_name is not None:
            updates.append("assignee_name = ?")
            values.append(task_update.assignee_name)
        if task_update.due_date is not None:
            updates.append("due_date = ?")
            values.append(task_update.due_date.isoformat() if task_update.due_date else None)

        values.append(task_id)
        cursor.execute(f"UPDATE tasks SET {', '.join(updates)} WHERE id = ?", values)
        conn.commit()
        
        cursor.execute("""
            SELECT t.*, p.title as position_title, p.hourly_cost_min, p.hourly_cost_max
            FROM tasks t
            JOIN positions p ON t.position_id = p.id
            WHERE t.id = ?
        """, (task_id,))
        row = cursor.fetchone()
        
        costs = calculate_task_costs(
            row["estimated_hours"],
            row["actual_hours"] or 0,
            row["hourly_cost_min"],
            row["hourly_cost_max"]
        )
        
        result = {
            "id": row["id"],
            "product_id": row["product_id"],
            "position_id": row["position_id"],
            "name": row["name"],
            "estimated_hours": row["estimated_hours"],
            "actual_hours": row["actual_hours"],
            "external_id": row["external_id"] if "external_id" in row.keys() else None,
            "status": row["status"] if "status" in row.keys() else "open",
            "assignee_name": row["assignee_name"] if "assignee_name" in row.keys() else None,
            "due_date": row["due_date"] if "due_date" in row.keys() else None,
            "created_at": row["created_at"],
            "updated_at": row["updated_at"] if "updated_at" in row.keys() else None,
            "position_title": row["position_title"],
            "hourly_cost_min": row["hourly_cost_min"],
            "hourly_cost_max": row["hourly_cost_max"],
            **costs
        }

    return {"success": True, "data": result, "error": None}

@router.delete("/api/tasks/{task_id}", response_model=dict)
def delete_task(task_id: int, _api_key: str = Depends(verify_api_key), _rate: str = Depends(rate_limit)):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM tasks WHERE id = ?", (task_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Task not found")
        cursor.execute("DELETE FROM tasks WHERE id = ?", (task_id,))
        conn.commit()
    return {"success": True, "data": {"deleted": task_id}, "error": None}

@router.get("/api/calculator/{product_id}", response_model=dict)
def calculate_product_cost(product_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT p.*, sd.name as requestor_department_name
            FROM products p
            LEFT JOIN service_departments sd ON p.requestor_type = 'service_department' AND p.requestor_id = sd.id
            WHERE p.id = ?
        """, (product_id,))
        product_row = cursor.fetchone()
        if not product_row:
            raise HTTPException(status_code=404, detail="Product not found")
        
        cursor.execute("""
            SELECT psd.*, sd.name as department_name
            FROM product_service_departments psd
            JOIN service_departments sd ON psd.department_id = sd.id
            WHERE psd.product_id = ?
            ORDER BY psd.role DESC, sd.name
        """, (product_id,))
        dept_rows = cursor.fetchall()
        service_departments = [{
            "id": r["id"],
            "department_name": r["department_name"],
            "role": r["role"],
            "raci": r["raci"],
            "allocation_percent": r["allocation_percent"]
        } for r in dept_rows]
        
        requestor_type = product_row["requestor_type"] if "requestor_type" in product_row.keys() else None
        requestor_id = product_row["requestor_id"] if "requestor_id" in product_row.keys() else None
        requestor_name = product_row["requestor_department_name"] if requestor_type == "service_department" else product_row["business_unit"]
        fee_percent = product_row["fee_percent"] if "fee_percent" in product_row.keys() else 0
        
        product = {
            "id": product_row["id"],
            "name": product_row["name"],
            "description": product_row["description"],
            "business_unit": product_row["business_unit"],
            "requestor_type": requestor_type,
            "requestor_id": requestor_id,
            "requestor_name": requestor_name,
            "service_departments": service_departments,
            "status": product_row["status"],
            "product_type": product_row["product_type"],
            "estimated_value": product_row["estimated_value"],
            "fee_percent": fee_percent
        }
        
        cursor.execute("""
            SELECT t.*, p.title as position_title, p.hourly_cost_min, p.hourly_cost_max
            FROM tasks t
            JOIN positions p ON t.position_id = p.id
            WHERE t.product_id = ?
        """, (product_id,))
        task_rows = cursor.fetchall()
        
        tasks = []
        total_hours = 0
        total_actual_hours = 0
        total_labor_cost_min = 0
        total_labor_cost_max = 0
        total_actual_cost_min = 0
        total_actual_cost_max = 0
        
        for row in task_rows:
            task_data = process_task_row(dict(row))
            task_data["product_id"] = row["product_id"]
            tasks.append(task_data)
            
            total_hours += row["estimated_hours"]
            total_actual_hours += (row["actual_hours"] or 0)
            total_labor_cost_min += task_data["task_cost_min"]
            total_labor_cost_max += task_data["task_cost_max"]
            total_actual_cost_min += task_data["actual_cost_min"]
            total_actual_cost_max += task_data["actual_cost_max"]
        
        cursor.execute("""
            SELECT a.*, s.name as software_name, s.monthly_cost as software_monthly_cost
            FROM product_software_allocations a
            JOIN software_costs s ON a.software_id = s.id
            WHERE a.product_id = ?
        """, (product_id,))
        software_rows = cursor.fetchall()
        
        software_allocations = []
        total_software_cost = 0
        
        for row in software_rows:
            allocated_cost = row["software_monthly_cost"] * row["allocation_percent"] / 100
            total_software_cost += allocated_cost
            software_allocations.append({
                "id": row["id"],
                "software_name": row["software_name"],
                "software_monthly_cost": row["software_monthly_cost"],
                "allocation_percent": row["allocation_percent"],
                "allocated_cost": allocated_cost
            })
        
        overhead_fees = calculate_overhead_and_fees(
            total_labor_cost_min, total_labor_cost_max, total_software_cost, fee_percent
        )
        
        overall_hours_progress = calculate_hours_progress(total_actual_hours, total_hours)
        overall_hours_status = calculate_hours_status(total_actual_hours, total_hours)
        
        dept_cost_breakdown = []
        if service_departments and overhead_fees["total_max"] > 0:
            has_allocations = any(d["allocation_percent"] for d in service_departments)
            if has_allocations:
                for dept in service_departments:
                    pct = dept["allocation_percent"] or 0
                    dept_cost_breakdown.append({
                        "department_name": dept["department_name"],
                        "role": dept["role"],
                        "allocation_percent": pct,
                        "cost_min": overhead_fees["total_min"] * pct / 100,
                        "cost_max": overhead_fees["total_max"] * pct / 100
                    })
            else:
                equal_pct = 100 / len(service_departments)
                for dept in service_departments:
                    dept_cost_breakdown.append({
                        "department_name": dept["department_name"],
                        "role": dept["role"],
                        "allocation_percent": equal_pct,
                        "cost_min": overhead_fees["total_min"] * equal_pct / 100,
                        "cost_max": overhead_fees["total_max"] * equal_pct / 100
                    })
        
        estimated_value = product["estimated_value"]
        roi = calculate_roi(estimated_value, overhead_fees["total_min"], overhead_fees["total_max"])
        gain_pain = calculate_gain_pain(estimated_value, overhead_fees["total_min"], overhead_fees["total_max"])
        
        gain_pain_mid = (gain_pain["gain_pain_low"] + gain_pain["gain_pain_high"]) / 2
        if gain_pain["gain_pain_high"] == float('inf'):
            gain_pain_mid = gain_pain["gain_pain_low"]
        
        recommendation = get_recommendation(roi["roi_low"], roi["roi_high"], gain_pain_mid)
        
        result = {
            "product": product,
            "tasks": tasks,
            "software_allocations": software_allocations,
            "department_cost_breakdown": dept_cost_breakdown,
            "summary": {
                "total_hours": total_hours,
                "total_actual_hours": total_actual_hours,
                "overall_hours_progress": overall_hours_progress,
                "overall_hours_status": overall_hours_status,
                "total_labor_cost_min": total_labor_cost_min,
                "total_labor_cost_max": total_labor_cost_max,
                "total_actual_labor_cost_min": total_actual_cost_min,
                "total_actual_labor_cost_max": total_actual_cost_max,
                "total_software_cost": total_software_cost,
                **overhead_fees,
                "total_cost_min": overhead_fees["total_min"],
                "total_cost_max": overhead_fees["total_max"],
                "total_actual_cost_min": total_actual_cost_min + total_software_cost,
                "total_actual_cost_max": total_actual_cost_max + total_software_cost,
                "estimated_monthly_value": estimated_value,
                "roi_percent_low": roi["roi_low"] if roi["roi_low"] != float('inf') else None,
                "roi_percent_high": roi["roi_high"] if roi["roi_high"] != float('inf') else None,
                "gain_pain_ratio_low": gain_pain["gain_pain_low"] if gain_pain["gain_pain_low"] != float('inf') else None,
                "gain_pain_ratio_high": gain_pain["gain_pain_high"] if gain_pain["gain_pain_high"] != float('inf') else None,
            },
            "recommendation": recommendation
        }
    
    return {"success": True, "data": result, "error": None}

@router.get("/api/dashboard", response_model=dict)
def get_dashboard():
    with get_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT 
                p.*,
                GROUP_CONCAT(DISTINCT CASE WHEN psd.role = 'lead' THEN sd.name END) as lead_dept,
                GROUP_CONCAT(DISTINCT sd.name) as all_depts,
                CASE 
                    WHEN p.requestor_type = 'service_department' THEN req_sd.name
                    ELSE p.business_unit
                END as requestor_name
            FROM products p
            LEFT JOIN product_service_departments psd ON p.id = psd.product_id
            LEFT JOIN service_departments sd ON psd.department_id = sd.id
            LEFT JOIN service_departments req_sd ON p.requestor_type = 'service_department' AND p.requestor_id = req_sd.id
            GROUP BY p.id
            ORDER BY p.created_at DESC
        """)
        product_rows = cursor.fetchall()
        
        cursor.execute("""
            SELECT 
                t.product_id,
                SUM(t.estimated_hours * pos.hourly_cost_min) as cost_min,
                SUM(t.estimated_hours * pos.hourly_cost_max) as cost_max,
                SUM(t.estimated_hours) as total_estimated,
                SUM(COALESCE(t.actual_hours, 0)) as total_actual,
                SUM(COALESCE(t.actual_hours, 0) * pos.hourly_cost_min) as actual_cost_min,
                SUM(COALESCE(t.actual_hours, 0) * pos.hourly_cost_max) as actual_cost_max
            FROM tasks t
            JOIN positions pos ON t.position_id = pos.id
            GROUP BY t.product_id
        """)
        task_costs = {row["product_id"]: dict(row) for row in cursor.fetchall()}
        
        cursor.execute("""
            SELECT 
                a.product_id,
                SUM(s.monthly_cost * a.allocation_percent / 100) as software_cost
            FROM product_software_allocations a
            JOIN software_costs s ON a.software_id = s.id
            GROUP BY a.product_id
        """)
        software_costs = {row["product_id"]: row["software_cost"] for row in cursor.fetchall()}
        
        cursor.execute("SELECT DISTINCT business_unit FROM products WHERE business_unit IS NOT NULL AND business_unit != ''")
        business_units = [row["business_unit"] for row in cursor.fetchall()]
        
        cursor.execute("""
            SELECT DISTINCT sd.name 
            FROM service_departments sd
            JOIN product_service_departments psd ON sd.id = psd.department_id
        """)
        service_departments = [row["name"] for row in cursor.fetchall()]
        
        cursor.execute("SELECT id, name FROM service_departments ORDER BY name")
        all_service_departments = [{"id": row["id"], "name": row["name"]} for row in cursor.fetchall()]
        
        cursor.execute("""
            SELECT DISTINCT 
                p.requestor_type,
                CASE 
                    WHEN p.requestor_type = 'service_department' THEN sd.name
                    ELSE p.business_unit
                END as requestor_name
            FROM products p
            LEFT JOIN service_departments sd ON p.requestor_type = 'service_department' AND p.requestor_id = sd.id
            WHERE (p.requestor_type IS NOT NULL AND p.requestor_type != '') 
               OR (p.business_unit IS NOT NULL AND p.business_unit != '')
        """)
        requestors = [{"type": row["requestor_type"] or "business_unit", "name": row["requestor_name"]} for row in cursor.fetchall() if row["requestor_name"]]
        
        products = []
        total_investment_min = 0
        total_investment_max = 0
        total_value = 0
        roi_values = []
        
        for prod in product_rows:
            prod_id = prod["id"]
            tc = task_costs.get(prod_id, {})
            labor_cost_min = tc.get("cost_min") or 0
            labor_cost_max = tc.get("cost_max") or 0
            total_estimated_hours = tc.get("total_estimated") or 0
            total_actual_hours = tc.get("total_actual") or 0
            actual_labor_cost_min = tc.get("actual_cost_min") or 0
            actual_labor_cost_max = tc.get("actual_cost_max") or 0
            
            software_cost = software_costs.get(prod_id, 0) or 0
            
            total_cost_min = labor_cost_min + software_cost
            total_cost_max = labor_cost_max + software_cost
            
            hours_progress = calculate_hours_progress(total_actual_hours, total_estimated_hours)
            hours_status = calculate_hours_status(total_actual_hours, total_estimated_hours)
            
            estimated_value = prod["estimated_value"]
            roi = calculate_roi(estimated_value, total_cost_min, total_cost_max)
            
            roi_mid = None
            if roi["roi_low"] != float('inf') and roi["roi_high"] != float('inf'):
                roi_mid = (roi["roi_low"] + roi["roi_high"]) / 2
            elif roi["roi_low"] != float('inf'):
                roi_mid = roi["roi_low"]
            
            health, recommendation = get_health_from_roi(roi_mid)
            
            requestor_type = prod["requestor_type"] if "requestor_type" in prod.keys() else None
            requestor_id = prod["requestor_id"] if "requestor_id" in prod.keys() else None
            
            all_depts = prod["all_depts"].split(",") if prod["all_depts"] else []
            
            products.append({
                "id": prod["id"],
                "name": prod["name"],
                "business_unit": prod["business_unit"],
                "requestor_type": requestor_type,
                "requestor_id": requestor_id,
                "requestor_name": prod["requestor_name"],
                "lead_department": prod["lead_dept"],
                "service_departments": all_depts,
                "status": prod["status"],
                "product_type": prod["product_type"],
                "labor_cost_min": labor_cost_min,
                "labor_cost_max": labor_cost_max,
                "actual_labor_cost_min": actual_labor_cost_min,
                "actual_labor_cost_max": actual_labor_cost_max,
                "software_cost": software_cost,
                "total_cost_min": total_cost_min,
                "total_cost_max": total_cost_max,
                "estimated_hours": total_estimated_hours,
                "actual_hours": total_actual_hours,
                "hours_progress": hours_progress,
                "hours_status": hours_status,
                "estimated_value": estimated_value,
                "roi_low": roi["roi_low"] if roi["roi_low"] != float('inf') else None,
                "roi_high": roi["roi_high"] if roi["roi_high"] != float('inf') else None,
                "health": health,
                "recommendation": recommendation
            })
            
            total_investment_min += total_cost_min
            total_investment_max += total_cost_max
            total_value += estimated_value
            if roi_mid is not None:
                roi_values.append(roi_mid)
        
        avg_roi = sum(roi_values) / len(roi_values) if roi_values else None
        
        dashboard_result = {
            "summary": {
                "total_products": len(products),
                "total_investment_min": total_investment_min,
                "total_investment_max": total_investment_max,
                "total_value": total_value,
                "avg_roi": avg_roi
            },
            "business_units": business_units,
            "service_departments": service_departments,
            "all_service_departments": all_service_departments,
            "requestors": requestors,
            "products": products
        }
    
    return {"success": True, "data": dashboard_result, "error": None}
