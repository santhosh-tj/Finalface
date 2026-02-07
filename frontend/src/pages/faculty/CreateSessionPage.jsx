import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { Button } from "../../components/common/Button";
import { Input } from "../../components/common/Input";
import { facultyApi, adminApi } from "../../api/client";
import { FacultyBackground } from "../../components/layout/FacultyBackground";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowRight, ArrowLeft, Video, Smartphone, MapPin, CheckCircle, Database } from "lucide-react";



export function CreateSessionPage() {
  const [step, setStep] = useState(1);
  const [classVal, setClassVal] = useState("");
  const [subject, setSubject] = useState("");
  const [mode, setMode] = useState("webcam");
  const [gpsRadius, setGpsRadius] = useState(50);
  const [mobileEnabled, setMobileEnabled] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    adminApi.getSettings()
      .then(({ data }) => setMobileEnabled(data.mobileGpsEnabled ?? false))
      .catch(() => {});
  }, []);

  const nextStep = () => {
    if (step === 1 && (!classVal || !subject)) {
        setError("Please complete all fields");
        return;
    }
    setError("");
    setStep(s => s + 1);
  };

  const prevStep = () => setStep(s => s - 1);

  const handleSubmit = async () => {
    setError("");
    setLoading(true);
    try {
      const payload = { class: classVal, subject, mode };
      if (mode === "mobile") {
        if (!window.sessionLocation) {
          setError("Location data required for Mobile Mode");
          setLoading(false);
          return;
        }
        payload.gpsRadius = gpsRadius;
        payload.gpsLocation = window.sessionLocation;
      }
      const { data } = await facultyApi.createSession(payload);
      navigate(`/faculty/live/${data.session.sessionId}`);
    } catch (err) {
      setError(err.response?.data?.error || "Failed to initialize session");
      setLoading(false);
    }
  };

  const variants = {
    enter: { x: 100, opacity: 0 },
    center: { x: 0, opacity: 1 },
    exit: { x: -100, opacity: 0 }
  };

  return (
    <div className="flex min-h-screen font-sans relative overflow-hidden bg-gray-50 dark:bg-black text-gray-900 dark:text-white transition-colors duration-300">
      <FacultyBackground />
      <Sidebar />
      <main className="flex-1 flex flex-col relative z-10 h-screen overflow-y-auto">
        <Header 
            title="Session Initialization" 
            subtitle="Configure parameters for new attendance protocol"
            className="!bg-white/80 dark:!bg-transparent backdrop-blur-md border-b !border-gray-200 dark:!border-white/5" 
        />
        
        <div className="flex-1 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-2xl">
                {/* Progress Indicators */}
                <div className="flex justify-between mb-8 relative">
                    <div className="absolute top-1/2 left-0 right-0 h-1 bg-gray-200 dark:bg-white/10 -z-10 rounded-full"></div>
                    <div className={`absolute top-1/2 left-0 h-1 bg-blue-500 -z-10 rounded-full transition-all duration-500`} style={{ width: `${((step-1)/2)*100}%` }}></div>
                    {[1, 2, 3].map(i => (
                        <div key={i} className={`w-10 h-10 rounded-full flex items-center justify-center font-bold text-sm transition-all duration-300 ${step >= i ? 'bg-blue-600 text-white shadow-[0_0_15px_#2563eb]' : 'bg-white dark:bg-gray-800 border border-gray-200 dark:border-white/10 text-gray-400 dark:text-gray-500'}`}>
                            {step > i ? <CheckCircle size={18} /> : i}
                        </div>
                    ))}
                </div>

                <div className="bg-white/80 dark:bg-white/5 backdrop-blur-xl border border-gray-200 dark:border-white/10 rounded-3xl p-8 shadow-2xl relative overflow-hidden transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 hover:opacity-10 transition-opacity text-blue-500 dark:text-white">
                        <Database size={100} />
                    </div>

                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.div key="step1" variants={variants} initial="enter" animate="center" exit="exit" transition={{type: 'spring', stiffness: 300, damping: 30}}>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white"><Database className="text-blue-500 dark:text-blue-400" /> Course Details</h2>
                                <div className="space-y-6">
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Class Identifier</label>
                                        <input 
                                            value={classVal} onChange={e => setClassVal(e.target.value)}
                                            className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/20 rounded-xl px-4 py-3 text-lg text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm"
                                            placeholder="e.g. CS-SE-A"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-sm font-bold text-gray-500 dark:text-gray-400 uppercase tracking-widest">Subject Protocol</label>
                                        <input 
                                            value={subject} onChange={e => setSubject(e.target.value)}
                                            className="w-full bg-white dark:bg-black/40 border border-gray-200 dark:border-white/20 rounded-xl px-4 py-3 text-lg text-gray-900 dark:text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all placeholder:text-gray-400 dark:placeholder:text-gray-600 shadow-sm"
                                            placeholder="e.g. Advanced AI Systems"
                                        />
                                    </div>
                                    {error && <p className="text-red-500 dark:text-red-400 text-sm animate-pulse font-medium">{error}</p>}
                                    <div className="flex justify-end pt-4">
                                        <button onClick={nextStep} className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
                                            Next Phase <ArrowRight size={18} />
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}

                        {step === 2 && (
                            <motion.div key="step2" variants={variants} initial="enter" animate="center" exit="exit" transition={{type: 'spring', stiffness: 300, damping: 30}}>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white"><Smartphone className="text-purple-500 dark:text-purple-400" /> Input Mode</h2>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                                    <div 
                                        onClick={() => setMode('webcam')}
                                        className={`cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 ${mode === 'webcam' ? 'bg-blue-50 border-blue-500 dark:bg-blue-500/20 shadow-md' : 'bg-white dark:bg-black/20 border-gray-200 dark:border-white/10 hover:border-blue-300 dark:hover:border-white/30'}`}
                                    >
                                        <Video size={32} className={`mb-3 ${mode === 'webcam' ? 'text-blue-600 dark:text-blue-400' : 'text-gray-400 dark:text-gray-500'}`} />
                                        <h3 className="font-bold text-lg text-gray-900 dark:text-white">Webcam Scan</h3>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">High-precision optical recognition using classroom hardware.</p>
                                    </div>

                                    <div 
                                        onClick={() => mobileEnabled && setMode('mobile')}
                                        className={`cursor-pointer p-6 rounded-2xl border-2 transition-all duration-300 ${mode === 'mobile' ? 'bg-purple-50 border-purple-500 dark:bg-purple-500/20 shadow-md' : 'bg-white dark:bg-black/20 border-gray-200 dark:border-white/10'} ${!mobileEnabled ? 'opacity-50 grayscale cursor-not-allowed bg-gray-50 dark:bg-black/40' : 'hover:border-purple-300 dark:hover:border-white/30'}`}
                                    >
                                        <Smartphone size={32} className={`mb-3 ${mode === 'mobile' ? 'text-purple-600 dark:text-purple-400' : 'text-gray-400 dark:text-gray-500'}`} />
                                        <div className="flex justify-between items-start">
                                            <h3 className="font-bold text-lg text-gray-900 dark:text-white">Mobile GPS</h3>
                                            {!mobileEnabled && <span className="text-[10px] bg-red-100 dark:bg-red-500/20 text-red-600 dark:text-red-400 px-2 py-1 rounded font-bold">DISABLED</span>}
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">Students use personal devices within a geofenced zone.</p>
                                    </div>
                                </div>
                                <div className="flex justify-between pt-4">
                                    <button onClick={prevStep} className="text-gray-500 dark:text-gray-400 px-4 py-2 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 font-medium transition-colors">
                                        <ArrowLeft size={18} /> Back
                                    </button>
                                    <button onClick={nextStep} className="bg-gray-900 dark:bg-white text-white dark:text-black px-8 py-3 rounded-xl font-bold flex items-center gap-2 hover:scale-105 transition-transform shadow-lg">
                                        Confirm Mode <ArrowRight size={18} />
                                    </button>
                                </div>
                            </motion.div>
                        )}

                        {step === 3 && (
                            <motion.div key="step3" variants={variants} initial="enter" animate="center" exit="exit" transition={{type: 'spring', stiffness: 300, damping: 30}}>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2 text-gray-900 dark:text-white"><MapPin className="text-green-500 dark:text-green-400" /> Final Configuration</h2>
                                
                                <div className="space-y-6">
                                    <div className="bg-gray-50 dark:bg-white/5 p-4 rounded-xl space-y-2 border border-gray-100 dark:border-white/10">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Class:</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{classVal}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Subject:</span>
                                            <span className="font-bold text-gray-900 dark:text-white">{subject}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-gray-500 dark:text-gray-400">Mode:</span>
                                            <span className="font-bold text-blue-600 dark:text-blue-400 uppercase">{mode}</span>
                                        </div>
                                    </div>

                                    {mode === 'mobile' && (
                                        <div className="space-y-4">
                                            <div className="p-4 bg-purple-50 dark:bg-purple-500/10 border border-purple-200 dark:border-purple-500/30 rounded-xl">
                                                <h4 className="text-purple-700 dark:text-purple-300 font-bold mb-2 flex items-center gap-2"><MapPin size={16} /> GPS Geofence</h4>
                                                
                                                {!window.sessionLocation ? (
                                                    <button 
                                                        onClick={() => {
                                                            navigator.geolocation.getCurrentPosition(
                                                                (pos) => {
                                                                    window.sessionLocation = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                                                                    setLoading(false); // Force re-render trick or just let it be
                                                                },
                                                                (err) => alert(err.message)
                                                            );
                                                        }}
                                                        className="w-full py-3 bg-purple-600 hover:bg-purple-500 rounded-lg text-white text-sm font-bold shadow-lg transition-colors"
                                                    >
                                                        Acquire Satellite Lock (Set Location)
                                                    </button>
                                                ) : (
                                                    <div className="text-center text-green-600 dark:text-green-400 font-mono text-sm border border-green-200 dark:border-green-500/30 bg-green-100 dark:bg-green-500/10 p-2 rounded font-bold">
                                                        COORD_LOCK_ACQUIRED ✅
                                                    </div>
                                                )}

                                                <div className="mt-4">
                                                    <label className="text-xs text-purple-700 dark:text-purple-300 uppercase font-bold">Geofence Radius: {gpsRadius}m</label>
                                                    <input 
                                                        type="range" min="20" max="200" value={gpsRadius} onChange={e => setGpsRadius(Number(e.target.value))}
                                                        className="w-full mt-2 accent-purple-600 bg-gray-200 dark:bg-gray-700 h-2 rounded-full appearance-none"
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    {error && <p className="text-red-500 dark:text-red-400 text-sm animate-pulse font-bold">{error}</p>}
                                    
                                    <div className="flex justify-between pt-4">
                                         <button onClick={prevStep} className="text-gray-500 dark:text-gray-400 px-4 py-2 hover:text-gray-900 dark:hover:text-white flex items-center gap-2 font-medium transition-colors">
                                            <ArrowLeft size={18} /> Modify
                                        </button>
                                        <button 
                                            onClick={handleSubmit} 
                                            disabled={loading}
                                            className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-8 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-blue-500/30 hover:shadow-blue-500/50 hover:scale-105 transition-all w-full md:w-auto justify-center"
                                        >
                                            {loading ? 'Initializing...' : 'LAUNCH SESSION'}
                                        </button>
                                    </div>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}
