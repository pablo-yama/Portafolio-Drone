'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';

/**
 * AboutSection — §02 Piloto.
 *
 * Left column: layered portrait mock that parallaxes with the pointer. Each
 * `[data-depth]` layer translates at a different ratio so the whole thing feels
 * like a diorama reacting to the cursor. Right column: long-form text + a compact
 * spec table.
 */
export function AboutSection() {
  const splitRef = useRef<HTMLElement>(null);
  const imgRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const split = splitRef.current;
    if (!split) return;
    const els = split.querySelectorAll<HTMLElement>('.fade-up');
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e, i) => {
          if (e.isIntersecting) {
            (e.target as HTMLElement).style.transitionDelay = i * 80 + 'ms';
            e.target.classList.add('in');
            io.unobserve(e.target);
          }
        });
      },
      { threshold: 0.15 },
    );
    els.forEach((el) => io.observe(el));
    return () => io.disconnect();
  }, []);

  useEffect(() => {
    const portrait = imgRef.current;
    if (!portrait) return;
    const layers = portrait.querySelectorAll<HTMLElement>('[data-depth]');
    const onMove = (e: MouseEvent) => {
      const r = portrait.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width - 0.5;
      const y = (e.clientY - r.top) / r.height - 0.5;
      layers.forEach((layer) => {
        const depth = Number(layer.dataset.depth || 0);
        layer.style.transform = `translate3d(${x * depth}px, ${y * depth}px, 0)`;
      });
    };
    const onLeave = () => {
      layers.forEach((layer) => (layer.style.transform = ''));
    };
    portrait.addEventListener('mousemove', onMove);
    portrait.addEventListener('mouseleave', onLeave);
    return () => {
      portrait.removeEventListener('mousemove', onMove);
      portrait.removeEventListener('mouseleave', onLeave);
    };
  }, []);

  return (
    <>
      <div className="section-head" id="about">
        <div className="idx">§ 02 / Piloto</div>
        <h2>
          <span className="b">Pablo</span> Yamamoto <br />
          <em>— operador &amp; ojo.</em>
        </h2>
        <div className="meta">
          10 años en vuelo
          <br />
          Base · Polanco, CDMX
        </div>
      </div>

      <section className="split" ref={splitRef}>
        <div className="split-img fade-up" ref={imgRef}>
          <div className="portrait">
            <div className="layer l-bg" data-depth="8" />
            <div className="layer l-mid" data-depth="18" />
            <div className="layer l-photo" data-depth="12">
              <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                <Image
                  src="/img/Pablo.jpg"
                  alt="Pablo Yamamoto — piloto de drones en CDMX"
                  fill
                  priority
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover', objectPosition: 'center 30%', filter: 'grayscale(0.15) contrast(1.05)' }}
                />
              </div>
            </div>
            <div className="layer l-grid" data-depth="30" />
            <div className="layer l-scan" />
            <div className="portrait-chip mono">
              <span className="c">●</span> PILOTO · ACTIVO
            </div>
            <div className="portrait-coords mono">19.4326°N · 99.1332°W</div>
          </div>
        </div>

        <div className="split-txt fade-up">
          <h3>
            El cielo <br />
            es el <em>estudio</em>.
          </h3>
          <p>
            Empecé en 2016 con un Phantom 3 y un mapa de azoteas. Diez años después,
            sigo midiendo cada vuelo por lo mismo: la toma que sólo existe arriba, la
            que rescata una historia que desde tierra no se ve.
          </p>
          <p>
            Trabajo con desarrolladores, productoras, arquitectos y marcas que
            entienden que el <em>frame</em> es tan importante como el lente. Cada
            proyecto arranca con una conversación corta sobre la intención y termina
            con archivos listos para editorial, impresión o redes.
          </p>
          <p>
            Si vienes a pedir cielo, llegaste al lugar correcto.
          </p>

          <div className="spec-table">
            <div className="r">
              <span className="k">Base</span>
              <span className="v">Polanco · CDMX</span>
            </div>
            <div className="r">
              <span className="k">Radio</span>
              <span className="v">CDMX · EDOMEX · Nacional</span>
            </div>
            <div className="r">
              <span className="k">Equipo</span>
              <span className="v">Mavic 3 Pro · DJI RS3</span>
            </div>
            <div className="r">
              <span className="k">Entrega</span>
              <span className="v">3–5 días hábiles</span>
            </div>
            <div className="r">
              <span className="k">Disponibilidad</span>
              <span className="v">LUN–VIE · 08–19H</span>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
