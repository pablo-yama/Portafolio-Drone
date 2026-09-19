'use client';

import { m, useInView, useTransform, type MotionValue } from 'framer-motion';
import { useCallback, useRef, type ReactNode } from 'react';

/**
 * MaskLines — the line-mask reveal used on every headline and lead paragraph.
 *
 * Two drivers:
 *  - in-view (default): the wrapper is observed once; each line rises from
 *    y:110% with a slight skew and a short opacity fade, staggered.
 *  - progress (`progress` + `range`): each line's y/opacity/skew are scrubbed
 *    from a scroll MotionValue — line i maps [r0 + i·stagger, r1 + i·stagger].
 *
 * Under MotionConfig reducedMotion="user" the transforms are skipped and only
 * the opacity fade remains; premium-base.css also forces `.ml-inner`
 * transform: none for the progress mode.
 */
export type MaskLinesTag = 'h1' | 'h2' | 'h3' | 'h4' | 'p' | 'div' | 'span';

export interface MaskLinesProps {
  /** One entry per masked line. */
  lines: ReactNode[];
  as?: MaskLinesTag;
  className?: string;
  id?: string;
  'aria-label'?: string;
  /** Seconds between lines (in progress mode: progress offset per line). */
  stagger?: number;
  /** Seconds per line. */
  duration?: number;
  /** Seconds before the first line. */
  delay?: number;
  /** In-view threshold on the wrapper. */
  amount?: number;
  once?: boolean;
  /** Controlled override — ignores the internal observer when provided. */
  inView?: boolean;
  /** Scroll-linked mode (pair with `range`). */
  progress?: MotionValue<number>;
  range?: [number, number];
  /** skewY (deg) of the hidden state; 0 disables. */
  skew?: number;
}

const EASE = [0.16, 1, 0.3, 1] as const;

interface ViewLineProps {
  index: number;
  visible: boolean;
  delay: number;
  stagger: number;
  duration: number;
  skew: number;
  children: ReactNode;
}

const ViewLine = ({ index, visible, delay, stagger, duration, skew, children }: ViewLineProps) => {
  const at = delay + index * stagger;
  const hidden = { y: '110%', opacity: 0, skewY: skew };
  return (
    <span className="ml-line">
      <m.span
        className="ml-inner"
        initial={hidden}
        animate={visible ? { y: '0%', opacity: 1, skewY: 0 } : hidden}
        transition={{
          duration,
          delay: at,
          ease: EASE,
          opacity: { duration: 0.45, delay: at, ease: 'linear' },
        }}
      >
        {children}
      </m.span>
    </span>
  );
};

interface ProgressLineProps {
  index: number;
  progress: MotionValue<number>;
  range: [number, number];
  step: number;
  skew: number;
  children: ReactNode;
}

const ProgressLine = ({ index, progress, range, step, skew, children }: ProgressLineProps) => {
  const start = range[0] + index * step;
  const end = range[1] + index * step;
  const y = useTransform(progress, [start, end], ['110%', '0%']);
  const opacity = useTransform(progress, [start, start + (end - start) * 0.4], [0, 1]);
  const skewY = useTransform(progress, [start, end], [skew, 0]);
  return (
    <span className="ml-line">
      <m.span className="ml-inner" style={{ y, opacity, skewY }}>
        {children}
      </m.span>
    </span>
  );
};

export function MaskLines({
  lines,
  as = 'div',
  className,
  id,
  'aria-label': ariaLabel,
  stagger = 0.08,
  duration = 0.9,
  delay = 0,
  amount = 0.4,
  once = true,
  inView,
  progress,
  range,
  skew = 3,
}: MaskLinesProps) {
  const ref = useRef<HTMLElement | null>(null);
  const setRef = useCallback((el: HTMLElement | null) => {
    ref.current = el;
  }, []);
  const observed = useInView(ref, { once, amount });
  const visible = inView ?? observed;
  const scrubbed = Boolean(progress && range);

  const children = lines.map((line, i) =>
    scrubbed && progress && range ? (
      <ProgressLine key={i} index={i} progress={progress} range={range} step={stagger} skew={skew}>
        {line}
      </ProgressLine>
    ) : (
      <ViewLine
        key={i}
        index={i}
        visible={visible}
        delay={delay}
        stagger={stagger}
        duration={duration}
        skew={skew}
      >
        {line}
      </ViewLine>
    ),
  );

  const Tag = as;
  return (
    <Tag
      ref={setRef}
      id={id}
      className={['ml', className].filter(Boolean).join(' ')}
      aria-label={ariaLabel}
      data-ml={scrubbed ? 'progress' : visible ? 'in' : 'out'}
    >
      {children}
    </Tag>
  );
}
