'use client'

import { SplineScene } from "@/components/ui/splite";
import { Card } from "@/components/ui/card"
import { Spotlight } from "@/components/ui/spotlight"
import Link from "next/link";
import { useAccount } from "wagmi";
import { useConnectModal } from "@rainbow-me/rainbowkit";
import { useRouter } from "next/navigation";

export function SplineSceneBasic() {
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
          <SplineScene
            scene="https://prod.spline.design/kZDDjO5HuC9GJUM2/scene.splinecode"
            className="w-full h-full"
          />
        </div>
      </div>
    </Card>
  )
}
