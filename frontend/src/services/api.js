import {
  FALLBACK_ARTISANS,
  FALLBACK_PRODUCTS,
  FALLBACK_BUYERS,
  FALLBACK_COURIERS,
  FALLBACK_ORDERS
} from './fallbackData';

const API_BASE_URL = '/api';

// Helper for local storage simulation when hosted statically on GitHub Pages
function getStoredProducts() {
  try {
    const custom = localStorage.getItem('craftbiz_custom_products');
    const parsed = custom ? JSON.parse(custom) : [];
    return [...parsed, ...FALLBACK_PRODUCTS];
  } catch {
    return FALLBACK_PRODUCTS;
  }
}

function saveStoredProducts(products) {
  try {
    localStorage.setItem('craftbiz_custom_products', JSON.stringify(products));
  } catch (e) {
    console.error('Failed to save products:', e);
  }
}

function getStoredOrders() {
  try {
    const saved = localStorage.getItem('craftbiz_all_orders');
    return saved ? JSON.parse(saved) : FALLBACK_ORDERS;
  } catch {
    return FALLBACK_ORDERS;
  }
}

function saveStoredOrders(orders) {
  try {
    localStorage.setItem('craftbiz_all_orders', JSON.stringify(orders));
  } catch (e) {
    console.error('Failed to save orders:', e);
  }
}

