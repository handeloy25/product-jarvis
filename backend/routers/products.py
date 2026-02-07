from fastapi import APIRouter, HTTPException, BackgroundTasks
from datetime import datetime
from models.product import Product, ProductCreate, ProductUpdate, ProductDocumentUpdate, ProductDocument
from database import get_connection
from services.webhook_service import send_product_webhook
import asyncio
import logging

logger = logging.getLogger(__name__)

VALID_DOC_TYPES = ['raw-valuation-output', 'user-flow', 'specifications', 'persona-feedback']
DOC_TYPE_MAP = {
    'raw-valuation-output': ('raw_valuation_output', 'raw_valuation_output_updated_at'),
    'user-flow': ('user_flow', 'user_flow_updated_at'),
    'specifications': ('specifications', 'specifications_updated_at'),
    'persona-feedback': ('persona_feedback', 'persona_feedback_updated_at'),
}

router = APIRouter(prefix="/api/products", tags=["products"])

def row_to_product(row) -> dict:
    keys = row.keys()
    requestor_type = row["requestor_type"] if "requestor_type" in keys else None
    requestor_id = row["requestor_id"] if "requestor_id" in keys else None
    return {
        "id": row["id"],
        "name": row["name"],
        "description": row["description"],
        "business_unit": row["business_unit"],
        "service_department": row["service_department"],
        "requestor_type": requestor_type,
        "requestor_id": requestor_id,
        "requestor_business_unit_id": row["requestor_business_unit_id"] if "requestor_business_unit_id" in keys else None,
        "bu_approval_status": row["bu_approval_status"] if "bu_approval_status" in keys else None,
        "bu_approved_at": row["bu_approved_at"] if "bu_approved_at" in keys else None,
        "bu_approved_by": row["bu_approved_by"] if "bu_approved_by" in keys else None,
        "status": row["status"],
        "product_type": row["product_type"],
        "estimated_value": row["estimated_value"],
        "fee_percent": row["fee_percent"] if "fee_percent" in keys else 0,
        "created_at": row["created_at"],
        "updated_at": row["updated_at"],
        "raw_valuation_output": row["raw_valuation_output"] if "raw_valuation_output" in keys else None,
        "raw_valuation_output_updated_at": row["raw_valuation_output_updated_at"] if "raw_valuation_output_updated_at" in keys else None,
        "user_flow": row["user_flow"] if "user_flow" in keys else None,
        "user_flow_updated_at": row["user_flow_updated_at"] if "user_flow_updated_at" in keys else None,
        "specifications": row["specifications"] if "specifications" in keys else None,
        "specifications_updated_at": row["specifications_updated_at"] if "specifications_updated_at" in keys else None,
        "persona_feedback": row["persona_feedback"] if "persona_feedback" in keys else None,
        "persona_feedback_updated_at": row["persona_feedback_updated_at"] if "persona_feedback_updated_at" in keys else None,
        "valuation_complete": bool(row["valuation_complete"]) if "valuation_complete" in keys and row["valuation_complete"] else False,
        "valuation_type": row["valuation_type"] if "valuation_type" in keys else None,
        "valuation_confidence": row["valuation_confidence"] if "valuation_confidence" in keys else "Low",
        "quick_estimate_inputs": row["quick_estimate_inputs"] if "quick_estimate_inputs" in keys else None,
    }

@router.get("", response_model=dict)
def list_products():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.*, sd.name as requestor_department_name
            FROM products p
            LEFT JOIN service_departments sd ON p.requestor_type = 'service_department' AND p.requestor_id = sd.id
            ORDER BY p.created_at DESC
        """)
        rows = cursor.fetchall()
        products = []
        for row in rows:
            product = row_to_product(row)
            product["requestor_name"] = row["requestor_department_name"] if row["requestor_type"] == "service_department" else row["business_unit"]
            products.append(product)
    return {"success": True, "data": products, "error": None}

@router.get("/{product_id}", response_model=dict)
def get_product(product_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT p.*, sd.name as requestor_department_name
            FROM products p
            LEFT JOIN service_departments sd ON p.requestor_type = 'service_department' AND p.requestor_id = sd.id
            WHERE p.id = ?
        """, (product_id,))
        row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Product not found")
    product = row_to_product(row)
    product["requestor_name"] = row["requestor_department_name"] if row["requestor_type"] == "service_department" else row["business_unit"]
    return {"success": True, "data": product, "error": None}

