import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { 
  ShieldAlert, Activity, Users, ShoppingBag, Truck, Package, 
  TrendingUp, RefreshCw, Trash2, CheckCircle2, AlertCircle, 
  Search, ShieldCheck, Sparkles, Database, ExternalLink
} from 'lucide-react';

export const AdminDashboard = () => {
  const { t } = useLanguage();

  const [stats, setStats] = useState(null);
  const [orders, setOrders] = useState([]);
  const [artisans, setArtisans] = useState([]);
  const [buyers, setBuyers] = useState([]);
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview'); // overview, orders, artisans, products, system
  const [actionLoading, setActionLoading] = useState(false);
  const [searchFilter, setSearchFilter] = useState('');
  const [notification, setNotification] = useState(null);

  const showToast = (msg, type = 'success') => {
    setNotification({ msg, type });
    setTimeout(() => setNotification(null), 3500);
  };

  const loadAdminData = async () => {
    setLoading(true);
    try {
      const [statsData, ordersData, artisansData, buyersData, prodsData] = await Promise.all([
        api.getAdminStats().catch(() => null),
        api.getAdminOrders().catch(() => []),
        api.getAdminArtisans().catch(() => []),
        api.getAdminBuyers().catch(() => []),
        api.getProducts().catch(() => [])
      ]);

      setStats(statsData);
      setOrders(ordersData);
      setArtisans(artisansData);
      setBuyers(buyersData);
      setProducts(prodsData);
    } catch (err) {
      showToast(`Error loading admin metrics: ${err.message}`, 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
    const handleSync = () => loadAdminData();
    window.addEventListener('craftbiz_order_updated', handleSync);
    window.addEventListener('storage', handleSync);
    return () => {
      window.removeEventListener('craftbiz_order_updated', handleSync);
      window.removeEventListener('storage', handleSync);
    };
  }, []);

  const handleDeleteProduct = async (productId, prodName) => {
    const confirmPrompt = t('admin_confirm_delete', 'Admin Action: Are you sure you want to moderate and remove this craft item?');
    if (!window.confirm(`${confirmPrompt} ("${prodName}")`)) return;
    setActionLoading(true);
    try {
      await api.deleteProductByAdmin(productId);
      showToast(`Product "${prodName}" removed successfully.`);
      loadAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSeedDemo = async () => {
    setActionLoading(true);
    try {
      await api.seedDemoData();
      showToast("Demo authentic craft catalogue seeded successfully!");
      loadAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  const handleClearData = async () => {
    if (!window.confirm(t('admin_clear_desc', 'Wipes all recorded artisans, products, buyers, shipments and orders from SQLite database to allow clean end-to-end evaluation.'))) return;
    setActionLoading(true);
    try {
      await api.clearSystemData();
      showToast("Ecosystem data cleared. System ready for fresh data!");
      loadAdminData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-in fade-in duration-200">
      
      {/* Toast Alert */}
      {notification && (
        <div className={`fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 text-sm font-semibold animate-in slide-in-from-bottom ${
          notification.type === 'error' ? 'bg-rose-600 text-white' : 'bg-slate-900 text-amber-400 border border-amber-500/40'
        }`}>
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>{notification.msg}</span>
        </div>
      )}

      {/* Admin Header Ribbon */}
      <div className="bg-gradient-to-r from-[#24040b] via-[#3b0713] to-[#701328] text-white rounded-3xl p-6 sm:p-8 border border-[#540d1e] shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 relative overflow-hidden">
        {/* Subtle mandala watermark */}
        <div className="absolute inset-0 bg-[url('/theme-pattern.png')] bg-center bg-cover opacity-15 pointer-events-none mix-blend-screen" />
        <div className="relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/20 text-amber-300 border border-amber-400/40 text-xs font-bold mb-2">
            <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
            <span>{t('admin_portal_badge', 'Platform Governance & SIH 2026 Overseer')}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            🛡️ {t('admin_title', 'Ecosystem Admin Control Center')}
          </h1>
          <p className="text-rose-100/80 text-xs sm:text-sm mt-1 max-w-2xl">
            {t('admin_subtitle', 'Real-time multi-stakeholder governance across Indian artisan clusters, retail & bulk buyers, shipment logistics, and automated AI pricing verification.')}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={loadAdminData}
            disabled={loading || actionLoading}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-bold border border-slate-700 transition-all flex items-center gap-2"
          >
            <RefreshCw className={`w-4 h-4 text-amber-400 ${loading ? 'animate-spin' : ''}`} />
            <span>{t('admin_refresh', 'Refresh')}</span>
          </button>
          <div className="px-3.5 py-2 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-xl text-xs font-black flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>{t('admin_ai_live', 'AI Cluster Live')}</span>
          </div>
        </div>
      </div>

      {/* Primary Metric Tiles */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase">{t('admin_registered_artisans', 'Registered Artisans')}</span>
          <div className="text-3xl font-black text-amber-600 mt-2">
            {stats?.artisans_count ?? artisans.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">{t('admin_verified_gi', 'Verified GI clusters')}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase">{t('admin_active_catalog', 'Active Catalog')}</span>
          <div className="text-3xl font-black text-indigo-600 mt-2">
            {stats?.products_count ?? products.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">{t('admin_studio_enhanced', 'Studio AI Enhanced')}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase">{t('admin_total_orders', 'Total Orders')}</span>
          <div className="text-3xl font-black text-emerald-600 mt-2">
            {stats?.total_orders ?? orders.length}
          </div>
          <span className="text-[11px] text-slate-400 mt-1">{stats?.active_orders ?? 0} {t('admin_in_transit', 'active in transit')}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-bold text-slate-500 uppercase">{t('admin_gmv', 'Gross Platform GMV')}</span>
          <div className="text-3xl font-black text-slate-900 mt-2">
            ₹{(stats?.total_revenue ?? 0).toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-600 font-bold mt-1">{t('admin_direct_payout', '100% direct artisan payout')}</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm flex flex-col justify-between col-span-2 lg:col-span-1">
          <span className="text-xs font-bold text-slate-500 uppercase">{t('admin_fair_wage', 'Fair Wage Rating')}</span>
          <div className="text-3xl font-black text-purple-600 mt-2">
            {stats?.avg_fair_price ?? '9.5'} <span className="text-sm text-slate-400 font-normal">/ 10</span>
          </div>
          <span className="text-[11px] text-purple-700 font-semibold mt-1">{t('admin_livable_wages', 'Certified Livable Wages')}</span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-2">
        {[
          { id: 'overview', label: `📊 ${t('admin_tab_overview', 'System Overview')}`, count: null },
          { id: 'orders', label: `📦 ${t('admin_tab_orders', 'All Platform Orders')}`, count: orders.length },
          { id: 'artisans', label: `🎨 ${t('admin_tab_artisans', 'Artisans Directory')}`, count: artisans.length },
          { id: 'products', label: `🏺 ${t('admin_tab_products', 'Catalogue Moderation')}`, count: products.length },
          { id: 'system', label: `⚙️ ${t('admin_tab_system', 'Maintenance & Seeding')}`, count: null }
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold whitespace-nowrap transition-all flex items-center gap-2 ${
              activeTab === tab.id
                ? 'bg-slate-900 text-amber-400 shadow-md'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span className={`px-2 py-0.5 rounded-full text-[10px] font-black ${
                activeTab === tab.id ? 'bg-amber-400 text-slate-950' : 'bg-slate-100 text-slate-700'
              }`}>
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-black text-slate-900">{t('admin_recent_orders', 'Recent Platform Orders Lifecycle')}</h3>
              <button 
                onClick={() => setActiveTab('orders')}
                className="text-xs font-bold text-indigo-600 hover:underline flex items-center gap-1"
              >
                <span>{t('admin_view_all_orders', 'View All Orders')}</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </button>
            </div>

            {orders.length === 0 ? (
              <div className="py-10 text-center text-slate-400 text-xs">{t('admin_no_orders', 'No orders recorded yet.')}</div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
                    <tr>
                      <th className="p-3">{t('admin_order_id', 'Order ID')}</th>
                      <th className="p-3">{t('admin_craft_item', 'Craft Item')}</th>
                      <th className="p-3">{t('admin_buyer', 'Buyer')}</th>
                      <th className="p-3">{t('admin_artisan', 'Artisan')}</th>
                      <th className="p-3">{t('admin_amount', 'Amount')}</th>
                      <th className="p-3">{t('admin_status', 'Status')}</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {orders.slice(0, 6).map((ord) => (
                      <tr key={ord.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">#{ord.id}</td>
                        <td className="p-3 font-semibold text-indigo-900">{ord.product_name || "Craft Item"}</td>
                        <td className="p-3">{ord.buyer_name || "Buyer"}</td>
                        <td className="p-3">{ord.artisan_name || "Artisan"}</td>
                        <td className="p-3 font-black text-slate-900">₹{ord.total_amount}</td>
                        <td className="p-3">
                          <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                            ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                            ord.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                            (ord.status === 'Accepted by Courier' || ord.status === 'Accepted by Shipment Partner') ? 'bg-indigo-100 text-indigo-800' :
                            'bg-amber-100 text-amber-800'
                          }`}>
                            {ord.status === 'Accepted by Courier' ? t('status_accepted', 'Accepted by Shipment Partner') : ord.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* Regional Clusters & Fair Trade Health */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
            <h3 className="text-base font-black text-slate-900">{t('admin_active_clusters', 'Active Heritage Clusters')}</h3>
            <div className="space-y-3">
              {[
                { name: "Channapatna Craft Corridor", state: "Karnataka", count: "Woodcraft & Lacquerware", auth: "98%" },
                { name: "Bankura Terracotta Belt", state: "West Bengal", count: "Clay & Temple Sculptures", auth: "96%" },
                { name: "Varanasi Silk Weaver Hub", state: "Uttar Pradesh", count: "Pure Handloom Silk", auth: "99%" },
                { name: "Bidriware Metal Cluster", state: "Karnataka", count: "Inlaid Zinc-Copper Alloy", auth: "95%" },
                { name: "Kutch Ajrakh Print Guild", state: "Gujarat", count: "Natural Block Handloom", auth: "97%" }
              ].map((c, i) => (
                <div key={i} className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex items-center justify-between">
                  <div>
                    <div className="font-bold text-xs text-slate-900">{c.name}</div>
                    <div className="text-[10px] text-slate-500">{c.state} • {c.count}</div>
                  </div>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-emerald-100 text-emerald-800 rounded-md">
                    {c.auth} GI
                  </span>
                </div>
              ))}
            </div>

            <div className="pt-3 border-t border-slate-100 text-xs text-slate-500 space-y-2">
              <div className="font-bold text-slate-800">{t('admin_compliance_metrics', 'Compliance & Trust Metrics')}</div>
              <div className="flex justify-between text-[11px]">
                <span>{t('admin_zero_middlemen', 'Zero Middlemen Commission')}:</span>
                <span className="font-bold text-emerald-700">{t('admin_100_artisan', '100% to Artisans')}</span>
              </div>
              <div className="flex justify-between text-[11px]">
                <span>{t('admin_otp_reliability', 'OTP Handover Reliability')}:</span>
                <span className="font-bold text-indigo-700">99.8%</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: ORDERS MANAGEMENT */}
      {activeTab === 'orders' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {t('admin_all_marketplace_orders', 'All Marketplace Orders')} ({orders.length})
            </h3>
            <span className="text-xs text-slate-500">{t('admin_live_tracker', 'Live logistics and settlement tracker')}</span>
          </div>

          {orders.length === 0 ? (
            <div className="py-12 text-center text-slate-400">{t('admin_no_orders', 'No orders placed across the ecosystem yet.')}</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                  <tr>
                    <th className="p-3.5">{t('admin_order_id', 'Order ID')}</th>
                    <th className="p-3.5">{t('admin_craft_item', 'Craft Product')}</th>
                    <th className="p-3.5">{t('admin_buyer_details', 'Buyer Details')}</th>
                    <th className="p-3.5">{t('admin_artisan_workshop', 'Artisan Workshop')}</th>
                    <th className="p-3.5">{t('admin_qty', 'Qty')}</th>
                    <th className="p-3.5">{t('admin_total_rs', 'Total (₹)')}</th>
                    <th className="p-3.5">{t('admin_shipment_partner', 'Shipment Partner')}</th>
                    <th className="p-3.5">{t('admin_otp', 'OTP')}</th>
                    <th className="p-3.5">{t('admin_delivery_status', 'Delivery Status')}</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 font-medium">
                  {orders.map((ord) => (
                    <tr key={ord.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="p-3.5 font-bold text-slate-900">#{ord.id}</td>
                      <td className="p-3.5">
                        <div className="font-bold text-slate-900">{ord.product_name}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1">{ord.delivery_address}</div>
                      </td>
                      <td className="p-3.5 font-semibold text-slate-700">{ord.buyer_name || "Buyer"}</td>
                      <td className="p-3.5 font-semibold text-amber-800">{ord.artisan_name || "Artisan"}</td>
                      <td className="p-3.5">{ord.quantity}</td>
                      <td className="p-3.5 font-black text-slate-900">₹{ord.total_amount}</td>
                      <td className="p-3.5">{ord.courier_name ? `🚚 ${ord.courier_name}` : t('admin_pending_pickup', 'Pending Pickup')}</td>
                      <td className="p-3.5 font-mono font-bold text-indigo-600">{ord.otp || "1234"}</td>
                      <td className="p-3.5">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-extrabold ${
                          ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                          ord.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                          (ord.status === 'Accepted by Courier' || ord.status === 'Accepted by Shipment Partner') ? 'bg-indigo-100 text-indigo-800' :
                          'bg-amber-100 text-amber-800'
                        }`}>
                          {ord.status === 'Accepted by Courier' ? t('status_accepted', 'Accepted by Shipment Partner') : ord.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* TAB 3: ARTISANS DIRECTORY */}
      {activeTab === 'artisans' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-base sm:text-lg font-black text-slate-900">
              {t('admin_all_artisans', 'Registered Artisans')} ({artisans.length})
            </h3>
            <span className="text-xs text-slate-500">{t('admin_profiles_capacity', 'Profiles, capacity & performance')}</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {artisans.map((art) => (
              <div key={art.id} className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-9 h-9 rounded-xl bg-amber-500 text-slate-950 font-black flex items-center justify-center text-sm">
                      {art.name[0]}
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900 text-sm">{art.name}</h4>
                      <p className="text-[11px] text-slate-500">{art.phone}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-amber-100 text-amber-800 font-bold text-[10px] rounded-md">
                    ID #{art.id}
                  </span>
                </div>

                <div className="text-xs text-slate-600 space-y-1 pt-2 border-t border-slate-200/60">
                  <div><strong>{t('admin_craft', 'Craft')}:</strong> {art.craft_type}</div>
                  <div><strong>{t('admin_location', 'Location')}:</strong> {art.location}</div>
                  <div><strong>{t('admin_capacity', 'Capacity')}:</strong> {art.production_capacity} {t('admin_units_mo', 'units/mo')}</div>
                  <div><strong>{t('admin_catalogued_products', 'Catalogued Products')}:</strong> {art.products_count}</div>
                </div>

                <div className="pt-2 border-t border-slate-200/60 flex items-center justify-between text-xs">
                  <span className="text-slate-500">{t('admin_total_earned', 'Total Earned')}:</span>
                  <span className="font-black text-emerald-600">₹{art.total_earned.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 4: PRODUCTS MODERATION */}
      {activeTab === 'products' && (
        <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900">
                {t('admin_catalog_moderation', 'Marketplace Catalogue Moderation')} ({products.length})
              </h3>
              <p className="text-xs text-slate-500">{t('admin_audit_listings', 'Audit listings, review AI pricing integrity, and remove non-compliant items')}</p>
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                value={searchFilter}
                onChange={(e) => setSearchFilter(e.target.value)}
                placeholder={t('admin_filter_placeholder', 'Filter by craft name or category...')}
                className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-semibold"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {products
              .filter(p => !searchFilter || p.name.toLowerCase().includes(searchFilter.toLowerCase()) || p.category.toLowerCase().includes(searchFilter.toLowerCase()))
              .map((prod) => (
                <div key={prod.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-200 flex flex-col justify-between space-y-3">
                  <div className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl bg-white border border-slate-200 overflow-hidden flex-shrink-0">
                      <img 
                        src={api.getImageUrl(prod.professional_image_url || prod.enhanced_image_url || prod.image_url)} 
                        alt={prod.name} 
                        className="w-full h-full object-cover" 
                      />
                    </div>
                    <div className="flex-1 space-y-0.5">
                      <span className="text-[10px] font-bold text-indigo-700 bg-indigo-100 px-2 py-0.5 rounded-full">
                        {prod.category}
                      </span>
                      <h4 className="font-bold text-slate-900 text-xs line-clamp-1">{prod.name}</h4>
                      <p className="text-[11px] text-slate-500 font-medium">{t('admin_by', 'By')} {prod.artisan_name || "Artisan"}</p>
                      <div className="text-xs font-black text-slate-900">
                        ₹{prod.selling_price} <span className="text-[10px] text-slate-400 font-normal">(Cost: ₹{prod.production_cost})</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex items-center justify-between text-xs">
                    <span className="px-2 py-0.5 bg-emerald-100 text-emerald-800 font-bold text-[10px] rounded-md">
                      {prod.authenticity_score}% GI Auth
                    </span>
                    <button
                      onClick={() => handleDeleteProduct(prod.id, prod.name)}
                      disabled={actionLoading}
                      className="px-3 py-1 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-lg text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{t('admin_remove_btn', 'Remove')}</span>
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* TAB 5: SYSTEM MAINTENANCE */}
      {activeTab === 'system' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div>
            <h3 className="text-lg font-black text-slate-900">{t('admin_maintenance_title', 'Ecosystem Maintenance & Reset Operations')}</h3>
            <p className="text-xs text-slate-500 mt-1">{t('admin_maintenance_subtitle', 'Manage demonstration presets and fast-cache clearing for Hackathon judges')}</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-5 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
              <div className="flex items-center gap-2 text-amber-900 font-bold text-sm">
                <Sparkles className="w-4 h-4 text-amber-600" />
                <span>{t('admin_seed_title', 'Pre-seed Authentic Indian Craft Dataset')}</span>
              </div>
              <p className="text-xs text-amber-800/80 leading-relaxed">
                {t('admin_seed_desc', 'Loads realistic GI certified crafts (Channapatna toys, Bankura terracotta, Varanasi silk saree) along with sample orders and shipment partner assignments.')}
              </p>
              <button
                onClick={handleSeedDemo}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-amber-500 hover:bg-amber-600 text-slate-950 font-black text-xs rounded-xl shadow transition-all"
              >
                {actionLoading ? 'Seeding...' : t('admin_seed_btn', 'Load Sample Demo Data')}
              </button>
            </div>

            <div className="p-5 rounded-2xl bg-rose-50/70 border border-rose-200 space-y-3">
              <div className="flex items-center gap-2 text-rose-900 font-bold text-sm">
                <Trash2 className="w-4 h-4 text-rose-600" />
                <span>{t('admin_clear_title', 'Fresh Start / Clear System Data')}</span>
              </div>
              <p className="text-xs text-rose-800/80 leading-relaxed">
                {t('admin_clear_desc', 'Wipes all recorded artisans, products, buyers, shipments and orders from SQLite database to allow clean end-to-end evaluation.')}
              </p>
              <button
                onClick={handleClearData}
                disabled={actionLoading}
                className="px-4 py-2.5 bg-rose-600 hover:bg-rose-700 text-white font-black text-xs rounded-xl shadow transition-all"
              >
                {actionLoading ? 'Wiping...' : t('admin_clear_btn', 'Clear All System Data')}
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
