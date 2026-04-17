import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import { buildGlobalStructuredData, SITE_URL } from '@/lib/jsonLd';

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

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Pablo Yamamoto — Fotografía y Video Aéreo con Drones en CDMX',
    template: '%s | Pablo Yamamoto — Drones CDMX',
  },
  description:
    'Fotografía y video aéreo profesional con drones en Ciudad de México. ' +
    'Más de 10 años de experiencia con seguro de responsabilidad civil. ' +
    'Desde $4,500 MXN. Cotiza gratis con Pablo Yamamoto.',
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
    siteName: 'Pablo Yamamoto Aerial',
    title: 'Pablo Yamamoto — Fotografía y Video Aéreo con Drones en CDMX',
    description:
      'Fotografía y video aéreo profesional con drones en Ciudad de México. ' +
      'Desde $4,500 MXN.',
    url: SITE_URL,
    images: [{ url: '/og-image.jpg', width: 1200, height: 630, alt: 'Pablo Yamamoto — Fotografía y video aéreo con drones en CDMX' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pablo Yamamoto — Fotografía y Video Aéreo con Drones en CDMX',
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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const structuredData = buildGlobalStructuredData();

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
