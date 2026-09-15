'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { useScroll, useVelocity } from 'framer-motion';
import { Scramble } from '@/components/textfx';

/**
 * Exact copy per spec (no prices, ever):
 * MAVIC 3 PRO · 4/3 CMOS · DNG · PRORES · 4K 60P · AFAC · SEGURO RC ·
 * 0 INCIDENTES · 19.4326°N 99.1332°W · CDMX · MORELOS · GUERRERO
 */
export const SPECS_TAPE_ITEMS = [
  'MAVIC 3 PRO',
  '4/3 CMOS',
  'DNG',
  'PRORES',
  '4K 60P',
  'AFAC',
  'SEGURO RC',
  '0 INCIDENTES',
  '19.4326°N 99.1332°W',
  'CDMX',
  'MORELOS',
  'GUERRERO',
] as const;

/* Second row starts mid-list so the two tapes never mirror each other. */
const ALT_OFFSET = 5;
const ALT_ITEMS = [...SPECS_TAPE_ITEMS.slice(ALT_OFFSET), ...SPECS_TAPE_ITEMS.slice(0, ALT_OFFSET)];

const SPEED_A = 36; // s per half-track (row 1, → left)
const SPEED_B = 44; // s per half-track (row 2, → right)
const MAX_BOOST = 2.5; // extra timeScale at high scroll velocity
const VELOCITY_REF = 1400; // px/s that maps to full boost

interface TapeListProps {
  items: readonly string[];
  hidden?: boolean;
}

/* Every item carries its own trailing `·` so the -50 % wrap is seamless. */
const TapeList = ({ items, hidden }: TapeListProps) => (
  <ul className="tape-list" aria-hidden={hidden ? 'true' : undefined}>
    {items.map((t, i) => (
      <li className="tape-item" key={`${t}-${i}`}>
        <Scramble text={t} enter={false} hover="parent" duration={0.55} speed={0.6} />
        <span className="tape-dot" aria-hidden="true">
          ·
        </span>
      </li>
    ))}
  </ul>
);

/**
 * SpecsTape — the instrument-tape divider between § 02 Piloto and Bitácora.
 * Two rows moving in opposite directions (GSAP xPercent loops, transform-only),
 * their speed modulated by scroll velocity (framer useVelocity(scrollY) →
 * timeScale, lerped on the GSAP ticker). Paused off-screen (IntersectionObserver)
 * and on hover / focus-within; items Scramble on hover (fine pointer).
 * The server HTML carries the full list; the second row and the duplicate
 * lists are aria-hidden. Reduced motion (CSS): one static, scrollable row.
 */
export function SpecsTape() {
  const rootRef = useRef<HTMLDivElement>(null);
  const { scrollY } = useScroll();
  const velocity = useVelocity(scrollY);

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;

    const mm = gsap.matchMedia();

    mm.add({ reduce: '(prefers-reduced-motion: reduce)' }, (ctx) => {
      const { reduce } = ctx.conditions as { reduce: boolean };
      if (reduce) return; /* static row — handled by pilot.css */

      const tracks = gsap.utils.toArray<HTMLElement>('.tape-track', root);
      const tweens = tracks.map((track, i) =>
        i % 2 === 0
          ? gsap.fromTo(
              track,
              { xPercent: 0 },
              { xPercent: -50, duration: SPEED_A, ease: 'none', repeat: -1, paused: true },
            )
          : gsap.fromTo(
              track,
              { xPercent: -50 },
              { xPercent: 0, duration: SPEED_B, ease: 'none', repeat: -1, paused: true },
            ),
      );

      let inView = false;
      let held = false;
      const sync = () => {
        const play = inView && !held;
        tweens.forEach((tw) => (play ? tw.play() : tw.pause()));
        root.dataset.active = play ? '1' : '0';
      };

      const io = new IntersectionObserver(
        (entries) => {
          inView = entries.some((e) => e.isIntersecting);
          sync();
        },
        { rootMargin: '12% 0px' },
      );
      io.observe(root);

      const hold = () => {
        held = true;
        sync();
      };
      const release = () => {
        held = false;
        sync();
      };
      root.addEventListener('pointerenter', hold);
      root.addEventListener('pointerleave', release);
      root.addEventListener('focusin', hold);
      root.addEventListener('focusout', release);

      /* scroll velocity → timeScale (fast attack, slow release) */
      let target = 1;
      let current = 1;
      const unsub = velocity.on('change', (v) => {
        target = 1 + Math.min(Math.abs(v) / VELOCITY_REF, MAX_BOOST);
      });
      const tick = () => {
        if (!inView || Math.abs(target - current) < 0.002) return;
        current += (target - current) * (target > current ? 0.14 : 0.05);
        tweens.forEach((tw) => tw.timeScale(current));
      };
      gsap.ticker.add(tick);

      return () => {
        gsap.ticker.remove(tick);
        unsub();
        io.disconnect();
        root.removeEventListener('pointerenter', hold);
        root.removeEventListener('pointerleave', release);
        root.removeEventListener('focusin', hold);
        root.removeEventListener('focusout', release);
        tweens.forEach((tw) => tw.kill());
        delete root.dataset.active;
      };
    });

    return () => mm.revert();
  }, [velocity]);

  return (
    <div className="tape tape--double" role="marquee" aria-label="Especificaciones del equipo" ref={rootRef}>
      <div className="tape-row">
        <div className="tape-track">
          <TapeList items={SPECS_TAPE_ITEMS} />
          <TapeList items={SPECS_TAPE_ITEMS} hidden />
        </div>
      </div>
      <div className="tape-row tape-row--alt" aria-hidden="true">
        <div className="tape-track">
          <TapeList items={ALT_ITEMS} />
          <TapeList items={ALT_ITEMS} />
        </div>
      </div>
    </div>
  );
}
