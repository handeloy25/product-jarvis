from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

class SoftwareBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    monthly_cost: float = Field(..., gt=0)

class SoftwareCreate(SoftwareBase):
    pass

class SoftwareUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=500)
    monthly_cost: Optional[float] = Field(None, gt=0)

class Software(SoftwareBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class SoftwareAllocationBase(BaseModel):
    software_id: int
    allocation_percent: float = Field(..., ge=0, le=100)

class SoftwareAllocationCreate(SoftwareAllocationBase):
    pass

class SoftwareAllocation(SoftwareAllocationBase):
    id: int
    product_id: int
    software_name: Optional[str] = None
    software_monthly_cost: Optional[float] = None
    allocated_cost: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True
