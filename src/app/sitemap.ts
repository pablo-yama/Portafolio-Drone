import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yamamotoaerial.com';

/* lastModified refleja la fecha del build — el sitio se redeploya al cambiar contenido. */
export default function sitemap(): MetadataRoute.Sitemap {
  const lastModified = new Date();
  return [
    { url: BASE_URL,                lastModified, priority: 1.0 },
    { url: `${BASE_URL}/contact`,   lastModified, priority: 0.8 },
    { url: `${BASE_URL}/archivo`,   lastModified, priority: 0.8 },
    { url: `${BASE_URL}/faq`,       lastModified, priority: 0.7 },
  ];
}
