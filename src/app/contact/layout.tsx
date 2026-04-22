import type { Metadata } from 'next';
import { buildBreadcrumbList, SITE_URL } from '@/lib/jsonLd';

export const metadata: Metadata = {
  title: 'Contacto y Cotización — Drones CDMX',
  description:
    'Solicita tu cotización gratuita para fotografía y video aéreo con drones en Ciudad de México. Respuesta en 24 horas por WhatsApp o email.',
  alternates: {
    canonical: '/contact',
    languages: { 'es-MX': '/contact' },
  },
  openGraph: {
    title: 'Contacto y Cotización — Drones CDMX | Pablo Yamamoto',
    description:
      'Solicita tu cotización gratuita para fotografía y video aéreo con drones en Ciudad de México. Respuesta en 24 horas por WhatsApp o email.',
    url: '/contact',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Contacto — Pablo Yamamoto Aerial',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  const breadcrumb = buildBreadcrumbList([
    { name: 'Inicio', url: SITE_URL },
    { name: 'Contacto', url: `${SITE_URL}/contact` },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
