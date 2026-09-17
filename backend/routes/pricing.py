from fastapi import APIRouter
from schemas import PricingRequest, PricingResponse
from services.pricing_service import calculate_smart_price

router = APIRouter(tags=["Smart Pricing"])

@router.post("/pricing/suggest", response_model=PricingResponse)
def suggest_smart_price(data: PricingRequest):
    result = calculate_smart_price(
        production_cost=data.production_cost,
        demand_level=data.demand_level,
        category=data.category
    )
    return result
