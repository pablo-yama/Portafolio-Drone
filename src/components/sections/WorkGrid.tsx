'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { EASE, DURATION } from '@/lib/constants';
import { media } from '@/lib/media';

gsap.registerPlugin(ScrollTrigger);

export function WorkGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      /* Heading */
      if (headingRef.current) {
        gsap.from(headingRef.current.children, {
          y: 60,
          opacity: 0,
          duration: DURATION.slow,
          ease: EASE.smooth,
          stagger: 0.12,
          scrollTrigger: { trigger: headingRef.current, start: 'top 80%' },
        });
      }

      /* Work items — staggered clip-path reveals */
      const items = gsap.utils.toArray<HTMLElement>('.work-item');
      const clipDirections = [
        'inset(100% 0 0 0)',
        'inset(0 100% 0 0)',
        'inset(0 0 100% 0)',
      ];

      items.forEach((item, i) => {
        gsap.set(item, { clipPath: clipDirections[i] || 'inset(100% 0 0 0)' });

        gsap.to(item, {
          clipPath: 'inset(0% 0% 0% 0%)',
          duration: DURATION.cinematic,
          ease: EASE.cinematic,
          scrollTrigger: { trigger: item, start: 'top 85%' },
          delay: i * 0.15,
        });

        gsap.to(item, {
          y: () => window.innerHeight * -0.025,
          ease: 'none',
          scrollTrigger: {
            trigger: item,
            start: 'top bottom',
            end: 'bottom top',
            scrub: true,
          },
        });
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative min-h-screen w-full flex flex-col justify-center py-[var(--section-padding)] overflow-hidden"
    >
      {/* Background watermark — centered */}
      <div className="absolute inset-0 flex items-center justify-center overflow-hidden opacity-[0.03] pointer-events-none">
        <p
          className="whitespace-nowrap text-[18vw] font-bold uppercase"
          style={{ fontFamily: 'var(--font-clash)' }}
        >
          PORTAFOLIO
        </p>
      </div>

      <div className="container-custom relative z-10">
        {/* Section heading */}
        <div ref={headingRef} className="mb-16 lg:mb-24">
          <h2
            className="text-[var(--text-h1)] font-bold uppercase leading-none"
            style={{ fontFamily: 'var(--font-clash)' }}
          >
            <span className="text-gradient">Proyectos</span>
          </h2>
        </div>

        {/* Hero video — YouTube embed, full width */}
        <div
          className="work-item group relative mt-8 overflow-hidden rounded-lg aspect-[16/9] lg:mt-16"
          data-cursor-text="Ver proyecto"
        >
          <iframe
            className="absolute inset-0 h-full w-full"
            src="https://www.youtube.com/embed/PauvAqk388s?autoplay=1&mute=1&loop=1&playlist=PauvAqk388s&controls=0&showinfo=0&rel=0&modestbranding=1&playsinline=1"
            title="Hyperlapse aéreo"
            allow="autoplay; encrypted-media"
            allowFullScreen
            loading="lazy"
          />
          <div className="absolute inset-0 rounded-lg border border-transparent transition-all duration-500 group-hover:border-white/20 pointer-events-none" />
        </div>

        {/* Two photos side by side */}
        <div className="mt-8 grid grid-cols-1 gap-8 md:grid-cols-2">
          {/* Photo 1 */}
          <div
            className="work-item group relative overflow-hidden rounded-lg aspect-[4/3]"
            data-cursor-text="Ver"
          >
            <div className="absolute inset-0 will-change-transform transition-transform duration-700 ease-out group-hover:scale-105">
              <Image
                src={media.images.imayina}
                alt="Imayina — Arquitectura aérea"
                fill
                loading="lazy"
                quality={75}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <span className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
                Arquitectura
              </span>
              <h3
                className="text-xl font-bold uppercase lg:text-2xl"
                style={{ fontFamily: 'var(--font-clash)' }}
              >
                Imayina
              </h3>
              <p className="mt-1 text-sm text-white/60">CDMX</p>
            </div>
            <div className="absolute inset-0 rounded-lg border border-transparent transition-all duration-500 group-hover:border-white/20" />
          </div>

          {/* Photo 2 */}
          <div
            className="work-item group relative overflow-hidden rounded-lg aspect-[4/3]"
            data-cursor-text="Ver"
          >
            <div className="absolute inset-0 will-change-transform transition-transform duration-700 ease-out group-hover:scale-105">
              <Image
                src={media.images.dji0633}
                alt="Vista aérea del estadio en Acapulco"
                fill
                loading="lazy"
                quality={75}
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
              />
            </div>
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute inset-0 flex flex-col justify-end p-8">
              <span className="mb-2 text-[10px] font-semibold uppercase tracking-[0.3em] text-[var(--color-accent)]">
                Deportes
              </span>
              <h3
                className="text-xl font-bold uppercase lg:text-2xl"
                style={{ fontFamily: 'var(--font-clash)' }}
              >
                Estadio
              </h3>
              <p className="mt-1 text-sm text-white/60">Acapulco</p>
            </div>
            <div className="absolute inset-0 rounded-lg border border-transparent transition-all duration-500 group-hover:border-white/20" />
          </div>
        </div>
      </div>
    </section>
  );
}
