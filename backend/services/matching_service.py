from typing import List, Dict, Any
from models import Product, Artisan, Buyer

def calculate_buyer_matches(
    buyer: Buyer, 
    products: List[Product],
    category: str = None,
    min_budget: float = None,
    max_budget: float = None,
    target_product: str = None,
    quantity_required: int = None
) -> List[Dict[str, Any]]:
    matches = []
    
    buyer_loc = (buyer.location or "").lower()
    buyer_b_min = min_budget if (min_budget is not None and min_budget > 0) else (buyer.budget_min or 100.0)
    buyer_b_max = max_budget if (max_budget is not None and max_budget > 0) else (buyer.budget_max or 10000.0)
    req_qty = quantity_required if (quantity_required is not None and quantity_required > 0) else (buyer.quantity_required or 10)
    pref_cat = (category.strip().lower() if category and category != "all" else None)
    target_keyword = (target_product.strip().lower() if target_product and target_product.strip() else None)
    
    for prod in products:
        artisan = prod.artisan
        if not artisan:
            continue

        prod_cat = (prod.category or "").strip().lower()
        prod_name = (prod.name or "").lower()
        prod_desc = (prod.description or "").lower()

        # If buyer specifically filtered by category, heavily prioritize or check match
        is_exact_category = False
        if pref_cat:
            if pref_cat in prod_cat or prod_cat in pref_cat:
                is_exact_category = True
            else:
                # Still allow but with low priority or skip if strict
                is_exact_category = False

        # Check target product keyword
        is_target_keyword_match = False
        if target_keyword:
            kw_tokens = target_keyword.split()
            if any(token in prod_name or token in prod_desc for token in kw_tokens if len(token) > 2):
                is_target_keyword_match = True

        # Score breakdown (0 to 100 total):
        # Base compatibility: 20
        # Category Fit: 30 pts (Exact match = 30, Unspecified = 15, Mismatch = 0)
        # Target Craft / Keyword Fit: 20 pts (Match = 20, Unspecified = 10, Mismatch = 0)
        # Budget Compatibility: 20 pts (Within min-max = 20, Affordable below max = 12, Above max = 2)
        # Capacity & Logistics: 10 pts
        score = 20.0

        # 1. Category Fit Bonus (0 - 30 pts)
        if pref_cat:
            if is_exact_category:
                score += 30.0
                category_fit_text = f"🎯 Exact category match ({prod.category})"
            else:
                score += 2.0
                category_fit_text = f"Alternative craft category ({prod.category})"
        else:
            score += 15.0
            category_fit_text = "Catalog craft category"

        # 2. Target Product Keyword Bonus (0 - 20 pts)
        if target_keyword:
            if is_target_keyword_match:
                score += 20.0
                product_fit_text = f"✨ Direct match for requested product '{target_product}'"
            else:
                score += 3.0
                product_fit_text = "Artisanal recommendation"
        else:
            score += 10.0
            product_fit_text = "Handcrafted artisan work"

        # 3. Budget Compatibility (0 - 20 pts)
        unit_price = prod.selling_price
        total_order_cost = unit_price * req_qty

        if buyer_b_min <= unit_price <= buyer_b_max:
            score += 20.0
            budget_fit = f"💰 Unit price ₹{int(unit_price)} comfortably inside your affordable budget [₹{int(buyer_b_min)} - ₹{int(buyer_b_max)}]"
        elif unit_price < buyer_b_min and total_order_cost <= buyer_b_max:
            score += 14.0
            budget_fit = f"💰 High-value affordable rate (₹{int(unit_price)}/unit, below budget ceiling)"
        elif unit_price <= (buyer_b_max * 1.15):
            score += 8.0
            budget_fit = f"Consignment value matches procurement bracket"
        else:
            score += 2.0
            budget_fit = f"Unit price ₹{int(unit_price)} exceeds preferred budget max of ₹{int(buyer_b_max)}"

        # 4. Quantity & Capacity Alignment (0 - 5 pts)
        artisan_capacity = artisan.production_capacity or 50
        available_qty = prod.available_quantity or 10
        if available_qty >= req_qty:
            score += 5.0
            capacity_fit = f"Ready stock ({available_qty} units) fulfills requirement ({req_qty})"
        elif artisan_capacity >= req_qty:
            score += 4.0
            capacity_fit = f"Artisan capacity ({artisan_capacity}/mo) covers demand"
        else:
            score += 2.0
            capacity_fit = "Batch split delivery recommended"

        # 5. Location & Logistics (0 - 5 pts)
        artisan_loc = (artisan.location or "").lower()
        if artisan_loc in buyer_loc or buyer_loc in artisan_loc or ("karnataka" in artisan_loc and "karnataka" in buyer_loc):
            score += 5.0
            loc_fit = "Express state-wide courier corridor"
        else:
            score += 3.0
            loc_fit = "Verified national craft corridor"

        # Cap score between 55% and 99%
        final_score = int(min(99, max(55, round(score))))

        # Build dynamic AI explanation
        ai_explanation = (
            f"AI Match {final_score}%: {category_fit_text}. {product_fit_text}. {budget_fit}. {capacity_fit}. {loc_fit}."
        )

        matches.append({
            "product_id": prod.id,
            "product_name": prod.name,
            "category": prod.category,
            "selling_price": prod.selling_price,
            "production_cost": prod.production_cost,
            "available_quantity": prod.available_quantity,
            "artisan_id": artisan.id,
            "artisan_name": artisan.name,
            "artisan_location": artisan.location,
            "image_url": prod.professional_image_url or prod.enhanced_image_url or prod.image_url,
            "match_score": final_score,
            "ai_explanation": ai_explanation,
            "authenticity_score": prod.authenticity_score or 95
        })

    # Sort descending by match score
    matches.sort(key=lambda x: x["match_score"], reverse=True)
    return matches

