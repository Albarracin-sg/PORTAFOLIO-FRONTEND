import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { translations } from '@/shared/translations';

export type Language = 'es' | 'en';

type LanguageContextValue = {
  language: Language;
  setLanguage: (lang: Language) => void;
  translations: typeof translations.es;
};

const LanguageContext = createContext<LanguageContextValue | null>(null);

const STORAGE_KEY = 'language';

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>('es');

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'es' || saved === 'en') {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

  const currentTranslations = translations[language];

  return (
    <LanguageContext.Provider value={{ language, setLanguage, translations: currentTranslations }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage(): LanguageContextValue {
  const ctx = useContext(LanguageContext);
  if (!ctx) throw new Error('useLanguage must be used within LanguageProvider');
  return ctx;
}
