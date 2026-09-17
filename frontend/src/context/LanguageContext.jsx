import React, { createContext, useContext, useState, useEffect } from 'react';
import en from '../translations/en.json';
import hi from '../translations/hi.json';

const translations = { en, hi };

const LanguageContext = createContext();

export const LanguageProvider = ({ children }) => {
  const [language, setLanguageState] = useState(() => {
    const saved = localStorage.getItem('craftbiz_lang');
    return (saved === 'hi') ? 'hi' : 'en';
  });

  const [hasSelectedLanguage, setHasSelectedLanguage] = useState(() => {
    return localStorage.getItem('craftbiz_lang_chosen') === 'true';
  });

  const setLanguage = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('craftbiz_lang', lang);
  };

  const confirmLanguageSelection = (lang) => {
    setLanguageState(lang);
    localStorage.setItem('craftbiz_lang', lang);
    localStorage.setItem('craftbiz_lang_chosen', 'true');
    setHasSelectedLanguage(true);
  };

  const reopenLanguageModal = () => {
    setHasSelectedLanguage(false);
  };

  const t = (key, fallback = '') => {
    const currentDict = translations[language] || translations['en'];
    return currentDict[key] || translations['en']?.[key] || fallback || key;
  };

  return (
    <LanguageContext.Provider value={{
      language,
      setLanguage,
      hasSelectedLanguage,
      confirmLanguageSelection,
      reopenLanguageModal,
      t
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
