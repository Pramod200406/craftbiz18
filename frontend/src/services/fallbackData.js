// Fallback Dataset for Static Hosting (GitHub Pages) & Offline Resilience
// Pre-seeded with authentic Indian crafts across 7 heritage categories

export const FALLBACK_ARTISANS = [
  {
    id: 1,
    name: 'Rameshwarappa Gowda',
    phone: '9876543210',
    language: 'hi',
    craft_type: 'Channapatna Wooden Toys & Lacquerware',
    location: 'Channapatna, Ramanagara, Karnataka',
    production_capacity: 45
  },
  {
    id: 2,
    name: 'Gouranga Sutradhar',
    phone: '9876543211',
    language: 'en',
    craft_type: 'Bankura Terracotta & Pottery',
    location: 'Panchmura, Bankura, West Bengal',
    production_capacity: 50
  },
  {
    id: 3,
    name: 'Abdul Rahim Bidri',
    phone: '9876543212',
    language: 'hi',
    craft_type: 'Bidri Metal Inlay',
    location: 'Bidar, Karnataka',
    production_capacity: 30
  },
  {
    id: 4,
    name: 'Devika Devi',
    phone: '9876543213',
    language: 'hi',
    craft_type: 'Handloom & Madhubani Silk',
    location: 'Madhubani, Bihar',
    production_capacity: 25
  },
  {
    id: 5,
    name: 'Shanti Murmu',
    phone: '9876543214',
    language: 'en',
    craft_type: 'Bamboo & Cane Craft',
    location: 'Baripada, Mayurbhanj, Odisha',
    production_capacity: 100
  }
];

export const FALLBACK_PRODUCTS = [
  {
    id: 1,
    artisan_id: 1,
    name: 'Channapatna Lacquerware Rocking Horse',
    category: 'Woodcraft',
    material: 'Ivory Wood (Wrightia Tinctoria) & Natural Vegetable Dyes',
    description: 'Classic 100% non-toxic handcrafted rocking horse toy crafted by Master Artisans of Channapatna with GI-certified traditional lacquerware finish.',
    production_cost: 320.0,
    selling_price: 549.0,
    available_quantity: 24,
    image_url: '/uploads/seed_woodcraft.jpg',
    enhanced_image_url: '/uploads/seed_woodcraft.jpg',
    professional_image_url: '/uploads/seed_woodcraft.jpg',
    authenticity_score: 98,
    visual_score: 95,
    fair_price_index: 9.6,
    rating: 4.9
  },
  {
    id: 2,
    artisan_id: 2,
    name: 'Bankura Terracotta Temple Horse',
    category: 'Terracotta',
    material: 'Alluvial Bankura Clay & Kiln Fired',
    description: 'Famous Panchmura terracotta horse featuring long erect neck and pointed ears, a timeless symbol of Indian folk art and architectural heritage.',
    production_cost: 380.0,
    selling_price: 689.0,
    available_quantity: 18,
    image_url: '/uploads/seed_terracotta.jpg',
    enhanced_image_url: '/uploads/seed_terracotta.jpg',
    professional_image_url: '/uploads/seed_terracotta.jpg',
    authenticity_score: 99,
    visual_score: 93,
    fair_price_index: 9.5,
    rating: 4.8
  },
  {
    id: 3,
    artisan_id: 3,
    name: 'Bidriware Pure Silver Inlay Royal Vase',
    category: 'Metal Crafts',
    material: 'Zinc & Copper Alloy Inlaid with 99.9% Pure Silver Sheet',
    description: 'Centuries-old Persian-Indian metal craft from Bidar. The jet-black oxidized patina contrasts dramatically with shining pure silver wire arabesque motifs.',
    production_cost: 1400.0,
    selling_price: 2499.0,
    available_quantity: 10,
    image_url: '/uploads/seed_metal.jpg',
    enhanced_image_url: '/uploads/seed_metal.jpg',
    professional_image_url: '/uploads/seed_metal.jpg',
    authenticity_score: 99,
    visual_score: 97,
    fair_price_index: 9.8,
    rating: 5.0
  },
  {
    id: 4,
    artisan_id: 4,
    name: 'Heritage Handloom Madhubani Silk Saree',
    category: 'Handloom',
    material: 'Tussar Silk with Natural Mineral Pigments',
    description: 'Hand-loomed natural Tussar silk woven on pit-looms, meticulously hand-painted with mythological Mithila wildlife and tree-of-life folklore.',
    production_cost: 1100.0,
    selling_price: 1890.0,
    available_quantity: 12,
    image_url: '/uploads/seed_handloom.jpg',
    enhanced_image_url: '/uploads/seed_handloom.jpg',
    professional_image_url: '/uploads/seed_handloom.jpg',
    authenticity_score: 97,
    visual_score: 94,
    fair_price_index: 9.4,
    rating: 4.9
  },
  {
    id: 5,
    artisan_id: 5,
    name: 'Hand-Woven Bamboo Pendant Lamp Shade',
    category: 'Bamboo Crafts',
    material: 'Seasoned Wild Bamboo Cane & Copper Fitting',
    description: 'Contemporary minimalist geometric lamp shade hand-split and woven by tribal artisans in Mayurbhanj, treated with natural boron salts for lifetime durability.',
    production_cost: 420.0,
    selling_price: 799.0,
    available_quantity: 35,
    image_url: '/uploads/seed_bamboo.jpg',
    enhanced_image_url: '/uploads/seed_bamboo.jpg',
    professional_image_url: '/uploads/seed_bamboo.jpg',
    authenticity_score: 95,
    visual_score: 92,
    fair_price_index: 9.3,
    rating: 4.7
  },
  {
    id: 6,
    artisan_id: 1,
    name: 'Artisan Beaded Terracotta & Brass Choker',
    category: 'Jewellery',
    material: 'Kiln-fired Clay Beads with Hand-beaten Brass Charms',
    description: 'Exquisite lightweight handcrafted choker celebrating tribal geometric motifs with antique matte brass accents.',
    production_cost: 290.0,
    selling_price: 529.0,
    available_quantity: 20,
    image_url: '/uploads/seed_jewellery.jpg',
    enhanced_image_url: '/uploads/seed_jewellery.jpg',
    professional_image_url: '/uploads/seed_jewellery.jpg',
    authenticity_score: 94,
    visual_score: 91,
    fair_price_index: 9.2,
    rating: 4.8
  },
  {
    id: 7,
    artisan_id: 5,
    name: 'Eco-Luxury Braided Jute & Leather Tote',
    category: 'Jute Crafts',
    material: 'Golden Bengal Jute Fiber with Vegan Leather Straps',
    description: 'High-tensile braided jute tote bag engineered for daily carrying, 100% biodegradable and water-resistant coated.',
    production_cost: 260.0,
    selling_price: 480.0,
    available_quantity: 40,
    image_url: '/uploads/seed_jute.jpg',
    enhanced_image_url: '/uploads/seed_jute.jpg',
    professional_image_url: '/uploads/seed_jute.jpg',
    authenticity_score: 92,
    visual_score: 90,
    fair_price_index: 9.1,
    rating: 4.6
  }
];