@router.post("", response_model=dict, status_code=201)
def create_product(product: ProductCreate):
    now = datetime.now().isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO products (name, description, business_unit, service_department, requestor_type, requestor_id, requestor_business_unit_id, status, product_type, estimated_value, fee_percent, valuation_type, valuation_confidence, quick_estimate_inputs, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)""",
            (product.name, product.description, product.business_unit, product.service_department,
             product.requestor_type, product.requestor_id, product.requestor_business_unit_id,
             product.status, product.product_type, product.estimated_value, product.fee_percent,
             product.valuation_type, product.valuation_confidence, product.quick_estimate_inputs, now, now)
        )
        conn.commit()
        product_id = cursor.lastrowid
        cursor.execute("""
            SELECT p.*, sd.name as requestor_department_name
            FROM products p
            LEFT JOIN service_departments sd ON p.requestor_type = 'service_department' AND p.requestor_id = sd.id
            WHERE p.id = ?
        """, (product_id,))
        row = cursor.fetchone()
    result = row_to_product(row)
    result["requestor_name"] = row["requestor_department_name"] if row["requestor_type"] == "service_department" else row["business_unit"]
    return {"success": True, "data": result, "error": None}

@router.put("/{product_id}", response_model=dict)
async def update_product(product_id: int, product: ProductUpdate, background_tasks: BackgroundTasks):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Product not found")

        old_status = existing["status"]

        updates = {}
        if product.name is not None:
            updates["name"] = product.name
        if product.description is not None:
            updates["description"] = product.description
        if product.business_unit is not None:
            updates["business_unit"] = product.business_unit
        if product.service_department is not None:
            updates["service_department"] = product.service_department
        if product.requestor_type is not None:
            updates["requestor_type"] = product.requestor_type
        if product.requestor_id is not None:
            updates["requestor_id"] = product.requestor_id
        if product.requestor_business_unit_id is not None:
            updates["requestor_business_unit_id"] = product.requestor_business_unit_id
        if product.status is not None:
            updates["status"] = product.status
        if product.product_type is not None:
            updates["product_type"] = product.product_type
        if product.estimated_value is not None:
            updates["estimated_value"] = product.estimated_value
        if product.fee_percent is not None:
            updates["fee_percent"] = product.fee_percent
        if product.valuation_type is not None:
            updates["valuation_type"] = product.valuation_type
        if product.valuation_confidence is not None:
            updates["valuation_confidence"] = product.valuation_confidence
        if product.quick_estimate_inputs is not None:
            updates["quick_estimate_inputs"] = product.quick_estimate_inputs

        if updates:
            updates["updated_at"] = datetime.now().isoformat()
            set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
            values = list(updates.values()) + [product_id]
            cursor.execute(f"UPDATE products SET {set_clause} WHERE id = ?", values)
            conn.commit()

        cursor.execute("""
            SELECT p.*, sd.name as requestor_department_name
            FROM products p
            LEFT JOIN service_departments sd ON p.requestor_type = 'service_department' AND p.requestor_id = sd.id
            WHERE p.id = ?
        """, (product_id,))
        row = cursor.fetchone()

    result = row_to_product(row)
    result["requestor_name"] = row["requestor_department_name"] if row["requestor_type"] == "service_department" else row["business_unit"]

    new_status = result["status"]
    if old_status != "Approved" and new_status == "Approved":
        logger.info(f"Product {product_id} moved to 'Approved', triggering TF webhook")
        background_tasks.add_task(
            _send_webhook_async,
            product_id,
            result["name"],
            result["description"],
            result["product_type"],
            result["service_department"]
        )

    return {"success": True, "data": result, "error": None}

async def _send_webhook_async(product_id, name, description, product_type, service_department):
    result = await send_product_webhook(product_id, name, description, product_type, service_department)
    if not result.get("success"):
        logger.warning(f"Webhook failed for product {product_id}: {result}")

@router.delete("/{product_id}", response_model=dict)
def delete_product(product_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Product not found")
        cursor.execute("DELETE FROM products WHERE id = ?", (product_id,))
        conn.commit()
    return {"success": True, "data": {"deleted": product_id}, "error": None}

@router.get("/{product_id}/documents/{doc_type}", response_model=dict)
def get_document(product_id: int, doc_type: str):
    if doc_type not in VALID_DOC_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid doc_type. Must be one of: {VALID_DOC_TYPES}")
    
    content_col, updated_col = DOC_TYPE_MAP[doc_type]
    
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Product not found")
        
        keys = row.keys()
        valuation_complete = bool(row["valuation_complete"]) if "valuation_complete" in keys and row["valuation_complete"] else False
        content = row[content_col] if content_col in keys else None
        updated_at = row[updated_col] if updated_col in keys else None
        
        locked = False
        lock_reason = None
        if doc_type != 'raw-valuation-output' and not valuation_complete:
            locked = True
            lock_reason = "Complete Raw Valuation Output first"
    
    return {
        "success": True,
        "data": {
            "content": content,
            "updated_at": updated_at,
            "locked": locked,
            "lock_reason": lock_reason
        },
        "error": None
    }

@router.put("/{product_id}/documents/{doc_type}", response_model=dict)
def update_document(product_id: int, doc_type: str, data: ProductDocumentUpdate):
    if doc_type not in VALID_DOC_TYPES:
        raise HTTPException(status_code=400, detail=f"Invalid doc_type. Must be one of: {VALID_DOC_TYPES}")
    
    content_col, updated_col = DOC_TYPE_MAP[doc_type]
    
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Product not found")
        
        keys = row.keys()
        valuation_complete = bool(row["valuation_complete"]) if "valuation_complete" in keys and row["valuation_complete"] else False
        
        if doc_type != 'raw-valuation-output' and not valuation_complete:
            raise HTTPException(status_code=403, detail="Complete Raw Valuation Output first")
        
        now = datetime.now().isoformat()
        
        if doc_type == 'raw-valuation-output' and data.content and data.content.strip():
            cursor.execute(
                f"UPDATE products SET {content_col} = ?, {updated_col} = ?, valuation_complete = 1, updated_at = ? WHERE id = ?",
                (data.content, now, now, product_id)
            )
        else:
            cursor.execute(
                f"UPDATE products SET {content_col} = ?, {updated_col} = ?, updated_at = ? WHERE id = ?",
                (data.content, now, now, product_id)
            )
        conn.commit()
        
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        row = cursor.fetchone()
        keys = row.keys()
        content = row[content_col] if content_col in keys else None
        updated_at = row[updated_col] if updated_col in keys else None
    
    return {
        "success": True,
        "data": {
            "content": content,
            "updated_at": updated_at,
            "locked": False,
            "lock_reason": None
        },
        "error": None
    }
