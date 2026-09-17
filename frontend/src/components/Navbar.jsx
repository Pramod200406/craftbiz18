import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { api } from '../services/api';
import { Globe, ShoppingBag, Sparkles, UserCheck, ChevronDown, Trash2 } from 'lucide-react';

export const Navbar = ({ currentView, setCurrentView, currentRole, setCurrentRole, cartCount, openCart }) => {
  const { language, setLanguage, reopenLanguageModal, t } = useLanguage();
  const [resetting, setResetting] = useState(false);

  const roleLabels = {
    artisan: { label: t('role_artisan', 'Artisan'), icon: '🎨', color: 'bg-amber-100 text-amber-900 border-amber-300' },
    buyer: { label: t('role_buyer', 'Buyer'), icon: '🛍️', color: 'bg-indigo-100 text-indigo-900 border-indigo-300' },
    courier: { label: t('role_courier', 'Shipment Partner'), icon: '🚚', color: 'bg-emerald-100 text-emerald-900 border-emerald-300' },
    admin: { label: t('nav_admin', 'Admin'), icon: '🛡️', color: 'bg-rose-100 text-rose-900 border-rose-300' },
  };

  const currentRoleInfo = roleLabels[currentRole] || roleLabels.artisan;

  const handleResetData = async () => {
    if (!window.confirm("Are you sure you want to clear all data and start completely fresh?")) return;
    setResetting(true);
    try {
      await api.clearSystemData();
      localStorage.removeItem('craftbiz_cart');
      localStorage.removeItem('craftbiz_artisan');
      localStorage.removeItem('craftbiz_buyer');
      localStorage.removeItem('craftbiz_courier');
      window.location.reload();
    } catch (err) {
      alert(`Reset error: ${err.message}`);
    } finally {
      setResetting(false);
    }
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-slate-900/95 backdrop-blur-md border-b border-slate-800 text-white shadow-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-2">
        
        {/* Brand Logo */}
        <div 
          onClick={() => setCurrentView('home')} 
          className="flex items-center gap-3 cursor-pointer group flex-shrink-0"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 via-orange-500 to-amber-300 p-0.5 shadow-md shadow-amber-500/20 group-hover:scale-105 transition-transform">
            <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center text-2xl">
              🎨
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xl sm:text-2xl font-black tracking-tight text-white group-hover:text-amber-400 transition-colors">
                CRAFTBIZ<span className="text-amber-500">.AI</span>
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-amber-500/20 border border-amber-500/30 text-amber-300 rounded-full hidden sm:inline-block">
                SIH 2026
              </span>
            </div>
            <p className="text-[11px] text-slate-400 hidden lg:block">
              India's AI Artisan Digital Ecosystem
            </p>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="hidden md:flex items-center gap-1 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800">
          <button
            onClick={() => setCurrentView('home')}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all ${
              currentView === 'home'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            {t('nav_home', 'Home')}
          </button>
          <button
            onClick={() => { setCurrentRole('artisan'); setCurrentView('artisan'); }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'artisan'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🎨</span>
            <span>{t('nav_artisan', 'Artisan')}</span>
          </button>
          <button
            onClick={() => { setCurrentRole('buyer'); setCurrentView('buyer'); }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'buyer'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🛍️</span>
            <span>{t('nav_buyer', 'Market')}</span>
          </button>
          <button
            onClick={() => { setCurrentRole('courier'); setCurrentView('courier'); }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'courier'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/30 font-bold'
                : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
            }`}
          >
            <span>🚚</span>
            <span>{t('nav_courier', 'Shipment')}</span>
          </button>
          <button
            onClick={() => { setCurrentRole('admin'); setCurrentView('admin'); }}
            className={`px-3.5 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-1.5 ${
              currentView === 'admin'
                ? 'bg-rose-600 text-white shadow-md shadow-rose-600/30 font-bold'
                : 'text-rose-300 hover:text-white hover:bg-rose-950/50'
            }`}
          >
            <span>🛡️</span>
            <span>{t('nav_admin', 'Admin')}</span>
          </button>
        </nav>

        {/* Right Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          
          {/* BIG PROMINENT LANGUAGE SWITCHER (User Request: "give language changing option a big first") */}
          <div className="flex items-center bg-gradient-to-r from-amber-500/20 via-orange-500/20 to-amber-500/10 border-2 border-amber-400/50 rounded-2xl p-1 shadow-md">
            <button
              onClick={reopenLanguageModal}
              title="Open Full Language Selector"
              className="px-2.5 py-1.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1 shadow transition-all mr-1"
            >
              <Globe className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Language</span>
            </button>
            <select
              value={language}
              onChange={(e) => setLanguage(e.target.value)}
              className="bg-slate-900/90 text-white text-xs sm:text-sm font-extrabold px-3 py-1.5 rounded-xl border border-amber-500/40 focus:outline-none focus:ring-2 focus:ring-amber-400 cursor-pointer shadow-inner"
            >
              <option value="en">🇬🇧 English</option>
              <option value="hi">🇮🇳 हिन्दी (Hindi)</option>
            </select>
          </div>

          {/* Reset Data Button */}
          <button
            onClick={handleResetData}
            disabled={resetting}
            title="Wipe database and start fresh"
            className="hidden xl:flex items-center gap-1 px-2.5 py-2 bg-slate-800 hover:bg-rose-950/60 text-slate-400 hover:text-rose-300 border border-slate-700 hover:border-rose-500/40 rounded-xl text-xs font-semibold transition-all"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>{resetting ? 'Resetting...' : 'Clear'}</span>
          </button>

          {/* Cart Icon Button */}
          <button
            onClick={openCart}
            className="relative p-2.5 bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/30 text-amber-400 rounded-xl transition-all"
            title={t('nav_cart', 'Cart')}
          >
            <ShoppingBag className="w-5 h-5" />
            {cartCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 bg-orange-600 text-white text-[11px] font-extrabold w-5 h-5 rounded-full flex items-center justify-center border-2 border-slate-900 shadow">
                {cartCount}
              </span>
            )}
          </button>
        </div>

      </div>

      {/* Mobile Accessible Status Banner (Low-Literacy Friendly) */}
      <div className="md:hidden flex items-center justify-between py-1.5 px-4 bg-slate-950/90 border-t border-slate-800/80 text-xs">
        <div className="flex items-center gap-1.5">
          <span className="text-sm">{currentRoleInfo.icon}</span>
          <span className="font-extrabold text-white text-xs">{currentRoleInfo.label}</span>
        </div>
        <div className="flex items-center gap-1.5 text-[11px] text-amber-400/90 bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-500/20 font-semibold">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
          <span>{t('badge_voice', 'Voice AI')} Active</span>
        </div>
      </div>
    </header>
  );
};
