'use client';

import { Canvas } from '@react-three/fiber';
import { PerspectiveCamera, OrbitControls } from '@react-three/drei';
import { EffectComposer, Bloom } from '@react-three/postprocessing';
import * as THREE from 'three';
import { Environment } from './Environment';
import { ResonanceCore } from './ResonanceCore';
import { RaagRibbon } from './RaagRibbon';

/**
 * RAAG CANVAS
 * The primary 3D viewport for the RAAG system.
 */
export default function RaagCanvas() {
  return (
    <div className="absolute inset-0 bg-black overflow-hidden">
      <Canvas
        gl={{ 
            antialias: true, 
            powerPreference: 'high-performance', 
            toneMapping: THREE.ACESFilmicToneMapping,
            outputColorSpace: THREE.SRGBColorSpace 
        }}
        dpr={[1, 2]} // Performance: Limit to 2x for Retina
      >
        <PerspectiveCamera makeDefault position={[0, 0, 18]} fov={60} />
        <OrbitControls 
            enablePan={false} 
            maxDistance={30} 
            minDistance={5} 
            enableDamping 
            makeDefault 
        />
        
        <ambientLight intensity={0.5} />
        <pointLight position={[10, 10, 10]} intensity={1.5} color="#3366ff" />
        
        {/* Core Elements */}
        <Environment />
        <ResonanceCore />
        <RaagRibbon deckId="A" />
        <RaagRibbon deckId="B" />
        
        {/* Cinematic VFX */}
        <EffectComposer>
          <Bloom 
            luminanceThreshold={0.2} 
            mipmapBlur 
            intensity={1.2} 
            radius={0.4}
          />
        </EffectComposer>
      </Canvas>
    </div>
  );
}
