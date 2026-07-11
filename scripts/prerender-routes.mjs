import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const BUILD_DIR = path.join(ROOT, 'build');
const DEFAULT_SITE_URL = 'https://jcalbarracin.vercel.app';

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

// ---------------------------------------------------------------------------
// Route collection
// ---------------------------------------------------------------------------

async function collectRoutes(apiUrl) {
  const routes = [
    {
      path: '/',
      title: 'Juan Camilo Albarracin | Portafolio Full-Stack Backend e IA',
      description:
        'Portafolio de Juan Camilo Albarracin Urrego. Full-Stack Engineer con foco en backend, microservicios, NestJS, DDD, CQRS, arquitectura distribuida e integracion de IA y MCP en Bogota, Colombia.',
    },
    {
      path: '/projects',
      title: 'Proyectos | Juan Camilo Albarracin',
      description:
        'Proyectos de desarrollo backend, microservicios e integracion de IA de Juan Camilo Albarracin. NestJS, Node.js, TypeScript, Docker.',
    },
    {
      path: '/blog',
      title: 'Blog | Juan Camilo Albarracin',
      description:
        'Blog de Juan Camilo Albarracin. Articulos sobre backend, microservicios, NestJS, arquitectura distribuida e integracion de IA.',
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
    routes.push({
      path: `/projects/${project.id}`,
      title: `${project.name || 'Proyecto'} | Juan Camilo Albarracin`,
      description:
        project.description || `Proyecto de Juan Camilo Albarracin.`,
    });
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
    routes.push({
      path: `/blog/${article.slug}`,
      title: `${article.title || 'Articulo'} | Juan Camilo Albarracin`,
      description:
        article.excerpt ||
        article.metaDescription ||
        `Articulo por Juan Camilo Albarracin.`,
    });
  }

  return routes;
}

// ---------------------------------------------------------------------------
// HTML generation
// ---------------------------------------------------------------------------

function escapeHtml(str) {
  return String(str ?? '')
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;');
}

function generateRouteContent(route) {
  if (route.path === '/') return null;

  const heading = String(route.title ?? '').split('|')[0].trim();

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
    </main>`;
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
  if (routeContent) {
    const rootStart = html.indexOf('<div id="root">');
    if (rootStart !== -1) {
      // Find the matching closing </div> for the root div, counting nesting
      let depth = 0;
      let rootEnd = -1;
      for (let i = rootStart; i < html.length; i++) {
        if (html.startsWith('<div', i)) depth++;
        if (html.startsWith('</div>', i)) {
          depth--;
          if (depth === 0) { rootEnd = i; break; }
        }
      }
      if (rootEnd !== -1) {
        // Replace only the root div content; preserve <script> tags after it
        html =
          html.slice(0, rootStart) +
          `<div id="root">${routeContent}</div>` +
          html.slice(rootEnd + 6); // +6 = length of '</div>'
      }
    }
  }

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
    if (route.path === '/') {
      skipped++;
      continue;
    }

    const html = generateRouteHtml(template, route, siteUrl);
    const filePath = path.join(BUILD_DIR, route.path, 'index.html');

    await fs.mkdir(path.dirname(filePath), { recursive: true });
    await fs.writeFile(filePath, html, 'utf8');
    generated++;
  }

  console.log(
    `[prerender] Generated ${generated} route shells, skipped ${skipped} (homepage kept as-is)`,
  );
}

main().catch((error) => {
  console.error('[prerender] Script failed:', error);
  process.exitCode = 1;
});
