'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ContactUplinkScene — wire globe + orbit rings + orbiting pings + dust points.
 *
 * Raw Three.js (no R3F) mounted into a positioned div. Reads the current
 * `--signal` CSS variable to tint the globe/orbits. Mouse movement drifts the
 * camera x/y; a ResizeObserver keeps the scene sized to its container.
 */
export function ContactUplinkScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const w = container.clientWidth || 1;
    const h = container.clientHeight || 1;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0a, 8, 24);

    const cam = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    cam.position.set(0, 0, 9);

    const ren = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    ren.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    ren.setSize(w, h);
    ren.setClearColor(0, 0);
    container.appendChild(ren.domElement);

    // Parse the current --signal CSS variable; fall back to burnt orange
    const signalRaw = getComputedStyle(document.documentElement)
      .getPropertyValue('--signal')
      .trim();
    const sigColor = new THREE.Color();
    try {
      sigColor.set(signalRaw || '#c3692d');
    } catch {
      sigColor.set('#c3692d');
    }

    // wire globe
    const globe = new THREE.Mesh(
      new THREE.SphereGeometry(2.4, 32, 24),
      new THREE.MeshBasicMaterial({
        color: sigColor,
        wireframe: true,
        transparent: true,
        opacity: 0.18,
      }),
    );
    scene.add(globe);

    // inner solid
    const inner = new THREE.Mesh(
      new THREE.SphereGeometry(2.35, 48, 32),
      new THREE.MeshBasicMaterial({ color: 0x0a0a0a, transparent: true, opacity: 0.7 }),
    );
    scene.add(inner);

    // orbit rings
    const orbits: THREE.Mesh[] = [];
    for (let i = 0; i < 3; i++) {
      const r = 2.6 + i * 0.35;
      const g = new THREE.RingGeometry(r, r + 0.005, 96);
      const m = new THREE.MeshBasicMaterial({
        color: sigColor,
        side: THREE.DoubleSide,
        transparent: true,
        opacity: 0.35,
      });
      const ring = new THREE.Mesh(g, m);
      ring.rotation.x = Math.PI / 2 + (Math.random() - 0.5) * 0.6;
      ring.rotation.z = Math.random() * Math.PI;
      scene.add(ring);
      orbits.push(ring);
    }

    // pings (dots orbiting) — store orbit params in a parallel array so we
    // don't have to fight Three.js' generic `userData: Record<string, any>`
    interface PingOrbit {
      r: number;
      speed: number;
      phase: number;
      tilt: number;
    }
    const pings: THREE.Mesh[] = [];
    const pingOrbits: PingOrbit[] = [];
    for (let i = 0; i < 5; i++) {
      const p = new THREE.Mesh(
        new THREE.SphereGeometry(0.05, 8, 8),
        new THREE.MeshBasicMaterial({ color: sigColor }),
      );
      scene.add(p);
      pings.push(p);
      pingOrbits.push({
        r: 2.7 + Math.random() * 0.6,
        speed: 0.2 + Math.random() * 0.4,
        phase: Math.random() * Math.PI * 2,
        tilt: (Math.random() - 0.5) * 0.8,
      });
    }

    // floating dust
    const dust = new THREE.BufferGeometry();
    const dp = new Float32Array(300 * 3);
    for (let i = 0; i < 300; i++) {
      dp[i * 3] = (Math.random() - 0.5) * 16;
      dp[i * 3 + 1] = (Math.random() - 0.5) * 10;
      dp[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    dust.setAttribute('position', new THREE.BufferAttribute(dp, 3));
    const dustMesh = new THREE.Points(
      dust,
      new THREE.PointsMaterial({
        color: 0xe8e6e1,
        size: 0.02,
        transparent: true,
        opacity: 0.5,
      }),
    );
    scene.add(dustMesh);

    let mx = 0;
    let my = 0;
    const onMove = (e: MouseEvent) => {
      mx = e.clientX / window.innerWidth - 0.5;
      my = e.clientY / window.innerHeight - 0.5;
    };
    window.addEventListener('mousemove', onMove);

    const clock = new THREE.Clock();
    let raf = 0;
    const loop = () => {
      const t = clock.getElapsedTime();
      globe.rotation.y = t * 0.1;
      globe.rotation.x = Math.sin(t * 0.15) * 0.15 + my * 0.3;
      inner.rotation.copy(globe.rotation);
      orbits.forEach((r, i) => {
        r.rotation.z += 0.001 * (i + 1);
      });
      pings.forEach((p, i) => {
        const o = pingOrbits[i];
        const a = t * o.speed + o.phase;
        p.position.x = Math.cos(a) * o.r;
        p.position.z = Math.sin(a) * o.r;
        p.position.y = Math.sin(a * 2) * o.tilt;
      });
      dustMesh.rotation.y = t * 0.02;
      cam.position.x += (mx * 2 - cam.position.x) * 0.05;
      cam.position.y += (-my * 1.5 - cam.position.y) * 0.05;
      cam.lookAt(0, 0, 0);
      ren.render(scene, cam);
      raf = requestAnimationFrame(loop);
    };
    loop();

    const ro = new ResizeObserver(() => {
      const W = container.clientWidth || 1;
      const H = container.clientHeight || 1;
      cam.aspect = W / H;
      cam.updateProjectionMatrix();
      ren.setSize(W, H);
    });
    ro.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      window.removeEventListener('mousemove', onMove);
      if (ren.domElement.parentNode) {
        ren.domElement.parentNode.removeChild(ren.domElement);
      }
      ren.dispose();
      globe.geometry.dispose();
      (globe.material as THREE.Material).dispose();
      inner.geometry.dispose();
      (inner.material as THREE.Material).dispose();
      orbits.forEach((r) => {
        r.geometry.dispose();
        (r.material as THREE.Material).dispose();
      });
      pings.forEach((p) => {
        p.geometry.dispose();
        (p.material as THREE.Material).dispose();
      });
      dust.dispose();
      (dustMesh.material as THREE.Material).dispose();
    };
  }, []);

  return <div ref={containerRef} className="bg3d" aria-hidden="true" />;
}

export default ContactUplinkScene;
