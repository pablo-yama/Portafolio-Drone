'use client';

import { useEffect, type RefObject } from 'react';
import gsap from 'gsap';

/**
 * useHudTelemetry — ref-based flight-computer simulator for the video hero.
 *
 * Runs one rAF loop (paused while the section is off-screen or the tab is
 * hidden) that eases ALT / SPD / GPS / BAT toward drifting targets and writes:
 *
 *  - `[data-hud="alt-val"|"spd-val"|"gps-val"|"bat-val"]` textContent
 *  - `[data-hud="alt-bar"|…]` scaleX (transform only — no width tweens)
 *  - `#crosshair` x/y along `#flightPath` (tolerates a missing map on mobile)
 *  - `[data-hud="tc-time"]`, `[data-hud="tc-label"]`, `[data-hud="tc-fill"]`
 *    from the video's currentTime / duration (STANDBY when not playing)
 *  - `[data-hud="alt-mark"]` translateY on the altitude ruler
 *  - `[data-hud="mini"]` the one-line mobile readout `ALT 120M · BAT 76%`
 *  - `#sessClock` session clock and the nav mirror `#altBar` (document-level)
 *
 * All lookups are scoped to `root`; every target is optional. Under reduced
 * motion only text is written (no transforms). No React state is touched.
 */
export interface HudTelemetryOptions {
  /** Section root — every selector is resolved inside it. */
  root: RefObject<HTMLElement | null>;
  videoRef: RefObject<HTMLVideoElement | null>;
  /** Mirrors HudVideo's onPlayingChange; false → STANDBY readouts. */
  playingRef: RefObject<boolean>;
  /** Fallback clip length (s) until the video reports metadata. */
  duration?: number;
}

const ease = (a: number, b: number, k: number) => a + (b - a) * k;
const pad2 = (n: number) => String(n).padStart(2, '0');

const fmtClock = (ms: number) => {
  const s = Math.floor(ms / 1000);
  return `SESIÓN · ${pad2(Math.floor(s / 3600))}:${pad2(Math.floor((s % 3600) / 60))}:${pad2(s % 60)}`;
};

/** 00:00:04.2 */
const fmtTc = (sec: number) => {
  const whole = Math.floor(sec);
  const tenth = Math.floor((sec - whole) * 10);
  return `${pad2(Math.floor(whole / 3600))}:${pad2(Math.floor((whole % 3600) / 60))}:${pad2(whole % 60)}.${tenth}`;
};

/** 00:10.0 */
const fmtShort = (sec: number) => {
  const whole = Math.floor(sec);
  const tenth = Math.floor((sec - whole) * 10);
  return `${pad2(Math.floor(whole / 60))}:${pad2(whole % 60)}.${tenth}`;
};

/** Section-level flag read by CSS (`.hero-v[data-hud-active='1']` gates the REC blink / hint loops). */
const setHudActive = (el: HTMLElement, on: boolean | null) => {
  if (on === null) delete el.dataset.hudActive;
  else el.dataset.hudActive = on ? '1' : '0';
};

/** Writes textContent only when the string actually changed (no layout churn). */
const textWriter = (el: Element | null) => {
  let last = '';
  return (next: string) => {
    if (!el || next === last) return;
    last = next;
    el.textContent = next;
  };
};

