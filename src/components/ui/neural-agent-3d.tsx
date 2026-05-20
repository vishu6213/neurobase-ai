"use client";

import { useRef, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Float, Sphere, MeshDistortMaterial, PerspectiveCamera, Stars } from "@react-three/drei";
import * as THREE from "three";

function RobotHead() {
  const headRef = useRef<THREE.Group>(null!);
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    headRef.current.rotation.y = Math.sin(t * 0.5) * 0.2;
    headRef.current.position.y = Math.sin(t * 2) * 0.1;
  });

  return (
    <group ref={headRef}>
      {/* Main Head Unit */}
      <mesh>
        <boxGeometry args={[2, 2, 2]} />
        <meshPhysicalMaterial 
          color="#111" 
          roughness={0.1} 
          metalness={0.9} 
          emissive="#fbbf24" 
          emissiveIntensity={0.05}
        />
      </mesh>

      {/* Visor/Eyes */}
      <mesh position={[0, 0.4, 1.01]}>
        <planeGeometry args={[1.6, 0.4]} />
        <meshBasicMaterial color="#fbbf24" />
      </mesh>
      
      {/* Scanning Eye Line */}
      <mesh position={[0, 0.4, 1.02]}>
        <planeGeometry args={[0.1, 0.4]} />
        <meshBasicMaterial color="#ef4444" />
        <ScanningEffect />
      </mesh>

      {/* Antenna */}
      <mesh position={[0, 1.2, 0]}>
        <cylinderGeometry args={[0.05, 0.05, 0.8]} />
        <meshStandardMaterial color="#333" />
      </mesh>
      <mesh position={[0, 1.6, 0]}>
        <sphereGeometry args={[0.1, 16, 16]} />
        <meshBasicMaterial color="#fbbf24">
           <PulseEffect />
        </meshBasicMaterial>
      </mesh>
    </group>
  );
}

function ScanningEffect() {
  const ref = useRef<THREE.Mesh>(null!);
  useFrame((state) => {
    ref.current.position.x = Math.sin(state.clock.getElapsedTime() * 4) * 0.7;
  });
  return <mesh ref={ref} position={[0, 0.4, 1.02]}><planeGeometry args={[0.2, 0.4]} /><meshBasicMaterial color="#ef4444" /></mesh>;
}

function PulseEffect() {
  const ref = useRef<THREE.MeshBasicMaterial>(null!);
  useFrame((state) => {
    ref.current.opacity = 0.5 + Math.sin(state.clock.getElapsedTime() * 10) * 0.5;
  });
  return null;
}

export function NeuralAgent3D({ className }: { className?: string }) {
  return (
    <div className={className}>
      <Canvas shadows dpr={[1, 2]}>
        <PerspectiveCamera makeDefault position={[0, 0, 8]} fov={40} />
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={2} color="#fbbf24" />
        <Stars radius={50} depth={50} count={1000} factor={4} saturation={0} fade speed={1} />
        <Float speed={2} rotationIntensity={0.5} floatIntensity={0.5}>
          <RobotHead />
        </Float>
      </Canvas>
    </div>
  );
}
