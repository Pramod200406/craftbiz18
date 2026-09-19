import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { 
  Search, Filter, Sparkles, ShoppingCart, Star, ShieldCheck, 
  MapPin, Check, ChevronLeft, ChevronRight, Eye, Tag, ArrowRight, Heart,
  UserPlus, Package, Sliders, Target, RefreshCw, Layers
} from 'lucide-react';

export const BuyerDashboard = ({ onAddToCart, onSwitchToArtisan }) => {
  const { t } = useLanguage();

  const [buyer, setBuyer] = useState(() => {
    const saved = localStorage.getItem('craftbiz_buyer');
    return saved ? JSON.parse(saved) : null;
  });

  const [showBuyerModal, setShowBuyerModal] = useState(false);
  const [buyerForm, setBuyerForm] = useState({
    name: '',
    phone: '',
    business_name: '',
    business_type: 'Retail / Boutique',
    location: 'Bengaluru, Karnataka',
    quantity_required: 15,
    budget_min: 400,
    budget_max: 15000,
    preferred_product: '',
    preferred_category: 'all'
  });

  // Buyer Procurement & AI Matching Filter Preferences
  const [procurePrefs, setProcurePrefs] = useState(() => {
    const saved = localStorage.getItem('craftbiz_buyer_procure_prefs');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {
      target_product: '',
      category: 'all',
      min_budget: 300,
      max_budget: 8000,
      quantity: 10
    };
  });

  const [activeTab, setActiveTab] = useState('marketplace'); // marketplace, matches, myorders
  const [products, setProducts] = useState([]);
  const [matches, setMatches] = useState([]);
  const [buyerOrders, setBuyerOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortBy, setSortBy] = useState('popular');
  const [selectedProductDetails, setSelectedProductDetails] = useState(null);
  const [notification, setNotification] = useState(null);


  const [currentBannerIdx, setCurrentBannerIdx] = useState(0);

  const banners = [
    {
      title: "🧵 Discover Authentic Indian Handloom",
      subtitle: "Pure Tussar Silk & Hand-spun Khadi directly from GI-certified weaver clusters.",
      tag: "Heritage GI Handloom",
      bg: "from-[#24040b] via-[#540d1e] to-[#891d35]",
      accent: "text-amber-300 border-amber-400/40"
    },
    {
      title: "🏺 Handmade Crafts Directly From Artisans",
      subtitle: "Bankura Terracotta, Channapatna wood toys & Bidriware metal crafts at verified wholesale rates.",
      tag: "Direct Fair Trade",
      bg: "from-[#3b0713] via-[#701328] to-[#9b223d]",
      accent: "text-amber-300 border-amber-400/40"
    },
    {
      title: "🎁 Support Local. Buy Authentic.",
      subtitle: "Zero middlemen. 100% of fair profit margins go straight to rural artisan families.",
      tag: "100% Artisan Impact",
      bg: "from-[#24040b] via-[#4a0d1b] to-[#b22b49]",
      accent: "text-amber-300 border-amber-400/40"
    }
  ];

  const categories = [
    { name: "All Categories", value: "all", icon: "🇮🇳" },
    { name: "Terracotta", value: "Terracotta", icon: "🏺" },
    { name: "Bamboo Crafts", value: "Bamboo Crafts", icon: "🎋" },
    { name: "Handloom", value: "Handloom", icon: "🧵" },
    { name: "Woodcraft", value: "Woodcraft", icon: "🪵" },
    { name: "Jewellery", value: "Jewellery", icon: "💍" },
    { name: "Metal Crafts", value: "Metal Crafts", icon: "🪔" },
    { name: "Jute Crafts", value: "Jute Crafts", icon: "👜" },
  ];

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const data = await api.getProducts({
        category: selectedCategory === 'all' ? null : selectedCategory,
        search: searchQuery
      });
      setProducts(data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMatches = async (overridePrefs = null) => {
    if (!buyer?.id) return;
    setMatchingLoading(true);
    try {
      const activePrefs = overridePrefs || procurePrefs;
      const data = await api.getBuyerMatches(buyer.id, {
        category: activePrefs.category === 'all' ? null : activePrefs.category,
        min_budget: activePrefs.min_budget,
        max_budget: activePrefs.max_budget,
        target_product: activePrefs.target_product,
        quantity: activePrefs.quantity
      });
      setMatches(data);
    } catch (err) {
      console.warn("Could not fetch matches:", err);
    } finally {
      setMatchingLoading(false);
    }
  };

  const fetchOrders = async () => {
    if (!buyer?.id) return;
    try {
      const data = await api.getBuyerOrders(buyer.id);
      setBuyerOrders(data);
    } catch (err) {
      console.warn("Could not fetch orders:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, [selectedCategory, searchQuery]);

  useEffect(() => {
    if (buyer?.id) {
      fetchMatches();
      fetchOrders();
    } else {
      setShowBuyerModal(true);
    }

    const handleSync = () => {
      fetchOrders();
    };
    window.addEventListener('craftbiz_order_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('craftbiz_order_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, [buyer?.id]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRegisterBuyer = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const payload = {
        name: buyerForm.name,
        phone: buyerForm.phone,
        business_name: buyerForm.business_name,
        business_type: buyerForm.business_type,
        location: buyerForm.location,
        quantity_required: parseInt(buyerForm.quantity_required) || 10,
        budget_min: parseFloat(buyerForm.budget_min) || 300,
        budget_max: parseFloat(buyerForm.budget_max) || 8000
      };

      const newBuyer = await api.registerBuyer(payload);
      setBuyer(newBuyer);
      localStorage.setItem('craftbiz_buyer', JSON.stringify(newBuyer));

      // Also set procurement preferences from registration inputs
      const newPrefs = {
        target_product: buyerForm.preferred_product || '',
        category: buyerForm.preferred_category || 'all',
        min_budget: parseFloat(buyerForm.budget_min) || 300,
        max_budget: parseFloat(buyerForm.budget_max) || 8000,
        quantity: parseInt(buyerForm.quantity_required) || 10
      };
      setProcurePrefs(newPrefs);
      localStorage.setItem('craftbiz_buyer_procure_prefs', JSON.stringify(newPrefs));

      setShowBuyerModal(false);
      showNotification(`Welcome, ${newBuyer.name}! AI matching configured.`);
      fetchMatches(newPrefs);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleApplyPreferences = (e) => {
    if (e) e.preventDefault();
    localStorage.setItem('craftbiz_buyer_procure_prefs', JSON.stringify(procurePrefs));
    fetchMatches(procurePrefs);
    showNotification('🎯 AI Matching recalculating with your product & budget criteria!');
  };

  const fillSampleBuyer = () => {
    setBuyerForm({
      name: "Anita Sharma",
      phone: "91234" + Math.floor(10000 + Math.random() * 90000),
      business_name: "IndieCraft Living & Boutiques",
      business_type: "Retail & Export Emporium",
      location: "Bengaluru, Karnataka",
      quantity_required: 15,
      budget_min: 400,
      budget_max: 5000,
      preferred_product: "Wooden Toys & Handicrafts",
      preferred_category: "Woodcraft"
    });
  };

  const handleAddToCart = (product, e) => {
    if (e) e.stopPropagation();
    onAddToCart(product);
    showNotification(`Added "${product.name}" to cart!`);
  };

  const filteredProducts = [...products].sort((a, b) => {
    if (sortBy === 'price_low') return a.selling_price - b.selling_price;
    if (sortBy === 'price_high') return b.selling_price - a.selling_price;
    if (sortBy === 'authenticity') return b.authenticity_score - a.authenticity_score;
    return (b.rating || 4.5) - (a.rating || 4.5);
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast Alert */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-amber-400 border border-amber-500/40 shadow-2xl flex items-center gap-3 text-sm font-semibold animate-in slide-in-from-bottom">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* BUYER REGISTRATION MODAL */}
      {showBuyerModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-indigo-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">Fresh Buyer Profile</span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">🛍️ Register as a Buyer</h3>
              </div>
              <button
                type="button"
                onClick={fillSampleBuyer}
                className="text-xs font-bold text-indigo-700 bg-indigo-100 hover:bg-indigo-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                Auto-Fill Sample
              </button>
            </div>

            <form onSubmit={handleRegisterBuyer} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Your Name</label>
                <input
                  type="text"
                  required
                  value={buyerForm.name}
                  onChange={(e) => setBuyerForm({ ...buyerForm, name: e.target.value })}
                  placeholder="e.g. Anita Sharma"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={buyerForm.phone}
                    onChange={(e) => setBuyerForm({ ...buyerForm, phone: e.target.value })}
                    placeholder="9123456780"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Business Name</label>
                  <input
                    type="text"
                    required
                    value={buyerForm.business_name}
                    onChange={(e) => setBuyerForm({ ...buyerForm, business_name: e.target.value })}
                    placeholder="e.g. IndieCraft Living"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Delivery City / State</label>
                <input
                  type="text"
                  required
                  value={buyerForm.location}
                  onChange={(e) => setBuyerForm({ ...buyerForm, location: e.target.value })}
                  placeholder="e.g. Indiranagar, Bengaluru, Karnataka"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900"
                />
              </div>

              {/* Product & Budget Preferences */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <span className="text-[11px] font-black uppercase tracking-wider text-indigo-700 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5" />
                  <span>Procurement & AI Matching Criteria</span>
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Desired Product / Craft</label>
                    <input
                      type="text"
                      value={buyerForm.preferred_product}
                      onChange={(e) => setBuyerForm({ ...buyerForm, preferred_product: e.target.value })}
                      placeholder="e.g. Wooden Elephant, Saree"
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Craft Category</label>
                    <select
                      value={buyerForm.preferred_category}
                      onChange={(e) => setBuyerForm({ ...buyerForm, preferred_category: e.target.value })}
                      className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                    >
                      <option value="all">All Heritage Crafts</option>
                      <option value="Woodcraft">Woodcraft</option>
                      <option value="Terracotta">Terracotta</option>
                      <option value="Handloom">Handloom</option>
                      <option value="Bamboo Crafts">Bamboo Crafts</option>
                      <option value="Jewellery">Jewellery</option>
                      <option value="Metal Crafts">Metal Crafts</option>
                      <option value="Jute Crafts">Jute Crafts</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Min Budget (₹)</label>
                    <input
                      type="number"
                      min="0"
                      value={buyerForm.budget_min}
                      onChange={(e) => setBuyerForm({ ...buyerForm, budget_min: e.target.value })}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Max Budget (₹)</label>
                    <input
                      type="number"
                      min="1"
                      value={buyerForm.budget_max}
                      onChange={(e) => setBuyerForm({ ...buyerForm, budget_max: e.target.value })}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Batch Qty</label>
                    <input
                      type="number"
                      min="1"
                      value={buyerForm.quantity_required}
                      onChange={(e) => setBuyerForm({ ...buyerForm, quantity_required: e.target.value })}
                      className="w-full px-2.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-black text-sm rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                <span>{loading ? 'Configuring Profile...' : 'Save & Initialize AI Matching'}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Buyer Header with Tabs & Switch Button */}
      <div className="bg-white rounded-3xl p-6 border border-rose-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-[#891d35]">Enterprise Procurement Hub</span>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900 mt-1">
            {t('buyer_dash_title', 'Artisanal B2B & Retail Marketplace')}
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Procuring for: <span className="font-bold text-slate-800">{buyer?.business_name || "Guest Buyer"}</span> ({buyer?.location || "India"})
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowBuyerModal(true)}
            className="px-3 py-2 bg-[#fff5f7] hover:bg-[#fce8ed] text-[#891d35] text-xs font-bold rounded-xl border border-[#891d35]/30 transition-all flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Buyer</span>
          </button>

          <div className="flex items-center gap-2 bg-[#fff5f7] p-1.5 rounded-2xl text-xs sm:text-sm font-bold border border-rose-100">
            <button
              onClick={() => setActiveTab('marketplace')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'marketplace' ? 'bg-[#891d35] text-amber-200 shadow-md shadow-[#891d35]/30' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              🛍️ Marketplace
            </button>
            <button
              onClick={() => setActiveTab('matches')}
              className={`px-4 py-2 rounded-xl transition-all flex items-center gap-1.5 ${
                activeTab === 'matches' ? 'bg-[#891d35] text-amber-200 shadow-md shadow-[#891d35]/30' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              <span>🤝</span>
              <span>AI Matches</span>
              <span className="px-1.5 py-0.2 rounded-full bg-amber-400 text-slate-950 text-[10px] font-black">
                {matches.length}
              </span>
            </button>
            <button
              onClick={() => setActiveTab('myorders')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'myorders' ? 'bg-indigo-600 text-white shadow' : 'text-slate-600 hover:text-slate-950'
              }`}
            >
              📦 My Orders ({buyerOrders.length})
            </button>
          </div>
        </div>
      </div>

      {/* VIEW 1: MARKETPLACE */}
      {activeTab === 'marketplace' && (
        <div className="space-y-8 animate-in fade-in duration-200">
          
          {/* BANNER CAROUSEL */}
          <div className="relative overflow-hidden rounded-3xl text-white shadow-xl">
            <div className={`bg-gradient-to-r ${banners[currentBannerIdx].bg} p-8 sm:p-12 transition-all duration-500`}>
              <span className={`inline-block text-xs font-bold uppercase tracking-widest px-3 py-1 rounded-full border bg-white/10 mb-4 ${banners[currentBannerIdx].accent}`}>
                {banners[currentBannerIdx].tag}
              </span>
              <h2 className="text-2xl sm:text-4xl font-extrabold max-w-2xl leading-tight mb-3">
                {banners[currentBannerIdx].title}
              </h2>
              <p className="text-slate-300 text-xs sm:text-base max-w-xl mb-6">
                {banners[currentBannerIdx].subtitle}
              </p>
              <div className="flex items-center gap-3">
                <button
                  onClick={() => setSelectedCategory('all')}
                  className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs sm:text-sm rounded-xl shadow-lg transition-all"
                >
                  Explore Authentic Catalog
                </button>
              </div>
            </div>

            <div className="absolute bottom-4 right-6 flex items-center gap-2">
              <button
                onClick={() => setCurrentBannerIdx((prev) => (prev === 0 ? banners.length - 1 : prev - 1))}
                className="p-2 bg-slate-900/60 hover:bg-slate-900 rounded-xl text-white backdrop-blur"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentBannerIdx((prev) => (prev === banners.length - 1 ? 0 : prev + 1))}
                className="p-2 bg-slate-900/60 hover:bg-slate-900 rounded-xl text-white backdrop-blur"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* DEAL OF THE DAY */}
          {products.length > 0 && (
            <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 p-6 rounded-3xl border border-amber-200 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xl">🔥</span>
                  <div>
                    <h3 className="text-base sm:text-lg font-black text-slate-900">
                      {t('deal_of_day', 'Deal of the Day — Limited Heritage Stock')}
                    </h3>
                    <p className="text-xs text-slate-500">Special seasonal discounts directly from artisan workshops</p>
                  </div>
                </div>
                <span className="hidden sm:block text-xs font-bold text-orange-700 bg-orange-100 px-3 py-1 rounded-full">
                  Ends Today
                </span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {products.slice(0, 3).map((prod) => (
                  <div 
                    key={prod.id} 
                    onClick={() => setSelectedProductDetails(prod)}
                    className="bg-white rounded-2xl p-4 border border-amber-200/80 shadow-sm hover:shadow-md transition-all flex gap-4 cursor-pointer group"
                  >
                    <div className="w-24 h-24 rounded-xl bg-slate-100 overflow-hidden flex-shrink-0 relative">
                      <img 
                        src={api.getImageUrl(prod.professional_image_url || prod.enhanced_image_url || prod.image_url)} 
                        alt={prod.name} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                      <span className="absolute top-1 left-1 bg-rose-600 text-white text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                        -25%
                      </span>
                    </div>
                    <div className="flex-1 flex flex-col justify-between">
                      <div>
                        <div className="flex items-center gap-1 text-[10px] text-amber-600 font-bold">
                          <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                          <span>{prod.rating || 4.9}</span>
                          <span className="text-slate-400">({prod.authenticity_score}% Authenticity)</span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-900 line-clamp-1 group-hover:text-amber-600 transition-colors">
                          {prod.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 line-clamp-1">{prod.category}</p>
                      </div>

                      <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100">
                        <div>
                          <span className="text-xs font-black text-slate-900">₹{prod.selling_price}</span>
                          <span className="text-[10px] text-slate-400 line-through ml-1.5">₹{Math.round(prod.selling_price * 1.3)}</span>
                        </div>
                        <button
                          onClick={(e) => handleAddToCart(prod, e)}
                          className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-slate-950 font-bold text-[11px] rounded-lg shadow-sm"
                        >
                          Add
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* 7 CATEGORIES */}
          <div className="space-y-3">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
              Browse by Heritage Craft
            </span>
            <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
              {categories.map((cat) => (
                <button
                  key={cat.value}
                  onClick={() => setSelectedCategory(cat.value)}
                  className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all border ${
                    selectedCategory === cat.value
                      ? 'bg-slate-900 text-amber-400 border-slate-900 shadow-md'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-amber-400 hover:bg-amber-50/50'
                  }`}
                >
                  <span className="text-base">{cat.icon}</span>
                  <span>{cat.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* SEARCH & SORT */}
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder={t('search_placeholder', 'Search terracotta, handloom, bidriware, woodcraft...')}
                className="w-full pl-10 pr-4 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm text-slate-900 focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
              <span className="text-xs font-bold text-slate-500">Sort by:</span>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="bg-slate-50 border border-slate-300 text-xs font-semibold px-3 py-2 rounded-xl text-slate-800"
              >
                <option value="popular">Most Popular & Rating</option>
                <option value="authenticity">Highest Authenticity Score</option>
                <option value="price_low">Price: Low to High</option>
                <option value="price_high">Price: High to Low</option>
              </select>
            </div>
          </div>

          {/* PRODUCT CARDS OR FRESH EMPTY STATE */}
          {filteredProducts.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 text-center border-2 border-dashed border-slate-200 space-y-4">
              <div className="w-16 h-16 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-3xl mx-auto">
                🏺
              </div>
              <div className="max-w-md mx-auto space-y-1">
                <h4 className="text-lg font-bold text-slate-900">Database is Fresh & Empty!</h4>
                <p className="text-xs text-slate-500 leading-relaxed">
                  No crafts in the marketplace yet. You can now use the <strong>Artisan Hub</strong> to add your own crafts using <strong>Voice AI</strong>, <strong>Product Studio</strong>, and <strong>Smart Pricing</strong>!
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredProducts.map((prod) => (
                <div
                  key={prod.id}
                  onClick={() => setSelectedProductDetails(prod)}
                  className="group bg-white rounded-3xl border border-slate-200 overflow-hidden shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between cursor-pointer relative"
                >
                  <div className="aspect-square w-full bg-slate-50 relative overflow-hidden">
                    <img
                      src={api.getImageUrl(prod.professional_image_url || prod.enhanced_image_url || prod.image_url)}
                      alt={prod.name}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    
                    {/* Meesho Style Trending Badge */}
                    <div className="absolute top-2.5 left-2.5 px-2 py-0.5 bg-rose-600 text-white rounded-md text-[10px] font-black uppercase tracking-wider shadow flex items-center gap-1 animate-pulse">
                      <span>🔥</span>
                      <span>Trending</span>
                    </div>

                    <div className="absolute top-2.5 right-2.5 px-2 py-0.5 bg-amber-500 text-slate-950 rounded-md text-[10px] font-black shadow flex items-center gap-1">
                      <ShieldCheck className="w-3 h-3 text-slate-950" />
                      <span>GI Certified</span>
                    </div>

                    {/* Meesho Free Delivery Floating Pill */}
                    <div className="absolute bottom-2 left-2 px-2.5 py-0.5 bg-emerald-600/90 backdrop-blur-sm text-white rounded-full text-[10px] font-extrabold shadow flex items-center gap-1">
                      <span>🚚 Free Delivery</span>
                    </div>
                  </div>

                  <div className="p-4 space-y-2.5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between text-[11px] text-slate-500 mb-1">
                        <span className="font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-md">{prod.category}</span>
                        <div className="flex items-center gap-1 text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded font-bold text-[10px]">
                          <Star className="w-3 h-3 fill-emerald-500 text-emerald-500" />
                          <span>{prod.rating || 4.8}</span>
                          <span className="text-slate-400 font-normal">| 1.2k+</span>
                        </div>
                      </div>

                      <h3 className="font-bold text-slate-900 text-sm line-clamp-1 group-hover:text-indigo-600 transition-colors">
                        {prod.name}
                      </h3>

                      <p className="text-[11px] text-slate-500 line-clamp-1 mt-0.5">
                        {prod.description}
                      </p>

                      <div className="flex items-center gap-1 text-[10px] text-slate-600 font-medium mt-1.5">
                        <MapPin className="w-3 h-3 text-slate-400" />
                        <span className="truncate">{prod.artisan_location || "Karnataka, India"}</span>
                      </div>
                    </div>

                    {/* Meesho Dynamic Pricing with Strikethrough & Savings Tag */}
                    <div className="pt-2.5 border-t border-slate-100 flex items-center justify-between">
                      <div>
                        <div className="flex items-baseline gap-1.5">
                          <span className="text-lg font-black text-slate-900">₹{prod.selling_price}</span>
                          <span className="text-xs text-slate-400 line-through">₹{Math.round(prod.selling_price * 1.45)}</span>
                          <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-1 rounded">
                            31% OFF
                          </span>
                        </div>
                        <span className="text-[10px] text-indigo-700 font-bold block">
                          Lowest Price Direct from Artisan
                        </span>
                      </div>

                      <button
                        onClick={(e) => handleAddToCart(prod, e)}
                        className="px-3.5 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white text-xs font-black rounded-xl shadow-md transition-all flex items-center gap-1 active:scale-95"
                      >
                        <ShoppingCart className="w-3.5 h-3.5" />
                        <span>{t('add_to_cart', 'Add')}</span>
                      </button>
                    </div>

                  </div>
                </div>
              ))}
            </div>
          )}

        </div>
      )}

      {/* VIEW 2: AI BUYER MATCHING */}
      {activeTab === 'matches' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-8 animate-in fade-in duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-100 text-blue-900 text-xs font-bold mb-2">
                <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                <span>Multi-Dimensional Recommendation Engine</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900">
                {t('matching_tab', '🤝 AI Buyer-Artisan Match Engine')}
              </h2>
              <p className="text-slate-500 text-xs sm:text-sm max-w-3xl mt-1">
                {t('matching_subtitle', 'Algorithmic matching based on your procurement volume, budget range, and artisan capacity.')}
              </p>
            </div>

            <div className="flex items-center gap-2 self-start md:self-auto">
              <span className="text-xs font-bold text-slate-500">Live AI Rank:</span>
              <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs font-black">
                {matches.length} Verified Artisan Matches
              </span>
            </div>
          </div>

          {/* BUYER PROCUREMENT PREFERENCES & BUDGET FILTER CONTROL PANEL */}
          <div className="bg-gradient-to-br from-indigo-50/70 via-white to-slate-50 border-2 border-indigo-200/80 rounded-3xl p-5 sm:p-7 shadow-md space-y-5">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-indigo-100 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 bg-indigo-600 text-white rounded-2xl shadow-sm">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base sm:text-lg font-black text-slate-900">
                    🎯 Buyer Procurement & Budget Criteria
                  </h3>
                  <p className="text-xs text-slate-500">
                    Specify what product, category, and price range you can afford to re-rank matches dynamically.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    const reset = { target_product: '', category: 'all', min_budget: 200, max_budget: 10000, quantity: 10 };
                    setProcurePrefs(reset);
                    fetchMatches(reset);
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${matchingLoading ? 'animate-spin' : ''}`} />
                  <span>Reset</span>
                </button>
                <button
                  type="button"
                  onClick={handleApplyPreferences}
                  disabled={matchingLoading}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md transition-all flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                  <span>{matchingLoading ? 'Matching...' : 'Run AI Match'}</span>
                </button>
              </div>
            </div>

            <form onSubmit={handleApplyPreferences} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {/* Desired Product Name */}
              <div className="lg:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Target className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Which Product / Craft Do You Want?</span>
                </label>
                <input
                  type="text"
                  placeholder="e.g. Wooden Elephant, Terracotta Vase, Silk Saree..."
                  value={procurePrefs.target_product}
                  onChange={(e) => setProcurePrefs({ ...procurePrefs, target_product: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 outline-none"
                />
              </div>

              {/* Craft Category */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5 flex items-center gap-1.5">
                  <Layers className="w-3.5 h-3.5 text-indigo-600" />
                  <span>Category</span>
                </label>
                <select
                  value={procurePrefs.category}
                  onChange={(e) => setProcurePrefs({ ...procurePrefs, category: e.target.value })}
                  className="w-full px-3 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                >
                  <option value="all">All Heritage Crafts</option>
                  <option value="Woodcraft">Woodcraft</option>
                  <option value="Terracotta">Terracotta</option>
                  <option value="Handloom">Handloom</option>
                  <option value="Bamboo Crafts">Bamboo Crafts</option>
                  <option value="Jewellery">Jewellery</option>
                  <option value="Metal Crafts">Metal Crafts</option>
                  <option value="Jute Crafts">Jute Crafts</option>
                </select>
              </div>

              {/* Min Budget (Affordable) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Min Affordable (₹)
                </label>
                <input
                  type="number"
                  min="0"
                  step="50"
                  placeholder="e.g. 300"
                  value={procurePrefs.min_budget}
                  onChange={(e) => setProcurePrefs({ ...procurePrefs, min_budget: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>

              {/* Max Budget (Affordable) */}
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Max Affordable (₹)
                </label>
                <input
                  type="number"
                  min="1"
                  step="100"
                  placeholder="e.g. 5000"
                  value={procurePrefs.max_budget}
                  onChange={(e) => setProcurePrefs({ ...procurePrefs, max_budget: parseFloat(e.target.value) || 1000 })}
                  className="w-full px-3.5 py-2.5 bg-white border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
            </form>

            {/* Quick Preference Summary Chips */}
            <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-slate-200/70 text-xs">
              <span className="font-bold text-slate-500">Active Criteria:</span>
              <span className="px-2.5 py-1 bg-white border border-indigo-200 text-indigo-800 rounded-lg font-bold flex items-center gap-1">
                🏷️ Category: <span className="text-slate-900">{procurePrefs.category === 'all' ? 'All' : procurePrefs.category}</span>
              </span>
              <span className="px-2.5 py-1 bg-white border border-emerald-200 text-emerald-800 rounded-lg font-bold flex items-center gap-1">
                💰 Budget: <span className="text-slate-900">₹{procurePrefs.min_budget} — ₹{procurePrefs.max_budget}</span>
              </span>
              {procurePrefs.target_product && (
                <span className="px-2.5 py-1 bg-white border border-purple-200 text-purple-800 rounded-lg font-bold flex items-center gap-1">
                  🔍 Craft: <span className="text-slate-900">{procurePrefs.target_product}</span>
                </span>
              )}
              <span className="px-2.5 py-1 bg-white border border-slate-200 text-slate-700 rounded-lg font-bold">
                📦 Batch Size: {procurePrefs.quantity || 10} units
              </span>
            </div>
          </div>


          {matches.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <span className="text-4xl block">🤝</span>
              <p className="text-sm font-semibold text-slate-600">No matching products found yet.</p>
              <p className="text-xs text-slate-500">As soon as artisans add products in the Artisan Hub, our AI matching engine will compute compatibility scores here.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4">
              {matches.map((item, idx) => (
                <div 
                  key={idx}
                  className="bg-slate-50 rounded-2xl p-5 sm:p-6 border-2 border-indigo-100 hover:border-indigo-400 shadow-sm transition-all flex flex-col md:flex-row items-start md:items-center justify-between gap-6"
                >
                  <div className="flex items-start gap-4">
                    <div className="w-20 h-20 rounded-2xl bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                      <img 
                        src={api.getImageUrl(item.image_url)} 
                        alt={item.product_name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-xs font-bold text-indigo-700 bg-indigo-100 px-2.5 py-0.5 rounded-full">
                          {item.category}
                        </span>
                        <span className="text-xs font-bold text-slate-900 bg-slate-200/80 px-2.5 py-0.5 rounded-full">
                          ₹{item.selling_price} / unit
                        </span>
                        <span className="text-xs text-emerald-700 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <ShieldCheck className="w-3 h-3" />
                          <span>{item.authenticity_score}% GI Authentic</span>
                        </span>
                        <span className="text-xs text-slate-500 font-medium ml-auto sm:ml-0">
                          Artisan: <span className="text-slate-800 font-semibold">{item.artisan_name}</span> ({item.artisan_location})
                        </span>
                      </div>
                      <h3 className="text-lg font-black text-slate-900">{item.product_name}</h3>
                      <p className="text-xs text-slate-600 max-w-2xl leading-relaxed bg-white/70 p-2.5 rounded-xl border border-slate-200/60">
                        {item.ai_explanation}
                      </p>
                    </div>
                  </div>

                  <div className="flex sm:flex-col items-end justify-between sm:justify-center w-full md:w-auto gap-3 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                    <div className="flex items-center gap-2">
                      <div className="text-right">
                        <span className="text-[10px] uppercase font-bold text-slate-500 block">AI Match</span>
                        <span className="text-2xl font-black text-emerald-600">{item.match_score}%</span>
                      </div>
                      <div className="w-12 h-12 rounded-full border-4 border-emerald-500 bg-emerald-50 flex items-center justify-center font-bold text-xs text-emerald-800">
                        ✓
                      </div>
                    </div>

                    <button
                      onClick={() => {
                        const prod = products.find(p => p.id === item.product_id);
                        if (prod) handleAddToCart(prod);
                      }}
                      className="px-5 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow transition-all whitespace-nowrap"
                    >
                      Procure Consignment
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* VIEW 3: MY ORDERS */}
      {activeTab === 'myorders' && (
        <div className="bg-white rounded-3xl p-6 sm:p-10 border border-slate-200 shadow-xl space-y-6 animate-in fade-in duration-200">
          <h2 className="text-2xl font-extrabold text-slate-900">Your Consignment Orders</h2>
          
          {buyerOrders.length === 0 ? (
            <p className="text-sm text-slate-500 py-8 text-center">No orders placed yet.</p>
          ) : (
            <div className="space-y-4">
              {buyerOrders.map((ord) => (
                <div key={ord.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Order #{ord.id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-extrabold ${
                        ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        ord.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        ord.status === 'Accepted by Courier' ? 'bg-indigo-100 text-indigo-800' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-600 font-medium">
                      Product: {ord.product_name} (Qty: {ord.quantity}) • Amount: ₹{ord.total_amount}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Destination: {ord.delivery_address}
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs text-slate-400 block">OTP for Delivery:</span>
                    <span className="text-sm font-black text-amber-600 px-3 py-1 bg-amber-50 rounded-lg border border-amber-200">
                      1234
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* PRODUCT DETAILS MODAL */}
      {selectedProductDetails && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-2xl w-full overflow-hidden shadow-2xl border border-slate-200 max-h-[90vh] flex flex-col">
            
            <div className="relative aspect-video w-full bg-slate-100 overflow-hidden">
              <img
                src={api.getImageUrl(selectedProductDetails.professional_image_url || selectedProductDetails.enhanced_image_url || selectedProductDetails.image_url)}
                alt={selectedProductDetails.name}
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => setSelectedProductDetails(null)}
                className="absolute top-4 right-4 w-9 h-9 bg-slate-950/70 hover:bg-slate-950 rounded-full text-white font-bold flex items-center justify-center backdrop-blur transition-colors"
              >
                ✕
              </button>
            </div>

            <div className="p-6 space-y-6 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase tracking-wider text-indigo-600">
                    {selectedProductDetails.category}
                  </span>
                  <span className="text-2xl font-black text-slate-900">
                    ₹{selectedProductDetails.selling_price}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mt-1">{selectedProductDetails.name}</h2>
                <p className="text-xs text-slate-600 mt-2 leading-relaxed">{selectedProductDetails.description}</p>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-center">
                <div className="p-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Authenticity</span>
                  <span className="text-base font-black text-emerald-600">{selectedProductDetails.authenticity_score}%</span>
                </div>
                <div className="p-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Visual Quality</span>
                  <span className="text-base font-black text-indigo-600">{selectedProductDetails.visual_score}%</span>
                </div>
                <div className="p-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Fair Price</span>
                  <span className="text-base font-black text-amber-600">{selectedProductDetails.fair_price_index} / 10</span>
                </div>
                <div className="p-2">
                  <span className="text-[10px] font-bold text-slate-500 uppercase block">Stock Ready</span>
                  <span className="text-base font-black text-slate-800">{selectedProductDetails.available_quantity} pcs</span>
                </div>
              </div>

              <div className="text-xs text-slate-600 space-y-1">
                <div><strong className="text-slate-800">Material Composition:</strong> {selectedProductDetails.material || "Handcrafted Heritage Fibers"}</div>
                <div><strong className="text-slate-800">Master Artisan Cluster:</strong> {selectedProductDetails.artisan_name} ({selectedProductDetails.artisan_location || "Karnataka"})</div>
              </div>

              <div className="pt-4 border-t border-slate-100 flex items-center justify-end gap-3">
                <button
                  onClick={() => setSelectedProductDetails(null)}
                  className="px-5 py-2.5 rounded-xl border border-slate-300 text-xs font-bold text-slate-700 hover:bg-slate-100"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    handleAddToCart(selectedProductDetails);
                    setSelectedProductDetails(null);
                  }}
                  className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold shadow-lg"
                >
                  Add to Procurement Cart
                </button>
              </div>

            </div>
          </div>
        </div>
      )}

    </div>
  );
};