export const FALLBACK_BUYERS = [
  {
    id: 1,
    name: 'Anita Sharma',
    phone: '9123456780',
    language: 'en',
    business_name: 'IndieCraft Living & Boutiques',
    business_type: 'Retail & Export Emporium',
    location: 'Indiranagar, Bengaluru, Karnataka',
    quantity_required: 15,
    budget_min: 400.0,
    budget_max: 15000.0
  }
];

export const FALLBACK_COURIERS = [
  {
    id: 1,
    name: 'Suresh Kumar',
    phone: '9988776655',
    organization_name: 'DakSeva Craft Express Logistics',
    location: 'KSR Bengaluru Hub, Karnataka'
  }
];

export const FALLBACK_ORDERS = [
  {
    id: 1,
    buyer_id: 1,
    artisan_id: 1,
    courier_id: 1,
    product_id: 1,
    quantity: 3,
    total_amount: 1647.0,
    delivery_address: 'IndieCraft HQ, 100ft Road, Indiranagar, Bengaluru - 560038',
    status: 'Delivered',
    otp: '1234'
  },
  {
    id: 2,
    buyer_id: 1,
    artisan_id: 3,
    courier_id: 1,
    product_id: 3,
    quantity: 1,
    total_amount: 2499.0,
    delivery_address: 'IndieCraft HQ, 100ft Road, Indiranagar, Bengaluru - 560038',
    status: 'Shipped',
    otp: '1234'
  },
  {
    id: 3,
    buyer_id: 1,
    artisan_id: 2,
    courier_id: null,
    product_id: 2,
    quantity: 2,
    total_amount: 1378.0,
    delivery_address: 'Hegde Heritage Suites, Sampige Road, Malleshwaram, Bengaluru',
    status: 'Ready for Pickup',
    otp: '1234'
  },
  {
    id: 4,
    buyer_id: 1,
    artisan_id: 1,
    courier_id: null,
    product_id: 1,
    quantity: 1,
    total_amount: 549.0,
    delivery_address: '14th Cross, Indiranagar, Bengaluru',
    status: 'Pending',
    otp: '1234'
  }
];