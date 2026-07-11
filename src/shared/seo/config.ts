function pickPublicSiteUrl(...candidates: Array<string | undefined>) {
  const expanded = candidates
    .flatMap((candidate) => (candidate ?? '').split(','))
    .map((value) => value.trim())
    .filter(Boolean);

  const preferred = expanded.find(
    (value) =>
      /^https?:\/\//.test(value) &&
      !value.includes('localhost') &&
      !value.includes('ngrok') &&
      !value.includes('.local'),
  );
  return preferred || 'https://jcalbarracin.vercel.app';
}

export const DEFAULT_SITE_URL = pickPublicSiteUrl(
  import.meta.env.VITE_SITE_URL,
  import.meta.env.VITE_PUBLIC_SITE_URL,
  import.meta.env.NEXT_PUBLIC_SITE_URL,
);

export const SITE_NAME = 'Juan Camilo Albarracin | Portafolio Backend';
export const BRAND_NAME = 'Juan Camilo Albarracin';
export const DEFAULT_OG_IMAGE = `${DEFAULT_SITE_URL}/logo.png`;

export function absoluteUrl(path = '/') {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`;
  return new URL(normalizedPath, DEFAULT_SITE_URL).toString();
}
