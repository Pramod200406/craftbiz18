from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from database import get_db
from models import Buyer, Product
from schemas import MatchResult
from services.matching_service import calculate_buyer_matches

router = APIRouter(tags=["AI Buyer Matching"])

@router.get("/buyer/{buyer_id}/matches", response_model=List[MatchResult])
def get_buyer_product_matches(
    buyer_id: int, 
    category: Optional[str] = Query(None, description="Preferred craft category filter"),
    min_budget: Optional[float] = Query(None, description="Minimum budget per unit"),
    max_budget: Optional[float] = Query(None, description="Maximum affordable amount"),
    target_product: Optional[str] = Query(None, description="Specific desired product keyword"),
    quantity: Optional[int] = Query(None, description="Required batch quantity"),
    db: Session = Depends(get_db)
):
    buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")

    products = db.query(Product).all()
    if not products:
        return []

    matches = calculate_buyer_matches(
        buyer=buyer, 
        products=products,
        category=category,
        min_budget=min_budget,
        max_budget=max_budget,
        target_product=target_product,
        quantity_required=quantity
    )
    return matches

