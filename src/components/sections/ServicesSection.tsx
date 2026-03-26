'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SERVICES } from '@/lib/constants';
import { media } from '@/lib/media';

gsap.registerPlugin(ScrollTrigger);

const SERVICE_IMAGES: string[] = [
  media.images.arcos,
  media.images.padel,
  media.images.paneles,
];

export function ServicesSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !trackRef.current) return;

    const ctx = gsap.context(() => {
      const panels = gsap.utils.toArray<HTMLElement>('.service-panel');
      if (panels.length === 0) return;

      // Pin the entire section (heading + panels) so heading stays visible
      gsap.to(panels, {
        xPercent: -100 * (panels.length - 1),
        ease: 'none',
        scrollTrigger: {
          trigger: sectionRef.current,
          pin: true,
          scrub: 1,
          snap: 1 / (panels.length - 1),
          // Scroll distance = one viewport width per extra panel
          end: () => '+=' + window.innerWidth * (panels.length - 1),
          pinSpacing: true,
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="services" className="relative flex flex-col overflow-hidden" style={{ height: '100vh' }}>

      {/* Sticky heading — stays at top while panels scroll */}
      <div className="container-custom pt-[var(--section-padding)] pb-10 shrink-0">
        <p className="mb-4 text-xs uppercase tracking-[0.3em] text-[var(--color-accent)]">Servicios</p>
        <h2 className="text-[var(--text-h1)] font-bold uppercase leading-none" style={{ fontFamily: 'var(--font-clash)' }}>
          Lo que puedo<br />hacer por ti
        </h2>
      </div>

      {/* Horizontal track — fills remaining vertical space */}
      <div className="relative flex-1 overflow-hidden">
        <div
          ref={trackRef}
          className="flex h-full"
          style={{ width: `${SERVICES.length * 100}vw` }}
        >
          {SERVICES.map((service, i) => (
            <div key={service.slug} className="service-panel relative flex h-full w-screen shrink-0 items-center">
              <div className="container-custom flex h-full items-center">
                <div className="grid h-full w-full grid-cols-1 gap-10 py-8 lg:grid-cols-2 lg:py-0">

                  <div className="relative overflow-hidden rounded-lg">
                    {service.hasVideo ? (
                      <video
                        className="absolute inset-0 h-full w-full object-cover"
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="none"
                      >
                        <source src={media.videos.reforma} />
                      </video>
                    ) : (
                      <Image
                        src={SERVICE_IMAGES[i]}
                        alt={service.title}
                        fill
                        loading="lazy"
                        quality={70}
                        className="object-cover"
                        sizes="(max-width: 1024px) 100vw, 50vw"
                      />
                    )}
                  </div>

                  <div className="flex flex-col justify-center gap-6">
                    <span className="font-mono text-xs text-[var(--color-accent)]">{String(i + 1).padStart(2, '0')}</span>
                    <h3 className="text-[var(--text-h2)] font-bold uppercase leading-tight" style={{ fontFamily: 'var(--font-clash)' }}>
                      {service.title}
                    </h3>
                    <p className="max-w-md text-[var(--text-body)] leading-relaxed text-[var(--color-text-muted)]">
                      {service.description}
                    </p>
                    <a
                      href="#contact"
                      className="w-fit rounded-full border border-[var(--glass-border)] px-7 py-3.5 text-sm uppercase tracking-wider transition-all duration-300 hover:border-[var(--color-accent)] hover:text-[var(--color-accent)]"
                    >
                      Platiquemos
                    </a>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
