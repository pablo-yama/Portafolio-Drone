'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import type { MotionValue } from 'framer-motion';

/**
 * UplinkScene — the § 05 Uplink object: a wireframe icosahedron with an inner
 * counter-rotating polyhedron and a 400-point particle shell.
 *
 * Raw three (no R3F). Rotation = idle drift + the section's scroll progress
 * (a framer MotionValue read each frame, never React state); the camera
 * drifts with the pointer (spring-lerped). THREE.Timer drives the clock, DPR
 * is capped at 1.5, the rAF loop is paused while the canvas is off-screen and
 * every geometry / material / renderer is disposed on unmount.
 *
 * Mounted by UplinkSection through next/dynamic({ ssr:false }) — fine pointer
 * + WebGL + ≥4 cores only, and only once the section is within one viewport.
 */
export interface UplinkSceneProps {
  /** Section scroll progress 0 → 1 (useSectionProgress). Optional: idle drift only. */
  progress?: MotionValue<number>;
  className?: string;
}

const PARTICLES = 400;

export function UplinkScene({ progress, className }: UplinkSceneProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef(progress);

  useEffect(() => {
    progressRef.current = progress;
  }, [progress]);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const palette = getComputedStyle(document.documentElement);
    const signal = new THREE.Color(palette.getPropertyValue('--signal').trim() || '#9fc8df');
    const foreground = new THREE.Color(palette.getPropertyValue('--fg').trim() || '#f3f5f7');
    const background = new THREE.Color(palette.getPropertyValue('--panel').trim() || '#151a20');
    const w = c.clientWidth || 1;
    const h = c.clientHeight || 1;

    /* ---------- renderer ---------- */
    let ren: THREE.WebGLRenderer;
    try {
      ren = new THREE.WebGLRenderer({ antialias: true, alpha: true, powerPreference: 'low-power' });
    } catch {
      return;
    }
    ren.setPixelRatio(Math.min(window.devicePixelRatio || 1, 1.5));
    ren.setSize(w, h);
    ren.setClearColor(0x000000, 0);
    ren.domElement.setAttribute('aria-hidden', 'true');
    c.appendChild(ren.domElement);

    /* ---------- scene ---------- */
    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(background, 6, 14);
    const cam = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    cam.position.set(0, 0, 5.4);

    const group = new THREE.Group();
    scene.add(group);

    const outerGeo = new THREE.IcosahedronGeometry(1.8, 1);
    const outerMat = new THREE.MeshBasicMaterial({
      color: signal,
      wireframe: true,
      transparent: true,
      opacity: 0.38,
    });
    const outer = new THREE.Mesh(outerGeo, outerMat);
    group.add(outer);

    const innerGeo = new THREE.IcosahedronGeometry(1.0, 0);
    const innerMat = new THREE.MeshBasicMaterial({
      color: foreground,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const inner = new THREE.Mesh(innerGeo, innerMat);
    group.add(inner);

    /* vertex "pings" on the outer hull */
    const hullPtsMat = new THREE.PointsMaterial({
      color: foreground,
      size: 0.045,
      transparent: true,
      opacity: 0.55,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const hullPts = new THREE.Points(outerGeo, hullPtsMat);
    group.add(hullPts);

    /* particle shell — 400 points between r 2.3 and r 4.2 */
    const positions = new Float32Array(PARTICLES * 3);
    for (let i = 0; i < PARTICLES; i++) {
      const r = 2.3 + Math.random() * 1.9;
      const theta = Math.random() * Math.PI * 2;
      const phi = Math.acos(2 * Math.random() - 1);
      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);
    }
    const cloudGeo = new THREE.BufferGeometry();
    cloudGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    const cloudMat = new THREE.PointsMaterial({
      color: signal,
      size: 0.028,
      transparent: true,
      opacity: 0.5,
      sizeAttenuation: true,
      depthWrite: false,
    });
    const cloud = new THREE.Points(cloudGeo, cloudMat);
    scene.add(cloud);

    /* ---------- pointer parallax (window-level, rAF-lerped) ---------- */
    let tx = 0;
    let ty = 0;
    let cx = 0;
    let cy = 0;
    const onMove = (e: PointerEvent) => {
      tx = (e.clientX / window.innerWidth - 0.5) * 2;
      ty = (e.clientY / window.innerHeight - 0.5) * 2;
    };
    window.addEventListener('pointermove', onMove, { passive: true });

    /* ---------- loop (IO-paused) ---------- */
    const timer = new THREE.Timer();
    let raf = 0;
    let visible = false;
    let idle = 0;

    const frame = (ts: number) => {
      raf = 0;
      if (!visible) return;
      timer.update(ts);
      const dt = Math.min(timer.getDelta(), 0.05);
      idle += dt;

      const p = progressRef.current?.get() ?? 0;
      const scrub = p * Math.PI * 1.35;

      outer.rotation.x = idle * 0.14 + scrub * 0.55;
      outer.rotation.y = idle * 0.22 + scrub;
      inner.rotation.x = -idle * 0.2 - scrub * 0.7;
      inner.rotation.y = idle * 0.3 + scrub * 0.4;
      cloud.rotation.y = idle * 0.04 + scrub * 0.25;
      cloud.rotation.x = -scrub * 0.1;
      const breathe = 1 + Math.sin(idle * 0.8) * 0.02;
      group.scale.setScalar(breathe);

      cx += (tx - cx) * 0.06;
      cy += (ty - cy) * 0.06;
      cam.position.x = cx * 0.7;
      cam.position.y = -cy * 0.45;
      cam.lookAt(0, 0, 0);

      ren.render(scene, cam);
      raf = requestAnimationFrame(frame);
    };

    const start = () => {
      if (raf) return;
      timer.update(performance.now());
      raf = requestAnimationFrame(frame);
    };
    const stop = () => {
      if (raf) cancelAnimationFrame(raf);
      raf = 0;
    };

    const io = new IntersectionObserver(
      (entries) => {
        visible = entries.some((e) => e.isIntersecting);
        if (visible) start();
        else stop();
      },
      { rootMargin: '10% 0px' },
    );
    io.observe(c);

    const onVisibility = () => {
      if (document.hidden) stop();
      else if (visible) start();
    };
    document.addEventListener('visibilitychange', onVisibility);

    /* ---------- resize ---------- */
    const resize = new ResizeObserver(() => {
      const W = c.clientWidth || 1;
      const H = c.clientHeight || 1;
      cam.aspect = W / H;
      cam.updateProjectionMatrix();
      ren.setSize(W, H);
    });
    resize.observe(c);

    return () => {
      stop();
      io.disconnect();
      resize.disconnect();
      document.removeEventListener('visibilitychange', onVisibility);
      window.removeEventListener('pointermove', onMove);
      timer.dispose();
      outerGeo.dispose();
      innerGeo.dispose();
      cloudGeo.dispose();
      outerMat.dispose();
      innerMat.dispose();
      hullPtsMat.dispose();
      cloudMat.dispose();
      scene.clear();
      ren.dispose();
      if (ren.domElement.parentElement === c) c.removeChild(ren.domElement);
    };
  }, []);

  return (
    <div
      ref={containerRef}
      className={['contact-3d', 'uplink-3d', className].filter(Boolean).join(' ')}
      aria-hidden="true"
    />
  );
}

export default UplinkScene;
