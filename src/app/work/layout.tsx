import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Portafolio — Fotografía y Video Aéreo en CDMX',
  description:
    'Explora proyectos de fotografía aérea, hyperlapses y video con drones en CDMX. Real estate, eventos, construcción y producción audiovisual.',
  alternates: {
    canonical: '/work',
  },
  openGraph: {
    title: 'Portafolio — Fotografía y Video Aéreo en CDMX | Pablo Yamamoto',
    description:
      'Explora proyectos de fotografía aérea, hyperlapses y video con drones en CDMX. Real estate, eventos, construcción y producción audiovisual.',
    url: '/work',
  },
};

export default function WorkLayout({ children }: { children: React.ReactNode }) {
  return children;
}
