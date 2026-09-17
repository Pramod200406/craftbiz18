import React, { useState } from 'react';
import { useLanguage } from '../context/LanguageContext';
import { Globe, CheckCircle, Sparkles, ArrowRight } from 'lucide-react';

export const LanguageModal = () => {
  const { hasSelectedLanguage, confirmLanguageSelection, language, setLanguage, t } = useLanguage();
  const [selectedLang, setSelectedLang] = useState(language || 'en');

  if (hasSelectedLanguage) return null;

  const languages = [
    {
      code: 'en',
      name: 'English',
      native: 'English',
      flag: '🇬🇧',
      region: 'National / Global Commerce',
      greeting: 'Welcome to India’s AI Artisans Platform'
    },
    {
      code: 'hi',
      name: 'Hindi',
      native: 'हिन्दी',
      flag: '🇮🇳',
      region: 'अखिल भारतीय शिल्प (Pan-India Crafts)',
      greeting: 'भारत के एआई हस्तशिल्प मंच में आपका स्वागत है'
    }
  ];

  const handleSelect = (code) => {
    setSelectedLang(code);
    setLanguage(code);
  };

  const handleConfirm = () => {
    confirmLanguageSelection(selectedLang);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/85 backdrop-blur-md p-4 animate-in fade-in duration-300">
      <div className="relative w-full max-w-2xl overflow-hidden rounded-3xl bg-white shadow-2xl border border-amber-100">
        {/* Header Ribbon */}
        <div className="bg-gradient-to-r from-slate-950 via-indigo-950 to-amber-950 p-6 sm:p-8 text-white relative">
          <div className="flex items-center gap-3.5 mb-2">
            <div className="p-3 bg-amber-500/20 backdrop-blur rounded-2xl border border-amber-400/40 text-amber-400">
              <Globe className="w-8 h-8 animate-spin-slow" />
            </div>
            <div>
              <span className="text-xs uppercase tracking-widest font-black text-amber-400">Smart India Hackathon 2026</span>
              <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
                🌐 {t('choose_language', 'Choose Your Language')} / भाषा चुनें
              </h1>
            </div>
          </div>
          <p className="text-slate-300 text-xs sm:text-sm max-w-xl mt-1">
            Select your preferred language. You can change this anytime from the top bar.
          </p>
        </div>

        {/* Language Selection Cards */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {languages.map((item) => {
              const isSelected = selectedLang === item.code;
              return (
                <button
                  key={item.code}
                  onClick={() => handleSelect(item.code)}
                  className={`group relative text-left p-5 rounded-2xl border-2 transition-all duration-200 flex flex-col justify-between cursor-pointer ${
                    isSelected
                      ? 'border-amber-500 bg-amber-50/70 shadow-lg shadow-amber-500/10 scale-[1.02]'
                      : 'border-slate-200 hover:border-amber-300 hover:bg-slate-50 bg-white'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute top-3 right-3 text-amber-600">
                      <CheckCircle className="w-6 h-6 fill-amber-500 text-white" />
                    </div>
                  )}
                  <div>
                    <div className="text-3xl mb-2">{item.flag}</div>
                    <div className="text-2xl font-black text-slate-900 group-hover:text-amber-700 transition-colors">
                      {item.native}
                    </div>
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                      {item.name}
                    </div>
                    <p className="text-xs text-slate-600 font-medium">
                      {item.greeting}
                    </p>
                  </div>

                  <div className="mt-4 pt-3 border-t border-slate-200/60 text-[11px] text-slate-500 font-semibold flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                    <span>{item.region}</span>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-100">
            <div className="text-xs text-slate-500 text-center sm:text-left font-medium">
              You can switch between English & हिन्दी anytime.
            </div>
            <button
              onClick={handleConfirm}
              className="w-full sm:w-auto px-8 py-3.5 bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/25 hover:shadow-orange-500/40 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2"
            >
              <span>{t('enter_app', 'Continue to CraftBiz')}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
