import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import en from '../locale/en.json';
import ar from '../locale/ar.json';

type TranslationKeys = typeof en;

const translations: Record<string, TranslationKeys> = {
  en,
  ar,
};

interface TranslationContextType {
  t: (key: string) => string;
  language: 'en' | 'ar';
  toggleLanguage: () => void;
}

const TranslationContext = createContext<TranslationContextType | undefined>(undefined);

export const TranslationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<'en' | 'ar'>('en');

  useEffect(() => {
    document.documentElement.lang = language;
    document.documentElement.dir = language === 'ar' ? 'rtl' : 'ltr';
  }, [language]);

  const t = useCallback((key: string): string => {
    const keys = key.split('.');
    let result: unknown = translations[language];

    for (const k of keys) {
      if (result && typeof result === 'object' && k in result) {
        result = (result as Record<string, unknown>)[k];
      } else {
        return key;
      }
    }

    return typeof result === 'string' ? result : key;
  }, [language]);

  const toggleLanguage = useCallback(() => {
    setLanguage((prev) => (prev === 'en' ? 'ar' : 'en'));
  }, []);

  return (
    <TranslationContext.Provider value={{ t, language, toggleLanguage }}>
      {children}
    </TranslationContext.Provider>
  );
};

export const useTranslationContext = () => {
  const context = useContext(TranslationContext);
  if (!context) {
    throw new Error('useTranslationContext must be used within a TranslationProvider');
  }
  return context;
};