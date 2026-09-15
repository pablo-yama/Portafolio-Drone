'use client';

import { useEffect, useRef, type ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import { m } from 'framer-motion';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { getLenis } from '@/lib/lenisStore';
import { NAV_OFFSET } from '@/components/layout/LenisProvider';

gsap.registerPlugin(ScrollTrigger);

/* First mount = the initial document load (no wipe, LCP untouched); every later
   mount is a client navigation. Module state is read once per mount and only
   ever flips false → true, so server and hydration renders agree. */
let navigated = false;

const WIPE_EASE: [number, number, number, number] = [0.83, 0, 0.17, 1];

const stampFor = (pathname: string) =>
  pathname === '/' ? '→ INICIO' : `→ ${pathname.replace(/^\//, '').replace(/\//g, ' / ').toUpperCase()}`;

/**
 * Route template — curtain wipe on every client navigation: a full-screen
 * `.page-wipe` panel retracts to the top (scaleY 1→0, .7 s) while the new page
 * rises 24px → 0 and fades in (CSS keyframes on `.page-enter`, cleared on
 * animationend so no transform lingers on the wrapper — a transformed ancestor
 * would re-parent the fixed nav). Also: scroll reset through Lenis, hash
 * landings with the 44px nav offset, ScrollTrigger.refresh once mounted.
 */
export default function Template({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const wipe = navigated;
  const contentRef = useRef<HTMLDivElement>(null);
  const layerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const isNavigation = navigated;
    navigated = true;
    const el = contentRef.current;

    let hash = window.location.hash;
    try {
      hash = decodeURIComponent(hash);
    } catch {
      /* keep raw */
    }
    const target = hash.length > 1 ? document.getElementById(hash.slice(1)) : null;
    const lenis = getLenis();

    if (target) {
      if (lenis) lenis.scrollTo(target, { immediate: true, offset: NAV_OFFSET, force: true });
      else window.scrollTo(0, target.getBoundingClientRect().top + window.scrollY + NAV_OFFSET);
    } else if (isNavigation) {
      if (lenis) lenis.scrollTo(0, { immediate: true, force: true });
      else window.scrollTo(0, 0);
    }

    /* Enter choreography — rise + fade, or fade only when landing on a hash
       (the wrapper must not be transformed while the nav is mid-viewport). */
    if (el && isNavigation) el.dataset.enter = target ? 'fade' : 'rise';
    const onEnd = (e: AnimationEvent) => {
      if (el && e.target === el) delete el.dataset.enter;
    };
    el?.addEventListener('animationend', onEnd);

    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    return () => {
      cancelAnimationFrame(raf);
      el?.removeEventListener('animationend', onEnd);
    };
  }, []);

  const hideLayer = () => {
    if (layerRef.current) layerRef.current.hidden = true;
  };

  return (
    <>
      {wipe && (
        <div ref={layerRef} className="page-wipe-layer" aria-hidden="true">
          <m.div
            className="page-wipe"
            initial={{ scaleY: 1 }}
            animate={{ scaleY: 0 }}
            transition={{ duration: 0.7, ease: WIPE_EASE, delay: 0.05 }}
            onAnimationComplete={hideLayer}
          />
          <m.span
            className="page-wipe-stamp"
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: [0, 1, 1, 0], y: [6, 0, 0, -6] }}
            transition={{ duration: 0.75, times: [0, 0.25, 0.6, 1], ease: 'easeOut' }}
          >
            {stampFor(pathname)}
          </m.span>
        </div>
      )}
      <div ref={contentRef} className="page-enter">
        {children}
      </div>
    </>
  );
}
