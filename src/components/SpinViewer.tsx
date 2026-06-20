"use client";

import { Suspense, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { RoundedBox, useTexture, ContactShadows } from "@react-three/drei";
import * as THREE from "three";

type Props = {
  images: string[]; // [image] for tilt, or many frames for 360° spin
  accent?: string;
};

function clamp(v: number, lo: number, hi: number) {
  return Math.max(lo, Math.min(hi, v));
}

function Card({
  images,
  rotX,
  rotY,
  frame,
  hasFrames,
}: {
  images: string[];
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

  useFrame((state, dt) => {
    const g = group.current;
    if (!g) return;
    g.rotation.y = THREE.MathUtils.damp(g.rotation.y, rotY.current, 8, dt);
    g.rotation.x = THREE.MathUtils.damp(g.rotation.x, rotX.current, 8, dt);
    g.position.y = Math.sin(state.clock.elapsedTime * 0.8) * 0.06;

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
    <group ref={group}>
      <RoundedBox args={[2.4, 3.3, 0.16]} radius={0.1} smoothness={5}>
        <meshStandardMaterial color="#fbf8f2" roughness={0.7} metalness={0.05} />
      </RoundedBox>
      <mesh position={[0, 0.16, 0.09]}>
        <planeGeometry args={[2.18, 2.78]} />
        <meshBasicMaterial ref={photo} map={textures[0]} toneMapped={false} />
      </mesh>
    </group>
  );
}

export default function SpinViewer({ images, accent = "#4a3f33" }: Props) {
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
      // spring back to face the viewer
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
      <Canvas camera={{ position: [0, 0, 5.2], fov: 42 }} gl={{ alpha: true, antialias: true }} dpr={[1, 2]}>
        <ambientLight intensity={1} />
        <directionalLight position={[3, 5, 5]} intensity={1.1} />
        <directionalLight position={[-4, 1, 2]} intensity={0.3} />
        <Suspense fallback={null}>
          <Card images={images} rotX={rotX} rotY={rotY} frame={frame} hasFrames={hasFrames} />
          <ContactShadows
            position={[0, -1.85, 0]}
            opacity={0.35}
            scale={8}
            blur={2.6}
            far={4}
            color={accent}
          />
        </Suspense>
      </Canvas>
    </div>
  );
}
