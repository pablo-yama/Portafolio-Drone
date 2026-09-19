/**
 * PhaseGlyph — five 1px line glyphs (viewBox 64) for the § 03 Método panels:
 * reticle · route · shutter · curve · package. Pure SVG, server-renderable,
 * decorative (aria-hidden). Every stroked element carries `data-draw` so the
 * section can draw it with DrawSVG (stroke-dashoffset) when its panel enters.
 * Strokes use var(--scan); the fill dot uses var(--signal).
 */
import type { CSSProperties } from 'react';

export type PhaseGlyphKind = 'reticle' | 'route' | 'shutter' | 'curve' | 'package';

export interface PhaseGlyphProps {
  kind: PhaseGlyphKind;
  /** Rendered size in px (default 64; the SVG scales with the viewBox). */
  size?: number;
  className?: string;
  style?: CSSProperties;
}

const C = 32;
const DEG = Math.PI / 180;
const r2 = (n: number) => Math.round(n * 100) / 100;

/* Aperture: hexagon (r 13) + one blade per vertex reaching the outer ring (r 26). */
const HEX = Array.from({ length: 6 }, (_, k) => {
  const a = (k * 60 - 90) * DEG;
  return [r2(C + 13 * Math.cos(a)), r2(C + 13 * Math.sin(a))] as const;
});
const HEX_POINTS = HEX.map(([x, y]) => `${x},${y}`).join(' ');
const BLADES = HEX.map(([x, y], k) => {
  const a = (k * 60 - 90 + 42) * DEG;
  return { x1: x, y1: y, x2: r2(C + 26 * Math.cos(a)), y2: r2(C + 26 * Math.sin(a)) };
});

const Reticle = () => (
  <>
    <circle data-draw cx={C} cy={C} r={22} />
    <circle data-draw cx={C} cy={C} r={8} />
    <line data-draw x1={C} y1={3} x2={C} y2={13} />
    <line data-draw x1={C} y1={51} x2={C} y2={61} />
    <line data-draw x1={3} y1={C} x2={13} y2={C} />
    <line data-draw x1={51} y1={C} x2={61} y2={C} />
    <circle className="mf-glyph-dot" cx={C} cy={C} r={1.6} />
  </>
);

const Route = () => (
  <>
    <path data-draw d="M6 50 C 18 50, 20 22, 32 22 S 46 44, 58 14" />
    <path data-draw className="mf-glyph-faint" d="M6 56 H58" strokeDasharray="1 4" />
    <circle data-draw cx={6} cy={50} r={2.6} />
    <circle data-draw cx={32} cy={22} r={2.6} />
    <circle data-draw cx={58} cy={14} r={2.6} />
    <path data-draw d="M53 12 L58 14 L56 19" />
  </>
);

const Shutter = () => (
  <>
    <circle data-draw cx={C} cy={C} r={26} />
    <polygon data-draw points={HEX_POINTS} />
    {BLADES.map((b, k) => (
      <line data-draw key={k} x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2} />
    ))}
  </>
);

const Curve = () => (
  <>
    <path data-draw d="M10 8 V54 H56" />
    <path data-draw className="mf-glyph-faint" d="M10 54 L56 8" strokeDasharray="2 3" />
    <path data-draw d="M10 54 C 24 52, 30 34, 38 24 S 50 12, 56 8" />
    <line data-draw className="mf-glyph-faint" x1={33} y1={54} x2={33} y2={29} strokeDasharray="1 3" />
    <circle data-draw cx={33} cy={29} r={2.2} />
  </>
);

const Package = () => (
  <>
    <polygon data-draw points="32,8 54,19 32,30 10,19" />
    <polygon data-draw points="10,19 32,30 32,56 10,45" />
    <polygon data-draw points="54,19 32,30 32,56 54,45" />
    <path data-draw className="mf-glyph-faint" d="M21 13.5 L43 24.5 V32" />
    <path data-draw d="M38 46 L42 50 L50 40" />
  </>
);

const GLYPHS: Record<PhaseGlyphKind, () => React.JSX.Element> = {
  reticle: Reticle,
  route: Route,
  shutter: Shutter,
  curve: Curve,
  package: Package,
};

export function PhaseGlyph({ kind, size = 64, className, style }: PhaseGlyphProps) {
  const Body = GLYPHS[kind];
  return (
    <svg
      className={['mf-glyph-svg', className].filter(Boolean).join(' ')}
      viewBox="0 0 64 64"
      width={size}
      height={size}
      fill="none"
      stroke="currentColor"
      strokeWidth={1}
      strokeLinecap="round"
      strokeLinejoin="round"
      vectorEffect="non-scaling-stroke"
      aria-hidden="true"
      focusable="false"
      data-kind={kind}
      style={style}
    >
      <Body />
    </svg>
  );
}
