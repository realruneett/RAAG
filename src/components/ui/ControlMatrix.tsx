'use client';

import { useState } from 'react';
import { useRaagStore, type RaagStore } from '@/store/raagStore';
import { audioEngine } from '@/lib/audio/audioEngine';
import { useShallow } from 'zustand/react/shallow';
import { Search, Music, Zap, Trash2 } from 'lucide-react';
import { searchTracks, resolveStreamUrl } from '@/lib/audio/SoundCloudClient';

/**
 * CONTROL MATRIX
 * Glassmorphic HUD for track searching and loading.
 */
const COSMIC_PRESETS = [
    { id: 'p1', title: 'NEBULA_PULSE (TECHNO)', url: 'https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8' },
    { id: 'p2', title: 'VOID_RESONANCE (AMBIENT)', url: 'https://bitdash-a.akamaihd.net/content/MI201109210084_1/m3u8s/f08e80da-bf1d-4e3d-8899-f0f6155f6efa.m3u8' },
];

export function ControlMatrix() {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  // Store actions
  const setDeckTrack = useRaagStore((state: RaagStore) => state.setDeckTrack);
  const registerHls = useRaagStore((state: RaagStore) => state.registerHls);
  const setReady = useRaagStore((state: RaagStore) => state.setReady);

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!query) return;
    setLoading(true);
    const tracks = await searchTracks(query);
    setResults(tracks);
    setLoading(false);
  };

  const loadOnDeck = async (track: any, deckId: 'A' | 'B') => {
    // 1. Initialize Audio Engine Context on User Gesture
    await audioEngine.getContext();

    // 2. Setup Deck Graph
    await audioEngine.setupDeck(deckId);

    // 3. Resolve URL (Handle presets vs SC search)
    const streamUrl = track.url || await resolveStreamUrl(track.id);
    
    // 4. Update Store
    setDeckTrack(deckId, streamUrl, track.title);

    // 5. Load HLS
    const hls = audioEngine.loadHlsSource(deckId, streamUrl, () => {
        setReady(deckId, true);
        console.log(`RAAG DECK ${deckId} SYNCED`);
    });

    if (hls) {
      registerHls(deckId, hls);
    }
  };

  return (
    <div className="fixed top-8 left-8 w-96 z-50 pointer-events-auto">
      <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl">
        <h1 className="text-2xl font-light tracking-[0.2em] mb-6 flex items-center gap-3">
          <Zap className="text-cyan-400 w-5 h-5" /> RAAG <span className="text-xs opacity-50 mt-2">V1.0.0</span>
        </h1>

        <div className="mb-6">
          <div className="text-[10px] tracking-[0.3em] opacity-30 uppercase mb-3">Cosmic Presets</div>
          <div className="space-y-2">
            {COSMIC_PRESETS.map((preset) => (
              <div key={preset.id} className="flex items-center justify-between bg-white/5 p-2 rounded border border-white/5">
                <span className="text-[10px] font-mono opacity-70 truncate mr-2">{preset.title}</span>
                <div className="flex gap-1">
                  <button onClick={() => loadOnDeck(preset, 'A')} className="px-2 py-1 text-[8px] bg-cyan-500/20 text-cyan-400 rounded hover:bg-cyan-500/40 transition-colors">A</button>
                  <button onClick={() => loadOnDeck(preset, 'B')} className="px-2 py-1 text-[8px] bg-magenta-500/20 text-magenta-400 rounded hover:bg-magenta-500/40 transition-colors" style={{ color: '#ff00ff', backgroundColor: '#ff00ff20' }}>B</button>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="h-px bg-white/10 mb-6" />

        <form onSubmit={handleSearch} className="relative mb-6">
          <input
            type="text"
            className="w-full bg-white/5 border border-white/10 rounded-lg py-2 px-4 pl-10 focus:outline-none focus:border-cyan-400 transition-colors text-sm"
            placeholder="Search SoundCloud..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 opacity-50" />
        </form>

        <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2 custom-scrollbar">
          {loading && <div className="text-center py-4 animate-pulse opacity-50 text-xs">Scanning frequencies...</div>}
          
          {results.map((track) => (
            <div key={track.id} className="bg-white/5 rounded-lg p-3 group transition-all hover:bg-white/10 border border-transparent hover:border-white/20">
              <div className="font-medium text-xs mb-3 truncate">{track.title}</div>
              <div className="flex gap-2">
                <button
                  onClick={() => loadOnDeck(track, 'A')}
                  className="flex-1 text-[9px] font-bold tracking-widest uppercase py-1 border border-cyan-400/50 text-cyan-400 rounded hover:bg-cyan-400 hover:text-black transition-all"
                >
                  Load A
                </button>
                <button
                  onClick={() => loadOnDeck(track, 'B')}
                  className="flex-1 text-[9px] font-bold tracking-widest uppercase py-1 border border-magenta-400/50 text-magenta-400 rounded hover:bg-magenta-400 hover:text-black transition-all"
                  style={{ color: '#ff00ff', borderColor: '#ff00ff80' }}
                >
                  Load B
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
