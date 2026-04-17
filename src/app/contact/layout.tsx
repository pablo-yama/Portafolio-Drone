import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto y Cotización — Drones CDMX',
  description:
    'Solicita tu cotización gratuita para fotografía y video aéreo con drones en Ciudad de México. Respuesta en 24 horas por WhatsApp o email.',
  alternates: {
    canonical: '/contact',
  },
  openGraph: {
    title: 'Contacto y Cotización — Drones CDMX | Pablo Yamamoto',
    description:
      'Solicita tu cotización gratuita para fotografía y video aéreo con drones en Ciudad de México. Respuesta en 24 horas por WhatsApp o email.',
    url: '/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return children;
}
