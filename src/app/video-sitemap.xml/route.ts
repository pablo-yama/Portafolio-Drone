const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yamamotoaerial.com';

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

/** ISO-8601 duration (PT1H2M3S, PT10S, PT1M30S …) → whole seconds. */
function isoDurationToSeconds(iso: string): number {
  const match = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+(?:\.\d+)?)S)?$/i.exec(iso.trim());
  if (!match) return 0;
  const [, h = '0', m = '0', s = '0'] = match;
  return Math.round(Number(h) * 3600 + Number(m) * 60 + Number(s));
}

interface VideoEntry {
  page: string;
  title: string;
  description: string;
  thumbnailUrl: string;
  contentUrl: string;
  duration: string;
  uploadDate: string;
}

/* Both clips are committed under public/videos/hero (gitignore exception) and
   served from the app origin — never via Blob — so these URLs resolve in prod. */
const VIDEOS: VideoEntry[] = [
  {
    page: '/',
    title: 'Hyperlapse aéreo nocturno · Paseo de la Reforma — CDMX',
    description:
      'Hyperlapse aéreo nocturno sobre Paseo de la Reforma y la torre BBVA, Ciudad de México: estelas de tráfico y skyline capturados con DJI Mavic 3 Pro en 4K 30p. Ventana 01 del portafolio de Pablo Yamamoto.',
    thumbnailUrl: `${BASE_URL}/videos/hero/reforma-poster.jpg`,
    contentUrl: `${BASE_URL}/videos/hero/reforma-1080.mp4`,
    duration: 'PT10S',
    uploadDate: '2026-09-02',
  },
  {
    page: '/',
    title: 'Hyperlapse aéreo · Bosques de las Lomas — hora dorada',
    description:
      'Hyperlapse aéreo en hora dorada sobre las torres de Bosques de las Lomas y la mancha urbana de la Ciudad de México, capturado con DJI Mavic 3 Pro en 4K 30p. Ventana 02 del portafolio de Pablo Yamamoto.',
    thumbnailUrl: `${BASE_URL}/videos/hero/bosques-poster.jpg`,
    contentUrl: `${BASE_URL}/videos/hero/bosques-1080.mp4`,
    duration: 'PT10S',
    uploadDate: '2026-09-02',
  },
];

export function GET() {
  const uploaderInfo = escapeXml(`${BASE_URL}/#about`);

  /* One <url> per page, all of its videos grouped inside it (sitemap-video spec). */
  const pages = new Map<string, VideoEntry[]>();
  for (const v of VIDEOS) {
    const list = pages.get(v.page) ?? [];
    list.push(v);
    pages.set(v.page, list);
  }

  const urlEntries = Array.from(pages.entries())
    .map(([page, videos]) => {
      const videoBlocks = videos
        .map(
          (v) => `    <video:video>
      <video:thumbnail_loc>${escapeXml(v.thumbnailUrl)}</video:thumbnail_loc>
      <video:title>${escapeXml(v.title)}</video:title>
      <video:description>${escapeXml(v.description)}</video:description>
      <video:content_loc>${escapeXml(v.contentUrl)}</video:content_loc>
      <video:duration>${isoDurationToSeconds(v.duration)}</video:duration>
      <video:publication_date>${v.uploadDate}</video:publication_date>
      <video:family_friendly>yes</video:family_friendly>
      <video:requires_subscription>no</video:requires_subscription>
      <video:uploader info="${uploaderInfo}">Pablo Yamamoto Aerial</video:uploader>
      <video:live>no</video:live>
    </video:video>`,
        )
        .join('\n');

      return `  <url>
    <loc>${escapeXml(`${BASE_URL}${page}`)}</loc>
${videoBlocks}
  </url>`;
    })
    .join('\n');

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
