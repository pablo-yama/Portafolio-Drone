/**
 * Markdown representations of the site's public pages.
 *
 * Served by src/app/api/markdown/route.ts when a client negotiates
 * `Accept: text/markdown` (see https://acceptmarkdown.com) or requests the
 * `.md` variant of a path. Every builder reads from src/lib/constants.ts and
 * src/lib/archive.ts, so the Markdown and the rendered HTML can never disagree.
 */

import {
  ABOUT_PAGE,
  AGENT_GUIDE,
  FAQ_ITEMS,
  PRIVACY_POLICY,
  SERVICE_PACKAGES,
} from '@/lib/constants';
import { ARCHIVE } from '@/lib/archive';
import { SITE_URL } from '@/lib/jsonLd';

/** Routes that have both an HTML and a Markdown representation. */
export const MARKDOWN_ROUTES = [
  '/',
  '/about',
  '/contact',
  '/privacy',
  '/faq',
  '/work',
  '/archivo',
] as const;

export type MarkdownRoute = (typeof MARKDOWN_ROUTES)[number];

interface ContentSection {
  readonly heading: string;
  readonly paragraphs?: readonly string[];
  readonly bullets?: readonly string[];
}

/** Strips the inline <em> markup a few content constants carry for the HTML view. */
function plain(value: string): string {
  return value.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim();
}

function renderSections(sections: readonly ContentSection[], level = 2): string {
  const hashes = '#'.repeat(level);
  return sections
    .map((section) => {
      const parts = [`${hashes} ${section.heading}`];
      if (section.paragraphs) parts.push(section.paragraphs.map(plain).join('\n\n'));
      if (section.bullets) parts.push(section.bullets.map((b) => `- ${plain(b)}`).join('\n'));
      return parts.filter(Boolean).join('\n\n');
    })
    .join('\n\n');
}

function formatPrice(price: number, currency: string): string {
  return `$${price.toLocaleString('en-US')} ${currency}`;
}

/** The link block appended to every Markdown page so an agent can keep navigating. */
function navFooter(currentPath: string): string {
  const links = [
    ['Inicio — servicios, precios y contacto', '/'],
    ['Sobre Pablo Yamamoto — trayectoria y credenciales', '/about'],
    ['Portafolio', '/work'],
    ['Archivo de vuelos (2022–2026)', '/archivo'],
    ['Preguntas frecuentes', '/faq'],
    ['Contacto y cotización', '/contact'],
    ['Aviso de privacidad', '/privacy'],
  ]
    .filter(([, href]) => href !== currentPath)
    .map(([label, href]) => `- [${label}](${SITE_URL}${href})`)
    .join('\n');

  return [
    '## Mapa del sitio',
    links,
    '## Recursos para agentes',
    [
      `- [Instrucciones para agentes (\`when to use\`)](${SITE_URL}/agents.md)`,
      `- [llms.txt](${SITE_URL}/llms.txt)`,
      `- [sitemap.xml](${SITE_URL}/sitemap.xml)`,
      `- [robots.txt](${SITE_URL}/robots.txt)`,
    ].join('\n'),
    `Cada página de este sitio también responde a \`Accept: text/markdown\`, o puedes añadir \`.md\` a la ruta (por ejemplo ${SITE_URL}/about.md).`,
  ].join('\n\n');
}

function document(parts: {
  path: string;
  title: string;
  summary: string;
  body: string;
}): string {
  return [
    `# ${parts.title}`,
    `> ${parts.summary}`,
    `Fuente canónica: ${SITE_URL}${parts.path === '/' ? '/' : parts.path} · Idioma: es-MX`,
    parts.body,
    '---',
    navFooter(parts.path),
  ].join('\n\n') + '\n';
}

/* ------------------------------------------------------------------ pages */

function buildHome(): string {
  const services = SERVICE_PACKAGES.map((pkg) => {
    const tiers = pkg.tiers
      .map(
        (tier) =>
          `- **${tier.name} — ${formatPrice(tier.price, tier.currency)}**: ${plain(tier.description)}. `
          + `Incluye ${tier.deliverables.map(plain).join('; ')}.`,
      )
      .join('\n');
    return [`### ${pkg.title}`, plain(pkg.description), tiers, plain(pkg.regulatory)].join('\n\n');
  }).join('\n\n');

  return document({
    path: '/',
    title: 'Pablo Yamamoto Aerial — Fotografía y video aéreo con drones en CDMX',
    summary:
      'Piloto profesional de drones con registro AFAC y seguro de responsabilidad civil. '
      + 'Fotografía aérea, video 4K, cobertura de eventos e inspección de infraestructura en Ciudad de México.',
    body: [
      '## Resumen del negocio',
      [
        '- **Nombre comercial**: Pablo Yamamoto Aerial',
        '- **Responsable**: Pablo Yamamoto Magaña',
        '- **Base**: Polanco, Ciudad de México, México (19.4326° N, 99.1332° W)',
        '- **En operación desde**: 2016',
        '- **Horas de vuelo en bitácora**: 300+',
        '- **Incidentes**: 0',
        '- **Idiomas**: español, inglés',
        '- **Rango de precios**: $4,500 – $40,000 MXN',
      ].join('\n'),
      '## Servicios y precios',
      services,
      '## Contacto',
      [
        `- **Cotización**: ${SITE_URL}/contact`,
        '- **Email**: pabloyamamoto19@gmail.com',
        '- **Teléfono**: +52 55 8569 9724',
        '- **WhatsApp**: https://wa.me/5215585699724',
        '- **Horario**: lunes a sábado, 09:00–19:00 (America/Mexico_City)',
      ].join('\n'),
      '## When to use this business',
      AGENT_GUIDE.summary,
      AGENT_GUIDE.useWhen.map((item) => `- ${item}`).join('\n'),
    ].join('\n\n'),
  });
}

