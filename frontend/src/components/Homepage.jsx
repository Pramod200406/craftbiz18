import React from 'react';
import { useLanguage } from '../context/LanguageContext';
import { 
  Sparkles, Camera, Mic, IndianRupee, Users, Truck, ArrowRight, ShieldCheck, 
  Award, TrendingUp, PackageCheck, HeartHandshake, CheckCircle2 
} from 'lucide-react';

export const Homepage = ({ onSelectRole }) => {
  const { t } = useLanguage();

  const features = [
    {
      icon: Camera,
      title: t('badge_studio', 'AI Product Studio'),
      desc: 'Instant background removal with rembg and color enhancement with Pillow.',
      tag: 'Computer Vision',
      color: 'from-amber-500 to-orange-600',
      badge: '4-Step Studio'
    },
    {
      icon: Mic,
      title: t('badge_voice', 'Voice Catalogue'),
      desc: 'Speak in Kannada, Hindi, or English. OpenAI Whisper extracts names, cost, and stock.',
      tag: 'Speech-to-Entities',
      color: 'from-purple-500 to-indigo-600',
      badge: 'Whisper AI'
    },
    {
      icon: IndianRupee,
      title: t('badge_pricing', 'Smart Pricing'),
      desc: 'Algorithmic fair pricing ensuring livable wages and demand-calibrated margins.',
      tag: 'Dynamic Economics',
      color: 'from-emerald-500 to-teal-600',
      badge: 'Fair Wage Index'
    },
    {
      icon: Users,
      title: t('badge_matching', 'AI Buyer Matching'),
      desc: 'Multi-dimensional recommendation connecting corporate buyers with artisan clusters.',
      tag: 'B2B Recommender',
      color: 'from-blue-500 to-cyan-600',
      badge: '90%+ Match Score'
    },
    {
      icon: Truck,
      title: t('badge_logistics', 'Smart Logistics'),
      desc: 'Rural first-mile pickup integration with OTP delivery verification.',
      tag: 'Logistics Pipeline',
      color: 'from-rose-500 to-pink-600',
      badge: 'Live Tracking'
    }
  ];

  return (
    <div className="space-y-16 pb-20">
      
      {/* HERO SECTION */}
      <section className="relative overflow-hidden pt-12 pb-20 bg-gradient-to-b from-[#24040b] via-[#3b0713] to-[#540d1e] text-white rounded-b-[40px] shadow-2xl border-b border-[#701328]">
        
        {/* Subtle mandala background pattern from theme image */}
        <div className="absolute inset-0 bg-[url('/theme-pattern.png')] bg-center bg-cover opacity-15 pointer-events-none mix-blend-screen" />
        
        {/* Glow ambient spots in theme colors */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#891d35]/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/15 rounded-full blur-3xl pointer-events-none" />

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10 space-y-8">
          
          {/* Hackathon Header Badge */}
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#24040b]/90 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-semibold shadow-inner">
            <Sparkles className="w-4 h-4 text-amber-400" />
            <span>Smart India Hackathon 2026 Innovation</span>
            <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping" />
          </div>

          {/* Main Title */}
          <div className="space-y-4">
            <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black tracking-tight leading-tight">
              🎨 {t('hero_title', "India's Artisans. Powered by AI.")}
            </h1>
            <p className="max-w-3xl mx-auto text-base sm:text-xl text-rose-100/90 font-normal leading-relaxed">
              {t('hero_subtitle', 'Transforming traditional handlooms, pottery, and heritage crafts into thriving digital businesses with state-of-the-art Voice AI, Studio Enhancements, and Smart Logistics.')}
            </p>
          </div>

          {/* Key Value Points */}
          <div className="flex flex-wrap items-center justify-center gap-3 pt-2 text-xs sm:text-sm font-medium text-rose-100/90">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#24040b]/70 rounded-lg border border-[#701328]">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Studio-Grade Photography</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#24040b]/70 rounded-lg border border-[#701328]">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Multilingual Voice Cataloging</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#24040b]/70 rounded-lg border border-[#701328]">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Direct Fair-Trade Marketplace</span>
            </div>
            <div className="flex items-center gap-1.5 px-3 py-1 bg-[#24040b]/70 rounded-lg border border-[#701328]">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>OTP-Verified Logistics</span>
            </div>
          </div>

          {/* Premium Feature Badges Row */}
          <div className="pt-6 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <span className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#891d35]/40 to-[#a82644]/40 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold shadow flex items-center gap-2">
              <span>🎨</span> {t('badge_studio', 'AI Product Studio')}
            </span>
            <span className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#701328]/50 to-[#891d35]/40 border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-bold shadow flex items-center gap-2">
              <span>🎙</span> {t('badge_voice', 'Voice Catalogue')}
            </span>
            <span className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#891d35]/40 to-[#a82644]/40 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold shadow flex items-center gap-2">
              <span>💰</span> {t('badge_pricing', 'Smart Pricing')}
            </span>
            <span className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#701328]/50 to-[#891d35]/40 border border-amber-400/40 text-amber-200 text-xs sm:text-sm font-bold shadow flex items-center gap-2">
              <span>🤝</span> {t('badge_matching', 'AI Buyer Matching')}
            </span>
            <span className="px-4 py-2 rounded-2xl bg-gradient-to-r from-[#891d35]/40 to-[#a82644]/40 border border-amber-400/40 text-amber-300 text-xs sm:text-sm font-bold shadow flex items-center gap-2">
              <span>🚚</span> {t('badge_logistics', 'Smart Logistics')}
            </span>
          </div>
        </div>
      </section>

      {/* THREE USER ROLES SECTION */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
        <div className="text-center space-y-2">
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900">
            {t('role_select_title', 'Select Your Role')}
          </h2>
          <p className="text-slate-600 max-w-xl mx-auto text-sm sm:text-base">
            {t('role_select_subtitle', 'Experience tailored tools designed specifically for your craft ecosystem journey')}
          </p>
        </div>

        {/* FOUR USER ROLES SECTION */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          
          {/* 1. ARTISAN CARD */}
          <div 
            onClick={() => onSelectRole('artisan')}
            className="group relative bg-white rounded-3xl p-6 sm:p-7 border-2 border-amber-200/80 hover:border-amber-500 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 flex items-center justify-center text-2xl shadow-lg shadow-amber-500/20 mb-4">
                🎨
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-900 text-[11px] font-bold uppercase tracking-wider mb-2">
                Rural Artisans
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-amber-600 transition-colors">
                {t('role_artisan', 'I am an Artisan')}
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                {t('role_artisan_desc', 'Upload crafts via Voice AI, auto-enhance photography, get dynamic fair pricing, and fulfill bulk orders.')}
              </p>

              <div className="space-y-1.5 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>AI Product Studio (rembg)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Multilingual Voice (Whisper)</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                  <span>Dynamic Fair Smart Pricing</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between font-bold text-amber-700 text-xs">
              <span>Artisan Hub</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* 2. BUYER CARD */}
          <div 
            onClick={() => onSelectRole('buyer')}
            className="group relative bg-white rounded-3xl p-6 sm:p-7 border-2 border-indigo-200/80 hover:border-indigo-500 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-2xl shadow-lg shadow-indigo-500/20 mb-4">
                🛍️
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-indigo-100 text-indigo-900 text-[11px] font-bold uppercase tracking-wider mb-2">
                B2B & Retail
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-indigo-600 transition-colors">
                {t('role_buyer', 'I am a Buyer')}
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                {t('role_buyer_desc', 'Explore verified authentic GI-crafts, match with artisans, access bulk wholesale pricing, and track verified consignments.')}
              </p>

              <div className="space-y-1.5 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Curated GI Marketplace</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>AI Buyer Match Engine</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                  <span>Direct Fair Wholesale Rates</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between font-bold text-indigo-700 text-xs">
              <span>Marketplace</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* 3. SHIPMENT PARTNER CARD */}
          <div 
            onClick={() => onSelectRole('courier')}
            className="group relative bg-white rounded-3xl p-6 sm:p-7 border-2 border-emerald-200/80 hover:border-emerald-500 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-emerald-600 to-teal-600 flex items-center justify-center text-2xl shadow-lg shadow-emerald-500/20 mb-4">
                🚚
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-900 text-[11px] font-bold uppercase tracking-wider mb-2">
                Shipment Partners
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-emerald-600 transition-colors">
                {t('role_courier', 'Shipment Partner')}
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                {t('role_courier_desc', 'Find ready pickups from rural artisan clusters, manage deliveries with secure OTP, and earn reliable transport revenue.')}
              </p>

              <div className="space-y-1.5 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Rural Pickup Feed</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Secure 4-Digit OTP Handover</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Active Transit Dashboard</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between font-bold text-emerald-700 text-xs">
              <span>{t('nav_courier', 'Shipment')}</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

          {/* 4. ADMIN CARD (User Request: "1. Add admin role in this") */}
          <div 
            onClick={() => onSelectRole('admin')}
            className="group relative bg-white rounded-3xl p-6 sm:p-7 border-2 border-rose-200/80 hover:border-rose-500 shadow-xl hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-300 cursor-pointer flex flex-col justify-between overflow-hidden"
          >
            <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/10 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
            <div>
              <div className="w-14 h-14 rounded-2xl bg-gradient-to-tr from-rose-600 to-red-600 flex items-center justify-center text-2xl shadow-lg shadow-rose-500/20 mb-4 text-white">
                🛡️
              </div>
              <div className="inline-block px-2.5 py-0.5 rounded-full bg-rose-100 text-rose-900 text-[11px] font-bold uppercase tracking-wider mb-2">
                Platform Governance
              </div>
              <h3 className="text-xl font-bold text-slate-900 mb-2 group-hover:text-rose-600 transition-colors">
                {t('nav_admin', 'Admin')}
              </h3>
              <p className="text-slate-600 text-xs leading-relaxed mb-4">
                Oversee entire ecosystem analytics, audit orders, moderate artisan catalogues, and manage demonstration presets.
              </p>

              <div className="space-y-1.5 border-t border-slate-100 pt-3 text-[11px] font-semibold text-slate-700">
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Real-time GMV & Cluster Stats</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Cross-stakeholder Order Monitor</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  <span>Catalogue & Integrity Moderation</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-3 border-t border-slate-100 flex items-center justify-between font-bold text-rose-700 text-xs">
              <span>Admin Console</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1.5 transition-transform" />
            </div>
          </div>

        </div>
      </section>

      {/* DETAILED AI FEATURES GRID */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-slate-900 rounded-3xl p-8 sm:p-12 text-white border border-slate-800 shadow-xl space-y-10">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
            <div>
              <span className="text-xs uppercase tracking-widest font-bold text-amber-400">Core AI Engine</span>
              <h2 className="text-2xl sm:text-3xl font-bold">Cutting-Edge Technologies Built-In</h2>
            </div>
            <p className="text-sm text-slate-400 max-w-md">
              Engineered for low-connectivity rural hubs with high performance edge inference and resilient fallbacks.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((item, idx) => {
              const Icon = item.icon;
              return (
                <div key={idx} className="bg-slate-800/80 rounded-2xl p-6 border border-slate-700/80 space-y-4 hover:border-slate-600 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className={`p-3 rounded-xl bg-gradient-to-tr ${item.color} text-white shadow`}>
                      <Icon className="w-6 h-6" />
                    </div>
                    <span className="text-[11px] font-bold px-2.5 py-1 bg-slate-900 rounded-lg text-slate-300 border border-slate-700">
                      {item.badge}
                    </span>
                  </div>
                  <div>
                    <h4 className="text-lg font-bold text-white mb-1">{item.title}</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{item.desc}</p>
                  </div>
                  <div className="text-[11px] font-semibold text-amber-400/90 pt-2 border-t border-slate-700/50">
                    {item.tag}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

    </div>
  );
};
