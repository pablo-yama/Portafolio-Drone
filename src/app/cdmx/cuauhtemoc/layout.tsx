import type { Metadata } from 'next';
import { SITE_URL, buildBreadcrumbList } from '@/lib/jsonLd';

const localBusiness = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'ProfessionalService'],
  '@id': `${SITE_URL}/cdmx/cuauhtemoc#business`,
  name: 'Pablo Yamamoto Aerial — Drones Cuauhtémoc CDMX',
  description:
    'Fotografía y video aéreo con drones en Cuauhtémoc, CDMX. ' +
    'Cobertura del Centro Histórico, Reforma, Tepito y colonias aledañas. ' +
    'Arquitectura cultural, hoteles, museos y eventos en el corazón de la ciudad.',
  url: `${SITE_URL}/cdmx/cuauhtemoc`,
  telephone: '+525585699724',
  email: 'pabloyamamoto19@gmail.com',
  priceRange: 'MXN 4,500–40,000',
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Cuauhtémoc',
    containedInPlace: { '@type': 'City', name: 'Ciudad de México' },
  },
  geo: { '@type': 'GeoCoordinates', latitude: 19.4489, longitude: -99.1389 },
  image: `${SITE_URL}/og-image.jpg`,
  sameAs: ['https://www.instagram.com/the_pym_project/'],
};

export const metadata: Metadata = {
  title: 'Drones en Cuauhtémoc CDMX — Centro Histórico y Reforma | Pablo Yamamoto',
  description:
    'Fotografía y video aéreo con drones en Cuauhtémoc, Centro Histórico y Paseo de la Reforma. ' +
    'Arquitectura cultural, hoteles de lujo y eventos. Desde $4,500 MXN.',
  alternates: {
    canonical: '/cdmx/cuauhtemoc',
    languages: { 'es-MX': '/cdmx/cuauhtemoc' },
  },
  openGraph: {
    title: 'Drones en Cuauhtémoc CDMX — Centro Histórico y Reforma | Pablo Yamamoto',
    description:
      'Fotografía y video aéreo con drones en Cuauhtémoc, Centro Histórico y Paseo de la Reforma.',
    url: '/cdmx/cuauhtemoc',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const breadcrumb = buildBreadcrumbList([
    { name: 'Inicio', url: SITE_URL },
    { name: 'CDMX', url: `${SITE_URL}/cdmx` },
    { name: 'Cuauhtémoc', url: `${SITE_URL}/cdmx/cuauhtemoc` },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
