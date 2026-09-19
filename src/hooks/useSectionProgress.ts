'use client';

import { useScroll, useVelocity, type MotionValue } from 'framer-motion';
import type { RefObject } from 'react';

/** framer-motion does not export its ScrollOffset type — derive it from useScroll. */
export type ScrollOffset = NonNullable<NonNullable<Parameters<typeof useScroll>[0]>['offset']>;

/**
 * useSectionProgress — scroll progress of a section (0 → 1) as a raw
 * MotionValue. Deliberately NOT wrapped in useSpring: Lenis already eases the
 * scroll position and a second smoother makes scrubbed video feel laggy.
 * Springs are reserved for pointer-driven values.
 */
export const SECTION_OFFSETS = {
  /** Enters at the bottom edge, leaves at the top edge (default). */
  through: ['start end', 'end start'] as ScrollOffset,
  /** Sticky stage: 0 when the section top hits the viewport top, 1 when its bottom does. */
  pinned: ['start start', 'end start'] as ScrollOffset,
  /** Entrance: 0 as it appears, 1 when centred. */
  enter: ['start end', 'center center'] as ScrollOffset,
  /** Chart draw range: 0 at 80% of the viewport, 1 when centred. */
  draw: ['start 80%', 'center center'] as ScrollOffset,
} as const;

export function useSectionProgress(
  ref: RefObject<HTMLElement | null>,
  offset: ScrollOffset = SECTION_OFFSETS.through,
): MotionValue<number> {
  const { scrollYProgress } = useScroll({ target: ref, offset });
  return scrollYProgress;
}

export interface SectionProgressInfo {
  progress: MotionValue<number>;
  /** d(progress)/dt in progress units per second — drives velocity skews. */
  velocity: MotionValue<number>;
}

export function useSectionProgressInfo(
  ref: RefObject<HTMLElement | null>,
  offset: ScrollOffset = SECTION_OFFSETS.through,
): SectionProgressInfo {
  const progress = useSectionProgress(ref, offset);
  const velocity = useVelocity(progress);
  return { progress, velocity };
}
