'use client';

import { useEffect, useRef, useState } from 'react';
import type * as THREE from 'three';

/* ── NeuroBase floating stats ── */
const STATS = [
  { value: '12,400+', label: 'ACTIVE AGENTS',     top: '11%', left: '5%',  delay: 0   },
  { value: '$2.8B+',  label: 'TVL ANALYZED',       top: '7%',  left: '72%', delay: 1.5 },
  { value: '840K+',   label: 'SIGNALS GENERATED',  top: '66%', left: '80%', delay: 3   },
  { value: '99.8%',   label: 'UPTIME SLA',          top: '76%', left: '3%',  delay: 4.5 },
  { value: 'BASE L2', label: 'COINBASE POWERED',   top: '88%', left: '22%', delay: 2   },
  { value: 'GEMINI',  label: 'AI CORE ENGINE',      top: '85%', left: '65%', delay: 5   },
  { value: 'ODOS',    label: 'SWAP AGGREGATOR',     top: '28%', left: '84%', delay: 0.8 },
  { value: 'GOPLUS',  label: 'SECURITY ENGINE',     top: '32%', left: '1%',  delay: 3.5 },
];

/* ── Three.js scene (lazy-imported at runtime) ── */
async function initScene(canvas: HTMLCanvasElement, signal: AbortSignal): Promise<() => void> {
  const THREE = await import('three');
  if (signal.aborted) return () => {};

  const W = window.innerWidth;
  const H = window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: false, alpha: true, powerPreference: 'high-performance' });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
  renderer.setSize(W, H, false);
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(45, W / H, 0.1, 100);
  camera.position.z = 7;

  /* LIGHTS */
  scene.add(new THREE.AmbientLight(0x1a1a33, 3));

  const goldL = new THREE.PointLight(0xffd700, 8, 22);
  goldL.position.set(3, 4, 5);
  scene.add(goldL);

  const redL = new THREE.PointLight(0xff2200, 3, 14);
  redL.position.set(-4, -2, 3);
  scene.add(redL);

  scene.add(Object.assign(new THREE.PointLight(0x2233ff, 1.5, 10), { position: new THREE.Vector3(0, -4, -2) }));

  /* MATERIALS */
  const mk = (p: ConstructorParameters<typeof THREE.MeshStandardMaterial>[0]) =>
    new THREE.MeshStandardMaterial(p);

  const bodyM  = mk({ color: 0x0d1228, metalness: 0.95, roughness: 0.18 });
  const panelM = mk({ color: 0x050510, metalness: 0.3,  roughness: 0.9  });
  const goldM  = mk({ color: 0xffd700, metalness: 1, roughness: 0.05, emissive: new THREE.Color(0xffd700), emissiveIntensity: 0.5 });
  const eyeM   = mk({ color: 0xffd700, emissive: new THREE.Color(0xffd700), emissiveIntensity: 4,   metalness: 0, roughness: 0 });
  const orbM   = mk({ color: 0xffd700, emissive: new THREE.Color(0xffd700), emissiveIntensity: 2.5, metalness: 0, roughness: 0 });
  const redM   = mk({ color: 0xff3300, emissive: new THREE.Color(0xff2200), emissiveIntensity: 1.5, metalness: 0, roughness: 0 });

  const mesh = (g: THREE.BufferGeometry, m: THREE.Material) => new THREE.Mesh(g, m);

  /* ROBOT */
  const robot = new THREE.Group();
  robot.position.set(0.3, -0.3, 0);
  scene.add(robot);

  /* HEAD — this group rotates to follow cursor */
  const head = new THREE.Group();
  head.position.y = 1.85;
  robot.add(head);

  head.add(mesh(new THREE.BoxGeometry(1.55, 1.35, 1.15), bodyM));

  // Visor
  const v = mesh(new THREE.BoxGeometry(1.32, 0.88, 0.13), panelM);
  v.position.set(0, -0.04, 0.56);
  head.add(v);

  // Eyes + rings
  const eyePositions: [number, number, number][] = [[-0.3, 0.08, 0.6], [0.3, 0.08, 0.6]];
  eyePositions.forEach(([x, y, z]) => {
    const e = mesh(new THREE.SphereGeometry(0.14, 14, 14), eyeM);
    e.position.set(x, y, z);
    head.add(e);
    const r = mesh(new THREE.RingGeometry(0.15, 0.22, 16), goldM.clone());
    r.position.set(x, y, z + 0.01);
    head.add(r);
  });

  // Mouth
  const mo = mesh(new THREE.BoxGeometry(0.55, 0.06, 0.08), goldM);
  mo.position.set(0, -0.29, 0.57);
  head.add(mo);

  // Ears
  ([-0.85, 0.85] as number[]).forEach((x) => {
    const e = mesh(new THREE.BoxGeometry(0.14, 0.65, 0.65), bodyM);
    e.position.set(x, 0, 0);
    head.add(e);
  });

  // Antenna
  const ant = mesh(new THREE.CylinderGeometry(0.035, 0.035, 0.7, 8), goldM);
  ant.position.set(0, 1.0, 0);
  head.add(ant);
  const antBall = mesh(new THREE.SphereGeometry(0.09, 12, 12), eyeM.clone());
  antBall.position.set(0, 1.38, 0);
  head.add(antBall);

  /* NECK */
  const neck = mesh(new THREE.CylinderGeometry(0.28, 0.38, 0.45, 12), bodyM);
  neck.position.set(0, 1.1, 0);
  robot.add(neck);

  /* TORSO */
  const torso = mesh(new THREE.BoxGeometry(2.4, 2.0, 1.1), bodyM);
  torso.position.set(0, -0.3, 0);
  robot.add(torso);

  const chest = mesh(new THREE.BoxGeometry(1.5, 1.1, 0.13), panelM);
  chest.position.set(0, -0.2, 0.55);
  robot.add(chest);

  const orb = mesh(new THREE.SphereGeometry(0.22, 20, 20), orbM);
  orb.position.set(0, -0.1, 0.63);
  robot.add(orb);

  ([-0.45, 0.45] as number[]).forEach((x) => {
    const d = mesh(new THREE.SphereGeometry(0.06, 8, 8), redM);
    d.position.set(x, -0.1, 0.63);
    robot.add(d);
  });

  for (let i = 0; i < 4; i++) {
    const s = mesh(new THREE.BoxGeometry(0.9, 0.045, 0.14), goldM.clone());
    s.position.set(0, 0.15 - i * 0.22, 0.57);
    robot.add(s);
  }

  ([-1.5, 1.5] as number[]).forEach((x) => {
    const sh = mesh(new THREE.CylinderGeometry(0.5, 0.38, 0.32, 12), bodyM);
    sh.rotation.z = Math.PI / 2;
    sh.position.set(x, 0.3, 0);
    robot.add(sh);
  });

  /* PARTICLES */
  const N = 280;
  const pos = new Float32Array(N * 3);
  for (let i = 0; i < N; i++) {
    pos[i * 3]     = (Math.random() - 0.5) * 22;
    pos[i * 3 + 1] = (Math.random() - 0.5) * 18;
    pos[i * 3 + 2] = (Math.random() - 0.5) * 12 - 4;
  }
  const pg = new THREE.BufferGeometry();
  pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const pts = new THREE.Points(pg, new THREE.PointsMaterial({ color: 0xffd700, size: 0.04, transparent: true, opacity: 0.3 }));
  scene.add(pts);

  /* CURSOR TRACKING */
  const target  = { rx: 0, ry: 0 };
  const current = { rx: 0, ry: 0 };

  const onMouse = (e: MouseEvent) => {
    target.ry = ((e.clientX / window.innerWidth)  * 2 - 1) * 0.45;
    target.rx = (-(e.clientY / window.innerHeight) * 2 + 1) * 0.25;
  };
  window.addEventListener('mousemove', onMouse, { passive: true });

  const onResize = () => {
    const w = window.innerWidth, h = window.innerHeight;
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  };
  window.addEventListener('resize', onResize);

  /* ANIMATION LOOP */
  let af = 0;
  let t  = 0;

  const tick = () => {
    af = requestAnimationFrame(tick);
    t += 0.012;

    // Head follows cursor (smooth lerp)
    current.rx += (target.rx - current.rx) * 0.06;
    current.ry += (target.ry - current.ry) * 0.06;
    head.rotation.x = current.rx;
    head.rotation.y = current.ry;

    // Body float
    robot.position.y = -0.3 + Math.sin(t * 0.55) * 0.1;

    // Glow pulse
    eyeM.emissiveIntensity = 3.5 + Math.sin(t * 2.2) * 0.8;
    orbM.emissiveIntensity = 2.0 + Math.sin(t * 3.0) * 0.7;
    (antBall.material as THREE.MeshStandardMaterial).emissiveIntensity = 2.0 + Math.sin(t * 5) * 1.2;

    // Orbit light
    goldL.position.x = Math.sin(t * 0.4) * 5;
    goldL.position.y = Math.cos(t * 0.3) * 3 + 2;

    // Particles drift
    pts.rotation.y = t * 0.018;
    pts.rotation.x = t * 0.009;

    renderer.render(scene, camera);
  };
  tick();

  return () => {
    cancelAnimationFrame(af);
    window.removeEventListener('mousemove', onMouse);
    window.removeEventListener('resize', onResize);
    renderer.dispose();
  };
}

