from typing import Optional

CONFIDENCE_RANGES = {
    "High": (0.9, 1.1),
    "Medium": (0.6, 1.0),
    "Low": (0.3, 0.7),
    "Speculative": (0.1, 0.4),
}

def calculate_time_savings(
    hours_saved_per_user_per_week: Optional[float],
    number_of_affected_users: Optional[int],
    average_hourly_cost: Optional[float]
) -> Optional[float]:
    if all(v is not None for v in [hours_saved_per_user_per_week, number_of_affected_users, average_hourly_cost]):
        return hours_saved_per_user_per_week * number_of_affected_users * average_hourly_cost * 52
    return None

def calculate_error_reduction(
    current_errors_per_month: Optional[int],
    cost_per_error: Optional[float],
    expected_error_reduction_percent: Optional[float]
) -> Optional[float]:
    if all(v is not None for v in [current_errors_per_month, cost_per_error, expected_error_reduction_percent]):
        return current_errors_per_month * 12 * cost_per_error * (expected_error_reduction_percent / 100)
    return None

def calculate_cost_avoidance(
    alternative_solution_cost: Optional[float],
    alternative_solution_period: Optional[str]
) -> Optional[float]:
    if alternative_solution_cost is not None and alternative_solution_period is not None:
        if alternative_solution_period == "Monthly":
            return alternative_solution_cost * 12
        elif alternative_solution_period == "Annually":
            return alternative_solution_cost
        elif alternative_solution_period == "One-time":
            return alternative_solution_cost / 3
    return None

def calculate_risk_mitigation(
    risk_probability_percent: Optional[float],
    risk_cost_if_occurs: Optional[float],
    risk_reduction_percent: Optional[float]
) -> Optional[float]:
    if all(v is not None for v in [risk_probability_percent, risk_cost_if_occurs, risk_reduction_percent]):
        return (risk_probability_percent / 100) * risk_cost_if_occurs * (risk_reduction_percent / 100)
    return None

def calculate_adoption_adjusted_value(
    raw_annual_value: Optional[float],
    adoption_rate_percent: Optional[float],
    time_to_full_productivity_weeks: Optional[int]
) -> Optional[float]:
    if raw_annual_value is None:
        return None
    adoption_rate = (adoption_rate_percent or 100) / 100
    if time_to_full_productivity_weeks and time_to_full_productivity_weeks > 0:
        ramp_factor = 1 - (time_to_full_productivity_weeks / 52 / 2)
        ramp_factor = max(0.5, min(1.0, ramp_factor))
    else:
        ramp_factor = 1.0
    return raw_annual_value * adoption_rate * ramp_factor

def calculate_total_training_cost(
    training_cost_per_user: Optional[float],
    number_of_affected_users: Optional[int],
    adoption_rate_percent: Optional[float]
) -> Optional[float]:
    if training_cost_per_user is not None and number_of_affected_users is not None:
        adoption_rate = (adoption_rate_percent or 100) / 100
        return training_cost_per_user * number_of_affected_users * adoption_rate
    return None

def calculate_three_year_revenue(
    total_potential_customers: Optional[int],
    serviceable_percent: Optional[float],
    achievable_market_share_percent: Optional[float],
    average_deal_size: Optional[float]
) -> Optional[float]:
    if all(v is not None for v in [total_potential_customers, serviceable_percent, achievable_market_share_percent, average_deal_size]):
        sam = total_potential_customers * (serviceable_percent / 100)
        som = sam * (achievable_market_share_percent / 100)
        return som * average_deal_size * 3
    return None

def calculate_yearly_revenue(
    year_customers: Optional[int],
    average_deal_size: Optional[float]
) -> Optional[float]:
    if year_customers is not None and average_deal_size is not None:
        return year_customers * average_deal_size
    return None

def calculate_customer_ltv(
    average_deal_size: Optional[float],
    gross_margin_percent: Optional[float],
    expected_customer_lifetime_months: Optional[int],
    monthly_churn_rate_percent: Optional[float] = None
) -> Optional[float]:
    lifetime_months = expected_customer_lifetime_months
    if monthly_churn_rate_percent is not None and monthly_churn_rate_percent > 0:
        lifetime_months = int(1 / (monthly_churn_rate_percent / 100))
    if all(v is not None for v in [average_deal_size, gross_margin_percent]) and lifetime_months:
        return average_deal_size * (gross_margin_percent / 100) * (lifetime_months / 12)
    return None

