import type { Metadata } from 'next';
import { SITE_URL, buildBreadcrumbList } from '@/lib/jsonLd';

const personExpanded = {
  '@context': 'https://schema.org',
  '@type': 'Person',
  '@id': `${SITE_URL}/#person`,
  name: 'Pablo Yamamoto Magaña',
  givenName: 'Pablo',
  familyName: 'Yamamoto Magaña',
  jobTitle: 'Piloto Profesional de Drones y Fotógrafo Aéreo',
  description:
    'Piloto profesional de drones con más de 10 años de experiencia en fotografía y video aéreo cinematográfico en la Ciudad de México. ' +
    'Especialista en arquitectura, real estate, cobertura de eventos e inspección de infraestructura. ' +
    'Opera bajo normativa AFAC con seguro de responsabilidad civil.',
  url: `${SITE_URL}/about`,
  image: `${SITE_URL}/img/Pablo.jpg`,
  email: 'pabloyamamoto19@gmail.com',
  telephone: '+525585699724',
  foundingDate: '2016',
  nationality: { '@type': 'Country', name: 'México' },
  worksFor: { '@id': `${SITE_URL}/#business` },
  hasOccupation: {
    '@type': 'Occupation',
    name: 'Piloto de Drones — Fotografía y Video Aéreo',
    occupationLocation: { '@type': 'City', name: 'Ciudad de México' },
    skills: [
      'Fotografía aérea con drones',
      'Video aéreo 4K',
      'Hyperlapse aéreo',
      'Inspección de infraestructura con drones',
      'Color grading cinematográfico',
      'Fotogrametría y ortomosaicos',
    ],
  },
  knowsAbout: [
    'Fotografía aérea con drones',
    'Video aéreo 4K cinematográfico',
    'Hyperlapse aéreo',
    'Inspección de infraestructura RPAS',
    'Normativa AFAC para drones comerciales',
    'Post-producción en DaVinci Resolve',
  ],
  sameAs: [
    'https://www.instagram.com/the_pym_project/',
    'https://stock.adobe.com/es/contributor/211067778/Pablo',
  ],
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Polanco',
    addressRegion: 'Ciudad de México',
    addressCountry: 'MX',
  },
  hasCredential: [
    {
      '@type': 'EducationalOccupationalCredential',
      name: 'Registro de Operador RPAS — AFAC México',
      credentialCategory: 'license',
      recognizedBy: {
        '@type': 'Organization',
        name: 'Agencia Federal de Aviación Civil (AFAC)',
        url: 'https://www.gob.mx/afac',
      },
    },
  ],
};

export const metadata: Metadata = {
  title: 'Sobre Pablo Yamamoto — Piloto Profesional de Drones en CDMX',
  description:
    'Conoce a Pablo Yamamoto Magaña, piloto profesional de drones con seguro de responsabilidad civil. Más de 10 años capturando Ciudad de México desde el cielo.',
  alternates: {
    canonical: '/about',
    languages: { 'es-MX': '/about' },
  },
  openGraph: {
    title: 'Sobre Pablo Yamamoto — Piloto Profesional de Drones en CDMX',
    description:
      'Conoce a Pablo Yamamoto Magaña, piloto profesional de drones con seguro de responsabilidad civil. Más de 10 años capturando Ciudad de México desde el cielo.',
    url: '/about',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pablo Yamamoto — Piloto profesional de drones en CDMX',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
};

export default function AboutLayout({ children }: { children: React.ReactNode }) {
  const breadcrumb = buildBreadcrumbList([
    { name: 'Inicio', url: SITE_URL },
    { name: 'Sobre Pablo Yamamoto', url: `${SITE_URL}/about` },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(personExpanded) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
