import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export function FacultyBackground() {
  const { theme } = useTheme();
  
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Base Layer */}
      <div className={`absolute inset-0 transition-colors duration-700 ${
        theme === 'dark' ? 'bg-[#050505]' : 'bg-slate-50'
      }`}>
        {/* Animated Gradient Meshes */}
        <div className={`absolute top-0 right-0 w-[50vw] h-[50vw] rounded-full blur-[120px] opacity-20 animate-pulse-slow ${
          theme === 'dark' ? 'bg-cyan-600' : 'bg-blue-300'
        }`} />
        
        <div className={`absolute bottom-0 left-0 w-[60vw] h-[60vw] rounded-full blur-[150px] opacity-15 animate-pulse-slow delay-1000 ${
          theme === 'dark' ? 'bg-violet-700' : 'bg-indigo-300'
        }`} />
        
        {/* Grid Overlay for "Tech" feel */}
        <div className={`absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.05] ${
            theme === 'dark' ? 'invert' : ''
        }`} style={{ backgroundSize: '40px 40px' }} />

        {/* Scanline Effect (subtle) */}
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent bg-[length:100%_4px] pointer-events-none" />
      </div>
    </div>
  );
}
