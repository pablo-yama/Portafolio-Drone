'use client';

import { m } from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

export interface TickMarkProps {
  /** Position in a list — staggers the check draw by 0.1 s per index. */
  index?: number;
  /** Rendered box size in px (viewBox is 14 × 14). Default 14. */
  size?: number;
  className?: string;
}

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

/**
 * TickMark — the checklist box of the TL;DR slate: a 1px var(--line) square
 * and a var(--signal) check whose path draws (pathLength 0 → 1) once it scrolls
 * into view. Decorative (aria-hidden); the list text carries the meaning.
 * Reduced motion: the check is drawn instantly (opacity only, 0 s path tween).
 */
export function TickMark({ index = 0, size = 14, className }: TickMarkProps) {
  const { reduced } = useMotionPrefs();

  return (
    <svg
      className={['tick-mark', className].filter(Boolean).join(' ')}
      width={size}
      height={size}
      viewBox="0 0 14 14"
      aria-hidden="true"
      focusable="false"
    >
      <rect className="tick-box" x="0.5" y="0.5" width="13" height="13" />
      <m.path
        className="tick-path"
        d="M3 7.3 L6 10.2 L11.2 4.1"
        initial={{ pathLength: 0, opacity: 0 }}
        whileInView={{ pathLength: 1, opacity: 1 }}
        viewport={{ once: true, amount: 0.8 }}
        transition={
          reduced
            ? { pathLength: { duration: 0 }, opacity: { duration: 0.3 } }
            : { duration: 0.45, ease: EASE_EXPO, delay: 0.28 + index * 0.1 }
        }
      />
    </svg>
  );
}
