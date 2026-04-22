import { Suspense } from 'react';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { ContactForm, ContactFormSkeleton } from '@/components/sections/ContactForm';
import { ContactUplinkSceneWrapper } from '@/components/three/ContactUplinkSceneWrapper';
import { SITE_URL } from '@/lib/jsonLd';

const contactPageJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'ContactPage',
  '@id': `${SITE_URL}/contact#contactpage`,
  url: `${SITE_URL}/contact`,
  name: 'Contacto y Cotización — Pablo Yamamoto Aerial',
  description:
    'Solicita tu cotización gratuita para fotografía y video aéreo con drones en Ciudad de México. Respuesta en 24 horas.',
  inLanguage: 'es-MX',
  isPartOf: { '@id': `${SITE_URL}/#website` },
  about: { '@id': `${SITE_URL}/#business` },
  mainEntity: {
    '@type': 'LocalBusiness',
    '@id': `${SITE_URL}/#business`,
    name: 'Pablo Yamamoto Aerial',
    telephone: '+525585699724',
    email: 'pabloyamamoto19@gmail.com',
    url: SITE_URL,
    address: {
      '@type': 'PostalAddress',
      addressLocality: 'Ciudad de México',
      addressRegion: 'CDMX',
      addressCountry: 'MX',
    },
    geo: {
      '@type': 'GeoCoordinates',
      latitude: 19.4326,
      longitude: -99.1332,
    },
    contactPoint: [
      {
        '@type': 'ContactPoint',
        contactType: 'customer support',
        telephone: '+525585699724',
        email: 'pabloyamamoto19@gmail.com',
        availableLanguage: ['es', 'en'],
        areaServed: 'MX',
      },
    ],
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
  },
};

export default function ContactPage() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(contactPageJsonLd) }}
      />
      <Navigation />
      <main>
        <section className="cpage">
          {/* ============ LEFT: editorial intro + NAP (SSR) ============ */}
          <div className="left">
            <ContactUplinkSceneWrapper />

            <div className="kicker">
              <span>§ 05 / UPLINK</span>
              <span className="slash">/</span>
              <span>Canal abierto</span>
              <span className="slash">/</span>
              <span>Respuesta &lt; 24 h</span>
            </div>

            <h1>
              Envía
              <br />
              <span className="b">las</span>{' '}
              <span className="u">coordenadas.</span>
              <br />
              Yo llevo <span className="b">el</span>
              <br />
              <em>cielo.</em>
            </h1>

            <p className="clead">
              Cuéntame del proyecto —{' '}
              <strong>
                ubicación, objetivo, fechas tentativas y uso final.
              </strong>{' '}
              Con eso preparo una propuesta concreta y cotización formal.
              Respondo en menos de 24 horas; propuesta en 48.
            </p>

            <div className="cstrip">
              <div>
                Respuesta<span className="v">&lt; 24 h</span>
              </div>
              <div>
                Propuesta<span className="v">48 h</span>
              </div>
              <div>
                Cobertura<span className="v">Nacional</span>
              </div>
              <div>
                Idiomas<span className="v">ES · EN · JP</span>
              </div>
            </div>

            <div className="cproc">
              <div className="s">
                <div className="idx">01 · Envías</div>
                <h5>Briefing inicial</h5>
                <p>
                  Describe el proyecto, ubicaciones, fechas y formato de entrega
                  deseado.
                </p>
              </div>
              <div className="s">
                <div className="idx">02 · Revisamos</div>
                <h5>Llamada &amp; propuesta</h5>
                <p>
                  Una call de 20 min, alcance técnico y envío de cotización
                  formal en 48 h.
                </p>
              </div>
              <div className="s">
                <div className="idx">03 · Volamos</div>
                <h5>Captura &amp; entrega</h5>
                <p>
                  Plan de vuelo, operación y postproducción — todo en una
                  pieza.
                </p>
              </div>
            </div>

            <address
              className="cinfo"
              itemScope
              itemType="https://schema.org/LocalBusiness"
              style={{ fontStyle: 'normal' }}
            >
              <meta itemProp="name" content="Pablo Yamamoto Aerial" />
              <meta itemProp="url" content={SITE_URL} />
              <div>
                <div className="k">Canal directo</div>
                <a
                  className="v"
                  href="mailto:pabloyamamoto19@gmail.com"
                  itemProp="email"
                >
                  pabloyamamoto19@gmail.com
                </a>
              </div>
              <div>
                <div className="k">Teléfono</div>
                <a
                  className="v"
                  href="tel:+525585699724"
                  itemProp="telephone"
                >
                  +52 55 8569 9724
                </a>
              </div>
              <div
                itemProp="address"
                itemScope
                itemType="https://schema.org/PostalAddress"
              >
                <div className="k">Base</div>
                <div className="v">
                  <span itemProp="addressLocality">Polanco</span> ·{' '}
                  <span itemProp="addressRegion">CDMX</span>
                  <meta itemProp="addressCountry" content="MX" />
                </div>
                <div
                  className="sub"
                  itemProp="geo"
                  itemScope
                  itemType="https://schema.org/GeoCoordinates"
                >
                  <meta itemProp="latitude" content="19.4326" />
                  <meta itemProp="longitude" content="-99.1332" />
                  19.4326°N · 099.1332°W
                </div>
              </div>
              <div>
                <div className="k">Horario</div>
                <div className="v">Lun – Sáb · 9:00 – 19:00</div>
                <div className="sub">Hora CDMX (GMT-6)</div>
              </div>
              <div>
                <div className="k">Social</div>
                <a
                  className="v"
                  href="https://instagram.com/the_pym_project"
                  target="_blank"
                  rel="noopener noreferrer"
                  itemProp="sameAs"
                >
                  @the_pym_project ↗
                </a>
              </div>
            </address>
          </div>

          {/* ============ RIGHT: form panel (client, under Suspense) ============ */}
          <Suspense fallback={<ContactFormSkeleton />}>
            <ContactForm />
          </Suspense>
        </section>
      </main>
      <Footer />
    </>
  );
}
