from fastapi import APIRouter, HTTPException, UploadFile, File
from datetime import datetime
import csv
import io
from models.software import Software, SoftwareCreate, SoftwareUpdate, SoftwareAllocationCreate
from database import get_connection

router = APIRouter(prefix="/api/software", tags=["software"])

def row_to_software(row) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "description": row["description"],
        "monthly_cost": row["monthly_cost"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }

@router.get("", response_model=dict)
def list_software():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM software_costs ORDER BY name")
        rows = cursor.fetchall()
        software = [row_to_software(row) for row in rows]
    return {"success": True, "data": software, "error": None}

@router.get("/{software_id}", response_model=dict)
def get_software(software_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM software_costs WHERE id = ?", (software_id,))
        row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Software not found")
    return {"success": True, "data": row_to_software(row), "error": None}

@router.post("", response_model=dict, status_code=201)
def create_software(software: SoftwareCreate):
    now = datetime.now().isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO software_costs (name, description, monthly_cost, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?)""",
            (software.name, software.description, software.monthly_cost, now, now)
        )
        conn.commit()
        software_id = cursor.lastrowid
        cursor.execute("SELECT * FROM software_costs WHERE id = ?", (software_id,))
        row = cursor.fetchone()
    return {"success": True, "data": row_to_software(row), "error": None}

@router.put("/{software_id}", response_model=dict)
def update_software(software_id: int, software: SoftwareUpdate):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM software_costs WHERE id = ?", (software_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Software not found")
        
        updates = {}
        if software.name is not None:
            updates["name"] = software.name
        if software.description is not None:
            updates["description"] = software.description
        if software.monthly_cost is not None:
            updates["monthly_cost"] = software.monthly_cost
        
        if updates:
            updates["updated_at"] = datetime.now().isoformat()
            set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
            values = list(updates.values()) + [software_id]
            cursor.execute(f"UPDATE software_costs SET {set_clause} WHERE id = ?", values)
            conn.commit()
        
        cursor.execute("SELECT * FROM software_costs WHERE id = ?", (software_id,))
        row = cursor.fetchone()
    return {"success": True, "data": row_to_software(row), "error": None}

@router.delete("/{software_id}", response_model=dict)
def delete_software(software_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM software_costs WHERE id = ?", (software_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Software not found")
        cursor.execute("DELETE FROM software_costs WHERE id = ?", (software_id,))
        conn.commit()
    return {"success": True, "data": {"deleted": software_id}, "error": None}

@router.post("/upload-csv", response_model=dict)
async def upload_software_csv(file: UploadFile = File(...)):
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
    
    required_fields = {'name', 'monthly_cost'}
    fieldnames_normalized = set(normalize(f) for f in reader.fieldnames)
    if not required_fields.issubset(fieldnames_normalized):
        raise HTTPException(
            status_code=400, 
            detail=f"CSV must have columns: Name, Monthly Cost (Description is optional)"
        )
    
    field_map = {normalize(f): f for f in reader.fieldnames}
    
    now = datetime.now().isoformat()
    created = []
    errors = []
    
    with get_connection() as conn:
        cursor = conn.cursor()
        for i, row in enumerate(reader, start=2):
            try:
                name = row[field_map.get('name', '')].strip()
                description = row.get(field_map.get('description', ''), '').strip() if 'description' in field_map else None
                cost_str = row[field_map.get('monthly_cost', '')].strip()
                cost_str = cost_str.replace('$', '').replace(',', '')
                monthly_cost = float(cost_str)
                
                if not name:
                    errors.append(f"Row {i}: Missing name")
                    continue
                
                if monthly_cost < 0:
                    errors.append(f"Row {i}: Monthly cost must be >= 0")
                    continue
                
                cursor.execute(
                    """INSERT INTO software_costs (name, description, monthly_cost, created_at, updated_at)
                       VALUES (?, ?, ?, ?, ?)""",
                    (name, description, monthly_cost, now, now)
                )
                created.append({"name": name, "description": description, "monthly_cost": monthly_cost})
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

@router.get("/product/{product_id}/allocations", response_model=dict)
def list_product_allocations(product_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")
        
        cursor.execute("""
            SELECT a.*, s.name as software_name, s.monthly_cost as software_monthly_cost
            FROM product_software_allocations a
            JOIN software_costs s ON a.software_id = s.id
            WHERE a.product_id = ?
            ORDER BY s.name
        """, (product_id,))
        rows = cursor.fetchall()
        
        allocations = []
        for row in rows:
            allocated_cost = row["software_monthly_cost"] * row["allocation_percent"] / 100
            allocations.append({
                "id": row["id"],
                "product_id": row["product_id"],
                "software_id": row["software_id"],
                "allocation_percent": row["allocation_percent"],
                "software_name": row["software_name"],
                "software_monthly_cost": row["software_monthly_cost"],
                "allocated_cost": allocated_cost,
                "created_at": row["created_at"]
            })
    
    return {"success": True, "data": allocations, "error": None}

@router.post("/product/{product_id}/allocations", response_model=dict, status_code=201)
def add_software_allocation(product_id: int, allocation: SoftwareAllocationCreate):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Product not found")
        
        cursor.execute("SELECT * FROM software_costs WHERE id = ?", (allocation.software_id,))
        software = cursor.fetchone()
        if not software:
            raise HTTPException(status_code=404, detail="Software not found")
        
        cursor.execute(
            "SELECT * FROM product_software_allocations WHERE product_id = ? AND software_id = ?",
            (product_id, allocation.software_id)
        )
        if cursor.fetchone():
            raise HTTPException(status_code=400, detail="Software already allocated to this product")
        
        now = datetime.now().isoformat()
        cursor.execute(
            """INSERT INTO product_software_allocations (product_id, software_id, allocation_percent, created_at)
               VALUES (?, ?, ?, ?)""",
            (product_id, allocation.software_id, allocation.allocation_percent, now)
        )
        conn.commit()
        allocation_id = cursor.lastrowid
        
        cursor.execute("""
            SELECT a.*, s.name as software_name, s.monthly_cost as software_monthly_cost
            FROM product_software_allocations a
            JOIN software_costs s ON a.software_id = s.id
            WHERE a.id = ?
        """, (allocation_id,))
        row = cursor.fetchone()
        
        allocated_cost = row["software_monthly_cost"] * row["allocation_percent"] / 100
        result = {
            "id": row["id"],
            "product_id": row["product_id"],
            "software_id": row["software_id"],
            "allocation_percent": row["allocation_percent"],
            "software_name": row["software_name"],
            "software_monthly_cost": row["software_monthly_cost"],
            "allocated_cost": allocated_cost,
            "created_at": row["created_at"]
        }
    
    return {"success": True, "data": result, "error": None}

@router.put("/allocations/{allocation_id}", response_model=dict)
def update_allocation(allocation_id: int, allocation_percent: float):
    if allocation_percent < 0 or allocation_percent > 100:
        raise HTTPException(status_code=400, detail="Allocation percent must be between 0 and 100")
    
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM product_software_allocations WHERE id = ?", (allocation_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Allocation not found")
        
        cursor.execute(
            "UPDATE product_software_allocations SET allocation_percent = ? WHERE id = ?",
            (allocation_percent, allocation_id)
        )
        conn.commit()
        
        cursor.execute("""
            SELECT a.*, s.name as software_name, s.monthly_cost as software_monthly_cost
            FROM product_software_allocations a
            JOIN software_costs s ON a.software_id = s.id
            WHERE a.id = ?
        """, (allocation_id,))
        row = cursor.fetchone()
        
        allocated_cost = row["software_monthly_cost"] * row["allocation_percent"] / 100
        result = {
            "id": row["id"],
            "product_id": row["product_id"],
            "software_id": row["software_id"],
            "allocation_percent": row["allocation_percent"],
            "software_name": row["software_name"],
            "software_monthly_cost": row["software_monthly_cost"],
            "allocated_cost": allocated_cost,
            "created_at": row["created_at"]
        }
    
    return {"success": True, "data": result, "error": None}

@router.delete("/allocations/{allocation_id}", response_model=dict)
def delete_allocation(allocation_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM product_software_allocations WHERE id = ?", (allocation_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Allocation not found")
        cursor.execute("DELETE FROM product_software_allocations WHERE id = ?", (allocation_id,))
        conn.commit()
    return {"success": True, "data": {"deleted": allocation_id}, "error": None}
