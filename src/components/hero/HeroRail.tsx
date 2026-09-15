'use client';

import dynamic from 'next/dynamic';
import { m, type MotionStyle } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Scramble } from '@/components/textfx';

/**
 * HeroRail — the live telemetry rail on the right of the hero copy.
 *
 * Reuses the legacy `.hero-right / .tick / .telem-*` classes from globals.css
 * (restyled by hero-video.css to a translucent tint over the video). Every
 * live value carries a `data-hud` hook written by useHudTelemetry; the map
 * SVG keeps `#flightPath` / `#crosshair` so the crosshair can ride the path.
 * Under 1024px the map/rows/tick are hidden by CSS and the rail collapses to
 * the 2×2 spec cards plus one mono readout line (`[data-hud="mini"]`).
 *
 * `style` receives the scroll-linked `y` from the section so the rail drifts
 * at its own rate (a separate parallax layer from the copy).
 *
 * `HERO_MINIMAP` (off by default) mounts the legacy HeroDroneScene lazily
 * inside a 240px slot — fine pointer + WebGL + after window load only — so
 * three.js stays off the first paint unless the owner flips the flag.
 */
const HERO_MINIMAP = false;

const HeroDroneScene = dynamic(() => import('@/components/three/HeroDroneScene'), {
  ssr: false,
  loading: () => null,
});

const canRender3D = () => {
  if (typeof document === 'undefined') return false;
  if (!window.matchMedia('(pointer: fine)').matches) return false;
  const canvas = document.createElement('canvas');
  const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
  const cores = navigator.hardwareConcurrency || 2;
  return gl !== null && cores >= 4;
};

export interface HeroRailProps {
  /** Boot curtain opened → static labels decode in. */
  intro: boolean;
  /** Scroll-linked motion values (y) — omitted on mobile + reduced motion. */
  style?: MotionStyle;
}

const SPECS = [
  { k: 'Equipo', v: 'Mavic 3 Pro' },
  { k: 'Sensor', v: '4/3 CMOS' },
  { k: 'Formato', v: 'DNG · ProRes' },
  { k: 'Ventana', v: 'Hora azul' },
] as const;

const ROWS = [
  { id: 'alt', lbl: 'ALT', init: '0 M' },
  { id: 'spd', lbl: 'SPD', init: '0 M/S' },
  { id: 'gps', lbl: 'GPS', init: '0/22' },
  { id: 'bat', lbl: 'BAT', init: '0%', warn: true },
] as const;

function MiniMapSlot() {
  const [mount, setMount] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const go = () => {
      if (!cancelled && canRender3D()) setMount(true);
    };
    if (document.readyState === 'complete') {
      const id = window.setTimeout(go, 0);
      return () => {
        cancelled = true;
        window.clearTimeout(id);
      };
    }
    window.addEventListener('load', go, { once: true });
    return () => {
      cancelled = true;
      window.removeEventListener('load', go);
    };
  }, []);

  return <div className="rail-minimap">{mount && <HeroDroneScene />}</div>;
}

export function HeroRail({ intro, style }: HeroRailProps) {
  /* `play` runs ignore `delay`; `revealDelay` keeps the glyph churn visible and staggers the decode instead. */
  const seg = (text: string, hold: number, chars?: string) => (
    <Scramble text={text} enter={false} play={intro} duration={0.7 + hold} revealDelay={hold} chars={chars} />
  );

  return (
    <m.aside className="hero-rail hero-right" aria-label="Telemetría de vuelo (simulada)" style={style}>
      <div className="tick rail-in">
        {seg('TELEMETRÍA · LIVE', 0.3)}
        <span className="rec">{seg('OPERANDO', 0.5)}</span>
      </div>

      <div className="telem-feed">
        <div className="telem-map rail-in" data-hud="map">
          <svg viewBox="0 0 400 220" preserveAspectRatio="none" aria-hidden="true">
            <defs>
              <pattern id="hgrid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(232,230,225,0.06)" strokeWidth="0.5" />
              </pattern>
            </defs>
            <rect width="400" height="220" fill="url(#hgrid)" />
            <path
              id="flightPath"
              d="M 10 180 Q 80 120 150 140 T 300 90 T 400 70"
              fill="none"
              stroke="var(--signal)"
              strokeWidth="1.5"
              strokeDasharray="4 4"
              opacity="0.85"
            />
            <circle cx="10" cy="180" r="3" fill="var(--signal)" />
            <circle cx="390" cy="72" r="3" fill="var(--fg)" />
          </svg>
          <div className="crosshair" id="crosshair" />
          <span className="coord tl">{seg('ORIGIN · 19.4326°N', 0.6)}</span>
          <span className="coord br">{seg('TARGET · 99.1332°W', 0.75)}</span>
        </div>

        {ROWS.map((r) => (
          <div key={r.id} className={'warn' in r && r.warn ? 'telem-row rail-in warn' : 'telem-row rail-in'}>
            <span className="lbl">{r.lbl}</span>
            <div className="bar-wrap">
              <div className="bar-fill" data-hud={`${r.id}-bar`} />
            </div>
            <span className="val tnum" data-hud={`${r.id}-val`}>
              {r.init}
            </span>
          </div>
        ))}

        {HERO_MINIMAP && <MiniMapSlot />}

        <div className="telem-grid rail-in">
          {SPECS.map((s, i) => (
            <div key={s.k} className="telem-card">
              <span className="k">{s.k}</span>
              <span className="v">{seg(s.v, 0.7 + i * 0.08, '·/ABCDEF0123')}</span>
            </div>
          ))}
        </div>

        <p className="rail-mini tnum rail-in" data-hud="mini">
          ALT 0M · BAT 0%
        </p>
      </div>
    </m.aside>
  );
}
