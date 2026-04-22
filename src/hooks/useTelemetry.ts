'use client';

import { useEffect } from 'react';

/**
 * useTelemetry — animates the live telemetry sidebar.
 *
 * Drives: altitude, speed, GPS sats, battery (eased toward drifting targets),
 * the crosshair on the flight-path SVG, the mirrored "ALT …M" bar in the navbar,
 * and the rolling session clock. Runs off a single rAF loop.
 */
export function useTelemetry() {
  useEffect(() => {
    const vAlt = document.getElementById('vAlt');
    const bAlt = document.getElementById('bAlt');
    const vSpd = document.getElementById('vSpd');
    const bSpd = document.getElementById('bSpd');
    const vGps = document.getElementById('vGps');
    const bGps = document.getElementById('bGps');
    const vBat = document.getElementById('vBat');
    const bBat = document.getElementById('bBat');
    const cross = document.getElementById('crosshair');
    const pathEl = document.getElementById('flightPath') as SVGPathElement | null;
    const altBar = document.getElementById('altBar');
    const sessClock = document.getElementById('sessClock');

    if (!pathEl || !cross) return;
    const pathLen = pathEl.getTotalLength();

    const telem = { alt: 0, spd: 0, gps: 0, bat: 0 };
    const tgt = { alt: 62, spd: 48, gps: 88, bat: 76 };
    const startTime = performance.now();
    let raf = 0;

    const ease = (a: number, b: number, k: number) => a + (b - a) * k;
    const fmtClock = (ms: number) => {
      const s = Math.floor(ms / 1000);
      const hh = String(Math.floor(s / 3600)).padStart(2, '0');
      const mm = String(Math.floor((s % 3600) / 60)).padStart(2, '0');
      const ss = String(s % 60).padStart(2, '0');
      return `SESIÓN · ${hh}:${mm}:${ss}`;
    };

    const tick = () => {
      const now = performance.now();
      const scroll = Math.min(1, window.scrollY / (window.innerHeight * 0.9));
      tgt.alt = 55 + Math.sin(now * 0.0004) * 15 + scroll * 20;
      tgt.spd = 42 + Math.sin(now * 0.0008) * 22;
      tgt.gps = 82 + Math.sin(now * 0.0006) * 10;
      tgt.bat = Math.max(20, 76 - ((now - startTime) / 180000) * 30);

      telem.alt = ease(telem.alt, tgt.alt, 0.04);
      telem.spd = ease(telem.spd, tgt.spd, 0.04);
      telem.gps = ease(telem.gps, tgt.gps, 0.04);
      telem.bat = ease(telem.bat, tgt.bat, 0.03);

      if (vAlt) vAlt.textContent = `${Math.round(telem.alt * 2)} M`;
      if (bAlt) bAlt.style.width = telem.alt + '%';
      if (vSpd) vSpd.textContent = `${Math.round(telem.spd * 0.3)} M/S`;
      if (bSpd) bSpd.style.width = telem.spd + '%';
      if (vGps) vGps.textContent = `${Math.round(telem.gps / 5)}/22`;
      if (bGps) bGps.style.width = telem.gps + '%';
      if (vBat) vBat.textContent = `${Math.round(telem.bat)}%`;
      if (bBat) bBat.style.width = telem.bat + '%';
      if (altBar) altBar.textContent = `ALT ${Math.round(telem.alt * 2)}M`;

      // Crosshair along the flight path
      const k = (now * 0.00012) % 1;
      const pt = pathEl.getPointAtLength(k * pathLen);
      cross.style.left = (pt.x / 400) * 100 + '%';
      cross.style.top = (pt.y / 220) * 100 + '%';

      if (sessClock) sessClock.textContent = fmtClock(now - startTime);

      raf = requestAnimationFrame(tick);
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, []);
}
