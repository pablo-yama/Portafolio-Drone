'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

interface PreloaderProps {
  progress: number;
  isComplete: boolean;
  onComplete?: () => void;
}

const MIN_DISPLAY_MS = 1500;

export function Preloader({ progress, isComplete, onComplete }: PreloaderProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const logoRef = useRef<HTMLDivElement>(null);
  const [isDone, setIsDone] = useState(false);
  const startTime = useRef(Date.now());
  const hasExited = useRef(false);

  /* ── Logo entrance ── */
  useEffect(() => {
    if (!logoRef.current) return;
    gsap.from(logoRef.current, {
      opacity: 0,
      y: 20,
      duration: 0.6,
      ease: 'power3.out',
    });
  }, []);

  /* ── Animate progress bar + counter smoothly ── */
  useEffect(() => {
    if (!progressBarRef.current || !counterRef.current) return;

    gsap.to(progressBarRef.current, {
      scaleX: progress,
      duration: 0.6,
      ease: 'power2.out',
      overwrite: true,
    });

    gsap.to(counterRef.current, {
      textContent: Math.round(progress * 100),
      duration: 0.6,
      ease: 'power2.out',
      snap: { textContent: 1 },
      overwrite: true,
    });
  }, [progress]);

  /* ── Exit animation when complete ── */
  useEffect(() => {
    if (!isComplete || hasExited.current) return;
    if (!containerRef.current || !logoRef.current || !progressBarRef.current || !counterRef.current) return;

    hasExited.current = true;

    const elapsed = Date.now() - startTime.current;
    const delay = Math.max(0, MIN_DISPLAY_MS - elapsed) / 1000;

    const tl = gsap.timeline({
      delay,
      onComplete: () => {
        setIsDone(true);
        onComplete?.();
      },
    });

    tl.to(progressBarRef.current, { scaleX: 1, duration: 0.3, ease: 'power2.out' }, 0)
      .to(counterRef.current, { textContent: 100, duration: 0.3, snap: { textContent: 1 } }, 0)
      .to({}, { duration: 0.4 })
      .to(logoRef.current, { opacity: 0, y: -30, duration: 0.4, ease: 'power3.in' })
      .to(containerRef.current, { yPercent: -100, duration: 0.8, ease: 'power4.inOut' });
  }, [isComplete, onComplete]);

  if (isDone) return null;

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
          Drone Pilot &amp; Aerial Photographer
        </p>

        <div className="flex flex-col items-center gap-3">
          <div className="h-px w-48 overflow-hidden bg-white/10">
            <div
              ref={progressBarRef}
              className="h-full w-full origin-left bg-[var(--color-accent)]"
              style={{ transform: 'scaleX(0)' }}
            />
          </div>
          <div className="flex items-baseline gap-1">
            <span
              ref={counterRef}
              className="font-mono text-xs tracking-widest text-[var(--color-text-muted)]"
            >
              0
            </span>
            <span className="font-mono text-xs tracking-widest text-[var(--color-text-muted)]">%</span>
          </div>
        </div>
      </div>
    </div>
  );
}
