'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * HeroDroneScene — topographic wireframe terrain with a small drone
 * flying along a Catmull-Rom curve.
 *
 * Mouse parallax nudges the camera; scroll progress dollies the camera back
 * and down so the terrain lifts out of frame as the page advances. Lightweight
 * raw Three.js (no R3F) to stay close to the original scene.js.
 */
export function HeroDroneScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const w = container.clientWidth;
    const h = container.clientHeight;

    const scene = new THREE.Scene();
    scene.fog = new THREE.Fog(0x0a0a0a, 14, 40);

    const camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 100);
    camera.position.set(0, 5.5, 12);
    camera.lookAt(0, 0, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(w, h);
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Topographic wire terrain
    const terrainGeo = new THREE.PlaneGeometry(40, 28, 80, 56);
    terrainGeo.rotateX(-Math.PI / 2);
    const pos = terrainGeo.attributes.position;
    for (let i = 0; i < pos.count; i++) {
      const x = pos.getX(i);
      const z = pos.getZ(i);
      const y =
        Math.sin(x * 0.35) * 0.45 +
        Math.cos(z * 0.4) * 0.6 +
        Math.sin((x + z) * 0.18) * 0.8 -
        1.2;
      pos.setY(i, y);
    }
    terrainGeo.computeVertexNormals();
    const terrainMat = new THREE.MeshBasicMaterial({
      color: 0xc3692d,
      wireframe: true,
      transparent: true,
      opacity: 0.22,
    });
    const terrain = new THREE.Mesh(terrainGeo, terrainMat);
    scene.add(terrain);

    // Secondary faint fill terrain
    const fillMat = new THREE.MeshBasicMaterial({
      color: 0x181410,
      transparent: true,
      opacity: 0.55,
    });
    const fill = new THREE.Mesh(terrainGeo.clone(), fillMat);
    fill.position.y = -0.02;
    scene.add(fill);

    // Flight path (Catmull-Rom)
    const curve = new THREE.CatmullRomCurve3(
      [
        new THREE.Vector3(-9, 1.8, -5),
        new THREE.Vector3(-4, 2.6, -1),
        new THREE.Vector3(0, 1.4, 2),
        new THREE.Vector3(4, 2.8, 0),
        new THREE.Vector3(8, 1.6, -3),
        new THREE.Vector3(11, 3.0, -6),
      ],
      false,
      'catmullrom',
      0.6,
    );

    const pathPts = curve.getPoints(160);
    const pathGeo = new THREE.BufferGeometry().setFromPoints(pathPts);
    const pathMat = new THREE.LineDashedMaterial({
      color: 0xe8e6e1,
      dashSize: 0.14,
      gapSize: 0.14,
      transparent: true,
      opacity: 0.55,
    });
    const path = new THREE.Line(pathGeo, pathMat);
    path.computeLineDistances();
    scene.add(path);

    // Trailing glow tube along curve
    const tubeGeo = new THREE.TubeGeometry(curve, 120, 0.02, 6, false);
    const tubeMat = new THREE.MeshBasicMaterial({
      color: 0xc3692d,
      transparent: true,
      opacity: 0.45,
    });
    scene.add(new THREE.Mesh(tubeGeo, tubeMat));

    // Drone = small cross of bars + dot
    const drone = new THREE.Group();
    const armMat = new THREE.MeshBasicMaterial({ color: 0xe8e6e1 });
    const arm1 = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.03, 0.03), armMat);
    const arm2 = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.03, 0.5), armMat);
    const body = new THREE.Mesh(
      new THREE.SphereGeometry(0.08, 12, 12),
      new THREE.MeshBasicMaterial({ color: 0xc3692d }),
    );
    const rotorPositions: [number, number, number][] = [
      [0.25, 0, 0],
      [-0.25, 0, 0],
      [0, 0, 0.25],
      [0, 0, -0.25],
    ];
    rotorPositions.forEach((p) => {
      const r = new THREE.Mesh(
        new THREE.RingGeometry(0.09, 0.11, 16),
        new THREE.MeshBasicMaterial({
          color: 0xc3692d,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.7,
        }),
      );
      r.rotation.x = Math.PI / 2;
      r.position.set(p[0], p[1] + 0.02, p[2]);
      drone.add(r);
    });
    drone.add(arm1, arm2, body);
    scene.add(drone);

    // Emissive glow under the drone
    const glow = new THREE.Mesh(
      new THREE.SphereGeometry(0.06, 8, 8),
      new THREE.MeshBasicMaterial({ color: 0xffb070, transparent: true, opacity: 0.9 }),
    );
    drone.add(glow);

    // Floating particles
    const starCount = 220;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      starPos[i * 3] = (Math.random() - 0.5) * 40;
      starPos[i * 3 + 1] = Math.random() * 8 + 1;
      starPos[i * 3 + 2] = (Math.random() - 0.5) * 30;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const stars = new THREE.Points(
      starGeo,
      new THREE.PointsMaterial({
        color: 0xe8e6e1,
        size: 0.025,
        transparent: true,
        opacity: 0.55,
      }),
    );
    scene.add(stars);

    // External state hooked into mouse + scroll listeners
    const state = { scroll: 0, mx: 0, my: 0 };

    const onMouseMove = (e: MouseEvent) => {
      state.mx = (e.clientX / window.innerWidth - 0.5) * 2;
      state.my = -((e.clientY / window.innerHeight - 0.5) * 2);
    };
    const onScroll = () => {
      const heroH = window.innerHeight;
      state.scroll = Math.min(1, window.scrollY / (heroH * 0.9));
      document.documentElement.style.setProperty('--vy', 50 - state.scroll * 20 + '%');
    };
    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('scroll', onScroll, { passive: true });

    const clock = new THREE.Clock();
    let raf = 0;
    const tick = () => {
      const t = clock.getElapsedTime();
      // Drone along curve
      const u = (t * 0.06) % 1;
      const p = curve.getPointAt(u);
      const p2 = curve.getPointAt((u + 0.01) % 1);
      drone.position.copy(p);
      drone.position.y += Math.sin(t * 2.2) * 0.06;
      drone.lookAt(p2);
      drone.rotation.z = Math.sin(t * 1.5) * 0.12;
      // Rotor twitch via slight scale
      drone.children.slice(0, 4).forEach((r, i) => {
        (r as THREE.Mesh).scale.setScalar(1 + Math.sin(t * 20 + i) * 0.08);
      });
      (glow.material as THREE.MeshBasicMaterial).opacity = 0.6 + Math.sin(t * 4) * 0.35;

      // Terrain drift
      terrain.rotation.z = Math.sin(t * 0.1) * 0.02;
      fill.rotation.z = terrain.rotation.z;

      // Camera parallax + scroll dolly
      const targetX = state.mx * 1.2;
      const targetY = 5.5 + state.my * 0.8 - state.scroll * 3;
      camera.position.x += (targetX - camera.position.x) * 0.05;
      camera.position.y += (targetY - camera.position.y) * 0.05;
      camera.position.z = 12 - state.scroll * 2;
      camera.lookAt(0, -state.scroll * 1.5, 0);

      // Stars twinkle
      stars.rotation.y = t * 0.015;

      renderer.render(scene, camera);
      raf = requestAnimationFrame(tick);
    };
    tick();

    const resize = new ResizeObserver(() => {
      const W = container.clientWidth;
      const H = container.clientHeight;
      camera.aspect = W / H;
      camera.updateProjectionMatrix();
      renderer.setSize(W, H);
    });
    resize.observe(container);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('scroll', onScroll);
      resize.disconnect();
      renderer.dispose();
      if (renderer.domElement.parentElement === container) {
        container.removeChild(renderer.domElement);
      }
    };
  }, []);

  return <div ref={containerRef} className="hero-3d" id="hero3d" />;
}

export default HeroDroneScene;
