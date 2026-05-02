import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '@/i18n';

export type Language = 'es' | 'en';

const STORAGE_KEY = 'language';

export function useLanguage() {
  const { t, i18n: i18nInstance } = useTranslation();

  const language = (i18nInstance.language?.startsWith('es') ? 'es' : 'en') as Language;

  const setLanguage = useCallback((lang: Language) => {
    localStorage.setItem(STORAGE_KEY, lang);
    void i18nInstance.changeLanguage(lang);
  }, [i18nInstance]);

  return { language, setLanguage, translations: t };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
