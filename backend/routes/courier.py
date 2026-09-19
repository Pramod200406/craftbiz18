from typing import List, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body
from sqlalchemy.orm import Session
from database import get_db
from models import Courier, Order
from schemas import CourierRegister, CourierLogin, CourierResponse

router = APIRouter(tags=["Couriers"])

@router.post("/register/courier", response_model=CourierResponse)
def register_courier(data: CourierRegister, db: Session = Depends(get_db)):
    existing = db.query(Courier).filter(Courier.phone == data.phone).first()
    if existing:
        return existing

    courier = Courier(
        name=data.name,
        phone=data.phone,
        organization_name=data.organization_name,
        location=data.location
    )
    db.add(courier)
    db.commit()
    db.refresh(courier)
    return courier

@router.post("/login/courier")
def login_courier(data: CourierLogin, db: Session = Depends(get_db)):
    courier = db.query(Courier).filter(Courier.phone == data.phone).first()
    if not courier:
        raise HTTPException(status_code=404, detail="Courier not found. Please register your agency.")
    return {
        "courier_id": courier.id,
        "name": courier.name,
        "role": "courier",
        "organization_name": courier.organization_name,
        "location": courier.location
    }

@router.get("/courier/available-orders")
def get_available_pickups(db: Session = Depends(get_db)):
    # Orders that are "Ready for Pickup"
    orders = db.query(Order).filter(Order.status == "Ready for Pickup").all()
    results = []
    for o in orders:
        results.append({
            "id": o.id,
            "order_id": o.id,
            "product_name": o.product.name if o.product else "Craft Shipment",
            "quantity": o.quantity,
            "order_value": o.total_amount,
            "total_amount": o.total_amount,
            "artisan_name": o.artisan.name if o.artisan else "Artisan Partner",
            "pickup_location": o.artisan.location if o.artisan else "Craft Cluster",
            "delivery_address": o.delivery_address,
            "buyer_name": o.buyer.name if o.buyer else "Customer",
            "status": o.status,
            "created_at": o.created_at.strftime("%b %d, %Y %I:%M %p")
        })
    return results

@router.put("/courier/{courier_id}/accept/{order_id}")
@router.put("/orders/{order_id}/accept")
def accept_order(order_id: int, courier_id: int = 1, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.courier_id = courier_id
    order.status = "Accepted by Courier"
    db.commit()
    db.refresh(order)
    return {"message": "Order accepted successfully", "order_id": order.id, "id": order.id, "status": order.status}

@router.get("/courier/{courier_id}/orders")
def get_courier_orders(courier_id: int, db: Session = Depends(get_db)):
    orders = db.query(Order).filter(Order.courier_id == courier_id).all()
    if not orders:
        # If no orders yet assigned to this specific courier ID, return all non-delivered/shipped orders so courier can manage
        orders = db.query(Order).all()
    results = []
    for o in sorted(orders, key=lambda x: x.created_at, reverse=True):
        results.append({
            "id": o.id,
            "order_id": o.id,
            "product_name": o.product.name if o.product else "Craft Consignment",
            "quantity": o.quantity,
            "order_value": o.total_amount,
            "total_amount": o.total_amount,
            "artisan_name": o.artisan.name if o.artisan else "Artisan",
            "pickup_location": o.artisan.location if o.artisan else "Craft Center",
            "delivery_address": o.delivery_address,
            "buyer_name": o.buyer.name if o.buyer else "Customer",
            "status": o.status,
            "otp": o.otp,
            "created_at": o.created_at.strftime("%b %d, %Y %I:%M %p")
        })
    return results

@router.put("/courier/{courier_id}/ship/{order_id}")
@router.put("/orders/{order_id}/ship")
def ship_order(order_id: int, courier_id: int = 1, db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    order.courier_id = courier_id
    order.status = "Shipped"
    db.commit()
    db.refresh(order)
    return {"message": "Order marked as Shipped", "order_id": order.id, "id": order.id, "status": order.status}

@router.put("/courier/{courier_id}/deliver/{order_id}")
@router.put("/orders/{order_id}/deliver")
def deliver_order(order_id: int, courier_id: int = 1, payload: Dict[str, Any] = Body(default={}), db: Session = Depends(get_db)):
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="Order not found")

    entered_otp = payload.get("otp", "1234")
    if str(entered_otp).strip() != str(order.otp).strip() and str(entered_otp).strip() != "1234":
        raise HTTPException(status_code=400, detail="Invalid OTP. Demo OTP is 1234.")

    order.courier_id = courier_id
    order.status = "Delivered"
    db.commit()
    db.refresh(order)
    return {"message": "Delivery completed successfully", "order_id": order.id, "id": order.id, "status": order.status}
