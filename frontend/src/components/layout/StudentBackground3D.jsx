import React, { useRef, useMemo } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Points, PointMaterial } from '@react-three/drei';
import * as random from 'maath/random/dist/maath-random.esm';
import { useTheme } from '../../contexts/ThemeContext';

function ParticleField(props) {
  const ref = useRef();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Generate particles
  const sphere = useMemo(() => random.inSphere(new Float32Array(5000), { radius: 1.5 }), []);

  useFrame((state, delta) => {
    ref.current.rotation.x -= delta / 10;
    ref.current.rotation.y -= delta / 15;
  });

  return (
    <group rotation={[0, 0, Math.PI / 4]}>
      <Points ref={ref} positions={sphere} stride={3} frustumCulled={false} {...props}>
        <PointMaterial
          transparent
          color={isDark ? "#4f46e5" : "#0ea5e9"} // Indigo for dark, Sky Blue for light
          size={isDark ? 0.002 : 0.003}
          sizeAttenuation={true}
          depthWrite={false}
          opacity={isDark ? 0.8 : 0.6}
        />
      </Points>
    </group>
  );
}

function ConnectingLines({ count = 20 }) {
    const { theme } = useTheme();
    const isDark = theme === 'dark';
    
    // Create random connections
    const lines = useMemo(() => {
        const temp = [];
        for (let i = 0; i < count; i++) {
            const start = [
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3
            ];
            const end = [
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3,
                (Math.random() - 0.5) * 3
            ];
            temp.push({ start, end });
        }
        return temp;
    }, [count]);

    return (
        <group>
            {lines.map((line, i) => (
                <Line key={i} start={line.start} end={line.end} color={isDark ? "#818cf8" : "#38bdf8"} opacity={0.2} />
            ))}
        </group>
    );
}

function Line({ start, end, color, opacity }) {
    const ref = useRef();
    useFrame((state, delta) => {
        ref.current.rotation.z += delta / 20;
    });

    // Simple line Geometry would be better here, but for now we can use thin cylinders or just stick to particles
    // To keep it performant and simple for this specific request, we will skip complex line meshes for now 
    // and focus on the high-quality particle field which gives the "Neural" look.
    return null; 
}


export function StudentBackground3D() {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`fixed inset-0 z-0 transition-colors duration-700 ${isDark ? 'bg-black' : 'bg-slate-50'}`}>
      {/* Gradient Overlay for Vignette/Depth */}
      <div className={`absolute inset-0 pointer-events-none z-10 bg-gradient-to-b ${isDark ? 'from-transparent via-transparent to-black/80' : 'from-transparent via-transparent to-white/80'}`} />
      
      <Canvas camera={{ position: [0, 0, 1] }}>
        <ParticleField />
      </Canvas>
    </div>
  );
}
