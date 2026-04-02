'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE } from '@/lib/constants';

gsap.registerPlugin(ScrollTrigger);

const STEPS = [
  {
    number: '01',
    title: 'Briefing',
    description: 'Entiendo tu visión, objetivos y lo que necesitas para diseñar la mejor estrategia aérea.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="20" cy="20" r="14" />
        <circle cx="20" cy="20" r="5" />
        <line x1="20" y1="3" x2="20" y2="9" />
        <line x1="20" y1="31" x2="20" y2="37" />
        <line x1="3" y1="20" x2="9" y2="20" />
        <line x1="31" y1="20" x2="37" y2="20" />
      </svg>
    ),
  },
  {
    number: '02',
    title: 'Plan de Vuelo',
    description: 'Diseño la ruta óptima, gestiono permisos y coordino la logística completa del vuelo.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 4C14.5 4 10 8.5 10 13.5c0 8 10 22.5 10 22.5s10-14.5 10-22.5C30 8.5 25.5 4 20 4z" />
        <circle cx="20" cy="13.5" r="3.5" />
      </svg>
    ),
  },
  {
    number: '03',
    title: 'Captura',
    description: 'Ejecuto el vuelo con precisión cinematográfica. Cada toma compuesta para impactar.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="5" y="10" width="30" height="22" rx="3" />
        <circle cx="20" cy="21" r="6" />
        <circle cx="20" cy="21" r="2.5" />
        <path d="M14 10V8a2.5 2.5 0 012.5-2.5h7A2.5 2.5 0 0126 8v2" />
      </svg>
    ),
  },
  {
    number: '04',
    title: 'Post-producción',
    description: 'Edición profesional, color grading cinematográfico y masterización en calidad 4K.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round">
        <line x1="10" y1="7" x2="10" y2="33" />
        <line x1="20" y1="7" x2="20" y2="33" />
        <line x1="30" y1="7" x2="30" y2="33" />
        <circle cx="10" cy="15" r="3.5" fill="currentColor" />
        <circle cx="20" cy="26" r="3.5" fill="currentColor" />
        <circle cx="30" cy="19" r="3.5" fill="currentColor" />
      </svg>
    ),
  },
  {
    number: '05',
    title: 'Entrega',
    description: 'Archivos finales en los formatos que necesites, listos para publicar o presentar.',
    icon: (
      <svg width="40" height="40" viewBox="0 0 40 40" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="20" cy="20" r="14" />
        <path d="M13 20l5 5L27 15" strokeWidth="2" />
      </svg>
    ),
  },
];

