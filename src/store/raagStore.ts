import { create } from 'zustand';
import { subscribeWithSelector } from 'zustand/middleware';

/**
 * Project RAAG: V1.0.0 Architecture
 * Segmented Zustand Store for High-Performance R3F Interactions
 */

export interface RaagDeckState {
  id: 'A' | 'B';
  url: string | null;
  title: string | null;
  volume: number; // 0.0 - 1.0 (Euclidean mapped)
  playbackRate: number;
  analyserData: Uint8Array | null;
  isReady: boolean;
  hlsInstance: any | null; // Typed loosely as HLS instances are non-serializable
}

export interface RaagSpatialState {
  deckAPosition: [number, number, number];
  deckBPosition: [number, number, number];
  corePosition: [number, number, number];
}

export interface RaagStore {
  deckA: RaagDeckState;
  deckB: RaagDeckState;
  spatial: RaagSpatialState;

  // Actions
  setDeckTrack: (deckId: 'A' | 'B', url: string, title: string) => void;
  setDeckVolume: (deckId: 'A' | 'B', volume: number) => void;
  setDeckPlaybackRate: (deckId: 'A' | 'B', rate: number) => void;
  setDeckPosition: (deckId: 'A' | 'B', position: [number, number, number]) => void;
  setAnalyserData: (deckId: 'A' | 'B', data: Uint8Array) => void;
  registerHls: (deckId: 'A' | 'B', hls: any) => void;
  setReady: (deckId: 'A' | 'B', ready: boolean) => void;
}

const initialDeck = (id: 'A' | 'B'): RaagDeckState => ({
  id,
  url: null,
  title: null,
  volume: 0,
  playbackRate: 1.0,
  analyserData: null,
  isReady: false,
  hlsInstance: null,
});

export const useRaagStore = create<RaagStore>()(
  subscribeWithSelector((set) => ({
    deckA: initialDeck('A'),
    deckB: initialDeck('B'),
    spatial: {
      deckAPosition: [-6, 0, 0],
      deckBPosition: [6, 0, 0],
      corePosition: [0, 0, 0],
    },

    setDeckTrack: (deckId: 'A' | 'B', url: string, title: string) => set((state: RaagStore) => ({
      [deckId === 'A' ? 'deckA' : 'deckB']: {
        ...state[deckId === 'A' ? 'deckA' : 'deckB'],
        url,
        title,
        isReady: false
      }
    })),

    setDeckVolume: (deckId: 'A' | 'B', volume: number) => set((state: RaagStore) => ({
      [deckId === 'A' ? 'deckA' : 'deckB']: {
        ...state[deckId === 'A' ? 'deckA' : 'deckB'],
        volume
      }
    })),

    setDeckPlaybackRate: (deckId: 'A' | 'B', rate: number) => set((state: RaagStore) => ({
      [deckId === 'A' ? 'deckA' : 'deckB']: {
        ...state[deckId === 'A' ? 'deckA' : 'deckB'],
        playbackRate: rate
      }
    })),

    setDeckPosition: (deckId: 'A' | 'B', position: [number, number, number]) => set((state: RaagStore) => ({
      spatial: {
        ...state.spatial,
        [deckId === 'A' ? 'deckAPosition' : 'deckBPosition']: position
      }
    })),

    setAnalyserData: (deckId: 'A' | 'B', data: Uint8Array) => set((state: RaagStore) => ({
      [deckId === 'A' ? 'deckA' : 'deckB']: {
        ...state[deckId === 'A' ? 'deckA' : 'deckB'],
        analyserData: data
      }
    })),

    registerHls: (deckId: 'A' | 'B', hls: any) => set((state: RaagStore) => ({
      [deckId === 'A' ? 'deckA' : 'deckB']: {
        ...state[deckId === 'A' ? 'deckA' : 'deckB'],
        hlsInstance: hls
      }
    })),

    setReady: (deckId: 'A' | 'B', ready: boolean) => set((state: RaagStore) => ({
      [deckId === 'A' ? 'deckA' : 'deckB']: {
        ...state[deckId === 'A' ? 'deckA' : 'deckB'],
        isReady: ready
      }
    })),
  }))
);
