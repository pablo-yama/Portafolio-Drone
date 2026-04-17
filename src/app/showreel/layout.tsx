import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Showreel — Video Aéreo con Drones en CDMX',
  description:
    'Mira el showreel de Pablo Yamamoto con tomas aéreas en 4K de Ciudad de México. Hyperlapses, cinematografía y vuelo nocturno con drones.',
  alternates: {
    canonical: '/showreel',
  },
  openGraph: {
    title: 'Showreel — Video Aéreo con Drones en CDMX | Pablo Yamamoto',
    description:
      'Mira el showreel de Pablo Yamamoto con tomas aéreas en 4K de Ciudad de México. Hyperlapses, cinematografía y vuelo nocturno con drones.',
    url: '/showreel',
  },
};

export default function ShowreelLayout({ children }: { children: React.ReactNode }) {
  return children;
}
