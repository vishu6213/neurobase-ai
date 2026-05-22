import { useRef, useState, Suspense, useEffect, useMemo } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { Float, MeshDistortMaterial, Stars, PerspectiveCamera, OrbitControls, Billboard, Text, Html } from "@react-three/drei";
import { usePerformanceBudget } from "@/hooks/use-performance-budget";
import { Loader2 } from "lucide-react";

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
        <Text fontSize={0.4} color="white" anchorX="center" anchorY="middle">
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
  const { isMobile, isLowPower, mounted } = usePerformanceBudget();
  const [activeToken, setActiveToken] = useState<any>(null);
  const [webGLAvailable, setWebGLAvailable] = useState(true);

  const validItems = items.filter(item => item && item.name);

  // Set default active token once validItems are loaded
  useEffect(() => {
    if (validItems.length > 0 && !activeToken) {
      setActiveToken(validItems[0]);
    }
  }, [validItems, activeToken]);

  // Check WebGL availability on mount
  useEffect(() => {
    try {
      const canvas = document.createElement("canvas");
      const supportsGL = !!(
        window.WebGLRenderingContext &&
        (canvas.getContext("webgl") || canvas.getContext("experimental-webgl"))
      );
      setWebGLAvailable(supportsGL);
    } catch (e) {
      setWebGLAvailable(false);
    }
  }, []);

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

  if (!mounted) {
    return (
      <div className="h-[500px] md:h-[650px] w-full relative rounded-[2.5rem] overflow-hidden glass border border-white/5 bg-black/40 shadow-2xl flex flex-col items-center justify-center gap-6">
         <div className="w-24 h-24 rounded-full border-2 border-yellow-500/20 flex items-center justify-center animate-spin">
            <Loader2 className="w-8 h-8 text-yellow-500" />
         </div>
         <div className="text-center">
            <p className="text-lg font-black text-white uppercase tracking-widest animate-pulse">Initializing Spatial Matrix...</p>
            <p className="text-[10px] font-black text-white/20 uppercase tracking-[0.2em] mt-2">Loading WebGL Environment</p>
         </div>
      </div>
    );
  }

  if (mounted && (isMobile || isLowPower || !webGLAvailable)) {
    return (
      <div className="h-[500px] md:h-[650px] w-full relative rounded-[2.5rem] overflow-hidden glass border border-white/5 bg-black/40 shadow-2xl flex flex-col">
        {/* Dynamic ambient color background glow */}
        <div 
          className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--glow-color,rgba(255,215,0,0.05))_0%,transparent_75%)] transition-all duration-700 pointer-events-none" 
          style={{ 
            '--glow-color': activeToken ? `${activeToken.color}15` : 'rgba(255,215,0,0.05)'
          } as React.CSSProperties}
        />
        
        {/* Fine matrix grid overlay */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            backgroundImage: `
              linear-gradient(to right, rgba(255,255,255,0.015) 1px, transparent 1px),
              linear-gradient(to bottom, rgba(255,255,255,0.015) 1px, transparent 1px)
            `,
            backgroundSize: '24px 24px'
          }}
        />

        {/* Ambient floating blobs */}
        <div className="absolute top-1/4 left-1/4 w-[250px] h-[250px] rounded-full bg-yellow-500/5 blur-[80px] animate-pulse pointer-events-none" style={{ animationDuration: '8s' }} />
        <div className="absolute bottom-1/4 right-1/4 w-[250px] h-[250px] rounded-full bg-red-600/5 blur-[80px] animate-pulse pointer-events-none" style={{ animationDuration: '12s' }} />

        {/* Scrollable Center Content */}
        <div className="flex-1 overflow-y-auto px-4 md:px-6 pt-28 md:pt-32 pb-20 md:pb-24 custom-scrollbar z-10 relative">
          
          {/* Active Token Feature Panel (sleek mobile detail display) */}
          {activeToken && (
            <div className="mb-6 p-5 rounded-2xl border border-white/10 bg-black/60 backdrop-blur-xl relative overflow-hidden transition-all duration-300">
              <div 
                className="absolute top-0 right-0 w-24 h-24 rounded-full blur-2xl pointer-events-none"
                style={{ backgroundColor: `${activeToken.color}15` }}
              />
              
              <div className="flex items-center gap-4">
                <div className="relative flex-shrink-0">
                  <div 
                    className="absolute inset-0 blur-md rounded-full animate-pulse"
                    style={{ backgroundColor: activeToken.color }}
                  />
                  <img 
                    src={getLogoUrl(activeToken)} 
                    alt={activeToken.name}
                    className="w-12 h-12 rounded-full border border-black bg-black relative z-10"
                  />
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-1.5 h-1.5 rounded-full animate-ping"
                      style={{ backgroundColor: activeToken.color }}
                    />
                    <span className="text-[9px] font-black text-white/40 uppercase tracking-[0.3em]">
                      ACTIVE SYNAPSE NODE
                    </span>
                  </div>
                  <h4 className="text-lg font-black text-white uppercase tracking-tight truncate mt-0.5">
                    {activeToken.name}
                  </h4>
                </div>

                <div className="text-right flex-shrink-0">
                  <p className="text-[9px] font-black text-white/20 uppercase tracking-widest">Weight</p>
                  <p 
                    className="text-2xl font-black tabular-nums tracking-tighter"
                    style={{ color: activeToken.color }}
                  >
                    {activeToken.value}%
                  </p>
                </div>
              </div>

              {/* Visual connections and metrics */}
              <div className="mt-4 pt-4 border-t border-white/5 space-y-3">
                <div className="flex justify-between items-center text-[10px] font-black uppercase tracking-wider text-white/40">
                  <span>Network Sync Bandwidth</span>
                  <span className="text-white font-mono">{(activeToken.value * 1.5).toFixed(1)} Gb/s</span>
                </div>
                
                <div className="w-full h-2 bg-white/5 rounded-full overflow-hidden p-[1px]">
                  <div 
                    className="h-full rounded-full transition-all duration-500"
                    style={{ 
                      width: `${activeToken.value}%`,
                      backgroundImage: `linear-gradient(to right, ${activeToken.color}, #ff2200)`
                    }}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1">
                  <div className="p-2 rounded-xl bg-white/[0.01] border border-white/5">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-wider">Node Status</p>
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mt-0.5">Connected</p>
                  </div>
                  <div className="p-2 rounded-xl bg-white/[0.01] border border-white/5">
                    <p className="text-[8px] font-black text-white/20 uppercase tracking-wider">Stability</p>
                    <p className="text-[10px] font-black text-yellow-500 uppercase tracking-widest mt-0.5">
                      {(90 + (activeToken.value % 10)).toFixed(2)}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Scrollable grid list of nodes */}
          <div className="grid grid-cols-1 gap-2.5">
            {validItems.map((item, i) => {
              const isActive = activeToken?.symbol === item.symbol;
              return (
                <div 
                  key={i}
                  onClick={() => setActiveToken(item)}
                  className={`flex items-center justify-between p-3.5 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isActive 
                      ? 'bg-white/[0.03] border-white/20 shadow-[0_0_20px_rgba(255,255,255,0.02)]' 
                      : 'bg-white/[0.01] border-white/5 hover:border-white/10 hover:bg-white/[0.02]'
                  }`}
                  style={{
                    boxShadow: isActive ? `0 0 15px ${item.color}15` : 'none',
                    borderColor: isActive ? item.color : 'rgba(255,255,255,0.05)'
                  }}
                >
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      {isActive && (
                        <div 
                          className="absolute inset-0 blur-sm rounded-full animate-pulse"
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                      <img 
                        src={getLogoUrl(item)} 
                        alt={item.name}
                        className="w-9 h-9 rounded-full border border-black bg-black relative z-10"
                      />
                    </div>

                    <div>
                      <h5 className="text-xs font-black text-white uppercase tracking-wider">
                        {item.name}
                      </h5>
                      <span className="text-[9px] font-bold text-white/30 uppercase tracking-widest">
                        {item.symbol} Node
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="w-20 hidden xs:block">
                      <div className="w-full h-1 bg-white/5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full" 
                          style={{ 
                            width: `${item.value}%`,
                            backgroundColor: item.color 
                          }}
                        />
                      </div>
                    </div>
                    <div className="text-right">
                      <span 
                        className="text-xs font-black tabular-nums"
                        style={{ color: item.color }}
                      >
                        {item.value}%
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>

        {/* Decorative Overlay Header */}
        <div className="absolute top-6 left-6 right-6 md:top-10 md:left-10 md:right-10 pointer-events-none flex justify-between items-start z-20">
          <div>
            <div className="flex items-center gap-4 mb-2">
              <div className="flex -space-x-2">
                {validItems.slice(0, 3).map((item, i) => (
                  <div key={i} className="relative">
                    <img src={getLogoUrl(item)} className="w-6 h-6 rounded-full border border-black bg-black relative z-10" />
                  </div>
                ))}
              </div>
              <div className="h-4 w-px bg-white/10" />
              <div className="flex flex-col">
                <span className="text-[9px] font-black uppercase tracking-[0.4em] text-yellow-500 animate-pulse">Matrix 2D Connected</span>
              </div>
            </div>
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter leading-none">Spatial Matrix</h3>
          </div>
        </div>

        {/* Decorative Overlay Footer */}
        <div className="absolute bottom-6 left-6 right-6 md:bottom-10 md:left-10 md:right-10 pointer-events-none flex justify-between items-center z-20">
          <div>
            <p className="text-[8px] font-black text-white/20 uppercase tracking-widest">Active Nodes</p>
            <p className="text-xl font-black text-white tabular-nums tracking-tighter">{validItems.length}</p>
          </div>
          <div className="glass px-4 py-2.5 rounded-xl border-white/5 bg-white/[0.02]">
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 bg-green-500 rounded-full animate-ping" />
              <span className="text-[9px] font-black text-white uppercase tracking-widest">Mobile Optimized</span>
            </div>
          </div>
        </div>

        {/* Custom scrollbar stylesheet */}
        <style dangerouslySetInnerHTML={{ __html: `
          .custom-scrollbar::-webkit-scrollbar {
            width: 4px;
          }
          .custom-scrollbar::-webkit-scrollbar-track {
            background: transparent;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.08);
            border-radius: 99px;
          }
          .custom-scrollbar::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.15);
          }
        `}} />
      </div>
    );
  }

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
              color={item.color || "#ffd700"}
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
                     <img src={getLogoUrl(item)} className="w-8 h-8 rounded-full border-2 border-black bg-black relative z-10" />
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
