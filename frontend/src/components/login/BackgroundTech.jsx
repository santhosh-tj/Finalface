import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import { Torus, Grid, Float } from '@react-three/drei';
import * as THREE from 'three';

function RotatingRings() {
  const group = useRef();
  
  useFrame((state) => {
    const t = state.clock.getElapsedTime();
    if (group.current) {
        group.current.children.forEach((child, i) => {
            child.rotation.x = t * (0.1 + i * 0.05);
            child.rotation.y = t * (0.15 + i * 0.02);
            child.rotation.z = t * (0.05 + i * 0.08);
        });
    }
  });

  return (
    <group ref={group}>
      {[...Array(3)].map((_, i) => (
        <Torus key={i} args={[8 + i * 2, 0.02, 16, 100]}>
          <meshBasicMaterial color="#06b6d4" transparent opacity={0.15 - i * 0.04} />
        </Torus>
      ))}
    </group>
  );
}

function DataGrid() {
  return (
    <group position={[0, -10, 0]}>
      <Grid 
        args={[100, 100]} 
        sectionSize={5} 
        sectionThickness={1.5} 
        sectionColor="#06b6d4" 
        fadeDistance={50} 
        infiniteGrid
      />
    </group>
  );
}

function FloatingBits() {
    const points = useMemo(() => {
        const p = [];
        for (let i = 0; i < 20; i++) {
            p.push([
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 20,
                (Math.random() - 0.5) * 10 - 5
            ]);
        }
        return p;
    }, []);

    return (
        <group>
            {points.map((p, i) => (
                <Float key={i} speed={1} rotationIntensity={2} floatIntensity={2}>
                    <mesh position={p}>
                        <boxGeometry args={[0.1, 0.1, 0.1]} />
                        <meshBasicMaterial color="#f472b6" transparent opacity={0.3} />
                    </mesh>
                </Float>
            ))}
        </group>
    );
}

export function BackgroundTech() {
  return (
    <group position={[0, 0, -10]}>
      <RotatingRings />
      <DataGrid />
      <FloatingBits />
      
      {/* Decorative vertical light columns */}
      <group position={[-20, 0, -5]}>
          <mesh>
              <cylinderGeometry args={[0.05, 0.05, 40, 8]} />
              <meshBasicMaterial color="#06b6d4" transparent opacity={0.05} />
          </mesh>
      </group>
       <group position={[20, 0, -5]}>
          <mesh>
              <cylinderGeometry args={[0.05, 0.05, 40, 8]} />
              <meshBasicMaterial color="#06b6d4" transparent opacity={0.05} />
          </mesh>
      </group>
    </group>
  );
}
