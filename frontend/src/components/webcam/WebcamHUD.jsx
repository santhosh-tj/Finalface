import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, User, CheckCircle, AlertTriangle } from 'lucide-react';

export function WebcamHUD({ status = 'scanning', activeUser = null, scanLine = true }) {
  // status: 'scanning' | 'detecting' | 'match' | 'unknown'
  
  const colors = {
    scanning: 'text-cyan-400 border-cyan-400/30',
    detecting: 'text-yellow-400 border-yellow-400/50',
    match: 'text-green-500 border-green-500/50',
    unknown: 'text-red-500 border-red-500/50',
  };

  const currentColor = colors[status] || colors.scanning;

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-20">
      {/* Corner Brackets */}
      <div className={`absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 rounded-tl-xl transition-colors duration-300 ${currentColor}`} />
      <div className={`absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 rounded-tr-xl transition-colors duration-300 ${currentColor}`} />
      <div className={`absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 rounded-bl-xl transition-colors duration-300 ${currentColor}`} />
      <div className={`absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 rounded-br-xl transition-colors duration-300 ${currentColor}`} />

      {/* Center Reticle */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className={`relative w-64 h-64 border border-dashed rounded-full opacity-30 animate-spin-slow transition-colors duration-300 ${currentColor}`} />
        <div className={`absolute w-56 h-56 border-2 rounded-lg opacity-50 transition-colors duration-300 ${currentColor}`} />
        
        {/* Status Text HUD */}
        <div className="absolute -bottom-24 bg-black/60 backdrop-blur-md text-white px-4 py-2 rounded-full font-mono text-xs tracking-widest uppercase border border-white/10 flex items-center gap-2">
            {status === 'scanning' && <><Scan size={14} className="animate-pulse" /> SYSTEM SCANNING</>}
            {status === 'detecting' && <><User size={14} className="animate-pulse" /> FACE DETECTED</>}
            {status === 'match' && <><CheckCircle size={14} className="text-green-400" /> IDENTIFIED: {activeUser}</>}
            {status === 'unknown' && <><AlertTriangle size={14} className="text-red-400" /> UNKNOWN SUBJECT</>}
        </div>
      </div>

      {/* Laser Scan Line */}
      {scanLine && status === 'scanning' && (
        <motion.div
            initial={{ top: '0%' }}
            animate={{ top: '100%' }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute left-0 right-0 h-1 bg-cyan-500/50 shadow-[0_0_15px_rgba(6,182,212,0.5)] z-10"
        />
      )}

      {/* Tech Grid Overlay */}
      <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-10 bg-[length:20px_20px]" />
    </div>
  );
}
