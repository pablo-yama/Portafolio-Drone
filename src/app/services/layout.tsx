import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Servicios de Drones en CDMX — Fotografía, Video e Inspección',
  description:
    'Paquetes de fotografía aérea desde $4,500 MXN. Video 4K, cobertura de eventos e inspección de infraestructura con drones en Ciudad de México.',
  alternates: {
    canonical: '/services',
  },
  openGraph: {
    title: 'Servicios de Drones en CDMX — Fotografía, Video e Inspección | Pablo Yamamoto',
    description:
      'Paquetes de fotografía aérea desde $4,500 MXN. Video 4K, cobertura de eventos e inspección de infraestructura con drones en Ciudad de México.',
    url: '/services',
  },
};

export default function ServicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
