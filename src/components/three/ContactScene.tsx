'use client';

import { useEffect, useRef } from 'react';
import * as THREE from 'three';

/**
 * ContactScene — floating wireframe icosahedron backing the contact block.
 * Two nested polyhedra rotate at different rates; purely decorative.
 */
export function ContactScene() {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const c = containerRef.current;
    if (!c) return;
    const w = c.clientWidth;
    const h = c.clientHeight;

    const scene = new THREE.Scene();
    const cam = new THREE.PerspectiveCamera(45, w / h, 0.1, 100);
    cam.position.z = 5;

    const ren = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    ren.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    ren.setSize(w, h);
    ren.setClearColor(0x000000, 0);
    c.appendChild(ren.domElement);

    const mesh = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.8, 1),
      new THREE.MeshBasicMaterial({
        color: 0xc3692d,
        wireframe: true,
        transparent: true,
        opacity: 0.35,
      }),
    );
    scene.add(mesh);

    const inner = new THREE.Mesh(
      new THREE.IcosahedronGeometry(1.0, 0),
      new THREE.MeshBasicMaterial({
        color: 0xe8e6e1,
        wireframe: true,
        transparent: true,
        opacity: 0.2,
      }),
    );
    scene.add(inner);

    const clock = new THREE.Clock();
    let raf = 0;
    const loop = () => {
      const t = clock.getElapsedTime();
      mesh.rotation.x = t * 0.15;
      mesh.rotation.y = t * 0.22;
      inner.rotation.x = -t * 0.2;
      inner.rotation.y = t * 0.3;
      ren.render(scene, cam);
      raf = requestAnimationFrame(loop);
    };
    loop();

    const resize = new ResizeObserver(() => {
      const W = c.clientWidth;
      const H = c.clientHeight;
      cam.aspect = W / H;
      cam.updateProjectionMatrix();
      ren.setSize(W, H);
    });
    resize.observe(c);

    return () => {
      cancelAnimationFrame(raf);
      resize.disconnect();
      ren.dispose();
      if (ren.domElement.parentElement === c) c.removeChild(ren.domElement);
    };
  }, []);

  return <div ref={containerRef} className="contact-3d" id="contact3d" />;
}

export default ContactScene;
