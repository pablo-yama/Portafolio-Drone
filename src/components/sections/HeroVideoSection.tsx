'use client';

import Link from 'next/link';
import { Fragment, useCallback, useEffect, useLayoutEffect, useMemo, useRef, useState } from 'react';
import {
  animate,
  m,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useTransform,
  type MotionStyle,
} from 'framer-motion';
import gsap from 'gsap';
import { HudVideo } from '@/components/media/HudVideo';
import { Magnetic } from '@/components/motion/Magnetic';
import { HoverLetters, Odometer, Scramble, SplitReveal } from '@/components/textfx';
import { HudFrame } from '@/components/hero/HudFrame';
import { HeroRail } from '@/components/hero/HeroRail';
import { HERO_CLIPS } from '@/hooks/useVideoSource';
import { getMotionPrefs, useMotionPrefs } from '@/hooks/useMotionPrefs';
import { useHudTelemetry } from '@/hooks/useHudTelemetry';
import { markHeroReady, whenBootDone } from '@/lib/bootSignals';
import type { ScrollOffset } from '@/hooks/useSectionProgress';

/**
 * HeroVideoSection — cold open on the Reforma night hyperlapse.
 *
 * Layout: `section.hero.hero-v` is a 190svh runway (desktop) whose sticky
 * `.hero-stage` (100svh) stays pinned for the first 90svh. Inside the stage,
 * `.hero-stage-in` carries the "lámina" hand-off (scale 1→.94 + 24px radius
 * at the end of the run) and stacks, back→front: HudVideo (poster = LCP),
 * scrim, scan line, HUD chrome, copy grid (kicker · H1 · lead · CTAs ·
 * metrics · rail), letterbox bars, the 1px frame and the lámina stamp.
 *
 * Scroll driver: framer `useScroll` on the section with offset
 * ['start start', 'end end'] — RAW progress (Lenis already smooths), so p
 * runs 0→1 exactly while the stage is pinned. Every mapping below is
 * transform/opacity only (border-radius on the lámina is the one documented
 * paint exception). Nothing is bound on mobile (<1024) or reduced motion.
 *
 * Entrance: gated on `whenBootDone()` so the choreography starts as the boot
 * curtain opens — SplitReveal chars on the four H1 lines, Scramble on the
 * kickers / ticker, GSAP timeline for corners, chrome, copy and rail rows,
 * Odometers rolled by an intro MotionValue (or by the hero progress if the
 * user scrolls first), and a 1.06→1 plate zoom on the first 'playing' event.
 *
 * SEO: H1, kicker, lead, CTA labels and metric values are byte-identical to
 * the legacy HeroSection.
 */
const CLIP = HERO_CLIPS.reforma;
const SECTION_OFFSET: ScrollOffset = ['start start', 'end end'];
const LINE_DRIFT = [-30, -70, -110, -150] as const;
/** Hero progress window that fully rolls the metric odometers when scrolling beats the intro. */
const ODO_SCRUB_END = 0.22;

const H1_LINES = [
  <Fragment key="l1">Una cámara,</Fragment>,
  <Fragment key="l2">
    mil <em>ángulos</em>
  </Fragment>,
  <Fragment key="l3">
    que <span className="b">no existen</span>
  </Fragment>,
  <Fragment key="l4">
    desde el <span className="u">suelo</span>.
  </Fragment>,
];

const METRICS = [
  { label: 'Horas de vuelo', value: 300, suffix: '+' },
  { label: 'Proyectos', value: 10, suffix: '+' },
  { label: 'Años', value: 10, suffix: '' },
  { label: 'Incidentes', value: 0, suffix: '', pad: 2 },
] as const;

