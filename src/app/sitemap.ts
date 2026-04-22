import type { MetadataRoute } from 'next';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yamamotoaerial.com';

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    { url: BASE_URL,                      lastModified: new Date('2026-04-22'), priority: 1.0 },
    { url: `${BASE_URL}/services`,        lastModified: new Date('2026-04-22'), priority: 0.9 },
    { url: `${BASE_URL}/contact`,         lastModified: new Date('2026-04-22'), priority: 0.8 },
    { url: `${BASE_URL}/archivo`,         lastModified: new Date('2026-04-22'), priority: 0.8 },
    { url: `${BASE_URL}/work`,            lastModified: new Date('2026-04-22'), priority: 0.8 },
    { url: `${BASE_URL}/showreel`,        lastModified: new Date('2025-01-01'), priority: 0.8 },
    { url: `${BASE_URL}/about`,           lastModified: new Date('2026-04-22'), priority: 0.7 },
    { url: `${BASE_URL}/faq`,             lastModified: new Date('2026-04-22'), priority: 0.7 },
    { url: `${BASE_URL}/cdmx/miguel-hidalgo`, lastModified: new Date('2026-04-22'), priority: 0.6 },
    { url: `${BASE_URL}/cdmx/cuauhtemoc`,     lastModified: new Date('2026-04-22'), priority: 0.6 },
    { url: `${BASE_URL}/cdmx/santa-fe`,       lastModified: new Date('2026-04-22'), priority: 0.6 },
  ];
}
