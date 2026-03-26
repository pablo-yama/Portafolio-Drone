'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import heroImage from '@/img/reforma-noche.jpg';

gsap.registerPlugin(ScrollTrigger);

export function HeroSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLHeadingElement>(null);
  const subtitleRef = useRef<HTMLParagraphElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const scrollIndicatorRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !headingRef.current) return;

    const ctx = gsap.context(() => {
      const tl = gsap.timeline({ delay: 2.8 });

      if (imageRef.current) {
        tl.from(imageRef.current, { scale: 1.3, duration: 2, ease: 'power3.out' }, 0);
      }

      const lines = headingRef.current!.querySelectorAll('.hero-line');
      tl.from(lines, {
        y: '110%',
        duration: 1.2,
        ease: 'power4.out',
        stagger: 0.15,
      }, 0.5);

      if (subtitleRef.current) {
        tl.from(subtitleRef.current, { y: 30, opacity: 0, duration: 0.8, ease: 'power3.out' }, '-=0.5');
      }

      if (ctaRef.current) {
        tl.from(ctaRef.current.children, { y: 20, opacity: 0, duration: 0.6, ease: 'power3.out', stagger: 0.1 }, '-=0.4');
      }

      if (scrollIndicatorRef.current) {
        tl.from(scrollIndicatorRef.current, { opacity: 0, duration: 0.6 }, '-=0.2');

        ScrollTrigger.create({
          trigger: sectionRef.current,
          start: 'top top',
          end: '10% top',
          onLeave: () => gsap.to(scrollIndicatorRef.current, { opacity: 0, duration: 0.3 }),
          onEnterBack: () => gsap.to(scrollIndicatorRef.current, { opacity: 1, duration: 0.3 }),
        });
      }

      // GPU-accelerated parallax with quickSetter
      const setHeadingY = gsap.quickSetter(headingRef.current!, 'y', 'px');
      const setImageY = gsap.quickSetter(imageRef.current!, 'y', 'px');

      ScrollTrigger.create({
        trigger: sectionRef.current,
        start: 'top top',
        end: 'bottom top',
        scrub: true,
        onUpdate: (self) => {
          setHeadingY(self.progress * 150);
          setImageY(self.progress * -80);
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      className="relative flex min-h-screen items-center justify-center overflow-hidden"
    >
      {/* Background image */}
      <div ref={imageRef} className="absolute inset-0 scale-110 will-change-transform">
        <Image
          src={heroImage}
          alt="Vista aérea nocturna de Reforma, Ciudad de México"
          fill
          priority
          quality={80}
          placeholder="blur"
          className="object-cover"
          sizes="100vw"
        />
      </div>

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-b from-[var(--color-bg)]/70 via-[var(--color-bg)]/30 to-[var(--color-bg)]/80" />
      <div className="absolute inset-0 bg-[var(--color-bg)]/20" />

      {/* Content */}
      <div className="container-custom relative z-10 flex flex-col items-center text-center">
        <p ref={subtitleRef} className="mb-10 text-xs uppercase tracking-[0.4em] text-[var(--color-accent)]">
          Piloto de Drones &bull; Fotógrafo Aéreo
        </p>

        <h1
          ref={headingRef}
          className="overflow-hidden"
          style={{
            fontSize: 'var(--text-hero)',
            fontFamily: 'var(--font-clash)',
            fontWeight: 700,
            lineHeight: 0.95,
            letterSpacing: '-0.02em',
            textShadow: '0 2px 30px rgba(0,0,0,0.5)',
          }}
        >
          <span className="hero-line block overflow-hidden">
            <span className="inline-block">VEO EL MUNDO</span>
          </span>
          <span className="hero-line block overflow-hidden">
            <span className="inline-block">DESDE</span>
          </span>
          <span className="hero-line block overflow-hidden">
            <span className="inline-block text-gradient">OTRA PERSPECTIVA</span>
          </span>
        </h1>

        <div ref={ctaRef} className="mt-14 flex flex-wrap items-center justify-center gap-5">
          <a
            href="#showreel"
            className="group flex items-center gap-3 rounded-full bg-[var(--color-accent)] px-10 py-5 text-sm font-semibold uppercase tracking-wider text-[var(--color-bg)] transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(0,212,255,0.3)]"
            data-cursor-text="Play"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" className="transition-transform duration-300 group-hover:scale-110">
              <path d="M4 2l10 6-10 6V2z" />
            </svg>
            Ver Mi Showreel
          </a>
          <a
            href="#work"
            className="rounded-full border border-white/30 px-10 py-5 text-sm uppercase tracking-wider backdrop-blur-sm transition-all duration-300 hover:border-white/60 hover:bg-white/10"
            data-cursor-text="Explorar"
          >
            Ver Mi Trabajo
          </a>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div ref={scrollIndicatorRef} className="absolute bottom-10 left-1/2 flex -translate-x-1/2 flex-col items-center gap-3">
        <span className="text-[10px] uppercase tracking-[0.3em] text-white/60">Scroll</span>
        <div className="h-12 w-px overflow-hidden bg-white/20">
          <div className="scroll-line h-full w-full bg-[var(--color-accent)]" />
        </div>
      </div>
    </section>
  );
}
