'use client';

import {
  easeInOut,
  m,
  transform,
  useInView,
  useMotionValue,
  useMotionValueEvent,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
  type MotionStyle,
} from 'framer-motion';
import { Fragment, useEffect, useRef, useState } from 'react';
import { HudVideo } from '@/components/media/HudVideo';
import { MaskLines } from '@/components/motion/MaskLines';
import { Scramble, SplitReveal } from '@/components/textfx';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { SECTION_OFFSETS, useSectionProgress } from '@/hooks/useSectionProgress';
import { HERO_CLIPS } from '@/hooks/useVideoSource';

/**
 * ShowreelSection — "Ventana 02": the Bosques de las Lomas golden-hour
 * hyperlapse as a 56vw card that grows to full-bleed on a sticky stage.
 *
 * Desktop ≥1024 (not reduced): the section is 220svh with a 100svh sticky
 * stage. Everything is scrubbed from the section's RAW scroll progress
 * (no spring — Lenis already smooths): card scale → full cover (measured by
 * a ResizeObserver into a motion value), inner counter-zoom on the video
 * plate, letterbox bars collapsing, stamp / corner brackets fading, a
 * timecode + progress rail running through the pin, an oversized caption
 * layer drifting behind the card at its own rate (velocity skew on fine
 * pointers), the title split into chars and revealed in the last third of
 * the pin over a bottom scrim, and the whole stage dimming as Piloto arrives.
 *
 * <1024: static block — card 100% wide with a 0.94 → 1 entrance, stamp above
 * the card, title below it (MaskLines in view).
 * Reduced motion: static block, poster + "▶ Reproducir" (HudVideo), title as
 * an opacity fade, rail full.
 *
 * Transform/opacity only. `will-change` is applied to the card only while the
 * grow range is being scrubbed. Layout (sticky vs. static) is CSS-driven so
 * SSR and hydration paint the right layout; JS only decides which driver
 * animates it once `useMotionPrefs` has resolved.
 */

const CLIP = HERO_CLIPS.bosques;
const FPS = 30;

/* Section = 220svh, stage = 100svh sticky, progress measured over
   ['start end', 'end start'] (320svh of travel):
   the stage docks at p ≈ 0.31 and releases at p ≈ 0.69. */
const R = {
  enter: [0.06, 0.3],
  grow: [0.33, 0.55],
  stamp: [0.36, 0.48],
  corners: [0.4, 0.52],
  bars: [0.42, 0.55],
  scrim: [0.46, 0.58],
  title: [0.56, 0.7],
  sub: [0.64, 0.72],
  tc: [0.31, 0.69],
  exit: [0.86, 1],
} satisfies Record<string, [number, number]>;

const EXPO = [0.16, 1, 0.3, 1] as const;

const STAMP =
  'VENTANA 02 · BOSQUES DE LAS LOMAS · HORA DORADA · 19.39°N 99.26°W · 4K 30P · 00:10';
const CAPTION = ['HORA DORADA', 'BOSQUES DE LAS LOMAS', '19.39°N', '99.26°W', 'VENTANA 02'];
const CORNERS = ['tl', 'tr', 'bl', 'br'] as const;
const TITLE_L1 = 'Diez años mirando';
const SUB = 'Hyperlapse · Bosques de las Lomas · hora dorada';

type ReelMode = 'ssr' | 'static' | 'flow' | 'scrub';

const pad2 = (n: number) => (n < 10 ? `0${n}` : `${n}`);

/** 0 → duration seconds as a 00:SS:FF timecode (30p). */
const formatTimecode = (t: number): string => {
  const clamped = Math.min(Math.max(t, 0), CLIP.duration);
  const s = Math.floor(clamped);
  const f = Math.floor((clamped - s) * FPS);
  return `00:${pad2(s)}:${pad2(f)}`;
};

const VELOCITY_IN: [number, number] = [-2500, 2500];
const SKEW_OUT: [number, number] = [4, -4];

