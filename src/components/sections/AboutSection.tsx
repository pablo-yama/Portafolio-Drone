'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ABOUT } from '@/lib/constants';
import { media } from '@/lib/media';
import { FloatingPaths } from '@/components/ui/background-paths';

gsap.registerPlugin(ScrollTrigger);

export function AboutSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const photoRef = useRef<HTMLDivElement>(null);
  const textRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current) return;

    const ctx = gsap.context(() => {
      if (photoRef.current) {
        gsap.from(photoRef.current, {
          clipPath: 'inset(100% 0 0 0)',
          duration: 1.5,
          ease: 'power3.inOut',
          scrollTrigger: { trigger: photoRef.current, start: 'top 75%' },
        });
      }

      if (textRef.current) {
        gsap.from(textRef.current.children, {
          y: 40, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.15,
          scrollTrigger: { trigger: textRef.current, start: 'top 80%' },
        });
      }
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="about" className="relative py-[var(--section-padding)] overflow-hidden">
      <FloatingPaths position={1} />
      <FloatingPaths position={-1} />
      <div className="container-custom">
        <span className="section-label">Sobre Mí</span>

        <div className="grid grid-cols-1 gap-[var(--space-xl)] lg:grid-cols-2">
          <div
            ref={photoRef}
            className="relative mx-auto w-full max-w-xs aspect-[3/4] overflow-hidden rounded-lg"
            style={{ clipPath: 'inset(0% 0 0 0)' }}
          >
            <Image
              src={media.images.pablo}
              alt="Pablo — Piloto de Drones"
              fill
              loading="lazy"
              quality={80}
              className="object-cover object-top"
              sizes="(max-width: 1024px) 100vw, 50vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
            <div className="absolute inset-0 flex items-end p-8">
              <div>
                <h3 className="text-3xl font-bold uppercase drop-shadow-lg lg:text-4xl" style={{ fontFamily: 'var(--font-clash)' }}>
                  {ABOUT.name}
                </h3>
                <p className="mt-1 text-sm text-white/80 drop-shadow-md">{ABOUT.role}</p>
              </div>
            </div>
          </div>

          <div className="flex flex-col justify-center">
            <div ref={textRef}>
              <h2 className="mb-[var(--space-md)] text-[var(--text-h2)] font-bold uppercase leading-tight" style={{ fontFamily: 'var(--font-clash)' }}>
                El cielo es mi<br /><span className="text-gradient">estudio fotográfico</span>
              </h2>
              {ABOUT.bio.map((paragraph, i) => (
                <p key={i} className="section-body mb-8 text-[var(--text-body)]">{paragraph}</p>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
