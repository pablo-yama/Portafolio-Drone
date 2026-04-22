import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yamamotoaerial.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL,                      lastModified: new Date('2026-04-22'), priority: 1.0 },
    { url: `${BASE_URL}/contact`,         lastModified: new Date('2026-04-22'), priority: 0.8 },
    { url: `${BASE_URL}/archivo`,         lastModified: new Date('2026-04-22'), priority: 0.8 },
    { url: `${BASE_URL}/work`,            lastModified: new Date('2026-04-22'), priority: 0.8 },
    { url: `${BASE_URL}/about`,           lastModified: new Date('2026-04-22'), priority: 0.7 },
    { url: `${BASE_URL}/faq`,             lastModified: new Date('2026-04-22'), priority: 0.7 },
  ];
}
