import Image from 'next/image';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { ARCHIVE } from '@/lib/archive';

const LOCAL_IMAGES = ARCHIVE.filter(
  (e) => e.thumbUrl && e.loc === 'CDMX' &&
    ['Arquitectura', 'Urbanismo', 'Eventos'].includes(e.cat)
).slice(0, 4);

export default function CuauhtemocPage() {
  return (
    <>
      <Navigation />
      <main>
        <section style={{ padding: 'calc(var(--nav-h, 64px) + 4rem) var(--container-pad, 2rem) 5rem', maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--signal)', marginBottom: '1rem' }}>
            CDMX · Cuauhtémoc
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, fontStyle: 'italic', color: 'var(--fg)', lineHeight: 1.1, marginBottom: '2rem' }}>
            Fotografía y video aéreo<br />
            <span style={{ fontStyle: 'normal', fontWeight: 600 }}>con drones en Cuauhtémoc —</span><br />
            <span style={{ fontStyle: 'normal', fontWeight: 600 }}>Reforma y Centro, CDMX.</span>
          </h1>
          <p style={{ maxWidth: 680, lineHeight: 1.85, color: 'var(--dim)', fontSize: 14, marginBottom: '2rem' }}>
            Cuauhtémoc es la alcaldía más densa en historia visual de la Ciudad de México: el Paseo
            de la Reforma con sus glorietas y torres, el Zócalo y el Centro Histórico, el Museo Soumaya
            en Plaza Carso, la Alameda Central. Desde el aire, la superposición de siglos de arquitectura
            produce imágenes que los medios internacionales reconocen como íconos de la ciudad. Opero
            con registro AFAC vigente en toda la alcaldía, incluyendo zonas de espacio aéreo controlado
            cerca del AICM.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="/contact?service=fotografia-video" style={{ padding: '0.75rem 1.5rem', background: 'var(--signal)', color: 'var(--bg)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Cotizar en Cuauhtémoc ↗
            </a>
            <a href="/work" style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--signal)', color: 'var(--signal)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Ver portafolio →
            </a>
          </div>
        </section>

        <section style={{ padding: '0 var(--container-pad, 2rem) 5rem', maxWidth: 1200, margin: '0 auto', borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', paddingTop: '4rem', alignItems: 'start' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', fontWeight: 400, fontStyle: 'italic', color: 'var(--fg)', marginBottom: '1.5rem' }}>
                Zonas y proyectos habituales
              </h2>
              <div style={{ display: 'grid', gap: '1px', background: 'var(--line)', border: '1px solid var(--line)' }}>
                {[
                  { zona: 'Paseo de la Reforma', uso: 'Torres financieras, glorietas, hyperlapse urbano' },
                  { zona: 'Centro Histórico', uso: 'Catedral Metropolitana, Zócalo, edificios coloniales' },
                  { zona: 'Colonia Roma / Condesa', uso: 'Real estate boutique, arquitectura art déco' },
                  { zona: 'Doctores / Guerrero', uso: 'Cobertura de eventos y festivales culturales' },
                  { zona: 'Tepito / Lagunilla', uso: 'Documentación urbana y periodismo visual' },
                  { zona: 'Plaza Carso / Anzures', uso: 'Museo Soumaya, arquitectura contemporánea' },
                ].map((r) => (
                  <div key={r.zona} style={{ padding: '0.875rem 1.25rem', background: 'var(--bg)', display: 'grid', gridTemplateColumns: '160px 1fr', gap: '1rem' }}>
                    <span style={{ fontFamily: 'var(--mono)', fontSize: 11, color: 'var(--signal)' }}>{r.zona}</span>
                    <span style={{ fontSize: 12, color: 'var(--dim)', lineHeight: 1.5 }}>{r.uso}</span>
                  </div>
                ))}
              </div>
            </div>
            <div style={{ display: 'grid', gap: '1.5rem', fontSize: 14, lineHeight: 1.85, color: 'var(--dim)' }}>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', fontWeight: 400, fontStyle: 'italic', color: 'var(--fg)' }}>
                Arquitectura cultural y hospitalidad
              </h2>
              <p>
                En 2023 documenté el Museo Soumaya desde el aire — la fachada hexagonal de aluminio
                proyectada por Fernando Romero es uno de los edificios más fotogénicos de México visto
                desde una perspectiva cenital. El mismo año realicé fotografía aérea del corredor
                Ritz-BBVA en Reforma, combinando la altura dorada del atardecer con el movimiento
                de los autos en la avenida.
              </p>
              <p>
                Para hoteles de lujo en la zona (St. Regis, Four Seasons, Hyatt Regency) el servicio
                más solicitado es la cobertura de eventos privados: cenas en azotea, inauguraciones
                y conferencias que necesitan material aéreo para sus reportes internos y comunicados
                de prensa. Estos vuelos se coordinan directamente con el equipo de eventos del recinto.
              </p>
              <p>
                Los proyectos de la Roma y la Condesa suelen ser para arquitectos y desarrolladoras
                de proyectos boutique: documentación de edificios terminados, material para premios
                de diseño y contenido para redes sociales del despacho.
              </p>
            </div>
          </div>
        </section>

        {LOCAL_IMAGES.length > 0 && (
          <section style={{ padding: '0 var(--container-pad, 2rem) 5rem', maxWidth: 1200, margin: '0 auto' }}>
            <h2 style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '2rem' }}>
              Fotografía aérea en CDMX
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
              <a href="/archivo" style={{ color: 'var(--signal)' }}>Archivo completo — 37 piezas →</a>
            </p>
          </section>
        )}

        <section style={{ padding: '4rem var(--container-pad, 2rem) 6rem', maxWidth: 720, margin: '0 auto', borderTop: '1px solid var(--line)' }}>
          <h2 style={{ fontFamily: 'var(--serif)', fontStyle: 'italic', fontSize: 'clamp(1.25rem, 2.5vw, 1.75rem)', fontWeight: 400, color: 'var(--fg)', marginBottom: '1.5rem' }}>
            Permisos en Cuauhtémoc y zonas AICM
          </h2>
          <div style={{ display: 'grid', gap: '1.25rem', fontSize: 14, lineHeight: 1.85, color: 'var(--dim)' }}>
            <p>
              La alcaldía Cuauhtémoc se encuentra parcialmente dentro del área de influencia del
              Aeropuerto Internacional de la Ciudad de México (AICM). El Centro Histórico y la zona
              oriente de la alcaldía (Tepito, Guerrero) están dentro del radio de exclusión de 5 km
              que establece la AFAC para operaciones RPAS comerciales sin autorización específica.
            </p>
            <p>
              Para vuelos en esa zona tramito el permiso de operación ante la torre de control del
              AICM con al menos 48 horas de anticipación. El Paseo de la Reforma, la Colonia Roma,
              la Condesa y Plaza Carso quedan fuera de la zona restringida y operan con el registro
              AFAC estándar. Todos los vuelos en la alcaldía incluyen seguro de responsabilidad civil
              vigente por hasta $1,000,000 MXN.
            </p>
          </div>
          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="/contact" style={{ padding: '0.75rem 1.5rem', background: 'var(--signal)', color: 'var(--bg)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Solicitar cotización ↗
            </a>
            <a href="/faq" style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--line)', color: 'var(--dim)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Preguntas frecuentes →
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
