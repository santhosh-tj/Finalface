import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar as CalendarIcon, Clock, CheckCircle, TrendingUp, User, LogOut, Sun, Moon, Camera, Flame, Trophy, Award, Zap } from 'lucide-react';
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, addMonths, subMonths } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useTheme } from '../../contexts/ThemeContext';
import { StudentBackground3D } from '../../components/layout/StudentBackground3D';
import { HolographicCard } from '../../components/common/HolographicCard';
import AntigravityFeed from '../../components/webcam/AntigravityFeed';

// --- Glass Stat Card 2.0 ---
const GlassStatCard = ({ title, value, subtitle, icon: Icon, color = "cyan", delay = 0, isDarkMode }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: delay * 0.1 }}
      className={`
        relative overflow-hidden p-6 rounded-2xl border transition-all duration-300 group hover:scale-105
        ${isDarkMode ? 'bg-black/40 border-white/10 hover:bg-white/5' : 'bg-white/60 border-gray-200 hover:bg-white/80 shadow-lg'}
        backdrop-blur-xl
      `}
    >
      <div className={`absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity`}>
        <Icon size={80} />
      </div>
      
      <div className="relative z-10">
         <div className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${isDarkMode ? `bg-${color}-500/20 text-${color}-400` : `bg-${color}-100 text-${color}-600`}`}>
            <Icon size={24} />
         </div>
         <h3 className={`text-3xl font-bold mb-1 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
         <p className={`text-sm font-medium uppercase tracking-wider ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
         
         {subtitle && (
             <div className="mt-3 flex items-center gap-1 text-xs font-mono opacity-70">
                <TrendingUp size={12} /> {subtitle}
             </div>
         )}
      </div>
      
      {/* Bottom Glow Bar */}
      <div className={`absolute bottom-0 left-0 h-1 bg-${color}-500 transition-all duration-500 w-0 group-hover:w-full`} />
    </motion.div>
  );
};

// --- Attendance Streak Component ---
const StreakBadge = ({ streak = 12 }) => {
    return (
        <div className="relative group">
            <div className="absolute inset-0 bg-orange-500/20 blur-xl rounded-full group-hover:bg-orange-500/40 transition-all animate-pulse" />
            <div className="relative bg-gradient-to-br from-orange-500 to-red-600 p-1 rounded-2xl shadow-lg border border-orange-400/50">
                <div className="bg-black/20 backdrop-blur-sm rounded-xl px-4 py-2 flex items-center gap-2">
                    <Flame className="text-yellow-300 animate-bounce" fill="currentColor" size={20} />
                    <div>
                        <p className="text-[10px] font-bold text-orange-200 uppercase tracking-widest">Streak</p>
                        <p className="text-xl font-black text-white leading-none">{streak} <span className="text-xs font-normal opacity-80">Days</span></p>
                    </div>
                </div>
            </div>
        </div>
    );
};

// --- Calendar Component ---
const GlassCalendar = ({ isDarkMode }) => {
    const [currentDate, setCurrentDate] = useState(new Date());
    const daysInMonth = eachDayOfInterval({
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
    });

    const bgClass = isDarkMode ? "bg-black/30 border-white/10" : "bg-white/50 border-gray-200 shadow-xl";
    const textClass = isDarkMode ? "text-white" : "text-gray-900";
    const btnClass = isDarkMode ? "hover:bg-white/10 text-white" : "hover:bg-gray-100 text-gray-700";

    return (
        <div className={`backdrop-blur-md rounded-3xl border p-6 ${bgClass} relative overflow-hidden`}>
            {/* Decorative BG */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

            <div className="flex justify-between items-center mb-6 relative z-10">
                <h2 className={`text-xl font-bold ${textClass} flex items-center gap-2`}>
                    <CalendarIcon size={20} className="text-blue-500" />
                    {format(currentDate, 'MMMM yyyy')}
                </h2>
                <div className="flex gap-1 bg-black/5 dark:bg-white/5 p-1 rounded-lg">
                    <button onClick={() => setCurrentDate(subMonths(currentDate, 1))} className={`p-1.5 rounded-md transition ${btnClass}`}>&lt;</button>
                    <button onClick={() => setCurrentDate(addMonths(currentDate, 1))} className={`p-1.5 rounded-md transition ${btnClass}`}>&gt;</button>
                </div>
            </div>
            
            <div className="grid grid-cols-7 gap-2 text-center text-xs font-bold mb-2 opacity-50">
                {['S', 'M', 'T', 'W', 'T', 'F', 'S'].map((day, i) => <div key={i}>{day}</div>)}
            </div>
                
            <div className="grid grid-cols-7 gap-2">
                {daysInMonth.map((day, idx) => {
                    const isToday = isSameDay(day, new Date());
                    const status = idx % 5 === 0 ? 'absent' : idx % 3 === 0 ? 'late' : 'present'; 
                    // Simulating random status for demo
                    
                    let statusStyle = "";
                    if (day > new Date()) statusStyle = isDarkMode ? "text-gray-600" : "text-gray-300";
                    else if (status === 'present') statusStyle = isDarkMode ? "bg-green-500/20 text-green-400 border-green-500/30" : "bg-green-100 text-green-600 border-green-200";
                    else if (status === 'absent') statusStyle = isDarkMode ? "bg-red-500/20 text-red-400 border-red-500/30" : "bg-red-100 text-red-600 border-red-200";
                    else statusStyle = isDarkMode ? "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" : "bg-yellow-100 text-yellow-600 border-yellow-200";

                    return (
                        <div 
                            key={day.toString()} 
                            className={`
                                aspect-square flex flex-col items-center justify-center rounded-xl border transition-all cursor-pointer relative group
                                ${statusStyle} ${isToday ? 'ring-2 ring-blue-500 shadow-lg shadow-blue-500/30' : 'border-transparent'}
                            `}
                        >
                            <span className="text-xs font-bold">{format(day, 'd')}</span>
                            {/* Dot Indicator */}
                            {day <= new Date() && (
                                <div className={`w-1 h-1 rounded-full mt-1 ${
                                    status === 'present' ? 'bg-green-500' : 
                                    status === 'absent' ? 'bg-red-500' : 'bg-yellow-500'
                                }`} />
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default function StudentDashboard() {
    const [showCamera, setShowCamera] = useState(false);
    const { logout, user } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const isDarkMode = theme === 'dark';

    return (
        <div className={`min-h-screen relative font-sans overflow-x-hidden ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            <StudentBackground3D />
            
            {/* Main Content Layer */}
            <div className="relative z-10 p-6 md:p-10 max-w-[1600px] mx-auto min-h-screen flex flex-col">
                
                {/* Header */}
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
                    <div>
                        <motion.h1 
                            initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }}
                            className="text-5xl md:text-6xl font-black tracking-tight"
                        >
                            <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 via-cyan-400 to-purple-500 animate-gradient-x">
                                HELLO, {user?.name?.split(' ')[0] || "STUDENT"}
                            </span>
                        </motion.h1>
                        <motion.p 
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} delay={0.2}
                            className={`text-lg mt-2 font-medium ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}
                        >
                            Ready to conquer another day of learning?
                        </motion.p>
                    </div>

                    <div className="flex items-center gap-4">
                        <StreakBadge streak={15} />
                        
                        <div className="h-12 w-[1px] bg-gray-500/20 mx-2" />
                        
                        <button 
                            onClick={toggleTheme}
                            className={`p-3 rounded-xl backdrop-blur-md border transition-all hover:scale-105 active:scale-95 ${isDarkMode ? "bg-white/10 border-white/10 text-yellow-300" : "bg-white/60 border-gray-200 text-gray-700 shadow-sm"}`}
                        >
                            {isDarkMode ? <Sun size={20} /> : <Moon size={20} />}
                        </button>
                        
                        <button 
                            onClick={logout}
                            className={`p-3 rounded-xl backdrop-blur-md border transition-all hover:scale-105 active:scale-95 group ${isDarkMode ? "bg-red-500/10 border-red-500/20 text-red-400" : "bg-white/60 border-red-200 text-red-500 shadow-sm"}`}
                        >
                            <LogOut size={20} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </header>

                {/* Dashboard Grid */}
                <AnimatePresence mode="wait">
                    {showCamera ? (
                        <motion.div 
                            key="camera"
                            initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="flex-1 flex flex-col gap-6"
                        >
                            <div className="flex justify-between items-center">
                                <h2 className="text-2xl font-bold flex items-center gap-2"><Camera className="text-cyan-400" /> Attendance Scanner</h2>
                                <button 
                                    onClick={() => setShowCamera(false)}
                                    className="px-6 py-2 rounded-lg bg-gray-500/20 hover:bg-gray-500/30 text-sm font-bold border border-white/10"
                                >
                                    CLOSE INTERFACE
                                </button>
                            </div>
                            <div className="flex-1 rounded-3xl overflow-hidden border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] relative bg-black">
                                <AntigravityFeed />
                                {/* HUD Overlay Elements would go here */}
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div 
                            key="dashboard"
                            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                            className="grid grid-cols-1 lg:grid-cols-12 gap-8"
                        >
                            {/* Left Column: ID & Quick Actions (4 cols) */}
                            <div className="lg:col-span-4 space-y-8">
                                <HolographicCard user={user} />
                                
                                <div className={`p-6 rounded-3xl border backdrop-blur-xl ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-gray-200 shadow-xl"}`}>
                                    <h3 className="text-sm font-bold uppercase tracking-widest mb-4 opacity-70">Quick Actions</h3>
                                    <div className="grid grid-cols-1 gap-3">
                                        <button 
                                            onClick={() => setShowCamera(true)}
                                            className="w-full py-4 rounded-xl bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 text-white font-bold shadow-lg shadow-cyan-500/25 flex items-center justify-center gap-3 transition-transform hover:scale-[1.02] active:scale-98"
                                        >
                                            <Camera size={20} /> MARK ATTENDANCE
                                        </button>
                                        <Link 
                                            to="/student/register-face"
                                            className={`w-full py-4 rounded-xl border font-bold flex items-center justify-center gap-3 transition-all ${isDarkMode ? "bg-white/5 border-white/10 hover:bg-white/10" : "bg-white border-gray-200 hover:bg-gray-50"}`}
                                        >
                                            <User size={20} /> UPDATE FACE ID
                                        </Link>
                                    </div>
                                </div>

                                {/* Gamification / Level Progress */}
                                <div className={`p-6 rounded-3xl border backdrop-blur-xl ${isDarkMode ? "bg-gradient-to-br from-purple-900/40 to-black/40 border-purple-500/20" : "bg-white/60 border-purple-100 shadow-xl"}`}>
                                    <div className="flex justify-between items-center mb-2">
                                        <span className="font-bold flex items-center gap-2"><Trophy size={16} className="text-yellow-400" /> Current Level</span>
                                        <span className="font-mono text-sm opacity-70">XP: 2,450 / 3,000</span>
                                    </div>
                                    <h4 className="text-2xl font-black italic text-purple-400 mb-4">SCHOLAR ELITE</h4>
                                    <div className="h-2 w-full bg-black/20 rounded-full overflow-hidden">
                                        <div className="h-full bg-gradient-to-r from-purple-500 to-pink-500 w-[82%]" />
                                    </div>
                                    <p className="text-xs text-center mt-2 opacity-50">150 XP to next level</p>
                                </div>
                            </div>
                            
                            {/* Right Column: Stats & Activity (8 cols) */}
                            <div className="lg:col-span-8 flex flex-col gap-8">
                                {/* Stats Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <GlassStatCard 
                                        title="Attendance" value="92%" subtitle="Excellent" 
                                        icon={CheckCircle} color="emerald" delay={1} isDarkMode={isDarkMode}
                                    />
                                    <GlassStatCard 
                                        title="Sessions" value="48" subtitle="This Semester" 
                                        icon={Zap} color="amber" delay={2} isDarkMode={isDarkMode}
                                    />
                                    <GlassStatCard 
                                        title="Performance" value="A+" subtitle="Top 5%" 
                                        icon={Award} color="rose" delay={3} isDarkMode={isDarkMode}
                                    />
                                </div>

                                {/* Calendar & History Split */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 flex-1">
                                    <GlassCalendar isDarkMode={isDarkMode} />
                                    
                                    {/* Recent Activity Timeline placeholder for now, or simple list */}
                                    <div className={`rounded-3xl border backdrop-blur-xl p-6 flex flex-col ${isDarkMode ? "bg-white/5 border-white/10" : "bg-white/60 border-gray-200 shadow-xl"}`}>
                                        <h3 className="font-bold text-lg mb-6 flex items-center gap-2">
                                            <Clock size={20} className="text-cyan-400" /> Recent Activity
                                        </h3>
                                        
                                        <div className="space-y-6 relative flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                            {/* Timeline Line */}
                                            <div className={`absolute left-[19px] top-2 bottom-0 w-[2px] ${isDarkMode ? "bg-white/10" : "bg-gray-200"}`} />
                                            
                                            {[1,2,3].map((_, i) => (
                                                <div key={i} className="flex gap-4 relative z-10">
                                                    <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-4 ${isDarkMode ? "bg-gray-900 border-gray-800" : "bg-white border-gray-50"}`}>
                                                        <div className={`w-3 h-3 rounded-full ${i===0 ? "bg-green-500 animate-pulse" : "bg-gray-400"}`} />
                                                    </div>
                                                    <div>
                                                        <p className="font-bold text-sm">Advanced AI Systems</p>
                                                        <p className="text-xs opacity-60">Today, 09:30 AM • Present</p>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

