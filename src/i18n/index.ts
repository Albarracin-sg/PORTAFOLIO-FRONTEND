import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import en from './locales/en.json';

const SUPPORTED_LANGS = new Set(['es', 'en']);

function detectBrowserLanguage(): string {
  try {
    const saved = localStorage.getItem('language');
    if (saved && SUPPORTED_LANGS.has(saved)) return saved;

    // Detectar idiomas del navegador en orden de preferencia
    const languages = navigator.languages || [navigator.language];
    for (const lang of languages) {
      const shortLang = lang.split('-')[0].toLowerCase();
      if (SUPPORTED_LANGS.has(shortLang)) return shortLang;
    }
  } catch (e) {
    console.error('Error detecting language:', e);
  }
  return 'es';
}

i18n.use(initReactI18next).init({
  lng: detectBrowserLanguage(),
  fallbackLng: 'es',
  supportedLngs: ['es', 'en'],
  interpolation: { escapeValue: false },
  resources: {
    es: { translation: es },
    en: { translation: en },
  },
});

export { i18n };
export default i18n;
