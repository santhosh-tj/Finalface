import { useState } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../contexts/AuthContext";
import { LoginForm } from "../../components/auth/LoginForm";
import { LoginScene3D } from "../../components/login/LoginScene3D";
import { WhiteModeScene } from "../../components/login/WhiteModeScene";
import { motion, AnimatePresence } from "framer-motion";
import { useTheme } from "../../contexts/ThemeContext";

export function LoginPage() {
  const { user, loading } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const [is3DComplete, setIs3DComplete] = useState(false);
  
  const isWhiteMode = theme === 'light';

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#050505]">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full"
        />
      </div>
    );
  }

  if (user) {
    const path =
      user.role === "admin"
        ? "/admin"
        : user.role === "faculty"
        ? "/faculty"
        : "/student";
    return <Navigate to={path} replace />;
  }

  return (
    <div className={`min-h-screen w-full flex ${isWhiteMode ? 'bg-white text-gray-900' : 'bg-[#050505] text-white'} overflow-hidden selection:bg-cyan-500/30 transition-colors duration-700`}>
      
      {/* Theme Toggle Button */}
      <button 
        onClick={toggleTheme}
        className="absolute top-6 right-6 z-50 p-2 rounded-full bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 transition-all group"
      >
        {isWhiteMode ? (
           <svg className="w-6 h-6 text-yellow-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
           </svg>
        ) : (
           <svg className="w-6 h-6 text-cyan-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
           </svg>
        )}
      </button>

      {/* Left Side - 3D Animation Scene (Hidden on mobile) */}
      <div className={`hidden lg:block w-1/2 relative ${isWhiteMode ? 'bg-gray-50' : 'bg-black'} transition-colors duration-700`}>
        <AnimatePresence mode="wait">
            <motion.div
                key={isWhiteMode ? 'white' : 'dark'}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.8 }}
                className="absolute inset-0"
            >
                {isWhiteMode ? (
                    <WhiteModeScene onAnimationComplete={() => setIs3DComplete(true)} />
                ) : (
                    <LoginScene3D onAnimationComplete={() => setIs3DComplete(true)} />
                )}
            </motion.div>
        </AnimatePresence>
        
        {/* Overlay Text/Branding on 3D side - Optional, usually scene speaks for itself */}
        <div className="absolute top-8 left-8 z-10 opacity-50 hover:opacity-100 transition-opacity">
            {/* <div className="text-xs font-mono text-cyan-500/80 tracking-[0.2em]">
                F.R.A.S. SYSTEM v2.0
            </div> */}
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-4 relative z-10">
        
        {/* Animated Background Mesh for Right Side */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {!isWhiteMode && (
                <>
                    <div className="absolute top-[-20%] right-[-10%] w-[500px] h-[500px] bg-purple-900/20 rounded-full blur-[100px] mix-blend-screen animate-blob" />
                    <div className="absolute bottom-[-20%] left-[-10%] w-[500px] h-[500px] bg-cyan-900/20 rounded-full blur-[100px] mix-blend-screen animate-blob animation-delay-2000" />
                </>
            )}
            <div className={`absolute inset-0 bg-[url('/grid.svg')] ${isWhiteMode ? 'opacity-[0.05]' : 'opacity-[0.03]'} bg-center [mask-image:linear-gradient(180deg,white,rgba(255,255,255,0))]`} />
        </div>

        <div className="w-full max-w-md relative z-10 transition-all duration-1000">
           
           {/* Glassmorphism Container with Border Gradient */}
           <div className={`
              relative p-8 rounded-3xl
              backdrop-blur-xl
              shadow-[0_0_50px_-12px_rgba(0,0,0,0.5)]
              transition-all duration-700
              ${isWhiteMode 
                ? 'bg-white/80 border border-gray-200 shadow-xl' 
                : 'bg-slate-900/40 border border-white/10'
              }
              ${is3DComplete ? 'ring-1 ring-cyan-500/30' : ''}
           `}>
                {/* Shine Effect */}
                <div className={`absolute inset-0 bg-gradient-to-tr ${isWhiteMode ? 'from-white/40' : 'from-white/5'} to-transparent rounded-3xl pointer-events-none`} />
                
                <LoginForm isWhiteMode={isWhiteMode} />
           </div>
          
        </div>
      </div>

    </div>
  );
}

