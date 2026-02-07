from pydantic import BaseModel, Field, model_validator
from typing import Optional
from datetime import datetime

class PositionBase(BaseModel):
    title: str = Field(..., min_length=1, max_length=100)
    department: str = Field(..., min_length=1, max_length=100)
    hourly_cost_min: float = Field(..., gt=0)
    hourly_cost_max: float = Field(..., gt=0)

    @model_validator(mode='after')
    def validate_cost_range(self):
        if self.hourly_cost_max < self.hourly_cost_min:
            raise ValueError('hourly_cost_max must be >= hourly_cost_min')
        return self

class PositionCreate(PositionBase):
    pass

class PositionUpdate(BaseModel):
    title: Optional[str] = Field(None, min_length=1, max_length=100)
    department: Optional[str] = Field(None, min_length=1, max_length=100)
    hourly_cost_min: Optional[float] = Field(None, gt=0)
    hourly_cost_max: Optional[float] = Field(None, gt=0)

class Position(PositionBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True
