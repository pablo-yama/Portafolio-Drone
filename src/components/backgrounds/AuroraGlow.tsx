'use client';

import { useEffect, useRef, type CSSProperties } from 'react';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

/**
 * AuroraGlow — two soft radial blobs in the signal hue drifting on transform
 * keyframes (18s / 23s), paused off-screen via IntersectionObserver. No
 * filter, no backdrop-filter — the softness comes from the gradient itself.
 * Mounted only for fine pointers without reduced motion (returns null
 * otherwise, and on the server). Parent must be `position: relative`.
 */
export interface AuroraGlowProps {
  className?: string;
  /** Peak opacity of each blob (0–1). */
  intensity?: number;
}

export function AuroraGlow({ className, intensity = 0.1 }: AuroraGlowProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { finePointer, reduced, resolved } = useMotionPrefs();
  const enabled = resolved && finePointer && !reduced;

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        const hit = entries[entries.length - 1];
        el.dataset.active = hit && hit.isIntersecting ? '1' : '0';
      },
      { rootMargin: '10% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      ref={ref}
      className={['aurora', className].filter(Boolean).join(' ')}
      aria-hidden="true"
      data-active="0"
      style={{ '--aurora-a': intensity } as CSSProperties}
    >
      <span className="aurora-blob aurora-blob--a" />
      <span className="aurora-blob aurora-blob--b" />
    </div>
  );
}
