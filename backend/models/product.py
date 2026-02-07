from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import datetime

ProductStatus = Literal["Draft", "Ideation", "Approved", "Backlog", "Kill", "In Development", "Live", "Deprecated"]
ValuationType = Literal["quick", "full"]
ProductType = Literal["Internal", "External"]
RequestorType = Literal["business_unit", "service_department"]

class ProductBase(BaseModel):
    name: str = Field(..., min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    business_unit: Optional[str] = Field(None, max_length=100)
    service_department: Optional[str] = Field(None, max_length=100)
    requestor_type: Optional[RequestorType] = None
    requestor_id: Optional[int] = None
    requestor_business_unit_id: Optional[int] = None
    status: ProductStatus = "Ideation"
    product_type: ProductType = "Internal"
    estimated_value: float = Field(default=0, ge=0)
    fee_percent: float = Field(default=0, ge=0)
    valuation_type: Optional[ValuationType] = None
    valuation_confidence: Optional[str] = "Low"
    quick_estimate_inputs: Optional[str] = None

class ProductCreate(ProductBase):
    pass

class ProductUpdate(BaseModel):
    name: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    business_unit: Optional[str] = Field(None, max_length=100)
    service_department: Optional[str] = Field(None, max_length=100)
    requestor_type: Optional[RequestorType] = None
    requestor_id: Optional[int] = None
    requestor_business_unit_id: Optional[int] = None
    status: Optional[ProductStatus] = None
    product_type: Optional[ProductType] = None
    estimated_value: Optional[float] = Field(None, ge=0)
    fee_percent: Optional[float] = Field(None, ge=0)
    valuation_type: Optional[ValuationType] = None
    valuation_confidence: Optional[str] = None
    quick_estimate_inputs: Optional[str] = None

class Product(ProductBase):
    id: int
    created_at: datetime
    updated_at: datetime
    raw_valuation_output: Optional[str] = None
    raw_valuation_output_updated_at: Optional[datetime] = None
    user_flow: Optional[str] = None
    user_flow_updated_at: Optional[datetime] = None
    specifications: Optional[str] = None
    specifications_updated_at: Optional[datetime] = None
    persona_feedback: Optional[str] = None
    persona_feedback_updated_at: Optional[datetime] = None
    valuation_complete: bool = False

    class Config:
        from_attributes = True

class ProductDocumentUpdate(BaseModel):
    content: str

class ProductDocument(BaseModel):
    content: Optional[str] = None
    updated_at: Optional[datetime] = None
    locked: bool = False
    lock_reason: Optional[str] = None
