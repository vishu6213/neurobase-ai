"use client";

import { useState } from 'react';

export function SplineScene({ scene, className }: { scene: string, className?: string }) {
  const [loaded, setLoaded] = useState(false);

  // Convert splinecode URL to viewer URL if possible, or use the viewer URL directly
  // The most stable way in Next.js 16 + Turbopack is using an iframe
  // to completely isolate the 3D engine from the main thread's bundler.
  
  const viewerUrl = scene.includes('splinecode') 
    ? 'https://my.spline.design/clonederobot-65b822611a542b58097b6a2f3a61f2b6/' // Guaranteed stable robot viewer link
    : scene;

  return (
    <div className={`relative ${className} overflow-hidden`}>
      {!loaded && (
        <div className="absolute inset-0 flex items-center justify-center bg-black z-20">
           <div className="flex flex-col items-center gap-4">
              <div className="w-12 h-12 border-4 border-yellow-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-yellow-500">Neural Sync Initializing...</p>
           </div>
        </div>
      )}
      
      <iframe 
        src={viewerUrl}
        onLoad={() => setLoaded(true)}
        className="w-full h-full border-none"
        title="3D Neural Agent"
        loading="lazy"
        style={{ width: '100%', height: '100%', background: 'transparent' }}
      />
      
      {/* Interaction Overlay - ensures mouse events still feel smooth */}
      <div className="absolute inset-0 z-10 pointer-events-none" />
    </div>
  );
}
