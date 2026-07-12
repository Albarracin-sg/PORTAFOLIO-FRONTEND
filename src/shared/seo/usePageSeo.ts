import { useEffect } from 'react';
import { absoluteUrl, BRAND_NAME, DEFAULT_OG_IMAGE, SITE_NAME } from './config';
import { requireSeoString } from './requireString';

type SeoOptions = {
  title: string;
  description: string;
  path?: string;
  type?: 'website' | 'article' | 'profile';
  image?: string;
  robots?: string;
  keywords?: string[];
  publishedTime?: string | null;
};

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector);
  if (!element) {
    element = document.createElement('meta');
    if ('name' in attributes) element.setAttribute('name', attributes.name);
    if ('property' in attributes) element.setAttribute('property', attributes.property);
    document.head.appendChild(element);
  }

  for (const [key, value] of Object.entries(attributes)) {
    element.setAttribute(key, value);
  }
}

function upsertLink(rel: string, href: string) {
  let element = document.head.querySelector<HTMLLinkElement>(`link[rel="${rel}"]`);
  if (!element) {
    element = document.createElement('link');
    element.setAttribute('rel', rel);
    document.head.appendChild(element);
  }
  element.setAttribute('href', href);
}

export function usePageSeo({
  title,
  description,
  path = '/',
  type = 'website',
  image = DEFAULT_OG_IMAGE,
  robots = 'index, follow',
  keywords = [],
  publishedTime,
}: SeoOptions) {
  useEffect(() => {
    const seoTitle = requireSeoString(title, 'SEO title');
    const seoDescription = requireSeoString(description, 'SEO description');
    const canonical = absoluteUrl(path);
    const fullTitle = seoTitle.includes(BRAND_NAME) ? seoTitle : `${seoTitle} | ${BRAND_NAME}`;

    document.title = fullTitle;
    document.documentElement.setAttribute('lang', 'es');

    upsertMeta('meta[name="description"]', { name: 'description', content: seoDescription });
    upsertMeta('meta[name="robots"]', { name: 'robots', content: robots });
    upsertMeta('meta[name="author"]', { name: 'author', content: BRAND_NAME });

    if (keywords.length > 0) {
      upsertMeta('meta[name="keywords"]', { name: 'keywords', content: keywords.join(', ') });
    }

    upsertLink('canonical', canonical);

    upsertMeta('meta[property="og:type"]', { property: 'og:type', content: type === 'article' ? 'article' : 'website' });
    upsertMeta('meta[property="og:title"]', { property: 'og:title', content: fullTitle });
    upsertMeta('meta[property="og:description"]', { property: 'og:description', content: seoDescription });
    upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonical });
    upsertMeta('meta[property="og:site_name"]', { property: 'og:site_name', content: SITE_NAME });
    upsertMeta('meta[property="og:image"]', { property: 'og:image', content: image });

    upsertMeta('meta[name="twitter:card"]', { name: 'twitter:card', content: 'summary_large_image' });
    upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: fullTitle });
    upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: seoDescription });
    upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: image });

    if (publishedTime) {
      upsertMeta('meta[property="article:published_time"]', {
        property: 'article:published_time',
        content: publishedTime,
      });
    }
  }, [description, image, keywords, path, publishedTime, robots, title, type]);
}
