'use client';

import { m, useTransform } from 'framer-motion';
import { useRef, type CSSProperties } from 'react';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { useSectionProgress } from '@/hooks/useSectionProgress';

/**
 * SectionWipe — a curtain band placed BETWEEN two sections. Two panels in
 * `color` cover the band; as it crosses the viewport centre they scale
 * (scaleY, origin top / bottom) to 0, opening from the middle over a 1px
 * signal hairline and an optional mono stamp. Transform/opacity only.
 * Reduced motion: panels hidden, line pre-drawn (`data-static`).
 */
export interface SectionWipeProps {
  /** Panel colour (any CSS colour; default var(--panel-2)). */
  color?: string;
  /** Band height (default 18vh). */
  height?: string;
  /** Mono stamp revealed between the halves, e.g. '§ 01 → 02'. */
  label?: string;
  className?: string;
}

export function SectionWipe({
  color = 'var(--panel-2)',
  height = '18vh',
  label,
  className,
}: SectionWipeProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced } = useMotionPrefs();
  const p = useSectionProgress(ref);
  const panel = useTransform(p, [0.3, 0.7], [1, 0]);
  const line = useTransform(p, [0.45, 0.75], [0, 1]);
  const labelOpacity = useTransform(p, [0.55, 0.75], [0, 1]);

  const style = { '--wipe-h': height, '--wipe-c': color } as CSSProperties;

  return (
    <div
      ref={ref}
      className={['wipe', className].filter(Boolean).join(' ')}
      aria-hidden="true"
      data-static={reduced ? '1' : undefined}
      style={style}
    >
      <m.div className="wipe-panel wipe-panel--top" style={{ scaleY: panel }} />
      <m.div className="wipe-panel wipe-panel--bottom" style={{ scaleY: panel }} />
      <m.div className="wipe-line" style={{ scaleX: line }} />
      {label ? (
        <m.span className="wipe-label tnum" style={{ opacity: labelOpacity }}>
          {label}
        </m.span>
      ) : null}
    </div>
  );
}
