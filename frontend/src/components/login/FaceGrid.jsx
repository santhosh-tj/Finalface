import React, { useRef } from 'react';
import { useFrame } from '@react-three/fiber';
import { Sphere, Html } from '@react-three/drei';
import * as THREE from 'three';

export function FaceGrid({ scanning = false, success = false, onScanComplete }) {
  const meshRef = useRef();
  const scanBeamRef = useRef();

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.2; // Slow rotation
    }
    
    // Animate scan beam
    if (scanning && scanBeamRef.current) {
        // Move scan beam up and down
        const time = state.clock.elapsedTime;
        scanBeamRef.current.position.y = Math.sin(time * 2) * 1.5;
        
        // Scale effect based on beam position
        if(meshRef.current) {
            // Pulse the wireframe color slightly
             meshRef.current.material.opacity = 0.3 + Math.abs(Math.sin(time * 5)) * 0.2;
        }
    }
  });

  const mainColor = success ? "#4ade80" : "#00f2ff"; // Green on success, Cyan default

  return (
    <group>
      {/* The Face/Head Mesh - Abstracted as a tech sphere */}
      <mesh ref={meshRef}>
        <icosahedronGeometry args={[1.2, 2]} />
        <meshBasicMaterial 
            color={mainColor} 
            wireframe 
            transparent 
            opacity={0.3} 
        />
      </mesh>

      {/* Internal Core for glow */}
      <mesh scale={[0.8, 0.8, 0.8]}>
        <icosahedronGeometry args={[1, 1]} />
         <meshBasicMaterial 
            color="#00f2ff" 
            transparent 
            opacity={0.1} 
            side={THREE.DoubleSide}
        />
      </mesh>

      {/* Scanning Beam */}
      {scanning && (
        <mesh ref={scanBeamRef} rotation={[Math.PI / 2, 0, 0]}>
            <ringGeometry args={[1.3, 1.4, 32]} />
            <meshBasicMaterial color="#00ff88" side={THREE.DoubleSide} transparent opacity={0.8} />
        </mesh>
      )}
    </group>
  );
}