function buildAbout(): string {
  return document({
    path: '/about',
    title: `${ABOUT_PAGE.title} — ${ABOUT_PAGE.subtitle}`,
    summary: plain(ABOUT_PAGE.lead),
    body: renderSections(ABOUT_PAGE.sections),
  });
}

function buildContact(): string {
  return document({
    path: '/contact',
    title: 'Contacto y cotización — Pablo Yamamoto Aerial',
    summary:
      'Cotización gratuita para fotografía y video aéreo con drones en Ciudad de México. '
      + 'Respuesta en menos de 24 horas hábiles.',
    body: [
      '## Datos de contacto',
      [
        '- **Email**: pabloyamamoto19@gmail.com',
        '- **Teléfono**: +52 55 8569 9724',
        '- **WhatsApp**: https://wa.me/5215585699724',
        '- **Horario de atención**: lunes a sábado, 09:00–19:00 (America/Mexico_City)',
        '- **Ubicación**: Ciudad de México, CDMX, México',
        '- **Idiomas**: español, inglés',
      ].join('\n'),
      '## Cómo solicitar una cotización',
      `El formulario en ${SITE_URL}/contact pide: nombre, correo electrónico, empresa (opcional), `
      + 'tipo de proyecto, ubicación, fecha tentativa, rango de presupuesto y una descripción libre '
      + 'del proyecto. Entre más específica sea la ubicación y la fecha, más precisa es la cotización, '
      + 'porque el precio depende de los permisos aeronáuticos que requiera la zona.',
      '## Qué esperar después de escribir',
      [
        '1. Respuesta con preguntas de aclaración o una cotización en menos de 24 horas hábiles.',
        '2. Confirmación de fecha, ventana horaria y trámite de permisos AFAC si la zona lo requiere.',
        '3. Vuelo. Se reprograma sin costo si el clima no permite operar con seguridad.',
        '4. Entrega en 3–5 días hábiles mediante enlace de descarga seguro.',
      ].join('\n'),
      '## Cobertura',
      'Las 16 alcaldías de la Ciudad de México y la Zona Metropolitana del Valle de México sin cargo '
      + 'por traslado. Resto de la República Mexicana con ajuste por viáticos cotizado por separado.',
    ].join('\n\n'),
  });
}

function buildPrivacy(): string {
  return document({
    path: '/privacy',
    title: `${PRIVACY_POLICY.title} — ${PRIVACY_POLICY.subtitle}`,
    summary: plain(PRIVACY_POLICY.lead),
    body: [
      `Última actualización: ${PRIVACY_POLICY.updated}`,
      renderSections(PRIVACY_POLICY.sections),
    ].join('\n\n'),
  });
}

function buildFaq(): string {
  return document({
    path: '/faq',
    title: 'Preguntas frecuentes — Servicios de drones en CDMX',
    summary:
      'Clima, tiempos de entrega, formatos, cobertura, vuelos nocturnos, duración de sesión e historial de seguridad.',
    body: FAQ_ITEMS.map(
      (item) => `## ${plain(item.question)}\n\n${plain(item.answer)}`,
    ).join('\n\n'),
  });
}

function buildWork(): string {
  const featured = ARCHIVE.slice(0, 12)
    .map(
      (entry) =>
        `- **${plain(entry.title)}** — ${entry.cat}, ${entry.loc}, ${entry.year} (${entry.fmt}).`,
    )
    .join('\n');

  return document({
    path: '/work',
    title: 'Portafolio — Fotografía y video aéreo en CDMX',
    summary:
      'Selección de proyectos de fotografía aérea, hyperlapses y video con drones en Ciudad de México y alrededores.',
    body: [
      '## Proyectos destacados',
      featured,
      `El archivo completo, filtrable por categoría, ubicación y año, está en ${SITE_URL}/archivo.`,
    ].join('\n\n'),
  });
}

