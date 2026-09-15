'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

/**
 * PointerCursor — the site cursor (replaces the legacy Cursor.tsx).
 *
 *   .cur       fixed wrapper translated with quickTo (0.6 s lag)
 *     .cur-ring  32px ring, scaled per mode (hover 2.5× / label 2.75× / reticle 1.375× / text .5×)
 *     .cur-mag   rounded outline sized once to a [data-magnetic] target (snap mode)
 *     .cur-label mono label, textContent from the closest [data-cursor-text]
 *   .cur-dot   6px dot with a 0.15 s lag
 *
 * Everything is DOM-delegated (one pointerover on the document, no React
 * state): the nearest interactive ancestor decides the mode —
 *   [data-magnetic]          → snap: wrapper eases to the element centre, ring folds into .cur-mag
 *   [data-cursor="reticle"]  → crosshair variant over the video stages
 *   input / textarea / select → tiny ring, native caret kept
 *   a / button / [data-cursor-text] → grown ring + label
 * Blend-mode difference lives in chrome.css. Hidden under html[data-menu] /
 * html[data-lightbox]. Not mounted on coarse pointers (server snapshot = not
 * mounted, so SSR emits nothing). Reduced motion: instant follow, no easing.
 */
const HOVER_SELECTOR = [
  'a',
  'button',
  '[role="button"]',
  '[role="tab"]',
  'input',
  'textarea',
  'select',
  'label',
  'summary',
  '[data-cursor]',
  '[data-cursor-text]',
  '[data-magnetic]',
].join(', ');

const TEXT_INPUT_EXCLUDE =
  '[type="button"], [type="submit"], [type="reset"], [type="checkbox"], [type="radio"], [type="range"], [type="file"], [type="color"]';

type Mode = 'idle' | 'hover' | 'reticle' | 'magnet' | 'text';

interface CursorState {
  mode: Mode;
  label: string;
  magnet: HTMLElement | null;
}

const IDLE: CursorState = { mode: 'idle', label: '', magnet: null };

const RING = 32;
const SCALE: Record<'idle' | 'hover' | 'label' | 'reticle' | 'text' | 'magnet', number> = {
  idle: 1,
  hover: 2.5,
  label: 2.75,
  reticle: 1.375,
  text: 0.5,
  magnet: 0,
};

/** Snap strength: how much of the pointer offset the ring keeps while hugging a magnet. */
const SNAP_FOLLOW = 0.18;

type Setter = (v: number) => void;

const makeSetter = (
  el: Element,
  prop: string,
  duration: number,
  reduced: boolean,
  unit?: string,
): Setter => {
  if (reduced) {
    const set = gsap.quickSetter(el, prop, unit) as (v: number) => void;
    return set;
  }
  const to = gsap.quickTo(el, prop, { duration, ease: 'power3' });
  return (v) => {
    to(v);
  };
};

const isMouseLike = (e: PointerEvent) =>
  !e.pointerType || e.pointerType === 'mouse' || e.pointerType === 'pen';

const resolveState = (target: EventTarget | null): CursorState => {
  if (!(target instanceof Element)) return IDLE;
  const el = target.closest<HTMLElement>(HOVER_SELECTOR);
  if (!el) return IDLE;

  if (el.matches('input, textarea, select') && !el.matches(TEXT_INPUT_EXCLUDE)) {
    return { mode: 'text', label: '', magnet: null };
  }

  const magnet = el.closest<HTMLElement>('[data-magnetic]');
  if (magnet) return { mode: 'magnet', label: '', magnet };

  const label = el.closest<HTMLElement>('[data-cursor-text]')?.dataset.cursorText ?? '';
  if (!label && el.dataset.cursor === 'reticle') {
    return { mode: 'reticle', label: '', magnet: null };
  }
  return { mode: 'hover', label, magnet: null };
};

