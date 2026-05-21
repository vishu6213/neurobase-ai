"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { usePerformanceBudget } from "@/hooks/use-performance-budget";

function Particles({ count = 150 }) {
  const points = useRef<THREE.Points>(null!);

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      positions[i * 3] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 1] = (Math.random() - 0.5) * 10;
      positions[i * 3 + 2] = (Math.random() - 0.5) * 10;
    }
    return positions;
  }, [count]);

  useFrame((state) => {
    const time = state.clock.getElapsedTime() * 0.05;
    if (points.current) {
      points.current.rotation.y = time;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        color="#ffd700"
        transparent
        opacity={0.15}
        sizeAttenuation
        blending={THREE.AdditiveBlending}
      />
    </points>
  );
}

export function VFXBackground() {
  const { isMobile, isLowPower } = usePerformanceBudget();
  const [mounted, setMounted] = useState(false);
  const [webglSupported, setWebglSupported] = useState(true);

  useEffect(() => {
    setMounted(true);
    try {
      const canvas = document.createElement("canvas");
      const gl = canvas.getContext("webgl", { alpha: false });
      if (!gl) setWebglSupported(false);
    } catch (e) {
      setWebglSupported(false);
    }
  }, []);

  if (!mounted) return <div className="fixed inset-0 -z-10 bg-black" />;

  if (isMobile || isLowPower || !webglSupported) {
    return (
      <div className="fixed inset-0 -z-10 bg-black">
        {/* Glow */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,215,0,0.04),rgba(220,38,38,0.01)_50%,transparent_100%)]" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-95" />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 -z-10 bg-black">
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 75 }}
        gl={{ 
          antialias: false, 
          powerPreference: "high-performance",
          stencil: false,
          depth: false
        }}
        dpr={1}
      >
        <Particles />
      </Canvas>
      <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-90" />
      <div className="absolute inset-0 backdrop-blur-[100px]" />
    </div>
  );
}

