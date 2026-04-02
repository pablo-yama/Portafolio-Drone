'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SERVICE_PACKAGES, EASE } from '@/lib/constants';
import { Navigation } from '@/components/layout/Navigation';
import { Cursor } from '@/components/layout/Cursor';
import { SmoothScroll } from '@/components/layout/SmoothScroll';
import { Footer } from '@/components/layout/Footer';

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

export default function ServicesPage() {
  const [activeService, setActiveService] = useState(0);
  const heroRef = useRef<HTMLElement>(null);
  const cardsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heroRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ defaults: { ease: EASE.smooth } });

      tl.from('.services-hero-label', { y: 20, opacity: 0, duration: 0.6, delay: 0.3 })
        .from('.services-hero-title .line', { y: '110%', duration: 1.2, stagger: 0.1, ease: 'power4.out' }, '-=0.3')
        .from('.services-hero-desc', { y: 20, opacity: 0, duration: 0.8 }, '-=0.6')
        .from('.service-tab', { y: 20, opacity: 0, duration: 0.5, stagger: 0.08 }, '-=0.4');
    }, heroRef);

    return () => ctx.revert();
  }, []);

  useEffect(() => {
    if (!cardsRef.current) return;

    const cards = cardsRef.current.querySelectorAll('.pricing-card');
    gsap.set(cards, { y: 40, opacity: 0 });
    gsap.to(cards, {
      y: 0,
      opacity: 1,
      duration: 0.7,
      stagger: 0.1,
      ease: EASE.smooth,
      delay: 0.1,
    });
  }, [activeService]);

  const service = SERVICE_PACKAGES[activeService];

  return (
    <>
      <Cursor />
      <SmoothScroll>
        <Navigation />
        <main>
          {/* Hero */}
          <section
            ref={heroRef}
            className="relative flex min-h-[60vh] items-end pb-[var(--space-xl)] pt-40"
          >
            <div
              className="absolute inset-0"
              style={{
                background: 'radial-gradient(ellipse at 30% 20%, rgba(0,212,255,0.06) 0%, transparent 60%)',
              }}
            />
            <div className="container-custom relative z-10">
              <p className="services-hero-label section-label">Servicios</p>
              <h1
                className="services-hero-title overflow-hidden"
                style={{
                  fontSize: 'var(--text-h1)',
                  fontFamily: 'var(--font-clash)',
                  fontWeight: 700,
                  lineHeight: 1.1,
                }}
              >
                <span className="line block overflow-hidden">
                  <span className="inline-block">Soluciones aéreas</span>
                </span>
                <span className="line block overflow-hidden">
                  <span className="inline-block text-gradient">para tu proyecto</span>
                </span>
              </h1>
              <p className="services-hero-desc mt-8 max-w-xl text-[var(--color-text-muted)]" style={{ lineHeight: 1.9 }}>
                Cada proyecto es único. Elige el servicio y paquete que mejor se adapte a tus necesidades,
                o contáctame para una cotización personalizada.
              </p>

              {/* Service tabs */}
              <div className="mt-12 flex flex-wrap gap-3">
                {SERVICE_PACKAGES.map((svc, i) => (
                  <button
                    key={svc.slug}
                    onClick={() => setActiveService(i)}
                    className={`service-tab pill-btn ${i === activeService ? 'active' : ''}`}
                    data-cursor-text="Ver"
                  >
                    {svc.title}
                  </button>
                ))}
              </div>
            </div>
          </section>

          {/* Service detail + pricing */}
          <section className="py-[var(--space-xl)]">
            <div className="container-custom">
              {/* Service intro */}
              <div className="mb-16 grid gap-8 lg:grid-cols-2 lg:gap-16">
                <div>
                  <p className="mb-3 text-xs uppercase tracking-[0.3em] text-[var(--color-accent)]">
                    {service.subtitle}
                  </p>
                  <h2
                    className="text-[var(--text-h2)] font-bold uppercase leading-tight"
                    style={{ fontFamily: 'var(--font-clash)' }}
                  >
                    {service.title}
                  </h2>
                </div>
                <div>
                  <p className="text-[var(--color-text-muted)]" style={{ lineHeight: 1.9 }}>
                    {service.description}
                  </p>
                  <ul className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {service.features.map((feature) => (
                      <li key={feature} className="flex items-start gap-2 text-sm text-[var(--color-text-muted)]">
                        <CheckIcon />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Pricing cards */}
              <div ref={cardsRef} className="grid gap-6 md:grid-cols-3">
                {service.tiers.map((tier) => (
                  <div
                    key={tier.name}
                    className="pricing-card relative rounded-2xl border p-8 transition-all duration-500"
                    style={{
                      borderColor: tier.popular ? 'rgba(0,212,255,0.2)' : 'var(--glass-border)',
                      backgroundColor: tier.popular ? 'rgba(0,212,255,0.04)' : 'var(--glass-bg)',
                    }}
                    data-cursor-text="Elegir"
                  >
                    {tier.popular && (
                      <span className="absolute -top-3 left-6 rounded-full bg-[var(--color-accent)] px-4 py-1 text-[10px] font-bold uppercase tracking-wider text-[var(--color-bg)]">
                        Más popular
                      </span>
                    )}

                    <h3
                      className="text-lg font-bold uppercase tracking-wider"
                      style={{ fontFamily: 'var(--font-clash)' }}
                    >
                      {tier.name}
                    </h3>
                    <p className="mt-1 text-xs text-[var(--color-text-muted)]">{tier.description}</p>

                    <div className="mt-6 flex items-baseline gap-1">
                      <span className="text-xs text-[var(--color-text-muted)]">Desde</span>
                      <span
                        className="text-4xl font-bold"
                        style={{ fontFamily: 'var(--font-clash)' }}
                      >
                        ${tier.price.toLocaleString('es-MX')}
                      </span>
                      <span className="text-sm text-[var(--color-text-muted)]">{tier.currency}</span>
                    </div>

                    <hr className="my-6 border-[var(--glass-border)]" />

                    <ul className="space-y-3">
                      {tier.deliverables.map((item) => (
                        <li key={item} className="flex items-start gap-2.5 text-sm text-[var(--color-text-muted)]">
                          <CheckIcon />
                          {item}
                        </li>
                      ))}
                    </ul>

                    <Link
                      href={`/contact?service=${service.slug}&tier=${tier.name.toLowerCase()}`}
                      className={`mt-8 flex w-full items-center justify-center gap-2 rounded-full py-3.5 text-sm font-semibold uppercase tracking-wider transition-all duration-300 ${
                        tier.popular
                          ? 'bg-[var(--color-accent)] text-[var(--color-bg)] hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]'
                          : 'border border-[var(--glass-border)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]'
                      }`}
                      data-cursor-text="Cotizar"
                    >
                      Solicitar Cotización
                      <ArrowIcon />
                    </Link>
                  </div>
                ))}
              </div>

              {/* Custom quote CTA */}
              <div className="mt-16 text-center">
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

          {/* FAQ preview */}
          <section className="border-t border-[var(--glass-border)] py-[var(--space-xl)]">
            <div className="container-custom text-center">
              <h2
                className="text-[var(--text-h2)] font-bold uppercase"
                style={{ fontFamily: 'var(--font-clash)' }}
              >
                ¿Tienes dudas?
              </h2>
              <p className="mx-auto mt-4 max-w-md text-[var(--color-text-muted)]">
                Revisa las preguntas frecuentes o contáctame directamente.
              </p>
              <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                <Link
                  href="/faq"
                  className="pill-btn hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                >
                  Ver FAQ
                </Link>
                <Link
                  href="/contact"
                  className="inline-flex items-center gap-2 rounded-full bg-[var(--color-accent)] px-6 py-2.5 text-sm font-semibold uppercase tracking-wider text-[var(--color-bg)] transition-all duration-300 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]"
                >
                  Hablemos
                  <ArrowIcon />
                </Link>
              </div>
            </div>
          </section>
        </main>
        <Footer />
      </SmoothScroll>
    </>
  );
}
