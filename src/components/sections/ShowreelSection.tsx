'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

const CLIPS = [
  { src: '/videos/bosques.mov', label: 'Bosques' },
  { src: '/videos/reforma.mov', label: 'Reforma' },
  { src: '/videos/cu.mov',      label: 'C.U.' },
];

function ReelCard({ clip }: { clip: typeof CLIPS[number] }) {
  return (
    <div
      className="reel-card relative overflow-hidden rounded-2xl bg-[var(--color-bg-elevated)]"
      style={{ aspectRatio: '9/16' }}
    >
      <video
        className="absolute inset-0 h-full w-full object-cover"
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      >
        <source src={clip.src} />
      </video>

      {/* Bottom gradient + label */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none">
        <span className="text-xs uppercase tracking-[0.2em] drop-shadow-lg">
          {clip.label}
        </span>
      </div>
    </div>
  );
}

export function ShowreelSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!sectionRef.current || !gridRef.current) return;

    const ctx = gsap.context(() => {
      const cards = gridRef.current!.querySelectorAll('.reel-card');
      gsap.from(cards, {
        y: 60,
        opacity: 0,
        duration: 1,
        ease: 'power3.out',
        stagger: 0.12,
        scrollTrigger: {
          trigger: gridRef.current,
          start: 'top 75%',
          toggleActions: 'play none none none',
        },
      });
    }, sectionRef);

    return () => ctx.revert();
  }, []);

  return (
    <section ref={sectionRef} id="showreel" className="relative py-[var(--section-padding)] overflow-hidden">
      <div className="container-custom">

        {/* Header */}
        <div className="mb-[var(--space-lg)]">
          <span className="section-label">Showreel 2025</span>
          <h2
            className="text-[var(--text-h1)] font-bold uppercase leading-none"
            style={{ fontFamily: 'var(--font-clash)' }}
          >
            Hyperlapses<br /><span className="text-gradient">aéreos</span>
          </h2>
          <p className="section-body mt-[var(--space-sm)] max-w-md">
            Hyperlapses aéreos capturados en Ciudad de México.
          </p>
        </div>

        {/* Reels grid — 9:16, side by side, autoplay */}
        <div
          ref={gridRef}
          className="grid grid-cols-3 gap-6 max-w-4xl mx-auto"
        >
          {CLIPS.map((clip) => (
            <ReelCard key={clip.src} clip={clip} />
          ))}
        </div>

      </div>
    </section>
  );
}
