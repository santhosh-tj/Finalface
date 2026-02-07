import React from 'react';
import { Html } from '@react-three/drei';
import { motion, AnimatePresence } from 'framer-motion';

export function PhoneScreen({ step }) {
  // step: 0=Off, 1=Wake/Camera, 2=Scanning, 3=Success
  
  return (
    <Html
      transform
      position={[0, 0, 0.06]} // Slightly above the black screen backing
      style={{
        width: '370px',
        height: '775px',
        backgroundColor: '#000',
        borderRadius: '40px',
        overflow: 'hidden',
      }}
      scale={0.235} // Adjusted for 390px width to fit 2.3 unit model
    >
      <div className="w-full h-full relative flex flex-col font-sans text-white">
        
        {/* Status Bar */}
        <div className="absolute top-0 w-full p-6 flex justify-between items-center text-xs opacity-70 z-20">
            <span>12:00</span>
            <div className="flex gap-2">
                <span>5G</span>
                <span>100%</span>
            </div>
        </div>

        <AnimatePresence mode="wait">
            
            {/* State 0: Off / Black Screen */}
            {step < 1 && (
                <motion.div 
                    key="off"
                    initial={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.5 }}
                    className="absolute inset-0 bg-black z-30"
                />
            )}

            {/* State 1 & 2: Camera Viewfinder */}
            {step >= 1 && step < 3 && (
                <motion.div
                    key="camera"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-gray-950 overflow-hidden"
                >
                    {/* Simulated Camera Feed / Background Tech Grid */}
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:20px_20px] opacity-20" />
                    <div className="absolute inset-0 bg-gradient-to-b from-gray-900/80 to-black/90" />
                    
                    {/* Biometric Corner Data */}
                    <div className="absolute top-16 left-6 text-[14px] font-mono text-cyan-500/60 leading-tight">
                        NODE_SYNC: OK<br/>
                        LAT_REF: 4.2ms<br/>
                        BUF_SIZE: 1024KB
                    </div>
                    <div className="absolute top-16 right-6 text-[14px] font-mono text-cyan-500/60 text-right leading-tight">
                        BIO_SIG: ACTIVE<br/>
                        CONF_LMT: 98%<br/>
                        SYS_V: 1.0.4
                    </div>

                    {/* Camera UI Overlays */}
                    <div className="absolute inset-0 flex flex-col items-center justify-center">
                        {/* Focus Reticle */}
                        <motion.div 
                            animate={step === 2 ? { scale: [1, 1.05, 1] } : {}}
                            transition={{ repeat: Infinity, duration: 2 }}
                            className="w-56 h-56 border border-white/10 rounded-3xl relative flex items-center justify-center"
                        >
                            {/* Corner Brackets */}
                            <div className="absolute -top-1 -left-1 w-8 h-8 border-t-2 border-l-2 border-cyan-400" />
                            <div className="absolute -top-1 -right-1 w-8 h-8 border-t-2 border-r-2 border-cyan-400" />
                            <div className="absolute -bottom-1 -left-1 w-8 h-8 border-b-2 border-l-2 border-cyan-400" />
                            <div className="absolute -bottom-1 -right-1 w-8 h-8 border-b-2 border-r-2 border-cyan-400" />

                            {/* Active Laser Scan Line */}
                            {step === 2 && (
                                <motion.div 
                                    initial={{ top: '10%' }}
                                    animate={{ top: '90%' }}
                                    transition={{ repeat: Infinity, duration: 2.5, ease: "linear" }}
                                    className="absolute left-1 right-1 h-0.5 bg-cyan-400/50 shadow-[0_0_15px_#22d3ee] z-10"
                                />
                            )}

                            {/* Center Target Sphere/Face Mask Mockup */}
                            <div className="w-40 h-40 rounded-full border border-cyan-500/10 bg-cyan-500/5 flex items-center justify-center">
                                <motion.div 
                                    animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.3, 0.1] }}
                                    transition={{ repeat: Infinity, duration: 3 }}
                                    className="w-32 h-32 rounded-full bg-cyan-400/20 blur-xl"
                                />
                            </div>
                        </motion.div>
                        
                        <div className="mt-12 flex flex-col items-center gap-2">
                            <p className="text-16px font-mono text-cyan-400 tracking-[0.2em] animate-pulse">
                                {step === 2 ? "SCANNING BIOMETRICS..." : "READY TO SCAN"}
                            </p>
                            {step === 2 && (
                                <div className="w-32 h-1 bg-gray-800 rounded-full overflow-hidden">
                                    <motion.div 
                                        initial={{ x: '-100%' }}
                                        animate={{ x: '100%' }}
                                        transition={{ repeat: Infinity, duration: 1.5 }}
                                        className="w-1/2 h-full bg-cyan-400"
                                    />
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Bottom Camera Interface */}
                    <div className="absolute bottom-12 w-full px-8 flex justify-between items-center text-[16px] font-mono text-white/30 uppercase tracking-widest">
                        <span>P: 34.00</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-cyan-400 animate-ping" />
                        <span>F: 24.00</span>
                    </div>
                </motion.div>
            )}

            {/* State 3: Success Dashboard */}
            {step === 3 && (
                <motion.div
                    key="success"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="absolute inset-0 bg-[#0a0a0c] flex flex-col p-8 overflow-hidden"
                >
                    {/* Background Grid Effect */}
                    <div className="absolute inset-0 opacity-10 pointer-events-none" 
                         style={{ backgroundImage: 'radial-gradient(#3b82f6 0.5px, transparent 0.5px), radial-gradient(#3b82f6 0.5px, #0a0a0c 0.5px)', backgroundSize: '20px 20px' }}>
                    </div>

                    {/* Banner Header */}
                    <motion.div 
                        initial={{ y: -50, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        className="bg-green-500/10 border border-green-500/30 p-4 rounded-xl mb-8 relative"
                    >
                        <h2 className="text-xl font-bold text-green-400 tracking-tight">ATTENDANCE MARKED</h2>
                        <div className="absolute top-2 right-2 flex gap-1">
                            <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                        </div>
                    </motion.div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex flex-col items-center justify-center">
                            <span className="text-[10px] opacity-40 uppercase tracking-widest mb-1">Status</span>
                            <span className="text-green-400 font-mono text-sm">VERIFIED</span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-lg border border-white/10 flex flex-col items-center justify-center">
                            <span className="text-[10px] opacity-40 uppercase tracking-widest mb-1">Time</span>
                            <span className="text-cyan-400 font-mono text-sm">{new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                        </div>
                    </div>

                    {/* Identity Panel */}
                    <div className="bg-white/5 rounded-2xl p-6 border border-white/10 flex flex-col items-center relative flex-grow">
                        {/* Profile Frame */}
                        <div className="w-32 h-32 rounded-full bg-gradient-to-br from-cyan-900/50 to-transparent border-2 border-cyan-500/20 mb-6 flex items-center justify-center relative">
                             <div className="absolute inset-2 border border-cyan-500/10 rounded-full animate-[spin_10s_linear_infinite]" />
                             <svg className="w-12 h-12 text-cyan-500/30" fill="currentColor" viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>
                        </div>
                        
                        <div className="text-center">
                            <h3 className="text-lg font-bold tracking-wide">ID: verified</h3>
                            <p className="text-xs opacity-50 uppercase tracking-widest mt-1">Confidence 99.7%</p>
                        </div>

                        {/* Animated Scanning Line */}
                        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-cyan-400/5 to-transparent h-[200%] w-full animate-[scan_3s_linear_infinite] mt-[-100%]" />
                    </div>

                    {/* Bottom Status */}
                    <div className="mt-8 flex justify-between items-center opacity-40 text-[10px] uppercase tracking-tighter">
                        <span>LOG_REF: 4892_A</span>
                        <span>AUTH_SUCCESS</span>
                    </div>

                </motion.div>
            )}

        </AnimatePresence>
      </div>
    </Html>
  );
}
