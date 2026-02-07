import React, { useMemo } from 'react';
import { Box, RoundedBox, Sphere, Cylinder } from '@react-three/drei';
import * as THREE from 'three';

export function Desk({ position }) {
  const tableTopMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#f3f4f6', roughness: 0.5 }), []);
  const legMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#9ca3af', metalness: 0.5, roughness: 0.2 }), []);

  return (
    <group position={position}>
      {/* Table Top */}
      <RoundedBox args={[2.5, 0.1, 1.2]} radius={0.05} smoothness={4} position={[0, 1.5, 0]}>
         <primitive object={tableTopMat} attach="material" />
      </RoundedBox>
      
      {/* Legs */}
      <group position={[0, 0.75, 0]}>
         <Cylinder args={[0.05, 0.05, 1.5]} position={[-1.1, 0, -0.4]} material={legMat} />
         <Cylinder args={[0.05, 0.05, 1.5]} position={[1.1, 0, -0.4]} material={legMat} />
         <Cylinder args={[0.05, 0.05, 1.5]} position={[-1.1, 0, 0.4]} material={legMat} />
         <Cylinder args={[0.05, 0.05, 1.5]} position={[1.1, 0, 0.4]} material={legMat} />
      </group>

      {/* Chair (Simplified) */}
      <group position={[0, 0, 0.8]}>
          <Box args={[0.8, 0.1, 0.8]} position={[0, 0.8, 0]}>
             <meshStandardMaterial color="#374151" />
          </Box>
          <Box args={[0.8, 0.8, 0.1]} position={[0, 1.2, 0.45]}>
             <meshStandardMaterial color="#374151" />
          </Box>
          <Cylinder args={[0.05, 0.05, 0.8]} position={[0, 0.4, 0]} material={legMat} />
          <Cylinder args={[0.3, 0.3, 0.1]} position={[0, 0.05, 0]} material={legMat} />
      </group>
    </group>
  );
}

export function Whiteboard({ position, rotation }) {
  return (
    <group position={position} rotation={rotation}>
       <RoundedBox args={[6, 3, 0.1]} radius={0.05}>
          <meshStandardMaterial color="#ffffff" roughness={0.2} metalness={0.1} />
       </RoundedBox>
       {/* Frame */}
       <RoundedBox args={[6.1, 3.1, 0.05]} radius={0.05} position={[0, 0, -0.05]}>
           <meshStandardMaterial color="#d1d5db" />
       </RoundedBox>
       {/* Tray */}
       <Box args={[2, 0.1, 0.2]} position={[0, -1.5, 0.2]}>
            <meshStandardMaterial color="#d1d5db" />
       </Box>
    </group>
  );
}

export function StudentAvatar({ position, scale = 1, isTarget }) {
  const skinMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#fca5a5', roughness: 0.5 }), []);
  const shirtMat = useMemo(() => new THREE.MeshStandardMaterial({ color: isTarget ? '#3b82f6' : '#9ca3af', roughness: 0.6 }), []);
  const hairMat = useMemo(() => new THREE.MeshStandardMaterial({ color: '#1f2937', roughness: 0.9 }), []);

  return (
    <group position={position} scale={scale}>
       {/* Head */}
       <group position={[0, 2.8, 0]}>
           <Sphere args={[0.25, 16, 16]}>
              <primitive object={skinMat} attach="material" />
           </Sphere>
           {/* Hair */}
           <Sphere args={[0.26, 16, 16]} position={[0, 0.05, -0.05]} scale={[1, 0.8, 1]}>
               <primitive object={hairMat} attach="material" />
           </Sphere>
           {/* Face features (eyes) */}
           <Sphere args={[0.03, 8, 8]} position={[-0.1, 0.05, 0.22]}>
               <meshBasicMaterial color="#000" />
           </Sphere>
           <Sphere args={[0.03, 8, 8]} position={[0.1, 0.05, 0.22]}>
               <meshBasicMaterial color="#000" />
           </Sphere>
       </group>
       
       {/* Body */}
       <group position={[0, 2.2, 0]}>
           <RoundedBox args={[0.5, 0.7, 0.3]} radius={0.1}>
              <primitive object={shirtMat} attach="material" />
           </RoundedBox>
           
           {/* Arms resting on table */}
           <RoundedBox args={[0.12, 0.6, 0.12]} position={[-0.3, 0.1, 0.2]} rotation={[0.5, 0, -0.2]} material={shirtMat} />
           <RoundedBox args={[0.12, 0.6, 0.12]} position={[0.3, 0.1, 0.2]} rotation={[0.5, 0, 0.2]} material={shirtMat} />
       </group>
    </group>
  );
}

export function ClassroomEnvironment() {
    return (
        <group>
            {/* Floor */}
            <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]} receiveShadow>
                <planeGeometry args={[20, 20]} />
                <meshStandardMaterial color="#f9fafb" />
            </mesh>

            {/* Layout: 2 Rows of 2 Desks */}
            <Desk position={[-2, 0, 0]} />
            <Desk position={[2, 0, 0]} />
            
            <Desk position={[-2, 0, 3]} />
            <Desk position={[2, 0, 3]} />

            {/* Whiteboard at front */}
            <Whiteboard position={[0, 2.5, -3]} />

            {/* Side Window */}
            <group position={[8, 3, 0]} rotation={[0, -Math.PI/2, 0]}>
                <Box args={[4, 3, 0.2]}>
                    <meshStandardMaterial color="#e5e7eb" />
                </Box>
                <Box args={[3.6, 2.6, 0.22]}>
                    <meshBasicMaterial color="#bfdbfe" />
                </Box>
                {/* Window Frame cross */}
                <Box args={[3.8, 0.1, 0.25]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#e5e7eb" />
                </Box>
                <Box args={[0.1, 2.8, 0.25]} position={[0, 0, 0]}>
                    <meshStandardMaterial color="#e5e7eb" />
                </Box>
            </group>

        </group>
    );
}
