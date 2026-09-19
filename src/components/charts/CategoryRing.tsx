'use client';

import { useRef, useState, type ReactNode } from 'react';
import { AnimatePresence, m, useTransform, type MotionValue } from 'framer-motion';
import type { ArchiveCategory } from '@/lib/archive';
import { PIECES_BY_CATEGORY, TOTAL_PIECES } from '@/lib/archiveStats';
import { DRAW_RANGES, RING, clamp01, easeOutCubic, useDrawProgress, useLiveGate } from './chartTheme';

export interface CategoryRingProps {
  caption?: ReactNode;
  progress?: MotionValue<number>;
  range?: [number, number];
  className?: string;
}

const C = RING.size / 2;
const TWO_PI = Math.PI * 2;
/** 2px surface gap expressed as an angle on the ring's centreline. */
const GAP = RING.gapPx / RING.r;

const pt = (a: number) => `${(C + RING.r * Math.cos(a)).toFixed(3)} ${(C + RING.r * Math.sin(a)).toFixed(3)}`;

const arcPath = (a0: number, a1: number) => {
  const large = a1 - a0 > Math.PI ? 1 : 0;
  return `M${pt(a0)} A${RING.r} ${RING.r} 0 ${large} 1 ${pt(a1)}`;
};

interface Arc {
  cat: ArchiveCategory;
  count: number;
  pct: number;
  d: string;
  /** cumulative fraction of the ring where this arc starts / ends */
  from: number;
  to: number;
}

const ARCS: Arc[] = (() => {
  let angle = -Math.PI / 2;
  let cum = 0;
  return PIECES_BY_CATEGORY.map((s) => {
    const frac = s.count / TOTAL_PIECES;
    const span = frac * TWO_PI;
    const a0 = angle + GAP / 2;
    const a1 = angle + span - GAP / 2;
    const arc: Arc = { cat: s.cat, count: s.count, pct: s.pct, d: arcPath(a0, a1), from: cum, to: cum + frac };
    angle += span;
    cum += frac;
    return arc;
  });
})();

const LEAD = PIECES_BY_CATEGORY[0];

interface ArcMarkProps {
  arc: Arc;
  sweep: MotionValue<number>;
  active: boolean;
  dimmed: boolean;
  onEnter: () => void;
  onLeave: () => void;
}

function ArcMark({ arc, sweep, active, dimmed, onEnter, onLeave }: ArcMarkProps) {
  /* the sweep travels the ring at constant angular speed; each arc draws in its slot */
  const pathLength = useTransform(sweep, (s) => clamp01((s - arc.from) / (arc.to - arc.from)));
  return (
    <g
      className="chart-arc-g"
      data-on={active ? '1' : undefined}
      data-dim={dimmed ? '1' : undefined}
      onPointerEnter={onEnter}
      onPointerLeave={onLeave}
    >
      <title>{`${arc.cat}: ${arc.count} piezas · ${arc.pct}%`}</title>
      {/* wide invisible hit path so the hover target is bigger than the mark */}
      <path className="chart-arc-hit" d={arc.d} />
      <m.path className="chart-arc" d={arc.d} style={{ pathLength }} />
    </g>
  );
}

/**
 * CategoryRing — the archive split by category (six arcs, 2px surface gaps).
 * Single-hue emphasis: the hovered / focused / pinned category burns signal,
 * every other arc rests in --dim-2; identity lives in the legend (buttons with
 * aria-pressed) and the centre readout, never in colour alone. The server
 * renders the complete ring; on the client the arcs draw sequentially around
 * the ring (pathLength — the spec's documented non-transform exception) while
 * the whole ring rotates into place, scrubbed by the figure's scroll progress.
 */
