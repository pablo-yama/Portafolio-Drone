import type { Metadata } from 'next';
import { SITE_URL, buildBreadcrumbList } from '@/lib/jsonLd';
import { PRIVACY_POLICY } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Aviso de Privacidad',
  description:
    'Aviso de privacidad de Pablo Yamamoto Aerial conforme a la LFPDPPP: qué datos se recaban, '
    + 'con qué finalidad se tratan, quiénes son los encargados y cómo ejercer tus derechos ARCO.',
  alternates: {
    canonical: '/privacy',
    languages: { 'es-MX': '/privacy' },
  },
  openGraph: {
    title: 'Aviso de Privacidad | Pablo Yamamoto Aerial',
    description:
      'Qué datos personales se recaban en yamamotoaerial.com, con qué finalidad se tratan y cómo ejercer tus derechos ARCO.',
    url: '/privacy',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Aviso de privacidad — Pablo Yamamoto Aerial',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    images: ['/og-image.jpg'],
  },
};

/* PrivacyPolicy is the schema.org type Google and AI crawlers look for when
   verifying that a business publishes a real data-handling policy. */
const privacyJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'PrivacyPolicy',
  '@id': `${SITE_URL}/privacy#policy`,
  url: `${SITE_URL}/privacy`,
  name: PRIVACY_POLICY.title,
  description: PRIVACY_POLICY.lead,
  inLanguage: 'es-MX',
  dateModified: PRIVACY_POLICY.updated,
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#business` },
  publisher: { '@id': `${SITE_URL}/#business` },
};

export default function PrivacyLayout({ children }: { children: React.ReactNode }) {
  const breadcrumb = buildBreadcrumbList([
    { name: 'Inicio', url: SITE_URL },
    { name: 'Aviso de Privacidad', url: `${SITE_URL}/privacy` },
  ]);
  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(privacyJsonLd) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumb) }} />
      {children}
    </>
  );
}
