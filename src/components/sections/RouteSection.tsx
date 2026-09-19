'use client';

import dynamic from 'next/dynamic';
import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { ScrambleTextPlugin } from 'gsap/ScrambleTextPlugin';
import { Scramble, SplitReveal, type ScrambleHandle } from '@/components/textfx';
import { useMotionPrefs } from '@/hooks/useMotionPrefs';
import type {
  FlightRouteHandle,
  FlightRouteReadyInfo,
  RouteWaypoint,
} from '@/components/three/FlightRouteScene';

gsap.registerPlugin(ScrollTrigger, ScrambleTextPlugin);

const FlightRouteScene = dynamic(
  () => import('@/components/three/FlightRouteScene').then((mod) => mod.FlightRouteScene),
  { ssr: false, loading: () => null },
);

/* ---------- data ------------------------------------------------------------ */

const WAYPOINTS: readonly RouteWaypoint[] = [
  { id: 'cdmx', name: 'CDMX', lat: 19.4326, lon: -99.1332, x: -10.5, z: -4.5 },
  { id: 'morelos', name: 'Morelos', lat: 18.8811, lon: -99.18, x: -0.5, z: 2.6 },
  { id: 'guerrero', name: 'Guerrero', lat: 16.8531, lon: -99.8237, x: 10.5, z: -3 },
];

const rad = (d: number) => (d * Math.PI) / 180;
const haversineKm = (a: RouteWaypoint, b: RouteWaypoint) => {
  const dLat = rad(b.lat - a.lat);
  const dLon = rad(b.lon - a.lon);
  const s =
    Math.sin(dLat / 2) ** 2 + Math.cos(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.sin(dLon / 2) ** 2;
  return 2 * 6371 * Math.asin(Math.sqrt(s));
};

/** Real great-circle length of CDMX → Morelos → Guerrero (≈ 297 km). */
const ROUTE_KM = Math.round(
  WAYPOINTS.slice(1).reduce((acc, w, i) => acc + haversineKm(WAYPOINTS[i], w), 0),
);

const fmtCoord = (w: RouteWaypoint) =>
  `${Math.abs(w.lat).toFixed(4)}°${w.lat >= 0 ? 'N' : 'S'} · ${Math.abs(w.lon).toFixed(4)}°${w.lon >= 0 ? 'E' : 'W'}`;

/** Simulated altitude profile (m AGL) — climbs out of the valley, settles over the coast. */
const altAt = (u: number) =>
  Math.round(112 + 44 * Math.sin(u * Math.PI) + 16 * Math.sin(u * 6.3 + 1) + 8 * Math.sin(u * 15));

const LEGS = ['CDMX → MORELOS', 'MORELOS → GUERRERO', 'GUERRERO · COSTA'] as const;

/* Fallback thresholds until the scene reports the real arc-length fractions. */
const DEFAULT_WP_U = [0.17, 0.5, 0.83];

const pad3 = (n: number) => String(Math.max(0, Math.round(n))).padStart(3, '0');
const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

/* ---------- static route card (SSR / mobile / no-WebGL / reduced) ------------ */

const CARD_W = 800;
const CARD_H = 500;

interface Peak {
  cx: number;
  cy: number;
  r: number;
  n: number;
  k: number;
  a: number;
}

const PEAKS: Peak[] = [
  { cx: 190, cy: 140, r: 22, n: 6, k: 3, a: 0.17 },
  { cx: 590, cy: 330, r: 26, n: 7, k: 4, a: 0.14 },
  { cx: 420, cy: 90, r: 18, n: 4, k: 5, a: 0.12 },
  { cx: 330, cy: 420, r: 20, n: 4, k: 3, a: 0.15 },
];

/** Deterministic distorted-ellipse contour ring (pure → identical on server and client). */
const contourPath = (p: Peak, j: number) => {
  const steps = 60;
  let d = '';
  for (let i = 0; i < steps; i++) {
    const th = (i / steps) * Math.PI * 2;
    const rr =
      p.r * j * (1 + p.a * Math.sin(p.k * th + j * 0.6) + 0.07 * Math.cos((p.k + 2) * th - j));
    const x = p.cx + Math.cos(th) * rr * 1.35;
    const y = p.cy + Math.sin(th) * rr;
    d += `${i === 0 ? 'M' : 'L'}${x.toFixed(1)} ${y.toFixed(1)}`;
  }
  return `${d}Z`;
};

const CONTOURS = PEAKS.flatMap((p) =>
  Array.from({ length: p.n }, (_, j) => ({ d: contourPath(p, j + 1), o: 0.32 - j * 0.035 })),
);

const CARD_WP: readonly [number, number][] = [
  [150, 356],
  [400, 246],
  [662, 322],
];
const CARD_LABEL_SIDE = ['right', 'top', 'left'] as const;
const CARD_ROUTE = `M${CARD_WP[0][0]} ${CARD_WP[0][1]} C 240 300, 320 222, ${CARD_WP[1][0]} ${CARD_WP[1][1]} S 600 352, ${CARD_WP[2][0]} ${CARD_WP[2][1]}`;

/* ---------- gating ------------------------------------------------------------ */

const canRender3D = () => {
  if (typeof document === 'undefined') return false;
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') || canvas.getContext('webgl');
    const cores = navigator.hardwareConcurrency || 2;
    return gl !== null && cores >= 4;
  } catch {
    return false;
  }
};

