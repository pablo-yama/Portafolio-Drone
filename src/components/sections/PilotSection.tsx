'use client';

import { useEffect, useRef } from 'react';
import Image from 'next/image';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { m, useMotionValue, useSpring, useTransform, type MotionValue } from 'framer-motion';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import { useSectionProgress } from '@/hooks/useSectionProgress';
import { Scramble, SplitReveal } from '@/components/textfx';
import { Ruler } from '@/components/ui/Ruler';

gsap.registerPlugin(ScrollTrigger);

const EASE_EXPO = [0.16, 1, 0.3, 1] as const;

/* Copy verbatim from the previous AboutSection spec table. */
const SPECS = [
  ['Base', 'Polanco · CDMX'],
  ['Radio', 'CDMX · EDOMEX · Nacional'],
  ['Equipo', 'Mavic 3 Pro · DJI RS3'],
  ['Entrega', '3–5 días hábiles'],
  ['Disponibilidad', 'LUN–VIE · 08–19H'],
] as const;

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/**
 * One diorama layer: scroll parallax (±scroll px over the section's pass) plus
 * pointer parallax (depth px per half-width of pointer travel), both scaled by
 * `amp` (0 under reduced motion → static). Returns x/y motion values.
 */
function useLayerMotion(
  p: MotionValue<number>,
  sx: MotionValue<number>,
  sy: MotionValue<number>,
  amp: MotionValue<number>,
  scroll: number,
  depth: number,
) {
  const x = useTransform([sx, amp], ([px, a]: number[]) => px * depth * a);
  const y = useTransform(
    [p, sy, amp],
    ([pp, py, a]: number[]) => ((0.5 - pp) * 2 * scroll + py * depth) * a,
  );
  return { x, y };
}

/**
 * PilotSection — § 02 Piloto. Markup, classes and copy mirror the previous
 * AboutSection (section-head#about + .split + portrait diorama + spec-table).
 *
 * Motion: portrait layers parallax on SCROLL (useScroll on the split) and on
 * the POINTER (springs, fine pointer only); a scan line sweeps the portrait
 * scrubbed by progress; the photo reveals once with the documented clip-path
 * exception (+ scale 1.06 → 1); spec rows draw their hairlines and lift in;
 * the Ruler ticks dash-draw; H2/h3/paragraphs are SplitReveal; kicker, meta,
 * chip, coordinates and spec values Scramble in. Reduced motion: fades only,
 * no parallax, hairlines pre-drawn, scan line static.
 */
