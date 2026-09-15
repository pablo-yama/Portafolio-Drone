/**
 * BeamBorder — a 1px ring with a rotating conic "beam" (transform: rotate
 * only). Drop it as the last child of a `position: relative` card that sets
 * the border-radius the ring inherits; keep the parent `overflow: visible`.
 * `active` toggles `animation-play-state` so it only spins while on screen.
 * Hidden by premium-base.css under prefers-reduced-motion and pointer: coarse.
 */
export interface BeamBorderProps {
  active: boolean;
  className?: string;
}

export function BeamBorder({ active, className }: BeamBorderProps) {
  return (
    <span
      className={['beam', className].filter(Boolean).join(' ')}
      aria-hidden="true"
      data-active={active ? '1' : '0'}
    >
      <span className="beam-spin" />
    </span>
  );
}
