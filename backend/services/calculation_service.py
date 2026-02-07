from typing import Optional

HOURS_STATUS_THRESHOLDS = {
    'under_threshold': 0.9,
    'over_threshold': 1.1
}

def calculate_hours_status(actual_hours: float, estimated_hours: float) -> str:
    if actual_hours == 0:
        return "not_started"
    if estimated_hours <= 0:
        return "not_started"
    ratio = actual_hours / estimated_hours
    if ratio < HOURS_STATUS_THRESHOLDS['under_threshold']:
        return "under"
    elif ratio <= HOURS_STATUS_THRESHOLDS['over_threshold']:
        return "on_track"
    else:
        return "over"

def calculate_hours_progress(actual_hours: float, estimated_hours: float) -> float:
    if estimated_hours <= 0:
        return 0.0
    return round((actual_hours / estimated_hours) * 100, 1)

def calculate_task_costs(
    estimated_hours: float,
    actual_hours: float,
    hourly_cost_min: float,
    hourly_cost_max: float
) -> dict:
    actual = actual_hours or 0
    return {
        "task_cost_min": estimated_hours * hourly_cost_min,
        "task_cost_max": estimated_hours * hourly_cost_max,
        "actual_cost_min": actual * hourly_cost_min,
        "actual_cost_max": actual * hourly_cost_max
    }

def calculate_overhead_and_fees(
    labor_cost_min: float,
    labor_cost_max: float,
    software_cost: float,
    fee_percent: float
) -> dict:
    overhead_min = labor_cost_min + software_cost
    overhead_max = labor_cost_max + software_cost
    
    fee_amount_min = overhead_min * fee_percent / 100
    fee_amount_max = overhead_max * fee_percent / 100
    
    total_min = overhead_min + fee_amount_min
    total_max = overhead_max + fee_amount_max
    
    return {
        "overhead_min": overhead_min,
        "overhead_max": overhead_max,
        "fee_percent": fee_percent,
        "fee_amount_min": fee_amount_min,
        "fee_amount_max": fee_amount_max,
        "total_min": total_min,
        "total_max": total_max
    }

def calculate_roi(
    estimated_value: float,
    cost_min: float,
    cost_max: float
) -> dict:
    if cost_max <= 0:
        if estimated_value == 0:
            return {"roi_low": 0, "roi_high": 0}
        return {"roi_low": float('inf'), "roi_high": float('inf')}
    
    roi_low = ((estimated_value - cost_max) / cost_max) * 100
    roi_high = ((estimated_value - cost_min) / cost_min) * 100 if cost_min > 0 else float('inf')
    
    return {"roi_low": roi_low, "roi_high": roi_high}

def calculate_gain_pain(
    estimated_value: float,
    cost_min: float,
    cost_max: float
) -> dict:
    if cost_max <= 0:
        if estimated_value == 0:
            return {"gain_pain_low": 0, "gain_pain_high": 0}
        return {"gain_pain_low": float('inf'), "gain_pain_high": float('inf')}
    
    gain_pain_low = estimated_value / cost_max
    gain_pain_high = estimated_value / cost_min if cost_min > 0 else float('inf')
    
    return {"gain_pain_low": gain_pain_low, "gain_pain_high": gain_pain_high}

def get_recommendation(roi_low: float, roi_high: float, gain_pain_mid: float) -> dict:
    if roi_low == float('inf'):
        roi_low = 1000
    if roi_high == float('inf'):
        roi_high = 1000
    if gain_pain_mid == float('inf'):
        gain_pain_mid = 100
        
    roi_mid = (roi_low + roi_high) / 2
    
    if roi_mid >= 100:
        return {
            "action": "BUILD",
            "color": "green",
            "reasoning": f"Strong ROI range of {roi_low:.0f}%-{roi_high:.0f}% justifies investment. Gain/Pain ratio of {gain_pain_mid:.1f}x indicates clear value."
        }
    elif roi_mid >= 50:
        return {
            "action": "CONSIDER",
            "color": "yellow",
            "reasoning": f"Moderate ROI range of {roi_low:.0f}%-{roi_high:.0f}%. Consider if strategic value justifies investment or if costs can be reduced."
        }
    elif roi_mid >= 0:
        return {
            "action": "DEFER",
            "color": "orange",
            "reasoning": f"Low ROI range of {roi_low:.0f}%-{roi_high:.0f}%. Defer until value proposition improves or costs decrease significantly."
        }
    else:
        return {
            "action": "KILL",
            "color": "red",
            "reasoning": f"Negative ROI range of {roi_low:.0f}%-{roi_high:.0f}%. Costs exceed projected value. Recommend not proceeding."
        }

def get_health_from_roi(roi_mid: Optional[float]) -> tuple:
    if roi_mid is None:
        return ("gray", "N/A")
    if roi_mid >= 100:
        return ("green", "BUILD")
    elif roi_mid >= 50:
        return ("yellow", "CONSIDER")
    elif roi_mid >= 0:
        return ("orange", "DEFER")
    else:
        return ("red", "KILL")

def process_task_row(row: dict) -> dict:
    actual_hours = row.get("actual_hours") or 0
    estimated_hours = row.get("estimated_hours", 0)
    hourly_cost_min = row.get("hourly_cost_min", 0)
    hourly_cost_max = row.get("hourly_cost_max", 0)
    
    costs = calculate_task_costs(estimated_hours, actual_hours, hourly_cost_min, hourly_cost_max)
    progress = calculate_hours_progress(actual_hours, estimated_hours)
    status = calculate_hours_status(actual_hours, estimated_hours)
    
    return {
        "id": row["id"],
        "name": row["name"],
        "position_title": row.get("position_title", ""),
        "estimated_hours": estimated_hours,
        "actual_hours": actual_hours,
        "hours_progress": progress,
        "hours_status": status,
        "hourly_cost_min": hourly_cost_min,
        "hourly_cost_max": hourly_cost_max,
        **costs
    }
