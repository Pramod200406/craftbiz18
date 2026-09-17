import os
from contextlib import asynccontextmanager
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from sqlalchemy.orm import Session

from database import engine, Base, get_db
from models import Artisan, Buyer, Courier, Product, Order
from routes import artisan, buyer, courier, products, orders, pricing, voice, matching, admin
from services.image_service import UPLOAD_DIR
from clear_data import clear_all_data
from seed import seed_database

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup: ensure tables are created
    Base.metadata.create_all(bind=engine)
    if os.environ.get("AUTO_SEED", "").lower() == "true":
        seed_database()
    yield

app = FastAPI(
    title="🎨 CRAFTBIZ AI - Backend API",
    description="AI-Powered Virtual Business Manager & Digital Commerce Ecosystem for Indian Artisans (SIH 2026)",
    version="1.0.0",
    lifespan=lifespan
)

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Static file serving for uploads
os.makedirs(UPLOAD_DIR, exist_ok=True)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

# Include all route modules
app.include_router(artisan.router)
app.include_router(buyer.router)
app.include_router(courier.router)
app.include_router(products.router)
app.include_router(orders.router)
app.include_router(pricing.router)
app.include_router(voice.router)
app.include_router(matching.router)
app.include_router(admin.router)

@app.get("/")
def root(db: Session = Depends(get_db)):
    return {
        "project": "CRAFTBIZ AI",
        "description": "AI-Powered Virtual Business Manager for Indian Artisans",
        "status": "online",
        "docs": "/docs",
        "supported_languages": ["en", "kn", "hi"],
        "counts": {
            "artisans": db.query(Artisan).count(),
            "products": db.query(Product).count(),
            "orders": db.query(Order).count(),
            "buyers": db.query(Buyer).count(),
            "couriers": db.query(Courier).count()
        }
    }

@app.post("/system/clear-data")
def clear_system_data():
    clear_all_data()
    return {"message": "All data cleared successfully. System is completely fresh for new data entry."}

@app.post("/system/seed-demo")
def seed_demo_data():
    seed_database()
    return {"message": "Demo data pre-seeded successfully with authentic Indian crafts."}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
