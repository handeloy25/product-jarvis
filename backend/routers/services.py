from fastapi import APIRouter, HTTPException, BackgroundTasks
from datetime import datetime
from models.service import (
    ServiceType, ServiceTypeCreate, ServiceTypeUpdate,
    Service, ServiceCreate, ServiceUpdate,
    ServiceTask, ServiceTaskCreate, ServiceTaskUpdate,
    ServiceSoftwareAllocationCreate
)
from database import get_connection
from services.calculation_service import (
    calculate_hours_status,
    calculate_hours_progress,
    calculate_task_costs,
    calculate_overhead_and_fees,
    process_task_row
)
from services.webhook_service import send_service_webhook
import logging

logger = logging.getLogger(__name__)

router = APIRouter(tags=["services"])

@router.get("/api/service-types", response_model=dict)
def list_service_types(department_id: int = None):
    with get_connection() as conn:
        cursor = conn.cursor()
        if department_id:
            cursor.execute("""
                SELECT st.*, sd.name as department_name 
                FROM service_types st
                LEFT JOIN service_departments sd ON st.department_id = sd.id
                WHERE st.department_id = ?
                ORDER BY st.name
            """, (department_id,))
        else:
            cursor.execute("""
                SELECT st.*, sd.name as department_name 
                FROM service_types st
                LEFT JOIN service_departments sd ON st.department_id = sd.id
                ORDER BY sd.name, st.name
            """)
        rows = cursor.fetchall()
        data = [{
            "id": r["id"],
            "name": r["name"],
            "description": r["description"],
            "is_recurring": bool(r["is_recurring"]),
            "department_id": r["department_id"],
            "department_name": r["department_name"],
            "created_at": r["created_at"]
        } for r in rows]
    return {"success": True, "data": data, "error": None}

@router.post("/api/service-types", response_model=dict, status_code=201)
def create_service_type(st: ServiceTypeCreate):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM service_departments WHERE id = ?", (st.department_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Service department not found")
        now = datetime.now().isoformat()
        cursor.execute(
            "INSERT INTO service_types (name, description, is_recurring, department_id, created_at) VALUES (?, ?, ?, ?, ?)",
            (st.name, st.description, st.is_recurring, st.department_id, now)
        )
        conn.commit()
        st_id = cursor.lastrowid
        cursor.execute("""
            SELECT st.*, sd.name as department_name 
            FROM service_types st
            LEFT JOIN service_departments sd ON st.department_id = sd.id
            WHERE st.id = ?
        """, (st_id,))
        row = cursor.fetchone()
    return {"success": True, "data": dict(row), "error": None}

