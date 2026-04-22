import type { Metadata } from 'next';
import { Fraunces, JetBrains_Mono } from 'next/font/google';
import { SpeedInsights } from '@vercel/speed-insights/next';
import { Analytics } from '@vercel/analytics/next';
import './globals.css';
import { buildGlobalStructuredData, SITE_URL } from '@/lib/jsonLd';

const fraunces = Fraunces({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600'],
  style: ['normal', 'italic'],
  variable: '--font-fraunces',
  display: 'swap',
});

const jetBrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Pablo Yamamoto — Fotografía y Video Aéreo con Drones en CDMX',
    template: '%s | Pablo Yamamoto — Drones CDMX',
  },
  description:
    'Fotografía y video aéreo profesional con drones en Ciudad de México. ' +
    'Más de 10 años de experiencia en vuelos cinematográficos. ' +
    'Desde $4,500 MXN. Cotiza gratis con Pablo Yamamoto.',
  authors: [{ name: 'Pablo Yamamoto Magaña', url: `${SITE_URL}/about` }],
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
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Pablo Yamamoto — Fotografía y video aéreo con drones en CDMX',
      },
    ],
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
      className={`${fraunces.variable} ${jetBrainsMono.variable}`}
    >
      <head>
        {structuredData.map((data, i) => (
          <script
            key={i}
            type="application/ld+json"
            dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
          />
        ))}
      </head>
      <body>
        {children}
        <div className="vignette" aria-hidden="true" />
        <SpeedInsights />
        <Analytics />
      </body>
    </html>
  );
}
