import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const PUBLIC_DIR = path.join(ROOT, 'public');

async function loadDotEnvFile(filePath) {
  try {
    const raw = await fs.readFile(filePath, 'utf8');
    for (const line of raw.split(/\r?\n/)) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const separatorIndex = trimmed.indexOf('=');
      if (separatorIndex === -1) continue;
      const key = trimmed.slice(0, separatorIndex).trim();
      let value = trimmed.slice(separatorIndex + 1).trim();
      value = value.replace(/^['"]|['"]$/g, '');
      if (!(key in process.env)) process.env[key] = value;
    }
  } catch {
    // ignore missing env file
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
    .flatMap((value) => value.split(','))
    .map((value) => value.trim())
    .filter(Boolean);

  return (
    candidates.find(
      (value) =>
        /^https?:\/\//.test(value) &&
        !value.includes('localhost') &&
        !value.includes('ngrok') &&
        !value.includes('.local'),
    ) ||
    'https://jcalbarracin.vercel.app'
  );
}

function pickApiUrl() {
  return getEnv('VITE_API_URL') || getEnv('NEXT_PUBLIC_API_URL') || 'http://localhost:3000/api/v1';
}

async function safeJsonFetch(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) return null;
    return await response.json();
  } catch {
    return null;
  }
}

function buildUrl(siteUrl, pathname) {
  return new URL(pathname, siteUrl).toString();
}

function escapeXml(value) {
  return value
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&apos;');
}

async function collectUrls(siteUrl, apiUrl) {
  const urls = [
    { loc: buildUrl(siteUrl, '/'), priority: '1.0', changefreq: 'weekly' },
    { loc: buildUrl(siteUrl, '/projects'), priority: '0.9', changefreq: 'weekly' },
    { loc: buildUrl(siteUrl, '/blog'), priority: '0.9', changefreq: 'weekly' },
    { loc: buildUrl(siteUrl, '/stats'), priority: '0.6', changefreq: 'monthly' },
  ];

  const projects = await safeJsonFetch(`${apiUrl}/public/projects`);
  for (const project of projects ?? []) {
    if (!project?.id) continue;
    urls.push({
      loc: buildUrl(siteUrl, `/projects/${project.id}`),
      priority: '0.8',
      changefreq: 'monthly',
    });
  }

  const firstPage = await safeJsonFetch(`${apiUrl}/public/blog/articles?page=1&limit=100`);
  const articlePages = [];
  if (firstPage?.data) articlePages.push(firstPage);

  const totalPages = firstPage?.meta?.totalPages ?? 1;
  for (let page = 2; page <= totalPages; page += 1) {
    const response = await safeJsonFetch(`${apiUrl}/public/blog/articles?page=${page}&limit=100`);
    if (response?.data) articlePages.push(response);
  }

  for (const page of articlePages) {
    for (const article of page.data ?? []) {
      if (!article?.slug) continue;
      urls.push({
        loc: buildUrl(siteUrl, `/blog/${article.slug}`),
        priority: '0.7',
        changefreq: 'monthly',
      });
    }
  }

  return urls;
}

async function writeRobots(siteUrl) {
  const robots = `User-agent: *
Allow: /
Disallow: /admin
Disallow: /chatbot

Sitemap: ${buildUrl(siteUrl, '/sitemap.xml')}
`;

  await fs.writeFile(path.join(PUBLIC_DIR, 'robots.txt'), robots, 'utf8');
}

async function writeSitemap(urls) {
  const lastmod = new Date().toISOString().slice(0, 10);
  const body = urls
    .map(
      (url) => `  <url>
    <loc>${escapeXml(url.loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${url.changefreq}</changefreq>
    <priority>${url.priority}</priority>
  </url>`,
    )
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${body}
</urlset>
`;

  await fs.writeFile(path.join(PUBLIC_DIR, 'sitemap.xml'), xml, 'utf8');
}

async function main() {
  await loadDotEnvFile(path.join(ROOT, '.env'));
  await loadDotEnvFile(path.join(ROOT, '.env.local'));

  const siteUrl = pickSiteUrl();
  const apiUrl = pickApiUrl();
  const urls = await collectUrls(siteUrl, apiUrl);

  await fs.mkdir(PUBLIC_DIR, { recursive: true });
  await Promise.all([writeRobots(siteUrl), writeSitemap(urls)]);

  console.log(`SEO files generated for ${siteUrl} with ${urls.length} URLs`);
}

main().catch((error) => {
  console.error('Failed to generate SEO files:', error);
  process.exitCode = 1;
});
