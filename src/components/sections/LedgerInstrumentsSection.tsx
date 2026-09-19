'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { m, useTransform } from 'framer-motion';
import { DotGrid } from '@/components/backgrounds/DotGrid';
import { CategoryRing } from '@/components/charts/CategoryRing';
import { LocationDots } from '@/components/charts/LocationDots';
import { YearBars } from '@/components/charts/YearBars';
import { useLiveGate } from '@/components/charts/chartTheme';
import { Odometer, Scramble, SplitReveal } from '@/components/textfx';
import { SECTION_OFFSETS, useSectionProgress } from '@/hooks/useSectionProgress';
import { TOTAL_PIECES, YEAR_RANGE } from '@/lib/archiveStats';

gsap.registerPlugin(ScrollTrigger);

interface LedgerCard {
  k: string;
  count: number;
  unit: string;
  note: string;
}

/* Verbatim from the previous LedgerSection (aligned with STATS). */
const CARDS: LedgerCard[] = [
  { k: 'Proyectos realizados', count: 10, unit: '+', note: 'Registro 2016 — hoy' },
  { k: 'Clientes', count: 10, unit: '·', note: 'Agencias, devs, marcas' },
  { k: 'Años de operación', count: 10, unit: '·', note: 'Cero incidentes' },
  { k: 'Horas de vuelo', count: 300, unit: 'h', note: 'Documentadas en bitácora' },
];

const pad2 = (n: number) => String(n).padStart(2, '0');

/**
 * LedgerInstrumentsSection — "Bitácora en números." (#ledger, chapter ledger).
 *
 * Row 1: the four operational counters as scroll-scrubbed Odometers inside
 * the existing `.led` cards — 3D tilt via gsap.quickTo (rotateX/rotateY) with
 * the spotlight (--mx/--my) and a specular sheen written in the same pointer
 * handler (no state). Row 2: three instruments fed by the real archive —
 * YearBars, CategoryRing, LocationDots — each SSR'd in its final state and
 * drawn by its own scroll progress (SECTION_OFFSETS.draw), then held.
 * Section progress also parallaxes the H2. A cursor-following DotGrid sits
 * behind everything. Reduced motion: fades only, charts static, no tilt.
 */
