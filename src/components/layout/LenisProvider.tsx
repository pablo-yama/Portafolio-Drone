'use client';

import { useEffect, type ReactNode } from 'react';
import Lenis from 'lenis';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { setLenis } from '@/lib/lenisStore';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';

/* The single ScrollTrigger registration point for the app (WP2). Other files
   may call gsap.registerPlugin again — GSAP de-duplicates — but this is the
   canonical one that runs before any section mounts. */
gsap.registerPlugin(ScrollTrigger);

/** Fixed nav height — every Lenis anchor / hash scroll lands under the bar. */
export const NAV_OFFSET = -80;

const EASING = (t: number) => Math.min(1, 1.001 - Math.pow(2, -10 * t));

/**
 * LenisProvider — global smooth scroll wired to GSAP's ticker (replaces the
 * legacy SmoothScroll wrapper). Under `prefers-reduced-motion: reduce` no Lenis
 * instance is created (native scroll, `scroll-padding-top` in chrome.css keeps
 * the 44px anchor offset); ScrollTrigger still refreshes once fonts settle.
 *
 * The instance is published through `lenisStore` so template.tsx, the lightbox
 * and the mobile menu can scrollTo / stop / start without prop drilling.
 */
export function LenisProvider({ children }: { children: ReactNode }) {
  const { reduced } = useMotionPrefs();
  useEffect(() => {
    let alive = true;
    const refresh = () => {
      if (alive) ScrollTrigger.refresh();
    };

    /* Layout settles twice: when web fonts swap in and when the document is fully loaded. */
    const fontsReady: Promise<unknown> =
      typeof document !== 'undefined' && 'fonts' in document
        ? document.fonts.ready
        : Promise.resolve();
    fontsReady.then(() => requestAnimationFrame(refresh));
    const onLoad = () => requestAnimationFrame(refresh);
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });

    if (reduced) {
      return () => {
        alive = false;
        window.removeEventListener('load', onLoad);
      };
    }

    const lenis = new Lenis({
      duration: 1.2,
      easing: EASING,
      touchMultiplier: 2,
      autoRaf: false,
      anchors: { offset: NAV_OFFSET },
    });

    lenis.on('scroll', ScrollTrigger.update);

    /* Exact reference kept so cleanup removes this callback and no other. */
    const raf = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(raf);
    gsap.ticker.lagSmoothing(0);
    setLenis(lenis);

    return () => {
      alive = false;
      window.removeEventListener('load', onLoad);
      setLenis(null);
      gsap.ticker.remove(raf);
      gsap.ticker.lagSmoothing(500, 33);
      lenis.destroy();
    };
  }, [reduced]);

  return <>{children}</>;
}
