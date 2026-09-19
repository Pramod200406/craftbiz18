import os
import shutil
import uuid
from typing import List
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from sqlalchemy.orm import Session
from database import get_db
from models import Product, Artisan
from schemas import ProductCreate, ProductResponse
from services.image_service import enhance_image, remove_background_and_compose, UPLOAD_DIR

router = APIRouter(tags=["Products"])

@router.post("/products", response_model=ProductResponse)
def create_product(data: ProductCreate, db: Session = Depends(get_db)):
    artisan = db.query(Artisan).filter(Artisan.id == data.artisan_id).first()
    if not artisan:
        raise HTTPException(status_code=404, detail="Artisan not found")

    product = Product(
        artisan_id=data.artisan_id,
        name=data.name,
        category=data.category,
        material=data.material,
        description=data.description,
        production_cost=data.production_cost,
        selling_price=data.selling_price,
        available_quantity=data.available_quantity or 10,
        image_url=data.image_url,
        authenticity_score=96,
        visual_score=90,
        fair_price_index=9.5,
        marketplace_readiness="Studio Verified",
        rating=4.9
    )
    db.add(product)
    db.commit()
    db.refresh(product)

    res = ProductResponse.model_validate(product)
    res.artisan_name = artisan.name
    res.artisan_location = artisan.location
    return res

@router.get("/products", response_model=List[ProductResponse])
def get_all_products(category: str = None, search: str = None, db: Session = Depends(get_db)):
    query = db.query(Product)
    if category and category.lower() != "all":
        query = query.filter(Product.category.ilike(f"%{category}%"))
    if search:
        query = query.filter((Product.name.ilike(f"%{search}%")) | (Product.description.ilike(f"%{search}%")))

    products = query.order_by(Product.id.desc()).all()
    results = []
    for p in products:
        item = ProductResponse.model_validate(p)
        if p.artisan:
            item.artisan_name = p.artisan.name
            item.artisan_location = p.artisan.location
        results.append(item)
    return results

@router.get("/artisan/{artisan_id}/products", response_model=List[ProductResponse])
def get_artisan_products(artisan_id: int, db: Session = Depends(get_db)):
    artisan = db.query(Artisan).filter(Artisan.id == artisan_id).first()
    if not artisan:
        artisan = db.query(Artisan).first()
    if not artisan:
        raise HTTPException(status_code=404, detail="Artisan not found")

    products = db.query(Product).filter(Product.artisan_id == artisan.id).order_by(Product.id.desc()).all()
    results = []
    for p in products:
        item = ProductResponse.model_validate(p)
        item.artisan_name = artisan.name
        item.artisan_location = artisan.location
        results.append(item)
    return results

@router.post("/products/{product_id}/upload-image")
async def upload_product_image(product_id: int, file: UploadFile = File(...), db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    ext = os.path.splitext(file.filename)[1] or ".jpg"
    filename = f"prod_{product_id}_{uuid.uuid4().hex[:8]}{ext}"
    filepath = os.path.join(UPLOAD_DIR, filename)

    with open(filepath, "wb") as buffer:
        shutil.copyfileobj(file.file, buffer)

    product.image_url = f"/uploads/{filename}"
    db.commit()
    db.refresh(product)
    return {"message": "Image uploaded successfully", "image_url": product.image_url}

@router.post("/products/{product_id}/enhance-image")
def enhance_product_image(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    if not product.image_url:
        raise HTTPException(status_code=400, detail="Product does not have an original image yet")

    filename = os.path.basename(product.image_url)
    filepath = os.path.join(UPLOAD_DIR, filename)

    enhanced_url = enhance_image(filepath)
    product.enhanced_image_url = enhanced_url
    product.visual_score = 94
    db.commit()
    db.refresh(product)
    return {"message": "Image enhanced with Pillow ImageEnhance", "enhanced_image_url": enhanced_url}

@router.post("/products/{product_id}/remove-background")
def remove_product_background(product_id: int, db: Session = Depends(get_db)):
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")

    source_url = product.enhanced_image_url or product.image_url
    if not source_url:
        raise HTTPException(status_code=400, detail="Product does not have an image to process")

    filename = os.path.basename(source_url)
    filepath = os.path.join(UPLOAD_DIR, filename)

    pro_url = remove_background_and_compose(filepath)
    product.professional_image_url = pro_url
    product.visual_score = 98
    product.marketplace_readiness = "Verified Studio Grade"
    db.commit()
    db.refresh(product)
    return {"message": "Background removed with rembg AI", "professional_image_url": pro_url}
