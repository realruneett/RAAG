'use client';

import * as THREE from 'three';
import { useRef, useMemo, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import { DragControls } from '@react-three/drei';
import { useRaagStore, type RaagStore } from '@/store/raagStore';
import { useShallow } from 'zustand/react/shallow';
import { audioEngine } from '@/lib/audio/audioEngine';

// Import shaders via raw-loader (configured in next.config.ts)
import ribbonVert from '@/shaders/ribbonVertex.glsl';
import ribbonFrag from '@/shaders/ribbonFragment.glsl';

/**
 * RAAG RIBBON
 * Visual representation of an audio track. 
 * Manipulatable in 3D space with distance-to-volume mapping.
 */
export function RaagRibbon({ deckId }: { deckId: 'A' | 'B' }) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);

  // Optimized store subscriptions
  const { position, playbackRate, isReady } = useRaagStore(useShallow((state: RaagStore) => ({
    position: deckId === 'A' ? state.spatial.deckAPosition : state.spatial.deckBPosition,
    playbackRate: deckId === 'A' ? state.deckA.playbackRate : state.deckB.playbackRate,
    isReady: deckId === 'A' ? state.deckA.isReady : state.deckB.isReady,
  })));

  // Subscribe to aggregate RMS/Energy from both decks
  const energies = useRaagStore(useShallow((state: RaagStore) => ({
    deckA: state.deckA.analyserData ? state.deckA.volume : 0,
    deckB: state.deckB.analyserData ? state.deckB.volume : 0,
  })));

  const setDeckPosition = useRaagStore((state: RaagStore) => state.setDeckPosition);
  const setAnalyserData = useRaagStore((state: RaagStore) => state.setAnalyserData);

  // Generate a smooth path for the TubeGeometry
  const curve = useMemo(() => {
    return new THREE.CatmullRomCurve3([
      new THREE.Vector3(-5, -1, 0),
      new THREE.Vector3(-2, 1, 1),
      new THREE.Vector3(0, 0, 0),
      new THREE.Vector3(2, -1, -1),
      new THREE.Vector3(5, 1, 0),
    ]);
  }, []);

  // Audio Analysis Loop
  useFrame((state: any) => {
    if (!materialRef.current) return;
    
    materialRef.current.uniforms.uTime.value = state.clock.elapsedTime;
    materialRef.current.uniforms.uPlaybackRate.value = playbackRate;

    const nodes = audioEngine.getNodes(deckId);
    if (nodes && isReady) {
      const data = new Uint8Array(nodes.analyser.frequencyBinCount);
      nodes.analyser.getByteFrequencyData(data);
      
      // Map first 64 buckets to uniforms for shader displacement
      const floatData = new Float32Array(64);
      for(let i = 0; i < 64; i++) {
        floatData[i] = data[i] / 255.0;
      }
      materialRef.current.uniforms.uFrequencyData.value = floatData;

      // Sync to store for other energy-reactive elements
      setAnalyserData(deckId, data);
    }
  });

  // Spatial Interaction: Map Euclidean distance to X to Gain value
  const onDragEnd = () => {
    if (!meshRef.current) return;
    const newPos = meshRef.current.position;
    
    // Euclidean distance to (0,0,0)
    const distance = Math.sqrt(newPos.x ** 2 + newPos.y ** 2 + newPos.z ** 2);
    
    // Invert distance to volume (Distance 0 = Volume 1.0, Distance 10 = Volume 0.0)
    const volume = Math.max(0, 1.0 - (distance / 10.0));
    
    // Precise hardware-decoupled ramp (150ms)
    audioEngine.fadeToVolume(deckId, volume, 150);
    
    // Sync to store
    setDeckPosition(deckId, [newPos.x, newPos.y, newPos.z]);
  };

  const colors = deckId === 'A' 
    ? { a: new THREE.Color(0x00ffff), b: new THREE.Color(0x0044ff) }
    : { a: new THREE.Color(0xff00ff), b: new THREE.Color(0xaa00aa) };

  return (
    <DragControls 
        onDragEnd={onDragEnd}
        // Ensure the mesh handles its own local transform so the DragControls can manipulate it
    >
      <mesh ref={meshRef} position={position}>
        <tubeGeometry args={[curve, 256, 0.4, 12, false]} />
        <shaderMaterial
          ref={materialRef}
          uniforms={{
            uTime: { value: 0 },
            uPlaybackRate: { value: 1.0 },
            uFrequencyData: { value: new Float32Array(64) },
            uColorA: { value: colors.a },
            uColorB: { value: colors.b },
          }}
          vertexShader={ribbonVert}
          fragmentShader={ribbonFrag}
          transparent
          depthWrite={false}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </DragControls>
  );
}
