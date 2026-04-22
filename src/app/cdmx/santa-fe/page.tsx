import Image from 'next/image';
import { Navigation } from '@/components/layout/Navigation';
import { Footer } from '@/components/layout/Footer';
import { ARCHIVE } from '@/lib/archive';

const LOCAL_IMAGES = ARCHIVE.filter(
  (e) => e.thumbUrl && e.loc === 'CDMX' &&
    ['Arquitectura', 'Urbanismo', 'Real Estate'].includes(e.cat)
).slice(2, 6);

export default function SantaFePage() {
  return (
    <>
      <Navigation />
      <main>
        <section style={{ padding: 'calc(var(--nav-h, 64px) + 4rem) var(--container-pad, 2rem) 5rem', maxWidth: 1200, margin: '0 auto' }}>
          <p style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--signal)', marginBottom: '1rem' }}>
            CDMX · Santa Fe / Álvaro Obregón
          </p>
          <h1 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 400, fontStyle: 'italic', color: 'var(--fg)', lineHeight: 1.1, marginBottom: '2rem' }}>
            Fotografía y video aéreo<br />
            <span style={{ fontStyle: 'normal', fontWeight: 600 }}>con drones en Santa Fe —</span><br />
            <span style={{ fontStyle: 'normal', fontWeight: 600 }}>Torres Mitikah y corporativos.</span>
          </h1>
          <p style={{ maxWidth: 680, lineHeight: 1.85, color: 'var(--dim)', fontSize: 14, marginBottom: '2rem' }}>
            Santa Fe es el distrito financiero más vertical de la Ciudad de México: torres de oficinas,
            desarrollos residenciales de lujo y el corredor corporativo que incluye a Torres Mitikah,
            uno de los edificios más altos del país. Desde el aire, la vista sobre el cañón de Santa Fe
            y la densidad de cristal y concreto produce imágenes arquitectónicas de alta impacto para
            desarrolladoras, arquitectos y empresas con sede en la zona. Mi base en Polanco me permite
            estar en locación en Santa Fe en menos de 30 minutos.
          </p>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="/contact?service=inspeccion" style={{ padding: '0.75rem 1.5rem', background: 'var(--signal)', color: 'var(--bg)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Cotizar en Santa Fe ↗
            </a>
            <a href="/services" style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--signal)', color: 'var(--signal)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Ver servicios →
            </a>
          </div>
        </section>

        <section style={{ padding: '0 var(--container-pad, 2rem) 5rem', maxWidth: 1200, margin: '0 auto', borderTop: '1px solid var(--line)' }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4rem', paddingTop: '4rem', alignItems: 'start' }}>
            <div>
              <h2 style={{ fontFamily: 'var(--serif)', fontSize: 'clamp(1.25rem, 2.5vw, 2rem)', fontWeight: 400, fontStyle: 'italic', color: 'var(--fg)', marginBottom: '1.5rem' }}>
                Proyectos y usos frecuentes
              </h2>
              <div style={{ display: 'grid', gap: '1px', background: 'var(--line)', border: '1px solid var(--line)' }}>
                {[
                  { zona: 'Torres Mitikah', uso: 'Documentación arquitectónica, marketing de desarrolladora' },
                  { zona: 'Corporativo Santa Fe', uso: 'Material para reportes anuales y comunicados' },
                  { zona: 'La Mexicana', uso: 'Cobertura de eventos al aire libre, conciertos' },
                  { zona: 'Construcción activa', uso: 'Seguimiento mensual de obra para inversores' },
                  { zona: 'Residencial vertical', uso: 'Fotografía inmobiliaria aérea para ventas' },
                  { zona: 'Parque La Mexicana', uso: 'Inspección de infraestructura verde urbana' },
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
                Construcción, inspección y real estate
              </h2>
              <p>
                Torres Mitikah, en la colonia Xoco (municipio Álvaro Obregón / Benito Juárez), es el
                ejemplo más representativo del tipo de proyecto que hago en esta zona: documentación
                arquitectónica de una torre de más de 260 metros desde múltiples ángulos aéreos, con
                tomas del skyline completo del corredor Santa Fe–Insurgentes visible al fondo. El
                material fue entregado al equipo de marketing de la desarrolladora en formato listo
                para publicación.
              </p>
              <p>
                Para constructoras con proyectos activos en Santa Fe, el servicio de seguimiento
                de obra incluye vuelos mensuales, fotogrametría y comparativas timelapse que
                documentan el avance para inversores y reportes de obra. El DJI Mavic 3 Pro con
                zoom óptico 7x permite inspeccionar fachadas y estructuras a distancia segura
                sin necesidad de andamios.
              </p>
              <p>
                El corredor residencial de Santa Fe tiene uno de los metros cuadrados más altos
                de CDMX. Las tomas aéreas de unidades en preconstrucción o entrega final son
                un diferenciador clave para los equipos de ventas de las desarrolladoras: el
                comprador potencial ve el contexto, la conectividad y la vista que tendrá desde
                su unidad antes de firmar el contrato.
              </p>
            </div>
          </div>
        </section>

        {LOCAL_IMAGES.length > 0 && (
          <section style={{ padding: '0 var(--container-pad, 2rem) 5rem', maxWidth: 1200, margin: '0 auto' }}>
            <h2 style={{ fontSize: 11, letterSpacing: '0.4em', textTransform: 'uppercase', color: 'var(--dim)', marginBottom: '2rem' }}>
              Trabajos en la zona poniente de CDMX
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
            Logística y normativa en Santa Fe
          </h2>
          <div style={{ display: 'grid', gap: '1.25rem', fontSize: 14, lineHeight: 1.85, color: 'var(--dim)' }}>
            <p>
              Santa Fe se ubica en la alcaldía Álvaro Obregón, fuera del área de exclusión del AICM y
              del AIFA, lo que simplifica la gestión de permisos. Los vuelos en el corredor corporativo
              y residencial operan con el registro AFAC estándar sin autorizaciones adicionales, siempre
              que se mantenga la altura máxima permitida de 120 metros sobre nivel del terreno.
            </p>
            <p>
              Para torres con helipuerto activo (algunas del corredor corporativo lo tienen), coordino
              directamente con el administrador del edificio antes del vuelo. El seguro de
              responsabilidad civil de $1,000,000 MXN cubre todas las operaciones en la zona.
              Tiempo de desplazamiento desde mi base en Polanco: 20–35 minutos según tráfico,
              lo que permite vuelos de hora azul sin salir con excesiva anticipación.
            </p>
          </div>
          <div style={{ marginTop: '2.5rem', display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <a href="/contact" style={{ padding: '0.75rem 1.5rem', background: 'var(--signal)', color: 'var(--bg)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Solicitar cotización ↗
            </a>
            <a href="/services#service-inspeccion" style={{ padding: '0.75rem 1.5rem', border: '1px solid var(--line)', color: 'var(--dim)', fontFamily: 'var(--mono)', fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', textDecoration: 'none' }}>
              Inspección de infraestructura →
            </a>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
