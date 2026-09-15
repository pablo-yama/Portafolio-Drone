'use client';

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  type CSSProperties,
  type Ref,
} from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { isFinePointer, prefersReducedMotion } from './textfxPrefs';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

export type ScrambleTag =
  | 'span'
  | 'div'
  | 'p'
  | 'strong'
  | 'em'
  | 'b'
  | 'time'
  | 'output'
  | 'dd'
  | 'dt'
  | 'li'
  | 'small';

export interface ScrambleHandle {
  play: () => void;
}

export interface ScrambleProps {
  /** Rendered verbatim on the server. Changing it after mount decodes into the new value. */
  text: string;
  as?: ScrambleTag;
  /** Glyph pool, default '0123456789·/ABCDEF' (flight-computer feel). */
  chars?: string;
  /** Seconds, default .8 */
  duration?: number;
  /** Seconds, default 0 */
  delay?: number;
  /** ScrambleText speed (glyph churn), default .45 */
  speed?: number;
  /** Seconds the whole string stays scrambled before revealing, default 0 */
  revealDelay?: number;
  rightToLeft?: boolean;
  /** Keep the string length constant while decoding (default false → constant width for values). */
  tweenLength?: boolean;
  /** Decode in once when first scrolled into view (default true). */
  enter?: boolean;
  /** 'scroll' (default) waits for the element; 'mount' decodes right after hydration. */
  trigger?: 'scroll' | 'mount';
  /** Replay on pointer enter — `true` = self, `'parent'` = parentElement, string = closest(selector). Fine pointer only. */
  hover?: boolean | 'parent' | string;
  /** Controlled: every false→true edge replays. */
  play?: boolean;
  /** Tint the text var(--signal) while decoding (default true). */
  flash?: boolean;
  className?: string;
  style?: CSSProperties;
  id?: string;
  ref?: Ref<ScrambleHandle>;
}

export const SCRAMBLE_CHARS = '0123456789·/ABCDEF';

/**
 * Scramble — ScrambleTextPlugin decode effect. Server HTML is the final text
 * (no layout shift, SEO identical). Reduced motion: plain text, instant swaps.
 */
export function Scramble({
  text,
  as = 'span',
  chars = SCRAMBLE_CHARS,
  duration = 0.8,
  delay = 0,
  speed = 0.45,
  revealDelay = 0,
  rightToLeft = false,
  tweenLength = false,
  enter = true,
  trigger = 'scroll',
  hover = false,
  play,
  flash = true,
  className,
  style,
  id,
  ref,
}: ScrambleProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const tweenRef = useRef<gsap.core.Tween | null>(null);
  const lastTextRef = useRef(text);
  const optsRef = useRef({ text, chars, duration, delay, speed, revealDelay, rightToLeft, tweenLength });

  useEffect(() => {
    optsRef.current = { text, chars, duration, delay, speed, revealDelay, rightToLeft, tweenLength };
  });

  const run = useCallback((withDelay = true) => {
    const el = elRef.current;
    if (!el) return;
    const o = optsRef.current;
    tweenRef.current?.kill();
    if (prefersReducedMotion()) {
      el.textContent = o.text;
      return;
    }
    el.dataset.scrambling = '1';
    el.setAttribute('aria-label', o.text);
    tweenRef.current = gsap.to(el, {
      duration: o.duration,
      delay: withDelay ? o.delay : 0,
      ease: 'none',
      scrambleText: {
        text: o.text,
        chars: o.chars,
        speed: o.speed,
        revealDelay: o.revealDelay,
        rightToLeft: o.rightToLeft,
        tweenLength: o.tweenLength,
      },
      onComplete: () => {
        el.dataset.scrambling = '0';
        el.removeAttribute('aria-label');
        el.textContent = o.text;
      },
    });
  }, []);

  useImperativeHandle(ref, () => ({ play: () => run(false) }), [run]);

  /* Enter / mount trigger + hover listener */
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    let st: ScrollTrigger | undefined;

    if (enter) {
      if (trigger === 'mount') {
        run(true);
      } else {
        st = ScrollTrigger.create({
          trigger: el,
          start: 'top 90%',
          once: true,
          onEnter: () => run(true),
        });
      }
    }

    let hoverTarget: Element | null = null;
    if (hover && isFinePointer()) {
      hoverTarget =
        hover === true ? el : hover === 'parent' ? el.parentElement : el.closest(hover);
    }
    const onHover = () => run(false);
    hoverTarget?.addEventListener('pointerenter', onHover);

    return () => {
      st?.kill();
      hoverTarget?.removeEventListener('pointerenter', onHover);
      tweenRef.current?.kill();
      tweenRef.current = null;
    };
  }, [enter, trigger, hover, run]);

  /* Decode into a new value when `text` changes after mount (React has already swapped the textContent). */
  useEffect(() => {
    if (lastTextRef.current === text) return;
    lastTextRef.current = text;
    run(false);
  }, [text, run]);

  /* Controlled replay on rising edge */
  useEffect(() => {
    if (play) run(false);
  }, [play, run]);

  /* Dynamic tag: typed as 'div' only so the shared HTMLElement ref satisfies TSX. */
  const Tag = as as 'div';

  return (
    <Tag
      ref={elRef}
      id={id}
      style={style}
      className={['tfx-scramble', className].filter(Boolean).join(' ')}
      data-scrambling="0"
      data-flash={flash ? '1' : undefined}
    >
      {text}
    </Tag>
  );
}