@router.put("/api/service-types/{st_id}", response_model=dict)
def update_service_type(st_id: int, st: ServiceTypeUpdate):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM service_types WHERE id = ?", (st_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Service type not found")
        
        updates = []
        values = []
        if st.name is not None:
            updates.append("name = ?")
            values.append(st.name)
        if st.description is not None:
            updates.append("description = ?")
            values.append(st.description)
        if st.is_recurring is not None:
            updates.append("is_recurring = ?")
            values.append(st.is_recurring)
        if st.department_id is not None:
            cursor.execute("SELECT * FROM service_departments WHERE id = ?", (st.department_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Service department not found")
            updates.append("department_id = ?")
            values.append(st.department_id)
        
        if updates:
            values.append(st_id)
            cursor.execute(f"UPDATE service_types SET {', '.join(updates)} WHERE id = ?", values)
            conn.commit()
        
        cursor.execute("""
            SELECT st.*, sd.name as department_name 
            FROM service_types st
            LEFT JOIN service_departments sd ON st.department_id = sd.id
            WHERE st.id = ?
        """, (st_id,))
        row = cursor.fetchone()
    return {"success": True, "data": dict(row), "error": None}

@router.delete("/api/service-types/{st_id}", response_model=dict)
def delete_service_type(st_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM service_types WHERE id = ?", (st_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Service type not found")
        cursor.execute("DELETE FROM service_types WHERE id = ?", (st_id,))
        conn.commit()
    return {"success": True, "data": {"deleted": st_id}, "error": None}

@router.get("/api/services", response_model=dict)
def list_services():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT s.*, sd.name as department_name, st.name as service_type_name, st.is_recurring as type_is_recurring
            FROM services s
            JOIN service_departments sd ON s.service_department_id = sd.id
            JOIN service_types st ON s.service_type_id = st.id
            ORDER BY s.created_at DESC
        """)
        rows = cursor.fetchall()
        data = [{
            "id": r["id"],
            "name": r["name"],
            "description": r["description"],
            "service_department_id": r["service_department_id"],
            "department_name": r["department_name"],
            "business_unit": r["business_unit"],
            "service_type_id": r["service_type_id"],
            "service_type_name": r["service_type_name"],
            "type_is_recurring": bool(r["type_is_recurring"]),
            "status": r["status"],
            "fee_percent": r["fee_percent"],
            "created_at": r["created_at"],
            "updated_at": r["updated_at"]
        } for r in rows]
    return {"success": True, "data": data, "error": None}

async def _send_service_webhook_async(service_id, name, description, department_name, business_unit):
    result = await send_service_webhook(service_id, name, description, department_name, business_unit)
    if not result.get("success"):
        logger.warning(f"Webhook failed for service {service_id}: {result}")


@router.post("/api/services", response_model=dict, status_code=201)
async def create_service(service: ServiceCreate, background_tasks: BackgroundTasks):
    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM service_departments WHERE id = ?", (service.service_department_id,))
        dept_row = cursor.fetchone()
        if not dept_row:
            raise HTTPException(status_code=404, detail="Service department not found")
        department_name = dept_row["name"]

        cursor.execute("SELECT * FROM service_types WHERE id = ?", (service.service_type_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Service type not found")

        now = datetime.now().isoformat()
        cursor.execute("""
            INSERT INTO services (name, description, service_department_id, business_unit, business_unit_id, service_type_id, status, fee_percent, created_at, updated_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (service.name, service.description, service.service_department_id, service.business_unit,
              service.business_unit_id, service.service_type_id, service.status, service.fee_percent, now, now))
        conn.commit()
        service_id = cursor.lastrowid

        cursor.execute("""
            SELECT s.*, sd.name as department_name, st.name as service_type_name
            FROM services s
            JOIN service_departments sd ON s.service_department_id = sd.id
            JOIN service_types st ON s.service_type_id = st.id
            WHERE s.id = ?
        """, (service_id,))
        row = cursor.fetchone()

    logger.info(f"Service {service_id} created, triggering TF webhook")
    background_tasks.add_task(
        _send_service_webhook_async,
        service_id,
        service.name,
        service.description,
        department_name,
        service.business_unit
    )

    return {"success": True, "data": dict(row), "error": None}

@router.get("/api/services/{service_id}", response_model=dict)
def get_service(service_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT s.*, sd.name as department_name, st.name as service_type_name, st.is_recurring as type_is_recurring
            FROM services s
            JOIN service_departments sd ON s.service_department_id = sd.id
            JOIN service_types st ON s.service_type_id = st.id
            WHERE s.id = ?
        """, (service_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Service not found")
    return {"success": True, "data": dict(row), "error": None}

@router.put("/api/services/{service_id}", response_model=dict)
def update_service(service_id: int, service: ServiceUpdate):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM services WHERE id = ?", (service_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Service not found")
        
        updates = []
        values = []
        if service.name is not None:
            updates.append("name = ?")
            values.append(service.name)
        if service.description is not None:
            updates.append("description = ?")
            values.append(service.description)
        if service.service_department_id is not None:
            cursor.execute("SELECT * FROM service_departments WHERE id = ?", (service.service_department_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Service department not found")
            updates.append("service_department_id = ?")
            values.append(service.service_department_id)
        if service.business_unit is not None:
            updates.append("business_unit = ?")
            values.append(service.business_unit)
        if service.business_unit_id is not None:
            updates.append("business_unit_id = ?")
            values.append(service.business_unit_id)
        if service.service_type_id is not None:
            cursor.execute("SELECT * FROM service_types WHERE id = ?", (service.service_type_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=404, detail="Service type not found")
            updates.append("service_type_id = ?")
            values.append(service.service_type_id)
        if service.status is not None:
            updates.append("status = ?")
            values.append(service.status)
        if service.fee_percent is not None:
            updates.append("fee_percent = ?")
            values.append(service.fee_percent)
        
        if updates:
            updates.append("updated_at = ?")
            values.append(datetime.now().isoformat())
            values.append(service_id)
            cursor.execute(f"UPDATE services SET {', '.join(updates)} WHERE id = ?", values)
            conn.commit()
        
        cursor.execute("""
            SELECT s.*, sd.name as department_name, st.name as service_type_name
            FROM services s
            JOIN service_departments sd ON s.service_department_id = sd.id
            JOIN service_types st ON s.service_type_id = st.id
            WHERE s.id = ?
        """, (service_id,))
        row = cursor.fetchone()
    return {"success": True, "data": dict(row), "error": None}

@router.delete("/api/services/{service_id}", response_model=dict)
def delete_service(service_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM services WHERE id = ?", (service_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Service not found")
        cursor.execute("DELETE FROM services WHERE id = ?", (service_id,))
        conn.commit()
    return {"success": True, "data": {"deleted": service_id}, "error": None}

@router.get("/api/services/{service_id}/tasks", response_model=dict)
def list_service_tasks(service_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM services WHERE id = ?", (service_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Service not found")
        
        cursor.execute("""
            SELECT t.*, p.title as position_title, p.hourly_cost_min, p.hourly_cost_max
            FROM service_tasks t
            JOIN positions p ON t.position_id = p.id
            WHERE t.service_id = ?
            ORDER BY t.created_at DESC
        """, (service_id,))
        rows = cursor.fetchall()
        
        tasks = []
        for row in rows:
            actual_hours = row["actual_hours"] or 0
            costs = calculate_task_costs(
                row["estimated_hours"], actual_hours, row["hourly_cost_min"], row["hourly_cost_max"]
            )
            tasks.append({
                "id": row["id"],
                "service_id": row["service_id"],
                "position_id": row["position_id"],
                "name": row["name"],
                "estimated_hours": row["estimated_hours"],
                "actual_hours": actual_hours,
                "is_recurring": bool(row["is_recurring"]),
                "recurrence_type": row["recurrence_type"],
                "created_at": row["created_at"],
                "position_title": row["position_title"],
                "hourly_cost_min": row["hourly_cost_min"],
                "hourly_cost_max": row["hourly_cost_max"],
                **costs
            })
    return {"success": True, "data": tasks, "error": None}

@router.post("/api/services/{service_id}/tasks", response_model=dict, status_code=201)
def create_service_task(service_id: int, task: ServiceTaskCreate):
    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("SELECT * FROM services WHERE id = ?", (service_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Service not found")

        cursor.execute("SELECT * FROM positions WHERE id = ?", (task.position_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Position not found")

        now = datetime.now().isoformat()
        cursor.execute("""
            INSERT INTO service_tasks (service_id, position_id, name, estimated_hours, is_recurring, recurrence_type, external_id, status, assignee_name, created_at)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        """, (service_id, task.position_id, task.name, task.estimated_hours, task.is_recurring, task.recurrence_type, task.external_id, task.status or "open", task.assignee_name, now))
        conn.commit()
        task_id = cursor.lastrowid

        cursor.execute("""
            SELECT t.*, p.title as position_title, p.hourly_cost_min, p.hourly_cost_max
            FROM service_tasks t
            JOIN positions p ON t.position_id = p.id
            WHERE t.id = ?
        """, (task_id,))
        row = cursor.fetchone()

        costs = calculate_task_costs(
            row["estimated_hours"], 0, row["hourly_cost_min"], row["hourly_cost_max"]
        )
        result = {
            "id": row["id"],
            "service_id": row["service_id"],
            "position_id": row["position_id"],
            "name": row["name"],
            "estimated_hours": row["estimated_hours"],
            "actual_hours": row["actual_hours"],
            "is_recurring": bool(row["is_recurring"]),
            "recurrence_type": row["recurrence_type"],
            "external_id": row["external_id"],
            "status": row["status"] or "open",
            "assignee_name": row["assignee_name"],
            "created_at": row["created_at"],
            "position_title": row["position_title"],
            "hourly_cost_min": row["hourly_cost_min"],
            "hourly_cost_max": row["hourly_cost_max"],
            **costs
        }
    return {"success": True, "data": result, "error": None}

@router.patch("/api/service-tasks/{task_id}", response_model=dict)
def update_service_task(task_id: int, task_update: ServiceTaskUpdate):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM service_tasks WHERE id = ?", (task_id,))
        if not cursor.fetchone():
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
        if task_update.is_recurring is not None:
            updates.append("is_recurring = ?")
            values.append(task_update.is_recurring)
        if task_update.recurrence_type is not None:
            updates.append("recurrence_type = ?")
            values.append(task_update.recurrence_type)
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
        cursor.execute(f"UPDATE service_tasks SET {', '.join(updates)} WHERE id = ?", values)
        conn.commit()

        cursor.execute("""
            SELECT t.*, p.title as position_title, p.hourly_cost_min, p.hourly_cost_max
            FROM service_tasks t
            JOIN positions p ON t.position_id = p.id
            WHERE t.id = ?
        """, (task_id,))
        row = cursor.fetchone()

        actual_hours = row["actual_hours"] or 0
        costs = calculate_task_costs(
            row["estimated_hours"], actual_hours, row["hourly_cost_min"], row["hourly_cost_max"]
        )
        result = {
            "id": row["id"],
            "service_id": row["service_id"],
            "position_id": row["position_id"],
            "name": row["name"],
            "estimated_hours": row["estimated_hours"],
            "actual_hours": actual_hours,
            "is_recurring": bool(row["is_recurring"]),
            "recurrence_type": row["recurrence_type"],
            "external_id": row["external_id"],
            "status": row["status"] or "open",
            "assignee_name": row["assignee_name"],
            "due_date": row["due_date"] if "due_date" in row.keys() else None,
            "created_at": row["created_at"],
            "updated_at": row["updated_at"] if "updated_at" in row.keys() else None,
            "position_title": row["position_title"],
            "hourly_cost_min": row["hourly_cost_min"],
            "hourly_cost_max": row["hourly_cost_max"],
            **costs
        }
    return {"success": True, "data": result, "error": None}

@router.get("/api/service-tasks/{task_id}", response_model=dict)
def get_service_task(task_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT t.*, p.title as position_title, p.hourly_cost_min, p.hourly_cost_max
            FROM service_tasks t
            JOIN positions p ON t.position_id = p.id
            WHERE t.id = ?
        """, (task_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Task not found")

        actual_hours = row["actual_hours"] or 0
        costs = calculate_task_costs(
            row["estimated_hours"], actual_hours, row["hourly_cost_min"], row["hourly_cost_max"]
        )
        result = {
            "id": row["id"],
            "service_id": row["service_id"],
            "position_id": row["position_id"],
            "name": row["name"],
            "estimated_hours": row["estimated_hours"],
            "actual_hours": actual_hours,
            "is_recurring": bool(row["is_recurring"]),
            "recurrence_type": row["recurrence_type"],
            "external_id": row["external_id"],
            "status": row["status"] or "open",
            "assignee_name": row["assignee_name"],
            "created_at": row["created_at"],
            "updated_at": row["updated_at"] if "updated_at" in row.keys() else None,
            "position_title": row["position_title"],
            "hourly_cost_min": row["hourly_cost_min"],
            "hourly_cost_max": row["hourly_cost_max"],
            **costs
        }
    return {"success": True, "data": result, "error": None}

@router.delete("/api/service-tasks/{task_id}", response_model=dict)
def delete_service_task(task_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM service_tasks WHERE id = ?", (task_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Task not found")
        cursor.execute("DELETE FROM service_tasks WHERE id = ?", (task_id,))
        conn.commit()
    return {"success": True, "data": {"deleted": task_id}, "error": None}

@router.get("/api/services/{service_id}/software", response_model=dict)
def list_service_software(service_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM services WHERE id = ?", (service_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Service not found")
        
        cursor.execute("""
            SELECT a.*, s.name as software_name, s.monthly_cost as software_monthly_cost
            FROM service_software_allocations a
            JOIN software_costs s ON a.software_id = s.id
            WHERE a.service_id = ?
        """, (service_id,))
        rows = cursor.fetchall()
        
        allocations = []
        for row in rows:
            allocations.append({
                "id": row["id"],
                "service_id": row["service_id"],
                "software_id": row["software_id"],
                "software_name": row["software_name"],
                "software_monthly_cost": row["software_monthly_cost"],
                "allocation_percent": row["allocation_percent"],
                "allocated_cost": row["software_monthly_cost"] * row["allocation_percent"] / 100,
                "created_at": row["created_at"]
            })
    return {"success": True, "data": allocations, "error": None}

@router.post("/api/services/{service_id}/software", response_model=dict, status_code=201)
def add_service_software(service_id: int, alloc: ServiceSoftwareAllocationCreate):
    with get_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM services WHERE id = ?", (service_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Service not found")
        
        cursor.execute("SELECT * FROM software_costs WHERE id = ?", (alloc.software_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Software not found")
        
        cursor.execute(
            "SELECT * FROM service_software_allocations WHERE service_id = ? AND software_id = ?",
            (service_id, alloc.software_id)
        )
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Software already allocated to this service")
        
        now = datetime.now().isoformat()
        cursor.execute("""
            INSERT INTO service_software_allocations (service_id, software_id, allocation_percent, created_at)
            VALUES (?, ?, ?, ?)
        """, (service_id, alloc.software_id, alloc.allocation_percent, now))
        conn.commit()
        alloc_id = cursor.lastrowid
        
        cursor.execute("""
            SELECT a.*, s.name as software_name, s.monthly_cost as software_monthly_cost
            FROM service_software_allocations a
            JOIN software_costs s ON a.software_id = s.id
            WHERE a.id = ?
        """, (alloc_id,))
        row = cursor.fetchone()
        
        result = {
            "id": row["id"],
            "service_id": row["service_id"],
            "software_id": row["software_id"],
            "software_name": row["software_name"],
            "software_monthly_cost": row["software_monthly_cost"],
            "allocation_percent": row["allocation_percent"],
            "allocated_cost": row["software_monthly_cost"] * row["allocation_percent"] / 100,
            "created_at": row["created_at"]
        }
    return {"success": True, "data": result, "error": None}

@router.delete("/api/service-software/{alloc_id}", response_model=dict)
def delete_service_software(alloc_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM service_software_allocations WHERE id = ?", (alloc_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Allocation not found")
        cursor.execute("DELETE FROM service_software_allocations WHERE id = ?", (alloc_id,))
        conn.commit()
    return {"success": True, "data": {"deleted": alloc_id}, "error": None}

@router.get("/api/services/{service_id}/calculator", response_model=dict)
def calculate_service_cost(service_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT s.*, sd.name as department_name, st.name as service_type_name, st.is_recurring as type_is_recurring
            FROM services s
            JOIN service_departments sd ON s.service_department_id = sd.id
            JOIN service_types st ON s.service_type_id = st.id
            WHERE s.id = ?
        """, (service_id,))
        service_row = cursor.fetchone()
        if not service_row:
            raise HTTPException(status_code=404, detail="Service not found")
        
        service = {
            "id": service_row["id"],
            "name": service_row["name"],
            "description": service_row["description"],
            "department_name": service_row["department_name"],
            "business_unit": service_row["business_unit"],
            "service_type_name": service_row["service_type_name"],
            "type_is_recurring": bool(service_row["type_is_recurring"]),
            "status": service_row["status"],
            "fee_percent": service_row["fee_percent"]
        }
        
        cursor.execute("""
            SELECT t.*, p.title as position_title, p.hourly_cost_min, p.hourly_cost_max
            FROM service_tasks t
            JOIN positions p ON t.position_id = p.id
            WHERE t.service_id = ?
        """, (service_id,))
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
            task_data["service_id"] = row["service_id"]
            task_data["is_recurring"] = bool(row["is_recurring"])
            task_data["recurrence_type"] = row["recurrence_type"]
            tasks.append(task_data)
            
            total_hours += row["estimated_hours"]
            total_actual_hours += (row["actual_hours"] or 0)
            total_labor_cost_min += task_data["task_cost_min"]
            total_labor_cost_max += task_data["task_cost_max"]
            total_actual_cost_min += task_data["actual_cost_min"]
            total_actual_cost_max += task_data["actual_cost_max"]
        
        cursor.execute("""
            SELECT a.*, s.name as software_name, s.monthly_cost as software_monthly_cost
            FROM service_software_allocations a
            JOIN software_costs s ON a.software_id = s.id
            WHERE a.service_id = ?
        """, (service_id,))
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
            total_labor_cost_min, total_labor_cost_max, total_software_cost, service["fee_percent"]
        )
        
        overall_hours_progress = calculate_hours_progress(total_actual_hours, total_hours)
        overall_hours_status = calculate_hours_status(total_actual_hours, total_hours)
        
        result = {
            "service": service,
            "tasks": tasks,
            "software_allocations": software_allocations,
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
                "total_with_fee_min": overhead_fees["total_min"],
                "total_with_fee_max": overhead_fees["total_max"]
            }
        }
    
    return {"success": True, "data": result, "error": None}

@router.get("/api/services-dashboard", response_model=dict)
def get_services_dashboard():
    with get_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT s.*, sd.name as department_name, st.name as service_type_name, st.is_recurring as type_is_recurring
            FROM services s
            JOIN service_departments sd ON s.service_department_id = sd.id
            JOIN service_types st ON s.service_type_id = st.id
            ORDER BY s.created_at DESC
        """)
        service_rows = cursor.fetchall()
        
        cursor.execute("""
            SELECT 
                t.service_id,
                SUM(t.estimated_hours * p.hourly_cost_min) as cost_min,
                SUM(t.estimated_hours * p.hourly_cost_max) as cost_max,
                SUM(t.estimated_hours) as total_estimated,
                SUM(COALESCE(t.actual_hours, 0)) as total_actual
            FROM service_tasks t
            JOIN positions p ON t.position_id = p.id
            GROUP BY t.service_id
        """)
        task_costs = {row["service_id"]: dict(row) for row in cursor.fetchall()}
        
        cursor.execute("""
            SELECT 
                a.service_id,
                SUM(sc.monthly_cost * a.allocation_percent / 100) as software_cost
            FROM service_software_allocations a
            JOIN software_costs sc ON a.software_id = sc.id
            GROUP BY a.service_id
        """)
        software_costs = {row["service_id"]: row["software_cost"] for row in cursor.fetchall()}
        
        cursor.execute("SELECT DISTINCT business_unit FROM services WHERE business_unit IS NOT NULL AND business_unit != ''")
        business_units = [row["business_unit"] for row in cursor.fetchall()]
        
        cursor.execute("""
            SELECT DISTINCT sd.name 
            FROM service_departments sd
            JOIN services s ON sd.id = s.service_department_id
        """)
        service_departments = [row["name"] for row in cursor.fetchall()]
        
        services = []
        total_overhead_min = 0
        total_overhead_max = 0
        total_with_fees_min = 0
        total_with_fees_max = 0
        
        for svc in service_rows:
            svc_id = svc["id"]
            tc = task_costs.get(svc_id, {})
            labor_cost_min = tc.get("cost_min") or 0
            labor_cost_max = tc.get("cost_max") or 0
            total_estimated_hours = tc.get("total_estimated") or 0
            total_actual_hours = tc.get("total_actual") or 0
            
            software_cost = software_costs.get(svc_id, 0) or 0
            
            overhead_fees = calculate_overhead_and_fees(
                labor_cost_min, labor_cost_max, software_cost, svc["fee_percent"] or 0
            )
            
            hours_progress = calculate_hours_progress(total_actual_hours, total_estimated_hours)
            hours_status = calculate_hours_status(total_actual_hours, total_estimated_hours)
            
            services.append({
                "id": svc["id"],
                "name": svc["name"],
                "department_name": svc["department_name"],
                "business_unit": svc["business_unit"],
                "service_type_name": svc["service_type_name"],
                "type_is_recurring": bool(svc["type_is_recurring"]),
                "status": svc["status"],
                "estimated_hours": total_estimated_hours,
                "actual_hours": total_actual_hours,
                "hours_progress": hours_progress,
                "hours_status": hours_status,
                "labor_cost_min": labor_cost_min,
                "labor_cost_max": labor_cost_max,
                "software_cost": software_cost,
                "overhead_min": overhead_fees["overhead_min"],
                "overhead_max": overhead_fees["overhead_max"],
                "fee_percent": overhead_fees["fee_percent"],
                "total_min": overhead_fees["total_min"],
                "total_max": overhead_fees["total_max"]
            })
            
            total_overhead_min += overhead_fees["overhead_min"]
            total_overhead_max += overhead_fees["overhead_max"]
            total_with_fees_min += overhead_fees["total_min"]
            total_with_fees_max += overhead_fees["total_max"]
        
        dashboard_result = {
            "summary": {
                "total_services": len(services),
                "total_overhead_min": total_overhead_min,
                "total_overhead_max": total_overhead_max,
                "total_with_fees_min": total_with_fees_min,
                "total_with_fees_max": total_with_fees_max
            },
            "business_units": business_units,
            "service_departments": service_departments,
            "services": services
        }
    
    return {"success": True, "data": dashboard_result, "error": None}
