import type { Metadata } from 'next';
import { buildFAQPage, buildBreadcrumbList, SITE_URL } from '@/lib/jsonLd';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes — Servicios de Drones en CDMX',
  description:
    'Resolvemos tus dudas sobre planeación de vuelos, clima, tiempos de entrega, formatos y cobertura para proyectos con drones en Ciudad de México.',
  alternates: {
    canonical: '/faq',
    languages: { 'es-MX': '/faq' },
  },
  openGraph: {
    title: 'Preguntas Frecuentes — Servicios de Drones en CDMX | Pablo Yamamoto',
    description:
      'Resolvemos tus dudas sobre planeación de vuelos, clima, tiempos de entrega, formatos y cobertura para proyectos con drones en Ciudad de México.',
    url: '/faq',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Preguntas frecuentes — Pablo Yamamoto Aerial',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  const faqJsonLd = buildFAQPage();
  const breadcrumb = buildBreadcrumbList([
    { name: 'Inicio', url: SITE_URL },
    { name: 'Preguntas Frecuentes', url: `${SITE_URL}/faq` },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
