'use client';

import { useEffect, useRef } from 'react';

/**
 * GrainLayer — fixed film-grain texture over the whole page (z --z-grain, under
 * the vignette and scanlines). The noise tile is an inline feTurbulence SVG;
 * the flicker is a transform-only keyframe loop stepped with steps(6) that
 * runs only while the document is visible and the layer intersects the
 * viewport (IntersectionObserver + visibilitychange → data-active).
 * No blend mode, no filter at runtime. Reduced motion / coarse pointer: the
 * texture stays, the loop is disabled in chrome.css.
 */
export function GrainLayer() {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    let intersecting = true;
    const sync = () => {
      el.dataset.active = intersecting && !document.hidden ? '1' : '0';
    };
    let io: IntersectionObserver | null = null;
    if (typeof IntersectionObserver !== 'undefined') {
      io = new IntersectionObserver((entries) => {
        const last = entries[entries.length - 1];
        intersecting = last ? last.isIntersecting : true;
        sync();
      });
      io.observe(el);
    }
    document.addEventListener('visibilitychange', sync);
    sync();
    return () => {
      io?.disconnect();
      document.removeEventListener('visibilitychange', sync);
    };
  }, []);

  return (
    <div ref={ref} className="grain" aria-hidden="true" data-active="0">
      <span className="grain-tex" />
    </div>
  );
}
