import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export function ParticleField({ count = 1000, color = "#B026FF" }) {
  const points = useRef();
  
  const [positions, colors] = useMemo(() => {
    const positions = [];
    const colors = [];
    const particleColor = new THREE.Color(color);
    
    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 10;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 10;
      
      positions.push(x, y, z);
      colors.push(particleColor.r, particleColor.g, particleColor.b);
    }
    
    return [new Float32Array(positions), new Float32Array(colors)];
  }, [count, color]);

  useFrame((state) => {
    if (points.current) {
      points.current.rotation.y = state.clock.elapsedTime * 0.05;
    }
  });

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          count={positions.length / 3}
          array={positions}
          itemSize={3}
        />
        <bufferAttribute
          attach="attributes-color"
          count={colors.length / 3}
          array={colors}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={0.02}
        vertexColors
        transparent
        opacity={0.8}
        sizeAttenuation={true}
        depthWrite={false}
      />
    </points>
  );
}
