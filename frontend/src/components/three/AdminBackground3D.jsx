import React from 'react';
import { useTheme } from '../../contexts/ThemeContext';

export function AdminBackground3D() {
  const { theme } = useTheme();
  
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden">
      {/* Main Background Color */}
      <div className={`absolute inset-0 transition-colors duration-700 ${
        theme === 'dark' ? 'bg-space-950' : 'bg-gray-50'
      }`}>
        {/* Modern Gradient Orbs */}
        <div className={`absolute -top-20 -left-20 w-96 h-96 rounded-full blur-[100px] opacity-30 animate-pulse-slow ${
          theme === 'dark' ? 'bg-cyber-500' : 'bg-blue-400'
        }`} />
        
        <div className={`absolute top-1/4 right-0 w-[30rem] h-[30rem] rounded-full blur-[120px] opacity-20 animate-pulse-slow delay-1000 ${
          theme === 'dark' ? 'bg-electric-500' : 'bg-purple-400'
        }`} />
        
        <div className={`absolute bottom-0 left-1/3 w-[40rem] h-[40rem] rounded-full blur-[130px] opacity-20 animate-pulse-slow delay-2000 ${
          theme === 'dark' ? 'bg-space-700' : 'bg-indigo-300'
        }`} />

        {/* Mesh Grid Pattern Overlay */}
        <div className={`absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-[0.03] ${
            theme === 'dark' ? 'invert' : '' 
        }`} />
        
        {/* Radial Gradient for focus */}
        <div className={`absolute inset-0 ${
            theme === 'dark' 
            ? 'bg-[radial-gradient(circle_at_center,_transparent_0%,_#0f0f12_100%)]' 
            : 'bg-[radial-gradient(circle_at_center,_transparent_0%,_#f9fafb_100%)]'
        }`} />
      </div>
    </div>
  );
}