function buildArchivo(): string {
  const years = [...new Set(ARCHIVE.map((entry) => entry.year))].sort();
  const categories = [...new Set(ARCHIVE.map((entry) => entry.cat))].sort();
  const rows = ARCHIVE.map(
    (entry) =>
      `| ${entry.id} | ${plain(entry.title)} | ${entry.cat} | ${entry.loc} | ${entry.year} | ${entry.fmt} |`,
  ).join('\n');

  return document({
    path: '/archivo',
    title: `Archivo de vuelos — ${ARCHIVE.length} piezas (${years[0]}–${years[years.length - 1]})`,
    summary:
      `Archivo completo de piezas entregadas entre ${years[0]} y ${years[years.length - 1]}, `
      + `en ${categories.length} categorías: ${categories.join(', ')}.`,
    body: [
      '## Índice',
      '| ID | Título | Categoría | Ubicación | Año | Formato |',
      '| --- | --- | --- | --- | --- | --- |',
      rows,
    ].join('\n'),
  });
}

const BUILDERS: Record<MarkdownRoute, () => string> = {
  '/': buildHome,
  '/about': buildAbout,
  '/contact': buildContact,
  '/privacy': buildPrivacy,
  '/faq': buildFaq,
  '/work': buildWork,
  '/archivo': buildArchivo,
};

/** Normalises `/about/`, `/about.md`, `/index.md` and `/ABOUT` to a route key. */
export function normalizeMarkdownPath(pathname: string): MarkdownRoute | null {
  let path = pathname.trim().toLowerCase();
  if (path.endsWith('.md')) path = path.slice(0, -3);
  if (path.length > 1 && path.endsWith('/')) path = path.replace(/\/+$/, '');
  if (path === '' || path === '/index') path = '/';
  return (MARKDOWN_ROUTES as readonly string[]).includes(path)
    ? (path as MarkdownRoute)
    : null;
}

/** Markdown body for a known route, or `null` when the route has no page. */
export function renderMarkdownPage(pathname: string): string | null {
  const route = normalizeMarkdownPath(pathname);
  return route ? BUILDERS[route]() : null;
}

/**
 * Body served with a 404. Kept short and link-dense so an agent that guessed a
 * URL can recover in one more request instead of concluding the site is broken.
 */
export function renderNotFoundMarkdown(pathname?: string): string {
  const requested = pathname ? `\`${pathname}\`` : 'La ruta solicitada';
  return [
    '# 404 — Página no encontrada',
    `> ${requested} no existe en yamamotoaerial.com. Las rutas válidas del sitio están listadas abajo.`,
    '## Páginas del sitio',
    [
      `- [\`/\`](${SITE_URL}/) — servicios, paquetes, precios y contacto`,
      `- [\`/about\`](${SITE_URL}/about) — trayectoria, credenciales AFAC, equipo y cobertura`,
      `- [\`/work\`](${SITE_URL}/work) — portafolio`,
      `- [\`/archivo\`](${SITE_URL}/archivo) — archivo completo de vuelos, 2022–2026`,
      `- [\`/faq\`](${SITE_URL}/faq) — preguntas frecuentes`,
      `- [\`/contact\`](${SITE_URL}/contact) — contacto y cotización`,
      `- [\`/privacy\`](${SITE_URL}/privacy) — aviso de privacidad`,
    ].join('\n'),
    '## Dónde buscar después',
    [
      `- [\`/agents.md\`](${SITE_URL}/agents.md) — cuándo usar este sitio y cómo citarlo`,
      `- [\`/llms.txt\`](${SITE_URL}/llms.txt) — resumen completo del negocio en texto plano`,
      `- [\`/sitemap.xml\`](${SITE_URL}/sitemap.xml) — todas las URLs públicas`,
      `- [\`/robots.txt\`](${SITE_URL}/robots.txt) — reglas de rastreo`,
    ].join('\n'),
    `Toda página responde a \`Accept: text/markdown\` y al sufijo \`.md\`.`,
  ].join('\n\n') + '\n';
}

/**
 * Body served with a 406 when the client's `Accept` header excludes every
 * representation this site can produce.
 */
export function renderNotAcceptableMarkdown(accept: string): string {
  return [
    '# 406 — Not Acceptable',
    `> El encabezado \`Accept: ${accept}\` no coincide con ninguna representación disponible.`,
    '## Representaciones disponibles',
    [
      '- `text/html` — página renderizada (predeterminada)',
      '- `text/markdown` — misma URL en Markdown',
      '- `text/x-markdown`, `text/plain` — equivalentes a `text/markdown`',
    ].join('\n'),
    `Consulta ${SITE_URL}/agents.md o ${SITE_URL}/llms.txt para el contenido completo del sitio.`,
  ].join('\n\n') + '\n';
}
