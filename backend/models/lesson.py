from pydantic import BaseModel
from typing import Literal, Optional

class LessonCard(BaseModel):
    id: str
    framework: str
    title: str
    category: Literal["fundamentals", "prioritization", "decision", "advanced"]
    summary: str
    content: str
    key_takeaway: str
    example: Optional[str] = None

class UserProgress(BaseModel):
    lesson_id: str
    completed: bool
    completed_at: Optional[str] = None
