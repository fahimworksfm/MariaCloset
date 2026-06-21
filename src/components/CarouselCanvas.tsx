"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture, Sparkles, ContactShadows } from "@react-three/drei";
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

function RailDriver({
  groupRef,
  targetRot,
  dragging,
}: {
  groupRef: React.MutableRefObject<THREE.Group | null>;
  targetRot: React.MutableRefObject<number>;
  dragging: React.MutableRefObject<boolean>;
}) {
  useFrame((_, dt) => {
    const g = groupRef.current;
    if (!g || dragging.current) return;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, targetRot.current, 6, dt);
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
      if (gl) gl.opacity = (0.18 + 0.5 * front) * pulse;
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
            {/* accent glow halo */}
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

            {/* gilded frame */}
            <RoundedBox args={[CARD_W, CARD_H, 0.16]} radius={0.1} smoothness={4}>
              <meshStandardMaterial
                color="#6e5113"
                emissive="#FFC83D"
                emissiveIntensity={0.35}
                metalness={0.9}
                roughness={0.28}
              />
            </RoundedBox>

            {/* front + back art */}
            <mesh position={[0, 0, 0.09]}>
              <planeGeometry args={[PHOTO_W, PHOTO_H]} />
              <meshBasicMaterial map={textures[i]} toneMapped={false} transparent />
            </mesh>
            <mesh position={[0, 0, -0.09]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[PHOTO_W, PHOTO_H]} />
              <meshBasicMaterial map={textures[i]} toneMapped={false} transparent />
            </mesh>

            {/* depth veil */}
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

  const groupRef = useRef<THREE.Group | null>(null);
  const targetRot = useRef(0);
  const dragging = useRef(false);
  const startX = useRef(0);
  const startRot = useRef(0);

  useEffect(() => {
    const current = groupRef.current?.rotation.y ?? 0;
    let target = -index * anglePer;
    while (target - current > Math.PI) target -= Math.PI * 2;
    while (target - current < -Math.PI) target += Math.PI * 2;
    targetRot.current = target;
  }, [index, anglePer]);

  function indexFromRotation(rot: number): number {
    return ((Math.round(-rot / anglePer) % n) + n) % n;
  }

  function onDown(e: React.PointerEvent) {
    dragging.current = true;
    startX.current = e.clientX;
    startRot.current = groupRef.current?.rotation.y ?? 0;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    if (!dragging.current || !groupRef.current) return;
    groupRef.current.rotation.y = startRot.current + (e.clientX - startX.current) * ROT_SPEED;
  }
  function onUp() {
    if (!dragging.current || !groupRef.current) return;
    dragging.current = false;
    const next = indexFromRotation(groupRef.current.rotation.y);
    let target = -next * anglePer;
    const current = groupRef.current.rotation.y;
    while (target - current > Math.PI) target -= Math.PI * 2;
    while (target - current < -Math.PI) target += Math.PI * 2;
    targetRot.current = target;
    if (next !== index) onIndexChange(next);
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
        <ambientLight intensity={0.6} />
        <directionalLight position={[3, 5, 6]} intensity={1.4} color="#FFE3A6" />
        <directionalLight position={[-5, 2, 3]} intensity={0.85} color="#FF2E88" />
        <pointLight position={[0, -1, 4]} intensity={0.7} color="#12C2B4" />
        <Suspense fallback={null}>
          <Ring items={items} anglePer={anglePer} groupRef={groupRef} />
          <Sparkles count={60} scale={[13, 7, 5]} size={4} speed={0.35} color="#FFD56B" opacity={0.7} />
          <Sparkles count={24} scale={[12, 6, 4]} size={3} speed={0.5} color="#FF8FC4" opacity={0.6} />
          <ContactShadows position={[0, -2.0, 0]} opacity={0.5} scale={14} blur={2.8} far={4} color="#000000" />
        </Suspense>
        <RailDriver groupRef={groupRef} targetRot={targetRot} dragging={dragging} />
      </Canvas>
    </div>
  );
}
