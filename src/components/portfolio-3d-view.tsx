import { useRef, useState, Suspense, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Float, MeshDistortMaterial, Stars, PerspectiveCamera, OrbitControls, Billboard, Text, Html } from "@react-three/drei";

function SafeImage({ url, scale, symbol }: { url: string, scale: number, symbol: string }) {
  const [texture, setTexture] = useState<THREE.Texture | null>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!url) return;
    const loader = new THREE.TextureLoader();
    loader.crossOrigin = "anonymous";
    loader.load(
      url,
      (tex) => {
        tex.colorSpace = THREE.SRGBColorSpace;
        setTexture(tex);
      },
      undefined,
      () => setError(true)
    );
  }, [url]);

  if (error || !texture) {
    return (
      <Billboard>
        <Text fontSize={0.4} color="white" anchorX="center" anchorY="middle" font="/fonts/GeistMono-Bold.woff">
          {symbol}
        </Text>
      </Billboard>
    );
  }

  return (
    <sprite scale={[scale, scale, 1]}>
      <spriteMaterial map={texture} transparent alphaTest={0.1} depthTest={false} />
    </sprite>
  );
}

function AssetOrb({ logo, color, scale, speed, position, name, weight, symbol }: { logo: string, color: string, scale: number, speed: number, position: [number, number, number], name: string, weight: number, symbol: string }) {
  const group = useRef<THREE.Group>(null!);
  const [hovered, setHovered] = useState(false);
  const waveRef = useRef<THREE.Mesh>(null!);

  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    group.current.position.y = position[1] + Math.sin(t * speed) * 0.4;
    group.current.position.x = position[0] + Math.cos(t * (speed * 0.5)) * 0.2;
    
    if (hovered && waveRef.current) {
      waveRef.current.scale.setScalar(1 + Math.sin(t * 10) * 0.1);
      waveRef.current.rotation.z += 0.05;
    }
  });

  return (
    <Float speed={1.5} rotationIntensity={1} floatIntensity={1}>
      <group 
        ref={group} 
        position={position} 
        scale={scale}
        onPointerEnter={(e) => {
          e.stopPropagation();
          setHovered(true);
          document.body.style.cursor = "pointer";
        }}
        onPointerLeave={() => {
          setHovered(false);
          document.body.style.cursor = "crosshair";
        }}
      >
        {/* Neural Wave Effect */}
        {hovered && (
          <mesh ref={waveRef}>
             <ringGeometry args={[1.1, 1.2, 32]} />
             <meshBasicMaterial color={color} transparent opacity={0.5} side={THREE.DoubleSide} />
          </mesh>
        )}

        {/* Core Glowing Orb */}
        <mesh>
          <sphereGeometry args={[1, 32, 32]} />
          <MeshDistortMaterial
            color={color}
            speed={speed * 2}
            distort={0.3}
            radius={1}
            emissive={color}
            emissiveIntensity={hovered ? 4 : 0.8}
            transparent
            opacity={0.4}
            roughness={0}
            metalness={1}
          />
        </mesh>

        {/* Coin Logo with Safe Loading */}
        <group scale={1.2}>
          <SafeImage url={logo} scale={1.1} symbol={symbol} />
        </group>

        {/* Hover Label using HTML */}
        {hovered && (
          <Html distanceFactor={10} position={[0, 1.8, 0]} center zIndexRange={[100, 0]}>
             <div className="bg-black/95 border-2 border-white/20 backdrop-blur-3xl px-5 py-3 rounded-2xl flex flex-col items-center min-w-[140px] shadow-[0_0_40px_rgba(0,0,0,0.5)] pointer-events-none select-none animate-in fade-in zoom-in duration-300">
                <div className="flex items-center gap-2 mb-1">
                   <div className="w-2 h-2 rounded-full animate-pulse" style={{ backgroundColor: color }} />
                   <span className="text-[10px] font-black text-white/50 uppercase tracking-[0.3em]">{symbol} NODE</span>
                </div>
                <span className="text-base font-black text-white uppercase tracking-tighter mb-2">{name}</span>
                <div className="w-full space-y-1">
                   <div className="flex justify-between text-[9px] font-black text-white/30 uppercase tracking-widest">
                      <span>Synapse Weight</span>
                      <span className="text-yellow-500">{weight}%</span>
                   </div>
                   <div className="w-full h-1.5 bg-white/5 rounded-full overflow-hidden p-[1px]">
                      <div className="h-full bg-gradient-to-r from-yellow-500 to-red-600 rounded-full" style={{ width: `${weight}%` }} />
                   </div>
                </div>
             </div>
          </Html>
        )}
      </group>
    </Float>
  );
}

