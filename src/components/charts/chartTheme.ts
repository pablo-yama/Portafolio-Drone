'use client';

import { useEffect, type RefObject } from 'react';
import { useMotionValue, useTransform, type MotionValue } from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { SECTION_OFFSETS, useSectionProgress } from '@/hooks/useSectionProgress';
import type { LocationTone } from '@/lib/archiveStats';

/**
 * chartTheme — colours, sizes and the tiny scrub apparatus shared by the
 * ledger instruments (YearBars, CategoryRing, LocationDots).
 *
 * Dataviz rules applied here: thin marks, 2px surface gaps between touching
 * fills, labels in text tokens (never the series colour), a single axis,
 * tabular figures on axes only, one hue for magnitude, emphasis (signal vs
 * dim) for the ring, entity-bound tones for locations (same as ARCHIVE_PINS).
 */

/** Legacy six-step categorical ramp (kept for any multi-hue consumer). */
export const CHART_RAMP = [
  'var(--signal)',
  'rgba(232, 230, 225, 0.7)',
  'var(--scan)',
  'rgba(232, 230, 225, 0.45)',
  'var(--green)',
  'rgba(232, 230, 225, 0.3)',
] as const;

/** Location tone → CSS token (mirrors ARCHIVE_PINS so the map and dots agree). */
export const TONE_VAR: Record<LocationTone, string> = {
  signal: 'var(--signal)',
  scan: 'var(--scan)',
  green: 'var(--green)',
};

/** Ink tokens for chart text (text tokens only — never the series colour). */
export const INK = {
  fg: 'var(--fg)',
  ink: 'var(--inst-ink)',
  dim: 'var(--dim)',
  dim2: 'var(--dim-2)',
  line: 'var(--line)',
} as const;

/** YearBars geometry (SVG user units, viewBox 0 0 width height). */
export const BARS = {
  width: 320,
  height: 176,
  padX: 24,
  bar: 22,
  radius: 4,
  baseline: 140,
  maxH: 100,
  labelGap: 10,
  tickY: 163,
} as const;

/** CategoryRing geometry. */
export const RING = {
  size: 200,
  r: 80,
  stroke: 12,
  /** Surface gap between arcs, px (dataviz: 2px gap, never a stroke). */
  gapPx: 2,
} as const;

/** LocationDots geometry (CSS px). */
export const DOTS = {
  columns: 10,
  size: 10,
  gap: 10,
} as const;

/**
 * Default draw windows (fractions of the figure's `draw` progress). On desktop
 * the three figures sit on one row and share the same scroll position, so the
 * offsets produce a left→right stagger; stacked on mobile each figure draws on
 * its own entry and the offset only trims its window.
 */
export const DRAW_RANGES = {
  bars: [0, 0.78] as [number, number],
  ring: [0.1, 0.9] as [number, number],
  dots: [0.2, 1] as [number, number],
} as const;

export const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);
export const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);

/** Eased 0→1 for the sub-window [start, end] of a 0→1 draw value. */
export const stage = (d: number, start: number, end: number) =>
  easeOutCubic(clamp01((d - start) / (end - start)));

/**
 * useDrawProgress — the figure's own scroll progress over the `draw` offsets
 * (0 at 80% of the viewport, 1 when centred), remapped through `range`.
 * A parent may hand in its own `progress` instead (same remap).
 */
export function useDrawProgress(
  ref: RefObject<HTMLElement | null>,
  range: [number, number] = [0, 1],
  progress?: MotionValue<number>,
): MotionValue<number> {
  const own = useSectionProgress(ref, SECTION_OFFSETS.draw);
  const source = progress ?? own;
  const [r0, r1] = range;
  return useTransform(source, [r0, r1], [0, 1], { clamp: true });
}

/**
 * useLiveGate — 0 on the server, during hydration and under reduced motion
 * (marks stay in their FINAL state); 1 once the client may scrub. A motion
 * value rather than state so nothing is set inside an effect body.
 */
export function useLiveGate(): MotionValue<number> {
  const { reduced, resolved } = useMotionPrefs();
  const live = useMotionValue(0);
  useEffect(() => {
    live.set(resolved && !reduced ? 1 : 0);
  }, [resolved, reduced, live]);
  return live;
}

/** Eased stage of `draw` for the window [start, end], or 1 when not live. */
export function useStage(
  draw: MotionValue<number>,
  live: MotionValue<number>,
  start: number,
  end: number,
): MotionValue<number> {
  return useTransform([draw, live], ([d, l]: number[]) => (l ? stage(d, start, end) : 1));
}
