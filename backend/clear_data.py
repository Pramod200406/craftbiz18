import os
import glob
from database import SessionLocal, engine, Base
from models import Order, Product, Artisan, Buyer, Courier
from services.image_service import UPLOAD_DIR

def clear_all_data():
    db = SessionLocal()
    try:
        # Delete orders first due to foreign keys
        num_orders = db.query(Order).delete()
        # Delete products
        num_products = db.query(Product).delete()
        # Delete artisans
        num_artisans = db.query(Artisan).delete()
        # Delete buyers
        num_buyers = db.query(Buyer).delete()
        # Delete couriers
        num_couriers = db.query(Courier).delete()
        
        db.commit()
        print(f"Deleted: {num_orders} orders, {num_products} products, {num_artisans} artisans, {num_buyers} buyers, {num_couriers} couriers.")

        # Clean uploads folder
        files = glob.glob(os.path.join(UPLOAD_DIR, "*"))
        for f in files:
            try:
                os.remove(f)
            except Exception as e:
                print(f"Could not remove {f}: {e}")

        print("All database records and uploaded files cleared successfully! Database is completely fresh.")
    except Exception as e:
        print(f"Error clearing data: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    clear_all_data()
