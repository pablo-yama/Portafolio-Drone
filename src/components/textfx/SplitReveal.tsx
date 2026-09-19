'use client';

import { useEffect, useRef, type CSSProperties, type ReactNode } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { SplitText } from 'gsap/SplitText';
import type { MotionValue } from 'framer-motion';

gsap.registerPlugin(ScrollTrigger, SplitText);

export type SplitMode = 'lines' | 'words' | 'chars';

export type SplitRevealTag =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'h4'
  | 'p'
  | 'div'
  | 'span'
  | 'li'
  | 'blockquote'
  | 'figcaption'
  | 'dt'
  | 'dd'
  | 'small'
  | 'strong'
  | 'em';

export interface SplitRevealProps {
  /** Text plus inline markup (em, span.u, br …). Must be static for the life of the component — key it if the copy changes. */
  children: ReactNode;
  as?: SplitRevealTag;
  mode?: SplitMode;
  /** Seconds before the tween starts (ignored in scrub mode). */
  delay?: number;
  /** Seconds between pieces. Default by mode: chars .015 · words .04 · lines .09 */
  stagger?: number;
  /** Seconds per piece. Default by mode: chars .9 · words 1 · lines 1.1 */
  duration?: number;
  /** Play once (default). `false` reverses when the trigger leaves / `inView` turns false. */
  once?: boolean;
  /** ScrollTrigger start, default 'top 85%'. */
  start?: string;
  /** 'scroll' (default) waits for the element; 'mount' plays right after hydration (+delay). */
  trigger?: 'scroll' | 'mount';
  /** Controlled override — plays on true, reverses on false (unless `once`). */
  inView?: boolean;
  /** Scrub mode: the tween's progress follows this MotionValue mapped through `range`. */
  progress?: MotionValue<number>;
  range?: [number, number];
  /** Keep 'chars' under 768px (default downgrades to 'words'). */
  mobileChars?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
  onComplete?: () => void;
}

const STAGGER: Record<SplitMode, number> = { chars: 0.015, words: 0.04, lines: 0.09 };
const DURATION: Record<SplitMode, number> = { chars: 0.9, words: 1, lines: 1.1 };
const SPLIT_TYPE: Record<SplitMode, string> = {
  lines: 'lines',
  words: 'lines,words',
  chars: 'lines,words,chars',
};

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * SplitReveal — masks and staggers lines / words / chars with a rise + slight
 * skew (lines) or rotate (chars), power4.out, triggered once by scroll.
 * Server HTML is the plain element with the original children (SEO text identical);
 * the split happens on the client inside gsap.matchMedia and is fully reverted on cleanup.
 */
export function SplitReveal({
  children,
  as = 'div',
  mode = 'lines',
  delay = 0,
  stagger,
  duration,
  once = true,
  start = 'top 85%',
  trigger = 'scroll',
  inView,
  progress,
  range,
  mobileChars = false,
  className,
  style,
  id,
  onComplete,
}: SplitRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const playedRef = useRef(false);
  const onCompleteRef = useRef(onComplete);
  const hasInView = inView !== undefined;
  const r0 = range?.[0] ?? 0;
  const r1 = range?.[1] ?? 1;

  useEffect(() => {
    onCompleteRef.current = onComplete;
  });

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const scrub = !!progress;
    const controlled = hasInView;
    const staggerS = stagger ?? STAGGER[mode];
    const durationS = duration ?? DURATION[mode];
    const delayS = scrub ? 0 : delay;

    playedRef.current = trigger === 'mount' && !scrub && !controlled;

    const mm = gsap.matchMedia();

    mm.add(
      { all: 'all', reduce: '(prefers-reduced-motion: reduce)', mobile: '(max-width: 767px)' },
      (ctx) => {
        const { reduce, mobile } = ctx.conditions as { reduce: boolean; mobile: boolean };
        const finish = () => {
          el.dataset.tfx = 'done';
          onCompleteRef.current?.();
        };
        /* Registers the current tween and honours any pending play request (mount / re-split). */
        const arm = (tw: gsap.core.Tween) => {
          tweenRef.current = tw;
          if (scrub) {
            tw.progress(clamp01((progress!.get() - r0) / (r1 - r0)));
          } else if (playedRef.current) {
            tw.play();
          }
        };

        el.dataset.tfx = 'live';

        if (reduce) {
          arm(
            gsap.fromTo(
              el,
              { opacity: 0 },
              { opacity: 1, duration: 0.6, ease: 'power2.out', delay: delayS, paused: true, onComplete: finish },
            ),
          );
        } else {
          const effMode: SplitMode = mode === 'chars' && mobile && !mobileChars ? 'words' : mode;
          SplitText.create(el, {
            type: SPLIT_TYPE[effMode],
            mask: 'lines',
            autoSplit: true,
            aria: 'auto',
            linesClass: 'tfx-line',
            wordsClass: 'tfx-word',
            charsClass: 'tfx-char',
            onSplit: (self) => {
              const targets = self[effMode];
              const tw = gsap.from(targets, {
                yPercent: 110,
                opacity: 0,
                rotate: effMode === 'chars' ? 2 : 0,
                skewY: effMode === 'lines' ? 3 : 0,
                transformOrigin: '0% 100%',
                duration: durationS,
                ease: 'power4.out',
                stagger: staggerS,
                delay: delayS,
                paused: true,
                onComplete: finish,
              });
              arm(tw);
              return tw;
            },
          });
        }

        if (scrub) {
          const unsub = progress!.on('change', (v) => {
            tweenRef.current?.progress(clamp01((v - r0) / (r1 - r0)));
          });
          return () => unsub();
        }

        if (!controlled && trigger === 'scroll') {
          ScrollTrigger.create({
            trigger: el,
            start,
            once,
            onEnter: () => {
              playedRef.current = true;
              tweenRef.current?.play();
            },
            onLeaveBack: once
              ? undefined
              : () => {
                  playedRef.current = false;
                  tweenRef.current?.reverse();
                },
          });
        }
      },
      el,
    );

    return () => {
      mm.revert();
      tweenRef.current = null;
    };
  }, [mode, delay, stagger, duration, once, start, trigger, hasInView, progress, r0, r1, mobileChars]);

  /* Controlled trigger — declared after the split effect so a mount-time `inView` finds the tween. */
  useEffect(() => {
    if (inView === undefined) return;
    if (inView) {
      playedRef.current = true;
      tweenRef.current?.play();
    } else if (!once) {
      playedRef.current = false;
      tweenRef.current?.reverse();
    }
  }, [inView, once]);

  /* Dynamic tag: typed as 'div' only so the shared HTMLElement ref satisfies TSX. */
  const Tag = as as 'div';

  return (
    <Tag
      ref={ref}
      id={id}
      style={style}
      className={['tfx', 'tfx-split', className].filter(Boolean).join(' ')}
      data-tfx="pending"
    >
      {children}
    </Tag>
  );
}
