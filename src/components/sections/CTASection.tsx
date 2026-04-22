'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { SectionNumber } from '@/components/ui/SectionNumber';

gsap.registerPlugin(ScrollTrigger);

export function CTASection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !headingRef.current) return;

    const ctx = gsap.context(() => {
      const lines = headingRef.current!.querySelectorAll('.cta-line');
      gsap.from(lines, {
        y: '100%',
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 70%',
        },
      });

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top bottom',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          if (headingRef.current) {
            gsap.set(headingRef.current, { y: (0.5 - self.progress) * -80 });
          }
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="contact"
      className="relative flex min-h-screen w-full items-center justify-center overflow-hidden py-[var(--section-padding)]"
    >
      <div
        className="absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at center, rgba(0,212,255,0.05) 0%, transparent 60%)',
        }}
      />

      <div className="container-custom relative z-10 text-center">
        <div className="mb-12 flex justify-center">
          <SectionNumber index="06" label="Contacto" meta="MX · Global" />
        </div>

        <h2
          ref={headingRef}
          className="overflow-hidden"
          style={{
            fontSize: 'var(--text-h1)',
            fontFamily: 'var(--font-clash)',
            fontWeight: 700,
            lineHeight: 1.1,
          }}
        >
          <span className="cta-line block overflow-hidden">
            <span className="inline-block">&iquest;Tienes un proyecto</span>
          </span>
          <span className="cta-line block overflow-hidden">
            <span className="inline-block">que necesita verse</span>
          </span>
          <span className="cta-line block overflow-hidden">
            <span className="inline-block text-gradient">desde el cielo?</span>
          </span>
        </h2>

        <p className="mx-auto mt-10 max-w-md text-[var(--color-text-muted)]" style={{ lineHeight: 1.9 }}>
          Cuéntame qué tienes en mente. Siempre estoy buscando proyectos interesantes
          donde mi perspectiva aérea pueda hacer la diferencia.
        </p>

        <div className="mt-14 flex flex-wrap items-center justify-center gap-6">
          <Link
            href="/contact"
            className="inline-flex items-center gap-3 rounded-full bg-[var(--color-accent)] px-10 py-5 text-sm font-semibold uppercase tracking-wider text-[var(--color-bg)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_40px_rgba(0,212,255,0.3)]"
            data-cursor-text="Contactar"
          >
            Hablemos
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
              <path d="M3 8h10M9 4l4 4-4 4" strokeWidth="1.5" />
            </svg>
          </Link>
          <a
            href="mailto:pabloyamamoto19@gmail.com"
            className="rounded-full border border-[var(--glass-border)] px-8 py-5 text-sm uppercase tracking-wider transition-all duration-300 hover:border-[var(--color-text)]"
          >
            pabloyamamoto19@gmail.com
          </a>
        </div>
      </div>
    </section>
  );
}