def calculate_ltv_cac_ratio(
    customer_ltv: Optional[float],
    customer_acquisition_cost: Optional[float]
) -> Optional[float]:
    if customer_ltv is not None and customer_acquisition_cost is not None and customer_acquisition_cost > 0:
        return customer_ltv / customer_acquisition_cost
    return None

def calculate_customer_payback_months(
    customer_acquisition_cost: Optional[float],
    average_deal_size: Optional[float],
    gross_margin_percent: Optional[float]
) -> Optional[float]:
    if all(v is not None for v in [customer_acquisition_cost, average_deal_size, gross_margin_percent]):
        monthly_revenue = average_deal_size * (gross_margin_percent / 100) / 12
        if monthly_revenue > 0:
            return customer_acquisition_cost / monthly_revenue
    return None

def calculate_net_three_year_revenue(
    gross_three_year_revenue: Optional[float],
    year_1_customers: Optional[int],
    year_2_customers: Optional[int],
    year_3_customers: Optional[int],
    customer_acquisition_cost: Optional[float],
    annual_marketing_spend: Optional[float],
    annual_sales_team_cost: Optional[float]
) -> Optional[float]:
    if gross_three_year_revenue is None:
        return None
    total_customers = (year_1_customers or 0) + (year_2_customers or 0) + (year_3_customers or 0)
    total_cac = total_customers * (customer_acquisition_cost or 0)
    total_gtm = 3 * ((annual_marketing_spend or 0) + (annual_sales_team_cost or 0))
    return gross_three_year_revenue - total_cac - total_gtm

def calculate_strategic_multiplier(
    reach_score: Optional[int],
    impact_score: Optional[float],
    strategic_alignment_score: Optional[int],
    differentiation_score: Optional[int],
    urgency_score: Optional[int]
) -> Optional[float]:
    scores = [reach_score, impact_score, strategic_alignment_score, differentiation_score, urgency_score]
    if all(s is not None for s in scores):
        normalized = [
            (reach_score - 1) / 4,
            (impact_score - 0.25) / 2.75,
            (strategic_alignment_score - 1) / 4,
            (differentiation_score - 1) / 4,
            (urgency_score - 1) / 4,
        ]
        avg = sum(normalized) / len(normalized)
        return 0.5 + (avg * 1.5)
    return None

def calculate_rice_score(
    reach_score: Optional[int],
    impact_score: Optional[float],
    confidence_level: str,
    effort_hours: Optional[float]
) -> Optional[float]:
    if reach_score is None or impact_score is None:
        return None
    
    confidence_map = {"High": 1.0, "Medium": 0.8, "Low": 0.5, "Speculative": 0.2}
    confidence = confidence_map.get(confidence_level, 0.5)
    
    effort = effort_hours if effort_hours and effort_hours > 0 else 1
    
    return (reach_score * impact_score * confidence) / (effort / 40)