export function ShowreelSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const tcRef = useRef<HTMLSpanElement>(null);
  const scrubbingRef = useRef(false);
  const gateRef = useRef({ visible: false, skew: false, scrub: false });

  const { reduced, desktop, finePointer, resolved } = useMotionPrefs();
  const mode: ReelMode = !resolved ? 'ssr' : reduced ? 'static' : desktop ? 'scrub' : 'flow';
  const scrub = mode === 'scrub';

  const [playing, setPlaying] = useState(false);
  const seen = useInView(cardRef, { once: true, amount: 0.35 });

  /* ---- drivers ---------------------------------------------------------- */
  const p = useSectionProgress(sectionRef, SECTION_OFFSETS.through);
  const pEnter = useSectionProgress(sectionRef, SECTION_OFFSETS.enter);
  const fullScale = useMotionValue(1.6);

  const cardScale = useTransform([p, fullScale], ([v, fs]: number[]) =>
    v < R.grow[0]
      ? transform(v, R.enter, [0.94, 1])
      : transform(v, R.grow, [1, fs], { ease: easeInOut }),
  );
  const innerScale = useTransform(p, R.grow, [1.18, 1]);
  const barScale = useTransform(p, R.bars, [1, 0]);
  const cornersOpacity = useTransform(p, R.corners, [1, 0]);
  const stampOpacity = useTransform(p, R.stamp, [1, 0]);
  const scrimOpacity = useTransform(p, R.scrim, [0, 1]);
  const subOpacity = useTransform(p, R.sub, [0, 1]);
  const subY = useTransform(p, R.sub, [18, 0]);
  const stageOpacity = useTransform(p, R.exit, [1, 0.3]);
  const railDesktop = useTransform(p, R.tc, [0, 1]);
  const mobileScale = useTransform(pEnter, [0, 1], [0.94, 1]);
  const captionX = useTransform(p, [0, 1], ['6vw', '-42vw']);
  const captionOpacity = useTransform(p, [0.04, 0.16, 0.84, 1], [0, 0.12, 0.12, 0]);

  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);
  const skewRaw = useTransform(velocity, (v) => {
    const g = gateRef.current;
    if (!g.visible || !g.skew || !g.scrub) return 0;
    const t =
      (Math.min(Math.max(v, VELOCITY_IN[0]), VELOCITY_IN[1]) - VELOCITY_IN[0]) /
      (VELOCITY_IN[1] - VELOCITY_IN[0]);
    return SKEW_OUT[0] + (SKEW_OUT[1] - SKEW_OUT[0]) * t;
  });
  const captionSkew = useSpring(skewRaw, { stiffness: 200, damping: 30, mass: 0.5 });

  const railDriver = scrub ? railDesktop : pEnter;

  /* ---- gates ------------------------------------------------------------ */
  useEffect(() => {
    gateRef.current.skew = finePointer && !reduced;
    gateRef.current.scrub = scrub;
  }, [finePointer, reduced, scrub]);

  useEffect(() => {
    const el = sectionRef.current;
    if (!el || typeof IntersectionObserver === 'undefined') return;
    const io = new IntersectionObserver(
      (entries) => {
        gateRef.current.visible = entries.some((e) => e.isIntersecting);
      },
      { rootMargin: '20% 0px' },
    );
    io.observe(el);
    return () => io.disconnect();
  }, []);

  /* ---- full-cover scale: max(stageW / cardW, stageH / cardH) ------------ */
  useEffect(() => {
    const card = cardRef.current;
    const stage = stageRef.current;
    if (!card || !stage) return;
    const measure = () => {
      const w = card.offsetWidth;
      const h = card.offsetHeight;
      const sw = stage.clientWidth;
      const sh = stage.clientHeight;
      if (!w || !h || !sw || !sh) return;
      /* 2% overscan hides sub-pixel seams at the viewport edges. */
      fullScale.set(Math.max(sw / w, sh / h) * 1.02);
    };
    measure();
    if (typeof ResizeObserver === 'undefined') {
      window.addEventListener('resize', measure);
      return () => window.removeEventListener('resize', measure);
    }
    const ro = new ResizeObserver(measure);
    ro.observe(card);
    ro.observe(stage);
    return () => ro.disconnect();
  }, [fullScale]);

  /* ---- will-change only while the grow range is scrubbed ---------------- */
  useMotionValueEvent(p, 'change', (v) => {
    const card = cardRef.current;
    if (!card) return;
    const on = gateRef.current.scrub && v > R.enter[0] && v < R.grow[1] + 0.05;
    if (on === scrubbingRef.current) return;
    scrubbingRef.current = on;
    card.classList.toggle('is-scrubbing', on);
  });

  /* ---- timecode readout (DOM write, no state) --------------------------- */
  useMotionValueEvent(railDriver, 'change', (r) => {
    const el = tcRef.current;
    if (el) el.textContent = formatTimecode(r * CLIP.duration);
  });

  useEffect(() => {
    if (mode !== 'static') return;
    const el = tcRef.current;
    if (el) el.textContent = formatTimecode(CLIP.duration);
  }, [mode]);

  /* ---- styles per mode -------------------------------------------------- */
  const cardStyle: MotionStyle | undefined =
    mode === 'scrub'
      ? ({ scale: cardScale, '--reel-k': cardScale } as MotionStyle)
      : mode === 'flow'
        ? { scale: mobileScale }
        : undefined;
  const hiddenCorner = reduced ? { opacity: 0 } : { opacity: 0, scale: 0.4 };
  const titleL2 = (
    <>
      la ciudad desde <em className="u">arriba</em>.
    </>
  );

  return (
    <section
      ref={sectionRef}
      className="reel-v"
      data-chapter="showreel"
      data-reel={mode}
      aria-label="Ventana de luz · hyperlapse Bosques de las Lomas"
    >
      <m.div
        ref={stageRef}
        className="reel-stage"
        data-cursor="reticle"
        style={scrub ? { opacity: stageOpacity } : undefined}
      >
        {/* Parallax caption layer — drifts behind the card at its own rate */}
        <m.div
          className="reel-caption"
          aria-hidden="true"
          style={
            scrub
              ? { x: captionX, y: '-50%', skewX: captionSkew, opacity: captionOpacity }
              : { y: '-50%' }
          }
        >
          <span className="reel-caption-copy">
            {CAPTION.map((seg, i) => (
              <Fragment key={seg}>
                <span className={i % 2 ? 'reel-caption-seg is-outline' : 'reel-caption-seg'}>
                  {seg}
                </span>
                <span className="reel-caption-dot">·</span>
              </Fragment>
            ))}
          </span>
        </m.div>

        {/* The card: plate (video + letterbox bars) + corners + stamp */}
        <m.div ref={cardRef} className="reel-card" style={cardStyle}>
          <div className="reel-plate">
            <HudVideo
              clip="bosques"
              poster={CLIP.poster}
              lazyRootMargin="150% 0px"
              playAmount={0.4}
              pauseControl
              objectPosition="50% 45%"
              plateStyle={scrub ? { scale: innerScale } : undefined}
              onPlayingChange={setPlaying}
              className="reel-hv"
            />
            <m.span
              className="reel-bar reel-bar--top"
              aria-hidden="true"
              style={scrub ? { scaleY: barScale } : undefined}
            />
            <m.span
              className="reel-bar reel-bar--bottom"
              aria-hidden="true"
              style={scrub ? { scaleY: barScale } : undefined}
            />
          </div>

          <m.span
            className="reel-corners"
            aria-hidden="true"
            style={scrub ? { opacity: cornersOpacity } : undefined}
          >
            {CORNERS.map((pos, i) => (
              <m.span
                key={pos}
                className={`reel-corner reel-corner--${pos}`}
                initial={hiddenCorner}
                animate={seen ? { opacity: 1, scale: 1 } : hiddenCorner}
                transition={{ duration: 0.7, ease: EXPO, delay: 0.15 + i * 0.09 }}
              />
            ))}
          </m.span>

          <m.div className="reel-stamp" style={scrub ? { opacity: stampOpacity } : undefined}>
            <Scramble text={STAMP} duration={1.1} speed={0.5} />
          </m.div>
        </m.div>

        {/* Timecode + progress rail: runs through the pin (or the entrance on mobile) */}
        <m.div
          className="reel-meta tnum"
          aria-hidden="true"
          initial={{ opacity: 0 }}
          animate={{ opacity: seen ? 1 : 0 }}
          transition={{ duration: 0.8, delay: 0.5, ease: 'linear' }}
        >
          <span className="reel-tc">
            <span className="reel-tc-k">TC</span>{' '}
            <span ref={tcRef} className="reel-tc-v">
              00:00:00
            </span>
          </span>
          <span className="reel-rail">
            <m.span
              className="reel-rail-fill"
              style={mode === 'static' || mode === 'ssr' ? undefined : { scaleX: railDriver }}
            />
          </span>
          <span className="reel-dur">00:10:00 · 4K 30P</span>
          <span className="reel-rec" data-on={playing ? '1' : '0'}>
            REC
          </span>
        </m.div>

        {/* Bottom scrim so the headline keeps ≥4.5:1 over the golden-hour frame */}
        <m.div
          className="reel-scrim"
          aria-hidden="true"
          style={scrub ? { opacity: scrimOpacity } : undefined}
        />

        <div className="reel-title">
          {scrub ? (
            <SplitReveal
              key="scrub"
              as="p"
              mode="chars"
              className="reel-h"
              progress={p}
              range={R.title}
              stagger={0.012}
              duration={0.8}
            >
              {TITLE_L1}
              <br />
              {titleL2}
            </SplitReveal>
          ) : (
            <MaskLines
              key="view"
              as="p"
              className="reel-h"
              lines={[TITLE_L1, titleL2]}
              stagger={0.1}
              amount={0.3}
            />
          )}
          {scrub ? (
            <m.p className="reel-sub" style={{ opacity: subOpacity, y: subY }}>
              {SUB}
            </m.p>
          ) : (
            <m.p
              className="reel-sub"
              initial={{ opacity: 0, y: reduced ? 0 : 14 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.6 }}
              transition={{ duration: 0.8, delay: 0.35, ease: EXPO }}
            >
              {SUB}
            </m.p>
          )}
        </div>
      </m.div>
    </section>
  );
}
