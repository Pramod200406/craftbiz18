import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Home, Palette, ShoppingBag, Truck, Shield, Mic } from 'lucide-react';

export const MobileBottomNav = ({ currentView, setCurrentView, setCurrentRole, cartCount, openCart }) => {
  const { t, language } = useLanguage();

  const navItems = [
    {
      id: 'home',
      role: 'artisan',
      icon: Home,
      emoji: '🏠',
      label: t('nav_home', 'Home'),
      hindiLabel: 'होम'
    },
    {
      id: 'artisan',
      role: 'artisan',
      icon: Palette,
      emoji: '🎨',
      label: t('nav_artisan', 'Artisan'),
      hindiLabel: 'कारीगर',
      badge: '🎙️ Voice'
    },
    {
      id: 'buyer',
      role: 'buyer',
      icon: ShoppingBag,
      emoji: '🛍️',
      label: t('nav_buyer', 'Market'),
      hindiLabel: 'बाज़ार'
    },
    {
      id: 'courier',
      role: 'courier',
      icon: Truck,
      emoji: '🚚',
      label: t('nav_courier', 'Shipment'),
      hindiLabel: 'शिपमेंट'
    },
    {
      id: 'admin',
      role: 'admin',
      icon: Shield,
      emoji: '🛡️',
      label: t('nav_admin', 'Admin'),
      hindiLabel: 'व्यवस्थापक'
    }
  ];

  return (
    <nav 
      aria-label="Mobile Navigation"
      className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#24040b]/95 backdrop-blur-lg border-t border-[#540d1e]/90 shadow-[0_-8px_20px_rgba(36,4,11,0.7)] px-2 py-1.5 pb-safe"
    >
      <div className="flex items-center justify-around max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = currentView === item.id;
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => {
                setCurrentRole(item.role);
                setCurrentView(item.id);
              }}
              className={`relative flex flex-col items-center justify-center flex-1 py-1.5 px-1 rounded-2xl transition-all duration-200 cursor-pointer ${
                isActive
                  ? 'text-amber-300 font-black'
                  : 'text-rose-200/60 hover:text-rose-100'
              }`}
            >
              {/* Active pill background */}
              {isActive && (
                <span className="absolute inset-0 bg-[#891d35]/40 rounded-2xl border border-amber-400/40 -z-10 animate-in fade-in zoom-in-95 duration-150 shadow-sm" />
              )}

              {/* Icon / Emoji for Low-Literacy Accessibility */}
              <div className="relative">
                <span className="text-xl leading-none block mb-0.5">{item.emoji}</span>
                {item.id === 'artisan' && (
                  <span className="absolute -top-1 -right-2 w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                )}
              </div>

              {/* Primary Label */}
              <span className="text-[11px] font-bold tracking-tight line-clamp-1 leading-tight mt-0.5">
                {language === 'hi' ? item.hindiLabel : item.label}
              </span>

              {/* Micro badge for visual assistance */}
              {item.badge && (
                <span className="text-[9px] font-black text-amber-300/90 bg-amber-500/20 px-1 rounded-full uppercase leading-none mt-0.5">
                  {language === 'hi' ? 'बोलें' : 'Voice'}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
