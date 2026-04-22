import type { Metadata } from 'next';
import { buildArchiveImageObjects, buildBreadcrumbList, SITE_URL } from '@/lib/jsonLd';

export const metadata: Metadata = {
  title: 'Portafolio — Fotografía y Video Aéreo en CDMX',
  description:
    'Explora proyectos de fotografía aérea, hyperlapses y video con drones en CDMX. Real estate, eventos, construcción y producción audiovisual.',
  alternates: {
    canonical: '/work',
    languages: { 'es-MX': '/work' },
  },
  openGraph: {
    title: 'Portafolio — Fotografía y Video Aéreo en CDMX | Pablo Yamamoto',
    description:
      'Explora proyectos de fotografía aérea, hyperlapses y video con drones en CDMX. Real estate, eventos, construcción y producción audiovisual.',
    url: '/work',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Portafolio — Pablo Yamamoto Aerial',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
};

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  const imageObjects = buildArchiveImageObjects();
  const breadcrumb = buildBreadcrumbList([
    { name: 'Inicio', url: SITE_URL },
    { name: 'Portafolio', url: `${SITE_URL}/work` },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(imageObjects) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
