"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture, ContactShadows, Sparkles } from "@react-three/drei";
import * as THREE from "three";

const CARD_W = 2.4;
const CARD_H = 3.3;

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

type Props = { images: string[]; accent?: string };

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function Card({
  images,
  accent,
  rotX,
  rotY,
  frame,
  hasFrames,
}: {
  images: string[];
  accent: string;
  rotX: React.MutableRefObject<number>;
  rotY: React.MutableRefObject<number>;
  frame: React.MutableRefObject<number>;
  hasFrames: boolean;
}) {
  const textures = useTexture(images) as THREE.Texture[];
  for (const t of textures) {
    t.colorSpace = THREE.SRGBColorSpace;
    t.anisotropy = 8;
  }
  const group = useRef<THREE.Group>(null);
  const photo = useRef<THREE.MeshBasicMaterial>(null);
  const glowMat = useRef<THREE.MeshBasicMaterial>(null);
  const glow = glowTexture();

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, rotY.current, 8, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, rotX.current, 8, dt);
    g.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.06;
    if (glowMat.current) {
      glowMat.current.opacity = 0.45 + 0.12 * Math.sin(state.clock.elapsedTime * 2);
    }
    if (hasFrames && photo.current) {
      const len = textures.length;
      const idx = ((Math.round(frame.current) % len) + len) % len;
      if (photo.current.map !== textures[idx]) {
        photo.current.map = textures[idx];
        photo.current.needsUpdate = true;
      }
    }
  });

  return (
    <group>
      <mesh position={[0, 0, -0.4]}>
        <planeGeometry args={[CARD_W * 2, CARD_H * 1.5]} />
        <meshBasicMaterial
          ref={glowMat}
          map={glow}
          color={accent}
          transparent
          opacity={0.4}
          blending={THREE.AdditiveBlending}
          depthWrite={false}
        />
      </mesh>
      <group ref={group}>
        <RoundedBox args={[CARD_W, CARD_H, 0.18]} radius={0.12} smoothness={5}>
          <meshStandardMaterial
            color="#6e5113"
            emissive="#FFC83D"
            emissiveIntensity={0.4}
            metalness={0.9}
            roughness={0.28}
          />
        </RoundedBox>
        <mesh position={[0, 0, 0.1]}>
          <planeGeometry args={[CARD_W - 0.2, CARD_H - 0.2]} />
          <meshBasicMaterial ref={photo} map={textures[0]} toneMapped={false} transparent />
        </mesh>
      </group>
    </group>
  );
}

export default function SpinViewer({ images, accent = "#FF9A1F" }: Props) {
  const hasFrames = images.length > 1;
  const rotX = useRef(0);
  const rotY = useRef(0);
  const frame = useRef(0);

  const dragging = useRef(false);
  const startX = useRef(0);
  const startY = useRef(0);
  const baseRotX = useRef(0);
  const baseRotY = useRef(0);
  const baseFrame = useRef(0);

  function onDown(e: React.PointerEvent) {
    dragging.current = true;
    startX.current = e.clientX;
    startY.current = e.clientY;
    baseRotX.current = rotX.current;
    baseRotY.current = rotY.current;
    baseFrame.current = frame.current;
    (e.target as Element).setPointerCapture?.(e.pointerId);
  }
  function onMove(e: React.PointerEvent) {
    if (!dragging.current) return;
    const dx = e.clientX - startX.current;
    const dy = e.clientY - startY.current;
    if (hasFrames) {
      frame.current = baseFrame.current + dx * 0.05;
    } else {
      rotY.current = clamp(baseRotY.current + dx * 0.01, -0.95, 0.95);
      rotX.current = clamp(baseRotX.current - dy * 0.008, -0.5, 0.5);
    }
  }
  function onUp() {
    if (!dragging.current) return;
    dragging.current = false;
    if (!hasFrames) {
      rotX.current = 0;
      rotY.current = 0;
    }
  }

  return (
    <div
      className="h-full w-full cursor-grab touch-none no-select active:cursor-grabbing"
      onPointerDown={onDown}
      onPointerMove={onMove}
      onPointerUp={onUp}
      onPointerLeave={onUp}
    >
      <Canvas camera={{ position: [0, 0, 5.4], fov: 42 }} gl={{ alpha: true, antialias: true }} dpr={[1, 2]}>
        <ambientLight intensity={0.7} />
        <directionalLight position={[3, 5, 5]} intensity={1.4} color="#FFE3A6" />
        <directionalLight position={[-4, 1, 2]} intensity={0.7} color="#FF2E88" />
        <pointLight position={[0, -1, 3]} intensity={0.6} color="#12C2B4" />
        <Suspense fallback={null}>
          <Card images={images} accent={accent} rotX={rotX} rotY={rotY} frame={frame} hasFrames={hasFrames} />
          <Sparkles count={40} scale={[6, 7, 4]} size={4} speed={0.4} color="#FFD56B" opacity={0.7} />
          <ContactShadows position={[0, -1.9, 0]} opacity={0.45} scale={9} blur={2.8} far={4} color="#000000" />
        </Suspense>
      </Canvas>
    </div>
  );
}
