'use client';

import { useEffect, useRef, useState, useSyncExternalStore } from 'react';
import { usePathname } from 'next/navigation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Scramble, SplitReveal } from '@/components/textfx';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { HERO_CLIPS } from '@/hooks/useVideoSource';
import { isBootPending, markBootDone, whenHeroReady } from '@/lib/bootSignals';
import { getLenis, subscribeLenis } from '@/lib/lenisStore';
import { BOOT_SESSION_KEY } from '@/lib/bootGate';
import type Lenis from 'lenis';

/* Client-side consumers may import the gate script from here; the root layout
   (a Server Component) must import it from '@/lib/bootGate' instead. */
export { BOOT_GATE_SCRIPT, BOOT_SESSION_KEY } from '@/lib/bootGate';

gsap.registerPlugin(ScrollTrigger);

/** Minimum time on screen (so the self-test reads as a sequence, not a flash). */
const MIN_MS = 1050;
/** Hard cap — the curtain opens at this point whatever the signals say. */
const CAP_MS = 1600;
const WEIGHTS = { fonts: 0.4, poster: 0.3, hero: 0.3 } as const;
/** CDMX field elevation — the altitude bar climbs to it as the counter reaches 100. */
const ALT_M = 2240;

const STATUS_LINES = ['SYS · OK', 'GPS · 22/22', 'CAM · LISTA'] as const;

const pad = (n: number, len: number) => String(Math.max(0, Math.round(n))).padStart(len, '0');

type Gate = 'seen' | 'pending';
const gateSubscribe = () => () => {};
const gateSnapshot = (): Gate => {
  try {
    return window.sessionStorage.getItem(BOOT_SESSION_KEY) === '1' ? 'seen' : 'pending';
  } catch {
    return 'seen';
  }
};
const gateServerSnapshot = (): Gate => 'seen';

/**
 * BootPreloader — session-gated, home-only "flight computer" self-test.
 *
 *   brand chars stagger in (SplitReveal) · INICIALIZANDO SISTEMA + three status
 *   lines decode (Scramble) · counter 000→100 (Fraunces italic, tnum) bound to
 *   real signals — document.fonts.ready 40 % + hero poster decode 30 % +
 *   whenHeroReady() 30 % — min 1.05 s, hard cap 1.6 s · altitude bar climbs to
 *   2240 m · exit = a signal seam flashes across the centre and the two panels
 *   retract to the top/bottom edges (scaleY, power4.inOut) over the hero that
 *   is already playing underneath (HudVideo attaches its src immediately while
 *   html[data-boot="pending"]).
 *
 * The beforeInteractive gate (src/lib/bootGate.ts) flags html[data-boot]
 * before hydration so chrome.css can paint an opaque cover — no flash of the
 * page. Never mounted under reduced motion, on sub-pages or after the first
 * visit of the session (sessionStorage 'ya-boot'). Scroll is locked through
 * Lenis while the overlay is up; ScrollTrigger refreshes when it leaves.
 */
