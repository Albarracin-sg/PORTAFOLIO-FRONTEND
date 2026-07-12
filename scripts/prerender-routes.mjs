import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const BUILD_DIR = path.join(ROOT, 'build');
const DEFAULT_SITE_URL = 'https://jcalbarracin.vercel.app';
const DEFAULT_OG_IMAGE = `${DEFAULT_SITE_URL}/opengraph-image.svg`;

// ---------------------------------------------------------------------------
// Env loading
// ---------------------------------------------------------------------------

async function loadDotEnvFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const sep = trimmed.indexOf('=');
      if (sep === -1) continue;
      const key = trimmed.slice(0, sep).trim();
      const value = trimmed.slice(sep + 1).trim().replace(/^['"]|['"]$/g, '');
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // missing env file is fine
  }
}

function getEnv(name, fallback = '') {
  return process.env[name] || fallback;
}

function pickSiteUrl() {
  const candidates = [
    getEnv('VITE_SITE_URL'),
    getEnv('VITE_PUBLIC_SITE_URL'),
    getEnv('NEXT_PUBLIC_SITE_URL'),
  ]
    .flatMap((v) => v.split(','))
    .map((v) => v.trim())
    .filter(Boolean);

  return (
    candidates.find(
      (v) =>
        /^https?:\/\//.test(v) &&
        !v.includes('localhost') &&
        !v.includes('ngrok') &&
        !v.includes('.local'),
    ) || DEFAULT_SITE_URL
  );
}

function pickApiUrl() {
  return getEnv('VITE_API_URL') || getEnv('NEXT_PUBLIC_API_URL') || 'http://localhost:3000/api/v1';
}

// ---------------------------------------------------------------------------
// API fetching with retry + timeout
// ---------------------------------------------------------------------------

async function safeJsonFetch(url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const response = await fetch(url, { signal: AbortSignal.timeout(8000) });
      if (!response.ok) {
        if (attempt < retries) {
          await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
          continue;
        }
        return null;
      }
      return await response.json();
    } catch {
      if (attempt < retries) {
        await new Promise((r) => setTimeout(r, 300 * (attempt + 1)));
        continue;
      }
      return null;
    }
  }
  return null;
}

function localizedText(value, field, fallback) {
  if (typeof value === 'string' && value.trim()) return value.trim();

  if (value && typeof value === 'object' && !Array.isArray(value)) {
    for (const locale of ['es', 'en']) {
      const candidate = value[locale];
      if (typeof candidate === 'string' && candidate.trim()) return candidate.trim();
    }
  }

  if (fallback) return fallback;
  throw new TypeError(`${field} must be a non-empty string or localized text record`);
}

// ---------------------------------------------------------------------------
// Route collection
// ---------------------------------------------------------------------------

