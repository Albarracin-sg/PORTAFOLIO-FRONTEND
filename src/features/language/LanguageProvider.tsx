import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';

export type Language = 'es' | 'en';

const STORAGE_KEY = 'language';

export function useLanguage() {
  const { t, i18n: i18nInstance } = useTranslation();
  const [isChangingLang, setIsChangingLang] = useState(false);

  const language = (i18nInstance.language?.startsWith('es') ? 'es' : 'en') as Language;

  const setLanguage = useCallback((lang: Language) => {
    setIsChangingLang(true);
    localStorage.setItem(STORAGE_KEY, lang);
    i18nInstance.changeLanguage(lang).finally(() => {
      // Wait for React re-render with new translations before hiding spinner
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          setIsChangingLang(false);
        });
      });
    });
  }, [i18nInstance]);

  return { language, setLanguage, translations: t, isChangingLang };
}

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
