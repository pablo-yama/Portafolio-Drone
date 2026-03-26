'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  onComplete?: () => void;
}

export function Preloader({ onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [isComplete, setIsComplete] = useState(false);

  useEffect(() => {
    if (!containerRef.current || !progressRef.current || !counterRef.current || !logoRef.current)
      return;

    const tl = gsap.timeline({
      onComplete: () => {
        setIsComplete(true);
        onComplete?.();
      },
    });

    tl.from(logoRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power3.out',
    })
      .to(
        counterRef.current,
        {
          textContent: 100,
          duration: 2,
          ease: 'power2.inOut',
          snap: { textContent: 1 },
        },
        0.3
      )
      .to(
        progressRef.current,
        {
          scaleX: 1,
          duration: 2,
          ease: 'power2.inOut',
        },
        0.3
      )
      .to(logoRef.current, {
        opacity: 0,
        y: -20,
        duration: 0.3,
        ease: 'power3.in',
      })
      .to(containerRef.current, {
        yPercent: -100,
        duration: 0.8,
        ease: 'power4.inOut',
      });

    return () => {
      tl.kill();
    };
  }, [onComplete]);

  if (isComplete) return null;

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 z-[var(--z-preloader)] flex flex-col items-center justify-center bg-[var(--color-bg)]"
    >
      <div ref={logoRef} className="flex flex-col items-center gap-8">
        <h1
          className="text-4xl font-bold uppercase tracking-[0.3em]"
          style={{ fontFamily: 'var(--font-clash)' }}
        >
          PABLO<span className="text-[var(--color-accent)]">.</span>
        </h1>
        <p className="text-xs uppercase tracking-[0.4em] text-[var(--color-text-muted)]">
          Drone Pilot & Aerial Photographer
        </p>

        <div className="flex flex-col items-center gap-3">
          <div className="h-px w-48 overflow-hidden bg-white/10">
            <div
              ref={progressRef}
              className="h-full w-full origin-left bg-[var(--color-accent)]"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>
          <span
            ref={counterRef}
            className="font-mono text-xs tracking-widest text-[var(--color-text-muted)]"
          >
            0
          </span>
        </div>
      </div>
    </div>
  );
}