async function collectRoutes(apiUrl) {
  const routes = [
    {
      path: '/',
      title: 'Albarracín Portafolio | Juan Camilo Albarracín — Backend e IA',
      heading: 'Portafolio de Juan Camilo Albarracín',
      description:
        'Portafolio de Juan Camilo Albarracín: proyectos de software, backend, microservicios, NestJS, TypeScript e integración de inteligencia artificial.',
    },
    {
      path: '/projects',
      title: 'Proyectos Backend e IA | Juan Camilo Albarracin',
      description:
        'Casos de estudio sobre APIs, microservicios, automatización e integración de IA desarrollados con NestJS, TypeScript, PostgreSQL y Docker.',
    },
    {
      path: '/blog',
      title: 'Blog de Backend, Microservicios e IA | Juan Camilo Albarracin',
      description:
        'Artículos técnicos sobre NestJS, arquitectura backend, sistemas distribuidos, PostgreSQL, observabilidad e integración segura de IA.',
    },
    {
      path: '/stats',
      title: 'Estadisticas | Juan Camilo Albarracin',
      description:
        'Estadisticas y metricas del portafolio de Juan Camilo Albarracin.',
    },
  ];

  // Dynamic: projects
  const projects = await safeJsonFetch(`${apiUrl}/public/projects`);
  if (!projects) {
    console.warn('[prerender] Could not fetch projects from API — skipping dynamic project routes');
  }
  for (const project of projects ?? []) {
    if (!project?.id) continue;
    const projectName = localizedText(project.name ?? project.title, `project ${project.id} name`, 'Proyecto');
    const projectDescription = localizedText(
      project.description,
      `project ${project.id} description`,
      'Proyecto de Juan Camilo Albarracin.',
    );
    routes.push({
      path: `/projects/${project.id}`,
      title: `${projectName} | Juan Camilo Albarracin`,
      description: projectDescription,
      heading: projectName,
    });
  }
  const projectsRoute = routes.find((route) => route.path === '/projects');
  if (projectsRoute) {
    projectsRoute.items = (projects ?? [])
      .filter((project) => project?.id)
      .map((project) => ({
        href: `/projects/${project.id}`,
        title: localizedText(project.name ?? project.title, `project ${project.id} name`, 'Proyecto'),
        description: localizedText(project.description, `project ${project.id} description`, ''),
      }));
  }

  // Dynamic: blog articles (paginated)
  const firstPage = await safeJsonFetch(
    `${apiUrl}/public/blog/articles?page=1&limit=100`,
  );
  if (!firstPage) {
    console.warn('[prerender] Could not fetch blog articles from API — skipping dynamic blog routes');
  }
  const articles = [...(firstPage?.data ?? [])];
  const totalPages = firstPage?.meta?.totalPages ?? 1;
  for (let page = 2; page <= totalPages; page++) {
    const response = await safeJsonFetch(
      `${apiUrl}/public/blog/articles?page=${page}&limit=100`,
    );
    if (response?.data) articles.push(...response.data);
  }

  for (const article of articles) {
    if (!article?.slug) continue;
    const articleDetail = await safeJsonFetch(`${apiUrl}/public/blog/articles/${article.slug}`);
    const articleContent = articleDetail?.content ?? articleDetail?.data?.content;
    const articleTitle = localizedText(article.title, `article ${article.slug} title`, 'Artículo');
    const articleDescription = localizedText(
      article.excerpt ?? article.metaDescription,
      `article ${article.slug} description`,
      'Artículo técnico por Juan Camilo Albarracin.',
    );
    routes.push({
      path: `/blog/${article.slug}`,
      title: `${articleTitle} | Juan Camilo Albarracin`,
      description: articleDescription,
      heading: articleTitle,
      type: 'article',
      publishedTime: typeof article.publishedAt === 'string' ? article.publishedAt : undefined,
      body: articleContent
        ? localizedText(articleContent, `article ${article.slug} content`)
        : '',
    });
  }
  const blogRoute = routes.find((route) => route.path === '/blog');
  if (blogRoute) {
    blogRoute.items = articles
      .filter((article) => article?.slug)
      .map((article) => ({
        href: `/blog/${article.slug}`,
        title: localizedText(article.title, `article ${article.slug} title`, 'Artículo'),
        description: localizedText(article.excerpt ?? article.metaDescription, `article ${article.slug} description`, ''),
      }));
  }

  return routes;
}

// ---------------------------------------------------------------------------
// HTML generation
// ---------------------------------------------------------------------------

function escapeHtml(value) {
  const str = localizedText(value, 'HTML content', '');
  return str
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function generateRouteContent(route) {
  const heading = route.heading ?? localizedText(route.title, 'route title').split('|')[0].trim();
  const body = route.body
    ? `<section aria-label="Contenido del artículo" style="margin-top:40px"><h2 style="font-size:1.5rem">Artículo</h2><div style="white-space:pre-wrap">${escapeHtml(route.body)}</div></section>`
    : '';
  const items = route.items?.length
    ? `<section aria-label="Contenido publicado" style="margin-top:40px"><h2 style="font-size:1.5rem">Contenido publicado</h2><ul style="padding-left:20px">${route.items
        .map(
          (item) => `<li style="margin:16px 0"><a href="${escapeHtml(item.href)}"><strong>${escapeHtml(item.title)}</strong></a><p style="margin:4px 0;color:#52525b">${escapeHtml(item.description)}</p></li>`,
        )
        .join('')}</ul></section>`
    : '';

  return `
    <main style="max-width:960px;margin:0 auto;padding:48px 20px;font-family:Inter,system-ui,sans-serif;line-height:1.6;color:#18181b">
      <header>
        <p style="margin:0 0 8px;color:#6d28d9;font-weight:700;letter-spacing:.08em;text-transform:uppercase">Portafolio profesional</p>
        <h1 style="margin:0 0 16px;font-size:clamp(2rem,5vw,3.5rem);line-height:1.1">${escapeHtml(heading)}</h1>
        <p style="margin:0 0 24px;font-size:1.05rem;color:#52525b">${escapeHtml(route.description)}</p>
        <nav aria-label="Enlaces principales" style="display:flex;gap:16px;flex-wrap:wrap">
          <a href="/">Inicio</a>
          <a href="/projects">Proyectos</a>
          <a href="/blog">Blog</a>
        </nav>
       </header>
       ${body}
       ${items}
     </main>`;
}

function generateStructuredData(route, canonical) {
  const breadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Inicio', item: new URL('/', canonical).toString() },
      { '@type': 'ListItem', position: 2, name: route.heading ?? route.title, item: canonical },
    ],
  };
  const data = route.type === 'article'
    ? [
        {
          '@context': 'https://schema.org',
          '@type': 'Article',
          headline: route.heading,
          description: route.description,
          image: DEFAULT_OG_IMAGE,
          datePublished: route.publishedTime,
          author: { '@type': 'Person', name: 'Juan Camilo Albarracín' },
          mainEntityOfPage: canonical,
        },
        breadcrumb,
      ]
    : [breadcrumb];

  return data
    .map((entry) => `<script type="application/ld+json">${JSON.stringify(entry).replaceAll('</script>', '<\\/script>')}</script>`)
    .join('');
}

