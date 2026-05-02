import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from './locales/es.json';
import en from './locales/en.json';

function detectBrowserLanguage(): string {
  const saved = localStorage.getItem('language');
  if (saved && ['es', 'en'].includes(saved)) return saved;
  const browser = navigator.language.split('-')[0];
  return ['es', 'en'].includes(browser) ? browser : 'es';
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
