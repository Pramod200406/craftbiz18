from datetime import datetime
from sqlalchemy import Column, Integer, String, Float, Text, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from database import Base

class Artisan(Base):
    __tablename__ = "artisans"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    language = Column(String(20), default="en")
    craft_type = Column(String(100), nullable=False)
    location = Column(String(100), nullable=False)
    production_capacity = Column(Integer, default=50)
    created_at = Column(DateTime, default=datetime.utcnow)

    products = relationship("Product", back_populates="artisan", cascade="all, delete-orphan")
    orders = relationship("Order", back_populates="artisan")


class Buyer(Base):
    __tablename__ = "buyers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    language = Column(String(20), default="en")
    business_name = Column(String(150), nullable=False)
    business_type = Column(String(100), nullable=False)
    location = Column(String(100), nullable=False)
    quantity_required = Column(Integer, default=10)
    budget_min = Column(Float, default=500.0)
    budget_max = Column(Float, default=10000.0)
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="buyer")


class Courier(Base):
    __tablename__ = "couriers"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    phone = Column(String(20), unique=True, index=True, nullable=False)
    organization_name = Column(String(150), nullable=False)
    location = Column(String(100), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    orders = relationship("Order", back_populates="courier")


class Product(Base):
    __tablename__ = "products"

    id = Column(Integer, primary_key=True, index=True)
    artisan_id = Column(Integer, ForeignKey("artisans.id"), nullable=False)
    name = Column(String(150), nullable=False)
    category = Column(String(100), nullable=False)  # Terracotta, Bamboo Crafts, Handloom, Woodcraft, Jewellery, Metal Crafts, Jute Crafts
    material = Column(String(100), nullable=True)
    description = Column(Text, nullable=True)
    production_cost = Column(Float, nullable=False)
    selling_price = Column(Float, nullable=False)
    available_quantity = Column(Integer, default=10)
    
    # Image pipeline URLs
    image_url = Column(String(500), nullable=True)
    enhanced_image_url = Column(String(500), nullable=True)
    professional_image_url = Column(String(500), nullable=True)

    # AI scores
    authenticity_score = Column(Integer, default=95)
    visual_score = Column(Integer, default=92)
    fair_price_index = Column(Float, default=9.4)
    marketplace_readiness = Column(String(50), default="Certified Studio Ready")
    rating = Column(Float, default=4.8)

    created_at = Column(DateTime, default=datetime.utcnow)

    artisan = relationship("Artisan", back_populates="products")
    orders = relationship("Order", back_populates="product")


class Order(Base):
    __tablename__ = "orders"

    id = Column(Integer, primary_key=True, index=True)
    buyer_id = Column(Integer, ForeignKey("buyers.id"), nullable=False)
    artisan_id = Column(Integer, ForeignKey("artisans.id"), nullable=False)
    courier_id = Column(Integer, ForeignKey("couriers.id"), nullable=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    
    quantity = Column(Integer, default=1)
    total_amount = Column(Float, nullable=False)
    delivery_address = Column(Text, nullable=False)
    
    # Status progression: Pending -> Ready for Pickup -> Accepted by Courier -> Shipped -> Delivered
    status = Column(String(50), default="Pending")
    otp = Column(String(10), default="1234")
    created_at = Column(DateTime, default=datetime.utcnow)

    buyer = relationship("Buyer", back_populates="orders")
    artisan = relationship("Artisan", back_populates="orders")
    courier = relationship("Courier", back_populates="orders")
    product = relationship("Product", back_populates="orders")
