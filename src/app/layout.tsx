import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { FAQ_ITEMS, SERVICE_PACKAGES } from '@/lib/constants';

const clashDisplay = localFont({
  src: [
    {
      path: '../../public/fonts/ClashDisplay-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/ClashDisplay-Semibold.woff2',
      weight: '600',
      style: 'normal',
    },
    {
      path: '../../public/fonts/ClashDisplay-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-clash',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const satoshi = localFont({
  src: [
    {
      path: '../../public/fonts/Satoshi-Regular.woff2',
      weight: '400',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Satoshi-Medium.woff2',
      weight: '500',
      style: 'normal',
    },
    {
      path: '../../public/fonts/Satoshi-Bold.woff2',
      weight: '700',
      style: 'normal',
    },
  ],
  variable: '--font-satoshi',
  display: 'swap',
  fallback: ['system-ui', 'sans-serif'],
});

const SITE_URL = 'https://pablo-piloto-de-drones.vercel.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Pablo Yamamoto — Piloto de Drones y Fotógrafo Aéreo en CDMX',
    template: '%s | Pablo Aerial — Drones CDMX',
  },
  description:
    'Fotografía y video aéreo profesional con drones en Ciudad de México. ' +
    'Servicios de drones en 4K para real estate, construcción, eventos e inspección. ' +
    'Cotiza tu proyecto con Pablo Yamamoto.',
  keywords: [
    'piloto de drones CDMX',
    'fotografía aérea Ciudad de México',
    'video con drones México',
    'drone photography',
    'aerial videography',
    'fotografía inmobiliaria aérea',
    'inspección con drones',
    'cobertura de eventos con drones',
    'video aéreo 4K',
    'servicio de drones CDMX',
  ],
  alternates: {
    canonical: '/',
    languages: {
      'es-MX': '/',
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'Pablo Aerial',
    title: 'Pablo Yamamoto — Piloto de Drones y Fotógrafo Aéreo en CDMX',
    description:
      'Fotografía y video aéreo profesional con drones en Ciudad de México. ' +
      'Servicios en 4K para real estate, construcción, eventos e inspección.',
    url: SITE_URL,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Pablo Yamamoto — Fotografía y video aéreo con drones en CDMX' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pablo Yamamoto — Piloto de Drones y Fotógrafo Aéreo en CDMX',
    description:
      'Fotografía y video aéreo profesional con drones en Ciudad de México.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

function buildStructuredData() {
  const professionalService = {
    '@context': 'https://schema.org',
    '@type': 'ProfessionalService',
    '@id': `${SITE_URL}/#business`,
    name: 'Pablo Yamamoto — Piloto de Drones y Fotógrafo Aéreo',
    alternateName: 'Pablo Aerial',
    description:
      'Servicio profesional de fotografía y video aéreo con drones en la Ciudad de México. Cobertura de eventos, inspección de infraestructura y fotografía inmobiliaria.',
    url: SITE_URL,
    telephone: '+525585699724',
    email: 'pabloyamamoto19@gmail.com',
    image: `${SITE_URL}/og-image.jpg`,
    priceRange: '$4,500 - $40,000 MXN',
    currenciesAccepted: 'MXN',
    areaServed: {
      '@type': 'City',
      name: 'Ciudad de México',
      sameAs: 'https://es.wikipedia.org/wiki/Ciudad_de_M%C3%A9xico',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 19.4326,
      longitude: -99.1332,
    },
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ciudad de México',
      addressRegion: 'CDMX',
      addressCountry: 'MX',
    },
    sameAs: [
      'https://www.instagram.com/the_pym_project/',
      'https://stock.adobe.com/es/contributor/211067778/Pablo',
    ],
    founder: { '@id': `${SITE_URL}/#person` },
    hasOfferCatalog: { '@id': `${SITE_URL}/#services` },
    knowsLanguage: ['es', 'en'],
    inLanguage: 'es-MX',
  };

  const person = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: 'Pablo Yamamoto Magaña',
    jobTitle: 'Piloto Profesional de Drones y Fotógrafo Aéreo',
    description:
      'Piloto profesional de drones con registro DGAC, especializado en fotografía y video aéreo cinematográfico en la Ciudad de México.',
    url: SITE_URL,
    email: 'pabloyamamoto19@gmail.com',
    telephone: '+525585699724',
    image: `${SITE_URL}/img/Pablo.jpg`,
    sameAs: [
      'https://www.instagram.com/the_pym_project/',
      'https://stock.adobe.com/es/contributor/211067778/Pablo',
    ],
    worksFor: { '@id': `${SITE_URL}/#business` },
    knowsAbout: [
      'Fotografía aérea con drones',
      'Video aéreo 4K',
      'Hyperlapse aéreo',
      'Inspección de infraestructura con drones',
      'Fotografía inmobiliaria aérea',
      'Post-producción cinematográfica',
    ],
  };

  const offerCatalog = {
    '@context': 'https://schema.org',
    '@type': 'OfferCatalog',
    '@id': `${SITE_URL}/#services`,
    name: 'Servicios de Fotografía y Video Aéreo con Drones',
    provider: { '@id': `${SITE_URL}/#business` },
    itemListElement: SERVICE_PACKAGES.flatMap((pkg) =>
      pkg.tiers.map((tier) => ({
        '@type': 'Offer',
        name: `${tier.name} — ${pkg.title}`,
        description: `${tier.description}. Incluye: ${tier.deliverables.join(', ')}.`,
        price: tier.price.toString(),
        priceCurrency: tier.currency,
        eligibleRegion: {
          '@type': 'City',
          name: 'Ciudad de México',
        },
        itemOffered: {
          '@type': 'Service',
          name: `${pkg.title} — ${tier.name}`,
          serviceType: pkg.title,
        },
      }))
    ),
  };

  const faqPage = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };

  const webSite = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Pablo Yamamoto — Piloto de Drones',
    url: SITE_URL,
    description:
      'Servicio profesional de fotografía y video aéreo con drones en Ciudad de México',
    inLanguage: 'es-MX',
    publisher: { '@id': `${SITE_URL}/#business` },
    author: { '@id': `${SITE_URL}/#person` },
  };

  return [professionalService, person, offerCatalog, faqPage, webSite];
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = buildStructuredData();

  return (
    <html
      lang="es"
      className={`${clashDisplay.variable} ${satoshi.variable}`}
    >
      <head>
        <link rel="alternate" hrefLang="es-MX" href={SITE_URL} />
        {structuredData.map((data, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          />
        ))}
      </head>
      <body>{children}</body>
    </html>
  );
}
