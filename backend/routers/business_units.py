from fastapi import APIRouter, HTTPException, BackgroundTasks
from datetime import datetime
from typing import List
from models.business_unit import (
    BusinessUnit, BusinessUnitCreate, BusinessUnitUpdate,
    BusinessUnitTeamMember, BusinessUnitTeamUpdate,
    ProductApproval, ProductRejection,
    BUDashboard, BUDashboardSummary
)
from database import get_connection
from services.webhook_service import send_business_unit_webhook, send_business_unit_team_webhook
import logging

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/business-units", tags=["business-units"])


def row_to_business_unit(row, team=None, head_position_title=None) -> dict:
    return {
        "id": row["id"],
        "name": row["name"],
        "description": row["description"],
        "head_position_id": row["head_position_id"],
        "head_position_title": head_position_title,
        "team": team or [],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }


def get_team_members(cursor, business_unit_id: int) -> List[dict]:
    cursor.execute("""
        SELECT but.id, but.position_id, but.created_at, p.title as position_title
        FROM business_unit_team but
        JOIN positions p ON but.position_id = p.id
        WHERE but.business_unit_id = ?
        ORDER BY p.title
    """, (business_unit_id,))
    return [
        {
            "id": row["id"],
            "position_id": row["position_id"],
            "position_title": row["position_title"],
            "created_at": row["created_at"]
        }
        for row in cursor.fetchall()
    ]


def get_head_position_title(cursor, head_position_id: int) -> str:
    if not head_position_id:
        return None
    cursor.execute("SELECT title FROM positions WHERE id = ?", (head_position_id,))
    row = cursor.fetchone()
    return row["title"] if row else None


@router.get("", response_model=dict)
def list_business_units():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT bu.*, p.title as head_position_title
            FROM business_units bu
            LEFT JOIN positions p ON bu.head_position_id = p.id
            ORDER BY bu.name
        """)
        rows = cursor.fetchall()
        business_units = []
        for row in rows:
            team = get_team_members(cursor, row["id"])
            business_units.append(row_to_business_unit(
                row,
                team=team,
                head_position_title=row["head_position_title"]
            ))
    return {"success": True, "data": business_units, "error": None}


@router.get("/stats", response_model=dict)
def get_business_unit_stats():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT
                bu.id,
                bu.name,
                (SELECT COUNT(*) FROM products WHERE requestor_business_unit_id = bu.id) as products_count,
                (SELECT COUNT(*) FROM products WHERE requestor_business_unit_id = bu.id AND status = 'Live') as live_products,
                (SELECT COUNT(*) FROM products WHERE requestor_business_unit_id = bu.id AND status = 'In Development') as dev_products,
                (SELECT COUNT(*) FROM services WHERE business_unit_id = bu.id) as services_count,
                (SELECT COUNT(*) FROM business_unit_team WHERE business_unit_id = bu.id) as team_size
            FROM business_units bu
            ORDER BY products_count DESC, bu.name
        """)
        rows = cursor.fetchall()
        stats = [{
            "id": row["id"],
            "name": row["name"],
            "products_count": row["products_count"],
            "live_products": row["live_products"],
            "dev_products": row["dev_products"],
            "services_count": row["services_count"],
            "team_size": row["team_size"]
        } for row in rows]
    return {"success": True, "data": stats, "error": None}


