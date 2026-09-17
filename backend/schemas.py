from typing import Optional, List, Dict, Any
from datetime import datetime
from pydantic import BaseModel, Field

# ================= Artisan Schemas =================
class ArtisanRegister(BaseModel):
    name: str
    phone: str
    language: Optional[str] = "en"
    craft_type: str
    location: str
    production_capacity: Optional[int] = 50

class ArtisanLogin(BaseModel):
    phone: str

class ArtisanResponse(BaseModel):
    id: int
    name: str
    phone: str
    language: str
    craft_type: str
    location: str
    production_capacity: int
    created_at: datetime

    class Config:
        from_attributes = True

class ArtisanDashboardResponse(BaseModel):
    artisan_name: str
    total_products: int
    total_orders: int
    pending_orders: int
    delivered_orders: int
    revenue: float
    recent_orders: List[Dict[str, Any]] = []
    revenue_chart: List[Dict[str, Any]] = []
    product_performance: List[Dict[str, Any]] = []

# ================= Buyer Schemas =================
class BuyerRegister(BaseModel):
    name: str
    phone: str
    language: Optional[str] = "en"
    business_name: str
    business_type: str
    location: str
    quantity_required: Optional[int] = 10
    budget_min: Optional[float] = 500.0
    budget_max: Optional[float] = 10000.0

class BuyerLogin(BaseModel):
    phone: str

class BuyerResponse(BaseModel):
    id: int
    name: str
    phone: str
    language: str
    business_name: str
    business_type: str
    location: str
    quantity_required: int
    budget_min: float
    budget_max: float
    created_at: datetime

    class Config:
        from_attributes = True

class BuyerDashboardResponse(BaseModel):
    buyer_name: str
    total_orders: int
    active_orders: int
    delivered_orders: int
    total_spent: float
    recent_orders: List[Dict[str, Any]] = []

# ================= Courier Schemas =================
class CourierRegister(BaseModel):
    name: str
    phone: str
    organization_name: str
    location: str

class CourierLogin(BaseModel):
    phone: str

class CourierResponse(BaseModel):
    id: int
    name: str
    phone: str
    organization_name: str
    location: str
    created_at: datetime

    class Config:
        from_attributes = True

# ================= Product Schemas =================
class ProductCreate(BaseModel):
    artisan_id: int
    name: str
    category: str
    material: Optional[str] = None
    description: Optional[str] = None
    production_cost: float
    selling_price: float
    available_quantity: Optional[int] = 10
    image_url: Optional[str] = None

class ProductResponse(BaseModel):
    id: int
    artisan_id: int
    name: str
    category: str
    material: Optional[str] = None
    description: Optional[str] = None
    production_cost: float
    selling_price: float
    available_quantity: int
    image_url: Optional[str] = None
    enhanced_image_url: Optional[str] = None
    professional_image_url: Optional[str] = None
    authenticity_score: int
    visual_score: int
    fair_price_index: float
    marketplace_readiness: str
    rating: float
    artisan_name: Optional[str] = None
    artisan_location: Optional[str] = None
    created_at: datetime

    class Config:
        from_attributes = True

# ================= Order Schemas =================
class OrderCreate(BaseModel):
    buyer_id: int
    product_id: int
    quantity: int = 1
    delivery_address: str

class OrderResponse(BaseModel):
    id: int
    buyer_id: int
    artisan_id: int
    courier_id: Optional[int] = None
    product_id: int
    quantity: int
    total_amount: float
    delivery_address: str
    status: str
    otp: str
    created_at: datetime
    product_name: Optional[str] = None
    product_image: Optional[str] = None
    buyer_name: Optional[str] = None
    artisan_name: Optional[str] = None
    pickup_location: Optional[str] = None
    courier_name: Optional[str] = None

    class Config:
        from_attributes = True

# ================= Pricing Schemas =================
class PricingRequest(BaseModel):
    production_cost: float
    demand_level: Optional[str] = None  # None = Automatically forecasted by AI backend from future days
    category: Optional[str] = "Handloom"

class PricingResponse(BaseModel):
    suggested_price: float
    estimated_profit: float
    profit_margin_percent: float
    demand_level: str
    explanation: str
    category_multiplier: float
    fair_pricing_index: float
    breakdown: Optional[Dict[str, Any]] = None
    reasoning_steps: Optional[List[str]] = []
    demand_forecast_info: Optional[Dict[str, Any]] = None

# ================= Voice Schemas =================
class TranscribeResponse(BaseModel):
    text: str
    language: Optional[str] = "en"
    translated_text: Optional[str] = None
    translated_hindi: Optional[str] = None
    confidence: Optional[float] = 0.95

class VoiceExtractRequest(BaseModel):
    transcription: Optional[str] = ""

class VoiceExtractResponse(BaseModel):
    name: str
    category: str
    material: str
    production_cost: float
    suggested_selling_price: float
    quantity: int
    confidence: float
    original_text: Optional[str] = None
    translated_text: Optional[str] = None
    translated_hindi: Optional[str] = None
    detected_language: Optional[str] = "en"
    # NLP-Generated SEO Friendly Descriptions in English & Hindi
    seo_title_en: Optional[str] = None
    seo_title_hi: Optional[str] = None
    description_en: Optional[str] = None
    description_hi: Optional[str] = None
    seo_keywords: Optional[List[str]] = []
    seo_keywords_hi: Optional[List[str]] = []
    bullet_points_en: Optional[List[str]] = []
    bullet_points_hi: Optional[List[str]] = []
    seo_score: Optional[int] = 98

# ================= Matching Schemas =================
class MatchResult(BaseModel):
    product_id: int
    product_name: str
    category: str
    selling_price: float
    production_cost: float
    available_quantity: int
    artisan_id: int
    artisan_name: str
    artisan_location: str
    image_url: Optional[str] = None
    match_score: int
    ai_explanation: str
    authenticity_score: int
