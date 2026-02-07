from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime, date

ServiceStatus = Literal["Active", "Paused", "Completed", "Cancelled"]
RecurrenceType = Literal["one_time", "weekly", "monthly", "quarterly", "annually"]
TaskStatus = Literal["open", "in_progress", "done"]

class ServiceTypeBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    is_recurring: bool = False
    department_id: int

class ServiceTypeCreate(ServiceTypeBase):
    pass

class ServiceTypeUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    is_recurring: Optional[bool] = None
    department_id: Optional[int] = None

class ServiceType(ServiceTypeBase):
    id: int
    department_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ServiceBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    service_department_id: int
    business_unit: str = Field(..., min_length=1, max_length=100)
    business_unit_id: Optional[int] = None
    service_type_id: int
    status: ServiceStatus = "Active"
    fee_percent: float = Field(default=0, ge=0)

class ServiceCreate(ServiceBase):
    pass

class ServiceUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    service_department_id: Optional[int] = None
    business_unit: Optional[str] = Field(None, max_length=100)
    business_unit_id: Optional[int] = None
    service_type_id: Optional[int] = None
    status: Optional[ServiceStatus] = None
    fee_percent: Optional[float] = Field(None, ge=0)

class Service(ServiceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ServiceTaskBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    position_id: int
    estimated_hours: float = Field(..., gt=0)
    is_recurring: bool = False
    recurrence_type: Optional[RecurrenceType] = None

class ServiceTaskCreate(ServiceTaskBase):
    external_id: Optional[str] = None
    status: Optional[TaskStatus] = "open"
    assignee_name: Optional[str] = None

class ServiceTaskUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    position_id: Optional[int] = None
    estimated_hours: Optional[float] = Field(None, gt=0)
    actual_hours: Optional[float] = Field(None, ge=0)
    is_recurring: Optional[bool] = None
    recurrence_type: Optional[RecurrenceType] = None
    external_id: Optional[str] = None
    status: Optional[TaskStatus] = None
    assignee_name: Optional[str] = None
    due_date: Optional[date] = None

    class Config:
        extra = "ignore"

class ServiceTask(ServiceTaskBase):
    id: int
    service_id: int
    actual_hours: Optional[float] = None
    external_id: Optional[str] = None
    status: Optional[TaskStatus] = "open"
    assignee_name: Optional[str] = None
    due_date: Optional[date] = None
    created_at: datetime

    class Config:
        from_attributes = True

class ServiceTaskWithPosition(ServiceTask):
    position_title: str
    hourly_cost_min: float
    hourly_cost_max: float
    task_cost_min: float
    task_cost_max: float
    actual_cost_min: float
    actual_cost_max: float

class ServiceSoftwareAllocationBase(BaseModel):
    software_id: int
    allocation_percent: float = Field(default=100, ge=0, le=100)

class ServiceSoftwareAllocationCreate(ServiceSoftwareAllocationBase):
    pass

class ServiceSoftwareAllocation(ServiceSoftwareAllocationBase):
    id: int
    service_id: int
    created_at: datetime

    class Config:
        from_attributes = True
