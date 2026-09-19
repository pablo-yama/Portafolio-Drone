'use client';

import { memo, useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { DrawSVGPlugin } from 'gsap/DrawSVGPlugin';
import { Scramble, SplitReveal } from '@/components/textfx';
import { MethodRuler } from '@/components/method/MethodRuler';
import { PhaseGlyph, type PhaseGlyphKind } from '@/components/method/PhaseGlyph';

gsap.registerPlugin(ScrollTrigger, DrawSVGPlugin);

/* Copy verbatim from MethodSection.tsx — do not edit. */
const STEPS = [
  {
    t: '01 · Briefing',
    h: 'Entendemos la visión',
    p: 'Objetivos, referencias, storyboard y entregables. Definimos la estrategia aérea del proyecto.',
  },
  {
    t: '02 · Plan de vuelo',
    h: 'Ruta & logística',
    p: 'Trazado de trayectorias, logística de equipo y coordinación con la ventana de luz óptima.',
  },
  {
    t: '03 · Captura',
    h: 'Vuelo ejecutado',
    p: 'Operación con precisión cinematográfica. Cada toma compuesta con intención narrativa.',
  },
  {
    t: '04 · Post',
    h: 'Edición + color',
    p: 'Selección, grading cinematográfico y masterización 4K. Versiones cortas para redes.',
  },
  {
    t: '05 · Entrega',
    h: 'Archivos finales',
    p: 'Formatos listos para cine, web, redes sociales o impresión a gran formato.',
  },
] as const;

const COUNT = STEPS.length;
const LAST = COUNT - 1;
const GLYPHS: PhaseGlyphKind[] = ['reticle', 'route', 'shutter', 'curve', 'package'];
const PHASE_NAMES = STEPS.map((s) => s.t.slice(s.t.indexOf('·') + 1).trim());
const pad2 = (n: number) => String(n).padStart(2, '0');

/* ---------- one panel ----------------------------------------------------- */
interface MethodPanelProps {
  i: number;
  entered: boolean;
}

const MethodPanel = memo(function MethodPanel({ i, entered }: MethodPanelProps) {
  const s = STEPS[i];
  return (
    <article className="mf-panel" data-idx={i} aria-labelledby={`mf-h-${i}`}>
      <span className="mf-grid" aria-hidden="true" />
      <span className="mf-num" aria-hidden="true">
        {pad2(i + 1)}
      </span>

      <div className="mf-copy">
        <span className="mf-kicker">
          <Scramble text={s.t} enter={false} play={entered} duration={0.7} />
        </span>
        <SplitReveal as="h3" mode="chars" id={`mf-h-${i}`} className="mf-h3" inView={entered} stagger={0.02}>
          {s.h}
        </SplitReveal>
        <SplitReveal as="p" mode="lines" className="mf-p" inView={entered} delay={0.18}>
          {s.p}
        </SplitReveal>
      </div>

      <div className="mf-glyph" aria-hidden="true">
        <PhaseGlyph kind={GLYPHS[i]} size={96} />
      </div>

      <span className="mf-wp" aria-hidden="true" />
    </article>
  );
});

/* ---------- section ------------------------------------------------------- */

/**
 * MethodFlightSection — § 03 Método as a pinned lateral flight.
 *
 * Desktop ≥1024 & no reduced motion (gsap.matchMedia): the `.mf-pin` stage
 * pins for the width of the five panels (scrub .8, snap 1/4); the ruler fill,
 * caret, counter, waypoints and a drone dot travelling a dotted route across
 * the whole track are written from one onUpdate; each panel carries its own
 * containerAnimation parallax (numeral xPercent −20→20, hairline grid drift,
 * copy y, glyph rotate) and reveals (SplitReveal / Scramble / DrawSVG) as it
 * flies in. Below 1024 or reduced: no pin — a vertical list with a left rail
 * whose fill is scrubbed (static under reduced motion) and per-panel reveals.
 * Everything lives inside the matchMedia context and reverts on unmount.
 */
export function MethodFlightSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const pinRef = useRef<HTMLDivElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const rulerRef = useRef<HTMLDivElement>(null);
  const fillRef = useRef<HTMLSpanElement>(null);
  const caretRef = useRef<HTMLDivElement>(null);
  const routeRef = useRef<SVGPathElement>(null);
  const flownRef = useRef<SVGPathElement>(null);
  const droneRef = useRef<HTMLDivElement>(null);
  const hintRef = useRef<HTMLParagraphElement>(null);
  const vfillRef = useRef<HTMLSpanElement>(null);

  const [idx, setIdx] = useState(0);
  const [entered, setEntered] = useState<boolean[]>(() => STEPS.map(() => false));

  useEffect(() => {
    const section = sectionRef.current;
    const pin = pinRef.current;
    const track = trackRef.current;
    if (!section || !pin || !track) return;

    const panels = gsap.utils.toArray<HTMLElement>('.mf-panel', track);
    const wps = panels.map((p) => p.querySelector<HTMLElement>('.mf-wp'));
    const glyphPaths = panels.map((p) => p.querySelectorAll<SVGElement>('.mf-glyph [data-draw]'));

    const mm = gsap.matchMedia(section);

    mm.add(
      { all: 'all', desktop: '(min-width: 1024px)', reduce: '(prefers-reduced-motion: reduce)' },
      (ctx) => {
        const { desktop, reduce } = ctx.conditions as { desktop: boolean; reduce: boolean };
        const drawn = new Set<number>();

        /* Panel i comes alive: text reveals (state → SplitReveal/Scramble) + glyph draw. */
        const reveal = (i: number) => {
          setEntered((prev) => (prev[i] ? prev : prev.map((v, j) => (j === i ? true : v))));
          if (drawn.has(i)) return;
          drawn.add(i);
          const paths = glyphPaths[i];
          if (reduce || !paths.length) return;
          ctx.add(() => {
            gsap.to(paths, {
              drawSVG: '0% 100%',
              duration: 1.3,
              ease: 'power2.inOut',
              stagger: 0.09,
              delay: 0.15,
            });
          });
        };

        if (!reduce) glyphPaths.forEach((paths) => paths.length && gsap.set(paths, { drawSVG: 0 }));

        /* ================= horizontal flight ================= */
        if (desktop && !reduce) {
          const fill = fillRef.current;
          const caret = caretRef.current;
          const ruler = rulerRef.current;
          const route = routeRef.current;
          const flown = flownRef.current;
          const drone = droneRef.current;
          const hint = hintRef.current;

          const dist = () => Math.max(0, track.scrollWidth - window.innerWidth);
          const setFill = fill ? gsap.quickSetter(fill, 'scaleX') : null;
          const setCaret = caret ? gsap.quickSetter(caret, 'x', 'px') : null;
          const setDx = drone ? gsap.quickSetter(drone, 'x', 'px') : null;
          const setDy = drone ? gsap.quickSetter(drone, 'y', 'px') : null;
          const setDr = drone ? gsap.quickSetter(drone, 'rotation', 'deg') : null;

          /* Route geometry (track px). Rebuilt on every ScrollTrigger refresh. */
          const geo = { rulerW: 0, total: 0, cum: [0, 0, 0, 0, 0] };
          const build = () => {
            geo.rulerW = ruler ? ruler.clientWidth : 0;
            if (!route || !flown) return;
            const tr = track.getBoundingClientRect();
            const pts = wps.map((w, k) => {
              const r = (w ?? panels[k]).getBoundingClientRect();
              return { x: r.left - tr.left + r.width / 2, y: r.top - tr.top + r.height / 2 };
            });
            const lead = { x: -80, y: pts[0].y + 36 };
            const tail = { x: tr.width + 80, y: pts[LAST].y - 30 };
            const seg = (a: { x: number; y: number }, b: { x: number; y: number }) => {
              const dx = (b.x - a.x) * 0.5;
              return ` C ${(a.x + dx).toFixed(1)} ${a.y.toFixed(1)}, ${(b.x - dx).toFixed(1)} ${b.y.toFixed(1)}, ${b.x.toFixed(1)} ${b.y.toFixed(1)}`;
            };
            let d = `M ${lead.x} ${lead.y}`;
            d += seg(lead, pts[0]);
            const cum: number[] = [];
            /* prefix lengths so the drone sits exactly on waypoint k at p = k/4 */
            flown.setAttribute('d', d);
            cum.push(flown.getTotalLength());
            for (let k = 1; k < COUNT; k++) {
              d += seg(pts[k - 1], pts[k]);
              flown.setAttribute('d', d);
              cum.push(flown.getTotalLength());
            }
            d += seg(pts[LAST], tail);
            route.setAttribute('d', d);
            flown.setAttribute('d', d);
            geo.total = flown.getTotalLength();
            geo.cum = cum;
            flown.style.strokeDasharray = `${geo.total}`;
            flown.style.strokeDashoffset = `${geo.total}`;
          };

          let lastIdx = -1;
          let lastFlip = '';
          let lastHint = '';
          const apply = (p: number) => {
            setFill?.(p);
            setCaret?.(p * geo.rulerW);

            const i = Math.min(LAST, Math.round(p * LAST));
            if (i !== lastIdx) {
              lastIdx = i;
              setIdx(i);
            }
            const flip = p > 0.72 ? '1' : '0';
            if (flip !== lastFlip && caret) {
              lastFlip = flip;
              caret.dataset.flip = flip;
            }
            const gone = p > 0.05 ? '1' : '0';
            if (gone !== lastHint && hint) {
              lastHint = gone;
              hint.dataset.gone = gone;
            }
            wps.forEach((w, k) => w?.classList.toggle('is-on', p >= k / LAST - 0.02));

            if (route && flown && geo.total > 0) {
              const k = Math.min(LAST - 1, Math.floor(p * LAST));
              const t = p * LAST - k;
              const len = geo.cum[k] + t * (geo.cum[k + 1] - geo.cum[k]);
              const pt = route.getPointAtLength(len);
              const ahead = route.getPointAtLength(Math.min(geo.total, len + 6));
              setDx?.(pt.x);
              setDy?.(pt.y);
              setDr?.((Math.atan2(ahead.y - pt.y, ahead.x - pt.x) * 180) / Math.PI);
              flown.style.strokeDashoffset = `${geo.total - len}`;
            }
          };

          const tween = gsap.to(track, {
            x: () => -dist(),
            ease: 'none',
            scrollTrigger: {
              trigger: pin,
              start: 'top top',
              end: () => '+=' + dist(),
              pin: true,
              scrub: 0.8,
              invalidateOnRefresh: true,
              anticipatePin: 1,
              snap: {
                snapTo: 1 / LAST,
                duration: { min: 0.2, max: 0.6 },
                delay: 0.08,
                ease: 'power2.inOut',
              },
              onUpdate: (self) => apply(self.progress),
              onRefresh: (self) => {
                build();
                apply(self.progress);
              },
              onToggle: (self) => {
                track.classList.toggle('is-pinned', self.isActive);
                pin.dataset.pinned = self.isActive ? '1' : '0';
              },
            },
          });

          /* per-panel parallax + reveals, all relative to the container flight */
          panels.forEach((panel, i) => {
            const num = panel.querySelector('.mf-num');
            const grid = panel.querySelector('.mf-grid');
            const copy = panel.querySelector('.mf-copy');
            const glyph = panel.querySelector('.mf-glyph');
            const tl = gsap.timeline({
              scrollTrigger: {
                trigger: panel,
                containerAnimation: tween,
                start: 'left right',
                end: i === LAST ? 'left left' : 'right left',
                scrub: true,
              },
            });
            if (num) tl.fromTo(num, { xPercent: -20 }, { xPercent: 20, ease: 'none' }, 0);
            if (grid) tl.fromTo(grid, { xPercent: -6, yPercent: 2 }, { xPercent: 6, yPercent: -2, ease: 'none' }, 0);
            if (copy) tl.fromTo(copy, { y: 48 }, { y: -48, ease: 'none' }, 0);
            if (glyph) tl.fromTo(glyph, { rotation: -16, y: 36 }, { rotation: 16, y: -36, ease: 'none' }, 0);

            if (i > 0) {
              ScrollTrigger.create({
                trigger: panel,
                containerAnimation: tween,
                start: 'left 62%',
                once: true,
                onEnter: () => reveal(i),
              });
            }
          });
          /* the first panel is on stage from the start: reveal when the stage itself arrives */
          ScrollTrigger.create({ trigger: pin, start: 'top 70%', once: true, onEnter: () => reveal(0) });

          return;
        }

        /* ================= vertical fallback ================= */
        panels.forEach((panel, i) => {
          ScrollTrigger.create({
            trigger: panel,
            start: 'top 80%',
            once: true,
            onEnter: () => {
              panel.classList.add('in');
              wps[i]?.classList.add('is-on');
              reveal(i);
            },
          });
        });
        const vfill = vfillRef.current;
        if (vfill && !reduce) {
          gsap.fromTo(
            vfill,
            { scaleY: 0 },
            {
              scaleY: 1,
              ease: 'none',
              scrollTrigger: { trigger: track, start: 'top 65%', end: 'bottom 65%', scrub: true },
            },
          );
        }
      },
    );

    /* Layout changes (fonts, image, split reflow) → debounced refresh so the pin distance never goes stale. */
    let timer: number | undefined;
    const ro = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(() => ScrollTrigger.refresh(), 150);
    });
    ro.observe(track);

    return () => {
      ro.disconnect();
      window.clearTimeout(timer);
      mm.revert();
    };
  }, []);

  return (
    <section
      id="method"
      className="mf"
      data-chapter="method"
      ref={sectionRef}
      aria-labelledby="mf-title"
    >
      <div className="mf-head">
        <div className="mf-head-l">
          <span className="folio mf-folio">
            <Scramble text="§ 03 / Método" duration={0.9} />
          </span>
          <SplitReveal as="h2" mode="words" id="mf-title" className="mf-h2">
            De la idea al <span className="b">cielo —</span> cinco fases.
          </SplitReveal>
        </div>
        <div className="mf-head-r">
          <span className="mf-meta">
            <Scramble text="05 fases" duration={0.6} />
            <br />
            <Scramble text="Brief → Entrega" duration={0.8} delay={0.15} />
          </span>
        </div>
      </div>

      <div className="mf-pin" ref={pinRef} data-pinned="0">
        <MethodRuler
          phase={PHASE_NAMES[idx]}
          idx={idx}
          rootRef={rulerRef}
          fillRef={fillRef}
          caretRef={caretRef}
        />

        <div className="mf-track" ref={trackRef}>
          <span className="mf-vrail" aria-hidden="true">
            <span className="mf-vrail-fill" ref={vfillRef} />
          </span>

          <svg className="mf-route" aria-hidden="true" focusable="false">
            <path className="mf-route-dots" ref={routeRef} />
            <path className="mf-route-flown" ref={flownRef} />
          </svg>

          {STEPS.map((_, i) => (
            <MethodPanel key={i} i={i} entered={entered[i]} />
          ))}

          <div className="mf-drone" ref={droneRef} aria-hidden="true">
            <span className="mf-drone-ring" />
            <span className="mf-drone-dot" />
            <span className="mf-drone-heading" />
          </div>
        </div>

        <div className="mf-hud" aria-hidden="true">
          <span className="mf-counter tnum">
            <Scramble text={pad2(idx + 1)} enter={false} duration={0.5} />
            <span className="mf-counter-sep"> / </span>
            {pad2(COUNT)}
          </span>
          <p className="mf-hint" ref={hintRef} data-gone="0">
            Desplázate para avanzar →
          </p>
          <span className="mf-hud-phase">
            <Scramble text={PHASE_NAMES[idx]} enter={false} duration={0.5} />
          </span>
        </div>
      </div>
    </section>
  );
}