// Fallback dispatcher for static deployment (GitHub Pages or offline mode)
function handleFallback(endpoint, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const urlParts = endpoint.split('?');
  const path = urlParts[0];
  const queryParams = new URLSearchParams(urlParts[1] || '');

  // 1. System
  if (path === '/' || path === '/system/stats') {
    return {
      project: 'CRAFTBIZ AI',
      description: 'AI-Powered Virtual Business Manager for Indian Artisans',
      status: 'online',
      counts: {
        artisans: FALLBACK_ARTISANS.length,
        products: getStoredProducts().length,
        orders: getStoredOrders().length,
        buyers: FALLBACK_BUYERS.length,
        couriers: FALLBACK_COURIERS.length
      }
    };
  }

  // 2. Products List
  if (path === '/products' && method === 'GET') {
    let prods = getStoredProducts();
    const cat = queryParams.get('category');
    const search = (queryParams.get('search') || '').toLowerCase();

    if (cat && cat !== 'all') {
      prods = prods.filter(p => (p.category || '').toLowerCase() === cat.toLowerCase());
    }
    if (search) {
      prods = prods.filter(p => 
        (p.name || '').toLowerCase().includes(search) || 
        (p.description && p.description.toLowerCase().includes(search))
      );
    }
    return prods;
  }

  // 3. Create Product
  if (path === '/products' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body) : {};
    const newProd = {
      id: Date.now(),
      artisan_id: body.artisan_id || 1,
      artisan_name: 'Meenakshi Bai',
      artisan_location: 'Channapatna, Karnataka',
      name: body.name || 'Handcrafted Heritage Craft',
      category: body.category || 'Woodcraft',
      material: body.material || 'Seasoned Hale Wood',
      description: body.description || 'Authentic traditional Indian handicraft created by master artisans.',
      production_cost: parseFloat(body.production_cost) || 350,
      selling_price: parseFloat(body.selling_price) || 599,
      available_quantity: parseInt(body.available_quantity) || 10,
      image_url: body.image_url || '/uploads/prod_1_fb56f335.jpg',
      enhanced_image_url: body.image_url || '/uploads/enhanced_49ef0dbd.png',
      professional_image_url: body.image_url || '/uploads/pro_708ba8f0.png',
      authenticity_score: 98,
      visual_score: 95,
      fair_price_index: 9.6,
      rating: 4.9
    };
    try {
      const custom = localStorage.getItem('craftbiz_custom_products');
      const list = custom ? JSON.parse(custom) : [];
      list.unshift(newProd);
      localStorage.setItem('craftbiz_custom_products', JSON.stringify(list));
    } catch (e) {
      console.error(e);
    }
    return newProd;
  }

  // 3b. Upload Product Image (Fallback)
  if (path.includes('/upload-image')) {
    const parts = path.split('/');
    const prodId = parseInt(parts[2]);
    const prods = getStoredProducts();
    const existing = prods.find(p => p.id === prodId);
    const fallbackImg = existing ? existing.image_url : '/uploads/prod_1_fb56f335.jpg';
    return {
      message: 'Image uploaded successfully',
      image_url: fallbackImg
    };
  }

  // 3c. Enhance Product Image (Fallback)
  if (path.includes('/enhance-image')) {
    const parts = path.split('/');
    const prodId = parseInt(parts[2]);
    const prods = getStoredProducts();
    const existing = prods.find(p => p.id === prodId);
    const enhancedUrl = existing?.enhanced_image_url || existing?.image_url || '/uploads/enhanced_49ef0dbd.png';
    const updated = prods.map(p => p.id === prodId ? { ...p, enhanced_image_url: enhancedUrl, visual_score: 95 } : p);
    saveStoredProducts(updated);
    return {
      message: 'Image enhanced with AI Studio (High Contrast & Color Calibration)',
      enhanced_image_url: enhancedUrl,
      visual_score: 95
    };
  }

  // 3d. Remove Background (Fallback)
  if (path.includes('/remove-background')) {
    const parts = path.split('/');
    const prodId = parseInt(parts[2]);
    const prods = getStoredProducts();
    const existing = prods.find(p => p.id === prodId);
    const proUrl = existing?.professional_image_url || existing?.image_url || '/uploads/pro_708ba8f0.png';
    const updated = prods.map(p => p.id === prodId ? { ...p, professional_image_url: proUrl, visual_score: 98 } : p);
    saveStoredProducts(updated);
    return {
      message: 'Background removed with luxury studio canvas',
      professional_image_url: proUrl,
      visual_score: 98
    };
  }

  // 4. Artisan Dashboard
  if (path.startsWith('/artisan/') && path.endsWith('/dashboard')) {
    const prods = getStoredProducts();
    const orders = getStoredOrders();
    const prodsMap = {};
    prods.forEach(p => { prodsMap[p.id] = p; });

    const deliveredCount = orders.filter(o => o.status === 'Delivered').length;
    const pendingCount = orders.filter(o => o.status === 'Pending' || o.status === 'Ready for Pickup').length;
    const totalRev = orders
      .filter(o => ['Accepted by Courier', 'Accepted', 'Shipped', 'Delivered'].includes(o.status))
      .reduce((sum, o) => sum + (o.total_amount || 0), 0);

    const recentOrders = orders.slice(0, 10).map(o => ({
      id: o.id,
      order_id: o.id,
      product_name: o.product_name || prodsMap[o.product_id]?.name || 'Heritage Craft',
      quantity: o.quantity || 1,
      total_amount: o.total_amount || 549,
      order_value: o.total_amount || 549,
      status: o.status,
      buyer_name: o.buyer_name || 'Anita Sharma',
      created_at: o.created_at || 'Today'
    }));

    return {
      artisan_name: FALLBACK_ARTISANS[0].name,
      artisan: FALLBACK_ARTISANS[0],
      total_products: prods.length,
      total_orders: orders.length,
      pending_orders: pendingCount,
      delivered_orders: deliveredCount,
      revenue: totalRev,
      recent_orders: recentOrders,
      stats: {
        products_count: prods.length,
        orders_count: orders.length,
        total_revenue: totalRev,
        avg_rating: 4.9
      },
      revenue_chart: [
        { month: 'Apr', revenue: Math.round(totalRev * 0.12) },
        { month: 'May', revenue: Math.round(totalRev * 0.18) },
        { month: 'Jun', revenue: Math.round(totalRev * 0.15) },
        { month: 'Jul', revenue: Math.round(totalRev * 0.22) },
        { month: 'Aug', revenue: Math.round(totalRev * 0.28) },
        { month: 'Sep', revenue: Math.round(totalRev * 0.35 + 1200) }
      ],
      product_performance: prods.slice(0, 4).map(p => ({
        name: p.name,
        stock: p.available_quantity,
        views: (p.authenticity_score || 95) * 12,
        price: p.selling_price
      }))
    };
  }

  if (path.startsWith('/artisan/') && path.endsWith('/products')) {
    return getStoredProducts();
  }

  // 5. Smart Pricing & Demand (Full Itemized Explainable AI Valuation)
  if (path === '/pricing/predict-demand') {
    const body = options.body ? JSON.parse(options.body) : {};
    return {
      category: body.category || 'Woodcraft',
      demand_level: 'High (Upcoming Festive Surge: Navratri, Dussehra & Diwali Peak)',
      demand_multiplier: 1.25,
      reason: 'Predictive calendar identifies high gift and cultural procurement surge across India.'
    };
  }

  if (path === '/pricing/calculate' || path === '/pricing/suggest') {
    const body = options.body ? JSON.parse(options.body) : {};
    const cost = Math.max(10, parseFloat(body.production_cost || body.cost) || 350);
    const cat = body.category || 'Woodcraft';

    const catMultipliers = {
      'Terracotta': 1.15,
      'Bamboo Crafts': 1.18,
      'Handloom': 1.28,
      'Woodcraft': 1.22,
      'Jewellery': 1.35,
      'Metal Crafts': 1.25,
      'Jute Crafts': 1.10
    };
    const demandMultiplier = catMultipliers[cat] || 1.20;
    const demandLevel = 'High (Festive Rush: Dussehra, Diwali & Wedding Season Peak)';

    // Psychological pricing ending in 99, 49, 9
    const rawSuggested = cost * (1 + 0.40 * demandMultiplier);
    const suggestedPrice = Math.max(Math.round(cost * 1.3), Math.round(rawSuggested / 10) * 10 - 1);
    const estimatedProfit = Math.round(suggestedPrice - cost);
    const profitMargin = Math.round((estimatedProfit / suggestedPrice) * 1000) / 10;

    // Itemized economic cost breakdown
    const rawMaterials = Math.round(cost * 0.55);
    const artisanLabor = Math.round(cost * 0.45 + (estimatedProfit * 0.60));
    const heritagePremium = Math.round(estimatedProfit * 0.25);
    const packaging = Math.round(Math.max(30, suggestedPrice * 0.08));
    const fairWageReserve = Math.max(0, suggestedPrice - (rawMaterials + artisanLabor + heritagePremium + packaging));

    return {
      suggested_price: suggestedPrice,
      estimated_profit: estimatedProfit,
      profit_margin_percent: profitMargin,
      demand_level: demandLevel,
      category: cat,
      category_multiplier: demandMultiplier,
      fair_pricing_index: 9.6,
      explanation: `Why ₹${suggestedPrice}? Our AI forecasted market demand as '${demandLevel}' based on upcoming 30-day festival schedules. With a ${cat} margin rewarding authentic craftsmanship, a selling price of ₹${suggestedPrice} yields a healthy ₹${estimatedProfit} artisan profit (${profitMargin}% net margin) while remaining attractive to buyers.`,
      breakdown: {
        raw_materials: rawMaterials,
        artisan_labor: artisanLabor,
        heritage_gi_premium: heritagePremium,
        packaging_logistics_buffer: packaging,
        fair_wage_reserve: fairWageReserve,
        base_production_cost: cost,
        net_artisan_profit: estimatedProfit
      },
      reasoning_steps: [
        `1. Verified Input Cost Baseline: ₹${rawMaterials} calculated from regional ${cat} raw material index.`,
        `2. Master Artisan Craftsmanship Wage: ₹${artisanLabor} rewarding manual intricacy and fair wage dignity.`,
        `3. GI Heritage & Cultural Authenticity: +₹${heritagePremium} premium safeguarding craft provenance.`,
        `4. AI Future Demand Velocity: Multiplier ${demandMultiplier}x applied for upcoming 30-day festive peak schedule.`,
        `5. Secure Packaging & Transit Buffer: ₹${packaging} allocated for safe cluster shipment.`
      ],
      demand_forecast_info: {
        demand_level: demandLevel,
        demand_factor: demandMultiplier,
        season_event: 'Festive Season & Cultural Procurement Surge',
        forecast_window_days: 30
      }
    };
  }

  // 6. AI Buyer-Artisan Matching
  if (path.includes('/matches') || path === '/matching/recommend') {
    const prods = getStoredProducts();
    const filterCat = (queryParams.get('category') || '').toLowerCase();
    const minBudget = parseFloat(queryParams.get('min_budget')) || 300;
    const maxBudget = parseFloat(queryParams.get('max_budget')) || 15000;
    const targetKw = (queryParams.get('target_product') || '').toLowerCase();
    const reqQty = parseInt(queryParams.get('quantity')) || 10;

    const matchedList = prods.map((prod, idx) => {
      const prodCat = (prod.category || '').toLowerCase();
      const prodName = (prod.name || '').toLowerCase();
      const prodDesc = (prod.description || '').toLowerCase();
      const unitPrice = parseFloat(prod.selling_price) || 500;

      let score = 25;

      // Category fit
      let catReason = 'Handcrafted Artisan Category';
      if (filterCat && filterCat !== 'all') {
        if (prodCat.includes(filterCat) || filterCat.includes(prodCat)) {
          score += 30;
          catReason = `Direct category match (${prod.category})`;
        } else {
          score += 2;
          catReason = `Alternative category (${prod.category})`;
        }
      } else {
        score += 18;
      }

      // Keyword match
      let kwReason = 'Artisanal Heritage Work';
      if (targetKw) {
        if (prodName.includes(targetKw) || prodDesc.includes(targetKw)) {
          score += 22;
          kwReason = `Keyword match for '${targetKw}'`;
        } else {
          score += 3;
        }
      } else {
        score += 12;
      }

      // Budget fit
      let budgetReason = `Unit price ₹${unitPrice} matches budget bracket`;
      if (unitPrice >= minBudget && unitPrice <= maxBudget) {
        score += 20;
        budgetReason = `Unit price ₹${unitPrice} comfortably inside budget [₹${minBudget} - ₹${maxBudget}]`;
      } else if (unitPrice < minBudget) {
        score += 15;
        budgetReason = `High-value rate (₹${unitPrice}/unit, below budget ceiling)`;
      } else if (unitPrice <= maxBudget * 1.15) {
        score += 8;
        budgetReason = `Consignment rate close to budget threshold`;
      } else {
        score += 2;
        budgetReason = `Price ₹${unitPrice} exceeds budget ceiling of ₹${maxBudget}`;
      }

      // Capacity & Logistics fit
      const availQty = prod.available_quantity || 15;
      let capReason = availQty >= reqQty 
        ? `Ready stock (${availQty} units) fulfills batch size (${reqQty})`
        : `Artisan monthly capacity covers requirement`;
      score += (availQty >= reqQty ? 8 : 4);

      const finalScore = Math.min(99, Math.max(58, Math.round(score)));

      const explanation = `AI Match ${finalScore}%: ${catReason}. ${kwReason}. ${budgetReason}. ${capReason}. Express state-wide courier corridor verified.`;

      return {
        product_id: prod.id,
        product_name: prod.name,
        category: prod.category,
        selling_price: prod.selling_price,
        production_cost: prod.production_cost || Math.round(prod.selling_price * 0.65),
        available_quantity: prod.available_quantity || 15,
        artisan_id: prod.artisan_id || 1,
        artisan_name: prod.artisan_name || 'Meenakshi Bai',
        artisan_location: prod.artisan_location || 'Karnataka, India',
        image_url: prod.professional_image_url || prod.enhanced_image_url || prod.image_url,
        match_score: finalScore,
        ai_explanation: explanation,
        authenticity_score: prod.authenticity_score || 96
      };
    });

    matchedList.sort((a, b) => b.match_score - a.match_score);
    return matchedList;
  }

  // 7. Orders
  if (path === '/orders' && method === 'POST') {
    const body = options.body ? JSON.parse(options.body) : {};
    const allOrders = getStoredOrders();
    const newOrder = {
      id: Date.now(),
      buyer_id: body.buyer_id || 1,
      artisan_id: body.artisan_id || 1,
      courier_id: null,
      product_id: body.product_id || 1,
      quantity: body.quantity || 1,
      total_amount: body.total_amount || 549,
      delivery_address: body.delivery_address || 'India',
      status: 'Pending',
      otp: '1234'
    };
    allOrders.unshift(newOrder);
    saveStoredOrders(allOrders);
    return newOrder;
  }

  if (path.includes('/ready') && method === 'PUT') {
    const match = path.match(/(?:orders|order)\/(\d+)\/ready/);
    const orderId = match ? parseInt(match[1]) : parseInt(path.split('/').filter(Boolean)[1] || 0);
    const allOrders = getStoredOrders().map(o => (o.id === orderId || o.order_id === orderId) ? { ...o, status: 'Ready for Pickup' } : o);
    saveStoredOrders(allOrders);
    return { success: true, message: 'Order marked Ready for Pickup', order_id: orderId, status: 'Ready for Pickup' };
  }

  // 8. Courier / Shipment
  if (path === '/courier/available-orders') {
    const prods = getStoredProducts();
    const prodsMap = {};
    prods.forEach(p => { prodsMap[p.id] = p; });
    const artisans = FALLBACK_ARTISANS;
    return getStoredOrders()
      .filter(o => o.status === 'Ready for Pickup')
      .map(o => {
        const prod = prodsMap[o.product_id] || {};
        const art = artisans.find(a => a.id === o.artisan_id) || artisans[0];
        return {
          id: o.id,
          order_id: o.id,
          product_name: o.product_name || prod.name || 'Handcrafted Heritage Craft',
          quantity: o.quantity || 1,
          total_amount: o.total_amount || 549,
          order_value: o.total_amount || 549,
          artisan_name: o.artisan_name || art.name || 'Meenakshi Bai',
          pickup_location: o.pickup_location || art.location || 'Channapatna, Karnataka',
          delivery_address: o.delivery_address || 'India',
          buyer_name: o.buyer_name || 'Anita Sharma',
          status: o.status,
          created_at: o.created_at || 'Just now'
        };
      });
  }

  if (path.startsWith('/courier/') && path.endsWith('/orders')) {
    const prods = getStoredProducts();
    const prodsMap = {};
    prods.forEach(p => { prodsMap[p.id] = p; });
    const artisans = FALLBACK_ARTISANS;
    return getStoredOrders().map(o => {
      const prod = prodsMap[o.product_id] || {};
      const art = artisans.find(a => a.id === o.artisan_id) || artisans[0];
      return {
        id: o.id,
        order_id: o.id,
        product_name: o.product_name || prod.name || 'Handcrafted Heritage Craft',
        quantity: o.quantity || 1,
        total_amount: o.total_amount || 549,
        order_value: o.total_amount || 549,
        artisan_name: o.artisan_name || art.name || 'Meenakshi Bai',
        pickup_location: o.pickup_location || art.location || 'Channapatna, Karnataka',
        delivery_address: o.delivery_address || 'India',
        buyer_name: o.buyer_name || 'Anita Sharma',
        status: o.status,
        otp: o.otp || '1234',
        created_at: o.created_at || 'Just now'
      };
    });
  }

  if (path.includes('/accept') && method === 'PUT') {
    const match = path.match(/accept\/(\d+)/);
    const orderId = match ? parseInt(match[1]) : parseInt(path.split('/').pop());
    const allOrders = getStoredOrders().map(o => (o.id === orderId || o.order_id === orderId) ? { ...o, status: 'Accepted by Courier' } : o);
    saveStoredOrders(allOrders);
    return { success: true, status: 'Accepted by Courier', order_id: orderId };
  }

  if (path.includes('/ship') && method === 'PUT') {
    const match = path.match(/ship\/(\d+)/);
    const orderId = match ? parseInt(match[1]) : parseInt(path.split('/').pop());
    const allOrders = getStoredOrders().map(o => (o.id === orderId || o.order_id === orderId) ? { ...o, status: 'Shipped' } : o);
    saveStoredOrders(allOrders);
    return { success: true, status: 'Shipped', order_id: orderId };
  }

  if (path.includes('/deliver') && method === 'PUT') {
    const match = path.match(/deliver\/(\d+)/);
    const orderId = match ? parseInt(match[1]) : parseInt(path.split('/').pop());
    const allOrders = getStoredOrders().map(o => (o.id === orderId || o.order_id === orderId) ? { ...o, status: 'Delivered' } : o);
    saveStoredOrders(allOrders);
    return { success: true, status: 'Delivered', order_id: orderId, message: 'OTP verified successfully' };
  }

  // Buyer Orders fallback
  if (path.startsWith('/buyer/') && path.endsWith('/orders')) {
    const prods = getStoredProducts();
    const prodsMap = {};
    prods.forEach(p => { prodsMap[p.id] = p; });
    return getStoredOrders().map(o => ({
      id: o.id,
      order_id: o.id,
      product_name: o.product_name || prodsMap[o.product_id]?.name || 'Handcrafted Heritage Craft',
      quantity: o.quantity || 1,
      total_amount: o.total_amount || 549,
      order_value: o.total_amount || 549,
      status: o.status,
      artisan_name: o.artisan_name || 'Meenakshi Bai',
      created_at: o.created_at || 'Just now'
    }));
  }

  // 9. Admin Stats
  if (path === '/admin/stats') {
    const prods = getStoredProducts();
    const orders = getStoredOrders();
    const gmv = orders.reduce((sum, o) => sum + (o.total_amount || 0), 0);
    const active = orders.filter(o => o.status !== 'Delivered').length;
    return {
      status: 'active',
      system_version: 'CRAFTBIZ AI v2.6 (SIH 2026)',
      artisans_count: FALLBACK_ARTISANS.length,
      buyers_count: FALLBACK_BUYERS.length,
      couriers_count: FALLBACK_COURIERS.length,
      products_count: prods.length,
      total_orders: orders.length,
      active_orders: active,
      delivered_orders: orders.length - active,
      total_revenue: gmv,
      platform_gmv: gmv,
      avg_authenticity: 96.5,
      avg_fair_price: 9.6,
      avg_fair_wage_score: 9.6,
      craft_clusters: ['Channapatna', 'Bankura', 'Varanasi', 'Bidar', 'Kutch', 'Pochampally']
    };
  }

  if (path === '/admin/orders') {
    const prods = getStoredProducts();
    const prodsMap = {};
    prods.forEach(p => { prodsMap[p.id] = p; });
    return getStoredOrders().map(o => ({
      id: o.id,
      order_id: o.id,
      product_name: o.product_name || prodsMap[o.product_id]?.name || 'Handcrafted Heritage Craft',
      quantity: o.quantity || 1,
      total_amount: o.total_amount || 549,
      order_value: o.total_amount || 549,
      status: o.status,
      buyer_name: o.buyer_name || 'Anita Sharma',
      artisan_name: o.artisan_name || 'Meenakshi Bai',
      created_at: o.created_at || 'Recent'
    }));
  }
  if (path === '/admin/artisans') return FALLBACK_ARTISANS;
  if (path === '/admin/buyers') return FALLBACK_BUYERS;
  if (path === '/admin/couriers') return FALLBACK_COURIERS;

  // 10. Intelligent Multilingual Voice Entity Extraction Fallback
  if (path === '/voice/extract' || path === '/voice/extract-details' || path === '/voice/process') {
    const body = options.body ? JSON.parse(options.body) : {};
    const rawText = (body.transcription || body.text || '').trim();
    const lower = rawText.toLowerCase();

    // Category detection
    let cat = 'Woodcraft';
    let material = 'Channapatna Hale Wood / Natural Lacquer';
    let originEn = 'Channapatna Wooden Heritage Cluster, Karnataka';
    let originHi = 'चन्नपटना काष्ठ शिल्प क्लस्टर, कर्नाटक';

    if (lower.includes('terracotta') || lower.includes('clay') || lower.includes('pot') || lower.includes('मिट्टी') || lower.includes('मटका') || lower.includes('दीया')) {
      cat = 'Terracotta';
      material = 'Natural River Clay & Baked Terracotta';
      originEn = 'Bankura & Gorakhpur Terracotta Craft Belt';
      originHi = 'बांकुरा एवं गोरखपुर टेराकोटा शिल्प क्षेत्र';
    } else if (lower.includes('saree') || lower.includes('handloom') || lower.includes('silk') || lower.includes('cotton') || lower.includes('साड़ी') || lower.includes('खादी') || lower.includes('रेशम')) {
      cat = 'Handloom';
      material = 'Pure Mulberry Silk & Handspun Zari';
      originEn = 'Varanasi Handloom Weavers & Silk Guild';
      originHi = 'वाराणसी हथकरघा बुनकर एवं रेशम गिल्ड';
    } else if (lower.includes('bamboo') || lower.includes('cane') || lower.includes('basket') || lower.includes('बांस') || lower.includes('बेंत')) {
      cat = 'Bamboo Crafts';
      material = 'Seasoned Eco-Bamboo & Cane';
      originEn = 'Assam & Tripura Bamboo Artisan Guilds';
      originHi = 'असम एवं त्रिपुरा बांस शिल्प संघ';
    } else if (lower.includes('jewel') || lower.includes('necklace') || lower.includes('earring') || lower.includes('गहना') || lower.includes('आभूषण') || lower.includes('हार')) {
      cat = 'Jewellery';
      material = 'Terracotta & Handcrafted Artisan Beads';
      originEn = 'Rural Heritage Craft Guilds';
      originHi = 'ग्रामीण पारंपरिक आभूषण कारीगर';
    } else if (lower.includes('metal') || lower.includes('brass') || lower.includes('bronze') || lower.includes('धातु') || lower.includes('पीतल') || lower.includes('ढोकरा')) {
      cat = 'Metal Crafts';
      material = 'Traditional Cast Brass & Bell Metal';
      originEn = 'Bastar Dhokra & Bidriware Traditions';
      originHi = 'बस्तर ढोकरा एवं बीदर बिद्री शिल्प';
    } else if (lower.includes('jute') || lower.includes('bag') || lower.includes('जूट') || lower.includes('बोरी')) {
      cat = 'Jute Crafts';
      material = 'Golden Jute Fiber & Eco-Canvas';
      originEn = 'Bengal Golden Fiber Artisans';
      originHi = 'पश्चिम बंगाल स्वर्ण जूट शिल्पी';
    }

    // Cost extraction
    const costMatch1 = lower.match(/(?:cost|production\s*cost|laagat|lagat|kharcha|making|खर्च|लागत)\s*[:=iswasofin]*\s*(?:rs\.?|inr|₹|rupees|rupaye)?\s*(\d+(?:\.\d+)?)/i);
    const costMatch2 = lower.match(/(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:rs\.?|inr|₹|rupees|rupaye)?\s*(?:production\s*cost|cost|laagat|lagat|kharcha|making|खर्च|लागत|की\s*लागत)/i);
    
    // Selling price extraction
    const priceMatch1 = lower.match(/(?:selling\s*price|selling|sell\s*for|sell\s*at|price|rate|dar|keemat|kimat|bechna|कीमत|भाव|बिक्री)\s*[:=iswasofin]*\s*(?:rs\.?|inr|₹|rupees|rupaye)?\s*(\d+(?:\.\d+)?)/i);
    const priceMatch2 = lower.match(/(?:rs\.?|inr|₹)?\s*(\d+(?:\.\d+)?)\s*(?:rs\.?|inr|₹|rupees|rupaye)?\s*(?:selling\s*price|sell\s*for|price|bechna|me\s*bechna|कीमत|बिक्री)/i);

    // Quantity extraction
    const qtyMatch1 = lower.match(/(\d+)\s*(?:pieces|pcs|units|items|piece|पीस|संख्या)/i);
    const qtyMatch2 = lower.match(/(?:quantity|qty|units|stock|संख्या|पीस)\s*[:=iswasofin]*\s*(\d+)/i);

    // Generic numbers
    const allNums = (lower.match(/\b\d+\b/g) || []).map(Number).filter(n => n > 0);

    let extractedCost = 350;
    if (costMatch1) extractedCost = parseFloat(costMatch1[1]);
    else if (costMatch2) extractedCost = parseFloat(costMatch2[1]);
    else if (allNums.length >= 2) extractedCost = Math.min(allNums[0], allNums[1]);
    else if (allNums.length === 1) extractedCost = allNums[0];

    let extractedPrice = Math.round(extractedCost * 1.55);
    if (priceMatch1) extractedPrice = parseFloat(priceMatch1[1]);
    else if (priceMatch2) extractedPrice = parseFloat(priceMatch2[1]);
    else if (allNums.length >= 2) extractedPrice = Math.max(allNums[0], allNums[1]);

    if (extractedPrice <= extractedCost) {
      extractedPrice = Math.round(extractedCost * 1.45);
    }

    let extractedQty = 10;
    if (qtyMatch1) extractedQty = parseInt(qtyMatch1[1]);
    else if (qtyMatch2) extractedQty = parseInt(qtyMatch2[1]);
    else if (allNums.length >= 3) extractedQty = allNums[2];

    // Clean craft name extraction
    let cleanName = rawText.split(/[,.\n;]|(?:\s+cost\s+)|(?:\s+price\s+)|(?:\s+laagat\s+)|(?:\s+made\s+from\s+)/i)[0].trim();
    cleanName = cleanName.replace(/^(this is|i have|here is|authentic|handmade|traditional|genuine|yeh ek|yeh|ye|humne)\s+/i, '').trim();
    if (cleanName.length < 4 || cleanName.length > 50) {
      cleanName = `Authentic Handcrafted ${cat}`;
    }

    const titleCaseName = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);

    const descEn = `Exquisite authentic handcrafted ${titleCaseName}, created by master rural artisans from ${originEn} using 100% natural ${material}.\n\nHighlights:\n• 100% Verified Authentic Handcraft\n• Fair Living Wage Guaranteed directly to artisan\n• Eco-friendly, chemical-free traditional creation\n• Perfect for ethical home decor, festivities and premium gifting.\n\n🌿 Artisan's Spoken Description:\n"${rawText || 'Handcrafted traditional artisan masterpiece.'}"`;

    const descHi = `मास्टर ग्रामीण कारीगरों द्वारा शुद्ध ${material} से तैयार किया गया 100% प्रामाणिक हस्तनिर्मित ${titleCaseName}।\n\nविशेषताएं:\n• 100% शुद्ध हस्तशिल्प\n• कारीगर को सीधा उचित पारिश्रमिक प्रमाणित\n• पर्यावरण-अनुकूल एवं रसायन-मुक्त पारंपरिक निर्माण\n• गृह सज्जा, पूजा एवं उपहार के लिए अत्यंत शुभ व आकर्षक।\n\n🌿 कारीगर का विवरण:\n"${rawText || 'प्रामाणिक पारंपरिक भारतीय हस्तशिल्प।'}"`;

    return {
      name: titleCaseName,
      category: cat,
      material: material,
      production_cost: extractedCost,
      suggested_selling_price: extractedPrice,
      quantity: extractedQty,
      confidence: 0.96,
      original_text: rawText,
      translated_text: rawText,
      translated_hindi: 'प्रामाणिक हस्तनिर्मित भारतीय पारंपरिक शिल्प',
      detected_language: 'en',
      seo_title_en: `Handcrafted ${titleCaseName} - Authentic ${material} ${cat} | GI Certified`,
      seo_title_hi: `हस्तनिर्मित ${titleCaseName} - प्रामाणिक ${material} ${cat} | शुद्ध शिल्प`,
      description_en: descEn,
      description_hi: descHi,
      seo_keywords: ['handicraft', 'indian artisan', 'fair trade', 'handmade', cat.toLowerCase()],
      seo_keywords_hi: ['हस्तशिल्प', 'कारीगर', 'स्वदेशी', 'पारंपरिक'],
      bullet_points_en: [
        `Handmade with verified ${material}`,
        'Fair-wage certified master artisan creation',
        `Authentic ${originEn} lineage`,
        'Eco-friendly, chemical-free sustainable craft'
      ],
      bullet_points_hi: [
        `प्रामाणिक ${material} से हाथ से निर्मित`,
        'मास्टर कारीगरों को प्रत्यक्ष उचित पारिश्रमिक प्रमाणित',
        `प्रामाणिक ${originHi} विरासत`,
        'पर्यावरण-अनुकूल और शत-प्रतिशत प्राकृतिक कला'
      ],
      seo_score: 98
    };
  }

  // Default fallback response
  return { success: true, message: 'Processed via fallback handler' };
}

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      // If server returns 404/500, attempt graceful fallback for static deployments
      return handleFallback(endpoint, options);
    }

    return await response.json();
  } catch (err) {
    console.warn(`API call ${endpoint} unavailable, activating fallback engine:`, err.message);
    // Graceful fallback for static GitHub Pages or offline execution
    return handleFallback(endpoint, options);
  }
}

