from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Artisan, Buyer, Courier, Product, Order
from schemas import OrderResponse
from routes.orders import serialize_order

router = APIRouter(prefix="/admin", tags=["Admin Portal"])

@router.get("/stats")
def get_admin_stats(db: Session = Depends(get_db)):
    artisans_count = db.query(Artisan).count()
    buyers_count = db.query(Buyer).count()
    couriers_count = db.query(Courier).count()
    products_count = db.query(Product).count()
    orders = db.query(Order).all()
    
    total_orders = len(orders)
    delivered_orders = sum(1 for o in orders if o.status == "Delivered")
    active_orders = sum(1 for o in orders if o.status in ["Pending", "Ready for Pickup", "Accepted by Courier", "Shipped"])
    total_revenue = sum(o.total_amount for o in orders)

    products = db.query(Product).all()
    avg_authenticity = round(sum(p.authenticity_score or 95 for p in products) / max(1, len(products)), 1) if products else 96.0
    avg_fair_price = round(sum(p.fair_price_index or 9.5 for p in products) / max(1, len(products)), 1) if products else 9.5

    return {
        "status": "active",
        "system_version": "CRAFTBIZ AI v2.6 (SIH 2026)",
        "artisans_count": artisans_count,
        "buyers_count": buyers_count,
        "couriers_count": couriers_count,
        "products_count": products_count,
        "total_orders": total_orders,
        "active_orders": active_orders,
        "delivered_orders": delivered_orders,
        "total_revenue": float(total_revenue),
        "avg_authenticity": avg_authenticity,
        "avg_fair_price": avg_fair_price,
        "craft_clusters": ["Channapatna", "Bankura", "Varanasi", "Bidar", "Kutch", "Pochampally"]
    }

@router.get("/orders", response_model=List[OrderResponse])
def get_all_orders(db: Session = Depends(get_db)):
    orders = db.query(Order).order_by(Order.id.desc()).all()
    return [serialize_order(o) for o in orders]

@router.get("/artisans")
def get_all_artisans(db: Session = Depends(get_db)):
    artisans = db.query(Artisan).all()
    res = []
    for a in artisans:
        prod_count = len(a.products)
        orders_count = len(a.orders)
        earned = sum(o.total_amount for o in a.orders if o.status == "Delivered")
        res.append({
            "id": a.id,
            "name": a.name,
            "phone": a.phone,
            "craft_type": a.craft_type,
            "location": a.location,
            "production_capacity": a.production_capacity,
            "products_count": prod_count,
            "orders_count": orders_count,
            "total_earned": float(earned),
            "joined_at": a.created_at.strftime("%Y-%m-%d") if a.created_at else "2026"
        })
    return res

@router.get("/buyers")
def get_all_buyers(db: Session = Depends(get_db)):
    buyers = db.query(Buyer).all()
    res = []
    for b in buyers:
        spent = sum(o.total_amount for o in b.orders)
        res.append({
            "id": b.id,
            "name": b.name,
            "phone": b.phone,
            "business_name": b.business_name,
            "business_type": b.business_type,
            "location": b.location,
            "orders_count": len(b.orders),
            "total_spent": float(spent),
            "budget_bracket": f"₹{b.budget_min:.0f} - ₹{b.budget_max:.0f}"
        })
    return res

@router.get("/couriers")
def get_all_couriers(db: Session = Depends(get_db)):
    couriers = db.query(Courier).all()
    res = []
    for c in couriers:
        assigned = len(c.orders)
        delivered = sum(1 for o in c.orders if o.status == "Delivered")
        res.append({
            "id": c.id,
            "name": c.name,
            "phone": c.phone,
            "organization_name": c.organization_name,
            "location": c.location,
            "assigned_deliveries": assigned,
            "completed_deliveries": delivered
        })
    return res

@router.delete("/products/{product_id}")
def delete_product_by_admin(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    
    db.query(Order).filter(Order.product_id == product_id).delete()
    db.delete(product)
    db.commit()
    return {"message": f"Product #{product_id} ('{product.name}') removed by Admin successfully."}
