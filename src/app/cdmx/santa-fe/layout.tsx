import type { Metadata } from 'next';
import { SITE_URL, buildBreadcrumbList } from '@/lib/jsonLd';

const localBusiness = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'ProfessionalService'],
  '@id': `${SITE_URL}/cdmx/santa-fe#business`,
  name: 'Pablo Yamamoto Aerial — Drones Santa Fe CDMX',
  description:
    'Fotografía y video aéreo con drones en Santa Fe y Álvaro Obregón, CDMX. ' +
    'Torres Mitikah, desarrollo inmobiliario vertical, corporativos e inspección de infraestructura.',
  url: `${SITE_URL}/cdmx/santa-fe`,
  telephone: '+525585699724',
  email: 'pabloyamamoto19@gmail.com',
  priceRange: 'MXN 4,500–40,000',
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Álvaro Obregón',
    containedInPlace: { '@type': 'City', name: 'Ciudad de México' },
  },
  geo: { '@type': 'GeoCoordinates', latitude: 19.3606, longitude: -99.2597 },
  image: `${SITE_URL}/og-image.jpg`,
  sameAs: ['https://www.instagram.com/the_pym_project/'],
};

export const metadata: Metadata = {
  title: 'Drones en Santa Fe CDMX — Torres Mitikah y Corporativos | Pablo Yamamoto',
  description:
    'Fotografía y video aéreo con drones en Santa Fe, Torres Mitikah y Álvaro Obregón. ' +
    'Real estate vertical, corporativos y construcción. Desde $4,500 MXN.',
  alternates: {
    canonical: '/cdmx/santa-fe',
    languages: { 'es-MX': '/cdmx/santa-fe' },
  },
  openGraph: {
    title: 'Drones en Santa Fe CDMX — Torres Mitikah y Corporativos | Pablo Yamamoto',
    description:
      'Fotografía y video aéreo con drones en Santa Fe, Torres Mitikah y Álvaro Obregón.',
    url: '/cdmx/santa-fe',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const breadcrumb = buildBreadcrumbList([
    { name: 'Inicio', url: SITE_URL },
    { name: 'CDMX', url: `${SITE_URL}/cdmx` },
    { name: 'Santa Fe', url: `${SITE_URL}/cdmx/santa-fe` },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
