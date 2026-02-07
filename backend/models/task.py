from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime, date

TaskStatus = Literal["open", "in_progress", "done"]

class TaskBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    position_id: int
    estimated_hours: float = Field(..., gt=0)

class TaskCreate(TaskBase):
    external_id: Optional[str] = Field(None, max_length=100)
    status: TaskStatus = "open"
    assignee_name: Optional[str] = Field(None, max_length=200)

class TaskUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    position_id: Optional[int] = None
    estimated_hours: Optional[float] = Field(None, gt=0)
    actual_hours: Optional[float] = Field(None, ge=0)
    external_id: Optional[str] = Field(None, max_length=100)
    status: Optional[TaskStatus] = None
    assignee_name: Optional[str] = Field(None, max_length=200)
    due_date: Optional[date] = None

    class Config:
        extra = "ignore"

class Task(TaskBase):
    id: int
    product_id: int
    actual_hours: Optional[float] = None
    external_id: Optional[str] = None
    status: TaskStatus = "open"
    assignee_name: Optional[str] = None
    due_date: Optional[date] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class TaskWithPosition(Task):
    position_title: str
    hourly_cost_min: float
    hourly_cost_max: float
    task_cost_min: float
    task_cost_max: float
