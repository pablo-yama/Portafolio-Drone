import type { Metadata } from 'next';
import { buildFAQPage } from '@/lib/jsonLd';

export const metadata: Metadata = {
  title: 'Preguntas Frecuentes — Servicios de Drones en CDMX',
  description:
    'Resolvemos tus dudas sobre planeación de vuelos, clima, tiempos de entrega, formatos y cobertura para proyectos con drones en Ciudad de México.',
  alternates: {
    canonical: '/faq',
  },
  openGraph: {
    title: 'Preguntas Frecuentes — Servicios de Drones en CDMX | Pablo Yamamoto',
    description:
      'Resolvemos tus dudas sobre planeación de vuelos, clima, tiempos de entrega, formatos y cobertura para proyectos con drones en Ciudad de México.',
    url: '/faq',
  },
};

export default function FAQLayout({ children }: { children: React.ReactNode }) {
  const faqJsonLd = buildFAQPage();
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqJsonLd) }}
      />
      {children}
    </>
  );
}
