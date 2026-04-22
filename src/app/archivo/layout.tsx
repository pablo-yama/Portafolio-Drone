import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Archivo completo — 37 piezas · 2023–2025',
  description:
    'Archivo completo de vuelos ejecutados por Pablo Yamamoto: 37 piezas entre 2023 y 2025. '
    + 'Arquitectura, real estate, urbanismo, naturaleza, deportes y eventos — filtrables por categoría, '
    + 'ubicación o año. Operaciones en CDMX, Morelos y Guerrero.',
  alternates: {
    canonical: '/archivo',
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    title: 'Archivo completo — Yamamoto Aerial',
    description: '37 piezas de fotografía aérea, 2023–2025.',
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
    description: '37 piezas de fotografía y video aéreo, 2023–2025.',
  },
};

export default function ArchivoLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return children;
}
