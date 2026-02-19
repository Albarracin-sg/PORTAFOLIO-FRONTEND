import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { translations } from '@/shared/translations';
import { fetchPublicTranslations } from '@/shared/api/public';

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
  const [currentTranslations, setCurrentTranslations] = useState(translations.es);

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved === 'es' || saved === 'en') {
      setLanguageState(saved);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, language);
  }, [language]);

  useEffect(() => {
    let isActive = true;

    const loadTranslations = async () => {
      setCurrentTranslations(translations[language]);
      try {
        const records = await fetchPublicTranslations(language);
        if (!isActive) return;
        const merged = records.reduce<Record<string, unknown>>((acc, record) => {
          acc[record.namespace] = record.content;
          return acc;
        }, {});
        setCurrentTranslations({
          ...translations[language],
          ...(merged as typeof translations.es),
        });
      } catch {
        if (!isActive) return;
        setCurrentTranslations(translations[language]);
      }
    };

    loadTranslations();

    return () => {
      isActive = false;
    };
  }, [language]);

  const setLanguage = useCallback((lang: Language) => {
    setLanguageState(lang);
  }, []);

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
