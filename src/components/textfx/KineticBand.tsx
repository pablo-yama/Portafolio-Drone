'use client';

import { Fragment, useEffect, useRef, type CSSProperties } from 'react';
import { m, useScroll, useSpring, useTransform, useVelocity } from 'framer-motion';
import { useTextFxPrefs } from './textfxPrefs';

export interface KineticBandProps {
  /** Segments separated by ' · ' — e.g. 'CDMX · 19.4326°N · 99.1332°W · HORA AZUL · MAVIC 3 PRO' */
  text: string;
  /** Travel direction while scrolling down (default 'left'). */
  direction?: 'left' | 'right';
  /** Copies of the text on the track (default 3). Only the first is exposed to assistive tech. */
  repeat?: number;
  /** Horizontal sweep in vw over the band's own scroll bounds (default 30 → ±30vw). */
  travel?: number;
  /** Which segments get the outline stroke (default 'alternate'). */
  outline?: 'alternate' | 'all' | 'none';
  className?: string;
  id?: string;
}

const VELOCITY_IN: [number, number] = [-2500, 2500];
const SKEW_OUT: [number, number] = [6, -6];

const mapSkew = (v: number) => {
  const t = (Math.min(Math.max(v, VELOCITY_IN[0]), VELOCITY_IN[1]) - VELOCITY_IN[0]) / (VELOCITY_IN[1] - VELOCITY_IN[0]);
  return SKEW_OUT[0] + (SKEW_OUT[1] - SKEW_OUT[0]) * t;
};

/**
 * KineticBand — oversized serif band, x driven by scroll over its own bounds,
 * skewX from scroll velocity through a spring (fine pointer only). Frozen while
 * off-screen; static under reduced motion.
 */
export function KineticBand({
  text,
  direction = 'left',
  repeat = 3,
  travel = 30,
  outline = 'alternate',
  className,
  id,
}: KineticBandProps) {
  const ref = useRef<HTMLDivElement>(null);
  const { reduced, finePointer } = useTextFxPrefs();
  const gateRef = useRef({ visible: false, skew: false });

  useEffect(() => {
    gateRef.current.skew = finePointer && !reduced;
  }, [finePointer, reduced]);

  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const { scrollY } = useScroll();
  const sign = direction === 'left' ? -1 : 1;
  const x = useTransform(scrollYProgress, [0, 1], [`${-sign * travel}vw`, `${sign * travel}vw`]);

  const velocity = useVelocity(scrollY);
  const skewRaw = useTransform(velocity, (v) => {
    const g = gateRef.current;
    return g.visible && g.skew ? mapSkew(v) : 0;
  });
  const skewX = useSpring(skewRaw, { stiffness: 220, damping: 32, mass: 0.5 });

  useEffect(() => {
    const el = ref.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        gateRef.current.visible = entries.some((e) => e.isIntersecting);
      },
      { rootMargin: '15% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  const segments = text
    .split(/\s*·\s*/)
    .map((s) => s.trim())
    .filter(Boolean);
  const copies = Math.max(1, Math.floor(repeat));

  const renderCopy = (copyIndex: number) => (
    <span
      key={copyIndex}
      className="tfx-band-copy"
      aria-hidden={copyIndex > 0 ? 'true' : undefined}
    >
      {segments.map((seg, i) => {
        const isOutline = outline === 'all' || (outline === 'alternate' && i % 2 === 1);
        return (
          <Fragment key={i}>
            <span className={isOutline ? 'tfx-band-seg is-outline' : 'tfx-band-seg'}>{seg}</span>
            <span className="tfx-band-dot" aria-hidden="true">
              ·
            </span>
          </Fragment>
        );
      })}
    </span>
  );

  const cls = ['tfx-band', direction === 'right' ? 'is-rtl' : null, className]
    .filter(Boolean)
    .join(' ');

  const bandStyle = { '--tfx-travel': travel } as CSSProperties;

  return (
    <div ref={ref} id={id} className={cls} style={bandStyle}>
      <m.div className="tfx-band-track" style={reduced ? undefined : { x, skewX }}>
        {Array.from({ length: copies }, (_, i) => renderCopy(i))}
      </m.div>
    </div>
  );
}
