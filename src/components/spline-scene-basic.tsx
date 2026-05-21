'use client'

import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import Link from "next/link";
import { usePerformanceBudget } from "@/hooks/use-performance-budget";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";

export function SplineSceneBasic() {
  const { isMobile, isLowPower } = usePerformanceBudget();
  const { isConnected } = useAccount();
  const { openConnectModal } = useConnectModal();
  const router = useRouter();

  const handleEnterVoid = (e: React.MouseEvent) => {
    if (!isConnected) {
      if (openConnectModal) {
        openConnectModal();
      } else {
        router.push("/dashboard");
      }
    } else {
      router.push("/dashboard");
    }
  };

  return (
    <Card className="w-full h-screen bg-black/[0.96] relative overflow-hidden border-none rounded-none">
      <Spotlight
        className="-top-40 left-0 md:left-60 md:-top-20"
      />

      <div className="flex flex-col md:flex-row h-full">
        {/* Left content */}
        <div className="flex-1 p-8 sm:p-20 relative z-10 flex flex-col justify-center">
          <h1 className="text-5xl md:text-7xl lg:text-8xl font-black bg-clip-text text-transparent bg-gradient-to-b from-white to-neutral-500 uppercase tracking-tighter leading-none">
            Neural <br /> Singularity
          </h1>
          <p className="mt-8 text-neutral-400 max-w-lg text-lg sm:text-xl font-medium leading-relaxed">
            Experience the next evolution of onchain intelligence.
            NeuroBase AI combines deep neural networks with the Base ecosystem
            to create truly autonomous agents.
          </p>

          <div className="mt-12 flex gap-4">
            <button 
              onClick={handleEnterVoid}
              className="h-14 px-10 rounded-xl bg-white text-black font-black uppercase tracking-widest text-sm hover:bg-neutral-200 transition-colors"
            >
              Enter Void
            </button>
            <Link href="#features">
              <button className="h-14 px-10 rounded-xl border border-white/10 text-white font-black uppercase tracking-widest text-sm hover:bg-white/5 transition-colors">
                Docs
              </button>
            </Link>
          </div>
        </div>

        {/* Right content */}
        <div className="flex-1 relative h-[40vh] md:h-full flex items-center justify-center overflow-hidden bg-transparent">
          {isMobile || isLowPower ? (
            <div className="w-full h-full flex items-center justify-center relative overflow-hidden bg-transparent">
              {/* Glowing background glow */}
              <div 
                className="absolute w-[260px] h-[260px] rounded-full bg-gradient-to-br from-yellow-500/25 via-red-600/15 to-transparent blur-3xl"
                style={{ transform: "translateZ(0)" }}
              />
              
              {/* Spinning orbital rings */}
              <div 
                className="absolute w-[240px] h-[240px] rounded-full border border-yellow-500/20"
                style={{
                  animation: "nbSpin 15s linear infinite",
                  transform: "translateZ(0)"
                }}
              />
              <div 
                className="absolute w-[180px] h-[180px] rounded-full border border-red-600/10"
                style={{
                  animation: "nbSpinRev 25s linear infinite",
                  transform: "translateZ(0)"
                }}
              />
              
              {/* Core neural pulsing gold-to-red orb */}
              <div 
                className="w-28 h-28 rounded-full bg-gradient-to-tr from-yellow-500 to-red-600 flex items-center justify-center p-[2px] shadow-[0_0_60px_rgba(255,215,0,0.35)]"
                style={{
                  animation: "nbFloatPulse 6s ease-in-out infinite alternate",
                  transform: "translateZ(0)"
                }}
              >
                <div className="w-full h-full rounded-full bg-black flex items-center justify-center relative overflow-hidden">
                  {/* Internal gold grid lines */}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.15),transparent_60%)]" />
                  <div className="w-14 h-14 rounded-full bg-yellow-500/10 border border-yellow-500/25 flex items-center justify-center">
                    <svg className="w-7 h-7 text-yellow-500 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* CSS Animation Keyframes */}
              <style dangerouslySetInnerHTML={{ __html: `
                @keyframes nbSpin {
                  from { transform: rotate(0deg); }
                  to { transform: rotate(360deg); }
                }
                @keyframes nbSpinRev {
                  from { transform: rotate(360deg); }
                  to { transform: rotate(0deg); }
                }
                @keyframes nbFloatPulse {
                  from { transform: translateY(0px) scale(0.96); box-shadow: 0 0 40px rgba(255,215,0,0.2); }
                  to { transform: translateY(-10px) scale(1.04); box-shadow: 0 0 65px rgba(255,215,0,0.45); }
                }
              `}} />
            </div>
          ) : (
            <SplineScene
              scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
              className="w-full h-full"
            />
          )}
        </div>
      </div>
    </Card>
  )
}
