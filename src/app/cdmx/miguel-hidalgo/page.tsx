import Image from 'next/image';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { ARCHIVE } from '@/lib/archive';

const LOCAL_IMAGES = ARCHIVE.filter(
  (e) => e.thumbUrl && (e.loc === 'CDMX') &&
    ['Arquitectura', 'Real Estate', 'Urbanismo'].includes(e.cat)
).slice(0, 4);

export default function MiguelHidalgoPage() {
  return (
    <>
      <Navigation />
      <main>
        {/* ─── Hero ─── */}
        <section style={{ padding: 'calc(var(--nav-h, 64px) + 4rem) var(--container-pad, 2rem) 5rem', maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--signal)', marginBottom: '1rem' }}>
            CDMX · Miguel Hidalgo
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, fontStyle: 'italic', color: 'var(--fg)', lineHeight: 1.1, marginBottom: '2rem' }}>
            Fotografía y video aéreo<br />
            <span style={{ fontStyle: 'normal', fontWeight: 600 }}>con drones en Miguel Hidalgo —</span><br />
            <span style={{ fontStyle: 'normal', fontWeight: 600 }}>Polanco y Lomas, CDMX.</span>
          </h1>
          <p style={{ maxWidth: 680, lineHeight: 1.85, color: 'var(--dim)', fontSize: 14, marginBottom: '2rem' }}>
            Miguel Hidalgo concentra algunas de las colonias más fotografiadas de la Ciudad de México:
            Polanco, Lomas de Chapultepec, Anzures, Granada y las Torres de Reforma. Desde el aire, la
            densidad de arquitectura corporativa, residencias de alto valor y espacios verdes del bosque
            de Chapultepec produce imágenes que no tienen equivalente en ninguna otra alcaldía. Opero
            con registro AFAC vigente y seguro de responsabilidad civil para todos los vuelos en la zona.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="/contact?service=fotografia-video" style={{ padding: '0.75rem 1.5rem', background: 'var(--signal)', color: 'var(--bg)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Cotizar en Miguel Hidalgo ↗
            </a>
            <a href="/services" style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--signal)', color: 'var(--signal)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Ver servicios →
            </a>
          </div>
        </section>

        {/* ─── Colonias y usos ─── */}
        <section style={{ padding: '0 var(--container-pad, 2rem) 5rem', maxWidth: 1200, margin: '0 auto', borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', paddingTop: '4rem', alignItems: 'start' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', fontWeight: 400, fontStyle: 'italic', color: 'var(--fg)', marginBottom: '1.5rem' }}>
                Colonias con mayor demanda de vuelo
              </h2>
              <div style={{ display: 'grid', gap: '1px', background: 'var(--line)', border: '1px solid var(--line)' }}>
                {[
                  { colonia: 'Polanco', uso: 'Real estate premium, corporativos, restaurantes Michelin' },
                  { colonia: 'Lomas de Chapultepec', uso: 'Residencial de lujo, arquitectura patrimonial' },
                  { colonia: 'Anzures', uso: 'Desarrollo inmobiliario vertical, condominios' },
                  { colonia: 'Granada', uso: 'Torres de oficinas, eventos corporativos' },
                  { colonia: 'Bosque de Chapultepec', uso: 'Eventos masivos, documentación cultural' },
                  { colonia: 'Reforma (tramo Hidalgo)', uso: 'Torres financieras, arquitectura icónica' },
                ].map((r) => (
                  <div key={r.colonia} style={{ padding: '0.875rem 1.25rem', background: 'var(--bg)', display: 'grid', gridTemplateColumns: '140px 1fr', gap: '1rem' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--signal)' }}>{r.colonia}</span>
                    <span style={{ fontSize: 12, color: 'var(--dim)', lineHeight: 1.5 }}>{r.uso}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gap: '1.5rem', fontSize: 14, lineHeight: 1.85, color: 'var(--dim)' }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', fontWeight: 400, fontStyle: 'italic', color: 'var(--fg)', marginBottom: '0' }}>
                Real estate y arquitectura corporativa
              </h2>
              <p>
                Las inmobiliarias y desarrolladoras en Miguel Hidalgo son algunos de mis clientes más
                recurrentes. La perspectiva aérea de Polanco — sus calles arboladas, la densidad del
                corredor Presidente Masaryk, la vista cenital de las torres sobre el bosque — comunica
                el posicionamiento de un inmueble en segundos, algo que ningún render ni fotografía
                en tierra puede lograr con la misma contundencia.
              </p>
              <p>
                Para proyectos de real estate en la zona, el paquete estándar incluye: vuelo de
                reconocimiento, sesión en hora dorada o azul, 25–30 fotografías editadas en RAW y
                video aéreo 4K de 2–3 minutos con color grading cinematográfico. El Estadio GNP y
                las Torres de Polanco son ejemplos del tipo de proyectos arquitectónicos que he
                documentado con sede en esta alcaldía.
              </p>
              <p>
                Los eventos corporativos en hotel Presidente InterContinental, St. Regis, Sofitel o
                cualquier recinto de la zona se coordinan con aviso previo a la Secretaría de
                Seguridad Ciudadana cuando aplica, y con el equipo de producción del cliente.
              </p>
            </div>
          </div>
        </section>

        {/* ─── Imagen grid ─── */}
        {LOCAL_IMAGES.length > 0 && (
          <section style={{ padding: '0 var(--container-pad, 2rem) 5rem', maxWidth: 1200, margin: '0 auto' }}>
            <h2 style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '2rem' }}>
              Trabajos en CDMX
            </h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
              {LOCAL_IMAGES.map((e) => {
                const title = e.title.replace(/<[^>]+>/g, '');
                return (
                  <figure key={e.id} style={{ margin: 0, overflow: 'hidden', background: 'var(--panel)' }}>
                    <div style={{ position: 'relative', aspectRatio: '4/3' }}>
                      <Image src={e.thumbUrl!} alt={`${title} — ${e.cat}, CDMX`} fill sizes="(max-width: 768px) 100vw, 25vw" style={{ objectFit: 'cover' }} />
                    </div>
                    <figcaption style={{ padding: '0.75rem 1rem', fontSize: 11, letterSpacing: '0.15em', textTransform: 'uppercase', color: 'var(--dim)', borderTop: '1px solid var(--line)' }}>
                      {title} · {e.year}
                    </figcaption>
                  </figure>
                );
              })}
            </div>
            <p style={{ marginTop: '1.5rem', fontSize: 12, color: 'var(--dim)' }}>
              Ver el <a href="/archivo" style={{ color: 'var(--signal)' }}>archivo completo de 37 piezas →</a>
            </p>
          </section>
        )}

        {/* ─── Normativa ─── */}
        <section style={{ padding: '4rem var(--container-pad, 2rem) 6rem', maxWidth: 720, margin: '0 auto', borderTop: '1px solid var(--line)' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 400, color: 'var(--fg)', marginBottom: '1.5rem' }}>
            Permisos y normativa en Miguel Hidalgo
          </h2>
          <div style={{ display: 'grid', gap: '1.25rem', fontSize: 14, lineHeight: 1.85, color: 'var(--dim)' }}>
            <p>
              Miguel Hidalgo limita con el Bosque de Chapultepec, que tiene restricciones de
              espacio aéreo específicas por su proximidad al Aeropuerto Militar del Campo Marte.
              Para vuelos en la zona del bosque o en un radio de 3 km de Campo Marte, tramito
              la autorización correspondiente con la AFAC antes de cada operación.
            </p>
            <p>
              Las Torres de Polanco y los desarrollos verticales sobre Ejército Nacional y
              Presidente Masaryk se encuentran fuera de la zona restringida y no requieren
              permisos adicionales más allá del registro AFAC estándar. El seguro de
              responsabilidad civil cubre hasta $1,000,000 MXN por siniestro en todas las
              operaciones en la alcaldía.
            </p>
          </div>
          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="/contact" style={{ padding: '0.75rem 1.5rem', background: 'var(--signal)', color: 'var(--bg)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Solicitar cotización ↗
            </a>
            <a href="/faq" style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--line)', color: 'var(--dim)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Ver FAQ →
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
