import { FAQ_ITEMS, SERVICE_PACKAGES } from '@/lib/constants';
import { ARCHIVE } from '@/lib/archive';

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
    '@type': ['LocalBusiness', 'ProfessionalService'],
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
    priceRange: 'MXN 4,500–40,000',
    currenciesAccepted: 'MXN',
    paymentAccepted: ['Transferencia bancaria', 'PayPal', 'Efectivo'],
    areaServed: [
      {
        '@type': 'City',
        name: 'Ciudad de México',
        sameAs: 'https://es.wikipedia.org/wiki/Ciudad_de_M%C3%A9xico',
      },
      {
        '@type': 'GeoCircle',
        geoMidpoint: {
          '@type': 'GeoCoordinates',
          latitude: 19.4326,
          longitude: -99.1332,
        },
        geoRadius: '60000',
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
    foundingDate: '2016',
    founder: { '@id': `${SITE_URL}/#person` },
    hasOfferCatalog: { '@id': `${SITE_URL}/#services` },
    contactPoint: {
      '@type': 'ContactPoint',
      telephone: '+525585699724',
      email: 'pabloyamamoto19@gmail.com',
      contactType: 'sales',
      availableLanguage: ['Spanish', 'English'],
      areaServed: 'MX',
      hoursAvailable: {
        '@type': 'OpeningHoursSpecification',
        dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
        opens: '09:00',
        closes: '19:00',
      },
    },
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

export function buildArchiveImageObjects() {
  return ARCHIVE.filter((entry) => entry.thumbUrl).map((entry) => ({
    '@context': 'https://schema.org',
    '@type': 'ImageObject',
    '@id': `${SITE_URL}/archivo#${entry.id}`,
    contentUrl: `${SITE_URL}${entry.thumbUrl}`,
    name: entry.title.replace(/<[^>]+>/g, ''),
    description: `Fotografía aérea — ${entry.cat}, ${entry.loc}, ${entry.year}. Capturada en ${entry.fmt} por Pablo Yamamoto Aerial.`,
    encodingFormat: 'image/jpeg',
    width: 2400,
    height: 1600,
    dateCreated: `${entry.year}-01-01`,
    author: { '@id': `${SITE_URL}/#person` },
    copyrightHolder: { '@id': `${SITE_URL}/#person` },
    copyrightNotice: `© ${entry.year} Pablo Yamamoto Magaña — Todos los derechos reservados`,
    creditText: 'Pablo Yamamoto Aerial',
    license: `${SITE_URL}/about`,
    acquireLicensePage: `${SITE_URL}/contact`,
    locationCreated: {
      '@type': 'Place',
      name: entry.loc === 'CDMX' ? 'Ciudad de México' : entry.loc,
      address: {
        '@type': 'PostalAddress',
        addressCountry: 'MX',
      },
    },
    keywords: [entry.cat, entry.loc, 'fotografía aérea con drones', 'drone photography'],
  }));
}

export function buildShowreelVideo() {
  return {
    '@context': 'https://schema.org',
    '@type': 'VideoObject',
    '@id': `${SITE_URL}/showreel#video`,
    name: 'Showreel de video aéreo con drones — Ciudad de México 4K',
    description:
      'Showreel cinematográfico 2025 de Pablo Yamamoto Aerial. Hyperlapses aéreos, ' +
      'fotografía 4K y cobertura de proyectos de arquitectura, urbanismo y deportes ' +
      'captados en Ciudad de México y alrededores.',
    thumbnailUrl: `${SITE_URL}/img/archivo/reforma-bbva_urbanismo_cdmx_2024.jpg`,
    uploadDate: '2025-01-01',
    duration: 'PT2M30S',
    contentUrl: `${SITE_URL}/videos/bosques.mov`,
    embedUrl: `${SITE_URL}/showreel`,
    inLanguage: 'es-MX',
    publisher: { '@id': `${SITE_URL}/#business` },
    author: { '@id': `${SITE_URL}/#person` },
    creator: { '@id': `${SITE_URL}/#person` },
    copyrightHolder: { '@id': `${SITE_URL}/#person` },
    copyrightYear: 2025,
    license: `${SITE_URL}/about`,
    keywords: [
      'drone video CDMX',
      'hyperlapse aéreo Ciudad de México',
      'video aéreo 4K',
      'fotografía aérea cinematográfica',
    ],
  };
}

export function buildServicesSchema() {
  return [
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${SITE_URL}/services#service-fotografia-video`,
      name: 'Fotografía y Video Aéreo con Drones',
      description:
        'Servicio profesional de fotografía y video aéreo cinematográfico con drones en 4K. ' +
        'Sensor CMOS 4/3 Hasselblad, RAW 24MP, color grading en DaVinci Resolve. ' +
        'Para arquitectura, real estate, marcas y producción audiovisual.',
      provider: { '@id': `${SITE_URL}/#business` },
      areaServed: { '@type': 'City', name: 'Ciudad de México' },
      url: `${SITE_URL}/services`,
      serviceType: 'Fotografía y Video Aéreo con Drones',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '4500',
        highPrice: '25000',
        priceCurrency: 'MXN',
        offerCount: 3,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${SITE_URL}/services#service-eventos`,
      name: 'Cobertura de Eventos con Drones',
      description:
        'Fotografía y video aéreo en vivo para eventos deportivos, corporativos, sociales y culturales en Ciudad de México. ' +
        'Coordinación con producción en tierra, entrega rápida post-evento.',
      provider: { '@id': `${SITE_URL}/#business` },
      areaServed: { '@type': 'City', name: 'Ciudad de México' },
      url: `${SITE_URL}/services`,
      serviceType: 'Cobertura de Eventos con Drones',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '6000',
        highPrice: '35000',
        priceCurrency: 'MXN',
        offerCount: 3,
      },
    },
    {
      '@context': 'https://schema.org',
      '@type': 'Service',
      '@id': `${SITE_URL}/services#service-inspeccion`,
      name: 'Inspección de Infraestructura con Drones',
      description:
        'Inspección visual y técnica de paneles solares, fachadas, azoteas y estructuras de difícil acceso. ' +
        'Reporte fotográfico georreferenciado, ortomosaicos y modelo 3D. Norma AFAC vigente.',
      provider: { '@id': `${SITE_URL}/#business` },
      areaServed: { '@type': 'City', name: 'Ciudad de México' },
      url: `${SITE_URL}/services`,
      serviceType: 'Inspección de Infraestructura con Drones',
      offers: {
        '@type': 'AggregateOffer',
        lowPrice: '8000',
        highPrice: '40000',
        priceCurrency: 'MXN',
        offerCount: 3,
      },
    },
  ];
}

export function buildBreadcrumbList(items: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: item.url,
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
