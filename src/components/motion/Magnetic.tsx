'use client';

import { m, useMotionValue, useSpring } from 'framer-motion';
import { useEffect, useRef, type ReactNode, type RefObject } from 'react';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

/**
 * Magnetic — pulls its single child toward the pointer while the pointer is
 * within `radius` px of the element's box (fine pointers only). One shared,
 * rAF-throttled pointermove listener feeds every instance. The wrapper carries
 * `data-magnetic` so PointerCursor can snap its ring to the element's centre.
 */
export interface MagneticProps {
  children: ReactNode;
  /** Displacement factor (pointer offset × strength). */
  strength?: number;
  /** Activation halo around the element, px. */
  radius?: number;
  className?: string;
  as?: 'div' | 'span';
}

type PointerListener = (x: number, y: number) => void;

const listeners = new Set<PointerListener>();
let bound = false;
let raf = 0;
let px = 0;
let py = 0;

const flush = () => {
  raf = 0;
  listeners.forEach((cb) => cb(px, py));
};

const onMove = (e: PointerEvent) => {
  px = e.clientX;
  py = e.clientY;
  if (!raf) raf = requestAnimationFrame(flush);
};

const subscribePointer = (cb: PointerListener): (() => void) => {
  listeners.add(cb);
  if (!bound) {
    window.addEventListener('pointermove', onMove, { passive: true });
    bound = true;
  }
  return () => {
    listeners.delete(cb);
    if (listeners.size === 0 && bound) {
      window.removeEventListener('pointermove', onMove);
      bound = false;
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
    }
  };
};

const SPRING = { stiffness: 260, damping: 20, mass: 0.4 };

export function Magnetic({
  children,
  strength = 0.35,
  radius = 80,
  className,
  as = 'div',
}: MagneticProps) {
  const ref = useRef<HTMLElement | null>(null);
  const { finePointer, reduced } = useMotionPrefs();
  const enabled = finePointer && !reduced;

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, SPRING);
  const y = useSpring(my, SPRING);

  useEffect(() => {
    if (!enabled) {
      mx.set(0);
      my.set(0);
      return;
    }
    const el = ref.current;
    if (!el) return;

    let inside = false;
    const release = () => {
      if (!inside) return;
      inside = false;
      mx.set(0);
      my.set(0);
    };
    const unsubscribe = subscribePointer((cx, cy) => {
      const r = el.getBoundingClientRect();
      const within =
        cx >= r.left - radius && cx <= r.right + radius && cy >= r.top - radius && cy <= r.bottom + radius;
      if (within) {
        inside = true;
        mx.set((cx - (r.left + r.width / 2)) * strength);
        my.set((cy - (r.top + r.height / 2)) * strength);
      } else {
        release();
      }
    });
    document.addEventListener('pointerleave', release);
    window.addEventListener('blur', release);

    return () => {
      unsubscribe();
      document.removeEventListener('pointerleave', release);
      window.removeEventListener('blur', release);
      mx.set(0);
      my.set(0);
    };
  }, [enabled, strength, radius, mx, my]);

  const cls = ['magnetic', className].filter(Boolean).join(' ');

  if (as === 'span') {
    return (
      <m.span
        ref={ref as RefObject<HTMLSpanElement | null>}
        className={cls}
        data-magnetic=""
        data-magnetic-radius={radius}
        style={{ x, y }}
      >
        {children}
      </m.span>
    );
  }
  return (
    <m.div
      ref={ref as RefObject<HTMLDivElement | null>}
      className={cls}
      data-magnetic=""
      data-magnetic-radius={radius}
      style={{ x, y }}
    >
      {children}
    </m.div>
  );
}
