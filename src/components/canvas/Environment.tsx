'use client';

import { useMemo, useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/**
 * RAAG ENVIRONMENT: The Abyssal Void
 * Features a volumetric particle current flowing linearly.
 */
export function Environment() {
  const count = 3000;
  
  const particles = useMemo(() => {
    const temp = new Float32Array(count * 3);
    for (let i = 0; i < count; i++) {
      temp[i * 3] = (Math.random() - 0.5) * 50;     // X
      temp[i * 3 + 1] = (Math.random() - 0.5) * 50; // Y
      temp[i * 3 + 2] = (Math.random() - 0.5) * 50; // Z
    }
    return temp;
  }, []);

  const pointsRef = useRef<THREE.Points>(null);

  useFrame((state: any) => {
    if (!pointsRef.current) return;
    
    // Create a cosmic current effect by slowly sliding particles
    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    for (let i = 0; i < count; i++) {
      positions[i * 3 + 2] += 0.05; // Flow along Z (toward user)
      if (positions[i * 3 + 2] > 25) {
        positions[i * 3 + 2] = -25;
      }
    }
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.z += 0.0002;
  });

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={count}
          args={[particles, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.06}
        color="#334466"
        transparent
        opacity={0.4}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </points>
  );
}