export function Portfolio3DView({ items }: { items: any[] }) {
  const validItems = items.filter(item => item && item.name);

  // Curated list of reliable logo sources with proxy
  const getLogoUrl = (item: any) => {
    // Fallback order: Specific curated URL -> Weserv Proxy -> Fallback Text
    const proxyBase = "https://images.weserv.nl/?url=";
    const encode = (u: string) => encodeURIComponent(u);
    
    // Try to find a reliable icon if the provided one is suspected broken
    if (item.symbol === "ETH") return `${proxyBase}${encode("https://icons.llama.fi/ethereum.png")}&w=128&h=128&fit=contain`;
    if (item.symbol === "USDC") return `${proxyBase}${encode("https://icons.llama.fi/usd-coin.png")}&w=128&h=128&fit=contain`;
    
    // Default to the provided logo but proxy it for CORS and resizing
    return `${proxyBase}${encode(item.logo)}&w=128&h=128&fit=contain&mask=circle&bg=black`;
  };

  return (
    <div className="h-[650px] w-full relative rounded-[2.5rem] overflow-hidden glass border border-white/5 bg-black/40 shadow-2xl cursor-crosshair">
      <Canvas dpr={[1, 2]} shadows gl={{ antialias: true, alpha: true }}>
        <Suspense fallback={null}>
          <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={35} />
          <ambientLight intensity={0.8} />
          <pointLight position={[15, 15, 15]} intensity={3} color="#ffd700" />
          <spotLight position={[-15, 15, 15]} angle={0.3} penumbra={1} intensity={3} castShadow />
          <Stars radius={120} depth={60} count={1500} factor={5} saturation={0} fade speed={2} />
          
          {validItems.map((item, i) => (
            <AssetOrb 
              key={i}
              symbol={item.symbol}
              name={item.name}
              logo={getLogoUrl(item)}
              color={item.color}
              weight={item.value}
              scale={0.7 + (item.value / 100) * 4.5}
              speed={0.4 + i * 0.1}
              position={[
                (i - (validItems.length - 1) / 2) * 4,
                Math.sin(i * 2.2) * 2,
                Math.cos(i * 1.8) * 5
              ]}
            />
          ))}
          
          <OrbitControls 
            enableZoom={false} 
            autoRotate 
            autoRotateSpeed={0.2} 
            makeDefault 
            maxPolarAngle={Math.PI / 1.6}
            minPolarAngle={Math.PI / 2.8}
          />
        </Suspense>
      </Canvas>
      
      {/* Decorative Overlay */}
      <div className="absolute top-12 left-14 pointer-events-none">
         <div className="flex items-center gap-5 mb-5">
            <div className="flex -space-x-3">
               {validItems.slice(0, 5).map((item, i) => (
                  <div key={i} className="relative">
                     <div className="absolute inset-0 bg-white/20 blur-sm rounded-full" />
                     <img src={item.logo} className="w-8 h-8 rounded-full border-2 border-black bg-black relative z-10" />
                  </div>
               ))}
            </div>
            <div className="h-6 w-px bg-white/10" />
            <div className="flex flex-col">
               <span className="text-[10px] font-black uppercase tracking-[0.5em] text-yellow-500 animate-pulse">Neural Grid Active</span>
               <span className="text-[8px] font-black text-white/20 uppercase tracking-[0.2em] mt-0.5">Base Mainnet v4.2.1</span>
            </div>
         </div>
         <h3 className="text-5xl font-black text-white uppercase tracking-tighter liquid-text leading-tight">Spatial Matrix</h3>
         <p className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mt-3">Autonomous Asset Weight Visualization</p>
      </div>

      <div className="absolute bottom-12 right-14 pointer-events-none flex items-center gap-6">
         <div className="text-right">
            <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Active Nodes</p>
            <p className="text-2xl font-black text-white tabular-nums tracking-tighter">{validItems.length}</p>
         </div>
         <div className="w-px h-12 bg-white/10" />
         <div className="glass px-6 py-4 rounded-2xl border-white/5 bg-white/[0.02]">
            <p className="text-[9px] font-black text-yellow-500 uppercase tracking-widest mb-1">Grid Status</p>
            <div className="flex items-center gap-2">
               <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
               <span className="text-xs font-black text-white uppercase tracking-widest">Optimized</span>
            </div>
         </div>
      </div>
    </div>
  );
}
