import { ARCHIVE } from '@/lib/archive';

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yamamotoaerial.com';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

export function GET() {
  const images = ARCHIVE.filter((e) => e.thumbUrl);

  const urlEntries = Object.entries(
    images.reduce<Record<string, typeof images>>((acc, entry) => {
      const page = '/archivo';
      if (!acc[page]) acc[page] = [];
      acc[page].push(entry);
      return acc;
    }, {}),
  )
    .map(([page, entries]) => {
      const imageXml = entries
        .map((e) => {
          const title = e.title.replace(/<[^>]+>/g, '');
          const caption = `${title} — ${e.cat}, ${e.loc}, ${e.year}. Fotografía aérea con drones por Pablo Yamamoto Aerial.`;
          return `    <image:image>
      <image:loc>${escapeXml(`${BASE_URL}${e.thumbUrl}`)}</image:loc>
      <image:title>${escapeXml(title)}</image:title>
      <image:caption>${escapeXml(caption)}</image:caption>
      <image:geo_location>${escapeXml(e.loc === 'CDMX' ? 'Ciudad de México, México' : `${e.loc}, México`)}</image:geo_location>
      <image:license>${escapeXml(`${BASE_URL}/about`)}</image:license>
    </image:image>`;
        })
        .join('\n');

      return `  <url>
    <loc>${escapeXml(`${BASE_URL}${page}`)}</loc>
${imageXml}
  </url>`;
    })
    .join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
>
${urlEntries}
</urlset>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, stale-while-revalidate=3600',
    },
  });
}
