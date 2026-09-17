from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models import Order, Product, Buyer, Artisan
from schemas import OrderCreate, OrderResponse

router = APIRouter(tags=["Orders"])

def serialize_order(o: Order) -> OrderResponse:
    item = OrderResponse.model_validate(o)
    if o.product:
        item.product_name = o.product.name
        item.product_image = o.product.professional_image_url or o.product.enhanced_image_url or o.product.image_url
    if o.buyer:
        item.buyer_name = o.buyer.name
    if o.artisan:
        item.artisan_name = o.artisan.name
        item.pickup_location = o.artisan.location
    if o.courier:
        item.courier_name = o.courier.name
    return item

@router.post("/orders", response_model=OrderResponse)
def create_order(data: OrderCreate, db: Session = Depends(get_db)):
    buyer = db.query(Buyer).filter(Buyer.id == data.buyer_id).first()
    if not buyer:
        raise HTTPException(status_code=404, detail="Buyer not found")

    product = db.query(Product).filter(Product.id == data.product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if product.available_quantity < data.quantity:
        raise HTTPException(status_code=400, detail="Insufficient product quantity in stock")

    total_amount = round(product.selling_price * data.quantity, 2)
    product.available_quantity -= data.quantity

    order = Order(
        buyer_id=data.buyer_id,
        artisan_id=product.artisan_id,
        product_id=data.product_id,
        quantity=data.quantity,
        total_amount=total_amount,
        delivery_address=data.delivery_address,
        status="Pending",
        otp="1234"
    )
    db.add(order)
    db.commit()
    db.refresh(order)

    return serialize_order(order)

@router.put("/orders/{order_id}/ready")
def mark_order_ready(order_id: int, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.status = "Ready for Pickup"
    db.commit()
    db.refresh(order)
    return {"message": "Order is marked Ready for Pickup", "order_id": order.id, "status": order.status}

@router.get("/buyer/{buyer_id}/orders", response_model=List[OrderResponse])
def get_buyer_orders(buyer_id: int, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.buyer_id == buyer_id).order_by(Order.id.desc()).all()
    return [serialize_order(o) for o in orders]

@router.get("/artisan/{artisan_id}/orders", response_model=List[OrderResponse])
def get_artisan_orders(artisan_id: int, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.artisan_id == artisan_id).order_by(Order.id.desc()).all()
    return [serialize_order(o) for o in orders]
