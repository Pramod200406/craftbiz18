import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import confetti from 'canvas-confetti';
import { X, Trash2, Plus, Minus, ShieldCheck, MapPin, CheckCircle, ArrowRight } from 'lucide-react';

export const CartDrawer = ({ isOpen, onClose, cartItems, onUpdateQuantity, onRemoveItem, onClearCart }) => {
  const { t } = useLanguage();

  const [deliveryAddress, setDeliveryAddress] = useState("IndieCraft Living HQ, 100ft Road, Indiranagar, Bengaluru - 560038");
  const [submitting, setSubmitting] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [lastOrderDetails, setLastOrderDetails] = useState(null);

  if (!isOpen) return null;

  const subtotal = cartItems.reduce((acc, item) => acc + item.selling_price * item.quantity, 0);
  const total = subtotal; // Free artisan cluster delivery for SIH prototype

  const handleCheckout = async () => {
    if (cartItems.length === 0) return;
    setSubmitting(true);
    try {
      // Create orders for all cart items
      const buyer = JSON.parse(localStorage.getItem('craftbiz_buyer') || '{"id": 1}');
      
      for (const item of cartItems) {
        await api.createOrder({
          buyer_id: buyer.id,
          product_id: item.id,
          quantity: item.quantity,
          delivery_address: deliveryAddress
        });
      }

      // Trigger celebration confetti
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 }
      });

      setOrderPlaced(true);
      setLastOrderDetails({
        count: cartItems.length,
        total: total,
        address: deliveryAddress
      });
      onClearCart();
    } catch (err) {
      alert(`Checkout failed: ${err.message}`);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-slate-950/70 backdrop-blur-sm animate-in fade-in">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col justify-between border-l border-slate-200">
          
          {/* Header */}
          <div className="p-6 border-b border-[#540d1e] flex items-center justify-between bg-gradient-to-r from-[#24040b] via-[#3b0713] to-[#540d1e] text-white">
            <h2 className="text-lg font-black text-white flex items-center gap-2">
              <span>🛍️</span>
              <span>{t('cart_title', 'Your Procurement Cart')}</span>
            </h2>
            <button
              onClick={() => { setOrderPlaced(false); onClose(); }}
              className="p-2 hover:bg-[#701328] rounded-full text-rose-200 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Body */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            
            {orderPlaced ? (
              <div className="text-center py-12 space-y-4 animate-in zoom-in-95">
                <div className="w-20 h-20 mx-auto rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center text-4xl shadow-lg">
                  🎉
                </div>
                <h3 className="text-2xl font-black text-slate-900">
                  {t('order_success', 'Order Placed Successfully!')}
                </h3>
                <p className="text-xs text-slate-600 max-w-xs mx-auto leading-relaxed">
                  Your craft consignment has been assigned to rural master artisans. A local courier partner will pick up and verify delivery using demo OTP: <strong className="text-amber-600">1234</strong>.
                </p>
                <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-left text-xs space-y-1">
                  <div><strong>Consignment Value:</strong> ₹{lastOrderDetails?.total}</div>
                  <div><strong>Delivery Destination:</strong> {lastOrderDetails?.address}</div>
                </div>
                <button
                  onClick={() => { setOrderPlaced(false); onClose(); }}
                  className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl shadow mt-4"
                >
                  Continue Browsing Marketplace
                </button>
              </div>
            ) : cartItems.length === 0 ? (
              <div className="text-center py-16 text-slate-400 space-y-3">
                <span className="text-5xl block">🛒</span>
                <p className="text-sm font-semibold text-slate-600">
                  {t('cart_empty', 'Your cart is empty. Explore authentic handcrafted masterpieces!')}
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {cartItems.map((item) => (
                  <div key={item.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex gap-4 items-center justify-between">
                    <div className="w-16 h-16 rounded-xl bg-white overflow-hidden flex-shrink-0 border border-slate-200">
                      <img
                        src={api.getImageUrl(item.professional_image_url || item.enhanced_image_url || item.image_url)}
                        alt={item.name}
                        className="w-full h-full object-cover"
                      />
                    </div>

                    <div className="flex-1 min-w-0">
                      <h4 className="text-xs font-bold text-slate-900 truncate">{item.name}</h4>
                      <span className="text-[11px] text-slate-500">{item.category}</span>
                      <div className="text-xs font-black text-slate-900 mt-1">₹{item.selling_price}</div>
                    </div>

                    <div className="flex flex-col items-end gap-2">
                      <button
                        onClick={() => onRemoveItem(item.id)}
                        className="text-slate-400 hover:text-rose-600 transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="flex items-center gap-2 bg-white rounded-lg border border-slate-200 px-2 py-0.5">
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity - 1)}
                          className="text-slate-500 hover:text-slate-900"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-slate-800">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.id, item.quantity + 1)}
                          className="text-slate-500 hover:text-slate-900"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {/* Delivery Address Input */}
                <div className="pt-4 border-t border-slate-200 space-y-2">
                  <label className="block text-xs font-bold text-slate-700 flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-indigo-600" />
                    <span>{t('delivery_address', 'Delivery Address & Pincode')}</span>
                  </label>
                  <textarea
                    rows="2"
                    value={deliveryAddress}
                    onChange={(e) => setDeliveryAddress(e.target.value)}
                    className="w-full p-3 bg-slate-50 border border-slate-300 rounded-xl text-xs font-medium text-slate-800 focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>
            )}

          </div>

          {/* Footer with checkout summary */}
          {!orderPlaced && cartItems.length > 0 && (
            <div className="p-6 bg-slate-50 border-t border-slate-200 space-y-4">
              <div className="space-y-1.5 text-xs text-slate-600">
                <div className="flex justify-between">
                  <span>{t('subtotal', 'Subtotal')}</span>
                  <span className="font-bold text-slate-900">₹{subtotal.toLocaleString('en-IN')}</span>
                </div>
                <div className="flex justify-between">
                  <span>{t('shipping', 'Shipping (Cluster Direct)')}</span>
                  <span className="font-bold text-emerald-600">{t('free', 'FREE')}</span>
                </div>
                <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                  <span>{t('total', 'Total Consignment Value')}</span>
                  <span className="text-lg text-[#891d35] font-black">₹{total.toLocaleString('en-IN')}</span>
                </div>
              </div>

              <button
                onClick={handleCheckout}
                disabled={submitting}
                className="w-full py-3.5 bg-gradient-to-r from-[#891d35] via-[#a82644] to-[#701328] hover:from-[#701328] hover:to-[#891d35] text-amber-200 border border-amber-400/40 font-black text-sm rounded-xl shadow-lg shadow-[#891d35]/30 transition-all flex items-center justify-center gap-2"
              >
                <ShieldCheck className="w-4 h-4 text-amber-300" />
                <span>{submitting ? 'Placing Order...' : t('place_order', 'Place Verified Order')}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>
      </div>
    </div>
  );
};
