'use client';

import { useEffect, useRef } from 'react';

const STEPS = [
  {
    t: '01 · Briefing',
    h: 'Entendemos la visión',
    p: 'Objetivos, referencias, storyboard y entregables. Definimos la estrategia aérea del proyecto.',
  },
  {
    t: '02 · Plan de vuelo',
    h: 'Ruta & logística',
    p: 'Trazado de trayectorias, logística de equipo y coordinación con la ventana de luz óptima.',
  },
  {
    t: '03 · Captura',
    h: 'Vuelo ejecutado',
    p: 'Operación con precisión cinematográfica. Cada toma compuesta con intención narrativa.',
  },
  {
    t: '04 · Post',
    h: 'Edición + color',
    p: 'Selección, grading cinematográfico y masterización 4K. Versiones cortas para redes.',
  },
  {
    t: '05 · Entrega',
    h: 'Archivos finales',
    p: 'Formatos listos para cine, web, redes sociales o impresión a gran formato.',
  },
];

/**
 * MethodSection — horizontal 5-step timeline.
 *
 * Axis + glow progress bar stretch with scroll progress across the section.
 * Each step fades/lifts in when it crosses 40% threshold in the viewport.
 */
export function MethodSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    // Step reveal
    const stepEls = section.querySelectorAll<HTMLDivElement>('.tl-step');
    const stepIO = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            const idx = Array.from(stepEls).indexOf(e.target as HTMLDivElement);
            setTimeout(() => e.target.classList.add('in'), idx * 120);
            stepIO.unobserve(e.target);
          }
        });
      },
      { threshold: 0.4 },
    );
    stepEls.forEach((s) => stepIO.observe(s));

    // Progress bar driven by scroll
    const onScroll = () => {
      const r = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const p = Math.max(0, Math.min(1, (vh - r.top - 200) / (r.height - 100)));
      if (progressRef.current) progressRef.current.style.width = p * 100 + '%';
    };
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();

    return () => {
      stepIO.disconnect();
      window.removeEventListener('scroll', onScroll);
    };
  }, []);

  return (
    <section id="method" className="timeline" ref={sectionRef}>
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'end',
          gap: 40,
          flexWrap: 'wrap',
          marginBottom: 48,
        }}
      >
        <h2>
          De la idea al <span className="b">cielo —</span> cinco fases.
        </h2>
        <div
          style={{
            fontSize: 11,
            color: 'var(--dim)',
            letterSpacing: '.2em',
            textTransform: 'uppercase',
          }}
        >
          § 03 / Método
        </div>
      </div>

      <div className="tl-track">
        <div className="tl-axis" />
        <div className="tl-progress" ref={progressRef} />
        <div className="tl-steps">
          {STEPS.map((s) => (
            <div className="tl-step" key={s.t}>
              <span className="t">{s.t}</span>
              <h4>{s.h}</h4>
              <p>{s.p}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