def calculate_all(data: dict, product_type: str, effort_hours: Optional[float] = None) -> dict:
    results = {}
    
    results["annual_time_savings_value"] = calculate_time_savings(
        data.get("hours_saved_per_user_per_week"),
        data.get("number_of_affected_users"),
        data.get("average_hourly_cost")
    )
    
    results["annual_error_reduction_value"] = calculate_error_reduction(
        data.get("current_errors_per_month"),
        data.get("cost_per_error"),
        data.get("expected_error_reduction_percent")
    )
    
    results["annual_cost_avoidance_value"] = calculate_cost_avoidance(
        data.get("alternative_solution_cost"),
        data.get("alternative_solution_period")
    )
    
    results["annual_risk_mitigation_value"] = calculate_risk_mitigation(
        data.get("risk_probability_percent"),
        data.get("risk_cost_if_occurs"),
        data.get("risk_reduction_percent")
    )
    
    internal_values = [
        results["annual_time_savings_value"],
        results["annual_error_reduction_value"],
        results["annual_cost_avoidance_value"],
        results["annual_risk_mitigation_value"],
    ]
    raw_internal_total = sum(v for v in internal_values if v is not None)
    
    process_std_value = data.get("process_standardization_annual_value") or 0
    raw_internal_total += process_std_value
    
    results["adoption_adjusted_annual_value"] = calculate_adoption_adjusted_value(
        raw_internal_total if raw_internal_total > 0 else None,
        data.get("expected_adoption_rate_percent"),
        data.get("time_to_full_productivity_weeks")
    )
    
    results["total_training_cost"] = calculate_total_training_cost(
        data.get("training_cost_per_user"),
        data.get("number_of_affected_users"),
        data.get("expected_adoption_rate_percent")
    )
    
    internal_total = results["adoption_adjusted_annual_value"] or raw_internal_total
    if results["total_training_cost"]:
        internal_total = internal_total - results["total_training_cost"]
    
    results["three_year_revenue_projection"] = calculate_three_year_revenue(
        data.get("total_potential_customers"),
        data.get("serviceable_percent"),
        data.get("achievable_market_share_percent"),
        data.get("average_deal_size")
    )
    
    results["year_1_revenue"] = calculate_yearly_revenue(
        data.get("year_1_customers"),
        data.get("average_deal_size")
    )
    results["year_2_revenue"] = calculate_yearly_revenue(
        data.get("year_2_customers"),
        data.get("average_deal_size")
    )
    results["year_3_revenue"] = calculate_yearly_revenue(
        data.get("year_3_customers"),
        data.get("average_deal_size")
    )
    
    if results["year_1_revenue"] and results["year_2_revenue"] and results["year_3_revenue"]:
        results["three_year_revenue_projection"] = (
            results["year_1_revenue"] + results["year_2_revenue"] + results["year_3_revenue"]
        )
    
    results["customer_ltv"] = calculate_customer_ltv(
        data.get("average_deal_size"),
        data.get("gross_margin_percent"),
        data.get("expected_customer_lifetime_months"),
        data.get("monthly_churn_rate_percent")
    )
    
    results["ltv_cac_ratio"] = calculate_ltv_cac_ratio(
        results["customer_ltv"],
        data.get("customer_acquisition_cost")
    )
    
    results["customer_payback_months"] = calculate_customer_payback_months(
        data.get("customer_acquisition_cost"),
        data.get("average_deal_size"),
        data.get("gross_margin_percent")
    )
    
    results["net_three_year_revenue"] = calculate_net_three_year_revenue(
        results["three_year_revenue_projection"],
        data.get("year_1_customers"),
        data.get("year_2_customers"),
        data.get("year_3_customers"),
        data.get("customer_acquisition_cost"),
        data.get("annual_marketing_spend"),
        data.get("annual_sales_team_cost")
    )
    
    if product_type == "Internal":
        results["total_economic_value"] = internal_total if internal_total > 0 else None
    elif product_type == "External":
        results["total_economic_value"] = results["net_three_year_revenue"] or results["three_year_revenue_projection"]
    else:
        internal_weight = (data.get("internal_value_weight") or 50) / 100
        external_weight = (data.get("external_value_weight") or 50) / 100
        
        internal_val = internal_total if internal_total > 0 else 0
        external_val = results["net_three_year_revenue"] or results["three_year_revenue_projection"] or 0
        
        if internal_val > 0 or external_val > 0:
            results["total_economic_value"] = (internal_val * internal_weight) + (external_val * external_weight)
        else:
            results["total_economic_value"] = None
    
    results["strategic_multiplier"] = calculate_strategic_multiplier(
        data.get("reach_score"),
        data.get("impact_score"),
        data.get("strategic_alignment_score"),
        data.get("differentiation_score"),
        data.get("urgency_score")
    )
    
    confidence_level = data.get("confidence_level", "Medium")
    low_mult, high_mult = CONFIDENCE_RANGES.get(confidence_level, (0.6, 1.0))
    
    base_value = results["total_economic_value"]
    strat_mult = results["strategic_multiplier"] or 1.0
    
    if base_value is not None:
        results["final_value_low"] = base_value * strat_mult * low_mult
        results["final_value_high"] = base_value * strat_mult * high_mult
    else:
        results["final_value_low"] = None
        results["final_value_high"] = None
    
    results["rice_score"] = calculate_rice_score(
        data.get("reach_score"),
        data.get("impact_score"),
        confidence_level,
        effort_hours
    )
    
    return results
