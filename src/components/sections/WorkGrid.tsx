'use client';

import { useEffect, useRef } from 'react';
import Image, { type StaticImageData } from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { PROJECTS } from '@/lib/constants';
import { EASE, DURATION } from '@/lib/constants';

import imgImayina from '@/img/imayina.jpg';
import imgDJI0633 from '@/img/DJI_0633.jpg';

gsap.registerPlugin(ScrollTrigger);

const IMAGE_MAP: Record<string, StaticImageData> = {
  'imayina.jpg': imgImayina,
  'DJI_0633.jpg': imgDJI0633,
};

/**
 * Cinematic editorial grid — asymmetric layout with staggered offsets.
 * 2 hyperlapses (video on hover) + 2 photos, 12-column CSS grid.
 *
 * Layout:
 *   Row 1: [Video 7col 16/10] [Photo 5col 3/4 offset-down]
 *   Row 2: [Photo 5col 4/5]   [Video 7col 16/9 offset-down]
 */
export function WorkGrid() {
  const sectionRef = useRef<HTMLElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  /* ── GSAP scroll-triggered reveals ── */
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

      /* Grid items — staggered clip-path reveals */
      if (gridRef.current) {
        const items = gridRef.current.querySelectorAll<HTMLElement>('.work-item');
        const clipDirections = [
          'inset(100% 0 0 0)',   // item 1: reveal from top
          'inset(0 0 100% 0)',   // item 2: reveal from bottom
          'inset(0 100% 0 0)',   // item 3: reveal from right
          'inset(100% 0 0 0)',   // item 4: reveal from top
        ];

        items.forEach((item, i) => {
          gsap.set(item, { clipPath: clipDirections[i] || 'inset(100% 0 0 0)' });

          gsap.to(item, {
            clipPath: 'inset(0% 0% 0% 0%)',
            duration: DURATION.cinematic,
            ease: EASE.cinematic,
            scrollTrigger: { trigger: item, start: 'top 90%' },
            delay: i * 0.15,
          });

          /* Parallax per item */
          const speeds = [-0.08, -0.12, -0.1, -0.06];
          gsap.to(item, {
            y: () => window.innerHeight * (speeds[i] ?? -0.08),
            ease: 'none',
            scrollTrigger: {
              trigger: item,
              start: 'top bottom',
              end: 'bottom top',
              scrub: true,
            },
          });
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section
      ref={sectionRef}
      id="work"
      className="relative py-[var(--section-padding)] overflow-hidden"
    >
      {/* Background watermark */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden opacity-[0.03] pointer-events-none">
        <p
          className="whitespace-nowrap text-[15vw] font-bold uppercase"
          style={{ fontFamily: 'var(--font-clash)' }}
        >
          PORTAFOLIO PORTAFOLIO PORTAFOLIO
        </p>
      </div>

      <div className="container-custom">
        {/* Section heading */}
        <div ref={headingRef} className="mb-[var(--space-xl)]">
          <p className="section-label">Mi Trabajo</p>
          <h2
            className="text-[var(--text-h2)] font-bold uppercase leading-[1.1]"
            style={{ fontFamily: 'var(--font-clash)' }}
          >
            Proyectos Seleccionados
          </h2>
        </div>

        {/* Editorial grid */}
        <div
          ref={gridRef}
          className="grid grid-cols-1 gap-5 md:grid-cols-12 md:gap-6"
        >
          {PROJECTS.map((project, index) => (
            <GridItem key={project.slug} project={project} index={index} />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ── Individual grid item ── */

interface GridItemProps {
  project: (typeof PROJECTS)[number];
  index: number;
}

const POSITION_CLASSES: Record<string, string> = {
  hero: 'md:col-span-7 aspect-[16/10]',
  'portrait-right': 'md:col-span-5 aspect-[3/4] md:mt-16',
  'portrait-left': 'md:col-span-5 aspect-[4/5] md:-mt-8',
  wide: 'md:col-span-7 aspect-[16/9] md:mt-10',
};

function GridItem({ project, index }: GridItemProps) {
  const itemRef = useRef<HTMLDivElement>(null);
  const imgSrc = IMAGE_MAP[project.image];
  const isVideo = project.type === 'video';

  return (
    <div
      ref={itemRef}
      className={`work-item group relative cursor-pointer overflow-hidden rounded-sm ${
        POSITION_CLASSES[project.position] ?? ''
      }`}
      data-cursor-text={isVideo ? 'Ver proyecto' : 'Ver'}
    >
      {/* Video items: autoplay loop, no poster image */}
      {isVideo && 'video' in project ? (
        <div className="absolute inset-0 will-change-transform transition-transform duration-700 ease-out group-hover:scale-105">
          <video
            className="absolute inset-0 h-full w-full object-cover"
            src={project.video}
            autoPlay
            muted
            loop
            playsInline
            preload="auto"
          />
        </div>
      ) : (
        /* Photo items: static image */
        <div className="absolute inset-0 will-change-transform transition-transform duration-700 ease-out group-hover:scale-105">
          {imgSrc && (
            <Image
              src={imgSrc}
              alt={project.title}
              fill
              loading={index === 0 ? undefined : 'lazy'}
              priority={index === 0}
              quality={75}
              placeholder="blur"
              className="object-cover"
              sizes="(max-width: 768px) 100vw, 42vw"
            />
          )}
        </div>
      )}

      {/* Type badge */}
      <div className="absolute top-4 right-4 z-10">
        <span className="rounded-full border border-white/20 bg-black/50 px-3 py-1 text-[10px] uppercase tracking-wider backdrop-blur-sm">
          {isVideo ? 'Hyperlapse' : 'Foto'}
        </span>
      </div>

      {/* Gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end p-6 lg:p-8">
        <span className="mb-1 text-[10px] font-semibold uppercase tracking-[0.2em] text-[var(--color-accent)] drop-shadow-md">
          {project.category}
        </span>
        <h3
          className="text-xl font-bold uppercase drop-shadow-lg lg:text-2xl"
          style={{ fontFamily: 'var(--font-clash)' }}
        >
          {project.title}
        </h3>
        <p className="mt-1 text-xs text-white/70 drop-shadow-md">
          {project.location}
        </p>
      </div>

      {/* Hover border accent */}
      <div className="absolute inset-0 rounded-sm border border-transparent transition-colors duration-500 group-hover:border-[var(--color-accent)]/30" />
    </div>
  );
}
