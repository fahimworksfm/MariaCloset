"use client";

import { Suspense, useEffect, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture } from "@react-three/drei";
import * as THREE from "three";
import type { Item } from "@/lib/types";

const CARD_W = 2.0;
const CARD_H = 2.7;
const RADIUS = 3.2;
const CAM_Z = 8.0;
const ROT_SPEED = 0.009; // radians per pixel dragged

type Props = {
  items: Item[];
  index: number;
  onIndexChange: (index: number) => void;
};

/** Eases the rail toward the selected card unless the user is dragging it. */
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

  // Correct colour space for the loaded art.
  for (const t of textures) {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  }

  // Per-frame: enlarge the front card, veil the rest for depth.
  useFrame(() => {
    const base = groupRef.current?.rotation.y ?? 0;
    items.forEach((_, i) => {
      const front = Math.max(0, Math.cos(i * anglePer + base));
      const card = cardRefs.current[i];
      if (card) {
        const target = 0.8 + 0.2 * front;
        const s = THREE.MathUtils.lerp(card.scale.x, target, 0.15);
        card.scale.setScalar(s);
      }
      const veil = veilRefs.current[i];
      if (veil) {
        veil.opacity = THREE.MathUtils.lerp(veil.opacity, (1 - front) * 0.4, 0.15);
      }
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
            <RoundedBox args={[CARD_W, CARD_H, 0.14]} radius={0.09} smoothness={4}>
              <meshStandardMaterial color="#fbf8f2" roughness={0.75} metalness={0.04} />
            </RoundedBox>
            {/* front face */}
            <mesh position={[0, 0.12, 0.08]}>
              <planeGeometry args={[CARD_W - 0.18, CARD_H - 0.42]} />
              <meshBasicMaterial map={textures[i]} toneMapped={false} />
            </mesh>
            {/* back face — keeps the rail full of garments from every angle */}
            <mesh position={[0, 0.12, -0.08]} rotation={[0, Math.PI, 0]}>
              <planeGeometry args={[CARD_W - 0.18, CARD_H - 0.42]} />
              <meshBasicMaterial map={textures[i]} toneMapped={false} />
            </mesh>
            <mesh position={[0, 0, 0.13]}>
              <planeGeometry args={[CARD_W, CARD_H]} />
              <meshBasicMaterial
                ref={(el) => {
                  veilRefs.current[i] = el;
                }}
                color="#FBF6EE"
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

  // React to external index changes (arrows / dots) — rotate the short way.
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
    // keep the eased target aligned with where the drag landed
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
      <Canvas
        camera={{ position: [0, 0.25, CAM_Z], fov: 40 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 2]}
      >
        <fog attach="fog" args={["#FBF6EE", 9, 14]} />
        <ambientLight intensity={0.95} />
        <directionalLight position={[3, 5, 6]} intensity={1.1} />
        <directionalLight position={[-4, 2, 2]} intensity={0.35} />
        <Suspense fallback={null}>
          <Ring items={items} anglePer={anglePer} groupRef={groupRef} />
        </Suspense>
        <RailDriver groupRef={groupRef} targetRot={targetRot} dragging={dragging} />
      </Canvas>
    </div>
  );
}
