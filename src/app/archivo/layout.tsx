import type { Metadata } from 'next';
import { buildArchiveImageObjects, buildBreadcrumbList, SITE_URL } from '@/lib/jsonLd';

export const metadata: Metadata = {
  title: 'Archivo completo — 37 piezas · 2022–2026',
  description:
    'Archivo completo de vuelos ejecutados por Pablo Yamamoto: 37 piezas entre 2022 y 2026. '
    + 'Arquitectura, real estate, urbanismo, naturaleza, deportes y eventos — filtrables por categoría, '
    + 'ubicación o año. Operaciones en CDMX, Morelos y Guerrero.',
  alternates: {
    canonical: '/archivo',
    languages: { 'es-MX': '/archivo' },
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    title: 'Archivo completo — Yamamoto Aerial',
    description: '37 piezas de fotografía aérea, 2022–2026.',
    url: '/archivo',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Archivo Yamamoto Aerial — 37 piezas',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Archivo completo — Yamamoto Aerial',
    description: '37 piezas de fotografía y video aéreo, 2022–2026.',
  },
};

export default function ArchivoLayout({ children }: { children: React.ReactNode }) {
  const imageObjects = buildArchiveImageObjects();
  const breadcrumb = buildBreadcrumbList([
    { name: 'Inicio', url: SITE_URL },
    { name: 'Archivo de Vuelos', url: `${SITE_URL}/archivo` },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(imageObjects) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