@router.get("/{bu_id}", response_model=dict)
def get_business_unit(bu_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("""
            SELECT bu.*, p.title as head_position_title
            FROM business_units bu
            LEFT JOIN positions p ON bu.head_position_id = p.id
            WHERE bu.id = ?
        """, (bu_id,))
        row = cursor.fetchone()
        if not row:
            raise HTTPException(status_code=404, detail="Business unit not found")
        team = get_team_members(cursor, bu_id)
    return {"success": True, "data": row_to_business_unit(row, team=team, head_position_title=row["head_position_title"]), "error": None}


@router.post("", response_model=dict, status_code=201)
async def create_business_unit(bu: BusinessUnitCreate, background_tasks: BackgroundTasks):
    now = datetime.now().isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()

        if bu.head_position_id:
            cursor.execute("SELECT id FROM positions WHERE id = ?", (bu.head_position_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=400, detail="Head position not found")

        try:
            cursor.execute(
                """INSERT INTO business_units (name, description, head_position_id, created_at, updated_at)
                   VALUES (?, ?, ?, ?, ?)""",
                (bu.name, bu.description, bu.head_position_id, now, now)
            )
            conn.commit()
            bu_id = cursor.lastrowid
            cursor.execute("""
                SELECT bu.*, p.title as head_position_title
                FROM business_units bu
                LEFT JOIN positions p ON bu.head_position_id = p.id
                WHERE bu.id = ?
            """, (bu_id,))
            row = cursor.fetchone()
        except Exception as e:
            if "UNIQUE constraint" in str(e):
                raise HTTPException(status_code=400, detail="Business unit name already exists")
            raise

    result = row_to_business_unit(row, team=[], head_position_title=row["head_position_title"])
    background_tasks.add_task(
        _send_business_unit_webhook_async,
        bu_id,
        result["name"],
        "business_unit.created",
        result["description"],
        result["head_position_id"]
    )
    return {"success": True, "data": result, "error": None}


@router.put("/{bu_id}", response_model=dict)
async def update_business_unit(bu_id: int, bu: BusinessUnitUpdate, background_tasks: BackgroundTasks):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM business_units WHERE id = ?", (bu_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Business unit not found")

        if bu.head_position_id is not None:
            cursor.execute("SELECT id FROM positions WHERE id = ?", (bu.head_position_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=400, detail="Head position not found")

        updates = {}
        if bu.name is not None:
            updates["name"] = bu.name
        if bu.description is not None:
            updates["description"] = bu.description
        if bu.head_position_id is not None:
            updates["head_position_id"] = bu.head_position_id

        if updates:
            updates["updated_at"] = datetime.now().isoformat()
            set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
            values = list(updates.values()) + [bu_id]
            try:
                cursor.execute(f"UPDATE business_units SET {set_clause} WHERE id = ?", values)
                conn.commit()
            except Exception as e:
                if "UNIQUE constraint" in str(e):
                    raise HTTPException(status_code=400, detail="Business unit name already exists")
                raise

        cursor.execute("""
            SELECT bu.*, p.title as head_position_title
            FROM business_units bu
            LEFT JOIN positions p ON bu.head_position_id = p.id
            WHERE bu.id = ?
        """, (bu_id,))
        row = cursor.fetchone()
        team = get_team_members(cursor, bu_id)

    result = row_to_business_unit(row, team=team, head_position_title=row["head_position_title"])
    background_tasks.add_task(
        _send_business_unit_webhook_async,
        bu_id,
        result["name"],
        "business_unit.updated",
        result["description"],
        result["head_position_id"]
    )
    return {"success": True, "data": result, "error": None}


@router.delete("/{bu_id}", response_model=dict)
def delete_business_unit(bu_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM business_units WHERE id = ?", (bu_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Business unit not found")

        cursor.execute("SELECT COUNT(*) as count FROM products WHERE requestor_business_unit_id = ?", (bu_id,))
        product_count = cursor.fetchone()["count"]

        cursor.execute("SELECT COUNT(*) as count FROM services WHERE business_unit_id = ?", (bu_id,))
        service_count = cursor.fetchone()["count"]

        if product_count > 0 or service_count > 0:
            raise HTTPException(
                status_code=400,
                detail=f"Cannot delete: business unit is linked to {product_count} product(s) and {service_count} service(s)"
            )

        cursor.execute("DELETE FROM business_units WHERE id = ?", (bu_id,))
        conn.commit()
    return {"success": True, "data": {"deleted": bu_id}, "error": None}


@router.get("/{bu_id}/team", response_model=dict)
def get_business_unit_team(bu_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM business_units WHERE id = ?", (bu_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Business unit not found")
        team = get_team_members(cursor, bu_id)
    return {"success": True, "data": team, "error": None}


@router.put("/{bu_id}/team", response_model=dict)
async def update_business_unit_team(bu_id: int, team_update: BusinessUnitTeamUpdate, background_tasks: BackgroundTasks):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT id FROM business_units WHERE id = ?", (bu_id,))
        if not cursor.fetchone():
            raise HTTPException(status_code=404, detail="Business unit not found")

        for pos_id in team_update.position_ids:
            cursor.execute("SELECT id FROM positions WHERE id = ?", (pos_id,))
            if not cursor.fetchone():
                raise HTTPException(status_code=400, detail=f"Position {pos_id} not found")

        cursor.execute("DELETE FROM business_unit_team WHERE business_unit_id = ?", (bu_id,))

        now = datetime.now().isoformat()
        for pos_id in team_update.position_ids:
            cursor.execute(
                """INSERT INTO business_unit_team (business_unit_id, position_id, created_at)
                   VALUES (?, ?, ?)""",
                (bu_id, pos_id, now)
            )
        conn.commit()

        team = get_team_members(cursor, bu_id)
        positions_for_webhook = [
            {"id": m["position_id"], "name": m["position_title"]}
            for m in team
        ]

    background_tasks.add_task(
        _send_business_unit_team_webhook_async,
        bu_id,
        positions_for_webhook
    )
    return {"success": True, "data": team, "error": None}


@router.get("/{bu_id}/dashboard", response_model=dict)
def get_business_unit_dashboard(bu_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()

        cursor.execute("""
            SELECT bu.*, p.title as head_position_title
            FROM business_units bu
            LEFT JOIN positions p ON bu.head_position_id = p.id
            WHERE bu.id = ?
        """, (bu_id,))
        bu_row = cursor.fetchone()
        if not bu_row:
            raise HTTPException(status_code=404, detail="Business unit not found")

        team = get_team_members(cursor, bu_id)
        business_unit = row_to_business_unit(bu_row, team=team, head_position_title=bu_row["head_position_title"])

        cursor.execute("""
            SELECT p.*,
                   COALESCE(
                       (SELECT SUM(t.estimated_hours * pos.hourly_cost_min)
                        FROM tasks t
                        JOIN positions pos ON t.position_id = pos.id
                        WHERE t.product_id = p.id), 0
                   ) as cost_min,
                   COALESCE(
                       (SELECT SUM(t.estimated_hours * pos.hourly_cost_max)
                        FROM tasks t
                        JOIN positions pos ON t.position_id = pos.id
                        WHERE t.product_id = p.id), 0
                   ) as cost_max
            FROM products p
            WHERE p.requestor_business_unit_id = ?
            ORDER BY p.created_at DESC
        """, (bu_id,))
        products = []
        for row in cursor.fetchall():
            products.append({
                "id": row["id"],
                "name": row["name"],
                "description": row["description"],
                "status": row["status"],
                "product_type": row["product_type"],
                "cost_min": row["cost_min"],
                "cost_max": row["cost_max"],
                "bu_approval_status": row["bu_approval_status"],
                "created_at": row["created_at"]
            })

        cursor.execute("""
            SELECT s.*, sd.name as department_name, st.name as service_type_name,
                   COALESCE(
                       (SELECT SUM(stk.estimated_hours * pos.hourly_cost_min)
                        FROM service_tasks stk
                        JOIN positions pos ON stk.position_id = pos.id
                        WHERE stk.service_id = s.id), 0
                   ) as cost_min,
                   COALESCE(
                       (SELECT SUM(stk.estimated_hours * pos.hourly_cost_max)
                        FROM service_tasks stk
                        JOIN positions pos ON stk.position_id = pos.id
                        WHERE stk.service_id = s.id), 0
                   ) as cost_max
            FROM services s
            JOIN service_departments sd ON s.service_department_id = sd.id
            JOIN service_types st ON s.service_type_id = st.id
            WHERE s.business_unit_id = ?
            ORDER BY s.created_at DESC
        """, (bu_id,))
        services = []
        for row in cursor.fetchall():
            base_cost_min = row["cost_min"]
            base_cost_max = row["cost_max"]
            fee_percent = row["fee_percent"] or 0
            services.append({
                "id": row["id"],
                "name": row["name"],
                "description": row["description"],
                "status": row["status"],
                "department_name": row["department_name"],
                "service_type_name": row["service_type_name"],
                "cost_min": base_cost_min * (1 + fee_percent / 100),
                "cost_max": base_cost_max * (1 + fee_percent / 100),
                "fee_percent": fee_percent,
                "created_at": row["created_at"]
            })

        cursor.execute("""
            SELECT p.*,
                   COALESCE(
                       (SELECT SUM(t.estimated_hours * pos.hourly_cost_min)
                        FROM tasks t
                        JOIN positions pos ON t.position_id = pos.id
                        WHERE t.product_id = p.id), 0
                   ) as cost_min,
                   COALESCE(
                       (SELECT SUM(t.estimated_hours * pos.hourly_cost_max)
                        FROM tasks t
                        JOIN positions pos ON t.position_id = pos.id
                        WHERE t.product_id = p.id), 0
                   ) as cost_max
            FROM products p
            WHERE p.requestor_business_unit_id = ?
            AND p.bu_approval_status = 'pending'
            ORDER BY p.created_at DESC
        """, (bu_id,))
        pending_approvals = []
        for row in cursor.fetchall():
            pending_approvals.append({
                "id": row["id"],
                "name": row["name"],
                "description": row["description"],
                "status": row["status"],
                "product_type": row["product_type"],
                "cost_min": row["cost_min"],
                "cost_max": row["cost_max"],
                "created_at": row["created_at"]
            })

        products_in_dev = sum(1 for p in products if p["status"] in ["Development", "In Development"])
        total_cost_min = sum(p["cost_min"] for p in products) + sum(s["cost_min"] for s in services)
        total_cost_max = sum(p["cost_max"] for p in products) + sum(s["cost_max"] for s in services)

        summary = {
            "products_count": len(products),
            "products_in_development": products_in_dev,
            "services_count": len(services),
            "total_cost_min": total_cost_min,
            "total_cost_max": total_cost_max,
            "pending_approvals": len(pending_approvals)
        }

    return {
        "success": True,
        "data": {
            "business_unit": business_unit,
            "summary": summary,
            "products": products,
            "services": services,
            "pending_approvals": pending_approvals
        },
        "error": None
    }


approval_router = APIRouter(tags=["product-approval"])


@approval_router.post("/api/products/{product_id}/approve", response_model=dict)
def approve_product(product_id: int, approval: ProductApproval):
    now = datetime.now().isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        product = cursor.fetchone()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        if product["bu_approval_status"] == "approved":
            raise HTTPException(status_code=400, detail="Product is already approved")

        cursor.execute("""
            UPDATE products
            SET bu_approval_status = 'approved',
                bu_approved_at = ?,
                bu_approved_by = ?,
                updated_at = ?
            WHERE id = ?
        """, (now, approval.approved_by, now, product_id))
        conn.commit()

        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        updated = cursor.fetchone()

    return {
        "success": True,
        "data": {
            "id": updated["id"],
            "name": updated["name"],
            "bu_approval_status": updated["bu_approval_status"],
            "bu_approved_at": updated["bu_approved_at"],
            "bu_approved_by": updated["bu_approved_by"]
        },
        "error": None
    }


@approval_router.post("/api/products/{product_id}/reject", response_model=dict)
def reject_product(product_id: int, rejection: ProductRejection):
    now = datetime.now().isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        product = cursor.fetchone()
        if not product:
            raise HTTPException(status_code=404, detail="Product not found")

        if product["bu_approval_status"] == "rejected":
            raise HTTPException(status_code=400, detail="Product is already rejected")

        cursor.execute("""
            UPDATE products
            SET bu_approval_status = 'rejected',
                bu_approved_at = ?,
                bu_approved_by = ?,
                updated_at = ?
            WHERE id = ?
        """, (now, rejection.rejected_by, now, product_id))
        conn.commit()

        cursor.execute("SELECT * FROM products WHERE id = ?", (product_id,))
        updated = cursor.fetchone()

    return {
        "success": True,
        "data": {
            "id": updated["id"],
            "name": updated["name"],
            "bu_approval_status": updated["bu_approval_status"],
            "bu_approved_at": updated["bu_approved_at"],
            "bu_approved_by": updated["bu_approved_by"],
            "rejection_reason": rejection.reason
        },
        "error": None
    }


async def _send_business_unit_webhook_async(bu_id, name, event, description, head_position_id):
    result = await send_business_unit_webhook(bu_id, name, event, description, head_position_id)
    if not result.get("success"):
        logger.warning(f"Business unit webhook failed for BU {bu_id}: {result}")


async def _send_business_unit_team_webhook_async(bu_id, positions):
    result = await send_business_unit_team_webhook(bu_id, positions)
    if not result.get("success"):
        logger.warning(f"Business unit team webhook failed for BU {bu_id}: {result}")