export function PilotSection() {
  const rootRef = useRef<HTMLDivElement>(null);
  const splitRef = useRef<HTMLElement>(null);
  const portraitRef = useRef<HTMLDivElement>(null);
  const { reduced, finePointer } = useMotionPrefs();

  /* scroll progress of the split (0 = entering at the bottom, 1 = gone at the top) */
  const p = useSectionProgress(splitRef);

  /* pointer parallax (-0.5 … 0.5), spring-lagged */
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 140, damping: 20, mass: 0.6 });
  const sy = useSpring(my, { stiffness: 140, damping: 20, mass: 0.6 });

  /* 1 = full motion, 0 = static (reduced motion). A motion value, not state. */
  const amp = useMotionValue(1);
  useEffect(() => {
    amp.set(reduced ? 0 : 1);
  }, [reduced, amp]);

  const bg = useLayerMotion(p, sx, sy, amp, 40, 8);
  const mid = useLayerMotion(p, sx, sy, amp, 80, 18);
  const photo = useLayerMotion(p, sx, sy, amp, 24, 12);
  const grid = useLayerMotion(p, sx, sy, amp, 120, 30);
  const chip = useLayerMotion(p, sx, sy, amp, 24, 10);
  const coords = useLayerMotion(p, sx, sy, amp, 60, 16);
  const rulerY = useTransform([p, amp], ([pp, a]: number[]) => (0.5 - pp) * 60 * a);
  /* scan line: sweeps the full portrait height while the split crosses the viewport */
  const scanY = useTransform([p, amp], ([pp, a]: number[]) => {
    if (a === 0) return '38%';
    const t = clamp01((pp - 0.08) / 0.84);
    return `${2 + t * 96}%`;
  });

  /* pointer parallax listeners — fine pointer, not reduced */
  useEffect(() => {
    const portrait = portraitRef.current;
    if (!portrait || !finePointer || reduced) {
      mx.set(0);
      my.set(0);
      return;
    }
    const onMove = (e: PointerEvent) => {
      const r = portrait.getBoundingClientRect();
      mx.set((e.clientX - r.left) / r.width - 0.5);
      my.set((e.clientY - r.top) / r.height - 0.5);
    };
    const onLeave = () => {
      mx.set(0);
      my.set(0);
    };
    portrait.addEventListener('pointermove', onMove);
    portrait.addEventListener('pointerleave', onLeave);
    return () => {
      portrait.removeEventListener('pointermove', onMove);
      portrait.removeEventListener('pointerleave', onLeave);
    };
  }, [finePointer, reduced, mx, my]);

  /* will-change on the layers only while the portrait is near the viewport */
  useEffect(() => {
    const portrait = portraitRef.current;
    if (!portrait) return;
    const io = new IntersectionObserver(
      (entries) => {
        portrait.dataset.active = entries.some((e) => e.isIntersecting) ? '1' : '0';
      },
      { rootMargin: '20% 0px' },
    );
    io.observe(portrait);
    return () => io.disconnect();
  }, []);

  /* once-reveal choreography (GSAP): photo clip, hairlines, rows, ruler */
  useEffect(() => {
    const root = rootRef.current;
    const split = splitRef.current;
    if (!root || !split) return;

    const mm = gsap.matchMedia();
    mm.add(
      { all: 'all', reduce: '(prefers-reduced-motion: reduce)' },
      (ctx) => {
        const { reduce } = ctx.conditions as { reduce: boolean };
        const clip = split.querySelector<HTMLElement>('.pilot-photo-clip');
        const hairs = gsap.utils.toArray<HTMLElement>('.pilot-hair', split);
        const rows = gsap.utils.toArray<HTMLElement>('.spec-table .r', split);
        const spine = split.querySelector<SVGLineElement>('.ruler-spine');
        const ticks = split.querySelector<SVGPathElement>('.ruler-ticks');
        if (!clip) return;

        const tl = gsap.timeline({ paused: true });
        if (reduce) {
          tl.fromTo(clip, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'power2.out' }, 0).fromTo(
            rows,
            { opacity: 0 },
            { opacity: 1, duration: 0.4, ease: 'power2.out', stagger: 0.06 },
            0,
          );
        } else {
          tl.fromTo(
            clip,
            { clipPath: 'inset(100% 0 0 0)', scale: 1.06 },
            {
              clipPath: 'inset(0% 0 0 0)',
              scale: 1,
              duration: 1.4,
              ease: 'power2.inOut',
              onStart: () => {
                clip.style.willChange = 'clip-path, transform';
              },
              onComplete: () => {
                clip.style.willChange = '';
              },
            },
            0,
          );
          if (spine) {
            tl.fromTo(
              spine,
              { scaleY: 0, transformOrigin: '50% 0%' },
              { scaleY: 1, duration: 0.8, ease: 'power3.inOut' },
              0.2,
            );
          }
          if (ticks) {
            tl.fromTo(
              ticks,
              { strokeDasharray: 1, strokeDashoffset: 1 },
              { strokeDashoffset: 0, duration: 1.2, ease: 'power3.out' },
              0.4,
            );
          }
          tl.fromTo(
            hairs,
            { scaleX: 0, transformOrigin: '0% 50%' },
            { scaleX: 1, duration: 0.9, ease: 'power3.out', stagger: 0.06 },
            0.35,
          ).fromTo(
            rows,
            { y: 12, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.8, ease: 'power3.out', stagger: 0.06 },
            0.35,
          );
        }

        const st = ScrollTrigger.create({
          trigger: split,
          start: 'top 75%',
          once: true,
          onEnter: () => tl.play(),
        });

        return () => {
          st.kill();
          tl.kill();
        };
      },
      root,
    );

    return () => mm.revert();
  }, []);

  /* small in-view rise for the chip / coordinates (inner span; the outer div parallaxes) */
  const rise = (delay: number) => ({
    initial: { opacity: 0, y: 8 },
    whileInView: { opacity: 1, y: 0 },
    viewport: { once: true, amount: 0.5 },
    transition: reduced ? { duration: 0.4 } : { delay, duration: 0.7, ease: EASE_EXPO },
  });

  return (
    <div className="pilot" data-chapter="pilot" ref={rootRef}>
      <div className="section-head" id="about">
        <div className="idx">
          <Scramble text="§ 02 / Piloto" />
        </div>
        <SplitReveal as="h2" mode="chars" stagger={0.018}>
          <span className="b">Pablo</span> Yamamoto <br />
          <em>— operador &amp; ojo.</em>
        </SplitReveal>
        <div className="meta">
          <Scramble text="10 años en vuelo" delay={0.1} />
          <br />
          <Scramble text="Base · Polanco, CDMX" delay={0.25} />
        </div>
      </div>

      <section className="split pilot-split" ref={splitRef}>
        <div className="split-img">
          <div className="portrait" ref={portraitRef}>
            <m.div className="layer l-bg" style={{ x: bg.x, y: bg.y }} />
            <m.div className="layer l-mid" style={{ x: mid.x, y: mid.y }} />
            <m.div className="layer l-photo" style={{ x: photo.x, y: photo.y }}>
              <div className="pilot-photo-clip">
                <Image
                  src="/img/Pablo.jpg"
                  alt="Pablo Yamamoto — piloto de drones en CDMX"
                  fill
                  sizes="(max-width: 768px) 100vw, 50vw"
                  style={{ objectFit: 'cover', objectPosition: 'center 30%', filter: 'grayscale(0.15) contrast(1.05)' }}
                />
              </div>
            </m.div>
            <m.div className="layer l-grid" style={{ x: grid.x, y: grid.y }} />
            <div className="layer l-scan" />
            <m.div className="pilot-scan" aria-hidden="true" style={{ y: scanY }}>
              <span className="pilot-scan-line" />
            </m.div>
            <m.div className="portrait-chip mono" style={{ x: chip.x, y: chip.y }}>
              <m.span className="pilot-in" {...rise(0.9)}>
                <span className="c">●</span> <Scramble text="PILOTO · ACTIVO" delay={1.0} />
              </m.span>
            </m.div>
            <m.div className="portrait-coords mono" style={{ x: coords.x, y: coords.y }}>
              <m.span className="pilot-in" {...rise(1.05)}>
                <Scramble text="19.4326°N · 99.1332°W" delay={1.15} />
              </m.span>
            </m.div>
          </div>
        </div>

        <div className="split-txt">
          <SplitReveal as="h3" mode="words" stagger={0.06}>
            El cielo <br />
            es el <em>estudio</em>.
          </SplitReveal>
          <SplitReveal as="p" mode="lines" delay={0.1}>
            Empecé en 2016 con un Phantom 3 y un mapa de azoteas. Diez años después,
            sigo midiendo cada vuelo por lo mismo: la toma que sólo existe arriba, la
            que rescata una historia que desde tierra no se ve.
          </SplitReveal>
          <SplitReveal as="p" mode="lines" delay={0.2}>
            Trabajo con desarrolladores, productoras, arquitectos y marcas que
            entienden que el <em>frame</em> es tan importante como el lente. Cada
            proyecto arranca con una conversación corta sobre la intención y termina
            con archivos listos para editorial, impresión o redes.
          </SplitReveal>
          <SplitReveal as="p" mode="lines" delay={0.3}>
            Si vienes a pedir cielo, llegaste al lugar correcto.
          </SplitReveal>

          <div className="spec-table">
            {SPECS.map(([k, v], i) => (
              <div className="r" key={k}>
                <span className="k">{k}</span>
                <Scramble as="span" className="v" text={v} delay={0.3 + i * 0.08} duration={0.7} />
                <span className="pilot-hair" aria-hidden="true" />
              </div>
            ))}
          </div>
        </div>

        <m.div className="pilot-ruler" aria-hidden="true" style={{ y: rulerY }}>
          <Ruler height={160} />
        </m.div>
      </section>
    </div>
  );
}
