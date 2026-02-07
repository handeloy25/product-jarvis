from fastapi import APIRouter, HTTPException, UploadFile, File, BackgroundTasks
from typing import List
from datetime import datetime
import csv
import io
from models.position import Position, PositionCreate, PositionUpdate
from database import get_connection
from services.webhook_service import send_position_webhook
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/positions", tags=["positions"])

def row_to_position(row) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "department": row["department"],
        "hourly_cost_min": row["hourly_cost_min"],
        "hourly_cost_max": row["hourly_cost_max"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }

@router.get("", response_model=dict)
def list_positions():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM positions ORDER BY title")
        rows = cursor.fetchall()
        positions = [row_to_position(row) for row in rows]
    return {"success": True, "data": positions, "error": None}

@router.get("/{position_id}", response_model=dict)
def get_position(position_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM positions WHERE id = ?", (position_id,))
        row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Position not found")
    return {"success": True, "data": row_to_position(row), "error": None}

@router.post("", response_model=dict, status_code=201)
async def create_position(position: PositionCreate, background_tasks: BackgroundTasks):
    now = datetime.now().isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO positions (title, department, hourly_cost_min, hourly_cost_max, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?)""",
            (position.title, position.department, position.hourly_cost_min, position.hourly_cost_max, now, now)
        )
        conn.commit()
        position_id = cursor.lastrowid
        cursor.execute("SELECT * FROM positions WHERE id = ?", (position_id,))
        row = cursor.fetchone()

        cursor.execute("SELECT id FROM service_departments WHERE name = ?", (position.department,))
        dept_row = cursor.fetchone()
        dept_id = dept_row["id"] if dept_row else None

    result = row_to_position(row)
    if dept_id:
        background_tasks.add_task(
            _send_position_webhook_async,
            position_id,
            result["title"],
            dept_id,
            "position.created"
        )
    return {"success": True, "data": result, "error": None}

@router.put("/{position_id}", response_model=dict)
async def update_position(position_id: int, position: PositionUpdate, background_tasks: BackgroundTasks):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM positions WHERE id = ?", (position_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Position not found")

        updates = {}
        if position.title is not None:
            updates["title"] = position.title
        if position.department is not None:
            updates["department"] = position.department
        if position.hourly_cost_min is not None:
            updates["hourly_cost_min"] = position.hourly_cost_min
        if position.hourly_cost_max is not None:
            updates["hourly_cost_max"] = position.hourly_cost_max

        if updates:
            updates["updated_at"] = datetime.now().isoformat()
            set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
            values = list(updates.values()) + [position_id]
            cursor.execute(f"UPDATE positions SET {set_clause} WHERE id = ?", values)
            conn.commit()

        cursor.execute("SELECT * FROM positions WHERE id = ?", (position_id,))
        row = cursor.fetchone()

        cursor.execute("SELECT id FROM service_departments WHERE name = ?", (row["department"],))
        dept_row = cursor.fetchone()
        dept_id = dept_row["id"] if dept_row else None

    result = row_to_position(row)
    if dept_id:
        background_tasks.add_task(
            _send_position_webhook_async,
            position_id,
            result["title"],
            dept_id,
            "position.updated"
        )
    return {"success": True, "data": result, "error": None}


async def _send_position_webhook_async(position_id, name, department_id, event):
    result = await send_position_webhook(position_id, name, department_id, event)
    if not result.get("success"):
        logger.warning(f"Position webhook failed for position {position_id}: {result}")

@router.delete("/{position_id}", response_model=dict)
def delete_position(position_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM positions WHERE id = ?", (position_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Position not found")
        cursor.execute("DELETE FROM positions WHERE id = ?", (position_id,))
        conn.commit()
    return {"success": True, "data": {"deleted": position_id}, "error": None}

@router.post("/upload-csv", response_model=dict)
async def upload_positions_csv(file: UploadFile = File(...)):
    if not file.filename.endswith('.csv'):
        raise HTTPException(status_code=400, detail="File must be a CSV")
    
    content = await file.read()
    try:
        decoded = content.decode('utf-8-sig')
    except UnicodeDecodeError:
        decoded = content.decode('latin-1')
    
    reader = csv.DictReader(io.StringIO(decoded))
    
    def normalize(s):
        return s.lower().strip().replace(' ', '_')
    
    required_fields = {'title', 'department', 'hourly_cost_min', 'hourly_cost_max'}
    fieldnames_normalized = set(normalize(f) for f in reader.fieldnames)
    if not required_fields.issubset(fieldnames_normalized):
        raise HTTPException(
            status_code=400, 
            detail=f"CSV must have columns: Title, Department, Hourly Cost Min, Hourly Cost Max"
        )
    
    field_map = {normalize(f): f for f in reader.fieldnames}
    
    now = datetime.now().isoformat()
    created = []
    errors = []
    
    with get_connection() as conn:
        cursor = conn.cursor()
        for i, row in enumerate(reader, start=2):
            try:
                title = row[field_map.get('title', '')].strip()
                department = row[field_map.get('department', '')].strip()
                min_str = row[field_map.get('hourly_cost_min', '')].strip()
                max_str = row[field_map.get('hourly_cost_max', '')].strip()
                min_str = min_str.replace('$', '').replace(',', '')
                max_str = max_str.replace('$', '').replace(',', '')
                hourly_cost_min = float(min_str)
                hourly_cost_max = float(max_str)
                
                if not title or not department:
                    errors.append(f"Row {i}: Missing required field")
                    continue
                
                if hourly_cost_max < hourly_cost_min:
                    errors.append(f"Row {i}: Max cost must be >= min cost")
                    continue
                
                cursor.execute(
                    """INSERT INTO positions (title, department, hourly_cost_min, hourly_cost_max, created_at, updated_at)
                       VALUES (?, ?, ?, ?, ?, ?)""",
                    (title, department, hourly_cost_min, hourly_cost_max, now, now)
                )
                created.append({"title": title, "department": department, "hourly_cost_min": hourly_cost_min, "hourly_cost_max": hourly_cost_max})
            except (ValueError, KeyError) as e:
                errors.append(f"Row {i}: {str(e)}")
        
        conn.commit()
    
    return {
        "success": True,
        "data": {
            "created_count": len(created),
            "created": created,
            "error_count": len(errors),
            "errors": errors
        },
        "error": None
    }