export function PointerCursor() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const ringRef = useRef<HTMLDivElement>(null);
  const magRef = useRef<HTMLSpanElement>(null);
  const labelRef = useRef<HTMLSpanElement>(null);
  const dotRef = useRef<HTMLDivElement>(null);

  const { finePointer, resolved } = useMotionPrefs();
  const enabled = resolved && finePointer;

  useEffect(() => {
    if (!enabled) return;
    const wrap = wrapRef.current;
    const ring = ringRef.current;
    const mag = magRef.current;
    const label = labelRef.current;
    const dot = dotRef.current;
    if (!wrap || !ring || !mag || !label || !dot) return;

    const html = document.documentElement;
    html.dataset.cur = '1';
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    let px = -100;
    let py = -100;
    let visible = false;
    let state: CursorState = IDLE;

    let wrapX: Setter = () => {};
    let wrapY: Setter = () => {};
    let dotX: Setter = () => {};
    let dotY: Setter = () => {};
    let ringScale: Setter = () => {};
    let dotScale: Setter = () => {};

    const ctx = gsap.context(() => {
      gsap.set([wrap, dot], { xPercent: -50, yPercent: -50, x: px, y: py });
      gsap.set(ring, { scale: 1, transformOrigin: '50% 50%' });
      gsap.set(dot, { scale: 1 });
      wrapX = makeSetter(wrap, 'x', 0.6, reduced, 'px');
      wrapY = makeSetter(wrap, 'y', 0.6, reduced, 'px');
      dotX = makeSetter(dot, 'x', 0.15, reduced, 'px');
      dotY = makeSetter(dot, 'y', 0.15, reduced, 'px');
      ringScale = makeSetter(ring, 'scale', 0.45, reduced);
      dotScale = makeSetter(dot, 'scale', 0.3, reduced);
    });

    const show = () => {
      if (visible) return;
      visible = true;
      gsap.set([wrap, dot], { x: px, y: py });
      wrap.dataset.on = '1';
      dot.dataset.on = '1';
    };

    const hide = () => {
      visible = false;
      wrap.dataset.on = '0';
      dot.dataset.on = '0';
    };

    const apply = (next: CursorState) => {
      if (next.mode === state.mode && next.label === state.label && next.magnet === state.magnet) return;
      state = next;
      wrap.dataset.mode = next.mode;
      label.textContent = next.label;
      wrap.dataset.label = next.label ? '1' : '0';

      let rs = SCALE.idle;
      let ds = 1;
      switch (next.mode) {
        case 'hover':
          rs = next.label ? SCALE.label : SCALE.hover;
          ds = 0.66;
          break;
        case 'reticle':
          rs = SCALE.reticle;
          ds = 0;
          break;
        case 'text':
          rs = SCALE.text;
          ds = 0;
          break;
        case 'magnet': {
          /* One-off size read + set (not an animation): the outline hugs the target with an 8px halo. */
          const r = next.magnet!.getBoundingClientRect();
          gsap.set(mag, { width: Math.round(r.width + 16), height: Math.round(r.height + 16) });
          rs = SCALE.magnet;
          ds = 0;
          break;
        }
        default:
          break;
      }
      ringScale(rs);
      dotScale(ds);
    };

    const onMove = (e: PointerEvent) => {
      if (!isMouseLike(e)) return;
      px = e.clientX;
      py = e.clientY;
      if (!visible) show();
      dotX(px);
      dotY(py);
      if (state.magnet) {
        const r = state.magnet.getBoundingClientRect();
        const cx = r.left + r.width / 2;
        const cy = r.top + r.height / 2;
        wrapX(cx + (px - cx) * SNAP_FOLLOW);
        wrapY(cy + (py - cy) * SNAP_FOLLOW);
      } else {
        wrapX(px);
        wrapY(py);
      }
    };

    const onOver = (e: PointerEvent) => {
      if (!isMouseLike(e)) return;
      apply(resolveState(e.target));
    };

    const onOut = (e: PointerEvent) => {
      /* relatedTarget null = the pointer left the document entirely */
      if (e.relatedTarget === null) {
        apply(IDLE);
        hide();
      }
    };

    const onDown = (e: PointerEvent) => {
      if (!isMouseLike(e)) return;
      wrap.dataset.press = '1';
    };
    const onUp = () => {
      wrap.dataset.press = '0';
    };
    const onEnterDoc = () => {
      /* re-shown on the next pointermove so the ring never flies in from the old spot */
    };
    const onBlur = () => {
      apply(IDLE);
      hide();
      wrap.dataset.press = '0';
    };

    document.addEventListener('pointermove', onMove, { passive: true });
    document.addEventListener('pointerover', onOver, { passive: true });
    document.addEventListener('pointerout', onOut, { passive: true });
    document.addEventListener('pointerdown', onDown, { passive: true });
    document.addEventListener('pointerup', onUp, { passive: true });
    document.addEventListener('pointercancel', onUp, { passive: true });
    html.addEventListener('mouseenter', onEnterDoc);
    window.addEventListener('blur', onBlur);

    return () => {
      document.removeEventListener('pointermove', onMove);
      document.removeEventListener('pointerover', onOver);
      document.removeEventListener('pointerout', onOut);
      document.removeEventListener('pointerdown', onDown);
      document.removeEventListener('pointerup', onUp);
      document.removeEventListener('pointercancel', onUp);
      html.removeEventListener('mouseenter', onEnterDoc);
      window.removeEventListener('blur', onBlur);
      ctx.revert();
      delete html.dataset.cur;
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <>
      <div
        ref={wrapRef}
        className="cur"
        aria-hidden="true"
        data-on="0"
        data-mode="idle"
        data-label="0"
        data-press="0"
      >
        <div ref={ringRef} className="cur-ring">
          <span className="cur-ring-in" />
          <span className="cur-ring-c" />
        </div>
        <span ref={magRef} className="cur-mag" />
        <span ref={labelRef} className="cur-label" />
      </div>
      <div ref={dotRef} className="cur-dot" aria-hidden="true" data-on="0" />
    </>
  );
}
