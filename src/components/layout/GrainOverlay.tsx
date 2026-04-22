'use client';

/**
 * GrainOverlay — fixed-position film grain texture applied to the whole viewport.
 *
 * Uses an inline SVG with feTurbulence as a data URI background-image. Mixed via
 * `mix-blend-mode: overlay` at low opacity so it sits on top of everything
 * without recoloring it. Pointer-events none so it never captures input.
 *
 * Respects `prefers-reduced-motion` by disabling the subtle flicker keyframes.
 */
export function GrainOverlay() {
  // feTurbulence SVG encoded as a data URI. baseFrequency controls grain size —
  // higher = finer noise. numOctaves bumps richness of detail.
  const grainDataUri =
    "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix values='0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.6 0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

  return (
    <div
      aria-hidden="true"
      className="grain-overlay pointer-events-none fixed inset-0 z-[var(--z-grain)]"
      style={{
        backgroundImage: grainDataUri,
        backgroundSize: '200px 200px',
        opacity: 0.08,
        mixBlendMode: 'overlay',
      }}
    />
  );
}
