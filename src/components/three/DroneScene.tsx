'use client';

import { useRef, useMemo, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { EffectComposer, Bloom } from '@react-three/postprocessing';

/* ───────────────────────────────────────────────
   Constants
   ─────────────────────────────────────────────── */
const ACCENT = new THREE.Color('#00D4FF');
const D = 1.2; // center-to-motor distance
const ARM_ANGLES = [
  Math.PI / 4,
  -Math.PI / 4,
  (3 * Math.PI) / 4,
  -(3 * Math.PI) / 4,
];

// Deterministic scatter offsets per part (body + 4 arms)
const SCATTER = [
  { px: 3, py: 5, pz: -3.5, rx: 3.2, ry: 2.1, rz: 5.4 },
  { px: -5, py: 3, pz: 5.5, rx: 5.1, ry: 1.3, rz: 3.7 },
  { px: 6, py: -4, pz: -3, rx: 2.4, ry: 6.2, rz: 1.1 },
  { px: -4, py: 6, pz: 4.5, rx: 4.3, ry: 3.5, rz: 2.6 },
  { px: 5, py: -5, pz: -5.5, rx: 1.6, ry: 5.3, rz: 4.2 },
];

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

/* ───────────────────────────────────────────────
   Drone Model — EdgesGeometry + holographic base
   ─────────────────────────────────────────────── */
function DroneModel({
  progressRef,
}: {
  progressRef: React.MutableRefObject<number>;
}) {
  const wholeRef = useRef<THREE.Group>(null);
  const bodyRef = useRef<THREE.Group>(null);
  const armRefs = useRef<(THREE.Group | null)[]>([]);
  const propRefs = useRef<(THREE.Group | null)[]>([]);
  const baseRingRef = useRef<THREE.Group>(null);

  /* ── Shared materials ── */
  const edgeMat = useMemo(
    () =>
      new THREE.LineBasicMaterial({
        color: ACCENT,
        transparent: true,
        opacity: 0.9,
        toneMapped: false,
      }),
    [],
  );

  const fillMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: ACCENT,
        transparent: true,
        opacity: 0.04,
        depthWrite: false,
        side: THREE.DoubleSide,
      }),
    [],
  );

  const wireMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        wireframe: true,
        color: ACCENT,
        transparent: true,
        opacity: 0.55,
        toneMapped: false,
      }),
    [],
  );

  const solidMat = useMemo(
    () =>
      new THREE.MeshBasicMaterial({
        color: ACCENT,
        transparent: true,
        opacity: 0.3,
        toneMapped: false,
        side: THREE.DoubleSide,
      }),
    [],
  );

  /* ── Geometries (created once) ── */
  const geos = useMemo(() => {
    const body = new THREE.BoxGeometry(0.65, 0.11, 0.42);
    const bodyTop = new THREE.BoxGeometry(0.35, 0.05, 0.28);
    const cam = new THREE.SphereGeometry(0.055, 8, 6);
    const lens = new THREE.CylinderGeometry(0.025, 0.025, 0.035, 8);
    const led = new THREE.SphereGeometry(0.02, 6, 6);
    const motor = new THREE.CylinderGeometry(0.065, 0.05, 0.065, 8);
    const arm = new THREE.BoxGeometry(D, 0.028, 0.045);
    const landBar = new THREE.BoxGeometry(0.45, 0.015, 0.015);
    const landLeg = new THREE.BoxGeometry(0.015, 0.07, 0.015);
    return { body, bodyTop, cam, lens, led, motor, arm, landBar, landLeg };
  }, []);

  /* ── EdgesGeometry for clean wireframe rendering ── */
  const edgeGeos = useMemo(
    () => ({
      body: new THREE.EdgesGeometry(geos.body, 1),
      bodyTop: new THREE.EdgesGeometry(geos.bodyTop, 1),
      cam: new THREE.EdgesGeometry(geos.cam, 25),
      motor: new THREE.EdgesGeometry(geos.motor, 20),
      arm: new THREE.EdgesGeometry(geos.arm, 1),
      landBar: new THREE.EdgesGeometry(geos.landBar, 1),
      landLeg: new THREE.EdgesGeometry(geos.landLeg, 1),
    }),
    [geos],
  );

  /* ── Holographic base cross-hair ── */
  const crosshairGeo = useMemo(() => {
    const g = new THREE.BufferGeometry();
    const positions = new Float32Array([
      -2.5, 0, 0, 2.5, 0, 0, 0, 0, -2.5, 0, 0, 2.5,
    ]);
    g.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    return g;
  }, []);

  /* ── Animation loop ── */
  useFrame((state, delta) => {
    const p = progressRef.current;
    const aRaw = Math.min(p / 0.25, 1);
    const a = easeOutCubic(aRaw);

    /* Body assembly */
    if (bodyRef.current) {
      const s = SCATTER[0];
      bodyRef.current.position.set(
        s.px * (1 - a),
        s.py * (1 - a),
        s.pz * (1 - a),
      );
      bodyRef.current.rotation.set(
        s.rx * (1 - a),
        s.ry * (1 - a),
        s.rz * (1 - a),
      );
    }

    /* Arm assembly */
    ARM_ANGLES.forEach((angle, i) => {
      const arm = armRefs.current[i];
      if (!arm) return;
      const s = SCATTER[i + 1];
      arm.position.set(
        D * Math.cos(angle) + s.px * (1 - a),
        s.py * (1 - a),
        D * Math.sin(angle) + s.pz * (1 - a),
      );
      arm.rotation.set(
        s.rx * (1 - a),
        s.ry * (1 - a),
        s.rz * (1 - a),
      );
    });

    /* Propeller spin (ramps up near end of assembly) */
    if (aRaw > 0.6) {
      const spinFactor = (aRaw - 0.6) / 0.4;
      propRefs.current.forEach((prop) => {
        if (prop) prop.rotation.y += delta * 22 * spinFactor;
      });
    }

    /* Whole drone: cinematic rotation + gentle float */
    if (wholeRef.current) {
      if (p > 0.2) {
        const rp = (p - 0.2) / 0.8;
        wholeRef.current.rotation.y = rp * Math.PI * 2.5;
        wholeRef.current.rotation.x = Math.sin(rp * Math.PI * 2) * 0.12;
        wholeRef.current.rotation.z = Math.cos(rp * Math.PI * 3) * 0.08;
      }
      wholeRef.current.position.y =
        Math.sin(state.clock.elapsedTime * 0.6) * 0.08;
    }

    /* Holographic base ring rotation */
    if (baseRingRef.current) {
      baseRingRef.current.rotation.y += delta * 0.25;
    }
  });

  return (
    <>
      {/* ════════════ Holographic Base ════════════ */}
      <group position={[0, -0.55, 0]}>
        {/* Concentric rings (inner → outer, decreasing opacity) */}
        {[0.6, 1.2, 1.8].map((r, i) => (
          <mesh key={r} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[r - 0.004, r + 0.004, 64]} />
            <meshBasicMaterial
              color={ACCENT}
              transparent
              opacity={0.12 - i * 0.025}
              side={THREE.DoubleSide}
              depthWrite={false}
            />
          </mesh>
        ))}

        {/* Cross-hair lines */}
        <lineSegments geometry={crosshairGeo}>
          <lineBasicMaterial
            color={ACCENT}
            transparent
            opacity={0.08}
          />
        </lineSegments>

        {/* Rotating outer diagnostic ring */}
        <group ref={baseRingRef}>
          <mesh rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[2.2, 2.23, 48]} />
            <meshBasicMaterial
              color={ACCENT}
              transparent
              opacity={0.2}
              side={THREE.DoubleSide}
              depthWrite={false}
              toneMapped={false}
            />
          </mesh>
          {/* Tick marks on the rotating ring (4 cardinal) */}
          {[0, Math.PI / 2, Math.PI, (3 * Math.PI) / 2].map((a) => (
            <mesh
              key={a}
              position={[
                2.35 * Math.cos(a),
                0,
                2.35 * Math.sin(a),
              ]}
              rotation={[Math.PI / 2, 0, 0]}
            >
              <planeGeometry args={[0.12, 0.008]} />
              <meshBasicMaterial
                color={ACCENT}
                transparent
                opacity={0.3}
                side={THREE.DoubleSide}
                depthWrite={false}
              />
            </mesh>
          ))}
        </group>
      </group>

      {/* ════════════ Drone Model ════════════ */}
      <group ref={wholeRef} scale={1.8}>
        {/* ── Body ── */}
        <group ref={bodyRef}>
          {/* Main fuselage (fill + clean edges) */}
          <mesh geometry={geos.body} material={fillMat} />
          <lineSegments geometry={edgeGeos.body} material={edgeMat} />

          {/* Top sensor cover */}
          <group position={[0, 0.07, 0]}>
            <mesh geometry={geos.bodyTop} material={fillMat} />
            <lineSegments
              geometry={edgeGeos.bodyTop}
              material={edgeMat}
            />
          </group>

          {/* Camera gimbal (edges only) */}
          <group position={[0.12, -0.1, 0]}>
            <lineSegments geometry={edgeGeos.cam} material={edgeMat} />
          </group>

          {/* Camera lens */}
          <mesh
            position={[0.18, -0.1, 0]}
            rotation={[0, 0, Math.PI / 2]}
            geometry={geos.lens}
            material={solidMat}
          />

          {/* Front LED (red) */}
          <mesh position={[0.34, 0.02, 0]} geometry={geos.led}>
            <meshBasicMaterial color="#ff4444" toneMapped={false} />
          </mesh>
          {/* Rear LED (green) */}
          <mesh position={[-0.34, 0.02, 0]} geometry={geos.led}>
            <meshBasicMaterial color="#44ff44" toneMapped={false} />
          </mesh>

          {/* Landing gear */}
          {[-0.18, 0.18].map((z) => (
            <group key={z}>
              <group position={[0, -0.13, z]}>
                <lineSegments
                  geometry={edgeGeos.landBar}
                  material={edgeMat}
                />
              </group>
              {[-0.14, 0.14].map((x) => (
                <group key={x} position={[x, -0.095, z]}>
                  <lineSegments
                    geometry={edgeGeos.landLeg}
                    material={edgeMat}
                  />
                </group>
              ))}
            </group>
          ))}
        </group>

        {/* ── Arms (x4) ── */}
        {ARM_ANGLES.map((angle, i) => {
          const cx = Math.cos(angle);
          const cz = Math.sin(angle);
          return (
            <group
              key={i}
              ref={(el) => {
                armRefs.current[i] = el;
              }}
            >
              {/* Arm beam (fill + edges) */}
              <group
                position={[(-D * cx) / 2, 0, (-D * cz) / 2]}
                rotation={[0, -angle, 0]}
              >
                <mesh geometry={geos.arm} material={fillMat} />
                <lineSegments
                  geometry={edgeGeos.arm}
                  material={edgeMat}
                />
              </group>

              {/* Motor housing (wireframe — shows facets for tech look) */}
              <group
                position={[0, 0.035, 0]}
                rotation={[Math.PI / 2, 0, 0]}
              >
                <mesh geometry={geos.motor} material={wireMat} />
              </group>

              {/* Propeller assembly (spins) */}
              <group
                ref={(el) => {
                  propRefs.current[i] = el;
                }}
                position={[0, 0.075, 0]}
              >
                {/* Prop guard ring */}
                <mesh rotation={[Math.PI / 2, 0, 0]}>
                  <torusGeometry args={[0.24, 0.006, 4, 24]} />
                  <meshBasicMaterial
                    color={ACCENT}
                    transparent
                    opacity={0.5}
                    toneMapped={false}
                  />
                </mesh>
                {/* Blade 1 */}
                <mesh
                  rotation={[Math.PI / 2, 0, 0]}
                  material={solidMat}
                >
                  <planeGeometry args={[0.48, 0.022]} />
                </mesh>
                {/* Blade 2 */}
                <mesh
                  rotation={[Math.PI / 2, Math.PI / 2, 0]}
                  material={solidMat}
                >
                  <planeGeometry args={[0.48, 0.022]} />
                </mesh>
              </group>
            </group>
          );
        })}
      </group>
    </>
  );
}

