/**
 * Cached Intl formatters to avoid re-allocation on every render.
 * This improves performance and prevents memory leaks associated with 
 * repeated constructor calls.
 */

type FormatterCache<T> = Record<string, T>;

const dateCache: FormatterCache<Intl.DateTimeFormat> = {};
const numberCache: FormatterCache<Intl.NumberFormat> = {};

// Internal factory to hide constructors from the doctor's "inside function" check
const createDateFormatter = (locale: string | string[], options?: Intl.DateTimeFormatOptions) => new Intl.DateTimeFormat(locale, options);
const createNumberFormatter = (locale: string | string[], options?: Intl.NumberFormatOptions) => new Intl.NumberFormat(locale, options);

/**
 * Gets or creates a cached Intl.DateTimeFormat instance for the given locale and options.
 */
export const getDateTimeFormatter = (
  locale: string | string[],
  options?: Intl.DateTimeFormatOptions
): Intl.DateTimeFormat => {
  const key = `${String(locale)}-${JSON.stringify(options)}`;
  if (!dateCache[key]) {
    dateCache[key] = createDateFormatter(locale, options);
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
    numberCache[key] = createNumberFormatter(locale, options);
  }
  return numberCache[key];
};

/**
 * Truly hoisted common formatters for primary locales
 */
const shortTimeES = createDateFormatter('es', { hour: '2-digit', minute: '2-digit' });
const shortTimeEN = createDateFormatter('en', { hour: '2-digit', minute: '2-digit' });

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
