import React, { useState, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { 
  Truck, Package, CheckCircle2, Clock, MapPin, IndianRupee, 
  ArrowRight, ShieldCheck, KeyRound, RefreshCw, AlertCircle, Sparkles, UserPlus
} from 'lucide-react';

export const CourierDashboard = () => {
  const { t } = useLanguage();

  const [courier, setCourier] = useState(() => {
    const saved = localStorage.getItem('craftbiz_courier');
    return saved ? JSON.parse(saved) : null;
  });

  const [showCourierModal, setShowCourierModal] = useState(false);
  const [courierForm, setCourierForm] = useState({
    name: '',
    phone: '',
    organization_name: '',
    location: 'Bengaluru, Karnataka'
  });

  const [availableOrders, setAvailableOrders] = useState([]);
  const [assignedOrders, setAssignedOrders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('available'); // available, deliveries
  const [selectedOrderForTracking, setSelectedOrderForTracking] = useState(null);

  // OTP Modal State
  const [otpModalOrder, setOtpModalOrder] = useState(null);
  const [enteredOtp, setEnteredOtp] = useState('');
  const [otpError, setOtpError] = useState('');
  const [notification, setNotification] = useState(null);

  const loadData = async () => {
    if (!courier?.id) {
      setShowCourierModal(true);
      return;
    }
    setLoading(true);
    try {
      const avail = await api.getAvailablePickups();
      setAvailableOrders(avail);

      const assigned = await api.getCourierOrders(courier.id);
      setAssignedOrders(assigned);

      if (assigned.length > 0 && !selectedOrderForTracking) {
        setSelectedOrderForTracking(assigned[0]);
      }
    } catch (err) {
      console.warn("Could not load courier data:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (courier?.id) {
      loadData();
    } else {
      setShowCourierModal(true);
    }
  }, [courier?.id]);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3000);
  };

  const handleRegisterCourier = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const newCourier = await api.registerCourier(courierForm);
      setCourier(newCourier);
      localStorage.setItem('craftbiz_courier', JSON.stringify(newCourier));
      setShowCourierModal(false);
      showNotification(`Welcome, ${newCourier.name}! Logistics account active.`);
    } catch (err) {
      showNotification(err.message, 'error');
    } finally {
      setLoading(false);
    }
  };

  const fillSampleCourier = () => {
    setCourierForm({
      name: "Suresh Kumar",
      phone: "99887" + Math.floor(10000 + Math.random() * 90000),
      organization_name: "DakSeva Craft Express Logistics",
      location: "Bengaluru Hub, Karnataka"
    });
  };

  const handleAcceptOrder = async (orderId) => {
    try {
      await api.acceptOrder(courier.id, orderId);
      showNotification(`Consignment #${orderId} accepted! Shifted to your active fleet.`);
      loadData();
      setActiveTab('deliveries');
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleShipOrder = async (orderId) => {
    try {
      await api.shipOrder(courier.id, orderId);
      showNotification(`Consignment #${orderId} is now In Transit!`);
      loadData();
    } catch (err) {
      showNotification(err.message, 'error');
    }
  };

  const handleVerifyAndDeliver = async () => {
    if (!otpModalOrder) return;
    if (enteredOtp.trim() !== '1234') {
      setOtpError('Invalid OTP! For this SIH prototype demonstration, enter Demo OTP: 1234');
      return;
    }

    try {
      await api.deliverOrder(courier.id, otpModalOrder.order_id, '1234');
      
      confetti({
        particleCount: 80,
        spread: 60,
        origin: { y: 0.7 }
      });

      showNotification(`Delivery successfully completed with OTP verification!`);
      setOtpModalOrder(null);
      setEnteredOtp('');
      setOtpError('');
      loadData();
    } catch (err) {
      setOtpError(err.message);
    }
  };

  const getStatusIndex = (status) => {
    switch (status) {
      case 'Pending': return 0;
      case 'Ready for Pickup': return 1;
      case 'Accepted by Courier': return 2;
      case 'Shipped': return 3;
      case 'Delivered': return 4;
      default: return 0;
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      
      {/* Toast */}
      {notification && (
        <div className="fixed bottom-6 right-6 z-50 px-5 py-3 rounded-2xl bg-slate-900 text-amber-400 border border-amber-500/40 shadow-2xl flex items-center gap-3 text-sm font-semibold animate-in slide-in-from-bottom">
          <Sparkles className="w-5 h-5 text-amber-400" />
          <span>{notification}</span>
        </div>
      )}

      {/* COURIER REGISTRATION MODAL */}
      {showCourierModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-emerald-200">
            <div className="flex items-center justify-between border-b border-slate-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-600">Fresh Shipment Partner</span>
                <h3 className="text-xl font-black text-slate-900 mt-0.5">🚚 Register as a Shipment Partner</h3>
              </div>
              <button
                type="button"
                onClick={fillSampleCourier}
                className="text-xs font-bold text-emerald-700 bg-emerald-100 hover:bg-emerald-200 px-3 py-1.5 rounded-xl transition-colors"
              >
                Auto-Fill Sample
              </button>
            </div>

            <form onSubmit={handleRegisterCourier} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Agent / Driver Name</label>
                <input
                  type="text"
                  required
                  value={courierForm.name}
                  onChange={(e) => setCourierForm({ ...courierForm, name: e.target.value })}
                  placeholder="e.g. Suresh Kumar"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    value={courierForm.phone}
                    onChange={(e) => setCourierForm({ ...courierForm, phone: e.target.value })}
                    placeholder="9988776655"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">Agency / Transport Name</label>
                  <input
                    type="text"
                    required
                    value={courierForm.organization_name}
                    onChange={(e) => setCourierForm({ ...courierForm, organization_name: e.target.value })}
                    placeholder="e.g. DakSeva Express"
                    className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">Operating Hub / Region</label>
                <input
                  type="text"
                  required
                  value={courierForm.location}
                  onChange={(e) => setCourierForm({ ...courierForm, location: e.target.value })}
                  placeholder="e.g. KSR Bengaluru Hub, Karnataka"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm font-semibold text-slate-900"
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-sm rounded-xl shadow-lg transition-all"
              >
                {loading ? 'Registering...' : 'Save & Open Shipment Hub'}
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Shipment Top Header */}
      <div className="bg-gradient-to-r from-slate-900 via-teal-950 to-emerald-950 rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6 border border-emerald-500/20">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500 text-slate-950 font-black text-3xl flex items-center justify-center shadow-lg shadow-emerald-500/30">
            🚚
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black">{courier?.organization_name || "New Shipment Partner"}</h1>
              <span className="px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30">
                Verified Shipment Partner
              </span>
            </div>
            <p className="text-slate-300 text-xs sm:text-sm mt-1">
              Field Agent: <span className="font-bold text-white">{courier?.name || "Agent"}</span> • Operating Zone: {courier?.location || "India"}
            </p>
          </div>
        </div>

        {/* Action Tabs & Switch Courier */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => setShowCourierModal(true)}
            className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-bold rounded-xl border border-slate-700 transition-all flex items-center gap-1"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>New Partner</span>
          </button>

          <div className="flex items-center gap-1.5 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800 text-xs sm:text-sm font-semibold">
            <button
              onClick={() => setActiveTab('available')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'available' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              📍 Available Pickups ({availableOrders.length})
            </button>
            <button
              onClick={() => setActiveTab('deliveries')}
              className={`px-4 py-2 rounded-xl transition-all ${
                activeTab === 'deliveries' ? 'bg-emerald-500 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
              }`}
            >
              📦 My Deliveries ({assignedOrders.length})
            </button>
          </div>
        </div>
      </div>

      {/* ANIMATED LOGISTICS TRACKER COMPONENT */}
      {selectedOrderForTracking && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border-2 border-emerald-100 shadow-xl space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg sm:text-xl font-black text-slate-900">
                  Live Consignment Tracking — Order #{selectedOrderForTracking.order_id}
                </h3>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-xs font-black">
                  {selectedOrderForTracking.status}
                </span>
              </div>
              <p className="text-xs text-slate-500 mt-1">
                {selectedOrderForTracking.product_name} • Value: ₹{selectedOrderForTracking.order_value}
              </p>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Demo Handover OTP: <strong className="text-amber-600 font-black">1234</strong>
            </div>
          </div>

          {/* 5-STAGE TIMELINE */}
          <div className="relative pt-6 pb-4">
            <div className="absolute top-10 left-6 right-6 h-2 bg-slate-100 rounded-full" />
            
            <div 
              style={{ width: `${(getStatusIndex(selectedOrderForTracking.status) / 4) * 100}%` }}
              className="absolute top-10 left-6 h-2 bg-gradient-to-r from-amber-500 via-emerald-500 to-emerald-600 rounded-full transition-all duration-700"
            />

            <div className="relative z-10 flex justify-between items-start text-center">
              {[
                { title: "🟡 Pending", label: "Artisan Packing", statusKey: "Pending" },
                { title: "📦 Ready", label: "Pickup Staged", statusKey: "Ready for Pickup" },
                { title: "🚚 Accepted", label: "Agent Assigned", statusKey: "Accepted by Courier" },
                { title: "🚛 Shipped", label: "In Transit", statusKey: "Shipped" },
                { title: "🟢 Delivered", label: "OTP Verified", statusKey: "Delivered" },
              ].map((step, idx) => {
                const currentIdx = getStatusIndex(selectedOrderForTracking.status);
                const isPassed = idx <= currentIdx;
                const isCurrent = idx === currentIdx;

                return (
                  <div key={idx} className="flex flex-col items-center flex-1">
                    <div className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs transition-all duration-300 border-2 ${
                      isCurrent
                        ? 'bg-emerald-500 text-white border-emerald-600 ring-4 ring-emerald-100 scale-110 shadow-lg'
                        : isPassed
                        ? 'bg-emerald-600 text-white border-emerald-700'
                        : 'bg-white text-slate-400 border-slate-200'
                    }`}>
                      {isPassed ? '✓' : idx + 1}
                    </div>
                    <span className={`text-[11px] sm:text-xs font-bold mt-2 ${isPassed ? 'text-slate-900' : 'text-slate-400'}`}>
                      {step.title}
                    </span>
                    <span className="text-[10px] text-slate-500 hidden sm:block">
                      {step.label}
                    </span>
                  </div>
                );
              })}
            </div>

            {/* Moving Truck */}
            <div 
              style={{ left: `calc(${(getStatusIndex(selectedOrderForTracking.status) / 4) * 88}% + 12px)` }}
              className="absolute top-3 transition-all duration-700 hidden sm:block animate-truck pointer-events-none"
            >
              <div className="p-1.5 bg-slate-950 text-amber-400 rounded-xl shadow-lg border border-amber-400/40">
                <Truck className="w-4 h-4" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 text-xs">
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-amber-600" /> Rural Artisan Pickup Point
              </span>
              <p className="font-bold text-slate-800">{selectedOrderForTracking.artisan_name}</p>
              <p className="text-slate-600">{selectedOrderForTracking.pickup_location}</p>
            </div>
            <div className="space-y-1">
              <span className="text-[10px] uppercase font-bold text-slate-400 flex items-center gap-1">
                <MapPin className="w-3 h-3 text-emerald-600" /> Buyer Consignment Destination
              </span>
              <p className="font-bold text-slate-800">{selectedOrderForTracking.buyer_name}</p>
              <p className="text-slate-600">{selectedOrderForTracking.delivery_address}</p>
            </div>
          </div>
        </div>
      )}

      {/* TAB 1: AVAILABLE PICKUPS */}
      {activeTab === 'available' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {t('available_pickups', 'Available Cluster Pickups')}
              </h2>
              <p className="text-xs text-slate-500">
                Artisan orders marked "Ready for Pickup" waiting for logistics dispatch
              </p>
            </div>
            <button 
              onClick={loadData}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {availableOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <span className="text-4xl block">📦</span>
              <p className="text-sm font-semibold text-slate-600">No pickups waiting at this moment.</p>
              <p className="text-xs text-slate-500">When artisans mark orders "Ready for Pickup", they will appear here instantly.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {availableOrders.map((ord) => (
                <div 
                  key={ord.order_id} 
                  className="bg-slate-50 rounded-2xl p-5 border border-slate-200 flex flex-col justify-between space-y-4 hover:border-emerald-400 transition-all"
                >
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-black text-slate-900">Order #{ord.order_id}</span>
                      <span className="text-sm font-black text-emerald-600">₹{ord.order_value}</span>
                    </div>
                    <h4 className="text-sm font-bold text-slate-800">{ord.product_name} (Qty: {ord.quantity})</h4>

                    <div className="space-y-1 text-xs text-slate-600 pt-2 border-t border-slate-200">
                      <div><strong className="text-slate-800">Pickup:</strong> {ord.artisan_name} ({ord.pickup_location})</div>
                      <div><strong className="text-slate-800">Deliver To:</strong> {ord.delivery_address}</div>
                    </div>
                  </div>

                  <button
                    onClick={() => handleAcceptOrder(ord.order_id)}
                    className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow transition-all flex items-center justify-center gap-1.5"
                  >
                    <Truck className="w-4 h-4" />
                    <span>{t('accept_pickup', 'Accept Pickup')}</span>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE & COMPLETED DELIVERIES */}
      {activeTab === 'deliveries' && (
        <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-sm space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold text-slate-900">
                {t('active_deliveries', 'Active Deliveries')}
              </h2>
              <p className="text-xs text-slate-500">
                Ship consignments and enter customer OTP upon physical delivery
              </p>
            </div>
            <button 
              onClick={loadData}
              className="p-2 hover:bg-slate-100 rounded-xl text-slate-600 transition-colors"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {assignedOrders.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <span className="text-4xl block">🚚</span>
              <p className="text-sm font-semibold text-slate-600">No active deliveries assigned yet.</p>
              <p className="text-xs text-slate-500">Go to "Available Pickups" to accept rural artisan consignments.</p>
            </div>
          ) : (
            <div className="space-y-4">
              {assignedOrders.map((ord) => (
                <div
                  key={ord.order_id}
                  onClick={() => setSelectedOrderForTracking(ord)}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                    selectedOrderForTracking?.order_id === ord.order_id
                      ? 'border-emerald-500 bg-emerald-50/40 shadow-sm'
                      : 'border-slate-200 bg-slate-50 hover:bg-white'
                  }`}
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900 text-sm">Order #{ord.order_id}</span>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-black ${
                        ord.status === 'Delivered' ? 'bg-emerald-100 text-emerald-800' :
                        ord.status === 'Shipped' ? 'bg-blue-100 text-blue-800' :
                        'bg-indigo-100 text-indigo-800'
                      }`}>
                        {ord.status}
                      </span>
                    </div>
                    <div className="text-xs font-semibold text-slate-800">
                      {ord.product_name} • Value: ₹{ord.order_value}
                    </div>
                    <div className="text-[11px] text-slate-500">
                      Destination: {ord.delivery_address}
                    </div>
                  </div>

                  <div className="flex items-center gap-2 w-full md:w-auto justify-end">
                    {ord.status === 'Accepted by Courier' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleShipOrder(ord.order_id); }}
                        className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow transition-all"
                      >
                        {t('mark_shipped', 'Mark as Shipped')}
                      </button>
                    )}

                    {ord.status === 'Shipped' && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setOtpModalOrder(ord); setOtpError(''); }}
                        className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow transition-all flex items-center gap-1.5"
                      >
                        <KeyRound className="w-3.5 h-3.5" />
                        <span>Verify OTP & Deliver</span>
                      </button>
                    )}

                    {ord.status === 'Delivered' && (
                      <span className="text-xs font-bold text-emerald-700 flex items-center gap-1">
                        <CheckCircle2 className="w-4 h-4" /> Delivered (OTP Verified)
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* OTP VERIFICATION MODAL */}
      {otpModalOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-sm p-4 animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-md w-full p-6 sm:p-8 space-y-6 shadow-2xl border border-slate-200">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 mx-auto rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center text-2xl shadow">
                🔐
              </div>
              <h3 className="text-xl font-black text-slate-900">
                Delivery OTP Verification
              </h3>
              <p className="text-xs text-slate-500">
                Ask the buyer for the 4-digit code provided on their order confirmation.
              </p>
              <div className="text-[11px] font-bold text-amber-700 bg-amber-50 px-3 py-1 rounded-lg inline-block">
                For SIH 2026 Demonstration, Demo OTP is: 1234
              </div>
            </div>

            <div className="space-y-3">
              <input
                type="text"
                maxLength={4}
                value={enteredOtp}
                onChange={(e) => { setEnteredOtp(e.target.value); setOtpError(''); }}
                placeholder="1234"
                className="w-full text-center text-3xl font-black tracking-widest px-4 py-3 bg-slate-50 border-2 border-slate-300 rounded-2xl focus:border-emerald-500 focus:outline-none"
              />
              {otpError && (
                <p className="text-xs text-rose-600 font-semibold text-center">{otpError}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <button
                onClick={() => setOtpModalOrder(null)}
                className="flex-1 py-3 border border-slate-300 rounded-xl text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                onClick={handleVerifyAndDeliver}
                className="flex-1 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs rounded-xl shadow-lg"
              >
                Confirm & Deliver
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
