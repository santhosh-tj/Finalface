import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, Float, Stars, Sparkles, ContactShadows } from '@react-three/drei';
import * as THREE from 'three';
import { PhoneModel } from './PhoneModel';
import { FaceGrid } from './FaceGrid';
import { BackgroundTech } from './BackgroundTech';

function SceneContent({ onSequenceComplete }) {
  const [step, setStep] = useState(0); // 0: Init, 1: Rise/Wake, 2: Scanning, 3: Success
  const [flash, setFlash] = useState(false);
  const phoneRef = useRef();
  const lightRef = useRef();
  const sweepLightRef = useRef();
  
  // Animation Sequence Orchestrator
  useEffect(() => {
    let timeouts = [];

    const playScreenLoop = () => {
        setStep(1);
        setFlash(false);

        // Flash Effect
        timeouts.push(setTimeout(() => {
            setFlash(true);
            timeouts.push(setTimeout(() => setFlash(false), 100));
        }, 2000));

        // Step 2: Start Scanning
        timeouts.push(setTimeout(() => setStep(2), 2500));

        // Step 3: Success
        timeouts.push(setTimeout(() => {
            setStep(3);
            if(onSequenceComplete) onSequenceComplete();
        }, 5500));

        // Loop: Restart screen sequence (keep phone up)
        timeouts.push(setTimeout(playScreenLoop, 9000));
    };

    // Initial Rise (Happens only once on mount)
    timeouts.push(setTimeout(() => {
        setStep(1); 
        timeouts.push(setTimeout(playScreenLoop, 1500));
    }, 500));

    return () => {
        timeouts.forEach(clearTimeout);
    };
  }, [onSequenceComplete]);
  
  // Frame loop for smooth interpolations and mouse parallax
  useFrame((state, delta) => {
    if(!phoneRef.current) return;

    // 1. Phone Animation Logic (Rise/Tilt)
    const targetY = step >= 1 ? 0 : -10; 
    const targetRotX = step >= 1 ? -0.2 : 0; 
    
    // 2. Mouse Parallax (Subtle movement based on mouse pointer)
    const parallaxX = state.mouse.x * 0.5;
    const parallaxY = state.mouse.y * 0.5;

    phoneRef.current.position.y = THREE.MathUtils.lerp(phoneRef.current.position.y, targetY + parallaxY * 0.5, delta * 2);
    phoneRef.current.position.x = THREE.MathUtils.lerp(phoneRef.current.position.x, parallaxX, delta * 2);
    
    // Rotation mix of animation state + parallax
    phoneRef.current.rotation.x = THREE.MathUtils.lerp(phoneRef.current.rotation.x, targetRotX - parallaxY * 0.2, delta * 2);
    phoneRef.current.rotation.y = THREE.MathUtils.lerp(phoneRef.current.rotation.y, parallaxX * 0.2, delta * 2);

    // 3. Dynamic Orbiting Light
    if (lightRef.current) {
        const time = state.clock.getElapsedTime();
        lightRef.current.position.x = Math.sin(time * 0.5) * 8;
        lightRef.current.position.z = Math.cos(time * 0.5) * 8 + 5;
        lightRef.current.position.y = Math.sin(time * 0.3) * 3 + 5;
    }

    // 4. Sweeping Light Logic
    if (sweepLightRef.current) {
        const time = state.clock.getElapsedTime();
        sweepLightRef.current.position.x = Math.sin(time * 0.2) * 20;
    }
  });

  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0, 12]} fov={45} />
      <Environment preset="city" blur={0.8} />
      <fog attach="fog" args={['#050505', 5, 25]} />
      
      {/* Lighting */}
      <ambientLight intensity={0.2} />
      <spotLight 
        ref={lightRef}
        intensity={2} 
        angle={0.5} 
        penumbra={1} 
        color="#06b6d4" 
        castShadow 
      />
      <pointLight position={[-10, -5, -10]} intensity={1} color="#c084fc" />
      
      {/* Sweeping accent light */}
      <rectAreaLight 
        ref={sweepLightRef}
        width={10}
        height={40}
        intensity={5}
        color="#06b6d4"
        position={[0, 0, -5]}
        rotation={[0, Math.PI, 0]}
      />

      {/* New Background Components */}
      <BackgroundTech />
      
      {/* Background Ambience */}
      <Stars radius={100} depth={50} count={3000} factor={4} saturation={0} fade speed={1} />
      <Sparkles count={50} scale={12} size={3} speed={0.4} opacity={0.6} color="#06b6d4" />
      <Sparkles count={30} scale={8} size={5} speed={0.2} opacity={0.4} color="#f472b6" />

      {/* Floating Group for Phone */}
      <Float speed={2} rotationIntensity={0.1} floatIntensity={0.2} floatingRange={[-0.2, 0.2]}>
        <group ref={phoneRef} position={[0, -10, 0]}>
            <PhoneModel step={step} flash={flash} scale={1.2} />
        </group>
      </Float>
      
      <ContactShadows opacity={0.4} scale={20} blur={2.5} far={10} resolution={256} color="#000000" />
    </>
  );
}

export function LoginScene3D({ onAnimationComplete }) {
  return (
    <div className="h-full w-full relative bg-[#050505]">
      {/* Radial Gradient Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,_#1e1b4b_0%,_#000000_70%)] opacity-80" />
      
      <Canvas dpr={[1, 2]} gl={{ antialias: true, toneMapping: THREE.ACESFilmicToneMapping }}>
        <Suspense fallback={null}>
            <SceneContent onSequenceComplete={onAnimationComplete} />
        </Suspense>
      </Canvas>
      
      {/* Decorative Overlays */}
      <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-black/50 to-transparent pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-black to-transparent pointer-events-none" />
    </div>
  );
}

