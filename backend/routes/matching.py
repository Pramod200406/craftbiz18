from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.orm import Session
from database import get_db
from models import Buyer, Product
from schemas import MatchResult
from services.matching_service import calculate_buyer_matches

router = APIRouter(tags=["AI Buyer Matching"])

class RecommendRequest(BaseModel):
    buyer_id: Optional[int] = 1
    category: Optional[str] = None
    min_budget: Optional[float] = None
    max_budget: Optional[float] = None
    target_product: Optional[str] = None
    quantity: Optional[int] = None
    limit: Optional[int] = 10

def _get_effective_buyer(db: Session, buyer_id: int):
    buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
    if not buyer:
        buyer = db.query(Buyer).first()
    if not buyer:
        buyer = Buyer(
            id=1,
            name="Pramod Savadatti",
            phone="9876543210",
            business_name="Heritage Craft Boutique",
            business_type="Retail / Boutique",
            location="Bengaluru, Karnataka",
            budget_min=300.0,
            budget_max=15000.0,
            quantity_required=15
        )
    return buyer

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
    buyer = _get_effective_buyer(db, buyer_id)
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

@router.post("/matching/recommend", response_model=List[MatchResult])
def recommend_matches_post(
    data: RecommendRequest,
    db: Session = Depends(get_db)
):
    buyer = _get_effective_buyer(db, data.buyer_id or 1)
    products = db.query(Product).all()
    if not products:
        return []

    matches = calculate_buyer_matches(
        buyer=buyer,
        products=products,
        category=data.category,
        min_budget=data.min_budget,
        max_budget=data.max_budget,
        target_product=data.target_product,
        quantity_required=data.quantity
    )
    if data.limit:
        return matches[:data.limit]
    return matches

