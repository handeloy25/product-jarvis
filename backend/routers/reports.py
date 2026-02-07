from fastapi import APIRouter, HTTPException
from datetime import datetime, timedelta
from database import get_connection

router = APIRouter(tags=["reports"])

def get_hours_status(actual, estimated):
    if actual == 0:
        return "not_started"
    elif actual < estimated * 0.9:
        return "under"
    elif actual <= estimated * 1.1:
        return "on_track"
    else:
        return "over"

@router.get("/api/reports/products", response_model=dict)
def get_products_report(period: str = "30"):
    days = 7 if period == "7" else 30
    cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
    
    with get_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT p.*, sd.name as requestor_department_name
            FROM products p
            LEFT JOIN service_departments sd ON p.requestor_type = 'service_department' AND p.requestor_id = sd.id
            WHERE p.status IN ('Ideation', 'Approved', 'In Development')
            ORDER BY p.created_at DESC
        """)
        product_rows = cursor.fetchall()
        
        products = []
        total_estimated_hours = 0
        total_actual_hours = 0
        total_overhead_min = 0
        total_overhead_max = 0
        
        for prod in product_rows:
            cursor.execute("""
                SELECT 
                    SUM(t.estimated_hours) as total_estimated,
                    SUM(COALESCE(t.actual_hours, 0)) as total_actual,
                    SUM(t.estimated_hours * p.hourly_cost_min) as cost_min,
                    SUM(t.estimated_hours * p.hourly_cost_max) as cost_max
                FROM tasks t
                JOIN positions p ON t.position_id = p.id
                WHERE t.product_id = ?
            """, (prod["id"],))
            task_row = cursor.fetchone()
            
            estimated = task_row["total_estimated"] or 0
            actual = task_row["total_actual"] or 0
            cost_min = task_row["cost_min"] or 0
            cost_max = task_row["cost_max"] or 0
            
            cursor.execute("""
                SELECT SUM(s.monthly_cost * a.allocation_percent / 100) as software_cost
                FROM product_software_allocations a
                JOIN software_costs s ON a.software_id = s.id
                WHERE a.product_id = ?
            """, (prod["id"],))
            sw_row = cursor.fetchone()
            software_cost = sw_row["software_cost"] or 0
            
            overhead_min = cost_min + software_cost
            overhead_max = cost_max + software_cost
            
            progress = (actual / estimated * 100) if estimated > 0 else 0
            status = get_hours_status(actual, estimated)
            
            cursor.execute("""
                SELECT t.name, t.estimated_hours, COALESCE(t.actual_hours, 0) as actual_hours, 
                       p.title as position_title
                FROM tasks t
                JOIN positions p ON t.position_id = p.id
                WHERE t.product_id = ?
                ORDER BY t.estimated_hours DESC
            """, (prod["id"],))
            task_details = []
            for t in cursor.fetchall():
                t_progress = (t["actual_hours"] / t["estimated_hours"] * 100) if t["estimated_hours"] > 0 else 0
                t_status = get_hours_status(t["actual_hours"], t["estimated_hours"])
                task_details.append({
                    "name": t["name"],
                    "position_title": t["position_title"],
                    "estimated_hours": t["estimated_hours"],
                    "actual_hours": t["actual_hours"],
                    "progress": round(t_progress, 1),
                    "status": t_status
                })
            
            requestor = prod["requestor_department_name"] if prod["requestor_type"] == "service_department" else prod["business_unit"]
            
            products.append({
                "id": prod["id"],
                "name": prod["name"],
                "status": prod["status"],
                "requestor": requestor,
                "business_unit": prod["business_unit"],
                "estimated_hours": estimated,
                "actual_hours": actual,
                "progress": round(progress, 1),
                "hours_status": status,
                "overhead_min": overhead_min,
                "overhead_max": overhead_max,
                "tasks": task_details
            })
            
            total_estimated_hours += estimated
            total_actual_hours += actual
            total_overhead_min += overhead_min
            total_overhead_max += overhead_max
        
        cursor.execute("""
            SELECT p.title, 
                   SUM(t.estimated_hours) as estimated,
                   SUM(COALESCE(t.actual_hours, 0)) as actual
            FROM tasks t
            JOIN positions p ON t.position_id = p.id
            JOIN products pr ON t.product_id = pr.id
            WHERE pr.status IN ('Ideation', 'Approved', 'In Development')
            GROUP BY p.id, p.title
            ORDER BY estimated DESC
        """)
        position_rows = cursor.fetchall()
        by_position = []
        for pos in position_rows:
            est = pos["estimated"] or 0
            act = pos["actual"] or 0
            prog = (act / est * 100) if est > 0 else 0
            by_position.append({
                "position_title": pos["title"],
                "estimated_hours": est,
                "actual_hours": act,
                "progress": round(prog, 1),
                "status": get_hours_status(act, est)
            })
        
        overall_progress = (total_actual_hours / total_estimated_hours * 100) if total_estimated_hours > 0 else 0
        
        result = {
            "period_days": days,
            "generated_at": datetime.now().isoformat(),
            "summary": {
                "total_products": len(products),
                "total_estimated_hours": total_estimated_hours,
                "total_actual_hours": total_actual_hours,
                "overall_progress": round(overall_progress, 1),
                "overall_status": get_hours_status(total_actual_hours, total_estimated_hours),
                "total_overhead_min": total_overhead_min,
                "total_overhead_max": total_overhead_max
            },
            "products": products,
            "by_position": by_position
        }
    
    return {"success": True, "data": result, "error": None}

@router.get("/api/reports/services", response_model=dict)
def get_services_report(period: str = "30"):
    days = 7 if period == "7" else 30
    cutoff_date = (datetime.now() - timedelta(days=days)).isoformat()
    
    with get_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT s.*, sd.name as department_name, st.name as service_type_name
            FROM services s
            JOIN service_departments sd ON s.service_department_id = sd.id
            JOIN service_types st ON s.service_type_id = st.id
            WHERE s.status = 'Active'
            ORDER BY s.created_at DESC
        """)
        service_rows = cursor.fetchall()
        
        services = []
        total_estimated_hours = 0
        total_actual_hours = 0
        total_overhead_min = 0
        total_overhead_max = 0
        total_with_fees_min = 0
        total_with_fees_max = 0
        
        for svc in service_rows:
            cursor.execute("""
                SELECT 
                    SUM(t.estimated_hours) as total_estimated,
                    SUM(COALESCE(t.actual_hours, 0)) as total_actual,
                    SUM(t.estimated_hours * p.hourly_cost_min) as cost_min,
                    SUM(t.estimated_hours * p.hourly_cost_max) as cost_max
                FROM service_tasks t
                JOIN positions p ON t.position_id = p.id
                WHERE t.service_id = ?
            """, (svc["id"],))
            task_row = cursor.fetchone()
            
            estimated = task_row["total_estimated"] or 0
            actual = task_row["total_actual"] or 0
            cost_min = task_row["cost_min"] or 0
            cost_max = task_row["cost_max"] or 0
            
            cursor.execute("""
                SELECT SUM(sc.monthly_cost * a.allocation_percent / 100) as software_cost
                FROM service_software_allocations a
                JOIN software_costs sc ON a.software_id = sc.id
                WHERE a.service_id = ?
            """, (svc["id"],))
            sw_row = cursor.fetchone()
            software_cost = sw_row["software_cost"] or 0
            
            overhead_min = cost_min + software_cost
            overhead_max = cost_max + software_cost
            
            fee_percent = svc["fee_percent"] or 0
            fee_min = overhead_min * fee_percent / 100
            fee_max = overhead_max * fee_percent / 100
            total_min = overhead_min + fee_min
            total_max = overhead_max + fee_max
            
            progress = (actual / estimated * 100) if estimated > 0 else 0
            status = get_hours_status(actual, estimated)
            
            cursor.execute("""
                SELECT t.name, t.estimated_hours, COALESCE(t.actual_hours, 0) as actual_hours, 
                       t.is_recurring, t.recurrence_type, p.title as position_title
                FROM service_tasks t
                JOIN positions p ON t.position_id = p.id
                WHERE t.service_id = ?
                ORDER BY t.estimated_hours DESC
            """, (svc["id"],))
            task_details = []
            for t in cursor.fetchall():
                t_progress = (t["actual_hours"] / t["estimated_hours"] * 100) if t["estimated_hours"] > 0 else 0
                t_status = get_hours_status(t["actual_hours"], t["estimated_hours"])
                task_details.append({
                    "name": t["name"],
                    "position_title": t["position_title"],
                    "estimated_hours": t["estimated_hours"],
                    "actual_hours": t["actual_hours"],
                    "progress": round(t_progress, 1),
                    "status": t_status,
                    "is_recurring": bool(t["is_recurring"]),
                    "recurrence_type": t["recurrence_type"]
                })
            
            services.append({
                "id": svc["id"],
                "name": svc["name"],
                "department_name": svc["department_name"],
                "business_unit": svc["business_unit"],
                "service_type_name": svc["service_type_name"],
                "status": svc["status"],
                "estimated_hours": estimated,
                "actual_hours": actual,
                "progress": round(progress, 1),
                "hours_status": status,
                "overhead_min": overhead_min,
                "overhead_max": overhead_max,
                "fee_percent": fee_percent,
                "total_min": total_min,
                "total_max": total_max,
                "tasks": task_details
            })
            
            total_estimated_hours += estimated
            total_actual_hours += actual
            total_overhead_min += overhead_min
            total_overhead_max += overhead_max
            total_with_fees_min += total_min
            total_with_fees_max += total_max
        
        cursor.execute("""
            SELECT p.title, 
                   SUM(t.estimated_hours) as estimated,
                   SUM(COALESCE(t.actual_hours, 0)) as actual
            FROM service_tasks t
            JOIN positions p ON t.position_id = p.id
            JOIN services s ON t.service_id = s.id
            WHERE s.status = 'Active'
            GROUP BY p.id, p.title
            ORDER BY estimated DESC
        """)
        position_rows = cursor.fetchall()
        by_position = []
        for pos in position_rows:
            est = pos["estimated"] or 0
            act = pos["actual"] or 0
            prog = (act / est * 100) if est > 0 else 0
            by_position.append({
                "position_title": pos["title"],
                "estimated_hours": est,
                "actual_hours": act,
                "progress": round(prog, 1),
                "status": get_hours_status(act, est)
            })
        
        overall_progress = (total_actual_hours / total_estimated_hours * 100) if total_estimated_hours > 0 else 0
        
        result = {
            "period_days": days,
            "generated_at": datetime.now().isoformat(),
            "summary": {
                "total_services": len(services),
                "total_estimated_hours": total_estimated_hours,
                "total_actual_hours": total_actual_hours,
                "overall_progress": round(overall_progress, 1),
                "overall_status": get_hours_status(total_actual_hours, total_estimated_hours),
                "total_overhead_min": total_overhead_min,
                "total_overhead_max": total_overhead_max,
                "total_with_fees_min": total_with_fees_min,
                "total_with_fees_max": total_with_fees_max
            },
            "services": services,
            "by_position": by_position
        }
    
    return {"success": True, "data": result, "error": None}
