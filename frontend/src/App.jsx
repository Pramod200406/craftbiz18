import React, { useState, useEffect } from 'react';
import { LanguageProvider, useLanguage } from './context/LanguageContext';
import { LanguageModal } from './components/LanguageModal';
import { Navbar } from './components/Navbar';
import { Homepage } from './components/Homepage';
import { ArtisanDashboard } from './components/ArtisanDashboard';
import { BuyerDashboard } from './components/BuyerDashboard';
import { CourierDashboard } from './components/CourierDashboard';
import { AdminDashboard } from './components/AdminDashboard';
import { CartDrawer } from './components/CartDrawer';
import { MobileBottomNav } from './components/MobileBottomNav';
import { Sparkles, Heart, Globe } from 'lucide-react';

function AppContent() {
  const { t, language } = useLanguage();

  // Navigation and Role State
  const [currentView, setCurrentView] = useState('home'); // 'home', 'artisan', 'buyer', 'courier', 'admin'
  const [currentRole, setCurrentRole] = useState('artisan'); // 'artisan', 'buyer', 'courier', 'admin'
  
  // Shopping Cart Persistent State
  const [cartItems, setCartItems] = useState(() => {
    try {
      const saved = localStorage.getItem('craftbiz_cart');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [isCartOpen, setIsCartOpen] = useState(false);

  // Save cart changes
  useEffect(() => {
    localStorage.setItem('craftbiz_cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const handleAddToCart = (product) => {
    setCartItems(prev => {
      const existing = prev.find(item => item.id === product.id);
      if (existing) {
        return prev.map(item =>
          item.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { ...product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      handleRemoveItem(productId);
      return;
    }
    setCartItems(prev =>
      prev.map(item => item.id === productId ? { ...item, quantity: newQty } : item)
    );
  };

  const handleRemoveItem = (productId) => {
    setCartItems(prev => prev.filter(item => item.id !== productId));
  };

  const handleClearCart = () => {
    setCartItems([]);
  };

  const handleSelectRole = (role) => {
    setCurrentRole(role);
    setCurrentView(role);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const cartCount = cartItems.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div className="min-h-screen flex flex-col bg-[#fdf8f9] text-[#24040b] selection:bg-[#891d35] selection:text-amber-200 font-sans">
      
      {/* 🌐 FIRST SCREEN: Language Selection Modal */}
      <LanguageModal />

      {/* Main Navbar */}
      <Navbar
        currentView={currentView}
        setCurrentView={setCurrentView}
        currentRole={currentRole}
        setCurrentRole={setCurrentRole}
        cartCount={cartCount}
        openCart={() => setIsCartOpen(true)}
      />

      {/* Main Content Area (Mobile Responsive with safe padding for MobileBottomNav) */}
      <main className="flex-1 pb-28 md:pb-12">
        {currentView === 'home' && (
          <Homepage onSelectRole={handleSelectRole} />
        )}

        {currentView === 'artisan' && (
          <ArtisanDashboard />
        )}

        {currentView === 'buyer' && (
          <BuyerDashboard onAddToCart={handleAddToCart} />
        )}

        {currentView === 'courier' && (
          <CourierDashboard />
        )}

        {currentView === 'admin' && (
          <AdminDashboard />
        )}
      </main>

      {/* Shopping Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        cartItems={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onClearCart={handleClearCart}
      />

      {/* Global Footer */}
      <footer className="bg-gradient-to-b from-[#24040b] via-[#1c0308] to-[#120105] text-white border-t border-[#540d1e] py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Subtle mandala watermark in footer */}
        <div className="absolute inset-0 bg-[url('/theme-pattern.png')] bg-center opacity-5 pointer-events-none mix-blend-screen" />
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#891d35] via-[#a82644] to-[#f3b954] text-white font-black text-xl flex items-center justify-center shadow-lg shadow-[#891d35]/30">
              🎨
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-black text-lg text-white tracking-tight">CRAFTBIZ<span className="text-amber-400">.AI</span></span>
                <span className="text-[10px] font-bold px-2 py-0.5 bg-amber-500/20 text-amber-300 rounded border border-amber-500/30">
                  SIH 2026
                </span>
              </div>
              <p className="text-xs text-rose-200/70">
                AI-Powered Virtual Business Manager & Digital Commerce Ecosystem for Indian Artisans
              </p>
            </div>
          </div>

          {/* Quick Role Jump */}
          <div className="flex items-center gap-4 text-xs font-bold text-slate-400">
            <button 
              onClick={() => handleSelectRole('artisan')} 
              className="hover:text-amber-400 transition-colors"
            >
              🎨 Artisan Hub
            </button>
            <span>•</span>
            <button 
              onClick={() => handleSelectRole('buyer')} 
              className="hover:text-amber-400 transition-colors"
            >
              🛍️ Buyer Marketplace
            </button>
            <span>•</span>
            <button 
              onClick={() => handleSelectRole('courier')} 
              className="hover:text-amber-400 transition-colors"
            >
              🚚 Shipment Partner
            </button>
          </div>

          <div className="text-xs text-slate-500 text-center md:text-right">
            Built with pride for Indian Heritage Crafts & Smart India Hackathon 2026.
          </div>
        </div>
      </footer>

      {/* Cross-Platform Mobile Bottom Navigation for Accessible Low-Literacy Usability */}
      <MobileBottomNav
        currentView={currentView}
        setCurrentView={setCurrentView}
        setCurrentRole={setCurrentRole}
        cartCount={cartCount}
        openCart={() => setIsCartOpen(true)}
      />

    </div>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <AppContent />
    </LanguageProvider>
  );
}
