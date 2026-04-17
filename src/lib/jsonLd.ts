import { FAQ_ITEMS, SERVICE_PACKAGES } from '@/lib/constants';

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? 'https://yamamotoaerial.com';

/* Alcaldías served within Mexico City */
const CDMX_ALCALDIAS = [
  'Álvaro Obregón',
  'Azcapotzalco',
  'Benito Juárez',
  'Coyoacán',
  'Cuajimalpa',
  'Cuauhtémoc',
  'Gustavo A. Madero',
  'Iztacalco',
  'Iztapalapa',
  'La Magdalena Contreras',
  'Miguel Hidalgo',
  'Milpa Alta',
  'Tláhuac',
  'Tlalpan',
  'Venustiano Carranza',
  'Xochimilco',
];

/* Offers are valid for the remainder of the current calendar year.
   priceValidUntil is required by Google for Offer schema. */
export function priceValidUntil(): string {
  const year = new Date().getFullYear();
  return `${year}-12-31`;
}

export function buildLocalBusiness() {
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#business`,
    name: 'Pablo Yamamoto Aerial',
    alternateName: 'Pablo Yamamoto — Piloto de Drones y Fotógrafo Aéreo',
    description:
      'Servicio profesional de fotografía y video aéreo con drones en la Ciudad de México. ' +
      'Cobertura de eventos, inspección de infraestructura y fotografía inmobiliaria. ' +
      'Más de 10 años de experiencia capturando CDMX desde el cielo.',
    url: SITE_URL,
    logo: `${SITE_URL}/og-image.jpg`,
    image: `${SITE_URL}/og-image.jpg`,
    telephone: '+525585699724',
    email: 'pabloyamamoto19@gmail.com',
    priceRange: '$4,500 - $40,000 MXN',
    currenciesAccepted: 'MXN',
    paymentAccepted: ['Transferencia bancaria', 'PayPal', 'Efectivo'],
    areaServed: [
      {
        '@type': 'City',
        name: 'Ciudad de México',
        sameAs: 'https://es.wikipedia.org/wiki/Ciudad_de_M%C3%A9xico',
      },
      ...CDMX_ALCALDIAS.map((name) => ({
        '@type': 'AdministrativeArea',
        name,
        containedInPlace: {
          '@type': 'City',
          name: 'Ciudad de México',
        },
      })),
    ],
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
    openingHoursSpecification: [
      {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: [
          'Monday',
          'Tuesday',
          'Wednesday',
          'Thursday',
          'Friday',
          'Saturday',
        ],
        opens: '09:00',
        closes: '19:00',
      },
    ],
    sameAs: [
      'https://www.instagram.com/the_pym_project/',
      'https://stock.adobe.com/es/contributor/211067778/Pablo',
    ],
    founder: { '@id': `${SITE_URL}/#person` },
    hasOfferCatalog: { '@id': `${SITE_URL}/#services` },
    makesOffer: { '@id': `${SITE_URL}/#services` },
    knowsLanguage: ['es', 'en'],
    inLanguage: 'es-MX',
    serviceType: [
      'Fotografía aérea con drones',
      'Video aéreo con drones',
      'Cobertura de eventos con drones',
      'Inspección de infraestructura con drones',
      'Fotografía inmobiliaria aérea',
      'Hyperlapse aéreo',
    ],
  };
}

export function buildPerson() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Person',
    '@id': `${SITE_URL}/#person`,
    name: 'Pablo Yamamoto Magaña',
    givenName: 'Pablo',
    familyName: 'Yamamoto Magaña',
    jobTitle: 'Piloto Profesional de Drones y Fotógrafo Aéreo',
    description:
      'Piloto profesional de drones especializado en fotografía y video aéreo cinematográfico en la Ciudad de México.',
    url: `${SITE_URL}/about`,
    email: 'pabloyamamoto19@gmail.com',
    telephone: '+525585699724',
    image: `${SITE_URL}/img/Pablo.jpg`,
    sameAs: [
      'https://www.instagram.com/the_pym_project/',
      'https://stock.adobe.com/es/contributor/211067778/Pablo',
    ],
    worksFor: { '@id': `${SITE_URL}/#business` },
    hasOccupation: {
      '@type': 'Occupation',
      name: 'Piloto de Drones — Fotografía y Video Aéreo',
      occupationLocation: {
        '@type': 'City',
        name: 'Ciudad de México',
      },
    },
    knowsAbout: [
      'Fotografía aérea con drones',
      'Video aéreo 4K',
      'Hyperlapse aéreo',
      'Inspección de infraestructura con drones',
      'Fotografía inmobiliaria aérea',
      'Post-producción cinematográfica',
    ],
  };
}

export function buildOfferCatalog() {
  const validUntil = priceValidUntil();
  return {
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
        priceValidUntil: validUntil,
        availability: 'https://schema.org/InStock',
        url: `${SITE_URL}/services`,
        eligibleRegion: {
          '@type': 'City',
          name: 'Ciudad de México',
        },
        seller: { '@id': `${SITE_URL}/#business` },
        itemOffered: {
          '@type': 'Service',
          name: `${pkg.title} — ${tier.name}`,
          serviceType: pkg.title,
          provider: { '@id': `${SITE_URL}/#business` },
          areaServed: {
            '@type': 'City',
            name: 'Ciudad de México',
          },
        },
      }))
    ),
  };
}

export function buildWebSite() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${SITE_URL}/#website`,
    name: 'Pablo Yamamoto Aerial — Piloto de Drones',
    url: SITE_URL,
    description:
      'Servicio profesional de fotografía y video aéreo con drones en Ciudad de México',
    inLanguage: 'es-MX',
    publisher: { '@id': `${SITE_URL}/#business` },
    author: { '@id': `${SITE_URL}/#person` },
  };
}

export function buildFAQPage() {
  return {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${SITE_URL}/faq#faq`,
    url: `${SITE_URL}/faq`,
    mainEntity: FAQ_ITEMS.map((item) => ({
      '@type': 'Question',
      name: item.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: item.answer,
      },
    })),
  };
}

/* Default structured data bundle emitted on every page (via root layout).
   FAQPage is deliberately excluded and emitted only on /faq. */
export function buildGlobalStructuredData() {
  return [buildLocalBusiness(), buildPerson(), buildOfferCatalog(), buildWebSite()];
}

/* Reusable JSON-LD script component */
export function jsonLdScript(data: object) {
  return {
    __html: JSON.stringify(data),
  };
}