/* ───────────────────────────────────────────────
   Floating Particles
   ─────────────────────────────────────────────── */
function Particles() {
  const ref = useRef<THREE.Points>(null);
  const COUNT = 200;

  const [geometry] = useState(() => {
    const g = new THREE.BufferGeometry();
    const pos = new Float32Array(COUNT * 3);
    for (let i = 0; i < COUNT; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 20;
      pos[i * 3 + 1] = (Math.random() - 0.5) * 15;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 12;
    }
    g.setAttribute('position', new THREE.BufferAttribute(pos, 3));
    return g;
  });

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.y = state.clock.elapsedTime * 0.012;
      ref.current.rotation.x =
        Math.sin(state.clock.elapsedTime * 0.008) * 0.06;
    }
  });

  return (
    <points ref={ref} geometry={geometry}>
      <pointsMaterial
        color={ACCENT}
        size={0.03}
        transparent
        opacity={0.45}
        sizeAttenuation
      />
    </points>
  );
}

/* ───────────────────────────────────────────────
   Exported Scene
   ─────────────────────────────────────────────── */
interface DroneSceneProps {
  progressRef: React.MutableRefObject<number>;
}

export function DroneScene({ progressRef }: DroneSceneProps) {
  return (
    <Canvas
      camera={{ position: [0, 1.2, 4.5], fov: 45 }}
      gl={{ antialias: true, alpha: true }}
      dpr={[1, 2]}
      style={{ background: 'transparent' }}
    >
      <DroneModel progressRef={progressRef} />
      <Particles />
      <EffectComposer>
        <Bloom
          luminanceThreshold={0.1}
          luminanceSmoothing={0.9}
          intensity={1.2}
          mipmapBlur
        />
      </EffectComposer>
    </Canvas>
  );
}

// Default export required for Next.js dynamic() with ssr: false
export default DroneScene;