export function HeroVideoSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const hvRef = useRef<HTMLElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const playingRef = useRef(false);
  const zoomedRef = useRef(false);
  const fxCtxRef = useRef<gsap.Context | null>(null);

  const { desktop, reduced, resolved } = useMotionPrefs();
  const active = resolved && desktop && !reduced;

  /* ---------- boot gate → entrance choreography ---------- */
  const [intro, setIntro] = useState(false);
  useEffect(() => {
    let alive = true;
    whenBootDone().then(() => {
      if (alive) setIntro(true);
    });
    return () => {
      alive = false;
    };
  }, []);

  /* ---------- one GSAP context for the imperative one-offs (zoom on first play) ---------- */
  useLayoutEffect(() => {
    const scope = sectionRef.current;
    if (!scope) return;
    hvRef.current = scope.querySelector<HTMLElement>('.hv');
    const ctx = gsap.context(() => {}, scope);
    fxCtxRef.current = ctx;
    return () => {
      ctx.revert();
      fxCtxRef.current = null;
      hvRef.current = null;
    };
  }, []);

  /* ---------- scroll driver (raw, no spring) ---------- */
  const { scrollYProgress: p } = useScroll({ target: sectionRef, offset: SECTION_OFFSET });

  const videoScale = useTransform(p, [0, 1], [1, 1.18]);
  const videoY = useTransform(p, [0, 1], ['0%', '10%']);
  const videoOpacity = useTransform(p, [0.6, 1], [1, 0.2]);
  const plateStyle = useMemo<MotionStyle>(
    () => ({ scale: videoScale, y: videoY, opacity: videoOpacity }),
    [videoScale, videoY, videoOpacity],
  );

  const barScale = useTransform(p, [0.05, 0.6], [0, 1]);
  const hudOpacity = useTransform(p, [0, 0.4], [1, 0]);
  const hudScale = useTransform(p, [0, 0.4], [1, 1.05]);
  const hudStyle = useMemo<MotionStyle>(() => ({ opacity: hudOpacity, scale: hudScale }), [hudOpacity, hudScale]);

  const scanY = useTransform(p, [0, 0.9], ['-4%', '104%']);
  const scanOpacity = useTransform(p, [0, 0.06, 0.55, 0.85], [0, 1, 1, 0]);

  const copyY = useTransform(p, [0, 1], [0, -120]);
  const copyOpacity = useTransform(p, [0.25, 0.7], [1, 0]);
  /* the rail lags the copy (net −56px vs −120px) so the two layers separate */
  const railY = useTransform(p, [0, 1], [0, 64]);

  const lineY1 = useTransform(p, [0, 0.8], [0, LINE_DRIFT[0]]);
  const lineY2 = useTransform(p, [0, 0.8], [0, LINE_DRIFT[1]]);
  const lineY3 = useTransform(p, [0, 0.8], [0, LINE_DRIFT[2]]);
  const lineY4 = useTransform(p, [0, 0.8], [0, LINE_DRIFT[3]]);
  const lineYs = [lineY1, lineY2, lineY3, lineY4];

  const laminaScale = useTransform(p, [0.72, 1], [1, 0.94]);
  const laminaRadius = useTransform(p, [0.72, 1], ['0px', '24px']);
  const frameOpacity = useTransform(p, [0.74, 0.92], [0, 1]);
  const stampOpacity = useTransform(p, [0.8, 0.96], [0, 1]);
  const stampY = useTransform(p, [0.8, 0.96], [8, 0]);

  /* will-change on the plate / copy only while the run is being scrubbed */
  useMotionValueEvent(p, 'change', (v) => {
    const scope = sectionRef.current;
    const hv = hvRef.current;
    const scrubbing = active && v > 0 && v < 1;
    if (hv) {
      if (scrubbing) hv.dataset.scrub = '1';
      else delete hv.dataset.scrub;
    }
    if (scope) {
      if (scrubbing) scope.dataset.scrub = '1';
      else delete scope.dataset.scrub;
    }
  });

  /* ---------- odometers: rolled by the intro, or by the hero progress if the user scrolls first ---------- */
  const introMv = useMotionValue(0);
  useEffect(() => {
    if (!intro) return;
    const ctrl = animate(introMv, 1, { duration: 2.2, delay: 0.7, ease: [0.16, 1, 0.3, 1] });
    return () => ctrl.stop();
  }, [intro, introMv]);
  const odoProgress = useTransform([introMv, p], ([i, s]: number[]) =>
    Math.max(i, Math.min(1, s / ODO_SCRUB_END)),
  );

  /* ---------- GSAP entrance (before paint so the hidden→visible flip never flashes) ---------- */
  useLayoutEffect(() => {
    if (!intro) return;
    const scope = sectionRef.current;
    if (!scope) return;
    const mm = gsap.matchMedia(scope);

    mm.add({ reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {
      const { reduce } = ctx.conditions as { reduce: boolean };
      const corners = gsap.utils.toArray<HTMLElement>('.hud-corner', scope);
      const chrome = gsap.utils.toArray<HTMLElement>('.hud-ticker, .hud-tc, .hud-alt', scope);
      const rail = gsap.utils.toArray<HTMLElement>('.rail-in', scope);
      const copy = gsap.utils.toArray<HTMLElement>('.hero-in', scope);

      if (reduce) {
        gsap.fromTo(
          [...corners, ...chrome, ...copy, ...rail],
          { opacity: 0 },
          { opacity: 1, duration: 0.5, stagger: 0.03, ease: 'power2.out', overwrite: 'auto' },
        );
        return;
      }

      const tl = gsap.timeline({ defaults: { ease: 'power4.out', overwrite: 'auto' } });
      tl.fromTo(
        corners,
        { scaleX: 0, scaleY: 0, opacity: 0 },
        { scaleX: 1, scaleY: 1, opacity: 1, duration: 0.8, stagger: 0.08 },
        0,
      )
        .fromTo(chrome, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, stagger: 0.1 }, 0.25)
        .fromTo(copy, { opacity: 0, y: 18 }, { opacity: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.35)
        .fromTo(rail, { opacity: 0, y: 16 }, { opacity: 1, y: 0, duration: 0.7, stagger: 0.08 }, 0.3)
        .set([...corners, ...chrome, ...copy, ...rail], { clearProps: 'transform' });
    });

    return () => mm.revert();
  }, [intro]);

  /* ---------- video plate zoom on first playing (poster + video, never the .hv root: keeps the control out of a transform) ---------- */
  const onPlayingChange = useCallback((playing: boolean) => {
    playingRef.current = playing;
    if (!playing || zoomedRef.current) return;
    zoomedRef.current = true;
    if (getMotionPrefs().reduced) return;
    const hv = hvRef.current;
    const ctx = fxCtxRef.current;
    if (!hv || !ctx) return;
    ctx.add(() => {
      const layers = gsap.utils.toArray<HTMLElement>('.hv-poster, .hv-video', hv);
      if (!layers.length) return;
      gsap.fromTo(
        layers,
        { scale: 1.06 },
        {
          scale: 1,
          duration: 2.4,
          ease: 'power3.out',
          overwrite: 'auto',
          onComplete: () => {
            gsap.set(layers, { clearProps: 'transform' });
          },
        },
      );
    });
  }, []);

  /* ---------- live readouts ---------- */
  useHudTelemetry({ root: sectionRef, videoRef, playingRef, duration: CLIP.duration });

  return (
    <section
      ref={sectionRef}
      className="hero hero-v"
      id="hero"
      data-chapter="hero"
      data-intro={intro ? 'live' : 'pending'}
    >
      <div className="hero-stage" data-cursor="reticle">
        <m.div
          className="hero-stage-in"
          style={active ? { scale: laminaScale, borderRadius: laminaRadius } : undefined}
        >
          <HudVideo
            clip="reforma"
            poster={CLIP.poster}
            priority
            objectPosition="50% 55%"
            pauseControl
            playAmount={0.05}
            plateStyle={active ? plateStyle : undefined}
            videoRef={videoRef}
            onReady={markHeroReady}
            onPlayingChange={onPlayingChange}
          />

          <div className="hero-scrim" aria-hidden="true" />

          {active && (
            <m.div className="hero-scan" aria-hidden="true" style={{ y: scanY, opacity: scanOpacity }} />
          )}

          <HudFrame style={active ? hudStyle : undefined} intro={intro} duration={CLIP.duration} />

          <m.div className="hero-copy" style={active ? { y: copyY, opacity: copyOpacity } : undefined}>
            <div className="hero-copy-main">
              <div className="kicker hero-in">
                <Scramble text="FLIGHT LOG · 2016 — 2026" enter={false} play={intro} duration={0.9} />
                <span className="slash">{'//'}</span>
                <span id="sessClock" className="tnum">
                  SESIÓN · 00:00:00
                </span>
              </div>

              <h1>
                <span className="h1-svc">
                  <Scramble
                    text="Fotografía y video aéreo con drone · CDMX"
                    enter={false}
                    play={intro}
                    duration={1.15}
                    revealDelay={0.15}
                  />
                </span>
                {H1_LINES.map((node, i) => (
                  <Fragment key={i}>
                    {i > 0 && <br />}
                    <m.span className={`reveal d${i + 1}`} style={active ? { y: lineYs[i] } : undefined}>
                      <SplitReveal
                        as="span"
                        mode="chars"
                        inView={intro}
                        delay={0.1 + i * 0.11}
                        stagger={0.022}
                        duration={1.15}
                      >
                        {node}
                      </SplitReveal>
                    </m.span>
                  </Fragment>
                ))}
              </h1>

              <SplitReveal as="p" mode="lines" className="hero-lead" inView={intro} delay={0.75} stagger={0.1}>
                Fotografía y video aéreo cinematográfico para arquitectura, eventos, paisaje e
                infraestructura. Diez años de vuelos en CDMX, el Valle y cualquier sitio que pida
                altura.
              </SplitReveal>

              <div className="hero-cta hero-in">
                <Magnetic as="span" strength={0.3} radius={70}>
                  <a href="#archive" className="btn btn-fill" data-cursor-text="Ver">
                    <HoverLetters text="Abrir archivo" />
                    <span className="arr" aria-hidden="true">
                      →
                    </span>
                  </a>
                </Magnetic>
                <Magnetic as="span" strength={0.3} radius={70}>
                  <Link href="/contact" className="btn btn-out" data-cursor-text="Contactar">
                    <HoverLetters text="Iniciar uplink" />
                    <span className="arr" aria-hidden="true">
                      ↗
                    </span>
                  </Link>
                </Magnetic>
              </div>

              {/* Cifras alineadas con STATS (constants.ts) y la bitácora del FAQ */}
              <div className="hero-foot hero-in">
                {METRICS.map((mtr) => (
                  <div key={mtr.label}>
                    {mtr.label}
                    <span className="v">
                      <Odometer value={mtr.value} pad={'pad' in mtr ? mtr.pad : 0} progress={odoProgress} />
                      {mtr.suffix}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <HeroRail intro={intro} style={active ? { y: railY } : undefined} />
          </m.div>

          {active && (
            <>
              <m.div className="lbx lbx--top" style={{ scaleY: barScale }} aria-hidden="true" />
              <m.div className="lbx lbx--bot" style={{ scaleY: barScale }} aria-hidden="true" />
            </>
          )}

          <m.div className="hero-frame" aria-hidden="true" style={active ? { opacity: frameOpacity } : undefined} />
          <m.span
            className="hero-lamina tnum"
            aria-hidden="true"
            style={active ? { opacity: stampOpacity, y: stampY } : undefined}
          >
            LÁMINA 01 · REFORMA · 19.4270°N
          </m.span>
        </m.div>
      </div>
    </section>
  );
}

export default HeroVideoSection;
