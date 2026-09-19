'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

/**
 * DotGrid — a faint dot matrix revealed through a radial mask. With `follow`
 * (fine pointer, no reduced motion) the mask centre tracks the pointer over
 * the PARENT element by writing --mx/--my (rAF-throttled, no React state).
 * The parent must be `position: relative` (usually `overflow: hidden` too).
 */
export interface DotGridProps {
  follow?: boolean;
  className?: string;
  /** Grid pitch, px. */
  size?: number;
  /** Mask radius, px. */
  radius?: number;
  opacity?: number;
  /** Static mask centre (any CSS length/percentage pair). */
  center?: [string, string];
}

export function DotGrid({
  follow = false,
  className,
  size = 26,
  radius = 320,
  opacity = 1,
  center = ['50%', '40%'],
}: DotGridProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { finePointer, reduced } = useMotionPrefs();
  const active = follow && finePointer && !reduced;
  const [cx, cy] = center;

  useEffect(() => {
    if (!active) return;
    const el = ref.current;
    const parent = el?.parentElement;
    if (!el || !parent) return;

    let raf = 0;
    let lx = 0;
    let ly = 0;
    const apply = () => {
      raf = 0;
      el.style.setProperty('--mx', `${lx}px`);
      el.style.setProperty('--my', `${ly}px`);
    };
    const onMove = (e: PointerEvent) => {
      const r = el.getBoundingClientRect();
      lx = e.clientX - r.left;
      ly = e.clientY - r.top;
      if (!raf) raf = requestAnimationFrame(apply);
    };
    const reset = () => {
      if (raf) {
        cancelAnimationFrame(raf);
        raf = 0;
      }
      el.style.setProperty('--mx', cx);
      el.style.setProperty('--my', cy);
    };
    parent.addEventListener('pointermove', onMove, { passive: true });
    parent.addEventListener('pointerleave', reset);
    return () => {
      parent.removeEventListener('pointermove', onMove);
      parent.removeEventListener('pointerleave', reset);
      reset();
    };
  }, [active, cx, cy]);

  const style = {
    '--dot-size': `${size}px`,
    '--dot-radius': `${radius}px`,
    '--mx': cx,
    '--my': cy,
    opacity,
  } as CSSProperties;

  return (
    <div
      ref={ref}
      className={['dotgrid', className].filter(Boolean).join(' ')}
      aria-hidden="true"
      data-follow={active ? '1' : undefined}
      style={style}
    />
  );
}
