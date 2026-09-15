export interface RulerProps {
  /** Total length in px (vertical). Default 120. */
  height?: number;
  /** Minor tick spacing in px. Default 8. */
  step?: number;
  /** Major tick spacing in px (longer tick). Default 40. */
  major?: number;
  className?: string;
}

/**
 * Ruler — decorative vertical measuring gauge (aria-hidden): a 1px spine and
 * ticks every `step` px, majors every `major` px. The ticks are ONE path with
 * `pathLength="1"` so a stroke-dashoffset tween (1 → 0) draws them one after
 * another; the spine is drawn with a scaleY from the top. Pure markup —
 * deterministic, no hooks — the parent (PilotSection) owns the animation.
 */
export function Ruler({ height = 120, step = 8, major = 40, className }: RulerProps) {
  const ticks: string[] = [];
  for (let y = 0; y <= height; y += step) {
    const len = y % major === 0 ? 12 : 6;
    ticks.push(`M0 ${y + 0.5}h${len}`);
  }

  return (
    <svg
      className={['ruler', className].filter(Boolean).join(' ')}
      width={14}
      height={height + 1}
      viewBox={`0 0 14 ${height + 1}`}
      aria-hidden="true"
      focusable="false"
    >
      <line className="ruler-spine" x1="0.5" y1="0" x2="0.5" y2={height + 1} />
      <path className="ruler-ticks" d={ticks.join(' ')} pathLength={1} />
    </svg>
  );
}
