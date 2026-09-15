'use client';

import { useRef, type ReactNode } from 'react';
import { m, useScroll, useTransform, type Variants } from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { TickMark } from '@/components/ui/TickMark';

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

/* Container: staggers the cells once the row is 35 % visible. */
const LIST_VARIANTS: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06, delayChildren: 0.05 } },
};

/* Cell: lift + fade. `custom` = reduced motion → opacity only (y snaps in 0 s). */
const CELL_VARIANTS: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: (reduced: boolean) => ({
    opacity: 1,
    y: 0,
    transition: reduced
      ? { opacity: { duration: 0.4 }, y: { duration: 0 } }
      : { duration: 0.8, ease: EASE_EXPO },
  }),
};

export interface TldrRevealProps {
  children: ReactNode;
}

/**
 * TldrReveal — client wrapper for the TL;DR instrument row. Renders the `ul`
 * as a stagger container (cells y 16 → 0 / opacity, 0.06 s apart, once) plus a
 * 1px var(--signal) rule across the top of the slate whose scaleX is SCRUBBED
 * by the row's own scroll position — the "cut" from the hero letterbox.
 * The server component (TldrChecklist) owns every text node; this only wraps.
 */
export function TldrReveal({ children }: TldrRevealProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const { scrollYProgress } = useScroll({
    target: listRef,
    offset: ['start 100%', 'start 42%'],
  });
  const scaleX = useTransform(scrollYProgress, [0, 1], [0, 1]);

  return (
    <>
      <m.span className="tldr-v3-rule" aria-hidden="true" style={{ scaleX }} />
      <m.ul
        ref={listRef}
        variants={LIST_VARIANTS}
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, amount: 0.35 }}
      >
        {children}
      </m.ul>
    </>
  );
}

export interface TldrCellProps {
  /** Folio number printed by CSS (`data-num` → `::before`), e.g. "01". */
  num: string;
  /** Index in the row — staggers the TickMark draw. */
  index: number;
  children: ReactNode;
}

/**
 * TldrCell — one instrument cell. The `li` text nodes are passed through
 * untouched (SEO text byte-identical); the number lives in `data-num` so no
 * text node is added, and the tick is an aria-hidden SVG.
 */
export function TldrCell({ num, index, children }: TldrCellProps) {
  const { reduced } = useMotionPrefs();
  return (
    <m.li className="tldr-v3-cell" data-num={num} variants={CELL_VARIANTS} custom={reduced}>
      <TickMark index={index} />
      <span className="tldr-v3-txt">{children}</span>
    </m.li>
  );
}
