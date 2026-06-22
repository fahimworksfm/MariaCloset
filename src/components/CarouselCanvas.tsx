"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import {
  RoundedBox,
  useTexture,
  Sparkles,
  ContactShadows,
  Environment,
  Lightformer,
} from "@react-three/drei";
import { EffectComposer, Bloom, Vignette } from "@react-three/postprocessing";
import * as THREE from "three";
import type { Item } from "@/lib/types";

const CARD_W = 2.0;
const CARD_H = 2.7;
const RADIUS = 3.2;
const CAM_Z = 8.2;
const ROT_SPEED = 0.009;
const PHOTO_W = CARD_W - 0.18;
const PHOTO_H = CARD_H - 0.18;

let _glow: THREE.CanvasTexture | null = null;
function glowTexture(): THREE.CanvasTexture {
  if (_glow) return _glow;
  const c = document.createElement("canvas");
  c.width = c.height = 160;
  const ctx = c.getContext("2d")!;
  const g = ctx.createRadialGradient(80, 80, 0, 80, 80, 80);
  g.addColorStop(0, "rgba(255,255,255,1)");
  g.addColorStop(0.35, "rgba(255,255,255,0.5)");
  g.addColorStop(1, "rgba(255,255,255,0)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, 160, 160);
  _glow = new THREE.CanvasTexture(c);
  return _glow;
}

type Props = {
  items: Item[];
  index: number;
  onIndexChange: (index: number) => void;
};

type Refs = {
  groupRef: React.MutableRefObject<THREE.Group | null>;
  targetRot: React.MutableRefObject<number>;
  velocity: React.MutableRefObject<number>;
  dragging: React.MutableRefObject<boolean>;
};

/** Drives rotation: direct while dragging, momentum coast on release, then
 *  spring-snap to the nearest card. */
function RailDriver({
  refs,
  anglePer,
  count,
  onSettle,
}: {
  refs: Refs;
  anglePer: number;
  count: number;
  onSettle: (i: number) => void;
}) {
  useFrame((_, dt) => {
    const g = refs.groupRef.current;
    if (!g || refs.dragging.current) return;
    const v = refs.velocity.current;
    if (Math.abs(v) > 0.2) {
      g.rotation.y += v * dt;
      refs.velocity.current = v * Math.exp(-3.5 * dt); // friction
    } else if (v !== 0) {
      refs.velocity.current = 0;
      const idx = ((Math.round(-g.rotation.y / anglePer) % count) + count) % count;
      let target = -idx * anglePer;
      while (target - g.rotation.y > Math.PI) target -= Math.PI * 2;
      while (target - g.rotation.y < -Math.PI) target += Math.PI * 2;
      refs.targetRot.current = target;
      onSettle(idx);
    } else {
      g.rotation.y = THREE.MathUtils.damp(g.rotation.y, refs.targetRot.current, 6, dt);
    }
  });
  return null;
}

function Ring({
  items,
  anglePer,
  groupRef,
}: {
  items: Item[];
  anglePer: number;
  groupRef: React.MutableRefObject<THREE.Group | null>;
}) {
  const textures = useTexture(items.map((i) => i.image)) as THREE.Texture[];
  const cardRefs = useRef<(THREE.Group | null)[]>([]);
  const veilRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const glowRefs = useRef<(THREE.MeshBasicMaterial | null)[]>([]);
  const glow = glowTexture();

  for (const t of textures) {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  }

  useFrame((state) => {
    const base = groupRef.current?.rotation.y ?? 0;
    const t = state.clock.elapsedTime;
    const pulse = 0.85 + 0.15 * Math.sin(t * 2);
    items.forEach((_, i) => {
      const front = Math.max(0, Math.cos(i * anglePer + base));
      const card = cardRefs.current[i];
      if (card) {
        const target = 0.82 + 0.22 * front;
        card.scale.setScalar(THREE.MathUtils.lerp(card.scale.x, target, 0.12));
        card.position.y = Math.sin(t * 0.6 + i * 1.3) * 0.045;
      }
      const veil = veilRefs.current[i];
      if (veil) veil.opacity = THREE.MathUtils.lerp(veil.opacity, (1 - front) * 0.55, 0.12);
      const gl = glowRefs.current[i];
      if (gl) gl.opacity = (0.05 + 0.16 * front) * pulse;
    });
  });

  return (
    <group ref={groupRef}>
      {items.map((item, i) => {
        const a = i * anglePer;
        return (
          <group
            key={item.id}
            position={[Math.sin(a) * RADIUS, 0, Math.cos(a) * RADIUS]}
            rotation={[0, a, 0]}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
          >
            <mesh position={[0, 0, -0.28]}>
              <planeGeometry args={[CARD_W * 2.1, CARD_H * 1.7]} />
              <meshBasicMaterial
                ref={(el) => {
                  glowRefs.current[i] = el;
                }}
                map={glow}
                color={item.accent}
                transparent
                opacity={0}
                blending={THREE.AdditiveBlending}
                depthWrite={false}
              />
            </mesh>

            <RoundedBox args={[CARD_W, CARD_H, 0.16]} radius={0.1} smoothness={4}>
              <meshStandardMaterial
                color="#7a5c16"
                emissive="#FFC83D"
                emissiveIntensity={0.22}
                metalness={1}
                roughness={0.22}
              />
            </RoundedBox>

            <mesh position={[0, 0, 0.09]}>
              <planeGeometry args={[PHOTO_W, PHOTO_H]} />
              <meshBasicMaterial map={textures[i]} toneMapped={false} transparent />
            </mesh>
            <mesh position={[0, 0, -0.09]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[PHOTO_W, PHOTO_H]} />
              <meshBasicMaterial map={textures[i]} toneMapped={false} transparent />
            </mesh>

            <mesh position={[0, 0, 0.1]}>
              <planeGeometry args={[CARD_W, CARD_H]} />
              <meshBasicMaterial
                ref={(el) => {
                  veilRefs.current[i] = el;
                }}
                color="#1A0826"
                transparent
                opacity={0}
                depthWrite={false}
              />
            </mesh>
          </group>
        );
      })}
    </group>
  );
}

export default function CarouselCanvas({ items, index, onIndexChange }: Props) {
  const n = items.length;
  const anglePer = (Math.PI * 2) / n;

  const refs: Refs = {
    groupRef: useRef<THREE.Group | null>(null),
    targetRot: useRef(0),
    velocity: useRef(0),
    dragging: useRef(false),
  };
  const startX = useRef(0);
  const startRot = useRef(0);
  const lastX = useRef(0);
  const lastT = useRef(0);

  useEffect(() => {
    const current = refs.groupRef.current?.rotation.y ?? 0;
    let target = -index * anglePer;
    while (target - current > Math.PI) target -= Math.PI * 2;
    while (target - current < -Math.PI) target += Math.PI * 2;
    refs.targetRot.current = target;
    refs.velocity.current = 0;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [index, anglePer]);

  function onDown(e: React.PointerEvent) {
    refs.dragging.current = true;
    refs.velocity.current = 0;
    startX.current = e.clientX;
    startRot.current = refs.groupRef.current?.rotation.y ?? 0;
    lastX.current = e.clientX;
    lastT.current = performance.now();
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    const g = refs.groupRef.current;
    if (!refs.dragging.current || !g) return;
    g.rotation.y = startRot.current + (e.clientX - startX.current) * ROT_SPEED;
    const now = performance.now();
    const dt = (now - lastT.current) / 1000;
    if (dt > 0) {
      const step = (e.clientX - lastX.current) * ROT_SPEED;
      refs.velocity.current = THREE.MathUtils.clamp(step / dt, -10, 10);
    }
    lastX.current = e.clientX;
    lastT.current = now;
  }
  function onUp() {
    refs.dragging.current = false; // momentum carries via RailDriver
  }

  return (
    <div
      className="h-full w-full cursor-grab touch-none no-select active:cursor-grabbing"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    >
      <Canvas camera={{ position: [0, 0.25, CAM_Z], fov: 40 }} gl={{ alpha: true, antialias: true }} dpr={[1, 2]}>
        <fog attach="fog" args={["#1A0826", 9.5, 16]} />
        <ambientLight intensity={0.5} />
        <directionalLight position={[3, 5, 6]} intensity={1.0} color="#F2DDB0" />
        <directionalLight position={[-5, 2, 3]} intensity={0.5} color="#9A5468" />
        <pointLight position={[0, -1, 4]} intensity={0.4} color="#3E8C82" />

        <Suspense fallback={null}>
          <Ring items={items} anglePer={anglePer} groupRef={refs.groupRef} />
          <Environment resolution={256} frames={1}>
            <Lightformer intensity={1.8} color="#F2DDB0" position={[0, 2, 5]} scale={[8, 8, 1]} />
            <Lightformer intensity={1.1} color="#9A5468" position={[-5, 1, 2]} scale={[5, 5, 1]} />
            <Lightformer intensity={1.0} color="#3E8C82" position={[5, -1, 2]} scale={[5, 5, 1]} />
            <Lightformer intensity={1.0} color="#C9A24B" position={[0, -3, 3]} scale={[6, 3, 1]} />
          </Environment>
          <Sparkles count={22} scale={[13, 7, 5]} size={3} speed={0.25} color="#D9C28A" opacity={0.4} />
          <ContactShadows position={[0, -2.0, 0]} opacity={0.5} scale={14} blur={2.8} far={4} color="#000000" />
        </Suspense>

        <EffectComposer>
          <Bloom mipmapBlur luminanceThreshold={0.85} luminanceSmoothing={0.3} intensity={0.28} />
          <Vignette offset={0.32} darkness={0.62} eskil={false} />
        </EffectComposer>

        <RailDriver refs={refs} anglePer={anglePer} count={n} onSettle={onIndexChange} />
      </Canvas>
    </div>
  );
}
