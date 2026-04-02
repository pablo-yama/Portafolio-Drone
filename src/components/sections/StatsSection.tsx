'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { STATS, EASE } from '@/lib/constants';

gsap.registerPlugin(ScrollTrigger);

const DroneScene = dynamic(
  () => import('@/components/three/DroneScene'),
  { ssr: false },
);

export function StatsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const progressRef = useRef(0);
  const titleRef = useRef<HTMLParagraphElement>(null);
  const subtitleRef = useRef<HTMLHeadingElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const statRefs = useRef<(HTMLDivElement | null)[]>([]);
  const [canRender3D, setCanRender3D] = useState(false);

  const [isMobile, setIsMobile] = useState(false);

  /* ── Detect 3D capability ── */
  useEffect(() => {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const mobile = /Mobi|Android/i.test(navigator.userAgent);
    setIsMobile(mobile);
    // Desktop: solo necesita WebGL. Mobile: WebGL + 4+ cores (performance)
    const cores = navigator.hardwareConcurrency || 2;
    setCanRender3D(gl !== null && (!mobile || cores >= 4));
  }, []);

  /* ── GSAP scroll-driven timeline ── */
  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({
        scrollTrigger: {
          trigger: sectionRef.current,
          start: 'top top',
          end: '+=300%',
          pin: true,
          scrub: 1,
          onUpdate: (self) => {
            progressRef.current = self.progress;
          },
        },
      });

      /* Phase 1 — Title + subtitle */
      if (titleRef.current) {
        tl.fromTo(
          titleRef.current,
          { opacity: 0, y: 30 },
          { opacity: 1, y: 0, duration: 0.3, ease: EASE.smooth },
          0,
        );
      }
      if (subtitleRef.current) {
        tl.fromTo(
          subtitleRef.current,
          { opacity: 0, y: 20 },
          { opacity: 1, y: 0, duration: 0.3, ease: EASE.smooth },
          0.15,
        );
      }

      /* Scroll progress bar (fills linearly) */
      if (progressBarRef.current) {
        tl.fromTo(
          progressBarRef.current,
          { scaleY: 0 },
          { scaleY: 1, duration: 2.8, ease: 'none' },
          0,
        );
      }

      /* Phase 2–5 — Stats appear one by one */
      const starts = [0.7, 1.2, 1.7, 2.2];

      statRefs.current.forEach((el, i) => {
        if (!el) return;
        const valueEl = el.querySelector('.stat-value');
        const accentLine = el.querySelector('.stat-accent');

        // Card reveal (slide up + fade + scale)
        tl.fromTo(
          el,
          { opacity: 0, y: 50, scale: 0.92 },
          {
            opacity: 1,
            y: 0,
            scale: 1,
            duration: 0.5,
            ease: EASE.smooth,
          },
          starts[i],
        );

        // Counter animation
        if (valueEl) {
          const proxy = { val: 0 };
          tl.fromTo(
            proxy,
            { val: 0 },
            {
              val: STATS[i].value,
              duration: 0.6,
              ease: 'power1.inOut',
              onUpdate: () => {
                (valueEl as HTMLElement).textContent = Math.round(
                  proxy.val,
                ).toString();
              },
            },
            starts[i],
          );
        }

        // Accent line grows from left
        if (accentLine) {
          tl.fromTo(
            accentLine,
            { scaleX: 0 },
            { scaleX: 1, duration: 0.4, ease: EASE.cinematic },
            starts[i] + 0.1,
          );
        }
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative h-screen w-full overflow-hidden"
      style={{ background: 'transparent' }}
    >
      {/* ── Subtle glow — no extra background, inherits page gradient ── */}
      <div className="pointer-events-none absolute inset-0">
        <div
          className="absolute inset-0"
          style={{
            background:
              'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(0,212,255,0.05) 0%, transparent 70%)',
          }}
        />
      </div>

      {/* ── 3D Drone Scene (desktop) ── */}
      {canRender3D && (
        <div className="absolute inset-0 z-0">
          <DroneScene progressRef={progressRef} mobile={isMobile} />
        </div>
      )}

      {/* ── Mobile fallback: animated gradient orb ── */}
      {!canRender3D && (
        <div className="absolute inset-0 z-0 flex items-center justify-center">
          <div
            className="h-72 w-72 rounded-full opacity-20 blur-3xl"
            style={{
              background:
                'radial-gradient(circle, var(--color-accent) 0%, #00E5C8 40%, transparent 70%)',
              animation: 'pulse 4s ease-in-out infinite',
            }}
          />
        </div>
      )}

      {/* ── Content overlay ── */}
      <div className="relative z-10 flex h-full flex-col items-center pt-20 pb-16 lg:pt-24 lg:pb-20">
        {/* Title area */}
        <div className="text-center">
          <p
            ref={titleRef}
            className="text-xs uppercase tracking-[0.4em] text-[var(--color-accent)]"
            style={{ opacity: 0 }}
          >
            Mi trayectoria en números
          </p>
          <h2
            ref={subtitleRef}
            className="mt-4 text-[var(--text-h2)] font-bold uppercase leading-tight"
            style={{ fontFamily: 'var(--font-clash)', opacity: 0 }}
          >
            El cielo{' '}
            <span className="text-gradient">habla por mí</span>
          </h2>
        </div>

        {/* Spacer — 3D drone occupies this visual area */}
        <div className="flex-1" />

        {/* Stats grid */}
        <div className="container-custom w-full">
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {STATS.map((stat, i) => (
              <div
                key={i}
                ref={(el) => {
                  statRefs.current[i] = el;
                }}
                className="glass group relative flex flex-col items-center overflow-hidden rounded-xl px-4 py-6 text-center lg:px-6 lg:py-8"
                style={{ opacity: 0 }}
              >
                {/* Top gradient accent line */}
                <div
                  className="stat-accent absolute left-0 top-0 h-[2px] w-full origin-left"
                  style={{
                    background: 'var(--gradient-accent)',
                    transform: 'scaleX(0)',
                  }}
                />

                {/* Number + suffix */}
                <div className="flex items-baseline gap-1">
                  <span
                    className="stat-value text-[clamp(2rem,4vw+0.5rem,4rem)] font-bold"
                    style={{ fontFamily: 'var(--font-clash)' }}
                  >
                    0
                  </span>
                  {stat.suffix && (
                    <span className="text-[var(--text-h3)] text-[var(--color-accent)]">
                      {stat.suffix}
                    </span>
                  )}
                </div>

                {/* Label */}
                <span className="mt-2 text-[var(--text-small)] uppercase tracking-[0.2em] text-[var(--color-text-muted)]">
                  {stat.label}
                </span>

                {/* Hover glow */}
                <div
                  className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100"
                  style={{
                    background:
                      'radial-gradient(circle at 50% 0%, rgba(0,212,255,0.08) 0%, transparent 60%)',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Scroll progress indicator (desktop only) ── */}
      <div className="absolute right-6 top-1/2 z-20 hidden -translate-y-1/2 lg:block">
        <div className="flex flex-col items-center gap-3">
          <span
            className="text-[9px] uppercase tracking-[0.3em] text-white/30"
            style={{ writingMode: 'vertical-rl' }}
          >
            Scroll
          </span>
          <div className="h-24 w-px overflow-hidden rounded-full bg-white/10">
            <div
              ref={progressBarRef}
              className="w-full origin-top bg-[var(--color-accent)]"
              style={{ height: '100%', transform: 'scaleY(0)' }}
            />
          </div>
        </div>
      </div>
    </section>
  );
}
