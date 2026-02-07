import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Cylinder, Box, Sphere, Cone } from '@react-three/drei';
import * as THREE from 'three';

export function CCTVCamera({ isScanning, isDetecting, headRef, ...props }) {
  const beamRef = useRef();
  
  // Materials
  const plasticWhite = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#e5e5e5', // High-end white plastic
    roughness: 0.3,
    metalness: 0.1
  }), []);

  const plasticBlack = useMemo(() => new THREE.MeshStandardMaterial({
    color: '#1a1a1a',
    roughness: 0.4
  }), []);
  
  const lensGlass = useMemo(() => new THREE.MeshPhysicalMaterial({
    color: '#000000',
    metalness: 1,
    roughness: 0,
    ior: 2.5,
    transmission: 0, 
    reflectivity: 1
  }), []);

  useFrame((state) => {
    if (beamRef.current && isScanning) {
        // Pulse beam opacity
        const opacity = (Math.sin(state.clock.elapsedTime * 10) + 1) / 2 * 0.3 + 0.1;
        beamRef.current.material.opacity = opacity;
    }
  });

  return (
    <group {...props}>
      {/* --- MOUNTING BASE (Wall/Ceiling mount) --- */}
      <group position={[0, 0, 0]}> 
        <Cylinder args={[0.5, 0.5, 0.2, 32]} rotation={[Math.PI/2, 0, 0]}>
             <primitive object={plasticWhite} attach="material" />
        </Cylinder>
        
        {/* Arm Stand */}
        <group position={[0, 0, 0.5]}>
             {/* Pivot Joint */}
             <group position={[0, 0, 0.5]}>
                 <Sphere args={[0.4, 32, 32]}>
                    <primitive object={plasticBlack} attach="material" />
                 </Sphere>

                 {/* --- CAMERA HEAD --- */}
                 {/* This group rotates to look at target */}
                 <group ref={headRef}> 
                    {/* Main Body */}
                    <Box args={[1, 1, 2.5]} position={[0, 0, 1]}>
                        <primitive object={plasticWhite} attach="material" />
                    </Box>
                    
                    {/* Front Face */}
                    <group position={[0, 0, 2.25]}>
                        <Cylinder args={[0.4, 0.4, 0.1, 32]} rotation={[Math.PI/2, 0, 0]}>
                            <primitive object={plasticBlack} attach="material" />
                        </Cylinder>
                        
                        {/* Lens */}
                        <Sphere args={[0.25, 32, 16]} position={[0, 0, 0.1]}>
                            <primitive object={lensGlass} attach="material" />
                        </Sphere>
                        
                        {/* Status LED */}
                        <mesh position={[0.3, 0.3, 0.1]}>
                            <sphereGeometry args={[0.05, 16, 16]} />
                            <meshBasicMaterial color={isDetecting ? "#3b82f6" : "#ef4444"} toneMapped={false} />
                            <pointLight 
                                color={isDetecting ? "#3b82f6" : "#ef4444"} 
                                intensity={isDetecting ? 2 : 0.5} 
                                distance={2} 
                            />
                        </mesh>
                    </group>

                    {/* Scan Beam Effect */}
                    {isScanning && (
                        <group position={[0, 0, 2.3]} rotation={[Math.PI/2, 0, 0]}>
                             <mesh ref={beamRef} position={[0, -5, 0]}>
                                <cylinderGeometry args={[2, 0.05, 10, 32, 1, true]} />
                                <meshBasicMaterial 
                                    color="#60a5fa" 
                                    transparent 
                                    opacity={0.15} 
                                    depthWrite={false}
                                    side={THREE.DoubleSide}
                                    blending={THREE.AdditiveBlending}
                                />
                             </mesh>
                        </group>
                    )}
                 </group>
             </group>
        </group>
      </group>
    </group>
  );
}
