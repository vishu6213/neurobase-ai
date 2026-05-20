'use client';

import { useEffect, useRef, useState } from 'react';
import dynamic from 'next/dynamic';

const Spline = dynamic(() => import('@splinetool/react-spline'), { ssr: false, loading: () => null });
const SCENE = 'https://prod.spline.design/CNqIL1NN25pHBIVd/scene.splinecode';

export function SplineRobotBackground() {
  const [visible, setVisible] = useState(false);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const appRef = useRef<any>(null);
  const mouse = useRef({ x: 0, y: 0, moved: false });

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

  /* ── Spline onLoad: grab app + patch text + cache canvas ── */
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const onLoad = (splineApp: any) => {
    appRef.current = splineApp;
    canvasRef.current = containerRef.current?.querySelector('canvas') as HTMLCanvasElement ?? null;

    // 1. Try updating via Spline variables if set up in the editor
    try {
      splineApp.setVariable("UNIVERSAL DYNAMICS", "NEUROBASE");
      splineApp.setVariable("text", "NEUROBASE");
      splineApp.setVariable("title", "NEUROBASE");
      splineApp.setVariable("headline", "NEUROBASE");
    } catch {
      // Ignore if variables are not defined
    }

    // 2. Query all objects in the scene to inspect and modify directly
    try {
      const allObjects = splineApp.getAllObjects?.() ?? [];
      console.log("ALL SPLINE OBJECT NAMES:", allObjects.map((o: any) => o.name));

      for (const obj of allObjects) {
        const nameLower = (obj.name || "").toLowerCase();

        // --- A. Remove the "25% off" element / badge / CTAs ---
        if (
          nameLower.includes("25%") ||
          nameLower.includes("off") ||
          nameLower.includes("badge") ||
          nameLower.includes("discount") ||
          nameLower.includes("promo") ||
          nameLower.includes("sale") ||
          nameLower.includes("pill") ||
          nameLower.includes("button") ||
          nameLower.includes("cta")
        ) {
          obj.visible = false;
          if (typeof obj.hide === "function") {
            obj.hide();
          }
        }

        // --- B. Change "UNIVERSAL DYNAMICS" text to "NEUROBASE" ---
        if (
          nameLower.includes("universal") ||
          nameLower.includes("dynamics") ||
          nameLower.includes("neurobase") ||
          nameLower.includes("bg text") ||
          nameLower.includes("live text") ||
          nameLower.includes("title") ||
          nameLower.includes("headline") ||
          nameLower.includes("text")
        ) {
          // We inspect and set all common internal Spline text property names
          const anyObj = obj as any;

          if (anyObj.text !== undefined) {
            if (typeof anyObj.text === 'string') {
              anyObj.text = anyObj.text
                .replace(/Universal Dynamics/gi, 'NeuroBase')
                .replace(/UNIVERSAL DYNAMICS/gi, 'NEUROBASE')
                .replace(/INTELLIGENT ASSISTANT/gi, 'AUTONOMOUS ONCHAIN')
                .replace(/ROZZUM/gi, 'NEUROBASE');
            } else {
              anyObj.text = "NEUROBASE";
            }
          }
          if (anyObj.content !== undefined) anyObj.content = "NEUROBASE";
          if (anyObj.value !== undefined) anyObj.value = "NEUROBASE";
          if (anyObj.textContent !== undefined) anyObj.textContent = "NEUROBASE";
          if (anyObj.parameters && anyObj.parameters.text !== undefined) {
            anyObj.parameters.text = "NEUROBASE";
          }
        }
      }
    } catch (_) { /* scene may not expose objects */ }
  };

  /* ── Track mouse passively ── */
  useEffect(() => {
    // Start with mouse centered on screen
    mouse.current.x = window.innerWidth / 2;
    mouse.current.y = window.innerHeight / 2;

    const h = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      mouse.current.moved = true;
    };
    window.addEventListener('mousemove', h, { passive: true });
    return () => window.removeEventListener('mousemove', h);
  }, []);

  /* ── RAF: 60fps buttery smooth direct rotation & lerping ── */
  useEffect(() => {
    let af: number;

    // Store current rotation values to lerp smoothly over multiple frames (deceleration)
    const currentRot = {
      headX: 0, headY: 0,
      eyeX: 0, eyeY: 0
    };

    const tick = () => {
      af = requestAnimationFrame(tick);

      const { x, y } = mouse.current;
      const app = appRef.current;

      if (app) {
        const nx = (x / window.innerWidth) * 2 - 1;   // -1..1
        const ny = -(y / window.innerHeight) * 2 + 1;  // -1..1

        // Target rotation limits in radians
        const targetHeadY = nx * 0.42;  // Look left/right (~24 degrees)
        const targetHeadX = -ny * 0.22; // Look up/down (~13 degrees)
        const targetEyeY = nx * 0.16;   // Subtler eye tracking
        const targetEyeX = -ny * 0.10;

        // Apply smooth lerp (10% adjustment per frame) for 60fps organic glide
        currentRot.headY += (targetHeadY - currentRot.headY) * 0.08;
        currentRot.headX += (targetHeadX - currentRot.headX) * 0.08;
        currentRot.eyeY += (targetEyeY - currentRot.eyeY) * 0.12;
        currentRot.eyeX += (targetEyeX - currentRot.eyeX) * 0.12;

        // Apply rotations directly to Head Roz
        const head = app.findObjectByName?.('Head Roz');
        if (head) {
          head.rotation.y = currentRot.headY;
          head.rotation.x = currentRot.headX;
        }

        // Apply rotations directly to L Eye and R Eye
        const lEye = app.findObjectByName?.('L Eye');
        const rEye = app.findObjectByName?.('R Eye');
        if (lEye) {
          lEye.rotation.y = currentRot.eyeY;
          lEye.rotation.x = currentRot.eyeX;
        }
        if (rEye) {
          rEye.rotation.y = currentRot.eyeY;
          rEye.rotation.x = currentRot.eyeX;
        }

        // Also check if there's any standard follower object (fallback)
        const TARGETS = ['Mouse', 'Cursor', 'Target', 'Camera Target', 'Follow Target'];
        for (const name of TARGETS) {
          const obj = app.findObjectByName?.(name);
          if (obj) {
            obj.position.x = nx * 600;
            obj.position.y = ny * 400;
            break;
          }
        }
      }

      // ── Dispatch synthetic MouseEvent to canvas (triggers Spline's own raycaster fallback) ──
      if (mouse.current.moved) {
        let c = canvasRef.current;
        if (!c) {
          c = containerRef.current?.querySelector('canvas') as HTMLCanvasElement | null;
          if (c) canvasRef.current = c;
        }
        if (c) {
          c.dispatchEvent(new MouseEvent('mousemove', {
            clientX: x, clientY: y,
            bubbles: true, cancelable: false, view: window,
            screenX: x, screenY: y,
          }));
        }
        mouse.current.moved = false; // Reset to prevent redundant GPU hit-testing
      }
    };

    af = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(af);
  }, []);

  return (
    <>
      <div ref={sentinelRef} aria-hidden="true" />

      <div
        aria-hidden="true"
        style={{
          position: 'fixed', inset: 0, zIndex: 0,
          pointerEvents: 'none',
          opacity: visible ? 1 : 0,
          transition: 'opacity 0.8s ease',
          transform: 'translateZ(0)', willChange: 'opacity',
        }}
      >
        <div ref={containerRef} style={{ position: 'absolute', inset: 0, transform: 'translateZ(0)' }}>
          <Spline scene={SCENE} style={{ width: '100%', height: '100%' }} onLoad={onLoad} />
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

        {/* Hide Spline watermark */}
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0, height: 72, zIndex: 10,
          background: 'linear-gradient(to top, #000 0%, transparent 100%)'
        }} />
      </div>
    </>
  );
}