/* ── Stat chip ── */
function StatChip({ s, i }: { s: (typeof STATS)[0]; i: number }) {
  return (
    <div
      style={{
        position: 'absolute',
        top: s.top,
        left: s.left,
        zIndex: 3,
        pointerEvents: 'none',
        animation: `nbFloat ${5.5 + i * 0.65}s ease-in-out ${s.delay}s infinite alternate`,
        opacity: 0.78,
      }}
    >
      <div style={{
        background: 'rgba(0,0,0,0.5)',
        border: '1px solid rgba(255,215,0,0.28)',
        borderRadius: 10,
        padding: '6px 14px',
        backdropFilter: 'blur(10px)',
        WebkitBackdropFilter: 'blur(10px)',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: 2,
        boxShadow: '0 0 22px rgba(255,215,0,0.1), inset 0 1px 0 rgba(255,255,255,0.05)',
      }}>
        <span style={{ fontSize: 15, fontWeight: 900, color: '#ffd700', letterSpacing: 1 }}>{s.value}</span>
        <span style={{ fontSize: 8, fontWeight: 700, color: 'rgba(255,255,255,0.4)', letterSpacing: 2, textTransform: 'uppercase' }}>{s.label}</span>
      </div>
    </div>
  );
}

/* ── Main component ── */
export function RobotBackground() {
  const [shouldRender, setShouldRender] = useState(false);
  const [opacity, setOpacity] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);
  const canvasRef   = useRef<HTMLCanvasElement>(null);

  /* Scroll trigger */
  useEffect(() => {
    const io = new IntersectionObserver(([e]) => {
      if (e.isIntersecting) {
        setShouldRender(true);
        requestAnimationFrame(() => requestAnimationFrame(() => setOpacity(1)));
      } else if (e.boundingClientRect.top > 0) {
        setOpacity(0);
        setTimeout(() => setShouldRender(false), 700);
      }
    }, { threshold: 0.01 });
    if (sentinelRef.current) io.observe(sentinelRef.current);
    return () => io.disconnect();
  }, []);

  /* Three.js lifecycle */
  useEffect(() => {
    if (!shouldRender || !canvasRef.current) return;
    const ctrl = new AbortController();
    let destroy: (() => void) | null = null;
    initScene(canvasRef.current, ctrl.signal).then((fn) => { destroy = fn; });
    return () => { ctrl.abort(); destroy?.(); };
  }, [shouldRender]);

  return (
    <>
      <style>{`
        @keyframes nbFloat {
          from { transform: translateY(0px)   translateX(0px); }
          to   { transform: translateY(-16px) translateX(8px); }
        }
      `}</style>

      <div ref={sentinelRef} aria-hidden="true" />

      {shouldRender && (
        <div
          aria-hidden="true"
          style={{
            position: 'fixed', inset: 0, zIndex: 0,
            pointerEvents: 'none',
            opacity,
            transition: 'opacity 0.7s cubic-bezier(0.4,0,0.2,1)',
            willChange: 'opacity',
            transform: 'translateZ(0)',
          }}
        >
          <canvas
            ref={canvasRef}
            style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', display: 'block' }}
          />

          {/* Floating NeuroBase stats */}
          {STATS.map((s, i) => <StatChip key={i} s={s} i={i} />)}

          {/* Edge vignette — blends robot into black bg */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            background: 'radial-gradient(ellipse 88% 88% at 50% 50%, transparent 28%, rgba(0,0,0,0.9) 100%)',
          }} />
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2,
            background: 'linear-gradient(to bottom, rgba(0,0,0,0.6) 0%, transparent 18%, transparent 80%, rgba(0,0,0,0.75) 100%)',
          }} />

          {/* NeuroBase gold tint */}
          <div style={{
            position: 'absolute', inset: 0, zIndex: 2, mixBlendMode: 'screen',
            background: 'radial-gradient(ellipse 50% 50% at 55% 44%, rgba(255,215,0,0.07) 0%, transparent 60%)',
          }} />
        </div>
      )}
    </>
  );
}