export function LedgerInstrumentsSection() {
  const sectionRef = useRef<HTMLElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  const p = useSectionProgress(sectionRef, SECTION_OFFSETS.draw);
  const live = useLiveGate();
  const headY = useTransform([p, live], ([pp, l]: number[]) => (l ? pp * -36 : 0));
  const readoutY = useTransform([p, live], ([pp, l]: number[]) => (l ? pp * -14 : 0));

  /* entrances (once) + card tilt / spotlight (fine pointer, not reduced) */
  useEffect(() => {
    const root = sectionRef.current;
    const grid = gridRef.current;
    if (!root || !grid) return;

    const mm = gsap.matchMedia(root);
    mm.add(
      { fine: '(pointer: fine)', reduce: '(prefers-reduced-motion: reduce)' },
      (ctx) => {
        const { fine, reduce } = ctx.conditions as { fine: boolean; reduce: boolean };
        const cards = gsap.utils.toArray<HTMLElement>('.led', grid);
        const figs = gsap.utils.toArray<HTMLElement>('.inst', root);
        const hairs = gsap.utils.toArray<HTMLElement>('.inst-hair', root);
        const foot = root.querySelector<HTMLElement>('.inst-foot');

        if (reduce) {
          gsap.fromTo(
            [...cards, ...figs, ...(foot ? [foot] : [])],
            { opacity: 0 },
            {
              opacity: 1,
              duration: 0.5,
              stagger: 0.05,
              ease: 'power2.out',
              scrollTrigger: { trigger: grid, start: 'top 88%', once: true },
              onComplete: () => {
                grid.dataset.ready = '1';
              },
            },
          );
        } else {
          gsap.fromTo(
            cards,
            { y: 40, opacity: 0, rotateX: -14, transformPerspective: 1400 },
            {
              y: 0,
              opacity: 1,
              rotateX: 0,
              duration: 1.2,
              ease: 'power4.out',
              stagger: 0.09,
              scrollTrigger: { trigger: grid, start: 'top 82%', once: true },
              onComplete: () => {
                grid.dataset.ready = '1';
              },
            },
          );

          const tl = gsap.timeline({
            scrollTrigger: { trigger: figs[0] ?? root, start: 'top 85%', once: true },
          });
          tl.fromTo(
            figs,
            { y: 28, opacity: 0 },
            { y: 0, opacity: 1, duration: 1, ease: 'power4.out', stagger: 0.1 },
            0,
          ).fromTo(
            hairs,
            { scaleX: 0, transformOrigin: '0% 50%' },
            { scaleX: 1, duration: 0.9, ease: 'power3.out', stagger: 0.1 },
            0.15,
          );
          if (foot) {
            tl.fromTo(foot, { opacity: 0, y: 8 }, { opacity: 1, y: 0, duration: 0.6, ease: 'power3.out' }, 0.55);
          }
        }

        if (!fine || reduce) return;

        /* 3D tilt + spotlight: quickTo on rotateX/rotateY, --mx/--my in the same handler */
        const offs = cards.map((card) => {
          const rx = gsap.quickTo(card, 'rotateX', { duration: 0.5, ease: 'power3' });
          const ry = gsap.quickTo(card, 'rotateY', { duration: 0.5, ease: 'power3' });
          const onMove = (e: PointerEvent) => {
            if (grid.dataset.ready !== '1') return;
            const r = card.getBoundingClientRect();
            const x = (e.clientX - r.left) / r.width;
            const y = (e.clientY - r.top) / r.height;
            ry((x - 0.5) * 12);
            rx((0.5 - y) * 10);
            card.style.setProperty('--mx', `${(x * 100).toFixed(1)}%`);
            card.style.setProperty('--my', `${(y * 100).toFixed(1)}%`);
          };
          const onEnter = () => {
            if (grid.dataset.ready === '1') card.style.willChange = 'transform';
          };
          const onLeave = () => {
            rx(0);
            ry(0);
            card.style.willChange = '';
          };
          card.addEventListener('pointerenter', onEnter);
          card.addEventListener('pointermove', onMove, { passive: true });
          card.addEventListener('pointerleave', onLeave);
          return () => {
            card.removeEventListener('pointerenter', onEnter);
            card.removeEventListener('pointermove', onMove);
            card.removeEventListener('pointerleave', onLeave);
            card.style.willChange = '';
          };
        });

        return () => offs.forEach((off) => off());
      },
    );

    return () => mm.revert();
  }, []);

  return (
    <section className="ledger ledger-v" id="ledger" data-chapter="ledger" ref={sectionRef} aria-labelledby="ledger-title">
      <DotGrid follow className="ledger-dots" center={['30%', '20%']} radius={380} opacity={0.55} />

      <div className="ledger-in">
        <header className="ledger-head">
          <div className="ledger-kicker">
            <Scramble text="Telemetría · registro operativo" />
          </div>

          <m.div className="ledger-h2" style={{ y: headY }}>
            <SplitReveal as="h2" mode="words" stagger={0.06} id="ledger-title">
              Bitácora <span className="b">en</span> números.
            </SplitReveal>
          </m.div>

          <SplitReveal as="p" mode="lines" className="ledger-lead" delay={0.15}>
            Diez años de vuelo y {TOTAL_PIECES} piezas en el archivo. Cada instrumento de esta fila lee directo de
            mi bitácora: nada estimado, todo registrado.
          </SplitReveal>

          <m.div className="ledger-readout" aria-hidden="true" style={{ y: readoutY }}>
            <span>
              <Scramble text={`REG · ${pad2(TOTAL_PIECES)} PIEZAS`} delay={0.2} />
            </span>
            <span>
              <Scramble text={`RANGO · ${YEAR_RANGE.first} — ${YEAR_RANGE.last}`} delay={0.32} />
            </span>
            <span className="is-live">
              <Scramble text="ESTADO · ACTIVO" delay={0.44} />
            </span>
          </m.div>
        </header>

        <div className="led-grid" ref={gridRef}>
          {CARDS.map((c, i) => (
            <div className="led" key={c.k}>
              <div className="glow" />
              <span className="led-shine" aria-hidden="true" />
              <span className="led-idx" aria-hidden="true">
                {pad2(i + 1)}
              </span>
              <span className="k">{c.k}</span>
              <div className="n">
                <Odometer value={c.count} progress={p} range={[0.02 + i * 0.05, 0.42 + i * 0.05]} />
                <span className="unit">{c.unit}</span>
              </div>
              <span className="note">{c.note}</span>
            </div>
          ))}
        </div>

        <div className="inst-row">
          <YearBars />
          <CategoryRing />
          <LocationDots />
        </div>

        <p className="inst-foot">
          Fuente: archivo de vuelos · {TOTAL_PIECES} piezas · {YEAR_RANGE.first} — {YEAR_RANGE.last}
        </p>
      </div>
    </section>
  );
}
