'use client';

import dynamic from 'next/dynamic';

const ContactScene = dynamic(() => import('@/components/three/ContactScene'), {
  ssr: false,
  loading: () => null,
});

/**
 * ContactSection — final uplink block.
 *
 * Left: oversized italic serif invitation with a radial burnt-orange gradient
 * wash and a wireframe icosahedron drifting behind. Right: contact card with
 * direct channels.
 */
export function ContactSection() {
  return (
    <section id="contact" className="contact">
      <ContactScene />
      <div
        className="section-head"
        style={{
          padding: '0 0 40px',
          gridTemplateColumns: '180px 1fr',
          borderBottom: 'none',
          position: 'relative',
          zIndex: 2,
        }}
      >
        <div className="idx">§ 05 / Uplink</div>
        <div />
      </div>
      <div className="contact-grid">
        <div>
          <h2>
            ¿Un <span className="b">proyecto</span> que necesita
            <br />
            <span className="u">verse</span> desde el cielo?
          </h2>
          <p className="contact-lead">
            Escríbeme con una descripción breve: ubicación, objetivo, fechas tentativas y
            uso final. Respondo en menos de 24 horas con una propuesta concreta y
            cotización formal en 48.
          </p>
          <div style={{ marginTop: 40, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <a href="/contact" className="btn btn-fill">
              Iniciar uplink <span className="arr">→</span>
            </a>
            <a
              href="https://instagram.com/the_pym_project"
              className="btn btn-out"
              target="_blank"
              rel="noopener noreferrer"
            >
              @the_pym_project <span className="arr">↗</span>
            </a>
          </div>
        </div>

        <aside className="contact-card">
          <h4>Canal directo</h4>
          <div className="line">
            <span className="k">Operador</span>
            <span className="v">Pablo Yamamoto</span>
          </div>
          <div className="line">
            <span className="k">Email</span>
            <a href="mailto:pabloyamamoto19@gmail.com" className="v mono">
              pabloyamamoto19@gmail.com
            </a>
          </div>
          <div className="line">
            <span className="k">Teléfono</span>
            <a href="tel:+525585699724" className="v mono">
              +52 55 8569 9724
            </a>
          </div>
          <div className="line">
            <span className="k">Base</span>
            <span className="v">Polanco · CDMX</span>
          </div>
          <div className="line">
            <span className="k">Coords</span>
            <span className="v mono">19.4326°N · 99.1332°W</span>
          </div>
          <div className="line">
            <span className="k">Horario</span>
            <span className="v mono">LUN–VIE · 08–19H</span>
          </div>
          <div className="line">
            <span className="k">Respuesta</span>
            <span className="v">&lt; 24 h</span>
          </div>
        </aside>
      </div>
    </section>
  );
}
