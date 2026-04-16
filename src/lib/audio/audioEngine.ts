import Hls from 'hls.js';

/**
 * Project RAAG: V1.0.0 Audio Architecture
 * Singleton Web Audio Context & HLS.js Wrapper
 */

export interface DeckNodes {
  audio: HTMLAudioElement;
  source: MediaElementAudioSourceNode;
  filter: BiquadFilterNode;
  gain: GainNode;
  analyser: AnalyserNode;
  hls: Hls | null;
}

class AudioEngine {
  private static instance: AudioEngine;
  private context: AudioContext | null = null;
  private decks: Map<'A' | 'B', DeckNodes> = new Map();

  private constructor() {}

  static getInstance(): AudioEngine {
    if (!AudioEngine.instance) {
      AudioEngine.instance = new AudioEngine();
    }
    return AudioEngine.instance;
  }

  /**
   * Initializes or resumes the AudioContext singleton.
   * Browsers require a user gesture to start the context.
   */
  async getContext(): Promise<AudioContext> {
    if (!this.context) {
      this.context = new (window.AudioContext || (window as any).webkitAudioContext)({
        latencyHint: 'interactive',
      });
    }
    if (this.context.state === 'suspended') {
      await this.context.resume();
    }
    return this.context;
  }

  /**
   * Pre-initializes a Raag Deck graph.
   * Node Chain: HTMLAudio -> Source -> BiquadFilter (HP) -> Gain (Volume) -> Analyser -> Output
   */
  async setupDeck(deckId: 'A' | 'B'): Promise<DeckNodes> {
    const ctx = await this.getContext();
    
    // Dispose if already exists
    if (this.decks.has(deckId)) {
        this.disposeDeck(deckId);
    }

    const audio = new Audio();
    audio.crossOrigin = 'anonymous';
    audio.loop = true;

    const source = ctx.createMediaElementSource(audio);
    const filter = ctx.createBiquadFilter();
    filter.type = 'highpass';
    filter.frequency.value = 20; // Start at audible floor

    const gain = ctx.createGain();
    gain.gain.value = 0; // Default muted for spatial lerp

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.8;

    // Connect graph
    source.connect(filter);
    filter.connect(gain);
    gain.connect(analyser);
    analyser.connect(ctx.destination);

    const nodes: DeckNodes = { audio, source, filter, gain, analyser, hls: null };
    this.decks.set(deckId, nodes);
    return nodes;
  }

  /**
   * Attaches an HLS stream to a deck and initializes Hls.js
   */
  loadHlsSource(deckId: 'A' | 'B', url: string, onReady: () => void): Hls | null {
    const nodes = this.decks.get(deckId);
    if (!nodes) return null;

    if (nodes.hls) {
      nodes.hls.destroy();
    }

    const hls = new Hls({
      startLevel: -1, // Use standard automatic initial quality logic
      maxBufferLength: 60,
      enableWorker: true,
    });

    hls.loadSource(url);
    hls.attachMedia(nodes.audio);

    hls.on(Hls.Events.MANIFEST_PARSED, () => {
      onReady();
    });

    nodes.hls = hls;
    return hls;
  }

  /**
   * Hardware-decoupled volume transition.
   * Uses linearRampToValueAtTime to avoid ziper noise from UI threads.
   */
  fadeToVolume(deckId: 'A' | 'B', targetVolume: number, durationMs: number = 150) {
    const nodes = this.decks.get(deckId);
    if (!nodes || !this.context) return;

    const currentT = this.context.currentTime;
    nodes.gain.gain.cancelScheduledValues(currentT);
    nodes.gain.gain.linearRampToValueAtTime(targetVolume, currentT + durationMs / 1000);
  }

  /**
   * Precision Beatmatching Control
   */
  async setPlaybackRate(deckId: 'A' | 'B', rate: number) {
    const nodes = this.decks.get(deckId);
    if (nodes) {
        nodes.audio.playbackRate = Number(rate.toFixed(3));
    }
  }

  /**
   * Strict Disposal: Clears all nodes and listeners to prevent memory fragmentation.
   */
  disposeDeck(deckId: 'A' | 'B') {
    const nodes = this.decks.get(deckId);
    if (!nodes) return;

    nodes.audio.pause();
    nodes.audio.src = '';
    
    if (nodes.hls) {
      nodes.hls.destroy();
    }

    nodes.source.disconnect();
    nodes.filter.disconnect();
    nodes.gain.disconnect();
    nodes.analyser.disconnect();

    this.decks.delete(deckId);
  }

  getNodes(deckId: 'A' | 'B') {
    return this.decks.get(deckId);
  }
}

export const audioEngine = AudioEngine.getInstance();
