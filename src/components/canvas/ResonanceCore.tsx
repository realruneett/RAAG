'use client';

import { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { useRaagStore, type RaagStore } from '@/store/raagStore';
import { useShallow } from 'zustand/react/shallow';

/**
 * RESONANCE CORE
 * A glowing sphere at (0,0,0) that reacts to the aggregate audio energy.
 */
export function ResonanceCore() {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.MeshStandardMaterial>(null);

  // Subscribe to aggregate RMS/Energy from both decks
  const energies = useRaagStore(useShallow((state: RaagStore) => ({
    deckA: state.deckA.analyserData ? state.deckA.volume : 0,
    deckB: state.deckB.analyserData ? state.deckB.volume : 0,
  })));

  useFrame((state: any) => {
    if (!meshRef.current) return;
    
    const time = state.clock.elapsedTime;
    const aggregateEnergy = (energies.deckA + energies.deckB) / 2.0;
    
    // Scale pulse based on energy
    const scale = 1.0 + aggregateEnergy * 0.5 + Math.sin(time * 2.0) * 0.1;
    meshRef.current.scale.set(scale, scale, scale);
    
    // Rotation
    meshRef.current.rotation.y += 0.005;
    meshRef.current.rotation.x += 0.003;
  });

  return (
    <mesh ref={meshRef} position={[0, 0, 0]}>
      <icosahedronGeometry args={[1.5, 3]} />
      <meshStandardMaterial
        ref={materialRef}
        color="#ffffff"
        emissive="#3366ff"
        emissiveIntensity={2}
        wireframe
        transparent
        opacity={0.8}
      />
    </mesh>
  );
}