export function ProcessSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stepsContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !stepsContainerRef.current) return;

    const ctx = gsap.context(() => {
      const steps = gsap.utils.toArray<HTMLElement>('.process-step');
      const progressLine = sectionRef.current!.querySelector('.progress-line-fill') as HTMLElement;

      /* Pin section, scrub through steps */
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: `+=${steps.length * 100}%`,
          pin: true,
          scrub: 0.8,
        },
      });

      /* Animate progress line */
      if (progressLine) {
        tl.fromTo(progressLine, { scaleY: 0 }, { scaleY: 1, duration: steps.length, ease: 'none' }, 0);
      }

      /* Each step: fade in → hold → fade out */
      steps.forEach((step, i) => {
        const number = step.querySelector('.step-number');
        const icon = step.querySelector('.step-icon-wrap');
        const title = step.querySelector('.step-title');
        const desc = step.querySelector('.step-desc');
        const dot = sectionRef.current!.querySelectorAll('.progress-dot')[i];

        const enterTime = i;

        // Activate progress dot
        if (dot) {
          tl.to(dot, {
            scale: 1,
            opacity: 1,
            backgroundColor: '#00D4FF',
            boxShadow: '0 0 12px rgba(0,212,255,0.6)',
            duration: 0.15,
            ease: EASE.smooth,
          }, enterTime);
        }

        // Enter animations
        tl.fromTo(step, { opacity: 0, display: 'none' }, { opacity: 1, display: 'flex', duration: 0.01 }, enterTime);
        if (number) tl.fromTo(number, { opacity: 0, y: 30 }, { opacity: 1, y: 0, duration: 0.3, ease: EASE.smooth }, enterTime);
        if (icon) tl.fromTo(icon, { opacity: 0, scale: 0.7 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(1.4)' }, enterTime + 0.05);
        if (title) tl.fromTo(title, { opacity: 0, y: 20 }, { opacity: 1, y: 0, duration: 0.3, ease: EASE.smooth }, enterTime + 0.1);
        if (desc) tl.fromTo(desc, { opacity: 0, y: 15 }, { opacity: 1, y: 0, duration: 0.3, ease: EASE.smooth }, enterTime + 0.15);

        // Hold
        tl.to({}, { duration: 0.4 }, enterTime + 0.4);

        // Exit (except last step)
        if (i < steps.length - 1) {
          tl.to(step, { opacity: 0, duration: 0.2, ease: 'power2.in' }, enterTime + 0.8);
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="process"
      className="relative h-screen w-full overflow-hidden"
    >
      {/* ── Content ── */}
      <div className="relative z-10 flex h-full">

        {/* Left: Progress indicator */}
        <div className="hidden md:flex flex-col items-center justify-center gap-0 px-8 lg:px-12">
          {/* Vertical line track */}
          <div className="relative flex flex-col items-center gap-0" style={{ height: `${STEPS.length * 48 + (STEPS.length - 1) * 16}px` }}>
            {/* Background track */}
            <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/[0.06]" />
            {/* Animated fill */}
            <div
              className="progress-line-fill absolute left-1/2 top-0 h-full w-px -translate-x-1/2 origin-top bg-[var(--color-accent)]"
              style={{ transform: 'scaleY(0)' }}
            />
            {/* Dots */}
            {STEPS.map((step, i) => (
              <div
                key={step.number}
                className="progress-dot relative z-10 flex h-3 w-3 items-center justify-center rounded-full border border-white/20 bg-[var(--color-bg-elevated)]"
                style={{
                  position: 'absolute',
                  top: `${i * (48 + 16)}px`,
                  left: '50%',
                  transform: 'translateX(-50%) scale(0.6)',
                  opacity: 0.4,
                  transition: 'none',
                }}
              />
            ))}
          </div>
        </div>

        {/* Center: Steps content */}
        <div className="flex flex-1 flex-col items-center justify-center px-6">
          {/* Section header — always visible */}
          <div className="mb-20 text-center">
            <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[var(--color-accent)]">
              Proceso
            </p>
            <h2
              className="text-[var(--text-h2)] font-bold uppercase leading-tight"
              style={{ fontFamily: 'var(--font-clash)' }}
            >
              De la idea al{' '}
              <span className="text-gradient">cielo</span>
            </h2>
          </div>

          {/* Steps container — each step is absolutely positioned, fades in/out */}
          <div ref={stepsContainerRef} className="relative w-full max-w-2xl" style={{ minHeight: '420px' }}>
            {STEPS.map((step) => (
              <div
                key={step.number}
                className="process-step absolute inset-0 flex-col items-center text-center"
                style={{ opacity: 0, display: 'none' }}
              >
                {/* Number */}
                <span
                  className="step-number mb-8 block font-mono text-base tracking-[0.5em] text-[var(--color-accent)]/50"
                >
                  {step.number}
                </span>

                {/* Icon */}
                <div
                  className="step-icon-wrap mx-auto mb-12 flex h-28 w-28 items-center justify-center rounded-2xl border border-[var(--color-accent)]/15 bg-[var(--color-accent)]/[0.06] text-[var(--color-accent)]"
                >
                  {step.icon}
                </div>

                {/* Title */}
                <h3
                  className="step-title mb-8 text-4xl font-bold uppercase tracking-wider lg:text-5xl"
                  style={{ fontFamily: 'var(--font-clash)' }}
                >
                  {step.title}
                </h3>

                {/* Description */}
                <p className="step-desc mx-auto max-w-lg text-lg leading-loose text-[var(--color-text-muted)]">
                  {step.description}
                </p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: Step counter */}
        <div className="hidden md:flex items-center px-8 lg:px-12">
          <span
            className="text-[9px] uppercase tracking-[0.3em] text-white/20"
            style={{ writingMode: 'vertical-rl' }}
          >
            Scroll
          </span>
        </div>
      </div>

    </section>
  );
}
