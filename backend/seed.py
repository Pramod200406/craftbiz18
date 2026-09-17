import os
from PIL import Image, ImageDraw, ImageFont
from database import SessionLocal, engine, Base
from models import Artisan, Buyer, Courier, Product, Order
from services.image_service import UPLOAD_DIR

def generate_placeholder_image(filename: str, title: str, category: str, bg_color: tuple, accent_color: tuple) -> str:
    filepath = os.path.join(UPLOAD_DIR, filename)
    if os.path.exists(filepath):
        return f"/uploads/{filename}"

    width, height = 800, 800
    img = Image.new("RGB", (width, height), bg_color)
    draw = ImageDraw.Draw(img)

    # Draw ornamental borders and patterns
    draw.rectangle([20, 20, width - 20, height - 20], outline=accent_color, width=4)
    draw.rectangle([35, 35, width - 35, height - 35], outline=accent_color, width=2)
    
    # Draw central decorative motif circle
    center_x, center_y = width // 2, height // 2 - 40
    radius = 180
    draw.ellipse([center_x - radius, center_y - radius, center_x + radius, center_y + radius], fill=(255, 255, 255), outline=accent_color, width=6)
    draw.ellipse([center_x - radius + 20, center_y - radius + 20, center_x + radius - 20, center_y + radius - 20], outline=accent_color, width=2)

    # Simple geometric craft motif inside circle
    draw.polygon([
        (center_x, center_y - 120),
        (center_x + 90, center_y - 20),
        (center_x + 60, center_y + 110),
        (center_x - 60, center_y + 110),
        (center_x - 90, center_y - 20)
    ], fill=accent_color)

    draw.ellipse([center_x - 40, center_y - 40, center_x + 40, center_y + 40], fill=(255, 255, 255))
    draw.ellipse([center_x - 15, center_y - 15, center_x + 15, center_y + 15], fill=accent_color)

    # Draw Banner at bottom
    draw.rectangle([50, height - 190, width - 50, height - 60], fill=(255, 255, 255), outline=accent_color, width=3)
    
    # Text placeholder labels (using basic bitmap drawing)
    draw.text((70, height - 170), f"INDIAN ARTISAN HERITAGE CRAFT", fill=accent_color)
    draw.text((70, height - 140), f"{title.upper()} ({category.upper()})", fill=(30, 30, 30))
    draw.text((70, height - 100), "CRAFTBIZ AI VERIFIED ARTISAN STUDIO QUALITY", fill=(16, 185, 129))

    img.save(filepath, "JPEG", quality=92)
    return f"/uploads/{filename}"


