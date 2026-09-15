'use client';

import { useRef, useState, type CSSProperties, type ReactNode } from 'react';
import { m, type MotionValue } from 'framer-motion';
import { PIECES_BY_LOCATION, TOTAL_PIECES, type LocationTone } from '@/lib/archiveStats';
import { DOTS, DRAW_RANGES, TONE_VAR, useDrawProgress, useLiveGate, useStage } from './chartTheme';

export interface LocationDotsProps {
  caption?: ReactNode;
  progress?: MotionValue<number>;
  range?: [number, number];
  className?: string;
}

interface DotSpec {
  i: number;
  loc: string;
  tone: LocationTone;
}

/** One dot per archived piece, grouped by location in descending order. */
const DOT_LIST: DotSpec[] = PIECES_BY_LOCATION.flatMap((l) =>
  Array.from({ length: l.count }, () => ({ loc: l.loc, tone: l.color })),
).map((d, i) => ({ ...d, i }));

const N = DOT_LIST.length;
/** Each dot pops over 30% of the window; the wave of starts spans the first 70%. */
const DOT_SPAN = 0.3;

interface DotProps {
  spec: DotSpec;
  draw: MotionValue<number>;
  live: MotionValue<number>;
  on: boolean | null;
}

function Dot({ spec, draw, live, on }: DotProps) {
  const start = (spec.i / N) * (1 - DOT_SPAN);
  const s = useStage(draw, live, start, start + DOT_SPAN);
  return (
    <span
      className="chart-dot"
      data-loc={spec.loc}
      data-on={on === true ? '1' : undefined}
      data-off={on === false ? '1' : undefined}
      style={{ '--dot': TONE_VAR[spec.tone] } as CSSProperties}
    >
      <m.span className="chart-dot-i" style={{ scale: s, opacity: s }} />
    </span>
  );
}

/**
 * LocationDots — a 37-dot matrix (10 columns), one dot per piece, coloured by
 * location with the same tones as the /archivo map (CDMX signal · Guerrero
 * scan · Morelos green). Hovering / focusing / pinning a legend row dims the
 * other locations. The server renders every dot; on the client each dot
 * scales in from 0 in a left→right wave scrubbed by the figure's progress.
 */
export function LocationDots({ caption = 'Por ubicación', progress, range = DRAW_RANGES.dots, className }: LocationDotsProps) {
  const figRef = useRef<HTMLElement>(null);
  const draw = useDrawProgress(figRef, range, progress);
  const live = useLiveGate();

  const [hovered, setHovered] = useState<string | null>(null);
  const [pinned, setPinned] = useState<string | null>(null);
  const active = hovered ?? pinned;

  const cls = ['inst', 'inst--dots', className].filter(Boolean).join(' ');
  const gridStyle = {
    '--dot-cols': DOTS.columns,
    '--dot-size': `${DOTS.size}px`,
    '--dot-gap': `${DOTS.gap}px`,
  } as CSSProperties;

  return (
    <figure className={cls} ref={figRef} data-active={active ? '1' : undefined}>
      <figcaption className="inst-cap">
        <span className="inst-cap-k">{caption}</span>
        <span className="inst-cap-v tnum" aria-hidden="true">
          {PIECES_BY_LOCATION.length} / {TOTAL_PIECES}
        </span>
      </figcaption>
      <span className="inst-hair" aria-hidden="true" />

      <div className="chart chart-dots-wrap">
        <div className="chart-dots" aria-hidden="true" style={gridStyle}>
          {DOT_LIST.map((d) => (
            <Dot key={d.i} spec={d} draw={draw} live={live} on={active === null ? null : active === d.loc} />
          ))}
        </div>

        <ul className="chart-legend chart-legend--inline" role="list">
          {PIECES_BY_LOCATION.map((l) => (
            <li key={l.loc} className="chart-legend-row" data-on={active === l.loc ? '1' : undefined}>
              <button
                type="button"
                className="chart-legend-btn"
                aria-pressed={pinned === l.loc}
                style={{ '--dot': TONE_VAR[l.color] } as CSSProperties}
                onPointerEnter={() => setHovered(l.loc)}
                onPointerLeave={() => setHovered(null)}
                onFocus={() => setHovered(l.loc)}
                onBlur={() => setHovered(null)}
                onClick={() => setPinned((p) => (p === l.loc ? null : l.loc))}
              >
                <span className="chart-swatch chart-swatch--tone" aria-hidden="true" />
                <span className="chart-legend-k">{l.loc}</span>
                <span className="chart-legend-v tnum">{l.count}</span>
                <span className="chart-legend-p tnum">{l.pct}%</span>
              </button>
            </li>
          ))}
        </ul>
      </div>

      <p className="sr-only">
        {PIECES_BY_LOCATION.map((l) => `${l.loc} ${l.count}`).join(' · ')} — {TOTAL_PIECES} piezas en total.
      </p>
      <table className="sr-only">
        <caption>Piezas por ubicación</caption>
        <thead>
          <tr>
            <th scope="col">Ubicación</th>
            <th scope="col">Piezas</th>
            <th scope="col">Porcentaje</th>
          </tr>
        </thead>
        <tbody>
          {PIECES_BY_LOCATION.map((l) => (
            <tr key={l.loc}>
              <th scope="row">{l.loc}</th>
              <td>{l.count}</td>
              <td>{l.pct}%</td>
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
