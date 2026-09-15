'use client';

import { m, type MotionStyle } from 'framer-motion';
import type { CSSProperties } from 'react';
import { Scramble } from '@/components/textfx';

/**
 * HudFrame — the instrument chrome drawn over the hero video: four corner
 * brackets, the top ticker (REC ● + live timecode + location stamp), the
 * bottom timecode bar (with the scroll hint) and the right-edge altitude
 * ruler. Purely decorative (aria-hidden); the live spans are written by
 * useHudTelemetry through `data-hud` hooks. `style` receives the
 * scroll-linked opacity/scale.
 */
export interface HudFrameProps {
  /** Scroll-linked motion values (opacity / scale) — omitted on mobile + reduced motion. */
  style?: MotionStyle;
  /** Flips true once the boot curtain has opened → ticker segments decode in. */
  intro: boolean;
  /** Clip length in seconds, printed as the timecode denominator. */
  duration?: number;
  location?: string;
  coords?: string;
  stamp?: string;
}

const RULER_MAX = 200;
const RULER_STEP = 10;
const RULER_TICKS = Array.from({ length: RULER_MAX / RULER_STEP + 1 }, (_, i) => i * RULER_STEP);

const fmtShort = (sec: number) => {
  const whole = Math.floor(sec);
  const tenth = Math.floor((sec - whole) * 10);
  return `${String(Math.floor(whole / 60)).padStart(2, '0')}:${String(whole % 60).padStart(2, '0')}.${tenth}`;
};

export function HudFrame({
  style,
  intro,
  duration = 10,
  location = 'PASEO DE LA REFORMA',
  coords = '19.4270°N 99.1676°W',
  stamp = 'NOCTURNO · 4K 30P',
}: HudFrameProps) {
  /* `play` runs ignore `delay`; `revealDelay` keeps the churn visible and staggers the decode. */
  const seg = (text: string, hold: number) => (
    <Scramble
      text={text}
      enter={false}
      play={intro}
      duration={0.8 + hold}
      revealDelay={hold}
      className="hud-seg"
    />
  );

  return (
    <m.div className="hud" aria-hidden="true" style={style}>
      <span className="hud-corner hud-corner--tl" />
      <span className="hud-corner hud-corner--tr" />
      <span className="hud-corner hud-corner--bl" />
      <span className="hud-corner hud-corner--br" />

      <div className="hud-ticker">
        <span className="hud-rec">
          REC <i className="hud-dot" />
        </span>
        <time className="hud-time tnum" data-hud="tc-time">
          STANDBY
        </time>
        <span className="hud-sep">·</span>
        {seg(location, 0.1)}
        <span className="hud-sep">·</span>
        {seg(coords, 0.25)}
        <span className="hud-sep">·</span>
        {seg(stamp, 0.4)}
      </div>

      <div className="hud-tc">
        <span className="hud-tc-label tnum" data-hud="tc-label">
          {`STANDBY · POSTER`}
        </span>
        <span className="hud-tc-track">
          <span className="hud-tc-fill" data-hud="tc-fill" />
        </span>
        <span className="hud-tc-dur tnum">{`/ ${fmtShort(duration)}`}</span>
        <span className="hud-hint">
          DESPLAZA
          <i className="hud-hint-arr">↓</i>
        </span>
      </div>

      <div className="hud-alt">
        <span className="hud-alt-label">ALT · M</span>
        <div className="hud-alt-ruler">
          {RULER_TICKS.map((v) => (
            <span
              key={v}
              className={v % 50 === 0 ? 'hud-alt-tick hud-alt-tick--major' : 'hud-alt-tick'}
              style={{ '--t': v / RULER_MAX } as CSSProperties}
            >
              {v % 50 === 0 && <b className="tnum">{v}</b>}
            </span>
          ))}
          <span className="hud-alt-mark" data-hud="alt-mark" />
        </div>
      </div>
    </m.div>
  );
}