function generateRouteHtml(template, route, siteUrl) {
  let html = template;
  const canonical = new URL(route.path, siteUrl).toString();
  const escapedTitle = escapeHtml(route.title);
  const escapedDesc = escapeHtml(route.description);
  const escapedCanonical = escapeHtml(canonical);

  html = html.replace(
    /<title>[^<]*<\/title>/,
    `<title>${escapedTitle}</title>`,
  );

  html = html.replace(
    /<meta\s+property="og:image"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:image" content="${DEFAULT_OG_IMAGE}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:image"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:image" content="${DEFAULT_OG_IMAGE}" />`,
  );
  html = html.replace(
    /<meta\s+name="description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="description" content="${escapedDesc}" />`,
  );
  html = html.replace(
    /<link\s+rel="canonical"\s+href="[^"]*"\s*\/?>/,
    `<link rel="canonical" href="${escapedCanonical}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:title"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:title" content="${escapedTitle}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:type"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:type" content="${route.type === 'article' ? 'article' : 'website'}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:description"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:description" content="${escapedDesc}" />`,
  );
  html = html.replace(
    /<meta\s+property="og:url"\s+content="[^"]*"\s*\/?>/,
    `<meta property="og:url" content="${escapedCanonical}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:title"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:title" content="${escapedTitle}" />`,
  );
  html = html.replace(
    /<meta\s+name="twitter:description"\s+content="[^"]*"\s*\/?>/,
    `<meta name="twitter:description" content="${escapedDesc}" />`,
  );

  const routeContent = generateRouteContent(route);
  html = html.replace(
    /<div id="root">[\s\S]*?<\/div>\s*<noscript>/,
    `<div id="root">${routeContent}</div><noscript>`,
  );
  html = html.replace('</body>', `${generateStructuredData(route, canonical)}</body>`);

  return html;
}

// ---------------------------------------------------------------------------
// Main
// ---------------------------------------------------------------------------

async function main() {
  await loadDotEnvFile(path.join(ROOT, '.env'));
  await loadDotEnvFile(path.join(ROOT, '.env.local'));

  const siteUrl = pickSiteUrl();
  const apiUrl = pickApiUrl();

  let template;
  try {
    template = await fs.readFile(path.join(BUILD_DIR, 'index.html'), 'utf8');
  } catch {
    console.error('[prerender] Could not read build/index.html — run "vite build" first');
    process.exitCode = 1;
    return;
  }

  const routes = await collectRoutes(apiUrl);

  let generated = 0;
  let skipped = 0;

  for (const route of routes) {
    const html = generateRouteHtml(template, route, siteUrl);
    const filePath = path.join(BUILD_DIR, route.path, 'index.html');

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, html, 'utf8');
    generated++;
  }

  console.log(
    `[prerender] Generated ${generated} static route shells, skipped ${skipped}`,
  );
}

main().catch((error) => {
  console.error('[prerender] Script failed:', error);
  process.exitCode = 1;
});
