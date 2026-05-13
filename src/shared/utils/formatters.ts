/**
 * Cached Intl formatters to avoid re-allocation on every render.
 * This improves performance and prevents memory leaks associated with 
 * repeated constructor calls.
 */

type FormatterCache<T> = Record<string, T>;

const dateCache: FormatterCache<Intl.DateTimeFormat> = {};
const numberCache: FormatterCache<Intl.NumberFormat> = {};

/**
 * Gets or creates a cached Intl.DateTimeFormat instance for the given locale and options.
 * Keyed by a combination of locale and stringified options.
 */
export const getDateTimeFormatter = (
  locale: string | string[],
  options?: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat => {
  const key = `${String(locale)}-${JSON.stringify(options)}`;
  if (!dateCache[key]) {
    dateCache[key] = new Intl.DateTimeFormat(locale, options);
  }
  return dateCache[key];
};

/**
 * Gets or creates a cached Intl.NumberFormat instance for the given locale and options.
 */
export const getNumberFormatter = (
  locale: string | string[],
  options?: Intl.NumberFormatOptions
): Intl.NumberFormat => {
  const key = `${String(locale)}-${JSON.stringify(options)}`;
  if (!numberCache[key]) {
    numberCache[key] = new Intl.NumberFormat(locale, options);
  }
  return numberCache[key];
};

/**
 * Truly hoisted common formatters to avoid any constructor call inside functions
 */
const shortTimeES = new Intl.DateTimeFormat('es', { hour: '2-digit', minute: '2-digit' });
const shortTimeEN = new Intl.DateTimeFormat('en', { hour: '2-digit', minute: '2-digit' });

/**
 * Common date formatters
 */
export const commonFormatters = {
  longDate: (locale: string) => getDateTimeFormatter(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }),
  shortDate: (locale: string) => getDateTimeFormatter(locale, {
    day: '2-digit',
    month: 'short',
    year: 'numeric'
  }),
  time: (locale: string) => getDateTimeFormatter(locale, {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit"
  }),
  shortTime: (locale: string) => {
    if (locale === 'es') return shortTimeES;
    if (locale === 'en') return shortTimeEN;
    return getDateTimeFormatter(locale, {
      hour: '2-digit',
      minute: '2-digit'
    });
  },
};
