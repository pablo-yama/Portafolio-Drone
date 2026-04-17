import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sobre Pablo Yamamoto — Piloto Profesional de Drones en CDMX',
  description:
    'Conoce a Pablo Yamamoto Magaña, piloto profesional de drones con seguro de responsabilidad civil. Más de 10 años capturando Ciudad de México desde el cielo.',
  alternates: {
    canonical: '/about',
  },
  openGraph: {
    title: 'Sobre Pablo Yamamoto — Piloto Profesional de Drones en CDMX',
    description:
      'Conoce a Pablo Yamamoto Magaña, piloto profesional de drones con seguro de responsabilidad civil. Más de 10 años capturando Ciudad de México desde el cielo.',
    url: '/about',
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  return children;
}
