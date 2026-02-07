from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

RoleType = Literal["lead", "supporting"]
RACIType = Literal["Responsible", "Accountable", "Consulted", "Informed"]

class ServiceDepartmentBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)

class ServiceDepartmentCreate(ServiceDepartmentBase):
    pass

class ServiceDepartmentUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)

class ServiceDepartment(ServiceDepartmentBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ProductServiceDepartmentBase(BaseModel):
    department_id: int
    role: RoleType = "supporting"
    raci: RACIType = "Responsible"
    allocation_percent: Optional[float] = Field(None, ge=0, le=100)

class ProductServiceDepartmentCreate(ProductServiceDepartmentBase):
    pass

class ProductServiceDepartmentUpdate(BaseModel):
    role: Optional[RoleType] = None
    raci: Optional[RACIType] = None
    allocation_percent: Optional[float] = Field(None, ge=0, le=100)

class ProductServiceDepartment(ProductServiceDepartmentBase):
    id: int
    product_id: int
    department_name: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True
