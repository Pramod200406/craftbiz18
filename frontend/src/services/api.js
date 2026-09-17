const API_BASE_URL = "/api";

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
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || `Server error: ${response.status}`);
    }

    return await response.json();
  } catch (err) {
    console.error(`API Error on ${endpoint}:`, err);
    throw err;
  }
}

export const api = {
  baseUrl: API_BASE_URL,

  getImageUrl: (relativeUrl) => {
    if (!relativeUrl) return "";
    if (relativeUrl.startsWith("http")) return relativeUrl;
    return relativeUrl.startsWith("/") ? relativeUrl : `/${relativeUrl}`;
  },

  // System
  clearSystemData: () => request("/system/clear-data", { method: "POST" }),
  seedDemoData: () => request("/system/seed-demo", { method: "POST" }),
  getSystemStats: () => request("/"),

  // Products
  getProducts: (params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== "all") query.append("category", params.category);
    if (params.search) query.append("search", params.search);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return request(`/products${qs}`);
  },

  getArtisanProducts: (artisanId) => request(`/artisan/${artisanId}/products`),

  createProduct: (productData) =>
    request("/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(productData),
    }),

  uploadProductImage: async (productId, file) => {
    const formData = new FormData();
    formData.append("file", file);
    return request(`/products/${productId}/upload-image`, {
      method: "POST",
      body: formData,
    });
  },

  enhanceProductImage: (productId) =>
    request(`/products/${productId}/enhance-image`, {
      method: "POST",
    }),

  removeProductBackground: (productId) =>
    request(`/products/${productId}/remove-background`, {
      method: "POST",
    }),

  // AI Pricing
  suggestPricing: (productionCost, category = "Handloom", demandLevel = null) =>
    request("/pricing/suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        production_cost: parseFloat(productionCost),
        demand_level: demandLevel,
        category: category,
      }),
    }),

  // Voice AI
  transcribeVoice: async (audioFile) => {
    const formData = new FormData();
    formData.append("file", audioFile);
    return request("/voice/transcribe", {
      method: "POST",
      body: formData,
    });
  },

  extractVoiceDetails: (transcription) =>
    request("/voice/extract-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ transcription }),
    }),

  // Artisan
  registerArtisan: (data) =>
    request("/register/artisan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  loginArtisan: (phone) =>
    request("/login/artisan", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    }),

  getArtisanDashboard: (artisanId) => request(`/dashboard/artisan/${artisanId}`),
  getArtisanOrders: (artisanId) => request(`/artisan/${artisanId}/orders`),

  // Buyer
  registerBuyer: (data) =>
    request("/register/buyer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  loginBuyer: (phone) =>
    request("/login/buyer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    }),

  getBuyerDashboard: (buyerId) => request(`/dashboard/buyer/${buyerId}`),
  getBuyerMatches: (buyerId, params = {}) => {
    const query = new URLSearchParams();
    if (params.category && params.category !== "all") query.append("category", params.category);
    if (params.min_budget) query.append("min_budget", params.min_budget);
    if (params.max_budget) query.append("max_budget", params.max_budget);
    if (params.target_product) query.append("target_product", params.target_product);
    if (params.quantity) query.append("quantity", params.quantity);
    const qs = query.toString() ? `?${query.toString()}` : "";
    return request(`/buyer/${buyerId}/matches${qs}`);
  },
  getBuyerOrders: (buyerId) => request(`/buyer/${buyerId}/orders`),

  // Courier
  registerCourier: (data) =>
    request("/register/courier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  loginCourier: (phone) =>
    request("/login/courier", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ phone }),
    }),

  getAvailablePickups: () => request("/courier/available-orders"),
  getCourierOrders: (courierId) => request(`/courier/${courierId}/orders`),

  acceptOrder: (courierId, orderId) =>
    request(`/courier/${courierId}/accept/${orderId}`, {
      method: "PUT",
    }),

  shipOrder: (courierId, orderId) =>
    request(`/courier/${courierId}/ship/${orderId}`, {
      method: "PUT",
    }),

  deliverOrder: (courierId, orderId, otp = "1234") =>
    request(`/courier/${courierId}/deliver/${orderId}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ otp }),
    }),

  // Orders
  createOrder: (data) =>
    request("/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    }),

  markOrderReady: (orderId) =>
    request(`/orders/${orderId}/ready`, {
      method: "PUT",
    }),

  // Admin APIs
  getAdminStats: () => request("/admin/stats"),
  getAdminOrders: () => request("/admin/orders"),
  getAdminArtisans: () => request("/admin/artisans"),
  getAdminBuyers: () => request("/admin/buyers"),
  getAdminCouriers: () => request("/admin/couriers"),
  deleteProductByAdmin: (productId) =>
    request(`/admin/products/${productId}`, {
      method: "DELETE",
    }),
};