def seed_database():
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()

    try:
        # Check if already seeded
        if db.query(Artisan).first():
            print("Database already contains records. Skipping seed.")
            return

        print("Seeding CRAFTBIZ AI database with authentic Indian crafts...")

        # 1. Seed Artisans
        artisan_1 = Artisan(
            name="Meenakshi Bai",
            phone="9876543210",
            language="kn",
            craft_type="Channapatna Woodcraft",
            location="Channapatna, Ramanagara, Karnataka",
            production_capacity=80
        )
        artisan_2 = Artisan(
            name="Rameshwar Pal",
            phone="9876543211",
            language="en",
            craft_type="Bankura Terracotta",
            location="Bishnupur, Bankura, West Bengal",
            production_capacity=45
        )
        artisan_3 = Artisan(
            name="Abdul Rahim Bidri",
            phone="9876543212",
            language="hi",
            craft_type="Bidri Metal Inlay",
            location="Bidar, Karnataka",
            production_capacity=30
        )
        artisan_4 = Artisan(
            name="Devika Devi",
            phone="9876543213",
            language="hi",
            craft_type="Handloom & Madhubani Silk",
            location="Madhubani, Bihar",
            production_capacity=25
        )
        artisan_5 = Artisan(
            name="Shanti Murmu",
            phone="9876543214",
            language="en",
            craft_type="Bamboo & Cane Craft",
            location="Baripada, Mayurbhanj, Odisha",
            production_capacity=100
        )

        db.add_all([artisan_1, artisan_2, artisan_3, artisan_4, artisan_5])
        db.commit()

        # Seed Buyers
        buyer_1 = Buyer(
            name="Anita Sharma",
            phone="9123456780",
            language="en",
            business_name="IndieCraft Living & Boutiques",
            business_type="Retail & Export Emporium",
            location="Indiranagar, Bengaluru, Karnataka",
            quantity_required=15,
            budget_min=400.0,
            budget_max=15000.0
        )
        buyer_2 = Buyer(
            name="Vikramaditya Hegde",
            phone="9123456781",
            language="kn",
            business_name="Hegde Heritage Decor",
            business_type="Boutique Hotel Furnishings",
            location="Malleshwaram, Bengaluru, Karnataka",
            quantity_required=30,
            budget_min=800.0,
            budget_max=40000.0
        )
        db.add_all([buyer_1, buyer_2])
        db.commit()

        # Seed Courier
        courier_1 = Courier(
            name="Suresh Kumar",
            phone="9988776655",
            organization_name="DakSeva Craft Express Logistics",
            location="KSR Bengaluru Hub, Karnataka"
        )
        courier_2 = Courier(
            name="Rajesh Patel",
            phone="9988776656",
            organization_name="Gramin Bharat Express Courier",
            location="Mysuru Regional Transit Center, Karnataka"
        )
        db.add_all([courier_1, courier_2])
        db.commit()

        # Generate Images
        img_wood = generate_placeholder_image("seed_woodcraft.jpg", "Channapatna Wooden Rocking Horse", "Woodcraft", (254, 243, 199), (180, 83, 9))
        img_terra = generate_placeholder_image("seed_terracotta.jpg", "Bankura Terracotta Temple Horse", "Terracotta", (255, 237, 213), (194, 65, 12))
        img_metal = generate_placeholder_image("seed_metal.jpg", "Bidriware Silver Inlay Floral Vase", "Metal Crafts", (241, 245, 249), (51, 65, 85))
        img_handloom = generate_placeholder_image("seed_handloom.jpg", "Heritage Khadi Cotton & Silk Saree", "Handloom", (252, 231, 243), (190, 24, 93))
        img_bamboo = generate_placeholder_image("seed_bamboo.jpg", "Golden Bamboo Hand-Woven Lamp Shade", "Bamboo Crafts", (236, 253, 245), (4, 120, 87))
        img_jewel = generate_placeholder_image("seed_jewellery.jpg", "Handcrafted Terracotta Beads Necklace", "Jewellery", (254, 240, 138), (161, 98, 7))
        img_jute = generate_placeholder_image("seed_jute.jpg", "Eco-Luxury Braided Jute Tote Bag", "Jute Crafts", (245, 245, 244), (120, 113, 108))

        # Seed Products across all 7 categories
        products_data = [
            Product(
                artisan_id=artisan_1.id,
                name="Channapatna Lacquerware Rocking Horse",
                category="Woodcraft",
                material="Ivory Wood (Wrightia Tinctoria) & Natural Vegetable Dyes",
                description="Classic 100% non-toxic handcrafted rocking horse toy crafted by Master Artisans of Channapatna with GI-certified traditional lacquerware finish.",
                production_cost=320.0,
                selling_price=549.0,
                available_quantity=24,
                image_url=img_wood,
                enhanced_image_url=img_wood,
                professional_image_url=img_wood,
                authenticity_score=98,
                visual_score=95,
                fair_price_index=9.6,
                rating=4.9
            ),
            Product(
                artisan_id=artisan_2.id,
                name="Bankura Terracotta Temple Horse",
                category="Terracotta",
                material="Alluvial Bankura Clay & Kiln Fired",
                description="Famous Panchmura terracotta horse featuring long erect neck and pointed ears, a timeless symbol of Indian folk art and architectural heritage.",
                production_cost=380.0,
                selling_price=689.0,
                available_quantity=18,
                image_url=img_terra,
                enhanced_image_url=img_terra,
                professional_image_url=img_terra,
                authenticity_score=99,
                visual_score=93,
                fair_price_index=9.5,
                rating=4.8
            ),
            Product(
                artisan_id=artisan_3.id,
                name="Bidriware Pure Silver Inlay Royal Vase",
                category="Metal Crafts",
                material="Zinc & Copper Alloy Inlaid with 99.9% Pure Silver Sheet",
                description="Centuries-old Persian-Indian metal craft from Bidar. The jet-black oxidized patina contrasts dramatically with shining pure silver wire arabesque motifs.",
                production_cost=1400.0,
                selling_price=2499.0,
                available_quantity=10,
                image_url=img_metal,
                enhanced_image_url=img_metal,
                professional_image_url=img_metal,
                authenticity_score=99,
                visual_score=97,
                fair_price_index=9.8,
                rating=5.0
            ),
            Product(
                artisan_id=artisan_4.id,
                name="Heritage Handloom Madhubani Silk Saree",
                category="Handloom",
                material="Tussar Silk with Natural Mineral Pigments",
                description="Hand-loomed natural Tussar silk woven on pit-looms, meticulously hand-painted with mythological Mithila wildlife and tree-of-life folklore.",
                production_cost=1100.0,
                selling_price=1890.0,
                available_quantity=12,
                image_url=img_handloom,
                enhanced_image_url=img_handloom,
                professional_image_url=img_handloom,
                authenticity_score=97,
                visual_score=94,
                fair_price_index=9.4,
                rating=4.9
            ),
            Product(
                artisan_id=artisan_5.id,
                name="Hand-Woven Bamboo Pendant Lamp Shade",
                category="Bamboo Crafts",
                material="Seasoned Wild Bamboo Cane & Copper Fitting",
                description="Contemporary minimalist geometric lamp shade hand-split and woven by tribal artisans in Mayurbhanj, treated with natural boron salts for lifetime durability.",
                production_cost=420.0,
                selling_price=799.0,
                available_quantity=35,
                image_url=img_bamboo,
                enhanced_image_url=img_bamboo,
                professional_image_url=img_bamboo,
                authenticity_score=95,
                visual_score=92,
                fair_price_index=9.3,
                rating=4.7
            ),
            Product(
                artisan_id=artisan_1.id,
                name="Artisan Beaded Terracotta & Brass Choker",
                category="Jewellery",
                material="Kiln-fired Clay Beads with Hand-beaten Brass Charms",
                description="Exquisite lightweight handcrafted choker celebrating tribal geometric motifs with antique matte brass accents.",
                production_cost=290.0,
                selling_price=529.0,
                available_quantity=20,
                image_url=img_jewel,
                enhanced_image_url=img_jewel,
                professional_image_url=img_jewel,
                authenticity_score=94,
                visual_score=91,
                fair_price_index=9.2,
                rating=4.8
            ),
            Product(
                artisan_id=artisan_5.id,
                name="Eco-Luxury Braided Jute & Leather Tote",
                category="Jute Crafts",
                material="Golden Bengal Jute Fiber with Vegan Leather Straps",
                description="High-tensile braided jute tote bag engineered for daily carrying, 100% biodegradable and water-resistant coated.",
                production_cost=260.0,
                selling_price=480.0,
                available_quantity=40,
                image_url=img_jute,
                enhanced_image_url=img_jute,
                professional_image_url=img_jute,
                authenticity_score=92,
                visual_score=90,
                fair_price_index=9.1,
                rating=4.6
            )
        ]

        db.add_all(products_data)
        db.commit()

        # Seed Orders showcasing every lifecycle status
        p1 = products_data[0] # Woodcraft
        p2 = products_data[1] # Terracotta
        p3 = products_data[2] # Metal

        orders_data = [
            Order(
                buyer_id=buyer_1.id,
                artisan_id=p1.artisan_id,
                courier_id=courier_1.id,
                product_id=p1.id,
                quantity=3,
                total_amount=1647.0,
                delivery_address="IndieCraft HQ, 100ft Road, Indiranagar, Bengaluru - 560038",
                status="Delivered",
                otp="1234"
            ),
            Order(
                buyer_id=buyer_1.id,
                artisan_id=p3.artisan_id,
                courier_id=courier_1.id,
                product_id=p3.id,
                quantity=1,
                total_amount=2499.0,
                delivery_address="IndieCraft HQ, 100ft Road, Indiranagar, Bengaluru - 560038",
                status="Shipped",
                otp="1234"
            ),
            Order(
                buyer_id=buyer_2.id,
                artisan_id=p2.artisan_id,
                courier_id=None,
                product_id=p2.id,
                quantity=2,
                total_amount=1378.0,
                delivery_address="Hegde Heritage Suites, Sampige Road, Malleshwaram, Bengaluru - 560003",
                status="Ready for Pickup",
                otp="1234"
            ),
            Order(
                buyer_id=buyer_1.id,
                artisan_id=p1.artisan_id,
                courier_id=None,
                product_id=p1.id,
                quantity=1,
                total_amount=549.0,
                delivery_address="14th Cross, Indiranagar, Bengaluru",
                status="Pending",
                otp="1234"
            )
        ]

        db.add_all(orders_data)
        db.commit()
        print("Database successfully pre-seeded with rich Indian artisan crafts and demo orders!")

    except Exception as e:
        print(f"Error during seeding: {e}")
        db.rollback()
    finally:
        db.close()