export function BootPreloader() {
  const gate = useSyncExternalStore(gateSubscribe, gateSnapshot, gateServerSnapshot);
  const pathname = usePathname();
  const { reduced, resolved } = useMotionPrefs();
  const [done, setDone] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const uiRef = useRef<HTMLDivElement>(null);
  const topRef = useRef<HTMLDivElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);
  const seamRef = useRef<HTMLSpanElement>(null);
  const counterRef = useRef<HTMLSpanElement>(null);
  const ruleRef = useRef<HTMLSpanElement>(null);
  const altTrackRef = useRef<HTMLSpanElement>(null);
  const altFillRef = useRef<HTMLSpanElement>(null);
  const altMarkRef = useRef<HTMLSpanElement>(null);
  const altValRef = useRef<HTMLSpanElement>(null);

  const show = gate === 'pending' && pathname === '/' && resolved && !reduced && !done;

  /* Not showing (sub-page, returning visitor, reduced motion, finished): make sure
     nothing stays gated on a boot that will never run. */
  useEffect(() => {
    if (show || !resolved) return;
    if (isBootPending()) delete document.documentElement.dataset.boot;
    markBootDone();
  }, [show, resolved]);

  useEffect(() => {
    if (!show) return;
    const root = rootRef.current;
    const ui = uiRef.current;
    const top = topRef.current;
    const bottom = bottomRef.current;
    const seam = seamRef.current;
    const counter = counterRef.current;
    const rule = ruleRef.current;
    const altTrack = altTrackRef.current;
    const altFill = altFillRef.current;
    const altMark = altMarkRef.current;
    const altVal = altValRef.current;
    if (
      !root || !ui || !top || !bottom || !seam || !counter || !rule ||
      !altTrack || !altFill || !altMark || !altVal
    ) {
      return;
    }

    const html = document.documentElement;
    html.dataset.bootUi = '1';
    if (html.dataset.boot !== 'pending') html.dataset.boot = 'pending';

    const t0 = performance.now();
    const parts = { fonts: 0, poster: 0, hero: 0 };
    const live = { p: 0, shown: 0 };
    let finished = false;
    let cancelled = false;
    let scheduled = false;
    const timers: number[] = [];

    /* ---- scroll lock through Lenis (the instance may be created a tick after us) ---- */
    let locked = false;
    const lock = (l: Lenis | null) => {
      if (l && !finished && !cancelled) {
        l.stop();
        locked = true;
      }
    };
    lock(getLenis());
    const unsubLenis = subscribeLenis(lock);
    const unlock = () => {
      unsubLenis();
      if (locked) getLenis()?.start();
      locked = false;
    };

    const travel = Math.max(0, altTrack.getBoundingClientRect().height - 6);

    const render = () => {
      counter.textContent = pad(live.shown, 3);
      altVal.textContent = pad((live.shown / 100) * ALT_M, 4);
    };

    const ctx = gsap.context(() => {
      gsap.set(rule, { scaleX: 0, transformOrigin: '0% 50%' });
      gsap.set(altFill, { scaleY: 0, transformOrigin: '50% 100%' });
      gsap.set(altMark, { y: 0 });
      gsap.set(seam, { scaleX: 0, opacity: 0, transformOrigin: '50% 50%' });
      gsap.set([top, bottom], { scaleY: 1 });
      gsap.set(ui, { opacity: 1, y: 0 });

      gsap.from('.boot-kicker, .boot-status, .boot-counter-wrap, .boot-alt', {
        opacity: 0,
        y: 8,
        duration: 0.8,
        ease: 'power3.out',
        stagger: 0.06,
        delay: 0.1,
      });
      gsap.fromTo(
        '.boot-tick',
        { opacity: 0, scale: 0.4 },
        { opacity: 1, scale: 1, duration: 0.5, ease: 'back.out(2)', stagger: 0.18, delay: 0.55 },
      );
    }, root);

    const showProgress = (target: number, duration = 0.6) => {
      ctx.add(() => {
        gsap.to(live, {
          shown: target * 100,
          duration,
          ease: 'power2.out',
          overwrite: 'auto',
          onUpdate: render,
        });
        gsap.to(rule, { scaleX: target, duration, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(altFill, { scaleY: target, duration, ease: 'power2.out', overwrite: 'auto' });
        gsap.to(altMark, { y: -target * travel, duration, ease: 'power2.out', overwrite: 'auto' });
      });
    };

    const finish = () => {
      if (finished || cancelled) return;
      finished = true;
      try {
        window.sessionStorage.setItem(BOOT_SESSION_KEY, '1');
      } catch {
        /* private mode — the gate simply replays next time */
      }
      unlock();
      ctx.add(() => {
        const tl = gsap.timeline({
          defaults: { overwrite: 'auto' },
          onComplete: () => {
            delete html.dataset.bootUi;
            markBootDone();
            ScrollTrigger.refresh();
            setDone(true);
          },
        });
        tl.to(live, { shown: 100, duration: 0.4, ease: 'power2.inOut', onUpdate: render }, 0)
          .to(rule, { scaleX: 1, duration: 0.4, ease: 'power2.inOut' }, 0)
          .to(altFill, { scaleY: 1, duration: 0.4, ease: 'power2.inOut' }, 0)
          .to(altMark, { y: -travel, duration: 0.4, ease: 'power2.inOut' }, 0)
          .to(ui, { opacity: 0, y: -14, duration: 0.35, ease: 'power2.in' }, 0.42)
          .set(seam, { opacity: 1 }, 0.5)
          .to(seam, { scaleX: 1, duration: 0.4, ease: 'power3.inOut' }, 0.5)
          /* the pre-hydration cover goes right as the panels start to part */
          .call(
            () => {
              delete html.dataset.boot;
            },
            undefined,
            0.86,
          )
          .to(seam, { opacity: 0, duration: 0.3, ease: 'power1.out' }, 0.92)
          .to(top, { scaleY: 0, duration: 0.85, ease: 'power4.inOut' }, 0.86)
          .to(bottom, { scaleY: 0, duration: 0.85, ease: 'power4.inOut' }, 0.86);
      });
    };

    const check = () => {
      if (cancelled || finished || scheduled) return;
      const elapsed = performance.now() - t0;
      const complete = live.p >= 0.999;
      if (!complete && elapsed < CAP_MS) return;
      scheduled = true;
      const wait = Math.max(0, MIN_MS - elapsed);
      if (wait > 0) timers.push(window.setTimeout(finish, wait));
      else finish();
    };

    const bump = (key: keyof typeof parts) => {
      if (cancelled || finished) return;
      parts[key] = 1;
      const p = parts.fonts * WEIGHTS.fonts + parts.poster * WEIGHTS.poster + parts.hero * WEIGHTS.hero;
      if (p > live.p) {
        live.p = p;
        showProgress(Math.min(p, 0.97));
      }
      check();
    };

    /* perceived start: the counter leaves 000 immediately, real signals push it on */
    showProgress(0.08, 0.5);

    const fontsReady: Promise<unknown> =
      'fonts' in document ? document.fonts.ready : Promise.resolve();
    fontsReady.then(
      () => bump('fonts'),
      () => bump('fonts'),
    );

    /* Prefer the hero's own poster <img> (next/image); fall back to the raw file. */
    const posterEl = document.querySelector<HTMLImageElement>('.hv-poster');
    const posterImg = posterEl ?? new Image();
    if (!posterEl) posterImg.src = HERO_CLIPS.reforma.poster;
    const decoded =
      typeof posterImg.decode === 'function' ? posterImg.decode() : Promise.resolve();
    decoded.then(
      () => bump('poster'),
      () => bump('poster'),
    );

    whenHeroReady(1400).then(() => bump('hero'));

    timers.push(window.setTimeout(check, CAP_MS + 10));

    return () => {
      cancelled = true;
      timers.forEach((t) => window.clearTimeout(t));
      unlock();
      ctx.revert();
      delete html.dataset.bootUi;
      /* Deferred so a StrictMode remount (which re-claims data-boot-ui synchronously)
         does not release the gate early; a real unmount mid-boot un-gates the page. */
      window.setTimeout(() => {
        if (html.dataset.bootUi === '1') return;
        if (html.dataset.boot === 'pending') delete html.dataset.boot;
        markBootDone();
      }, 0);
    };
  }, [show]);

  if (!show) return null;

  return (
    <div
      ref={rootRef}
      className="boot"
      role="status"
      aria-busy="true"
      aria-live="off"
      aria-label="Inicializando sistema"
    >
      <div ref={topRef} className="boot-panel boot-panel--top" />
      <div ref={bottomRef} className="boot-panel boot-panel--bottom" />
      <span ref={seamRef} className="boot-seam" aria-hidden="true" />

      <div ref={uiRef} className="boot-ui">
        <div className="boot-kicker">
          <span className="boot-sig" aria-hidden="true" />
          YAMAMOTO · AERIAL / MX
        </div>

        <div className="boot-status" aria-hidden="true">
          <Scramble text="INICIALIZANDO SISTEMA" trigger="mount" delay={0.2} duration={0.9} />
        </div>

        <SplitReveal
          as="div"
          mode="chars"
          trigger="mount"
          delay={0.15}
          mobileChars
          className="boot-brand"
        >
          Yamamoto <em>Aerial</em>
        </SplitReveal>

        <ul className="boot-lines" aria-hidden="true">
          {STATUS_LINES.map((line, i) => (
            <li key={line} className="boot-line">
              <span className="boot-tick" />
              <Scramble text={line} trigger="mount" delay={0.55 + i * 0.18} duration={0.7} />
            </li>
          ))}
        </ul>

        <div className="boot-counter-wrap" aria-hidden="true">
          <span ref={counterRef} className="boot-counter tnum">
            000
          </span>
          <span className="boot-pct">%</span>
        </div>

        <div className="boot-alt" aria-hidden="true">
          <span className="boot-alt-l">ALT</span>
          <span ref={altTrackRef} className="boot-alt-track">
            <span ref={altFillRef} className="boot-alt-fill" />
            <span ref={altMarkRef} className="boot-alt-mark" />
          </span>
          <span className="boot-alt-v tnum">
            <span ref={altValRef}>0000</span> M
          </span>
        </div>

        <span ref={ruleRef} className="boot-rule" aria-hidden="true" />
      </div>
    </div>
  );
}
