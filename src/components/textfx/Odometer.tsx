'use client';

import { useRef, type CSSProperties } from 'react';
import { m, useScroll, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { useHydrated, useTextFxPrefs } from './textfxPrefs';

export interface OdometerSpring {
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export interface OdometerProps {
  /** Integer ≥ 0. The server prints it (padded) so crawlers read the real number. */
  value: number;
  /** Minimum digit count, left-padded with zeros (e.g. 2 → "00"). */
  pad?: number;
  /** Scrub source (section progress). Default: own useScroll on the element, offset ['start 92%', 'start 45%']. */
  progress?: MotionValue<number>;
  /** Progress window mapped to 0 → value (easeOutCubic). Default [0, 1]. */
  range?: [number, number];
  /** Settle spring, default stiffness 120 · damping 22 · mass .7 */
  spring?: OdometerSpring;
  className?: string;
  style?: CSSProperties;
  id?: string;
}

const ROWS = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 0] as const;
const ROW_PCT = 100 / ROWS.length;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/**
 * Mechanical odometer digit for a given place (1, 10, 100 …): the units reel
 * rolls continuously; higher reels only roll while every lower reel is on 9.
 */
const digitAt = (v: number, place: number): number => {
  const scaled = v / place;
  if (place === 1) return scaled % 10;
  const digit = Math.floor(scaled) % 10;
  const lower = (v % place) / place;
  const threshold = 1 - 1 / place;
  const roll = lower > threshold ? (lower - threshold) * place : 0;
  return digit + Math.min(roll, 0.999);
};

interface ReelProps {
  current: MotionValue<number>;
  place: number;
}

function Reel({ current, place }: ReelProps) {
  const y = useTransform(current, (v) => `${-digitAt(Math.max(0, v), place) * ROW_PCT}%`);
  return (
    <span className="tfx-od-col">
      <m.span className="tfx-od-stack" style={{ y }}>
        {ROWS.map((d, i) => (
          <span key={i} className="tfx-od-row">
            {d}
          </span>
        ))}
      </m.span>
    </span>
  );
}

/**
 * Odometer — scroll-scrubbed digit reels settled by a spring.
 * Server + hydration render the plain final number; the reels mount after hydration.
 * Inherits font, size and line-height from the parent (.led .n, .hero-foot .v …).
 */
export function Odometer({
  value,
  pad = 0,
  progress,
  range,
  spring,
  className,
  style,
  id,
}: OdometerProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const hydrated = useHydrated();
  const { reduced } = useTextFxPrefs();

  const own = useScroll({ target: ref, offset: ['start 92%', 'start 45%'] });
  const source = progress ?? own.scrollYProgress;
  const r0 = range?.[0] ?? 0;
  const r1 = range?.[1] ?? 1;
  const safeValue = Math.max(0, Math.round(value));

  const target = useTransform(source, [r0, r1], [0, safeValue], { clamp: true, ease: easeOutCubic });
  const current = useSpring(target, {
    stiffness: spring?.stiffness ?? 120,
    damping: spring?.damping ?? 22,
    mass: spring?.mass ?? 0.7,
  });

  const text = String(safeValue).padStart(pad, '0');
  const cls = ['tfx-od', className].filter(Boolean).join(' ');

  if (!hydrated || reduced) {
    return (
      <span ref={ref} id={id} style={style} className={cls}>
        {text}
      </span>
    );
  }

  const places = text.split('').map((_, i) => Math.pow(10, text.length - 1 - i));

  return (
    <span ref={ref} id={id} style={style} className={cls} data-live="1">
      <span className="sr-only">{text}</span>
      <span className="tfx-od-digits" aria-hidden="true">
        {places.map((place, i) => (
          <Reel key={i} current={current} place={place} />
        ))}
      </span>
    </span>
  );
}