export function useHudTelemetry({ root, videoRef, playingRef, duration = 10 }: HudTelemetryOptions): void {
  useEffect(() => {
    const scope = root.current;
    if (!scope) return;

    const q = <T extends Element = HTMLElement>(sel: string) => scope.querySelector<T>(sel);
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    /* --- targets (all optional) --- */
    const wAlt = textWriter(q('[data-hud="alt-val"]'));
    const wSpd = textWriter(q('[data-hud="spd-val"]'));
    const wGps = textWriter(q('[data-hud="gps-val"]'));
    const wBat = textWriter(q('[data-hud="bat-val"]'));
    const wTc = textWriter(q('[data-hud="tc-time"]'));
    const wTcLabel = textWriter(q('[data-hud="tc-label"]'));
    const wMini = textWriter(q('[data-hud="mini"]'));
    const wClock = textWriter(q('#sessClock'));
    const wNav = textWriter(document.getElementById('altBar'));

    const barAlt = q('[data-hud="alt-bar"]');
    const barSpd = q('[data-hud="spd-bar"]');
    const barGps = q('[data-hud="gps-bar"]');
    const barBat = q('[data-hud="bat-bar"]');
    const tcFill = q('[data-hud="tc-fill"]');
    const altMark = q('[data-hud="alt-mark"]');
    const cross = q('#crosshair');
    const pathEl = q<SVGPathElement>('#flightPath');
    const map = cross?.parentElement ?? null;

    type Setter = (v: number) => void;
    const setBar = (el: HTMLElement | null): Setter | null =>
      el && !reduced ? (gsap.quickSetter(el, 'scaleX') as Setter) : null;
    const sAlt = setBar(barAlt);
    const sSpd = setBar(barSpd);
    const sGps = setBar(barGps);
    const sBat = setBar(barBat);
    const sTc = setBar(tcFill);
    const sMark = altMark && !reduced ? (gsap.quickSetter(altMark, 'y', 'px') as Setter) : null;

    let sCrossX: Setter | null = null;
    let sCrossY: Setter | null = null;
    let pathLen = 0;
    if (cross && pathEl && !reduced) {
      gsap.set(cross, { xPercent: -50, yPercent: -50, left: 0, top: 0 });
      sCrossX = gsap.quickSetter(cross, 'x', 'px') as Setter;
      sCrossY = gsap.quickSetter(cross, 'y', 'px') as Setter;
      try {
        pathLen = pathEl.getTotalLength();
      } catch {
        pathLen = 0;
      }
    }

    /* Map + ruler boxes cached; refreshed by one ResizeObserver instead of per-frame reads. */
    const ruler = altMark?.parentElement ?? null;
    let mapW = map?.clientWidth ?? 0;
    let mapH = map?.clientHeight ?? 0;
    let rulerH = ruler?.clientHeight ?? 0;
    let ro: ResizeObserver | null = null;
    if (typeof ResizeObserver !== 'undefined' && (map || ruler)) {
      ro = new ResizeObserver(() => {
        if (map) {
          mapW = map.clientWidth;
          mapH = map.clientHeight;
        }
        if (ruler) rulerH = ruler.clientHeight;
      });
      if (map) ro.observe(map);
      if (ruler) ro.observe(ruler);
    }

    /* --- model --- */
    const telem = { alt: 0, spd: 0, gps: 0, bat: 0 };
    const tgt = { alt: 62, spd: 48, gps: 88, bat: 76 };
    const startTime = performance.now();
    const shortDur = fmtShort(duration);

    let raf = 0;
    let visible = true;
    let lastClockSec = -1;

    const tick = () => {
      raf = 0;
      const now = performance.now();
      const scroll = Math.min(1, window.scrollY / (window.innerHeight * 0.9));
      tgt.alt = 55 + Math.sin(now * 0.0004) * 15 + scroll * 20;
      tgt.spd = 42 + Math.sin(now * 0.0008) * 22;
      tgt.gps = 82 + Math.sin(now * 0.0006) * 10;
      tgt.bat = Math.max(20, 76 - ((now - startTime) / 180000) * 30);

      telem.alt = ease(telem.alt, tgt.alt, 0.04);
      telem.spd = ease(telem.spd, tgt.spd, 0.04);
      telem.gps = ease(telem.gps, tgt.gps, 0.04);
      telem.bat = ease(telem.bat, tgt.bat, 0.03);

      const altM = Math.round(telem.alt * 2);
      const batP = Math.round(telem.bat);

      wAlt(`${altM} M`);
      wSpd(`${Math.round(telem.spd * 0.3)} M/S`);
      wGps(`${Math.round(telem.gps / 5)}/22`);
      wBat(`${batP}%`);
      wNav(`ALT ${altM}M`);
      wMini(`ALT ${altM}M · BAT ${batP}%`);

      sAlt?.(telem.alt / 100);
      sSpd?.(telem.spd / 100);
      sGps?.(telem.gps / 100);
      sBat?.(telem.bat / 100);
      sMark?.(-(Math.min(200, altM) / 200) * rulerH);

      if (sCrossX && sCrossY && pathEl && pathLen > 0 && mapW > 0) {
        const k = (now * 0.00012) % 1;
        const pt = pathEl.getPointAtLength(k * pathLen);
        sCrossX((pt.x / 400) * mapW);
        sCrossY((pt.y / 220) * mapH);
      }

      /* Session clock — once per second. */
      const sec = Math.floor((now - startTime) / 1000);
      if (sec !== lastClockSec) {
        lastClockSec = sec;
        wClock(fmtClock(now - startTime));
      }

      /* Timecode from the real clip. */
      const video = videoRef.current;
      const playing = Boolean(playingRef.current) && !!video && !video.paused && !video.ended;
      if (playing && video) {
        const dur = Number.isFinite(video.duration) && video.duration > 0 ? video.duration : duration;
        const t = video.currentTime;
        wTc(fmtTc(t));
        wTcLabel(`TC ${fmtTc(t)} / ${shortDur}`);
        sTc?.(Math.min(1, t / dur));
      } else {
        wTc('STANDBY');
        wTcLabel('STANDBY · POSTER');
        sTc?.(0);
      }

      if (visible) raf = requestAnimationFrame(tick);
    };

    const start = () => {
      if (!raf && visible && !document.hidden) raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    /* Pause the loop off-screen; also gates the REC blink via CSS. */
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver(
        (entries) => {
          const entry = entries[entries.length - 1];
          if (!entry) return;
          visible = entry.isIntersecting;
          setHudActive(scope, visible);
          if (visible) start();
          else stop();
        },
        { threshold: 0 },
      );
      io.observe(scope);
    } else {
      setHudActive(scope, true);
    }

    const onVisibility = () => {
      if (document.hidden) stop();
      else start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    start();

    return () => {
      stop();
      io?.disconnect();
      ro?.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      setHudActive(scope, null);
    };
  }, [root, videoRef, playingRef, duration]);
}
