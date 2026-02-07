import React, { useRef, useState } from 'react';
import { useTheme } from '../../contexts/ThemeContext';
import { User, Shield, Activity } from 'lucide-react';
import { motion } from 'framer-motion';

export function HolographicCard({ user }) {
  const cardRef = useRef(null);
  const [rotate, setRotate] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const handleMouseMove = (e) => {
    if (!cardRef.current) return;
    const { left, top, width, height } = cardRef.current.getBoundingClientRect();
    const x = e.clientX - left;
    const y = e.clientY - top;
    
    // Calculate rotation (-10 to 10 degrees)
    const rotateY = ((x / width) - 0.5) * 20; 
    const rotateX = ((y / height) - 0.5) * -20;
    
    setRotate({ x: rotateX, y: rotateY });
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setRotate({ x: 0, y: 0 });
    setOpacity(0);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className="perspective-1000 w-full max-w-sm mx-auto perspective-[1000px]"
    >
      <div
        ref={cardRef}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform: `rotateX(${rotate.x}deg) rotateY(${rotate.y}deg)`,
          transition: 'transform 0.1s ease-out',
        }}
        className={`
          relative w-full aspect-[1.586/1] rounded-2xl p-6 overflow-hidden transform-style-3d
          ${isDark ? 'bg-black/60 border-white/10' : 'bg-white/60 border-gray-200'}
          border border-opacity-50 backdrop-blur-xl shadow-2xl
        `}
      >
        {/* Holographic Shine Gradient */}
        <div 
            className="absolute inset-0 pointer-events-none z-20 mix-blend-overlay"
            style={{
                background: `linear-gradient(105deg, transparent 40%, rgba(255,255,255,0.4) 45%, rgba(255,255,255,0.1) 50%, transparent 54%)`,
                transform: `translateX(${rotate.y * 3}%) translateY(${rotate.x * 3}%)`,
                opacity: opacity
            }}
        />

        {/* Content Layer */}
        <div className="relative z-10 flex flex-col justify-between h-full text-white transform translate-z-10">
            {/* Top Row: Chip & Logo */}
            <div className="flex justify-between items-start">
                 <div className="w-12 h-9 border border-yellow-500/50 bg-yellow-500/20 rounded-md flex items-center justify-center relative overflow-hidden">
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/circuit-board.png')] opacity-30" />
                    <Activity size={16} className="text-yellow-400 animate-pulse" />
                 </div>
                 <div className="text-right">
                    <h3 className={`font-bold text-lg tracking-widest uppercase ${isDark ? 'text-white' : 'text-gray-900'}`}>Academy ID</h3>
                    <p className={`text-[10px] ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>OFFICIAL STUDENT</p>
                 </div>
            </div>

            {/* Middle: User Info */}
            <div className="flex items-center gap-4 mt-4">
                <div className={`
                    w-16 h-16 rounded-full border-2 flex items-center justify-center text-2xl font-bold shadow-lg
                    ${isDark ? 'border-cyan-400 bg-cyan-900/50 text-cyan-200' : 'border-blue-500 bg-blue-100 text-blue-600'}
                `}>
                    {user?.name?.charAt(0) || <User />}
                </div>
                <div>
                    <h2 className={`text-2xl font-bold tracking-tight ${isDark ? 'text-white' : 'text-gray-900'}`}>{user?.name}</h2>
                    <p className={`font-mono text-sm ${isDark ? 'text-cyan-400' : 'text-blue-600'}`}>{user?.email || "ID: 9483-2921"}</p>
                </div>
            </div>

            {/* Bottom: Status */}
            <div className="flex justify-between items-end mt-4">
                 <div className={`text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 border border-green-500/30 flex items-center gap-1`}>
                    <Shield size={12} /> VERIFIED
                 </div>
                 <p className={`text-[10px] font-mono opacity-50 ${isDark ? 'text-white' : 'text-black'}`}>
                    FACIAL RECOGNITION ENABLED
                 </p>
            </div>
        </div>

        {/* Border Glow */}
        <div className={`absolute inset-0 border-2 rounded-2xl pointer-events-none ${isDark ? 'border-cyan-500/20' : 'border-blue-500/20'}`} />
        
        {/* Background Texture */}
        <div className={`absolute inset-0 opacity-20 pointer-events-none z-0 ${isDark ? 'bg-gradient-to-br from-cyan-900 via-transparent to-purple-900' : 'bg-gradient-to-br from-blue-200 via-transparent to-purple-200'}`} />
      </div>
    </motion.div>
  );
}