export function CategoryRing({ caption = 'Por categoría', progress, range = DRAW_RANGES.ring, className }: CategoryRingProps) {
  const figRef = useRef<HTMLElement>(null);
  const draw = useDrawProgress(figRef, range, progress);
  const live = useLiveGate();

  const sweep = useTransform([draw, live], ([d, l]: number[]) => (l ? easeOutCubic(clamp01((d - 0.04) / 0.92)) : 1));
  const rotate = useTransform([draw, live], ([d, l]: number[]) => (l ? (1 - easeOutCubic(clamp01(d / 0.9))) * -32 : 0));
  const centreOpacity = useTransform([draw, live], ([d, l]: number[]) => (l ? easeOutCubic(clamp01((d - 0.25) / 0.45)) : 1));

  const [hovered, setHovered] = useState<ArchiveCategory | null>(null);
  const [pinned, setPinned] = useState<ArchiveCategory | null>(null);
  const active = hovered ?? pinned;
  const activeArc = active ? ARCS.find((a) => a.cat === active) ?? null : null;

  const cls = ['inst', 'inst--ring', className].filter(Boolean).join(' ');

  return (
    <figure className={cls} ref={figRef} data-active={active ? '1' : undefined}>
      <figcaption className="inst-cap">
        <span className="inst-cap-k">{caption}</span>
        <span className="inst-cap-v tnum" aria-hidden="true">
          {ARCS.length} / {TOTAL_PIECES}
        </span>
      </figcaption>
      <span className="inst-hair" aria-hidden="true" />

      <div className="chart chart-ring-wrap">
        <div className="chart-ring">
          <svg
            className="chart-ring-svg"
            viewBox={`0 0 ${RING.size} ${RING.size}`}
            width="100%"
            role="presentation"
            aria-hidden="true"
            focusable="false"
          >
            <circle className="chart-ring-track" cx={C} cy={C} r={RING.r} />
            <m.g style={{ rotate }}>
              {ARCS.map((arc) => (
                <ArcMark
                  key={arc.cat}
                  arc={arc}
                  sweep={sweep}
                  active={active === arc.cat}
                  dimmed={active !== null && active !== arc.cat}
                  onEnter={() => setHovered(arc.cat)}
                  onLeave={() => setHovered(null)}
                />
              ))}
            </m.g>
          </svg>

          <m.div className="chart-ring-centre" aria-hidden="true" style={{ opacity: centreOpacity }}>
            <AnimatePresence mode="wait" initial={false}>
              {activeArc ? (
                <m.div
                  key={activeArc.cat}
                  className="chart-ring-readout is-cat"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <span className="chart-ring-n serif-i">{activeArc.count}</span>
                  <span className="chart-ring-l">
                    {activeArc.cat} · {activeArc.pct}%
                  </span>
                </m.div>
              ) : (
                <m.div
                  key="total"
                  className="chart-ring-readout"
                  initial={{ opacity: 0, y: 6 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -6 }}
                  transition={{ duration: 0.18, ease: [0.2, 0.8, 0.2, 1] }}
                >
                  <span className="chart-ring-n serif-i">{TOTAL_PIECES}</span>
                  <span className="chart-ring-l">piezas</span>
                </m.div>
              )}
            </AnimatePresence>
          </m.div>
        </div>

        <ul className="chart-legend" role="list">
          {ARCS.map((arc) => (
            <li key={arc.cat} className="chart-legend-row" data-on={active === arc.cat ? '1' : undefined}>
              <button
                type="button"
                className="chart-legend-btn"
                aria-pressed={pinned === arc.cat}
                onPointerEnter={() => setHovered(arc.cat)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(arc.cat)}
                onBlur={() => setHovered(null)}
                onClick={() => setPinned((p) => (p === arc.cat ? null : arc.cat))}
              >
                <span className="chart-swatch" aria-hidden="true" />
                <span className="chart-legend-k">{arc.cat}</span>
                <span className="chart-legend-v tnum">{arc.count}</span>
                <span className="chart-legend-p tnum">{arc.pct}%</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="sr-only">
        De {TOTAL_PIECES} piezas, {LEAD.cat} es la categoría más frecuente con {LEAD.count} ({LEAD.pct}%).
      </p>
      <table className="sr-only">
        <caption>Piezas por categoría</caption>
        <thead>
          <tr>
            <th scope="col">Categoría</th>
            <th scope="col">Piezas</th>
            <th scope="col">Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          {PIECES_BY_CATEGORY.map((s) => (
            <tr key={s.cat}>
              <th scope="row">{s.cat}</th>
              <td>{s.count}</td>
              <td>{s.pct}%</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Total</th>
            <td>{TOTAL_PIECES}</td>
            <td>100%</td>
          </tr>
        </tfoot>
      </table>
    </figure>
  );
}
