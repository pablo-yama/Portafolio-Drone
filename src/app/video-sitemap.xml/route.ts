const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yamamotoaerial.com';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const VIDEOS = [
  {
    page: '/showreel',
    title: 'Showreel de video aéreo con drones — Ciudad de México 4K',
    description:
      'Showreel cinematográfico 2025 de Pablo Yamamoto Aerial. Hyperlapses aéreos, fotografía 4K y cobertura de proyectos de arquitectura, urbanismo y deportes captados en Ciudad de México.',
    thumbnailUrl: `${BASE_URL}/img/archivo/reforma-bbva_urbanismo_cdmx_2024.jpg`,
    contentUrl: `${BASE_URL}/videos/bosques.mov`,
    duration: 'PT2M30S',
    uploadDate: '2025-01-01',
  },
  {
    page: '/',
    title: 'Hyperlapse aéreo · Bosques de las Lomas — CDMX',
    description:
      'Hyperlapse aéreo nocturno sobre Bosques de las Lomas, Ciudad de México. Capturado con DJI Mavic 3 Pro en 4K.',
    thumbnailUrl: `${BASE_URL}/img/archivo/bosques-lomas_real-estate_cdmx_2026.jpg`,
    contentUrl: `${BASE_URL}/videos/bosques.mov`,
    duration: 'PT1M30S',
    uploadDate: '2026-01-01',
  },
];

export function GET() {
  const urlEntries = VIDEOS.map((v) => {
    return `  <url>
    <loc>${escapeXml(`${BASE_URL}${v.page}`)}</loc>
    <video:video>
      <video:thumbnail_loc>${escapeXml(v.thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${escapeXml(v.title)}</video:title>
      <video:description>${escapeXml(v.description)}</video:description>
      <video:content_loc>${escapeXml(v.contentUrl)}</video:content_loc>
      <video:duration>${v.duration.replace('PT', '').replace('M', ':').replace('S', '').split(':').reduce((acc, t, i) => acc + (i === 0 ? Number(t) * 60 : Number(t)), 0)}</video:duration>
      <video:publication_date>${v.uploadDate}</video:publication_date>
      <video:uploader info="${escapeXml(`${BASE_URL}/about`)}">Pablo Yamamoto Aerial</video:uploader>
      <video:live>no</video:live>
    </video:video>
  </url>`;
  }).join('\n');

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset
  xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
  xmlns:video="http://www.google.com/schemas/sitemap-video/1.1"
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
