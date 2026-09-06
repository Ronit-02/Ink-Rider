const config = require('../config/config.js');

const normalizeSiteUrl = siteUrl => String(siteUrl || '').replace(/\/+$/, '');

const escapeXml = value => String(value ?? '')
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')
  .replace(/"/g, '&quot;')
  .replace(/'/g, '&apos;');

const absoluteUrl = (siteUrl, path) => new URL(path, `${normalizeSiteUrl(siteUrl)}/`).toString();

const buildRobotsTxt = (siteUrl = config.FRONTEND_URL) => {
  const normalizedSiteUrl = normalizeSiteUrl(siteUrl);
  return [
    'User-agent: *',
    'Allow: /',
    'Disallow: /api/',
    'Disallow: /staff',
    'Disallow: /write',
    'Disallow: /settings',
    'Disallow: /notifications',
    'Disallow: /saved',
    'Disallow: /history',
    'Sitemap: ' + absoluteUrl(normalizedSiteUrl, '/sitemap.xml'),
    '',
  ].join('\n');
};

const buildSitemapXml = ({ siteUrl = config.FRONTEND_URL, entries = [] } = {}) => {
  const urls = entries.map(entry => {
    const lastmod = entry.lastmod ? `<lastmod>${escapeXml(new Date(entry.lastmod).toISOString())}</lastmod>` : '';
    const changefreq = entry.changefreq ? `<changefreq>${escapeXml(entry.changefreq)}</changefreq>` : '';
    const priority = entry.priority ? `<priority>${escapeXml(entry.priority)}</priority>` : '';
    return `  <url><loc>${escapeXml(absoluteUrl(siteUrl, entry.path))}</loc>${lastmod}${changefreq}${priority}</url>`;
  }).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
};

const publicSitemapEntries = ({ posts = [], profiles = [] } = {}) => [
  { path: '/', changefreq: 'daily', priority: '1.0' },
  { path: '/explore/trending', changefreq: 'hourly', priority: '0.8' },
  { path: '/search', changefreq: 'daily', priority: '0.6' },
  { path: '/collections', changefreq: 'daily', priority: '0.6' },
  { path: '/shorts', changefreq: 'daily', priority: '0.7' },
  ...posts.map(post => ({
    path: `/post/${post._id}`,
    lastmod: post.updatedAt || post.publicAt,
    changefreq: 'weekly',
    priority: '0.8',
  })),
  ...profiles.filter(profile => profile.handle).map(profile => ({
    path: `/author/${encodeURIComponent(profile.handle)}`,
    lastmod: profile.updatedAt,
    changefreq: 'weekly',
    priority: '0.6',
  })),
];

module.exports = { escapeXml, absoluteUrl, buildRobotsTxt, buildSitemapXml, publicSitemapEntries };
