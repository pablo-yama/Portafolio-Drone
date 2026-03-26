---
description: SEO metadata and Schema.org structured data patterns
globs: ["**/layout.tsx", "**/page.tsx"]
---

# SEO & Metadata

## Next.js Metadata (`app/layout.tsx`)

```typescript
export const metadata: Metadata = {
  title: {
    default: '[MARCA] — Fotografía y Video Aéreo con Drones',
    template: '%s | [MARCA] Aerial',
  },
  description:
    'Servicios profesionales de fotografía y video aéreo con drones. '
    + 'Capturamos perspectivas únicas para real estate, construcción, '
    + 'eventos y producción audiovisual.',
  keywords: [
    'fotografía aérea', 'video con drones', 'drone photography',
    'aerial videography', 'fotografía inmobiliaria aérea', 'video aéreo México',
  ],
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
};
```

## Schema.org JSON-LD (`app/layout.tsx`)

```typescript
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'LocalBusiness',
  name: '[TU_MARCA] Aerial',
  description: 'Servicios profesionales de fotografía y video aéreo con drones',
  image: 'https://tu-dominio.com/og-image.jpg',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Ciudad de México',
    addressCountry: 'MX',
  },
  priceRange: '$$',
  serviceType: [
    'Fotografía aérea con drones',
    'Video aéreo con drones',
    'Recorridos virtuales 360',
    'Mapeo y topografía aérea',
  ],
};
```

Inject via `<script type="application/ld+json">{JSON.stringify(structuredData)}</script>` in layout.
