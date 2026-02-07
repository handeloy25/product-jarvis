from fastapi import APIRouter, HTTPException, BackgroundTasks
from datetime import datetime
from models.service_department import (
    ServiceDepartment, ServiceDepartmentCreate, ServiceDepartmentUpdate,
    ProductServiceDepartmentCreate, ProductServiceDepartmentUpdate
)
from database import get_connection
from services.webhook_service import send_department_webhook
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/service-departments", tags=["service-departments"])

def row_to_dept(row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "description": row["description"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }

@router.get("", response_model=dict)
def list_service_departments():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM service_departments ORDER BY name")
        rows = cursor.fetchall()
        departments = [row_to_dept(row) for row in rows]
    return {"success": True, "data": departments, "error": None}

@router.get("/stats", response_model=dict)
def get_service_department_stats():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                sd.id,
                sd.name,
                COUNT(DISTINCT CASE WHEN psd.role = 'lead' THEN psd.product_id END) as lead_products,
                COUNT(DISTINCT CASE WHEN psd.role = 'supporting' THEN psd.product_id END) as supporting_products,
                COUNT(DISTINCT psd.product_id) as total_products,
                (SELECT COUNT(*) FROM positions WHERE department = sd.name) as team_size
            FROM service_departments sd
            LEFT JOIN product_service_departments psd ON sd.id = psd.department_id
            GROUP BY sd.id, sd.name
            ORDER BY total_products DESC, sd.name
        """)
        rows = cursor.fetchall()
        stats = [{
            "id": row["id"],
            "name": row["name"],
            "lead_products": row["lead_products"],
            "supporting_products": row["supporting_products"],
            "total_products": row["total_products"],
            "team_size": row["team_size"]
        } for row in rows]
    return {"success": True, "data": stats, "error": None}

@router.post("", response_model=dict, status_code=201)
async def create_service_department(dept: ServiceDepartmentCreate, background_tasks: BackgroundTasks):
    now = datetime.now().isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        try:
            cursor.execute(
                """INSERT INTO service_departments (name, description, created_at, updated_at)
                   VALUES (?, ?, ?, ?)""",
                (dept.name, dept.description, now, now)
            )
            conn.commit()
            dept_id = cursor.lastrowid
            cursor.execute("SELECT * FROM service_departments WHERE id = ?", (dept_id,))
            row = cursor.fetchone()
        except Exception as e:
            if "UNIQUE constraint" in str(e):
                raise HTTPException(status_code=400, detail="Department name already exists")
            raise

    result = row_to_dept(row)
    background_tasks.add_task(
        _send_department_webhook_async,
        dept_id,
        result["name"],
        "department.created",
        None,
        []
    )
    return {"success": True, "data": result, "error": None}

@router.put("/{dept_id}", response_model=dict)
async def update_service_department(dept_id: int, dept: ServiceDepartmentUpdate, background_tasks: BackgroundTasks):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM service_departments WHERE id = ?", (dept_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Department not found")

        updates = {}
        if dept.name is not None:
            updates["name"] = dept.name
        if dept.description is not None:
            updates["description"] = dept.description

        if updates:
            updates["updated_at"] = datetime.now().isoformat()
            set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
            values = list(updates.values()) + [dept_id]
            try:
                cursor.execute(f"UPDATE service_departments SET {set_clause} WHERE id = ?", values)
                conn.commit()
            except Exception as e:
                if "UNIQUE constraint" in str(e):
                    raise HTTPException(status_code=400, detail="Department name already exists")
                raise

        cursor.execute("SELECT * FROM service_departments WHERE id = ?", (dept_id,))
        row = cursor.fetchone()

        cursor.execute("SELECT id, title FROM positions WHERE department = ?", (row["name"],))
        positions = [{"id": p["id"], "name": p["title"]} for p in cursor.fetchall()]

    result = row_to_dept(row)
    background_tasks.add_task(
        _send_department_webhook_async,
        dept_id,
        result["name"],
        "department.updated",
        None,
        positions
    )
    return {"success": True, "data": result, "error": None}


async def _send_department_webhook_async(dept_id, name, event, manager_name, positions):
    result = await send_department_webhook(dept_id, name, event, manager_name, positions)
    if not result.get("success"):
        logger.warning(f"Department webhook failed for department {dept_id}: {result}")

@router.delete("/{dept_id}", response_model=dict)
def delete_service_department(dept_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM service_departments WHERE id = ?", (dept_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Department not found")
        
        cursor.execute("SELECT COUNT(*) as count FROM product_service_departments WHERE department_id = ?", (dept_id,))
        usage_count = cursor.fetchone()["count"]
        if usage_count > 0:
            raise HTTPException(status_code=400, detail=f"Cannot delete: department is assigned to {usage_count} product(s)")
        
        cursor.execute("DELETE FROM service_departments WHERE id = ?", (dept_id,))
        conn.commit()
    return {"success": True, "data": {"deleted": dept_id}, "error": None}


product_dept_router = APIRouter(tags=["product-service-departments"])

def row_to_product_dept(row) -> dict:
    return {
        "id": row["id"],
        "product_id": row["product_id"],
        "department_id": row["department_id"],
        "department_name": row["department_name"] if "department_name" in row.keys() else None,
        "role": row["role"],
        "raci": row["raci"],
        "allocation_percent": row["allocation_percent"],
        "created_at": row["created_at"]
    }

@product_dept_router.get("/api/products/{product_id}/departments", response_model=dict)
def list_product_departments(product_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")
        
        cursor.execute("""
            SELECT psd.*, sd.name as department_name
            FROM product_service_departments psd
            JOIN service_departments sd ON psd.department_id = sd.id
            WHERE psd.product_id = ?
            ORDER BY psd.role DESC, sd.name
        """, (product_id,))
        rows = cursor.fetchall()
        departments = [row_to_product_dept(row) for row in rows]
    return {"success": True, "data": departments, "error": None}

@product_dept_router.post("/api/products/{product_id}/departments", response_model=dict, status_code=201)
def add_product_department(product_id: int, dept: ProductServiceDepartmentCreate):
    now = datetime.now().isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")
        
        cursor.execute("SELECT * FROM service_departments WHERE id = ?", (dept.department_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Department not found")
        
        if dept.role == "lead":
            cursor.execute("""
                SELECT id FROM product_service_departments 
                WHERE product_id = ? AND role = 'lead'
            """, (product_id,))
            if cursor.fetchone():
                raise HTTPException(status_code=400, detail="Product already has a lead department. Update the existing lead first.")
        
        try:
            cursor.execute(
                """INSERT INTO product_service_departments 
                   (product_id, department_id, role, raci, allocation_percent, created_at)
                   VALUES (?, ?, ?, ?, ?, ?)""",
                (product_id, dept.department_id, dept.role, dept.raci, dept.allocation_percent, now)
            )
            conn.commit()
            record_id = cursor.lastrowid
            
            cursor.execute("""
                SELECT psd.*, sd.name as department_name
                FROM product_service_departments psd
                JOIN service_departments sd ON psd.department_id = sd.id
                WHERE psd.id = ?
            """, (record_id,))
            row = cursor.fetchone()
        except Exception as e:
            if "UNIQUE constraint" in str(e):
                raise HTTPException(status_code=400, detail="Department already assigned to this product")
            raise
    
    return {"success": True, "data": row_to_product_dept(row), "error": None}

@product_dept_router.put("/api/products/{product_id}/departments/{assignment_id}", response_model=dict)
def update_product_department(product_id: int, assignment_id: int, dept: ProductServiceDepartmentUpdate):
    with get_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM product_service_departments 
            WHERE id = ? AND product_id = ?
        """, (assignment_id, product_id))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        if dept.role == "lead" and existing["role"] != "lead":
            cursor.execute("""
                UPDATE product_service_departments 
                SET role = 'supporting'
                WHERE product_id = ? AND role = 'lead'
            """, (product_id,))
        
        updates = {}
        if dept.role is not None:
            updates["role"] = dept.role
        if dept.raci is not None:
            updates["raci"] = dept.raci
        if dept.allocation_percent is not None:
            updates["allocation_percent"] = dept.allocation_percent
        
        if updates:
            set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
            values = list(updates.values()) + [assignment_id]
            cursor.execute(f"UPDATE product_service_departments SET {set_clause} WHERE id = ?", values)
            conn.commit()
        
        cursor.execute("""
            SELECT psd.*, sd.name as department_name
            FROM product_service_departments psd
            JOIN service_departments sd ON psd.department_id = sd.id
            WHERE psd.id = ?
        """, (assignment_id,))
        row = cursor.fetchone()
    
    return {"success": True, "data": row_to_product_dept(row), "error": None}

@product_dept_router.delete("/api/products/{product_id}/departments/{assignment_id}", response_model=dict)
def remove_product_department(product_id: int, assignment_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        
        cursor.execute("""
            SELECT * FROM product_service_departments 
            WHERE id = ? AND product_id = ?
        """, (assignment_id, product_id))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Assignment not found")
        
        if existing["role"] == "lead":
            cursor.execute("""
                SELECT COUNT(*) as count FROM product_service_departments 
                WHERE product_id = ? AND id != ?
            """, (product_id, assignment_id))
            other_count = cursor.fetchone()["count"]
            if other_count > 0:
                raise HTTPException(status_code=400, detail="Cannot remove lead department while other departments are assigned. Reassign lead first.")
        
        cursor.execute("DELETE FROM product_service_departments WHERE id = ?", (assignment_id,))
        conn.commit()
    
    return {"success": True, "data": {"deleted": assignment_id}, "error": None}
