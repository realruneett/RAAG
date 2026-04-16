'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { ControlMatrix } from '@/components/ui/ControlMatrix';

// Dynamic import for R3F Canvas to avoid SSR issues with THREE.js
const RaagCanvas = dynamic(() => import('@/components/canvas/RaagCanvas'), { 
  ssr: false,
  loading: () => (
    <div className="w-screen h-screen flex items-center justify-center bg-black">
      <div className="text-cyan-400 font-light tracking-[0.5em] animate-pulse">
        CALIBRATING RAAG ARCHITECTURE...
      </div>
    </div>
  )
});

/**
 * RAAG V1.0.0
 * Pure 3D Spatial Audio Void
 */
export default function RaagPage() {
  return (
    <main className="relative w-screen h-screen">
      {/* 3D Global Space */}
      <RaagCanvas />

      {/* 2D Interaction Overlays */}
      <div className="absolute inset-0 pointer-events-none z-50">
        <ControlMatrix />
        
        {/* Cinematic HUD elements */}
        <div className="fixed bottom-8 left-8 text-[10px] tracking-[0.3em] font-mono opacity-30 select-none">
          ENGINE: RAAG_S1 / RT_SPATIAL_V1<br />
          COMPILER: ANTIGRAVITY_CORE<br />
          UI_STATUS: INJECTED
        </div>
        
        <div className="fixed bottom-8 right-8 text-[10px] tracking-[0.3em] font-mono text-right opacity-30 select-none">
          SYSTEM: OPTIMIZED<br />
          LATENCY: INTERACTIVE<br />
          BUFF_LEN: 60s
        </div>
      </div>
    </main>
  );
}
