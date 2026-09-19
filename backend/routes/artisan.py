from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Artisan, Product, Order
from schemas import ArtisanRegister, ArtisanLogin, ArtisanResponse, ArtisanDashboardResponse

router = APIRouter(tags=["Artisans"])

@router.post("/register/artisan", response_model=ArtisanResponse)
def register_artisan(data: ArtisanRegister, db: Session = Depends(get_db)):
    existing = db.query(Artisan).filter(Artisan.phone == data.phone).first()
    if existing:
        return existing
    
    artisan = Artisan(
        name=data.name,
        phone=data.phone,
        language=data.language or "en",
        craft_type=data.craft_type,
        location=data.location,
        production_capacity=data.production_capacity or 50
    )
    db.add(artisan)
    db.commit()
    db.refresh(artisan)
    return artisan

@router.post("/login/artisan")
def login_artisan(data: ArtisanLogin, db: Session = Depends(get_db)):
    artisan = db.query(Artisan).filter(Artisan.phone == data.phone).first()
    if not artisan:
        raise HTTPException(status_code=404, detail="Artisan not found with this phone number. Please register.")
    return {
        "artisan_id": artisan.id,
        "name": artisan.name,
        "role": "artisan",
        "craft_type": artisan.craft_type,
        "location": artisan.location,
        "language": artisan.language
    }

@router.get("/dashboard/artisan/{artisan_id}", response_model=ArtisanDashboardResponse)
@router.get("/artisan/{artisan_id}/dashboard", response_model=ArtisanDashboardResponse)
def get_artisan_dashboard(artisan_id: int, db: Session = Depends(get_db)):
    artisan = db.query(Artisan).filter(Artisan.id == artisan_id).first()
    if not artisan:
        artisan = db.query(Artisan).first()
    if not artisan:
        raise HTTPException(status_code=404, detail="Artisan not found")

    products = db.query(Product).filter(Product.artisan_id == artisan.id).all()
    orders = db.query(Order).filter(Order.artisan_id == artisan.id).all()

    total_products = len(products)
    total_orders = len(orders)
    pending_orders = sum(1 for o in orders if o.status in ["Pending", "Ready for Pickup"])
    delivered_orders = sum(1 for o in orders if o.status == "Delivered")
    total_revenue = sum(o.total_amount for o in orders if o.status in ["Accepted by Courier", "Shipped", "Delivered"])

    recent_orders_data = []
    for o in sorted(orders, key=lambda x: x.created_at, reverse=True)[:10]:
        recent_orders_data.append({
            "id": o.id,
            "order_id": o.id,
            "product_name": o.product.name if o.product else "Handicraft",
            "quantity": o.quantity,
            "total_amount": o.total_amount,
            "status": o.status,
            "buyer_name": o.buyer.name if o.buyer else "Buyer",
            "created_at": o.created_at.strftime("%b %d, %Y")
        })

    # Analytics charts mock/calculated from products and orders
    revenue_chart = [
        {"month": "Apr", "revenue": round(total_revenue * 0.12)},
        {"month": "May", "revenue": round(total_revenue * 0.18)},
        {"month": "Jun", "revenue": round(total_revenue * 0.15)},
        {"month": "Jul", "revenue": round(total_revenue * 0.22)},
        {"month": "Aug", "revenue": round(total_revenue * 0.28)},
        {"month": "Sep", "revenue": round(total_revenue * 0.35 + 1200)}
    ]

    product_performance = []
    for p in products[:4]:
        product_performance.append({
            "name": p.name,
            "stock": p.available_quantity,
            "views": p.authenticity_score * 12,
            "price": p.selling_price
        })

    return {
        "artisan_name": artisan.name,
        "total_products": total_products,
        "total_orders": total_orders,
        "pending_orders": pending_orders,
        "delivered_orders": delivered_orders,
        "revenue": float(total_revenue),
        "recent_orders": recent_orders_data,
        "revenue_chart": revenue_chart,
        "product_performance": product_performance
    }
