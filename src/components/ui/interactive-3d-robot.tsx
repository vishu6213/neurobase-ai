'use client';

import { Suspense, lazy, useState, useEffect } from 'react';
import { usePerformanceBudget } from "@/hooks/use-performance-budget";

const Spline = lazy(() => import('@splinetool/react-spline'));

interface InteractiveRobotSplineProps {
  scene: string;
  className?: string;
}

export function InteractiveRobotSpline({ scene, className }: InteractiveRobotSplineProps) {
  const { isMobile, isLowPower, mounted } = usePerformanceBudget();

  if (mounted && (isMobile || isLowPower)) {
    return (
      <div className={`w-full h-full flex flex-col items-center justify-center bg-transparent p-6 relative overflow-hidden group ${className}`}>
        {/* Ambient glow behind avatar */}
        <div 
          className="absolute w-[180px] h-[180px] rounded-full bg-gradient-to-br from-yellow-500/10 to-red-600/5 blur-3xl pointer-events-none"
          style={{ transform: "translateZ(0)" }}
        />

        {/* Central mascot ring structure */}
        <div className="relative w-40 h-40 flex items-center justify-center select-none transition-transform duration-500 group-hover:scale-105">
          {/* External fine glowing orbital ring */}
          <div 
            className="absolute inset-0 rounded-full border border-dashed border-yellow-500/20"
            style={{
              animation: "nbSpin 25s linear infinite",
              transform: "translateZ(0)"
            }}
          />
          <div 
            className="absolute w-[130px] h-[130px] rounded-full border border-red-600/10"
            style={{
              animation: "nbSpinRev 35s linear infinite",
              transform: "translateZ(0)"
            }}
          />

          {/* Glowing mascot capsule card */}
          <div className="w-28 h-28 rounded-[2rem] bg-gradient-to-tr from-yellow-500 to-red-600 p-[1.5px] shadow-[0_0_40px_rgba(255,215,0,0.15)] group-hover:shadow-[0_0_55px_rgba(255,215,0,0.3)] transition-all duration-500 relative">
            <div className="w-full h-full rounded-[1.9rem] bg-black flex flex-col items-center justify-center p-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,215,0,0.1),transparent_60%)] pointer-events-none" />
              
              {/* Sleek SVG futuristic mascot/robot logo */}
              <svg className="w-14 h-14 text-yellow-500 group-hover:text-yellow-400 transition-colors duration-300 relative z-10" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {/* Robot Head Outer */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} d="M9 3v2m6-2v2M4 9h16v8a4 4 0 01-4 4H8a4 4 0 01-4-4V9z" />
                {/* Antennas / Synaptic node link */}
                <circle cx="9" cy="2.5" r="0.5" fill="currentColor" />
                <circle cx="15" cy="2.5" r="0.5" fill="currentColor" />
                {/* Eyes glowing grid */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8} d="M8 12.5h.01M16 12.5h.01" />
                {/* Mouth dynamic digital grid */}
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.2} strokeDasharray="1 1" d="M9 16.5h6" />
              </svg>

              {/* Status indicators */}
              <div className="absolute bottom-2 flex items-center gap-1.5 z-10">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                <span className="text-[7px] font-black text-emerald-400 uppercase tracking-widest">
                  SYNCED
                </span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-col items-center text-center">
          <span className="text-[8px] font-black uppercase tracking-[0.3em] text-yellow-500 animate-pulse">
            Neural Avatar Link
          </span>
          <p className="text-[10px] font-black uppercase tracking-[0.15em] text-white/50 mt-1">
            Core Assistant Active
          </p>
        </div>

        {/* Animation definitions */}
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes nbSpin {
            from { transform: rotate(0deg); }
            to { transform: rotate(360deg); }
          }
          @keyframes nbSpinRev {
            from { transform: rotate(360deg); }
            to { transform: rotate(0deg); }
          }
        `}} />
      </div>
    );
  }

  return (
    <Suspense
      fallback={
        <div className={`w-full h-full flex items-center justify-center bg-transparent ${className}`}>
          <div className="flex flex-col items-center gap-4">
            <svg className="animate-spin h-8 w-8 text-yellow-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z"></path>
            </svg>
            <span className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500/50">Initialising Whobee...</span>
          </div>
        </div>
      }
    >
      <Spline
        scene={scene}
        className={className} 
      />
    </Suspense>
  );
}
