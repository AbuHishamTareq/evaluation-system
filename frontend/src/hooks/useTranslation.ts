import { useState, useCallback, useEffect } from 'react';
import en from '../locale/en.json';
import ar from '../locale/ar.json';

type TranslationKeys = typeof en;

const translations: Record<string, TranslationKeys> = {
  en,
  ar,
};

export const useTranslation = (initialLang?: string) => {
  const [language, setLanguage] = useState(initialLang || 'en');

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

  return { t, language, setLanguage, toggleLanguage };
};

export default useTranslation;