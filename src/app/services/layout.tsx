import type { Metadata } from 'next';
import { buildBreadcrumbList, buildServicesSchema, SITE_URL } from '@/lib/jsonLd';

export const metadata: Metadata = {
  title: 'Servicios de Drones en CDMX — Fotografía, Video e Inspección',
  description:
    'Paquetes de fotografía aérea desde $4,500 MXN. Video 4K, cobertura de eventos e inspección de infraestructura con drones en Ciudad de México.',
  alternates: {
    canonical: '/services',
    languages: { 'es-MX': '/services' },
  },
  openGraph: {
    title: 'Servicios de Drones en CDMX — Fotografía, Video e Inspección | Pablo Yamamoto',
    description:
      'Paquetes de fotografía aérea desde $4,500 MXN. Video 4K, cobertura de eventos e inspección de infraestructura con drones en Ciudad de México.',
    url: '/services',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Servicios de drones — Pablo Yamamoto Aerial',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  const servicesSchema = buildServicesSchema();
  const breadcrumb = buildBreadcrumbList([
    { name: 'Inicio', url: SITE_URL },
    { name: 'Servicios', url: `${SITE_URL}/services` },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(servicesSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
