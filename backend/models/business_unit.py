from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


class BusinessUnitBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    head_position_id: Optional[int] = None


class BusinessUnitCreate(BusinessUnitBase):
    pass


class BusinessUnitUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    head_position_id: Optional[int] = None


class BusinessUnitTeamMember(BaseModel):
    id: int
    position_id: int
    position_title: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True


class BusinessUnit(BusinessUnitBase):
    id: int
    head_position_title: Optional[str] = None
    team: List[BusinessUnitTeamMember] = []
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class BusinessUnitTeamUpdate(BaseModel):
    position_ids: List[int]


ApprovalStatusType = str


class ProductApproval(BaseModel):
    approved_by: str = Field(..., min_length=1)


class ProductRejection(BaseModel):
    rejected_by: str = Field(..., min_length=1)
    reason: Optional[str] = None


class BUDashboardSummary(BaseModel):
    products_count: int
    products_in_development: int
    services_count: int
    total_cost_min: float
    total_cost_max: float
    pending_approvals: int


class BUDashboard(BaseModel):
    business_unit: BusinessUnit
    summary: BUDashboardSummary
    products: List[dict]
    services: List[dict]
    pending_approvals: List[dict]
