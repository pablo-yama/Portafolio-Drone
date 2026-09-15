'use client';

import { useRef, type ReactNode } from 'react';
import { m, type MotionValue } from 'framer-motion';
import { MAX_YEAR_COUNT, PIECES_BY_YEAR, TOTAL_PIECES, YEAR_RANGE } from '@/lib/archiveStats';
import { BARS, DRAW_RANGES, useDrawProgress, useLiveGate, useStage } from './chartTheme';

export interface YearBarsProps {
  /** Kicker printed in the figcaption (default "Piezas por año"). */
  caption?: ReactNode;
  /** Optional external progress (defaults to the figure's own draw progress). */
  progress?: MotionValue<number>;
  /** Window of `progress` that draws the bars. */
  range?: [number, number];
  className?: string;
}

const SLOT = (BARS.width - BARS.padX * 2) / PIECES_BY_YEAR.length;
const N = PIECES_BY_YEAR.length;
/** Each bar draws over 55% of the window, offset so the last finishes at 95%. */
const BAR_STEP = N > 1 ? 0.4 / (N - 1) : 0;
const BAR_SPAN = 0.55;

/** Column with a 4px rounded data-end and a square baseline. */
const barPath = (x: number, top: number, w: number, h: number, r: number) => {
  const rr = Math.min(r, h / 2, w / 2);
  const bottom = top + h;
  return [
    `M${x},${bottom}`,
    `V${top + rr}`,
    `Q${x},${top} ${x + rr},${top}`,
    `H${x + w - rr}`,
    `Q${x + w},${top} ${x + w},${top + rr}`,
    `V${bottom}`,
    'Z',
  ].join(' ');
};

const MAX_YEAR = PIECES_BY_YEAR.reduce((a, b) => (b.count > a.count ? b : a), PIECES_BY_YEAR[0]);

interface BarProps {
  i: number;
  year: number;
  count: number;
  isMax: boolean;
  draw: MotionValue<number>;
  live: MotionValue<number>;
}

function Bar({ i, year, count, isMax, draw, live }: BarProps) {
  const start = i * BAR_STEP;
  const end = start + BAR_SPAN;
  const scaleY = useStage(draw, live, start, end);
  const labelOpacity = useStage(draw, live, start + 0.3, end + 0.05);

  const h = (count / MAX_YEAR_COUNT) * BARS.maxH;
  const top = BARS.baseline - h;
  const x = BARS.padX + i * SLOT + (SLOT - BARS.bar) / 2;
  const cx = x + BARS.bar / 2;

  return (
    <g className="chart-bar" data-max={isMax ? '1' : undefined}>
      <title>{`${year}: ${count} piezas`}</title>
      {/* hit target larger than the mark (dataviz: hover layer by default) */}
      <rect className="chart-bar-hit" x={BARS.padX + i * SLOT} y={BARS.baseline - BARS.maxH - 16} width={SLOT} height={BARS.maxH + 40} />
      <m.path
        className="chart-bar-fill"
        d={barPath(x, top, BARS.bar, h, BARS.radius)}
        style={{ scaleY, originY: 1 }}
      />
      <m.text
        className="chart-bar-val"
        x={cx}
        y={top - BARS.labelGap}
        textAnchor="middle"
        style={{ opacity: labelOpacity }}
      >
        {count}
      </m.text>
      <text className="chart-bar-year tnum" x={cx} y={BARS.tickY} textAnchor="middle">
        {year}
      </text>
    </g>
  );
}

/**
 * YearBars — pieces per year (2022 → 2026) from the flight archive. One hue
 * (signal) for magnitude; the busiest year at full strength, the others at
 * .55. The server renders the finished chart; on the client each column's
 * scaleY (origin bottom) and value label are scrubbed by the figure's scroll
 * progress, left → right, then hold. Reduced motion: final state only.
 */
export function YearBars({ caption = 'Piezas por año', progress, range = DRAW_RANGES.bars, className }: YearBarsProps) {
  const figRef = useRef<HTMLElement>(null);
  const draw = useDrawProgress(figRef, range, progress);
  const live = useLiveGate();
  const baselineScale = useStage(draw, live, 0, 0.3);

  const cls = ['inst', 'inst--bars', className].filter(Boolean).join(' ');

  return (
    <figure className={cls} ref={figRef}>
      <figcaption className="inst-cap">
        <span className="inst-cap-k">{caption}</span>
        <span className="inst-cap-v tnum" aria-hidden="true">
          {YEAR_RANGE.first} — {YEAR_RANGE.last}
        </span>
      </figcaption>
      <span className="inst-hair" aria-hidden="true" />

      <div className="chart chart-bars">
        <svg
          className="chart-bars-svg"
          viewBox={`0 0 ${BARS.width} ${BARS.height}`}
          width="100%"
          role="presentation"
          aria-hidden="true"
          focusable="false"
        >
          <m.line
            className="chart-baseline"
            x1={BARS.padX}
            x2={BARS.width - BARS.padX}
            y1={BARS.baseline}
            y2={BARS.baseline}
            style={{ scaleX: baselineScale, originX: 0 }}
          />
          {PIECES_BY_YEAR.map((y, i) => (
            <Bar
              key={y.year}
              i={i}
              year={y.year}
              count={y.count}
              isMax={y.year === MAX_YEAR.year}
              draw={draw}
              live={live}
            />
          ))}
        </svg>
      </div>

      <p className="sr-only">
        De {YEAR_RANGE.first} a {YEAR_RANGE.last} archivé {TOTAL_PIECES} piezas; el año más activo fue{' '}
        {MAX_YEAR.year} con {MAX_YEAR.count}.
      </p>
      <table className="sr-only">
        <caption>
          Piezas por año ({YEAR_RANGE.first} — {YEAR_RANGE.last})
        </caption>
        <thead>
          <tr>
            <th scope="col">Año</th>
            <th scope="col">Piezas</th>
          </tr>
        </thead>
        <tbody>
          {PIECES_BY_YEAR.map((y) => (
            <tr key={y.year}>
              <th scope="row">{y.year}</th>
              <td>{y.count}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <th scope="row">Total</th>
            <td>{TOTAL_PIECES}</td>
          </tr>
        </tfoot>
      </table>
    </figure>
  );
}
