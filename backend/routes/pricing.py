from fastapi import APIRouter
from pydantic import BaseModel
from typing import Optional
from schemas import PricingResponse
from services.pricing_service import calculate_smart_price

router = APIRouter(tags=["Smart Pricing"])

class FlexPricingRequest(BaseModel):
    production_cost: Optional[float] = None
    cost: Optional[float] = None
    demand_level: Optional[str] = None
    category: Optional[str] = "Handloom"

@router.post("/pricing/suggest", response_model=PricingResponse)
@router.post("/pricing/calculate", response_model=PricingResponse)
def suggest_smart_price(data: FlexPricingRequest):
    actual_cost = data.production_cost if data.production_cost is not None else (data.cost if data.cost is not None else 350.0)
    result = calculate_smart_price(
        production_cost=actual_cost,
        demand_level=data.demand_level,
        category=data.category or "Handloom"
    )
    return result