/**
 * RouteSection — § Ruta. A pinned flyover (220vh, scrub .6) on desktop ≥1024
 * with WebGL and motion allowed: the FlightRouteScene camera dollies along a
 * Catmull-Rom route over the terrain while a mono HUD strip prints DIST / ALT /
 * WP from progress and three HTML labels (CDMX · Morelos · Guerrero) scramble
 * in as the drone passes each waypoint. Kicker Scrambles in, the H2 is a
 * SplitReveal (chars), the lead a SplitReveal (lines).
 *
 * Everywhere else (mobile, coarse pointer, no WebGL, saveData, reduced
 * motion): a static SVG route card — contour lines, the route, three dots —
 * that fades in; on non-reduced devices the route draws and the HUD counts
 * with a light, un-pinned scrub. Reduced motion: final state, opacity only.
 */
export function RouteSection() {
  const rootRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const leadRef = useRef<HTMLDivElement>(null);
  const distRef = useRef<HTMLSpanElement>(null);
  const altRef = useRef<HTMLSpanElement>(null);
  const wpRef = useRef<HTMLSpanElement>(null);
  const legRef = useRef<HTMLSpanElement>(null);
  const railRef = useRef<HTMLSpanElement>(null);
  const outroRef = useRef<HTMLParagraphElement>(null);
  const outroScrambleRef = useRef<ScrambleHandle>(null);
  const labelRefs = useRef<(HTMLElement | null)[]>([]);
  const labelScrambleRefs = useRef<(ScrambleHandle | null)[]>([]);
  const handleRef = useRef<FlightRouteHandle | null>(null);
  const waypointURef = useRef<number[]>(DEFAULT_WP_U);
  const driveRef = useRef<(u: number) => void>(() => {});
  const lastURef = useRef(0);

  const { resolved, desktop, reduced, saveData, finePointer } = useMotionPrefs();
  const [mount3d, setMount3d] = useState(false);
  const want3d = resolved && desktop && !reduced && !saveData && finePointer;
  const active3d = mount3d && want3d;

  /* Lazy-mount the scene at 200% rootMargin (desktop + fine pointer + WebGL only). */
  useEffect(() => {
    const stage = stageRef.current;
    if (!stage || !want3d) return;
    let done = false;
    const io = new IntersectionObserver(
      (entries) => {
        if (done || !entries.some((e) => e.isIntersecting)) return;
        done = true;
        io.disconnect();
        if (canRender3D()) setMount3d(true);
      },
      { rootMargin: '200% 0px' },
    );
    io.observe(stage);
    return () => io.disconnect();
  }, [want3d]);

  /* Mode attribute: '3d' once the scene has painted, 'card' otherwise (DOM only, no state). */
  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    if (!active3d) {
      root.dataset.mode = 'card';
      labelRefs.current.forEach((el) => {
        if (el) el.dataset.on = '0';
      });
    }
  }, [active3d]);

  const onSceneReady = (info: FlightRouteReadyInfo) => {
    waypointURef.current = info.waypointU;
    const root = rootRef.current;
    if (root) root.dataset.mode = '3d';
    driveRef.current(lastURef.current);
  };

  /* Scroll drivers: pinned scrub (3D) · light scrub (card) · final state (reduced). */
  useEffect(() => {
    const root = rootRef.current;
    const stage = stageRef.current;
    const card = cardRef.current;
    if (!root || !stage || !card) return;

    const ctx = gsap.context(() => {
      const railSet = railRef.current ? gsap.quickSetter(railRef.current, 'scaleX') : null;
      const titleSet = titleRef.current ? gsap.quickSetter(titleRef.current, 'y', 'px') : null;
      const leadSet = leadRef.current ? gsap.quickSetter(leadRef.current, 'opacity') : null;
      const routePath = card.querySelector<SVGPathElement>('.route-card-route');
      const cardDots = Array.from(card.querySelectorAll<SVGGElement>('.route-card-wp'));
      const passed = [false, false, false];
      let legIdx = -1;
      let outroOn = false;
      let pinned3d = false;
      let animateLeg = true;

      const drive = (raw: number) => {
        const u = clamp01(raw);
        lastURef.current = u;
        const wpU = waypointURef.current;

        if (distRef.current) distRef.current.textContent = `${pad3(u * ROUTE_KM)} km`;
        if (altRef.current) altRef.current.textContent = `${pad3(altAt(u))} m`;

        let count = 0;
        for (let i = 0; i < WAYPOINTS.length; i++) {
          const on = u >= wpU[i] - 0.01;
          if (on) count = i + 1;
          if (on !== passed[i]) {
            passed[i] = on;
            const el = labelRefs.current[i];
            if (el) el.dataset.on = on ? '1' : '0';
            if (on) labelScrambleRefs.current[i]?.play();
            const dot = cardDots[i];
            if (dot) dot.dataset.on = on ? '1' : '0';
          }
        }
        if (wpRef.current) wpRef.current.textContent = `${String(count).padStart(2, '0')} / 0${WAYPOINTS.length}`;

        const leg = u < wpU[1] ? 0 : u < wpU[2] ? 1 : 2;
        if (leg !== legIdx) {
          const first = legIdx === -1;
          legIdx = leg;
          const el = legRef.current;
          if (el) {
            if (first || !animateLeg) {
              el.textContent = LEGS[leg];
            } else {
              gsap.to(el, {
                duration: 0.6,
                ease: 'none',
                scrambleText: { text: LEGS[leg], chars: '0123456789·/ABCDEF', speed: 0.5 },
              });
            }
          }
        }

        railSet?.(u);
        if (routePath) routePath.style.strokeDashoffset = String(1 - u);

        if (pinned3d) {
          titleSet?.(-u * 36);
          leadSet?.(1 - clamp01((u - 0.55) / 0.22));
        }

        const wantOutro = u >= 0.86;
        if (wantOutro !== outroOn) {
          outroOn = wantOutro;
          if (outroRef.current) outroRef.current.dataset.on = wantOutro ? '1' : '0';
          if (wantOutro) outroScrambleRef.current?.play();
        }
      };
      driveRef.current = drive;

      const mm = gsap.matchMedia();
      mm.add(
        { desktop: '(min-width: 1024px)', reduce: '(prefers-reduced-motion: reduce)' },
        (c) => {
          const { desktop: isDesktop, reduce } = c.conditions as { desktop: boolean; reduce: boolean };

          animateLeg = !reduce;
          if (reduce) {
            pinned3d = false;
            gsap.fromTo(
              card,
              { opacity: 0 },
              { opacity: 1, duration: 0.5, ease: 'power2.out', scrollTrigger: { trigger: card, start: 'top 90%', once: true } },
            );
            drive(1);
            return;
          }

          if (isDesktop && active3d) {
            pinned3d = true;
            ScrollTrigger.create({
              trigger: stage,
              start: 'top top',
              end: '+=220%',
              pin: true,
              scrub: 0.6,
              anticipatePin: 1,
              invalidateOnRefresh: true,
              onUpdate: (self) => {
                handleRef.current?.setProgress(self.progress);
                drive(self.progress);
              },
              onToggle: (self) => {
                stage.dataset.pinned = self.isActive ? '1' : '0';
              },
            });
            drive(0);
            return;
          }

          /* Card mode: entrance + light scrub through the stage (no pin). */
          pinned3d = false;
          gsap.fromTo(
            card,
            { opacity: 0, y: 28 },
            {
              opacity: 1,
              y: 0,
              duration: 1.1,
              ease: 'power3.out',
              scrollTrigger: { trigger: card, start: 'top 88%', once: true },
            },
          );
          ScrollTrigger.create({
            trigger: stage,
            start: 'top 80%',
            end: 'bottom 35%',
            scrub: 0.6,
            onUpdate: (self) => drive(self.progress),
          });
          drive(0);
        },
      );

      return () => mm.revert();
    }, root);

    /* The pin-spacer grows the document — let the triggers below re-measure. */
    const refreshId = active3d ? requestAnimationFrame(() => ScrollTrigger.refresh()) : 0;

    return () => {
      if (refreshId) cancelAnimationFrame(refreshId);
      driveRef.current = () => {};
      ctx.revert();
    };
  }, [active3d]);

  return (
    <section
      className="route"
      id="route"
      data-chapter="route"
      aria-labelledby="route-title"
      ref={rootRef}
    >
      <div className="route-stage" ref={stageRef}>
        {active3d && (
          <FlightRouteScene
            waypoints={WAYPOINTS}
            handleRef={handleRef}
            labelRefs={labelRefs}
            onReady={onSceneReady}
            className="route-canvas"
          />
        )}

        <div className="route-card" ref={cardRef}>
          <svg
            className="route-card-svg"
            viewBox={`0 0 ${CARD_W} ${CARD_H}`}
            preserveAspectRatio="xMidYMid slice"
            role="img"
            aria-label={`Mapa estilizado de la ruta CDMX → Morelos → Guerrero, ${ROUTE_KM} km`}
          >
            <defs>
              <pattern id="route-grid" width="40" height="40" patternUnits="userSpaceOnUse">
                <path d="M 40 0 L 0 0 0 40" fill="none" stroke="var(--line-2)" strokeWidth="1" />
              </pattern>
            </defs>
            <rect width={CARD_W} height={CARD_H} fill="url(#route-grid)" />
            <g className="route-card-contours" fill="none" stroke="var(--fg)" strokeWidth="1">
              {CONTOURS.map((c, i) => (
                <path key={i} d={c.d} opacity={c.o} />
              ))}
            </g>
            <path
              className="route-card-guide"
              d={CARD_ROUTE}
              fill="none"
              stroke="var(--fg)"
              strokeWidth="1"
              strokeDasharray="3 6"
              opacity="0.35"
            />
            <path
              className="route-card-route"
              d={CARD_ROUTE}
              fill="none"
              stroke="var(--signal)"
              strokeWidth="1.5"
              pathLength={1}
              strokeDasharray="1"
              strokeDashoffset="0"
            />
            {WAYPOINTS.map((w, i) => {
              const [cx, cy] = CARD_WP[i];
              const side = CARD_LABEL_SIDE[i];
              const tx = side === 'top' ? 0 : side === 'left' ? -18 : 18;
              const anchor = side === 'top' ? 'middle' : side === 'left' ? 'end' : 'start';
              return (
                <g key={w.id} className="route-card-wp" data-on="1" transform={`translate(${cx} ${cy})`}>
                  <circle className="route-card-ring" r="11" fill="none" stroke="var(--signal)" strokeWidth="1" opacity="0.5" />
                  <circle r="3.5" fill="var(--signal)" />
                  <text
                    className="route-card-name"
                    x={tx}
                    y={side === 'top' ? -20 : 3}
                    textAnchor={anchor}
                    fill="var(--fg)"
                  >
                    {`WP 0${i + 1} · ${w.name.toUpperCase()}`}
                  </text>
                  <text
                    className="route-card-coord"
                    x={tx}
                    y={side === 'top' ? -9 : 14}
                    textAnchor={anchor}
                    fill="var(--dim)"
                  >
                    {fmtCoord(w)}
                  </text>
                </g>
              );
            })}
          </svg>
        </div>

        <ol className="route-legend" aria-label="Puntos de la ruta">
          {WAYPOINTS.map((w, i) => (
            <li key={w.id} className="route-legend-row">
              <span className="route-legend-wp">{`WP 0${i + 1}`}</span>
              <span className="route-legend-name">{w.name}</span>
              <span className="route-legend-coord tnum">{fmtCoord(w)}</span>
            </li>
          ))}
        </ol>

        <div className="route-frame" aria-hidden="true">
          <span className="route-corner route-corner--tl" />
          <span className="route-corner route-corner--tr" />
          <span className="route-corner route-corner--bl" />
          <span className="route-corner route-corner--br" />
        </div>

        <div className="route-copy">
          <div className="kicker route-kicker">
            <Scramble text={`RUTA / CDMX → GUERRERO · ${ROUTE_KM} KM`} duration={1} />
          </div>
          <div className="route-title-wrap" ref={titleRef}>
            <SplitReveal as="h2" mode="chars" id="route-title" className="route-title" stagger={0.02}>
              Tres estados, <span className="b">una ruta.</span>
            </SplitReveal>
          </div>
          <div className="route-lead-wrap" ref={leadRef}>
            <SplitReveal as="p" mode="lines" className="route-lead" delay={0.15}>
              Del Valle de México a la costa del Pacífico: la misma cámara, tres climas y un
              archivo que crece con cada estado que sobrevuelo.
            </SplitReveal>
          </div>
          <p className="sr-only">
            {`Ruta de vuelo: ${WAYPOINTS.map((w) => `${w.name} (${fmtCoord(w)})`).join(' → ')}, ${ROUTE_KM} km en total.`}
          </p>
        </div>

        <ul className="route-labels" aria-hidden="true">
          {WAYPOINTS.map((w, i) => (
            <li
              key={w.id}
              className="route-label"
              data-on="0"
              data-front="0"
              ref={(el) => {
                labelRefs.current[i] = el;
              }}
            >
              <span className="route-label-in">
                <span className="route-label-wp">{`WP 0${i + 1}`}</span>
                <Scramble
                  as="span"
                  className="route-label-name"
                  text={w.name}
                  enter={false}
                  duration={0.7}
                  ref={(h) => {
                    labelScrambleRefs.current[i] = h;
                  }}
                />
                <span className="route-label-coord">{fmtCoord(w)}</span>
              </span>
            </li>
          ))}
        </ul>

        <div className="route-hud" role="group" aria-label="Telemetría de la ruta (simulada)">
          <div className="route-cell">
            <span className="route-k">Dist</span>
            <span className="route-v tnum" ref={distRef}>{`${pad3(ROUTE_KM)} km`}</span>
          </div>
          <div className="route-cell">
            <span className="route-k">Alt</span>
            <span className="route-v tnum" ref={altRef}>{`${pad3(altAt(1))} m`}</span>
          </div>
          <div className="route-cell">
            <span className="route-k">WP</span>
            <span className="route-v tnum" ref={wpRef}>{`0${WAYPOINTS.length} / 0${WAYPOINTS.length}`}</span>
          </div>
          <div className="route-rail" aria-hidden="true">
            <span className="route-rail-fill" ref={railRef} />
          </div>
          <div className="route-cell route-leg">
            <span className="route-k">Tramo</span>
            <span className="route-v" ref={legRef}>{LEGS[LEGS.length - 1]}</span>
          </div>
        </div>

        <p className="route-outro" ref={outroRef} data-on="0" aria-hidden="true">
          <Scramble text={`TRAMO COMPLETO · ${WAYPOINTS.length} ESTADOS · ${ROUTE_KM} KM`} enter={false} ref={outroScrambleRef} />
        </p>
      </div>
    </section>
  );
}

export default RouteSection;
