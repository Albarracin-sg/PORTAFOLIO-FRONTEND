/**
 * Truly hoisted Intl formatters to avoid re-allocation inside functions.
 * This improves performance and satisfies strict linting rules.
 */

// --- Pre-instantiated Formatters (Module Scope) ---

// Long Date
const longDateES = new Intl.DateTimeFormat('es', { year: 'numeric', month: 'long', day: 'numeric' });
const longDateEN = new Intl.DateTimeFormat('en', { year: 'numeric', month: 'long', day: 'numeric' });

// Short Date
const shortDateES = new Intl.DateTimeFormat('es', { day: '2-digit', month: 'short', year: 'numeric' });
const shortDateEN = new Intl.DateTimeFormat('en', { day: '2-digit', month: 'short', year: 'numeric' });

// Full Time
const timeES = new Intl.DateTimeFormat('es', { hour: "2-digit", minute: "2-digit", second: "2-digit" });
const timeEN = new Intl.DateTimeFormat('en', { hour: "2-digit", minute: "2-digit", second: "2-digit" });

// Short Time
const shortTimeES = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' });
const shortTimeEN = new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' });

// Generic Number (Decimal)
const numberES = new Intl.NumberFormat('es');
const numberEN = new Intl.NumberFormat('en');

/**
 * Common date formatters.
 * Returns the pre-instantiated formatter based on the locale.
 */
export const commonFormatters = {
  longDate: (locale: string) => locale === 'en' ? longDateEN : longDateES,
  shortDate: (locale: string) => locale === 'en' ? shortDateEN : shortDateES,
  time: (locale: string) => locale === 'en' ? timeEN : timeES,
  shortTime: (locale: string) => locale === 'en' ? shortTimeEN : shortTimeES,
};

/**
 * Gets a basic decimal number formatter.
 */
export const getNumberFormatter = (locale: string) => locale === 'en' ? numberEN : numberES;

/**
 * Fallback for dynamic formatters (used sparingly).
 * Note: Frequent use of this might be flagged by performance audits.
 */
const dynamicDateCache = new Map<string, Intl.DateTimeFormat>();
export const getDateTimeFormatter = (locale: string, options?: Intl.DateTimeFormatOptions) => {
  const key = `${locale}-${JSON.stringify(options)}`;
  if (!dynamicDateCache.has(key)) {
    dynamicDateCache.set(key, new Intl.DateTimeFormat(locale, options));
  }
  return dynamicDateCache.get(key)!;
};
