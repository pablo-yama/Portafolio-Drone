import type { Metadata } from 'next';
import { SITE_URL, buildBreadcrumbList } from '@/lib/jsonLd';

const localBusiness = {
  '@context': 'https://schema.org',
  '@type': ['LocalBusiness', 'ProfessionalService'],
  '@id': `${SITE_URL}/cdmx/miguel-hidalgo#business`,
  name: 'Pablo Yamamoto Aerial — Drones Miguel Hidalgo CDMX',
  description:
    'Fotografía y video aéreo con drones en Miguel Hidalgo, CDMX. ' +
    'Cobertura de Polanco, Lomas de Chapultepec, Anzures y Santa Fe. ' +
    'Arquitectura icónica, real estate premium y eventos corporativos.',
  url: `${SITE_URL}/cdmx/miguel-hidalgo`,
  telephone: '+525585699724',
  email: 'pabloyamamoto19@gmail.com',
  priceRange: 'MXN 4,500–40,000',
  areaServed: {
    '@type': 'AdministrativeArea',
    name: 'Miguel Hidalgo',
    containedInPlace: { '@type': 'City', name: 'Ciudad de México' },
  },
  geo: { '@type': 'GeoCoordinates', latitude: 19.4356, longitude: -99.1871 },
  image: `${SITE_URL}/og-image.jpg`,
  sameAs: ['https://www.instagram.com/the_pym_project/'],
};

export const metadata: Metadata = {
  title: 'Drones en Miguel Hidalgo CDMX — Fotografía y Video Aéreo | Pablo Yamamoto',
  description:
    'Fotografía y video aéreo con drones en Polanco, Lomas de Chapultepec y Miguel Hidalgo. ' +
    'Real estate de lujo, arquitectura corporativa y eventos. Desde $4,500 MXN.',
  alternates: {
    canonical: '/cdmx/miguel-hidalgo',
    languages: { 'es-MX': '/cdmx/miguel-hidalgo' },
  },
  openGraph: {
    title: 'Drones en Miguel Hidalgo CDMX — Pablo Yamamoto Aerial',
    description:
      'Fotografía y video aéreo con drones en Polanco, Lomas de Chapultepec y Miguel Hidalgo.',
    url: '/cdmx/miguel-hidalgo',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  const breadcrumb = buildBreadcrumbList([
    { name: 'Inicio', url: SITE_URL },
    { name: 'CDMX', url: `${SITE_URL}/cdmx` },
    { name: 'Miguel Hidalgo', url: `${SITE_URL}/cdmx/miguel-hidalgo` },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(localBusiness) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
