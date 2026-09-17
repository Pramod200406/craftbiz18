from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Buyer, Order
from schemas import BuyerRegister, BuyerLogin, BuyerResponse, BuyerDashboardResponse

router = APIRouter(tags=["Buyers"])

@router.post("/register/buyer", response_model=BuyerResponse)
def register_buyer(data: BuyerRegister, db: Session = Depends(get_db)):
    existing = db.query(Buyer).filter(Buyer.phone == data.phone).first()
    if existing:
        existing.name = data.name or existing.name
        existing.business_name = data.business_name or existing.business_name
        existing.business_type = data.business_type or existing.business_type
        existing.location = data.location or existing.location
        if data.quantity_required:
            existing.quantity_required = data.quantity_required
        if data.budget_min is not None:
            existing.budget_min = data.budget_min
        if data.budget_max is not None:
            existing.budget_max = data.budget_max
        db.commit()
        db.refresh(existing)
        return existing

    buyer = Buyer(
        name=data.name,
        phone=data.phone,
        language=data.language or "en",
        business_name=data.business_name,
        business_type=data.business_type,
        location=data.location,
        quantity_required=data.quantity_required or 10,
        budget_min=data.budget_min or 500.0,
        budget_max=data.budget_max or 10000.0
    )
    db.add(buyer)
    db.commit()
    db.refresh(buyer)
    return buyer

@router.post("/login/buyer")
def login_buyer(data: BuyerLogin, db: Session = Depends(get_db)):
    buyer = db.query(Buyer).filter(Buyer.phone == data.phone).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found with this phone number. Please register.")
    return {
        "buyer_id": buyer.id,
        "name": buyer.name,
        "role": "buyer",
        "business_name": buyer.business_name,
        "business_type": buyer.business_type,
        "location": buyer.location,
        "language": buyer.language
    }

@router.get("/dashboard/buyer/{buyer_id}", response_model=BuyerDashboardResponse)
def get_buyer_dashboard(buyer_id: int, db: Session = Depends(get_db)):
    buyer = db.query(Buyer).filter(Buyer.id == buyer_id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")

    orders = db.query(Order).filter(Order.buyer_id == buyer_id).all()
    total_orders = len(orders)
    active_orders = sum(1 for o in orders if o.status in ["Pending", "Ready for Pickup", "Accepted by Courier", "Shipped"])
    delivered_orders = sum(1 for o in orders if o.status == "Delivered")
    total_spent = sum(o.total_amount for o in orders)

    recent_orders_data = []
    for o in sorted(orders, key=lambda x: x.created_at, reverse=True)[:5]:
        recent_orders_data.append({
            "id": o.id,
            "product_name": o.product.name if o.product else "Craft Order",
            "quantity": o.quantity,
            "total_amount": o.total_amount,
            "status": o.status,
            "artisan_name": o.artisan.name if o.artisan else "Artisan",
            "created_at": o.created_at.strftime("%b %d, %Y")
        })

    return {
        "buyer_name": buyer.name,
        "total_orders": total_orders,
        "active_orders": active_orders,
        "delivered_orders": delivered_orders,
        "total_spent": float(total_spent),
        "recent_orders": recent_orders_data
    }
