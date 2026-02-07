import React, { useState, useEffect, useRef, Suspense } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Environment, PerspectiveCamera, ContactShadows, Float, Text, OrbitControls, Html } from '@react-three/drei';
import { EffectComposer, Noise, Vignette } from '@react-three/postprocessing';
import * as THREE from 'three';
import { CCTVCamera } from './CCTVCamera';
import { ClassroomEnvironment, StudentAvatar } from './ClassroomEnvironment';
import { SecurityFeedHUD } from './SecurityFeedHUD';

function SceneContent({ step, setStep }) {
  const cameraHeadRef = useRef();
  
  // Animation Targets
  const studentPos = new THREE.Vector3(2, 0, 0.8); 
  const cctvBasePos = new THREE.Vector3(-5, 5, 5); 

  // Camera Entrance Animation
  const cctvRef = useRef();
  
  useFrame((state, delta) => {
    // Camera is now fixed, no intro animation needed.
    
    if(!cameraHeadRef.current) return;

    // CCTV Look Logic
    const time = state.clock.elapsedTime;
    
    if (step === 0) {
        // Idle: Pan room scanning for targets
        // Slower, more mechanical movement
        const x = Math.sin(time * 0.8) * 10;
        const z = Math.cos(time * 0.8) * 10;
        cameraHeadRef.current.lookAt(x, 0, z);
    } else {
        // Look at Student
        cameraHeadRef.current.lookAt(studentPos.x, studentPos.y + 1.5, studentPos.z);
    }
  });

  // Determines which camera is active
  const isCCTVView = step >= 1; 

  return (
    <>
      {/* ... Cameras & Lights ... */}
      
      {/* 1. External Establishing Shot */}
      {/* Positioned to see both the CCTV (top left corner of room) and the Student */}
      <PerspectiveCamera makeDefault={!isCCTVView} position={[-6, 4, 10]} fov={45} />
      
      {/* Helper controls to frame the shot nicely looking at the center */}
      {!isCCTVView && <OrbitControls target={[0, 2, 0]} enableZoom={false} enablePan={false} maxPolarAngle={Math.PI / 2} />}

      {/* 2. CCTV View */}
      <PerspectiveCamera 
        makeDefault={isCCTVView} 
        position={[-3, 4.5, 2.5]} 
        rotation={[0, -Math.PI/4 - 0.2, 0]} 
        fov={80} // Ultra-wide view
      />

      <Environment preset="city" blur={0.8} background />
      <ambientLight intensity={0.6} />
      <directionalLight position={[5, 10, 5]} intensity={1} castShadow shadow-mapSize={[1024, 1024]} />
      <spotLight position={[10, 5, 0]} angle={0.5} intensity={2} color="#bfdbfe" castShadow />

      <ClassroomEnvironment />
      <StudentAvatar position={[2, 0, 0.8]} isTarget={step >= 1} />
      
      {/* --- 3D ATTACHED TRACKING UI --- */}
      {/* Attached to student BODY position now (lower) */}
      {(step >= 2) && (
        <Html position={[2, 2.2, 0.8]} center distanceFactor={10} zIndexRange={[100, 0]}>
            <div className="relative w-32 h-32 pointer-events-none select-none font-mono">
                {step === 2 && (
                    <div className="w-full h-full border-2 border-dashed border-cyan-400/80 rounded-lg flex items-center justify-center animate-pulse">
                        <div className="absolute -top-6 left-0 text-[10px] bg-cyan-900/80 text-cyan-200 px-1 whitespace-nowrap">
                            SEARCHING...
                        </div>
                        <div className="w-full h-full border border-cyan-500/20 rounded-full animate-[spin_4s_linear_infinite]" />
                    </div>
                )}
                
                {step === 3 && (
                    <div className="w-64 h-32 -translate-x-16 -translate-y-4 bg-black/80 backdrop-blur-md border border-cyan-500/50 rounded-lg overflow-hidden shadow-[0_0_30px_rgba(6,182,212,0.6)] animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Header */}
                        <div className="bg-cyan-900/50 p-2 flex justify-between items-center border-b border-cyan-500/30">
                            <span className="text-[10px] text-cyan-300 tracking-widest">IDENTITY VERIFIED</span>
                            <div className="w-2 h-2 rounded-full bg-green-500 shadow-[0_0_10px_#22c55e]" />
                        </div>
                        
                        {/* Content */}
                        <div className="flex p-3 gap-3">
                            {/* Avatar Placeholder */}
                            <div className="w-16 h-16 bg-gradient-to-br from-cyan-800 to-black rounded border border-cyan-500/30 flex items-center justify-center">
                                <svg className="w-8 h-8 text-cyan-500/50" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                            </div>
                            
                            {/* Details */}
                            <div className="flex flex-col gap-1">
                                <span className="text-white text-sm font-bold tracking-wide">STUDENT #9483</span>
                                <span className="text-[10px] text-cyan-400">CLASS: CS-A | SEM 5</span>
                                <div className="mt-1 px-2 py-0.5 bg-green-900/60 border border-green-500/50 rounded text-[10px] text-green-400 w-fit">
                                    ATTENDANCE LOGGED
                                </div>
                            </div>
                        </div>

                        {/* Scanner Line Effect */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/10 to-transparent h-[200%] w-full animate-[scan_2s_linear_infinite]" />
                    </div>
                )}
            </div>
        </Html>
      )}

      {/* --- CCTV CAMERA GROUP --- */}
      {/* Camera Fixed in Top Corner - Moved closer to center for better visibility */}
      <group ref={cctvRef} position={[-3.5, 4.5, 3]}> 
          <CCTVCamera 
            position={[0, 0, 0]} 
            rotation={[0, -Math.PI/4, 0]} 
            scale={0.3} // Small size
            headRef={cameraHeadRef}
            isDetecting={step >= 1}
            isScanning={step >= 2}
            visible={!isCCTVView} 
          />
      </group>
      
      {/* ... Overlays ... */}
      <group position={[2, 3.2, 0.8]}>
         {/* FaceGrid Removed */}
         
         {step === 3 && (
            <Float speed={2} floatIntensity={0.2}>
                <group position={[0, 1.5, 0]}>
                    <mesh position={[0, 0, 0]}>
                        <planeGeometry args={[3, 1]} />
                        <meshBasicMaterial color="#064e3b" transparent opacity={0.8} />
                    </mesh>
                    <Text position={[0, 0, 0.01]} fontSize={0.3} color="#4ade80">
                        ATTENDANCE MARKED
                    </Text>
                     <mesh position={[0, -0.6, 0]}>
                        <planeGeometry args={[0.05, 1]} />
                        <meshBasicMaterial color="#4ade80" />
                    </mesh>
                </group>
            </Float>
         )}
      </group>

      <ContactShadows position={[0, 0, 0]} opacity={0.4} scale={20} blur={2.5} far={10} />
      
      {/* --- POST PROCESSING (CCTV ONLY) --- */}
      {/* {isCCTVView && (
          <EffectComposer>
              <Noise opacity={0.15} />
              <Vignette eskil={false} offset={0.1} darkness={0.3} />
          </EffectComposer>
      )} */}
    </>
  );
}

export function WhiteModeScene({ onAnimationComplete }) {
  const [step, setStep] = useState(0); 

  useEffect(() => {
    let timeouts = [];
    const sequence = () => {
        setStep(0);
        
        // 1. Detect: Lock onto student (Switch to CCTV View)
        timeouts.push(setTimeout(() => setStep(1), 2000)); // Faster start now that camera is fixed
        
        // 2. Scan: Beam active
        timeouts.push(setTimeout(() => setStep(2), 3500));
        
        // 3. Success: Marked
        timeouts.push(setTimeout(() => {
            setStep(3);
            if (onAnimationComplete) onAnimationComplete();
        }, 6500));

        // Loop
        timeouts.push(setTimeout(sequence, 10000));
    };

    sequence();
    return () => timeouts.forEach(clearTimeout);
  }, [onAnimationComplete]);

  return (
    <div className="h-full w-full relative bg-gray-50 overflow-hidden">
      <Canvas shadows dpr={[1, 2]} gl={{ antialias: true }}>
        <Suspense fallback={null}>
            <SceneContent step={step} setStep={setStep} />
        </Suspense>
      </Canvas>
      
      {/* HUD OVERLAY */}
      <SecurityFeedHUD 
          isCCTVView={step >= 1} 
          isScanning={step === 2} 
          isSuccess={step === 3} 
      />
      
      {/* External View Label */}
      {step === 0 && (
          <div className="absolute bottom-4 left-4 bg-white/80 backdrop-blur px-4 py-2 rounded-lg border border-gray-200">
            <span className="text-xs font-mono text-gray-600 tracking-wider">ESTABLISHING CONNECTION...</span>
          </div>
      )}
    </div>
  );
}
