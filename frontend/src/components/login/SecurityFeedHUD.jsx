import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

export function SecurityFeedHUD({ isScanning, isSuccess, isCCTVView }) {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  if (!isCCTVView) return null;

  return (
    <div className="absolute inset-0 pointer-events-none select-none overflow-hidden font-mono tracking-widest text-white/90 z-40">
      
      {/* --- CORNER INFORMATION --- */}
      <div className="absolute top-4 left-4 flex flex-col gap-1">
         <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-600 animate-pulse box-shadow-glow" />
            <span className="text-xl font-bold text-red-600">REC</span>
         </div>
         <span className="text-sm opacity-80">CAM 01 : CLASSROOM A</span>
      </div>

      <div className="absolute top-4 right-4 text-right">
         <div className="text-lg">{time.toLocaleTimeString()}</div>
         <div className="text-xs opacity-60">{time.toLocaleDateString()}</div>
      </div>

      <div className="absolute bottom-4 left-4 text-xs opacity-60">
         FRAME: {Math.floor(Date.now() / 100) % 9999} <br/>
         SIG: 98% [STRONG]
      </div>

      {/* --- SCANLINES & NOISE EFFECTS --- */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/40" />
      
      {/* Vignette */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_50%,rgba(0,0,0,0.6)_100%)]" />

    </div>
  );
}
