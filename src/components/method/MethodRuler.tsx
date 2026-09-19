'use client';

import type { RefObject } from 'react';
import { Scramble } from '@/components/textfx';

/**
 * MethodRuler — the checklist ruler that runs across the top of the pinned
 * flight: 5 major / 40 minor ticks (SSR geometry in %), the phase numerals,
 * a 1px signal fill (scaleX, origin left) and a caret carrying the current
 * phase name (Scramble on every phase change). The section owns the motion:
 * it writes `scaleX` on `fillRef`, `x` (px) on `caretRef` and `data-flip` on
 * the caret once it nears the right edge. Decorative → aria-hidden.
 */
export const MAJOR_TICKS = 5;
export const MINOR_TICKS = 40;

export interface MethodRulerProps {
  /** Current phase name printed on the caret (e.g. "Briefing"). */
  phase: string;
  /** Zero-based phase index — the numeral at this index lights up. */
  idx: number;
  rootRef?: RefObject<HTMLDivElement | null>;
  fillRef?: RefObject<HTMLSpanElement | null>;
  caretRef?: RefObject<HTMLDivElement | null>;
  className?: string;
}

const TICKS = Array.from({ length: MINOR_TICKS + 1 }, (_, i) => {
  const major = i % (MINOR_TICKS / (MAJOR_TICKS - 1)) === 0;
  return { i, x: `${(i / MINOR_TICKS) * 100}%`, major };
});

const NUMS = Array.from({ length: MAJOR_TICKS }, (_, i) => ({
  i,
  label: String(i + 1).padStart(2, '0'),
  left: `${(i / (MAJOR_TICKS - 1)) * 100}%`,
}));

export function MethodRuler({ phase, idx, rootRef, fillRef, caretRef, className }: MethodRulerProps) {
  return (
    <div
      className={['mf-ruler', className].filter(Boolean).join(' ')}
      ref={rootRef}
      aria-hidden="true"
    >
      <div className="mf-ruler-nums">
        {NUMS.map((n) => (
          <span
            key={n.i}
            className="mf-ruler-num tnum"
            style={{ left: n.left }}
            data-on={n.i <= idx ? '1' : '0'}
            data-last={n.i === MAJOR_TICKS - 1 ? '1' : undefined}
          >
            {n.label}
          </span>
        ))}
      </div>

      <svg className="mf-ruler-svg" width="100%" height="22" focusable="false">
        {TICKS.map((t) => (
          <line
            key={t.i}
            className={t.major ? 'mf-tick mf-tick--major' : 'mf-tick'}
            x1={t.x}
            x2={t.x}
            y1={t.major ? 0 : 14}
            y2={22}
          />
        ))}
      </svg>

      <span className="mf-ruler-base" />
      <span className="mf-ruler-fill" ref={fillRef} />

      <div className="mf-caret" ref={caretRef} data-flip="0">
        <span className="mf-caret-mark" />
        <span className="mf-caret-label">
          <Scramble text={phase} enter={false} duration={0.55} speed={0.6} />
        </span>
      </div>
    </div>
  );
}
