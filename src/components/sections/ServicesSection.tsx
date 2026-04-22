'use client';

import { useEffect, useRef } from 'react';
import Link from 'next/link';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SERVICE_PACKAGES, EASE } from '@/lib/constants';

gsap.registerPlugin(ScrollTrigger);

function CheckIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="shrink-0 mt-0.5">
      <path
        d="M3 8.5l3.5 3.5L13 5"
        stroke="var(--color-accent)"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
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

/**
 * ServicesSection — Terminal-industrial horizontal scroll.
 *
 * The section pins to the viewport and scrolls horizontally through three
 * service panels. Each panel shows one package with its three pricing tiers.
 * A progress bar at the top maps to scroll position; a monospace panel
 * counter (01/03) updates as each new panel enters.
 *
 * Mobile falls back to a regular vertical stack — horizontal pinning is
 * disabled below 1024px because it fights native touch scroll.
 */
export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;

    /* Skip horizontal scroll on mobile — use native vertical stack */
    const isMobile = window.matchMedia('(max-width: 1023px)').matches;
    if (isMobile) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>('.service-panel');
      const total = panels.length;
      if (total === 0) return;

      /* Horizontal scrub */
      const horizontalTween = gsap.to(trackRef.current, {
        xPercent: -100 * (total - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          snap: {
            snapTo: 1 / (total - 1),
            duration: { min: 0.2, max: 0.6 },
            ease: EASE.cinematic,
          },
          end: () => `+=${window.innerWidth * (total - 1)}`,
          onUpdate: (self) => {
            if (progressRef.current) {
              gsap.set(progressRef.current, { scaleX: self.progress });
            }
            if (counterRef.current) {
              const active = Math.min(
                total,
                Math.floor(self.progress * total) + 1,
              );
              counterRef.current.textContent = String(active).padStart(2, '0');
            }
          },
        },
      });

      /* Entrance animation for first panel's heading */
      gsap.from('.services-master-heading', {
        y: 40,
        opacity: 0,
        duration: 0.9,
        ease: EASE.smooth,
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top 75%',
        },
      });

      /* Per-panel card reveal as each enters the viewport — linked to horizontal tween */
      panels.forEach((panel) => {
        const cards = panel.querySelectorAll<HTMLElement>('.pricing-card-panel');
        if (cards.length === 0) return;
        gsap.from(cards, {
          y: 40,
          opacity: 0,
          duration: 0.6,
          stagger: 0.08,
          ease: EASE.smooth,
          scrollTrigger: {
            trigger: panel,
            containerAnimation: horizontalTween,
            start: 'left 75%',
            toggleActions: 'play none none reverse',
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  const total = SERVICE_PACKAGES.length;

  return (
    <section
      ref={sectionRef}
      id="services"
      className="relative w-full overflow-hidden bg-[var(--color-bg)] lg:h-screen"
    >
      {/* Background glow */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            'radial-gradient(ellipse at 50% 20%, rgba(0,212,255,0.04) 0%, transparent 60%)',
        }}
      />

      {/* ═══════════════ DESKTOP — Horizontal scroll rig ═══════════════ */}
      <div className="relative hidden h-full lg:block">
        {/* Fixed UI overlay — heading, progress bar, counter */}
        <div className="pointer-events-none absolute inset-x-0 top-0 z-20 pt-24">
          <div className="container-custom flex items-end justify-between">
            <div className="services-master-heading">
              <p
                className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-text-muted)]"
                style={{ fontFamily: 'var(--font-mono)' }}
              >
                <span className="text-[var(--color-accent)]">05</span>
                <span className="mx-2 opacity-40">—</span>
                Servicios
              </p>
              <h2
                className="mt-4 text-[var(--text-h2)] font-bold uppercase leading-none"
                style={{ fontFamily: 'var(--font-clash)' }}
              >
                Soluciones aéreas<br />
                <span className="text-gradient">para tu proyecto</span>
              </h2>
            </div>

            {/* Panel counter */}
            <div
              className="hidden items-baseline gap-3 font-mono text-sm uppercase tracking-[0.3em] text-[var(--color-text-muted)] lg:flex"
              style={{ fontFamily: 'var(--font-mono)' }}
            >
              <span ref={counterRef} className="text-[var(--color-accent)]">01</span>
              <span className="opacity-40">/</span>
              <span>{String(total).padStart(2, '0')}</span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="container-custom mt-8">
            <div className="h-px w-full overflow-hidden bg-white/10">
              <div
                ref={progressRef}
                className="h-full w-full origin-left bg-[var(--color-accent)]"
                style={{ transform: 'scaleX(0)' }}
              />
            </div>
          </div>
        </div>

        {/* Horizontal track */}
        <div className="flex h-full w-max" ref={trackRef}>
          {SERVICE_PACKAGES.map((service, i) => (
            <ServicePanel key={service.slug} service={service} index={i} total={total} />
          ))}
        </div>
      </div>

      {/* ═══════════════ MOBILE — Vertical stack fallback ═══════════════ */}
      <div className="lg:hidden">
        <div className="container-custom pt-32 pb-16">
          <p
            className="font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-text-muted)]"
            style={{ fontFamily: 'var(--font-mono)' }}
          >
            <span className="text-[var(--color-accent)]">05</span>
            <span className="mx-2 opacity-40">—</span>
            Servicios
          </p>
          <h2
            className="mt-4 text-[var(--text-h2)] font-bold uppercase leading-none"
            style={{ fontFamily: 'var(--font-clash)' }}
          >
            Soluciones aéreas<br />
            <span className="text-gradient">para tu proyecto</span>
          </h2>
        </div>
        <div className="space-y-24 pb-24">
          {SERVICE_PACKAGES.map((service) => (
            <div key={service.slug} className="container-custom">
              <ServicePanelContent service={service} />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ───────────────────────────────────────────────
   One horizontal panel = one service package
   ─────────────────────────────────────────────── */
function ServicePanel({
  service,
  index,
  total,
}: {
  service: (typeof SERVICE_PACKAGES)[number];
  index: number;
  total: number;
}) {
  return (
    <div className="service-panel flex h-screen w-screen shrink-0 items-center justify-center px-[var(--container-padding)]">
      <div className="w-full max-w-[var(--container-max)]">
        {/* Panel-local index (top-right of each panel) */}
        <div
          className="mb-10 flex items-baseline justify-end gap-3 font-mono text-[10px] uppercase tracking-[0.3em] text-[var(--color-text-muted)]"
          style={{ fontFamily: 'var(--font-mono)' }}
        >
          <span className="opacity-60">Panel</span>
          <span className="text-[var(--color-accent)]">
            {String(index + 1).padStart(2, '0')}
          </span>
          <span className="opacity-40">/</span>
          <span>{String(total).padStart(2, '0')}</span>
        </div>

        <ServicePanelContent service={service} />
      </div>
    </div>
  );
}

/* ───────────────────────────────────────────────
   Panel inner content — reused on mobile
   ─────────────────────────────────────────────── */
function ServicePanelContent({
  service,
}: {
  service: (typeof SERVICE_PACKAGES)[number];
}) {
  return (
    <>
      {/* Service title */}
      <div className="mb-12">
        <h3
          className="text-[clamp(1.5rem,2.5vw+0.5rem,3rem)] font-bold uppercase leading-tight"
          style={{ fontFamily: 'var(--font-clash)' }}
        >
          {service.title}
        </h3>
        <p className="mt-4 max-w-2xl text-sm leading-relaxed text-[var(--color-text-muted)]">
          {service.description}
        </p>
      </div>

      {/* Three tiers */}
      <div className="grid gap-6 md:grid-cols-3">
        {service.tiers.map((tier) => (
          <div
            key={`${service.slug}-${tier.name}`}
            className="pricing-card-panel relative flex flex-col rounded-2xl border transition-all duration-500"
            style={{
              borderColor: tier.popular
                ? 'rgba(0,212,255,0.2)'
                : 'var(--glass-border)',
              backgroundColor: tier.popular
                ? 'rgba(0,212,255,0.04)'
                : 'var(--glass-bg)',
              padding: 'clamp(1.5rem, 3vw, 2.25rem)',
            }}
            data-cursor-text="Elegir"
          >
            {tier.popular && (
              <span
                className="absolute -top-3 left-6 rounded-full px-4 py-1 text-[9px] font-bold uppercase tracking-wider"
                style={{
                  backgroundColor: 'var(--color-accent)',
                  color: 'var(--color-bg)',
                }}
              >
                Más popular
              </span>
            )}

            <h4
              className="text-lg font-bold uppercase tracking-wider"
              style={{ fontFamily: 'var(--font-clash)' }}
            >
              {tier.name}
            </h4>

            <p className="mt-3 text-xs leading-relaxed text-[var(--color-text-muted)]">
              {tier.description}
            </p>

            <div className="mt-8 flex items-baseline gap-2">
              <span className="text-[10px] text-[var(--color-text-muted)]">Desde</span>
              <span
                className="text-3xl font-bold lg:text-4xl"
                style={{ fontFamily: 'var(--font-clash)' }}
              >
                ${tier.price.toLocaleString('es-MX')}
              </span>
              <span className="text-xs text-[var(--color-text-muted)]">
                {tier.currency}
              </span>
            </div>

            <div
              className="mt-8 mb-6 h-px w-full"
              style={{ backgroundColor: 'var(--glass-border)' }}
            />

            <ul className="flex-1 space-y-4">
              {tier.deliverables.map((item) => (
                <li
                  key={item}
                  className="flex items-start gap-3 text-xs leading-relaxed text-[var(--color-text-muted)]"
                >
                  <CheckIcon />
                  {item}
                </li>
              ))}
            </ul>

            <Link
              href={`/contact?service=${service.slug}&tier=${tier.name.toLowerCase()}`}
              className="mt-8 flex w-full items-center justify-center gap-2 rounded-full py-3 text-xs font-semibold uppercase tracking-wider transition-all duration-300"
              style={
                tier.popular
                  ? {
                      backgroundColor: 'var(--color-accent)',
                      color: 'var(--color-bg)',
                    }
                  : { border: '1px solid var(--glass-border)' }
              }
              data-cursor-text="Cotizar"
            >
              Cotizar
              <ArrowIcon />
            </Link>
          </div>
        ))}
      </div>
    </>
  );
}
