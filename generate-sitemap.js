import fs from 'fs';
import path from 'path';
import axios from 'axios';

const FRONTEND_URL = 'https://savitramfoundation.org';
const BACKEND_URL = 'https://savitramfoundation.com';

const staticRoutes = [
  { path: '/', priority: '1.0', changefreq: 'daily' },
  { path: '/donate', priority: '0.9', changefreq: 'daily' },
  { path: '/about', priority: '0.8', changefreq: 'weekly' },
  { path: '/our-work', priority: '0.8', changefreq: 'weekly' },
  { path: '/projects', priority: '0.8', changefreq: 'daily' },
  { path: '/events', priority: '0.8', changefreq: 'daily' },
  { path: '/news', priority: '0.8', changefreq: 'daily' },
  { path: '/crowdfunding', priority: '0.8', changefreq: 'daily' },
  { path: '/contact', priority: '0.7', changefreq: 'monthly' },
  { path: '/volunteer', priority: '0.7', changefreq: 'monthly' },
  { path: '/membership', priority: '0.7', changefreq: 'monthly' },
  { path: '/verify', priority: '0.5', changefreq: 'weekly' },
  { path: '/gallery', priority: '0.6', changefreq: 'weekly' },
  { path: '/privacy', priority: '0.3', changefreq: 'monthly' },
  { path: '/terms', priority: '0.3', changefreq: 'monthly' },
  { path: '/refund', priority: '0.3', changefreq: 'monthly' }
];

async function fetchDynamicRoutes() {
  const routes = [];
  const timestamp = new Date().toISOString();

  // 1. Projects
  try {
    const res = await axios.get(`${BACKEND_URL}/api/public/projects`);
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      res.data.data.forEach(item => {
        if (item._id) {
          routes.push({
            path: `/projects/${item._id}`,
            priority: '0.6',
            changefreq: 'weekly',
            lastmod: item.updatedAt || timestamp
          });
        }
      });
      console.log(`Fetched ${res.data.data.length} dynamic projects for sitemap.`);
    }
  } catch (err) {
    console.warn('Could not fetch dynamic projects, falling back to static only:', err.message);
  }

  // 2. Events
  try {
    const res = await axios.get(`${BACKEND_URL}/api/public/events`);
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      res.data.data.forEach(item => {
        if (item._id) {
          routes.push({
            path: `/events/${item._id}`,
            priority: '0.6',
            changefreq: 'weekly',
            lastmod: item.updatedAt || timestamp
          });
        }
      });
      console.log(`Fetched ${res.data.data.length} dynamic events for sitemap.`);
    }
  } catch (err) {
    console.warn('Could not fetch dynamic events, falling back to static only:', err.message);
  }

  // 3. Campaigns (Crowdfunding)
  try {
    const res = await axios.get(`${BACKEND_URL}/api/public/campaigns`);
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      res.data.data.forEach(item => {
        if (item._id) {
          routes.push({
            path: `/crowdfunding/${item._id}`,
            priority: '0.7',
            changefreq: 'daily',
            lastmod: item.updatedAt || timestamp
          });
        }
      });
      console.log(`Fetched ${res.data.data.length} dynamic campaigns for sitemap.`);
    }
  } catch (err) {
    console.warn('Could not fetch dynamic campaigns, falling back to static only:', err.message);
  }

  // 4. News
  try {
    const res = await axios.get(`${BACKEND_URL}/api/public/cms/news`);
    if (res.data && res.data.success && Array.isArray(res.data.data)) {
      res.data.data.forEach(item => {
        if (item.slug) {
          routes.push({
            path: `/news/${item.slug}`,
            priority: '0.6',
            changefreq: 'weekly',
            lastmod: item.updatedAt || timestamp
          });
        }
      });
      console.log(`Fetched ${res.data.data.length} dynamic news stories for sitemap.`);
    }
  } catch (err) {
    console.warn('Could not fetch dynamic news stories, falling back to static only:', err.message);
  }

  return routes;
}

async function generate() {
  console.log('Generating sitemap...');
  const timestamp = new Date().toISOString();
  
  const dynamicRoutes = await fetchDynamicRoutes();
  const allRoutes = [
    ...staticRoutes.map(r => ({ ...r, lastmod: timestamp })),
    ...dynamicRoutes
  ];

  let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
  xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

  allRoutes.forEach(route => {
    xml += '  <url>\n';
    xml += `    <loc>${FRONTEND_URL}${route.path}</loc>\n`;
    xml += `    <lastmod>${route.lastmod}</lastmod>\n`;
    xml += `    <changefreq>${route.changefreq}</changefreq>\n`;
    xml += `    <priority>${route.priority}</priority>\n`;
    xml += '  </url>\n';
  });

  xml += '</urlset>\n';

  // Ensure public folder exists
  const publicDir = path.resolve('public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir);
  }

  // Write to public/sitemap.xml
  const publicSitemapPath = path.join(publicDir, 'sitemap.xml');
  fs.writeFileSync(publicSitemapPath, xml, 'utf8');
  console.log(`Sitemap written successfully to: ${publicSitemapPath}`);

  // Also write to dist/sitemap.xml if the dist folder already exists
  const distDir = path.resolve('dist');
  if (fs.existsSync(distDir)) {
    const distSitemapPath = path.join(distDir, 'sitemap.xml');
    fs.writeFileSync(distSitemapPath, xml, 'utf8');
    console.log(`Sitemap written successfully to: ${distSitemapPath}`);
  }
}

generate().catch(err => {
  console.error('Error generating sitemap:', err);
  process.exit(1);
});