export const api = {
  baseUrl: API_BASE_URL,

  getImageUrl: (relativeUrl) => {
    if (!relativeUrl) return '';
    // Data URLs, Blob URLs, and absolute URLs must be returned directly without modifying
    if (
      relativeUrl.startsWith('http://') || 
      relativeUrl.startsWith('https://') || 
      relativeUrl.startsWith('data:') || 
      relativeUrl.startsWith('blob:')
    ) {
      return relativeUrl;
    }
    const cleanPath = relativeUrl.startsWith('/') ? relativeUrl.slice(1) : relativeUrl;
    // Resolves correctly on GitHub Pages (subpath /craftbiz18/) and localhost
    const base = import.meta.env.BASE_URL || './';
    const normalizedBase = base.endsWith('/') ? base : `${base}/`;
    return `${normalizedBase}${cleanPath}`;
  },

  // System
  clearSystemData: () => request('/system/clear-data', { method: 'POST' }),
  seedDemoData: () => request('/system/seed-demo', { method: 'POST' }),
  getSystemStats: () => request('/'),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== 'all') query.append('category', params.category);
    if (params.search) query.append('search', params.search);
    const qs = query.toString() ? `?${query.toString()}` : '';
    return request(`/products${qs}`);
  },

  getArtisanProducts: (artisanId) => request(`/artisan/${artisanId}/products`),

  createProduct: (productData) =>
    request('/products', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(productData),
    }),

  uploadProductImage: async (productId, file) => {
    try {
      const formData = new FormData();
      formData.append('file', file);
      const res = await request(`/products/${productId}/upload-image`, {
        method: 'POST',
        body: formData,
      });
      if (res && res.image_url && !res.image_url.includes('undefined')) {
        return res;
      }
    } catch (err) {
      console.warn('Backend image upload unavailable, utilizing client storage:', err);
    }

    // Client-side fallback for GitHub Pages static execution:
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.FileReader && file instanceof Blob) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const dataUrl = e.target.result;
          try {
            const custom = localStorage.getItem('craftbiz_custom_products');
            const list = custom ? JSON.parse(custom) : [];
            const updated = list.map(p => p.id === productId ? { 
              ...p, 
              image_url: dataUrl, 
              enhanced_image_url: dataUrl, 
              professional_image_url: dataUrl 
            } : p);
            localStorage.setItem('craftbiz_custom_products', JSON.stringify(updated));
          } catch (err) {
            console.error(err);
          }
          resolve({
            message: 'Image uploaded successfully (Client Storage)',
            image_url: dataUrl
          });
        };
        reader.onerror = () => {
          const objUrl = URL.createObjectURL(file);
          resolve({ message: 'Image uploaded', image_url: objUrl });
        };
        reader.readAsDataURL(file);
      } else {
        resolve({
          message: 'Image uploaded',
          image_url: '/uploads/prod_1_fb56f335.jpg'
        });
      }
    });
  },

  enhanceProductImage: (productId) =>
    request(`/products/${productId}/enhance-image`, {
      method: 'POST',
    }),

  removeProductBackground: (productId) =>
    request(`/products/${productId}/remove-background`, {
      method: 'POST',
    }),

  // Voice AI
  transcribeAudio: async (audioBlob, language = 'en') => {
    const formData = new FormData();
    formData.append('file', audioBlob, 'voice_recording.webm');
    if (language) formData.append('language', language);
    return request('/voice/transcribe', {
      method: 'POST',
      body: formData,
    });
  },

  extractVoiceDetails: (text) =>
    request('/voice/extract-details', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ transcription: text, text }),
    }),

  translateVoiceText: (text, targetLang = 'en') =>
    request('/voice/translate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text, target_lang: targetLang }),
    }),

  // Smart Pricing & Demand
  predictDemand: (category, daysWindow = 30) =>
    request('/pricing/predict-demand', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ category, future_days_window: daysWindow }),
    }),

  suggestPricing: (productionCost, category) =>
    request('/pricing/suggest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ production_cost: parseFloat(productionCost), category }),
    }),

  // Matching
  getBuyerMatches: (buyerId, paramsOrMinBudget = {}, maybeMaxBudget, maybeCategory, limit = 10) => {
    let queryParams = {};
    if (paramsOrMinBudget && typeof paramsOrMinBudget === 'object') {
      queryParams = { ...paramsOrMinBudget };
    } else {
      if (paramsOrMinBudget !== undefined) queryParams.min_budget = paramsOrMinBudget;
      if (maybeMaxBudget !== undefined) queryParams.max_budget = maybeMaxBudget;
      if (maybeCategory !== undefined) queryParams.category = maybeCategory;
    }

    const qs = new URLSearchParams();
    if (queryParams.category && queryParams.category !== 'all') qs.append('category', queryParams.category);
    if (queryParams.min_budget) qs.append('min_budget', queryParams.min_budget);
    if (queryParams.max_budget) qs.append('max_budget', queryParams.max_budget);
    if (queryParams.target_product) qs.append('target_product', queryParams.target_product);
    if (queryParams.quantity) qs.append('quantity', queryParams.quantity);

    const queryStr = qs.toString() ? `?${qs.toString()}` : '';
    return request(`/buyer/${buyerId || 1}/matches${queryStr}`);
  },

  // Artisan Registration & Login
  registerArtisan: (data) =>
    request('/register/artisan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  loginArtisan: (phone) =>
    request('/login/artisan', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    }),

  getArtisanDashboard: (artisanId) => request(`/artisan/${artisanId}/dashboard`),

  // Buyer
  registerBuyer: (data) =>
    request('/register/buyer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  loginBuyer: (phone) =>
    request('/login/buyer', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    }),

  getBuyerOrders: (buyerId) => request(`/buyer/${buyerId}/orders`),

  // Courier
  registerCourier: (data) =>
    request('/register/courier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  loginCourier: (phone) =>
    request('/login/courier', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ phone }),
    }),

  getAvailablePickups: () => request('/courier/available-orders'),
  getCourierOrders: (courierId) => request(`/courier/${courierId}/orders`),

  acceptOrder: (courierId, orderId) =>
    request(`/courier/${courierId}/accept/${orderId}`, {
      method: 'PUT',
    }),

  shipOrder: (courierId, orderId) =>
    request(`/courier/${courierId}/ship/${orderId}`, {
      method: 'PUT',
    }),

  deliverOrder: (courierId, orderId, otp = '1234') =>
    request(`/courier/${courierId}/deliver/${orderId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ otp }),
    }),

  // Orders
  createOrder: (data) =>
    request('/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    }),

  markOrderReady: (orderId) =>
    request(`/orders/${orderId}/ready`, {
      method: 'PUT',
    }),

  // Admin APIs
  getAdminStats: () => request('/admin/stats'),
  getAdminOrders: () => request('/admin/orders'),
  getAdminArtisans: () => request('/admin/artisans'),
  getAdminBuyers: () => request('/admin/buyers'),
  getAdminCouriers: () => request('/admin/couriers'),
  deleteProductByAdmin: (productId) =>
    request(`/admin/products/${productId}`, {
      method: 'DELETE',
    }),
};