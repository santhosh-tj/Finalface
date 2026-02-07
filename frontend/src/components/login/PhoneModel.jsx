import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { RoundedBox } from '@react-three/drei';
import * as THREE from 'three';
import { PhoneScreen } from './PhoneScreen';

export function PhoneModel({ step, flash, ...props }) {
  const group = useRef();
  
  // Phone Body Material
  const bodyMaterial = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a1a1a', // Dark grey/black
    metalness: 0.9,
    roughness: 0.1,
  }), []);

  return (
    <group ref={group} {...props}>
      {/* Phone Body */}
      <RoundedBox args={[2.5, 5, 0.3]} radius={0.3} smoothness={4}>
        <primitive object={bodyMaterial} attach="material" />
      </RoundedBox>

      {/* Screen Area (Black backing) */}
      <RoundedBox args={[2.3, 4.8, 0.05]} radius={0.2} smoothness={4} position={[0, 0, 0.16]}>
         <meshStandardMaterial color="#000000" metalness={0.8} roughness={0.2} />
      </RoundedBox>

      {/* Display Content (PhoneScreen) */}
      <group position={[0, 0, 0.2]}>
         <PhoneScreen step={step} />
      </group>

      {/* Notch / Camera area */}
      <mesh position={[0, 2.2, 0.17]}>
        <capsuleGeometry args={[0.1, 0.4, 4, 8]} />
        <meshBasicMaterial color="#000000" />
        <mesh rotation={[0, 0, Math.PI / 2]} />
      </mesh>
      
      {/* Back Camera Bump */}
      <group position={[0.7, 1.8, -0.2]} rotation={[0, Math.PI, 0]}>
         <RoundedBox args={[0.8, 1, 0.1]} radius={0.1} smoothness={4}>
            <meshStandardMaterial color="#222" metalness={0.8} roughness={0.2} />
         </RoundedBox>
         {/* Lenses */}
         <mesh position={[0, 0.2, 0.08]}>
            <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
            <meshStandardMaterial color="#111" />
         </mesh>
          <mesh position={[0, -0.2, 0.08]}>
            <cylinderGeometry args={[0.2, 0.2, 0.1, 32]} />
            <meshStandardMaterial color="#111" />
         </mesh>
         
         {/* Flash Light */}
         <mesh position={[0, 0, 0.08]}>
            <circleGeometry args={[0.08, 32]} />
            <meshBasicMaterial color={flash ? "#ffffff" : "#444"} />
            {flash && (
                <pointLight intensity={2} distance={5} color="white" decay={2} />
            )}
         </mesh>
      </group>
    </group>
  );
}


