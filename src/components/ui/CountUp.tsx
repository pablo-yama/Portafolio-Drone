'use client';

import { useEffect, useRef } from 'react';

interface CountUpProps {
  target: number;
  className?: string;
  pad?: number;
  duration?: number;
}

/**
 * CountUp — animates from 0 → target when scrolled into view.
 * Uses IntersectionObserver; writes text directly to avoid React re-renders.
 */
export function CountUp({ target, className = '', pad = 0, duration = 1600 }: CountUpProps) {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const format = (n: number) => {
      const s = n.toLocaleString('es-MX');
      return pad > 0 ? s.padStart(pad, '0') : s;
    };

    const run = () => {
      let start: number | null = null;
      const step = (ts: number) => {
        if (start === null) start = ts;
        const k = Math.min(1, (ts - start) / duration);
        const eased = 1 - Math.pow(1 - k, 3);
        const v = Math.floor(target * eased);
        el.textContent = format(v);
        if (k < 1) requestAnimationFrame(step);
        else el.textContent = format(target);
      };
      requestAnimationFrame(step);
    };

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            run();
            io.unobserve(el);
          }
        });
      },
      { threshold: 0.5 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [target, pad, duration]);

  return (
    <span ref={ref} className={className}>
      {pad > 0 ? '0'.repeat(pad) : '0'}
    </span>
  );
}
