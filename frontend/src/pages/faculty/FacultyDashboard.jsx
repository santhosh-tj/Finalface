import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { FacultyBackground } from "../../components/layout/FacultyBackground";
import { facultyApi } from "../../api/client";
import { useTheme } from "../../contexts/ThemeContext";
import { Sun, Moon, Activity, Clock, Calendar, Users, ArrowRight, Video, Radio } from "lucide-react";
import { motion } from "framer-motion";



export function FacultyDashboard() {
  const [sessions, setSessions] = useState([]);
  const [loading, setLoading] = useState(true);
  const { theme, toggleTheme } = useTheme();
  const isDarkMode = theme === 'dark';

  useEffect(() => {
    facultyApi
      .listSessions()
      .then(({ data }) => setSessions(data.sessions || []))
      .catch(() => setSessions([]))
      .finally(() => setLoading(false));
  }, []);

  const activeSessions = sessions.filter((s) => !s.endTime);
  const todaySessions = sessions.filter((s) => {
    const d = s.startTime?.slice?.(0, 10) || new Date().toISOString().slice(0, 10);
    return d === new Date().toISOString().slice(0, 10);
  });

  // Animation Variants
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { y: 20, opacity: 0 },
    show: { y: 0, opacity: 1 }
  };

  return (
    <div className="flex min-h-screen relative overflow-hidden font-sans bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <FacultyBackground />
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 h-screen overflow-y-auto">
        <Header
          title="Faculty Command Center"
          subtitle="Real-time attendance monitoring and session management"
          className="!bg-white/80 dark:!bg-transparent backdrop-blur-md border-b !border-gray-200 dark:!border-white/5"
        />
        
        {/* Theme Toggle Overlay */}
        <motion.button 
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
            onClick={toggleTheme}
            className="fixed top-6 right-6 z-50 p-3 rounded-full bg-white/80 dark:bg-white/10 backdrop-blur-md border border-gray-200 dark:border-white/20 text-gray-800 dark:text-white shadow-xl shadow-black/5"
        >
            {isDarkMode ? <Sun size={20} className="text-yellow-400" /> : <Moon size={20} className="text-blue-600" />}
        </motion.button>

        <div className="p-8 pb-20">
          <motion.div 
            variants={container}
            initial="hidden"
            animate="show"
            className="space-y-8"
          >
            
            {/* Action Hero Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Start Session Card - The Main Action */}
                <motion.div variants={item} className="lg:col-span-2 group relative overflow-hidden rounded-3xl bg-gradient-to-br from-blue-600 to-indigo-700 dark:from-blue-900 dark:to-indigo-950 p-1 shadow-2xl shadow-blue-900/20">
                    <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20"></div>
                    <div className="absolute -right-20 -top-20 w-80 h-80 bg-blue-400/30 rounded-full blur-3xl group-hover:bg-blue-300/40 transition-colors duration-500"></div>
                    
                    <div className="relative h-full bg-white/5 backdrop-blur-sm rounded-[22px] p-8 flex flex-col justify-between overflow-hidden">
                        <div className="relative z-10">
                            <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-100 text-xs font-bold tracking-wider uppercase mb-4 shadow-sm">
                                Ready for Launch
                            </span>
                            <h2 className="text-4xl font-display font-bold text-white mb-2 leading-tight drop-shadow-md">
                                Start New Context<br/>Aware Session
                            </h2>
                            <p className="text-blue-100/90 text-lg max-w-md font-medium">
                                Initialize high-precision face recognition attendance or enable GPS-fenced mobile check-ins.
                            </p>
                        </div>
                        
                        <div className="mt-8 flex items-center gap-4">
                            <Link to="/faculty/session">
                                <motion.button
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                    className="px-8 py-4 bg-white text-blue-900 rounded-xl font-bold text-lg shadow-[0_4px_20px_rgba(0,0,0,0.2)] hover:shadow-[0_8px_30px_rgba(255,255,255,0.4)] transition-all flex items-center gap-2"
                                >
                                    <Video size={20} /> Initialize System
                                </motion.button>
                            </Link>
                            <span className="text-white/60 text-sm font-medium">or press <kbd className="bg-white/10 px-2 py-1 rounded mx-1 border border-white/10">S</kbd></span>
                        </div>
                    </div>
                </motion.div>

                {/* Quick Stats Grid - Compact */}
                <motion.div variants={item} className="grid grid-rows-2 gap-6">
                    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-emerald-500/10 border border-gray-200 dark:border-emerald-500/20 backdrop-blur-md p-6 flex items-center justify-between group shadow-lg shadow-gray-200/50 dark:shadow-none transition-colors">
                        <div>
                            <p className="text-gray-500 dark:text-emerald-400 font-bold uppercase text-xs tracking-wider mb-1">Active Sessions</p>
                            <h3 className="text-4xl font-bold text-gray-900 dark:text-emerald-100">{activeSessions.length}</h3>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-emerald-100 dark:bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                             <Radio size={32} className="text-emerald-600 dark:text-emerald-400 animate-pulse" />
                        </div>
                    </div>

                    <div className="relative overflow-hidden rounded-3xl bg-white dark:bg-purple-500/10 border border-gray-200 dark:border-purple-500/20 backdrop-blur-md p-6 flex items-center justify-between group shadow-lg shadow-gray-200/50 dark:shadow-none transition-colors">
                        <div>
                            <p className="text-gray-500 dark:text-purple-400 font-bold uppercase text-xs tracking-wider mb-1">Scheduled Today</p>
                            <h3 className="text-4xl font-bold text-gray-900 dark:text-purple-100">{todaySessions.length}</h3>
                        </div>
                        <div className="w-16 h-16 rounded-2xl bg-purple-100 dark:bg-purple-500/20 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                             <Clock size={32} className="text-purple-600 dark:text-purple-400" />
                        </div>
                    </div>
                </motion.div>
            </div>

            {/* Recent Sessions Table - Glassmorphic */}
            <motion.div variants={item} className="relative rounded-3xl bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 overflow-hidden shadow-2xl transition-all">
                <div className="p-6 border-b border-gray-200 dark:border-white/5 flex items-center justify-between">
                    <h3 className="text-xl font-bold text-gray-900 dark:text-white flex items-center gap-2">
                        <Activity className="text-blue-500" /> Recent Activity
                    </h3>
                    <Link to="/faculty/reports" className="text-sm font-medium text-blue-600 dark:text-blue-300 hover:text-blue-800 dark:hover:text-white transition-colors flex items-center gap-1 group">
                        View All History <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
                
                <div className="overflow-x-auto">
                    <table className="w-full text-left">
                        <thead>
                            <tr className="bg-gray-50 dark:bg-white/5 text-gray-500 dark:text-gray-400 text-xs uppercase tracking-wider border-b border-gray-200 dark:border-white/5">
                                <th className="p-4 font-bold">Session Status</th>
                                <th className="p-4 font-bold">Course Info</th>
                                <th className="p-4 font-bold">Input Mode</th>
                                <th className="p-4 font-bold">Timestamp</th>
                                <th className="p-4 font-bold text-right">Action</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 dark:divide-white/5">
                            {loading ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500 dark:text-white/50">Querying database...</td></tr>
                            ) : sessions.length === 0 ? (
                                <tr><td colSpan="5" className="p-8 text-center text-gray-500 dark:text-white/50">No session data found.</td></tr>
                            ) : (
                                sessions.slice(0, 5).map(session => (
                                    <tr key={session.id} className="hover:bg-blue-50 dark:hover:bg-white/5 transition-colors group">
                                        <td className="p-4">
                                            {!session.endTime ? (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700 dark:bg-green-500/20 dark:text-green-400 border border-green-200 dark:border-green-500/20 animate-pulse">
                                                    <span className="w-1.5 h-1.5 rounded-full bg-green-500 dark:bg-green-400"></span> LIVE
                                                </span>
                                            ) : (
                                                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-600 dark:bg-gray-500/20 dark:text-gray-400 border border-gray-200 dark:border-gray-500/20">
                                                    COMPLETED
                                                </span>
                                            )}
                                        </td>
                                        <td className="p-4">
                                            <div className="font-bold text-gray-900 dark:text-white">{session.subject}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{session.class}</div>
                                        </td>
                                        <td className="p-4">
                                            <span className="text-sm text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-white/5 px-2 py-1 rounded border border-gray-200 dark:border-white/10 uppercase font-mono font-bold">
                                                {session.mode || 'WEBCAM'}
                                            </span>
                                        </td>
                                        <td className="p-4 text-sm text-gray-500 dark:text-gray-400 font-mono">
                                            {new Date(session.startTime).toLocaleString()}
                                        </td>
                                        <td className="p-4 text-right">
                                            {!session.endTime && (
                                                <Link to={`/faculty/live/${session.sessionId || session.id}`}>
                                                    <button className="px-3 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold uppercase tracking-wider shadow-lg shadow-blue-600/30 transition-all transform hover:scale-105">
                                                        Resume Feed
                                                    </button>
                                                </Link>
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>

          </motion.div>
        </div>
      </main>
    </div>
  );
}


