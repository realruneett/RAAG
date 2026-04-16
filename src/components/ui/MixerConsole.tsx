'use client';

import React from 'react';
import { useRaagStore, type RaagStore } from '@/store/raagStore';
import { useShallow } from 'zustand/react/shallow';
import { audioEngine } from '@/lib/audio/audioEngine';
import { Slider } from 'lucide-react'; // Placeholder icon if needed

/**
 * MIXER CONSOLE HUD
 * A glassmorphic 2D overlay at the screen bottom for traditional mixing control.
 * Stays in sync with the 3D spatial positions.
 */
export function MixerConsole() {
  const { deckA, deckB } = useRaagStore(useShallow((state: RaagStore) => ({
    deckA: state.deckA,
    deckB: state.deckB,
  })));

  const setDeckVolume = useRaagStore((state: RaagStore) => state.setDeckVolume);

  const handleVolumeChange = (deckId: 'A' | 'B', val: number) => {
    // Update store
    setDeckVolume(deckId, val);
    // Update audio engine with smooth ramp
    audioEngine.fadeToVolume(deckId, val, 100);
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 h-32 z-50 pointer-events-none">
      <div className="max-w-4xl mx-auto h-full px-8 flex items-center justify-between pointer-events-auto bg-black/40 backdrop-blur-3xl border-t border-white/10 rounded-t-3xl shadow-[0_-20px_50px_rgba(0,0,0,0.5)]">
        
        {/* DECK A CONTROLS */}
        <div className="flex-1 flex flex-col gap-2">
          <div className="flex justify-between text-[8px] tracking-[0.4em] opacity-40 uppercase">
             <span>Volume A</span>
             <span>{(deckA.volume * 100).toFixed(0)}%</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            value={deckA.volume}
            onChange={(e) => handleVolumeChange('A', parseFloat(e.target.value))}
            className="w-full accent-cyan-400 h-1 bg-white/10 rounded-full appearance-none hover:bg-white/20 transition-all cursor-pointer"
          />
          <div className="text-[8px] font-mono text-cyan-400/60 truncate uppercase truncate">
            {deckA.title || 'No Track'}
          </div>
        </div>

        {/* CROSSFADER SEPARATOR */}
        <div className="w-px h-16 bg-white/10 mx-12 hidden md:block" />

        {/* MASTER VISUALIZER (CENTER) */}
        <div className="w-48 flex flex-col items-center gap-1">
           <div className="flex gap-1 h-8 items-end">
              {[...Array(12)].map((_, i) => (
                <div 
                  key={i} 
                  className="w-1 bg-cyan-400/30 rounded-t-sm transition-all duration-75"
                  style={{ 
                    height: `${Math.random() * (deckA.volume + deckB.volume) * 100}%`,
                    opacity: 0.2 + (deckA.volume + deckB.volume) * 0.8
                  }}
                />
              ))}
           </div>
           <div className="text-[10px] tracking-[0.5em] font-light opacity-30 uppercase">Resonance</div>
        </div>

        {/* CROSSFADER SEPARATOR */}
        <div className="w-px h-16 bg-white/10 mx-12 hidden md:block" />

        {/* DECK B CONTROLS */}
        <div className="flex-1 flex flex-col gap-2 text-right">
          <div className="flex justify-between text-[8px] tracking-[0.4em] opacity-40 uppercase">
             <span>{(deckB.volume * 100).toFixed(0)}%</span>
             <span>Volume B</span>
          </div>
          <input 
            type="range" 
            min="0" 
            max="1" 
            step="0.01"
            value={deckB.volume}
            onChange={(e) => handleVolumeChange('B', parseFloat(e.target.value))}
            className="w-full accent-magenta-400 h-1 bg-white/10 rounded-full appearance-none hover:bg-white/20 transition-all cursor-pointer"
            style={{ accentColor: '#ff00ff' }}
          />
          <div className="text-[8px] font-mono text-magenta-400/60 truncate uppercase truncate">
            {deckB.title || 'No Track'}
          </div>
        </div>

      </div>
    </div>
  );
}
