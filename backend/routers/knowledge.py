from fastapi import APIRouter, HTTPException
from pydantic import BaseModel
from typing import Optional, List
from datetime import datetime
from database import get_connection

router = APIRouter(prefix="/api/knowledge", tags=["knowledge"])

class KnowledgeCreate(BaseModel):
    title: str
    content: str
    category: Optional[str] = "General"

class KnowledgeUpdate(BaseModel):
    title: Optional[str] = None
    content: Optional[str] = None
    category: Optional[str] = None

def row_to_knowledge(row) -> dict:
    return {
        "id": row["id"],
        "title": row["title"],
        "content": row["content"],
        "category": row["category"],
        "created_at": row["created_at"],
        "updated_at": row["updated_at"]
    }

@router.get("", response_model=dict)
def list_knowledge():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM knowledge_base ORDER BY updated_at DESC")
        rows = cursor.fetchall()
        items = [row_to_knowledge(row) for row in rows]
    return {"success": True, "data": items, "error": None}

@router.get("/categories", response_model=dict)
def list_categories():
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT DISTINCT category FROM knowledge_base ORDER BY category")
        rows = cursor.fetchall()
        categories = [row["category"] for row in rows]
    return {"success": True, "data": categories, "error": None}

@router.get("/{knowledge_id}", response_model=dict)
def get_knowledge(knowledge_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM knowledge_base WHERE id = ?", (knowledge_id,))
        row = cursor.fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Knowledge entry not found")
    return {"success": True, "data": row_to_knowledge(row), "error": None}

@router.post("", response_model=dict, status_code=201)
def create_knowledge(entry: KnowledgeCreate):
    now = datetime.now().isoformat()
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute(
            """INSERT INTO knowledge_base (title, content, category, created_at, updated_at)
               VALUES (?, ?, ?, ?, ?)""",
            (entry.title, entry.content, entry.category, now, now)
        )
        conn.commit()
        entry_id = cursor.lastrowid
        cursor.execute("SELECT * FROM knowledge_base WHERE id = ?", (entry_id,))
        row = cursor.fetchone()
    return {"success": True, "data": row_to_knowledge(row), "error": None}

@router.put("/{knowledge_id}", response_model=dict)
def update_knowledge(knowledge_id: int, entry: KnowledgeUpdate):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM knowledge_base WHERE id = ?", (knowledge_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Knowledge entry not found")
        
        updates = {}
        if entry.title is not None:
            updates["title"] = entry.title
        if entry.content is not None:
            updates["content"] = entry.content
        if entry.category is not None:
            updates["category"] = entry.category
        
        if updates:
            updates["updated_at"] = datetime.now().isoformat()
            set_clause = ", ".join(f"{k} = ?" for k in updates.keys())
            values = list(updates.values()) + [knowledge_id]
            cursor.execute(f"UPDATE knowledge_base SET {set_clause} WHERE id = ?", values)
            conn.commit()
        
        cursor.execute("SELECT * FROM knowledge_base WHERE id = ?", (knowledge_id,))
        row = cursor.fetchone()
    return {"success": True, "data": row_to_knowledge(row), "error": None}

@router.delete("/{knowledge_id}", response_model=dict)
def delete_knowledge(knowledge_id: int):
    with get_connection() as conn:
        cursor = conn.cursor()
        cursor.execute("SELECT * FROM knowledge_base WHERE id = ?", (knowledge_id,))
        existing = cursor.fetchone()
        if not existing:
            raise HTTPException(status_code=404, detail="Knowledge entry not found")
        cursor.execute("DELETE FROM knowledge_base WHERE id = ?", (knowledge_id,))
        conn.commit()
    return {"success": True, "data": {"deleted": knowledge_id}, "error": None}
