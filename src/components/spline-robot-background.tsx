'use client';

import { useEffect, useRef, useState, useMemo, Suspense } from 'react';
import { Canvas, extend, useFrame, useThree } from '@react-three/fiber';
import { useAspect, useTexture } from '@react-three/drei';
import * as THREE from 'three/webgpu';
import { bloom } from 'three/examples/jsm/tsl/display/BloomNode.js';
import { Mesh } from 'three';
import { usePerformanceBudget } from '@/hooks/use-performance-budget';

import {
  abs,
  blendScreen,
  float,
  mod,
  mx_cell_noise_float,
  oneMinus,
  smoothstep,
  texture,
  uniform,
  uv,
  vec2,
  vec3,
  pass,
  mix,
  add
} from 'three/tsl';

const TEXTUREMAP = { src: 'https://i.postimg.cc/XYwvXN8D/img-4.png' };
const DEPTHMAP = { src: 'https://i.postimg.cc/2SHKQh2q/raw-4.webp' };

// Extend Three elements in fiber
extend(THREE as any);

// Post Processing component
const PostProcessing = ({
  strength = 1,
  threshold = 1,
  fullScreenEffect = true,
}: {
  strength?: number;
  threshold?: number;
  fullScreenEffect?: boolean;
}) => {
  const { gl, scene, camera } = useThree();
  const progressRef = useRef({ value: 0 });

  const render = useMemo(() => {
    const postProcessing = new THREE.PostProcessing(gl as any);
    const scenePass = pass(scene, camera);
    const scenePassColor = scenePass.getTextureNode('output');

    // Create the scanning effect uniform
    const uScanProgress = uniform(0);
    progressRef.current = uScanProgress;

    // Create a red overlay that follows the scan line
    const scanPos = float(uScanProgress.value);
    const uvY = uv().y;
    const scanWidth = float(0.05);
    const scanLine = smoothstep(0, scanWidth, abs(uvY.sub(scanPos)));
    const redOverlay = vec3(1, 0, 0).mul(oneMinus(scanLine)).mul(0.4);

    // Mix the original scene with the red overlay
    const withScanEffect = mix(
      scenePassColor,
      add(scenePassColor, redOverlay),
      fullScreenEffect ? smoothstep(0.9, 1.0, oneMinus(scanLine)) : 1.0
    );

    // Add bloom effect ONLY if native WebGPU is supported (WebGL fallback does not support compute shaders)
    const hasNativeWebGPU = typeof navigator !== 'undefined' && !!(navigator as any).gpu;
    let final = withScanEffect;

    if (hasNativeWebGPU) {
      try {
        const bloomPass = bloom(scenePassColor, strength, 0.5, threshold);
        final = withScanEffect.add(bloomPass);
      } catch (err) {
        console.warn("Bloom node skipped:", err);
      }
    }

    postProcessing.outputNode = final;

    return postProcessing;
  }, [camera, gl, scene, strength, threshold, fullScreenEffect]);

  useFrame(({ clock }) => {
    // Animate the scan line from top to bottom
    progressRef.current.value = (Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5);
    render.renderAsync();
  }, 1);

  return null;
};

const WIDTH = 300;
const HEIGHT = 300;

const Scene = () => {
  const [rawMap, depthMap] = useTexture([TEXTUREMAP.src, DEPTHMAP.src]);

  const meshRef = useRef<Mesh>(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (rawMap && depthMap) {
      setVisible(true);
    }
  }, [rawMap, depthMap]);

  const { material, uniforms } = useMemo(() => {
    const uPointer = uniform(new THREE.Vector2(0));
    const uProgress = uniform(0);

    const strength = 0.01;

    const tDepthMap = texture(depthMap);

    const tMap = texture(
      rawMap,
      uv().add(tDepthMap.r.mul(uPointer).mul(strength))
    );

    const aspect = float(WIDTH).div(HEIGHT);
    const tUv = vec2(uv().x.mul(aspect), uv().y);

    const tiling = vec2(120.0);
    const tiledUv = mod(tUv.mul(tiling), 2.0).sub(1.0);

    const brightness = mx_cell_noise_float(tUv.mul(tiling).div(2));

    const dist = float(tiledUv.length());
    const dot = float(smoothstep(0.5, 0.49, dist)).mul(brightness);

    const depth = tDepthMap.r;

    const flow = oneMinus(smoothstep(0, 0.02, abs(depth.sub(uProgress))));

    const mask = dot.mul(flow).mul(vec3(10, 0, 0));

    const final = blendScreen(tMap, mask);

    const material = new THREE.MeshBasicNodeMaterial({
      colorNode: final,
      transparent: true,
      opacity: 0,
    });

    return {
      material,
      uniforms: {
        uPointer,
        uProgress,
      },
    };
  }, [rawMap, depthMap]);

  const [w, h] = useAspect(WIDTH, HEIGHT);

  useFrame(({ clock }) => {
    uniforms.uProgress.value = (Math.sin(clock.getElapsedTime() * 0.5) * 0.5 + 0.5);
    // Smooth transition
    if (meshRef.current && 'material' in meshRef.current && meshRef.current.material) {
      const mat = meshRef.current.material as any;
      if ('opacity' in mat) {
        mat.opacity = THREE.MathUtils.lerp(
          mat.opacity,
          visible ? 1 : 0,
          0.07
        );
      }
    }
  });

  useFrame(({ pointer }) => {
    uniforms.uPointer.value = pointer;
  });

  const scaleFactor = 0.40; // Zoom out background to match the exact reference image
  return (
    <mesh ref={meshRef} scale={[w * scaleFactor, h * scaleFactor, 1]} material={material}>
      <planeGeometry />
    </mesh>
  );
};

