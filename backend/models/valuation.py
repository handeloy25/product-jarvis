from pydantic import BaseModel, Field
from typing import Optional, Literal
from datetime import date, datetime

ConfidenceLevel = Literal["High", "Medium", "Low", "Speculative"]
PricingModel = Literal["One-time", "Monthly", "Annual", "Usage-based", "Per-seat"]
AlternativePeriod = Literal["Monthly", "Annually", "One-time"]

class ValuationBase(BaseModel):
    valuation_date: Optional[date] = None
    confidence_level: ConfidenceLevel = "Medium"
    confidence_notes: Optional[str] = None
    
    hours_saved_per_user_per_week: Optional[float] = Field(None, ge=0)
    number_of_affected_users: Optional[int] = Field(None, ge=0)
    average_hourly_cost: Optional[float] = Field(None, ge=0)
    
    current_errors_per_month: Optional[int] = Field(None, ge=0)
    cost_per_error: Optional[float] = Field(None, ge=0)
    expected_error_reduction_percent: Optional[float] = Field(None, ge=0, le=100)
    
    alternative_solution_cost: Optional[float] = Field(None, ge=0)
    alternative_solution_period: Optional[AlternativePeriod] = None
    
    risk_description: Optional[str] = None
    risk_probability_percent: Optional[float] = Field(None, ge=0, le=100)
    risk_cost_if_occurs: Optional[float] = Field(None, ge=0)
    risk_reduction_percent: Optional[float] = Field(None, ge=0, le=100)
    
    expected_adoption_rate_percent: Optional[float] = Field(None, ge=0, le=100)
    training_cost_per_user: Optional[float] = Field(None, ge=0)
    rollout_months: Optional[int] = Field(None, ge=0)
    time_to_full_productivity_weeks: Optional[int] = Field(None, ge=0)
    process_standardization_annual_value: Optional[float] = Field(None, ge=0)
    
    target_customer_segment: Optional[str] = None
    total_potential_customers: Optional[int] = Field(None, ge=0)
    serviceable_percent: Optional[float] = Field(None, ge=0, le=100)
    achievable_market_share_percent: Optional[float] = Field(None, ge=0, le=100)
    
    price_per_unit: Optional[float] = Field(None, ge=0)
    pricing_model: Optional[PricingModel] = None
    average_deal_size: Optional[float] = Field(None, ge=0)
    sales_cycle_months: Optional[int] = Field(None, ge=0)
    conversion_rate_percent: Optional[float] = Field(None, ge=0, le=100)
    
    gross_margin_percent: Optional[float] = Field(None, ge=0, le=100)
    expected_customer_lifetime_months: Optional[int] = Field(None, ge=0)
    customer_acquisition_cost: Optional[float] = Field(None, ge=0)
    monthly_churn_rate_percent: Optional[float] = Field(None, ge=0, le=100)
    
    annual_marketing_spend: Optional[float] = Field(None, ge=0)
    annual_sales_team_cost: Optional[float] = Field(None, ge=0)
    year_1_customers: Optional[int] = Field(None, ge=0)
    year_2_customers: Optional[int] = Field(None, ge=0)
    year_3_customers: Optional[int] = Field(None, ge=0)
    
    competitor_name: Optional[str] = None
    competitor_pricing: Optional[float] = Field(None, ge=0)
    differentiation_summary: Optional[str] = None
    
    internal_value_weight: Optional[float] = Field(50, ge=0, le=100)
    external_value_weight: Optional[float] = Field(50, ge=0, le=100)
    
    reach_score: Optional[int] = Field(None, ge=1, le=5)
    impact_score: Optional[float] = Field(None, ge=0.25, le=3)
    strategic_alignment_score: Optional[int] = Field(None, ge=1, le=5)
    differentiation_score: Optional[int] = Field(None, ge=1, le=5)
    urgency_score: Optional[int] = Field(None, ge=1, le=5)

class ValuationCreate(ValuationBase):
    product_id: int

class ValuationUpdate(ValuationBase):
    pass

class ValuationCalculated(BaseModel):
    annual_time_savings_value: Optional[float] = None
    annual_error_reduction_value: Optional[float] = None
    annual_cost_avoidance_value: Optional[float] = None
    annual_risk_mitigation_value: Optional[float] = None
    adoption_adjusted_annual_value: Optional[float] = None
    total_training_cost: Optional[float] = None
    total_economic_value: Optional[float] = None
    three_year_revenue_projection: Optional[float] = None
    customer_ltv: Optional[float] = None
    ltv_cac_ratio: Optional[float] = None
    customer_payback_months: Optional[float] = None
    net_three_year_revenue: Optional[float] = None
    year_1_revenue: Optional[float] = None
    year_2_revenue: Optional[float] = None
    year_3_revenue: Optional[float] = None
    strategic_multiplier: Optional[float] = None
    final_value_low: Optional[float] = None
    final_value_high: Optional[float] = None
    rice_score: Optional[float] = None

class Valuation(ValuationBase, ValuationCalculated):
    id: int
    product_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class ValuationHistory(BaseModel):
    id: int
    product_id: int
    valuation_date: date
    confidence_level: Optional[str] = None
    total_economic_value: Optional[float] = None
    three_year_revenue_projection: Optional[float] = None
    strategic_multiplier: Optional[float] = None
    final_value_low: Optional[float] = None
    final_value_high: Optional[float] = None
    rice_score: Optional[float] = None
    created_at: datetime

    class Config:
        from_attributes = True
