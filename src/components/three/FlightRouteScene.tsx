'use client';

import { useEffect, useRef, type RefObject } from 'react';
import * as THREE from 'three';

/**
 * FlightRouteScene — scroll-scrubbed "flight route" over a topographic
 * wireframe terrain (the HeroDroneScene terrain / curve / drone approach,
 * rebuilt here so the hero file stays untouched).
 *
 * The section drives `u` (0 → 1) through `handleRef.current.setProgress(u)`
 * from ScrollTrigger; the scene eases towards it every frame. The drone rides
 * a Catmull-Rom route through the three waypoints; a second Catmull-Rom curve
 * above / behind it carries a chase camera that keeps the drone in frame.
 * Waypoint markers pop when passed, the flown part of the route lights up
 * (drawRange on a tube), and the section's HTML labels are projected to the
 * marker tops every frame (transform only).
 *
 * Raw three, no R3F. THREE.Timer (Clock is deprecated), DPR ≤ 1.5, the rAF
 * loop is paused by an IntersectionObserver while the canvas is off-screen,
 * pointer parallax nudges the camera ±, and everything is disposed on unmount.
 */

export interface RouteWaypoint {
  id: string;
  name: string;
  lat: number;
  lon: number;
  /** Stylised position on the terrain plane (x → east, z → south). */
  x: number;
  z: number;
}

export interface FlightRouteHandle {
  /** Scroll progress 0 → 1 (eased inside the scene). */
  setProgress: (u: number) => void;
  /** Arc-length fraction of the route at which each waypoint is reached. */
  getWaypointU: () => number[];
}

export interface FlightRouteReadyInfo {
  waypointU: number[];
}

export interface FlightRouteSceneProps {
  waypoints: readonly RouteWaypoint[];
  /** The section reads `setProgress` through this ref (works through next/dynamic, unlike `ref`). */
  handleRef: RefObject<FlightRouteHandle | null>;
  /** HTML labels (one per waypoint) that the scene positions each frame. */
  labelRefs?: RefObject<(HTMLElement | null)[]>;
  onReady?: (info: FlightRouteReadyInfo) => void;
  className?: string;
}

/* Archive v2 tokens as hex (three needs numbers; oklch is not parseable). */
const C = {
  bg: 0x0b0b0d, // ChapterTint 'route'
  signal: 0xc3692d,
  fg: 0xe8e6e1,
  dim: 0x807a72,
  scan: 0xb8d6d1,
  fill: 0x141210,
  glow: 0xffb070,
} as const;

/** Same relief family as the hero terrain, one extra octave for the flyover. */
const heightAt = (x: number, z: number): number =>
  Math.sin(x * 0.35) * 0.45 +
  Math.cos(z * 0.4) * 0.6 +
  Math.sin((x + z) * 0.18) * 0.8 +
  Math.sin(x * 0.9 + z * 0.7) * 0.16 -
  1.2;

/** Deterministic LCG so the particle field is identical on every mount. */
const seeded = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s * 1664525 + 1013904223) >>> 0;
    return s / 4294967296;
  };
};

const clamp01 = (n: number) => (n < 0 ? 0 : n > 1 ? 1 : n);

const TUBE_SEGMENTS = 240;
const TUBE_RADIAL = 6;
const CAM_SAMPLES = 72;
const MARKER_H = 1.7;