export function SplineRobotBackground() {
  const { isMobile, isLowPower } = usePerformanceBudget();
  const [visible, setVisible] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [webGPUSupported, setWebGPUSupported] = useState(true);
  const sentinelRef = useRef<HTMLDivElement>(null);

  // Set mounted client state
  useEffect(() => {
    setMounted(true);
  }, []);

  /* ── Scroll visibility trigger (Ensures it is only visible from second slide onwards) ── */
  useEffect(() => {
    const handleScroll = () => {
      // Trigger background once scrolled past ~75% of the first slide viewport height
      const threshold = window.innerHeight * 0.75;
      setVisible(window.scrollY >= threshold);
    };
    handleScroll();
    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleScroll);
    };
  }, []);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" />

      {(!mounted || !webGPUSupported) ? (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 0,
            pointerEvents: 'none',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.8s ease',
            transform: 'translateZ(0)',
            willChange: 'opacity',
            background: '#000',
          }}
        >
          {/* Glowing radial gold-tinted core */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'radial-gradient(circle at 50% 40%, rgba(255,215,0,0.08) 0%, transparent 68%)'
          }} />
          {/* Glowing deep red accent */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'radial-gradient(circle at 20% 80%, rgba(220,38,38,0.05) 0%, transparent 60%)'
          }} />
          {/* Subtle grid pattern overlay */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            backgroundImage: 'linear-gradient(rgba(255,255,255,0.012) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.012) 1px, transparent 1px)',
            backgroundSize: '40px 40px',
            opacity: 0.4
          }} />

          {/* Vignettes for blending */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0.2) 0%, rgba(0,0,0,0.85) 100%)'
          }} />
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.5) 0%, transparent 20%, transparent 78%, rgba(0,0,0,0.75) 100%)'
          }} />
          {/* Bottom fade */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 72, zIndex: 10,
            background: 'linear-gradient(to top, #000 0%, transparent 100%)'
          }} />
        </div>
      ) : (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed', inset: 0, zIndex: 0,
            pointerEvents: 'none',
            opacity: visible ? 1 : 0,
            transition: 'opacity 0.8s ease',
            transform: 'translateZ(0)', willChange: 'opacity',
            background: '#000',
          }}
        >
          {/* WebGPU canvas container with WebGL fallback */}
          <div style={{ position: 'absolute', inset: 0, transform: 'translateZ(0)' }}>
            <Canvas
              flat
              gl={async (props) => {
                try {
                  const renderer = new THREE.WebGPURenderer(props as any);
                  await renderer.init();
                  return renderer;
                } catch (e) {
                  console.warn("WebGPU initialization failed in canvas, trying WebGL fallback:", e);
                  try {
                    const renderer = new THREE.WebGPURenderer({ ...props, forceWebGL: true } as any);
                    await renderer.init();
                    return renderer;
                  } catch (err) {
                    console.error("WebGL fallback failed:", err);
                    setWebGPUSupported(false);
                    throw err;
                  }
                }
              }}
            >
              <PostProcessing fullScreenEffect={true} />
              <Suspense fallback={null}>
                <Scene />
              </Suspense>
            </Canvas>
          </div>

          {/* Dark radial vignette */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 1,
            background: 'radial-gradient(ellipse 80% 80% at 50% 50%, rgba(0,0,0,0.38) 0%, rgba(0,0,0,0.86) 100%)'
          }} />

          {/* Top/bottom fade */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 20%, transparent 78%, rgba(0,0,0,0.75) 100%)'
          }} />

          {/* NeuroBase gold tint */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2, mixBlendMode: 'screen',
            background: 'radial-gradient(ellipse 55% 55% at 65% 46%, rgba(255,215,0,0.07) 0%, transparent 65%)'
          }} />

          {/* Bottom fade */}
          <div style={{
            position: 'absolute', bottom: 0, left: 0, right: 0, height: 72, zIndex: 10,
            background: 'linear-gradient(to top, #000 0%, transparent 100%)'
          }} />
        </div>
      )}
    </>
  );
}
