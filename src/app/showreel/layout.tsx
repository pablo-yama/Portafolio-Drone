import type { Metadata } from 'next';
import { buildShowreelVideo, buildBreadcrumbList, SITE_URL } from '@/lib/jsonLd';

export const metadata: Metadata = {
  title: 'Showreel — Video Aéreo con Drones en CDMX',
  description:
    'Mira el showreel de Pablo Yamamoto con tomas aéreas en 4K de Ciudad de México. Hyperlapses, cinematografía y vuelo nocturno con drones.',
  alternates: {
    canonical: '/showreel',
    languages: { 'es-MX': '/showreel' },
  },
  openGraph: {
    title: 'Showreel — Video Aéreo con Drones en CDMX | Pablo Yamamoto',
    description:
      'Mira el showreel de Pablo Yamamoto con tomas aéreas en 4K de Ciudad de México. Hyperlapses, cinematografía y vuelo nocturno con drones.',
    url: '/showreel',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Showreel — Pablo Yamamoto Aerial',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
};

export default function ShowreelLayout({ children }: { children: React.ReactNode }) {
  const videoJsonLd = buildShowreelVideo();
  const breadcrumb = buildBreadcrumbList([
    { name: 'Inicio', url: SITE_URL },
    { name: 'Showreel', url: `${SITE_URL}/showreel` },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(videoJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
