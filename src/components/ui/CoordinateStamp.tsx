'use client';

import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';

/**
 * CoordinateStamp — monospace metadata strips that sit in the corners of the hero.
 * Shows CDMX GPS coordinates, a live-updating UTC clock, and a static altitude —
 * Terminal-industrial atmosphere text.
 */
export function CoordinateStamp() {
  const rootRef = useRef<HTMLDivElement>(null);
  const [clock, setClock] = useState<string>('--:--:--');

  /* Live UTC clock so the stamp feels alive */
  useEffect(() => {
    const tick = () => {
      const now = new Date();
      const hh = String(now.getUTCHours()).padStart(2, '0');
      const mm = String(now.getUTCMinutes()).padStart(2, '0');
      const ss = String(now.getUTCSeconds()).padStart(2, '0');
      setClock(`${hh}:${mm}:${ss} UTC`);
    };
    tick();
    const id = window.setInterval(tick, 1000);
    return () => window.clearInterval(id);
  }, []);

  /* Fade the whole thing in after hero text */
  useEffect(() => {
    if (!rootRef.current) return;
    const ctx = gsap.context(() => {
      gsap.from(rootRef.current!.querySelectorAll('[data-stamp]'), {
        opacity: 0,
        y: 10,
        duration: 0.6,
        stagger: 0.1,
        delay: 1.3,
        ease: 'power2.out',
      });
    }, rootRef);
    return () => ctx.revert();
  }, []);

  return (
    <div
      ref={rootRef}
      aria-hidden="true"
      className="pointer-events-none absolute inset-0 z-20 font-mono"
      style={{ fontFamily: 'var(--font-mono)' }}
    >
      {/* Top-left — location */}
      <div
        data-stamp
        className="absolute left-[var(--container-padding)] top-28 hidden text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-muted)] lg:block"
      >
        <div className="flex items-center gap-2">
          <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-[var(--color-accent)]" />
          <span>CDMX · MX</span>
        </div>
        <div className="mt-1 text-[9px] opacity-70">19.4326° N — 99.1332° W</div>
      </div>

      {/* Top-right — clock */}
      <div
        data-stamp
        className="absolute right-[var(--container-padding)] top-28 hidden text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-muted)] lg:block"
      >
        <div className="text-right">{clock}</div>
        <div className="mt-1 text-right text-[9px] opacity-70">T+00:00:00</div>
      </div>

      {/* Bottom-left — altitude / status */}
      <div
        data-stamp
        className="absolute bottom-10 left-[var(--container-padding)] hidden text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-muted)] lg:block"
      >
        <div className="flex items-center gap-2">
          <span>ALT</span>
          <span className="text-[var(--color-accent)]">120 M AGL</span>
        </div>
        <div className="mt-1 text-[9px] opacity-70">VIS: 8 KM · CLR</div>
      </div>

      {/* Bottom-right — label */}
      <div
        data-stamp
        className="absolute bottom-10 right-[var(--container-padding)] hidden text-[10px] uppercase tracking-[0.25em] text-[var(--color-text-muted)] lg:block"
      >
        <div className="text-right">REEL · 4K · 30FPS</div>
        <div className="mt-1 text-right text-[9px] opacity-70">REC ●</div>
      </div>
    </div>
  );
}