export function FlightRouteScene({
  waypoints,
  handleRef,
  labelRefs,
  onReady,
  className,
}: FlightRouteSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const targetRef = useRef(0);
  const waypointURef = useRef<number[]>([]);
  const onReadyRef = useRef(onReady);

  useEffect(() => {
    onReadyRef.current = onReady;
  });

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    /* ---------- handle -------------------------------------------------- */
    handleRef.current = {
      setProgress: (u) => {
        targetRef.current = clamp01(u);
      },
      getWaypointU: () => waypointURef.current.slice(),
    };

    let W = container.clientWidth || 1;
    let H = container.clientHeight || 1;

    /* ---------- renderer / scene / camera -------------------------------- */
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(C.bg, 9, 34);

    const camera = new THREE.PerspectiveCamera(46, W / H, 0.1, 120);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    renderer.setSize(W, H);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    /* ---------- terrain --------------------------------------------------- */
    const terrainGeo = new THREE.PlaneGeometry(52, 36, 104, 72);
    terrainGeo.rotateX(-Math.PI / 2);
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      pos.setY(i, heightAt(pos.getX(i), pos.getZ(i)));
    }
    terrainGeo.computeVertexNormals();

    const terrainMat = new THREE.MeshBasicMaterial({
      color: C.signal,
      wireframe: true,
      transparent: true,
      opacity: 0.2,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    scene.add(terrain);

    const fillMat = new THREE.MeshBasicMaterial({
      color: C.fill,
      transparent: true,
      opacity: 0.6,
    });
    const fill = new THREE.Mesh(terrainGeo, fillMat);
    fill.position.y = -0.03;
    scene.add(fill);

    /* ---------- route (drone curve through the waypoints) ------------------ */
    const wpPts = waypoints.map(
      (w) => new THREE.Vector3(w.x, heightAt(w.x, w.z) + 2.3, w.z),
    );
    const ctrl: THREE.Vector3[] = [];
    const first = wpPts[0];
    const last = wpPts[wpPts.length - 1];
    ctrl.push(first.clone().add(new THREE.Vector3(-4.5, 0.5, -3)));
    wpPts.forEach((p, i) => {
      ctrl.push(p);
      const next = wpPts[i + 1];
      if (!next) return;
      const mid = p.clone().add(next).multiplyScalar(0.5);
      const dir = next.clone().sub(p).setY(0).normalize();
      const side = new THREE.Vector3(-dir.z, 0, dir.x).multiplyScalar(i % 2 === 0 ? 2.4 : -2.4);
      mid.add(side);
      mid.y = heightAt(mid.x, mid.z) + 3.1;
      ctrl.push(mid);
    });
    ctrl.push(last.clone().add(new THREE.Vector3(4.5, 0.7, -3)));

    const curve = new THREE.CatmullRomCurve3(ctrl, false, 'centripetal');

    /* arc-length fraction at which each waypoint is reached (closest sample in XZ) */
    const N = 512;
    const samples = curve.getSpacedPoints(N);
    const waypointU = wpPts.map((p) => {
      let best = 0;
      let bestD = Infinity;
      for (let i = 0; i <= N; i++) {
        const s = samples[i];
        const d = (s.x - p.x) ** 2 + (s.z - p.z) ** 2;
        if (d < bestD) {
          bestD = d;
          best = i;
        }
      }
      return best / N;
    });
    waypointURef.current = waypointU;

    /* faint dashed route + faint tube (full), bright tube (flown part) */
    const pathGeo = new THREE.BufferGeometry().setFromPoints(curve.getPoints(200));
    const pathMat = new THREE.LineDashedMaterial({
      color: C.fg,
      dashSize: 0.14,
      gapSize: 0.16,
      transparent: true,
      opacity: 0.35,
    });
    const path = new THREE.Line(pathGeo, pathMat);
    path.computeLineDistances();
    scene.add(path);

    const tubeGeo = new THREE.TubeGeometry(curve, TUBE_SEGMENTS, 0.022, TUBE_RADIAL, false);
    const tubeDimMat = new THREE.MeshBasicMaterial({
      color: C.signal,
      transparent: true,
      opacity: 0.14,
    });
    scene.add(new THREE.Mesh(tubeGeo, tubeDimMat));

    const trailGeo = tubeGeo.clone();
    trailGeo.setDrawRange(0, 0);
    const trailMat = new THREE.MeshBasicMaterial({
      color: C.signal,
      transparent: true,
      opacity: 0.85,
    });
    scene.add(new THREE.Mesh(trailGeo, trailMat));

    /* ---------- chase camera curve ----------------------------------------- */
    const up = new THREE.Vector3(0, 1, 0);
    const camPts: THREE.Vector3[] = [];
    for (let i = 0; i <= CAM_SAMPLES; i++) {
      const u = i / CAM_SAMPLES;
      const p = curve.getPointAt(u);
      const t = curve.getTangentAt(u);
      const side = new THREE.Vector3().crossVectors(t, up).normalize();
      const c = p
        .clone()
        .addScaledVector(t, -4.6)
        .addScaledVector(up, 2.4 + Math.sin(u * Math.PI) * 0.6)
        .addScaledVector(side, Math.sin(u * Math.PI * 2) * 1.6);
      c.y = Math.max(c.y, heightAt(c.x, c.z) + 1.2);
      camPts.push(c);
    }
    const camCurve = new THREE.CatmullRomCurve3(camPts, false, 'centripetal');

    /* ---------- drone ------------------------------------------------------ */
    const drone = new THREE.Group();
    const armMat = new THREE.MeshBasicMaterial({ color: C.fg });
    const armGeoA = new THREE.BoxGeometry(0.5, 0.03, 0.03);
    const armGeoB = new THREE.BoxGeometry(0.03, 0.03, 0.5);
    const bodyGeo = new THREE.SphereGeometry(0.08, 12, 12);
    const bodyMat = new THREE.MeshBasicMaterial({ color: C.signal });
    const rotorGeo = new THREE.RingGeometry(0.09, 0.11, 16);
    const rotorMat = new THREE.MeshBasicMaterial({
      color: C.signal,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.7,
    });
    const rotors: THREE.Mesh[] = [];
    (
      [
        [0.25, 0, 0],
        [-0.25, 0, 0],
        [0, 0, 0.25],
        [0, 0, -0.25],
      ] as const
    ).forEach((p) => {
      const r = new THREE.Mesh(rotorGeo, rotorMat);
      r.rotation.x = Math.PI / 2;
      r.position.set(p[0], p[1] + 0.02, p[2]);
      rotors.push(r);
      drone.add(r);
    });
    drone.add(new THREE.Mesh(armGeoA, armMat), new THREE.Mesh(armGeoB, armMat), new THREE.Mesh(bodyGeo, bodyMat));
    const glowMat = new THREE.MeshBasicMaterial({ color: C.glow, transparent: true, opacity: 0.9 });
    drone.add(new THREE.Mesh(new THREE.SphereGeometry(0.06, 8, 8), glowMat));
    scene.add(drone);

    /* ---------- waypoint markers ------------------------------------------- */
    const ringGeo = new THREE.RingGeometry(0.34, 0.38, 40);
    const ringGeoOuter = new THREE.RingGeometry(0.6, 0.615, 48);
    const topGeo = new THREE.SphereGeometry(0.055, 10, 10);
    const mastGeo = new THREE.BufferGeometry().setFromPoints([
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(0, MARKER_H, 0),
    ]);
    interface Marker {
      group: THREE.Group;
      mats: (THREE.MeshBasicMaterial | THREE.LineBasicMaterial)[];
      scale: number;
      alpha: number;
    }
    const markers: Marker[] = waypoints.map((w) => {
      const g = new THREE.Group();
      const y = heightAt(w.x, w.z) + 0.04;
      g.position.set(w.x, y, w.z);
      const rm = new THREE.MeshBasicMaterial({ color: C.signal, side: THREE.DoubleSide, transparent: true, opacity: 0.9 });
      const rm2 = new THREE.MeshBasicMaterial({ color: C.scan, side: THREE.DoubleSide, transparent: true, opacity: 0.35 });
      const mm = new THREE.LineBasicMaterial({ color: C.dim, transparent: true, opacity: 0.8 });
      const tm = new THREE.MeshBasicMaterial({ color: C.fg, transparent: true, opacity: 1 });
      const ring = new THREE.Mesh(ringGeo, rm);
      ring.rotation.x = -Math.PI / 2;
      const ring2 = new THREE.Mesh(ringGeoOuter, rm2);
      ring2.rotation.x = -Math.PI / 2;
      const mast = new THREE.Line(mastGeo, mm);
      const top = new THREE.Mesh(topGeo, tm);
      top.position.y = MARKER_H;
      g.add(ring, ring2, mast, top);
      g.scale.setScalar(0.001);
      scene.add(g);
      return { group: g, mats: [rm, rm2, mm, tm], scale: 0.001, alpha: 0 };
    });

    /* ---------- particles --------------------------------------------------- */
    const rand = seeded(20260903);
    const starCount = 260;
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (rand() - 0.5) * 52;
      starPos[i * 3 + 1] = rand() * 9 + 0.5;
      starPos[i * 3 + 2] = (rand() - 0.5) * 36;
    }
    const starGeo = new THREE.BufferGeometry();
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: C.fg,
      size: 0.028,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
    });
    const stars = new THREE.Points(starGeo, starMat);
    scene.add(stars);

    /* ---------- pointer parallax ---------------------------------------------- */
    const ptr = { x: 0, y: 0, tx: 0, ty: 0 };
    const onPointerMove = (e: PointerEvent) => {
      ptr.tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ptr.ty = -((e.clientY / window.innerHeight - 0.5) * 2);
    };
    const onPointerLeave = () => {
      ptr.tx = 0;
      ptr.ty = 0;
    };
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    document.documentElement.addEventListener('pointerleave', onPointerLeave);

    /* ---------- frame loop ---------------------------------------------------- */
    const timer = new THREE.Timer();
    timer.connect(document);

    const state = { u: targetRef.current, prevUIndex: -1 };
    const dronePos = new THREE.Vector3();
    const ahead = new THREE.Vector3();
    const look = new THREE.Vector3();
    const camPos = new THREE.Vector3();
    const camSide = new THREE.Vector3();
    const proj = new THREE.Vector3();
    const tangent = new THREE.Vector3();

    let raf = 0;
    let running = false;
    let ready = false;

    const projectLabels = () => {
      const els = labelRefs?.current;
      if (!els) return;
      for (let i = 0; i < markers.length; i++) {
        const el = els[i];
        if (!el) continue;
        const m = markers[i];
        proj.set(m.group.position.x, m.group.position.y + (MARKER_H + 0.22) * m.scale, m.group.position.z);
        proj.project(camera);
        const front = proj.z > -1 && proj.z < 1;
        const sx = (proj.x * 0.5 + 0.5) * W;
        const sy = (-proj.y * 0.5 + 0.5) * H;
        el.style.transform = `translate3d(${sx.toFixed(1)}px, ${sy.toFixed(1)}px, 0)`;
        const inside = front && sx > -80 && sx < W + 80 && sy > -40 && sy < H + 40;
        if (el.dataset.front !== (inside ? '1' : '0')) el.dataset.front = inside ? '1' : '0';
      }
    };

    const tick = () => {
      if (!running) return;
      raf = requestAnimationFrame(tick);
      timer.update();
      const t = timer.getElapsed();
      const dt = Math.min(timer.getDelta(), 0.05);
      const k = 1 - Math.exp(-dt * 10);

      /* eased scroll progress */
      state.u += (targetRef.current - state.u) * k;
      const u = clamp01(state.u);
      const uSafe = Math.min(Math.max(u, 0.0005), 0.9995);

      /* drone */
      curve.getPointAt(uSafe, dronePos);
      curve.getTangentAt(uSafe, tangent);
      drone.position.copy(dronePos);
      drone.position.y += Math.sin(t * 2.2) * 0.05;
      ahead.copy(dronePos).addScaledVector(tangent, 1);
      drone.lookAt(ahead);
      drone.rotation.z += Math.sin(t * 1.5) * 0.1 - tangent.x * 0.15;
      for (let i = 0; i < rotors.length; i++) {
        rotors[i].scale.setScalar(1 + Math.sin(t * 22 + i) * 0.08);
      }
      glowMat.opacity = 0.6 + Math.sin(t * 4) * 0.35;

      /* flown trail */
      const seg = Math.floor(u * TUBE_SEGMENTS);
      trailGeo.setDrawRange(0, seg * TUBE_RADIAL * 6);

      /* markers pop when passed */
      for (let i = 0; i < markers.length; i++) {
        const m = markers[i];
        const passed = u >= waypointU[i] - 0.01;
        const targetScale = passed ? 1 : 0.42;
        const targetAlpha = passed ? 1 : 0.35;
        m.scale += (targetScale - m.scale) * Math.min(1, k * 1.4);
        m.alpha += (targetAlpha - m.alpha) * Math.min(1, k * 1.4);
        m.group.scale.setScalar(Math.max(0.001, m.scale));
        m.group.rotation.y = passed ? t * 0.35 : 0;
        m.mats[0].opacity = 0.9 * m.alpha;
        m.mats[1].opacity = 0.35 * m.alpha;
        m.mats[2].opacity = 0.8 * m.alpha;
        m.mats[3].opacity = m.alpha;
      }

      /* chase camera + pointer parallax */
      ptr.x += (ptr.tx - ptr.x) * k * 0.6;
      ptr.y += (ptr.ty - ptr.y) * k * 0.6;
      camCurve.getPointAt(uSafe, camPos);
      camSide.crossVectors(tangent, up).normalize();
      camPos.addScaledVector(camSide, ptr.x * 1.3).addScaledVector(up, ptr.y * 0.7);
      camera.position.lerp(camPos, Math.min(1, k * 1.2));
      look.copy(dronePos).addScaledVector(tangent, 0.9).addScaledVector(camSide, ptr.x * 0.3);
      look.y += 0.2 + ptr.y * 0.2;
      camera.lookAt(look);

      /* ambient drift */
      stars.rotation.y = t * 0.012;
      terrain.rotation.z = Math.sin(t * 0.08) * 0.012;
      fill.rotation.z = terrain.rotation.z;

      renderer.render(scene, camera);
      projectLabels();

      if (!ready) {
        ready = true;
        container.dataset.ready = '1';
        onReadyRef.current?.({ waypointU: waypointU.slice() });
      }
    };

    const start = () => {
      if (running) return;
      running = true;
      timer.reset();
      raf = requestAnimationFrame(tick);
    };
    const stop = () => {
      running = false;
      cancelAnimationFrame(raf);
    };

    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) start();
        else stop();
      },
      { rootMargin: '15% 0px' },
    );
    io.observe(container);

    const resize = new ResizeObserver(() => {
      W = container.clientWidth || 1;
      H = container.clientHeight || 1;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
      if (!running) {
        renderer.render(scene, camera);
        projectLabels();
      }
    });
    resize.observe(container);

    /* ---------- cleanup --------------------------------------------------------- */
    return () => {
      stop();
      io.disconnect();
      resize.disconnect();
      timer.disconnect();
      window.removeEventListener('pointermove', onPointerMove);
      document.documentElement.removeEventListener('pointerleave', onPointerLeave);
      handleRef.current = null;
      delete container.dataset.ready;

      const disposed = new Set<THREE.BufferGeometry | THREE.Material>();
      const disposeOne = (r: THREE.BufferGeometry | THREE.Material) => {
        if (disposed.has(r)) return;
        disposed.add(r);
        r.dispose();
      };
      scene.traverse((o) => {
        const obj = o as THREE.Object3D & {
          geometry?: THREE.BufferGeometry;
          material?: THREE.Material | THREE.Material[];
        };
        if (obj.geometry) disposeOne(obj.geometry);
        if (Array.isArray(obj.material)) obj.material.forEach(disposeOne);
        else if (obj.material) disposeOne(obj.material);
      });
      disposeOne(terrainGeo);
      disposeOne(tubeGeo);
      disposeOne(trailGeo);
      disposeOne(mastGeo);
      scene.clear();
      renderer.dispose();
      renderer.forceContextLoss();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [waypoints, handleRef, labelRefs]);

  return <div ref={containerRef} className={className} aria-hidden="true" />;
}

export default FlightRouteScene;
