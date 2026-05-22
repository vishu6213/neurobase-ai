"use client";

import Link from "next/link";
import { Bot, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";

export default function NotFound() {
  const pathname = usePathname();
  const router = useRouter();

  useEffect(() => {
    if (pathname) {
      const lowerPath = pathname.toLowerCase();
      if (
        lowerPath.includes("spartil") ||
        lowerPath.includes("spartial") ||
        lowerPath.includes("spatial")
      ) {
        router.replace("/dashboard/portfolio");
      } else if (lowerPath.startsWith("/dashboard")) {
        router.replace("/dashboard");
      }
    }
  }, [pathname, router]);
  return (
    <div className="min-h-screen bg-black flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 bg-gradient-to-br from-yellow-500 to-red-600 rounded-3xl flex items-center justify-center shadow-2xl mb-8 animate-float">
        <Bot className="text-black w-10 h-10" />
      </div>
      
      <h1 className="text-7xl font-black text-white uppercase tracking-tighter mb-4 italic">
        404<span className="text-yellow-500">_</span>
      </h1>
      
      <p className="text-xl font-black text-white uppercase tracking-widest mb-2">
        Neural Path Not Found
      </p>
      
      <p className="text-muted-foreground max-w-md mb-10 leading-relaxed">
        The coordinate you are looking for does not exist in the NeuroBase network. 
        The agent has been dispatched to investigate this anomaly.
      </p>

      <Link href="/">
        <Button className="h-14 px-8 rounded-2xl bg-yellow-500 hover:bg-yellow-400 text-black font-black uppercase tracking-widest shadow-[0_0_50px_rgba(255,215,0,0.2)] group transition-all">
          <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" /> 
          Return to Base
        </Button>
      </Link>

      <div className="mt-20 flex items-center gap-2 opacity-20">
        <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 animate-pulse" />
        <span className="text-[10px] font-black text-white uppercase tracking-[0.3em]">
          NeuroBase AI Autonomous System
        </span>
      </div>
    </div>
  );
}
