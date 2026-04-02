'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SERVICE_PACKAGES, EASE } from '@/lib/constants';

gsap.registerPlugin(ScrollTrigger);

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
      <path d="M3 8.5l3.5 3.5L13 5" stroke="var(--color-accent)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function ArrowIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor">
      <path d="M3 8h10M9 4l4 4-4 4" strokeWidth="1.5" />
    </svg>
  );
}

export function ServicesSection() {
  const [activeService, setActiveService] = useState(0);
  const sectionRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  // Entrance animations
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      gsap.from('.services-section-heading', {
        y: 50,
        opacity: 0,
        duration: 1,
        ease: EASE.smooth,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      });

      gsap.from('.service-tab-home', {
        y: 20,
        opacity: 0,
        duration: 0.5,
        stagger: 0.08,
        ease: EASE.smooth,
        scrollTrigger: {
          trigger: '.services-tabs-row',
          start: 'top 85%',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  // Animate cards on tab change
  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll('.pricing-card-home');
    gsap.set(cards, { y: 40, opacity: 0 });
    gsap.to(cards, {
      y: 0,
      opacity: 1,
      duration: 0.7,
      stagger: 0.1,
      ease: EASE.smooth,
      delay: 0.05,
    });
  }, [activeService]);

  const service = SERVICE_PACKAGES[activeService];

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative min-h-screen w-full flex flex-col justify-center py-[var(--section-padding)]"
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background: 'radial-gradient(ellipse at 50% 20%, rgba(0,212,255,0.04) 0%, transparent 60%)',
        }}
      />

      <div className="container-custom relative z-10">

        {/* ── Heading block ── */}
        <div className="services-section-heading mb-16 lg:mb-24">
          <p className="section-label mb-6">Servicios</p>
          <h2
            className="text-[var(--text-h1)] font-bold uppercase leading-none"
            style={{ fontFamily: 'var(--font-clash)' }}
          >
            Soluciones aéreas<br />
            <span className="text-gradient">para tu proyecto</span>
          </h2>
          <p className="mt-8 max-w-lg text-[var(--color-text-muted)]" style={{ lineHeight: 1.9 }}>
            Cada proyecto es único. Elige el servicio y paquete que mejor
            se adapte a tus necesidades.
          </p>
        </div>

        {/* ── Service tabs ── */}
        <div className="services-tabs-row mb-24 flex flex-wrap gap-4">
          {SERVICE_PACKAGES.map((svc, i) => (
            <button
              key={svc.slug}
              onClick={() => setActiveService(i)}
              className={`service-tab-home pill-btn ${i === activeService ? 'active' : ''}`}
              data-cursor-text="Ver"
            >
              {svc.title}
            </button>
          ))}
        </div>

        {/* ── Pricing cards ── */}
        <div ref={cardsRef} className="grid gap-8 md:grid-cols-3">
          {service.tiers.map((tier) => (
            <div
              key={`${service.slug}-${tier.name}`}
              className="pricing-card-home relative flex flex-col rounded-2xl border transition-all duration-500"
              style={{
                borderColor: tier.popular ? 'rgba(0,212,255,0.2)' : 'var(--glass-border)',
                backgroundColor: tier.popular ? 'rgba(0,212,255,0.04)' : 'var(--glass-bg)',
                padding: 'clamp(2rem, 4vw, 3rem)',
              }}
              data-cursor-text="Elegir"
            >
              {tier.popular && (
                <span
                  className="absolute -top-3.5 left-8 rounded-full px-5 py-1.5 text-[10px] font-bold uppercase tracking-wider"
                  style={{ backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }}
                >
                  Más popular
                </span>
              )}

              {/* Tier name */}
              <h4
                className="text-xl font-bold uppercase tracking-wider"
                style={{ fontFamily: 'var(--font-clash)' }}
              >
                {tier.name}
              </h4>

              {/* Description — 16px below name */}
              <p className="mt-4 text-sm leading-relaxed text-[var(--color-text-muted)]">
                {tier.description}
              </p>

              {/* Price — 48px below description */}
              <div className="mt-12 flex items-baseline gap-2">
                <span className="text-xs text-[var(--color-text-muted)]">Desde</span>
                <span
                  className="text-4xl font-bold lg:text-5xl"
                  style={{ fontFamily: 'var(--font-clash)' }}
                >
                  ${tier.price.toLocaleString('es-MX')}
                </span>
                <span className="text-sm text-[var(--color-text-muted)]">{tier.currency}</span>
              </div>

              {/* Divider */}
              <div className="mt-12 mb-10">
                <div className="h-px w-full" style={{ backgroundColor: 'var(--glass-border)' }} />
              </div>

              {/* Deliverables */}
              <ul className="flex-1 space-y-6">
                {tier.deliverables.map((item) => (
                  <li key={item} className="flex items-start gap-3 text-sm leading-relaxed text-[var(--color-text-muted)]">
                    <CheckIcon />
                    {item}
                  </li>
                ))}
              </ul>

              {/* CTA */}
              <Link
                href={`/contact?service=${service.slug}&tier=${tier.name.toLowerCase()}`}
                className="mt-16 mb-4 flex w-full items-center justify-center gap-2 rounded-full py-4 text-sm font-semibold uppercase tracking-wider transition-all duration-300"
                style={
                  tier.popular
                    ? { backgroundColor: 'var(--color-accent)', color: 'var(--color-bg)' }
                    : { border: '1px solid var(--glass-border)' }
                }
                data-cursor-text="Cotizar"
              >
                Solicitar Cotización
                <ArrowIcon />
              </Link>
            </div>
          ))}
        </div>

        {/* ── Custom quote CTA ── */}
        <div className="mt-20 text-center">
          <p className="text-[var(--color-text-muted)]">
            ¿Necesitas algo diferente? Cada proyecto es único.
          </p>
          <Link
            href="/contact"
            className="mt-4 inline-flex items-center gap-2 text-sm uppercase tracking-wider text-[var(--color-accent)] transition-opacity hover:opacity-70"
          >
            Solicita una cotización personalizada
            <ArrowIcon />
          </Link>
        </div>
      </div>
    </section>
  );
}
