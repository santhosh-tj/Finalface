import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { WebcamFeed } from "../../components/webcam/WebcamFeed";
import { FaceOverlay } from "../../components/webcam/FaceOverlay";
import { WebcamHUD } from "../../components/webcam/WebcamHUD";
import { LiveCount } from "../../components/webcam/LiveCount";
import { useWebcam } from "../../hooks/useWebcam";
import { facultyApi, faceApi } from "../../api/client";
import { FacultyBackground } from "../../components/layout/FacultyBackground";
import { motion, AnimatePresence } from "framer-motion";
import { Power, Radio, Users, Cpu } from "lucide-react";

export function LiveAttendancePage() {
  const { sessionId } = useParams();
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const { start, stop, captureBase64, error: webcamError, ready } = useWebcam(videoRef);

  const [session, setSession] = useState(null);
  const [presentCount, setPresentCount] = useState(0);
  const [totalStudents, setTotalStudents] = useState(0);
  const [recent, setRecent] = useState([]);
  const [overlayFaces, setOverlayFaces] = useState([]);
  const [scanning, setScanning] = useState(false);
  const [ended, setEnded] = useState(false);
  const [hudStatus, setHudStatus] = useState('scanning'); // scanning, detecting, match, unknown
  const [lastMatchedUser, setLastMatchedUser] = useState(null);
  const intervalRef = useRef(null);
  const lastOverlayAtRef = useRef(0);
  const OVERLAY_HOLD_MS = 2500;

  const mapBboxToOverlay = useCallback((bbox) => {
    if (!bbox) return null;
    const video = videoRef.current;
    if (!video || !video.videoWidth || !video.videoHeight) return null;

    const rect = video.getBoundingClientRect();
    const sx = rect.width / video.videoWidth;
    const sy = rect.height / video.videoHeight;

    return {
      x: (video.videoWidth - (bbox.x + bbox.w)) * sx,
      y: bbox.y * sy,
      width: bbox.w * sx,
      height: bbox.h * sy,
    };
  }, []);

  // Load Session Logic
  const loadSession = useCallback(() => {
    facultyApi.getSession(sessionId)
      .then(({ data }) => {
        setSession(data.session);
        setPresentCount(data.session?.presentCount ?? 0);
        setTotalStudents(data.session?.totalStudents ?? 0);
      })
      .catch(() => navigate("/faculty"));
  }, [sessionId, navigate]);

  useEffect(() => { loadSession(); }, [loadSession]);

  // Scanning Logic
  const scanFrame = useCallback(async () => {
    if (!sessionId || scanning || ended) return;
    const base64 = await captureBase64();
    if (!base64) return;
    
    setScanning(true);
    try {
      const { data } = await faceApi.verifyPayload({
        image: base64, sessionId, autoMark: true,
      });

      if (data.matched && data.user) {
        const liveness = data.livenessStatus === "fake" ? "fake" : "real";
        setHudStatus(liveness === "fake" ? "unknown" : "match");
        setLastMatchedUser(data.user.name);
        const mapped = mapBboxToOverlay(data.bbox);
        if (mapped) {
          lastOverlayAtRef.current = Date.now();
          setOverlayFaces([{
            name: data.user.name,
            id: data.user.rollNo,
            liveness,
            status: liveness === "fake" ? "fake" : (data.alreadyMarked ? "already" : "marked"),
            emotion: data.emotion,
            ...mapped,
          }]);
        } else if (Date.now() - lastOverlayAtRef.current > OVERLAY_HOLD_MS) {
          setOverlayFaces([]);
        }

        if (data.attendanceMarked) {
          setPresentCount(c => c + 1);
          setRecent(r => [{ name: data.user.name, time: new Date() }, ...r].slice(0, 10));
        }

        setTimeout(() => {
             setHudStatus('scanning');
             setLastMatchedUser(null);
        }, 2000);
      } else {
        setHudStatus(data.faces_detected > 0 ? 'unknown' : 'scanning');
        const mapped = mapBboxToOverlay(data.bbox);
        if (mapped) {
          lastOverlayAtRef.current = Date.now();
          setOverlayFaces([{
            name: "",
            id: "",
            status: "unknown",
            liveness: "unknown",
            ...mapped,
          }]);
        } else if (Date.now() - lastOverlayAtRef.current > OVERLAY_HOLD_MS) {
          setOverlayFaces([]);
        }
        if(data.faces_detected > 0) {
             setTimeout(() => setHudStatus('scanning'), 1000);
        }
      }
    } catch (e) {
      console.error(e);
      setHudStatus('scanning');
      if (Date.now() - lastOverlayAtRef.current > OVERLAY_HOLD_MS) {
        setOverlayFaces([]);
      }
    } finally {
      setScanning(false);
    }
  }, [sessionId, captureBase64, scanning, ended, mapBboxToOverlay]);

  // Timers and Cleanup
  useEffect(() => {
    if (!ready || !sessionId || ended || session?.mode === "mobile") return;
    intervalRef.current = setInterval(scanFrame, 1500); // Faster scan for live feel
    return () => clearInterval(intervalRef.current);
  }, [ready, sessionId, ended, scanFrame, session?.mode]);

  useEffect(() => {
    if (session?.mode !== "mobile") start();
    return () => { stop(); if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [sessionId, session?.mode]);

  const handleEndSession = async () => {
    if (!confirm("Terminate tracking session?")) return;
    try {
      await facultyApi.endSession(sessionId);
      setEnded(true);
      stop();
      navigate("/faculty");
    } catch (err) { alert("Error ending session"); }
  };

  return (
    <div className="flex min-h-screen font-sans overflow-hidden bg-black text-white">
      <FacultyBackground />
      {/* <Sidebar />  Optional: Hide Sidebar in "Cinema Mode" or keep it collapsed */}
      
      <main className="flex-1 flex flex-col relative z-10 p-6 h-screen">
        {/* Top Floating Header */}
        <header className="flex items-center justify-between bg-black/40 backdrop-blur-xl border border-white/10 p-4 rounded-2xl mb-6">
            <div>
                <h1 className="text-xl font-bold flex items-center gap-2">
                    <Radio className="text-red-500 animate-pulse" /> 
                    LIVE TRACKING <span className="opacity-50">|</span> <span className="text-blue-400 font-mono">{session?.subject}</span>
                </h1>
                <p className="text-xs text-gray-400 font-mono pl-8">SESSION ID: {sessionId?.substring(0,8).toUpperCase()}</p>
            </div>
            <div className="flex items-center gap-4">
                <button 
                  onClick={handleEndSession}
                  className="bg-red-500/10 hover:bg-red-500/20 text-red-500 border border-red-500/50 px-6 py-2 rounded-lg font-bold flex items-center gap-2 transition-all"
                >
                    <Power size={18} /> TERMINATE
                </button>
            </div>
        </header>

        <div className="flex-1 flex gap-6 overflow-hidden">
            {/* Main Video Area */}
            <div className="flex-1 relative rounded-3xl overflow-hidden border border-white/20 shadow-2xl bg-black">
                {session?.mode === "mobile" ? (
                   <div className="absolute inset-0 flex flex-col items-center justify-center">
                        <Radio size={64} className="text-blue-500 animate-pulse mb-4" />
                        <h2 className="text-2xl font-bold">GPS Mode Active</h2>
                   </div>
                ) : (
                   <>
                        <WebcamFeed videoRef={videoRef} className="absolute inset-0 w-full h-full object-cover" />
                        <WebcamHUD status={hudStatus} activeUser={lastMatchedUser} />
                        <FaceOverlay faces={overlayFaces} />
                        
                        {/* Error/Loading States */}
                        {webcamError && <div className="absolute inset-0 bg-red-900/50 flex items-center justify-center">{webcamError}</div>}
                        {!ready && !webcamError && <div className="absolute inset-0 bg-black/80 flex items-center justify-center font-mono animate-pulse">INITIALIZING OPTICS...</div>}
                   </>
                )}
            </div>

            {/* Right Side Panel - Floating Glass */}
            <div className="w-96 flex flex-col gap-6">
                {/* Live Stats */}
                <div className="bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6">
                    <div className="flex items-center justify-between mb-2">
                        <span className="text-gray-400 text-xs font-bold uppercase tracking-widest">Attendance</span>
                        <Users size={16} className="text-blue-400" />
                    </div>
                    <div className="flex items-end gap-2">
                        <span className="text-6xl font-black text-white">{presentCount}</span>
                        <span className="text-xl text-gray-500 font-medium mb-2">/ {totalStudents}</span>
                    </div>
                    <div className="w-full h-2 bg-gray-800 rounded-full mt-4 overflow-hidden">
                        <motion.div 
                            initial={{ width: 0 }} 
                            animate={{ width: `${(presentCount/Math.max(1, totalStudents))*100}%` }}
                            className="h-full bg-blue-500 shadow-[0_0_10px_#3b82f6]"
                        />
                    </div>
                </div>

                {/* Recent Log */}
                <div className="flex-1 bg-black/40 backdrop-blur-xl border border-white/10 rounded-3xl p-6 overflow-hidden flex flex-col">
                    <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                        <Cpu size={16} /> Data Stream
                    </h3>
                    <div className="flex-1 overflow-y-auto space-y-2 pr-2">
                        <AnimatePresence>
                            {recent.map((record, i) => (
                                <motion.div
                                    key={`${record.name}-${i}`}
                                    initial={{ opacity: 0, x: 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0 }}
                                    className="p-3 rounded-xl bg-white/5 border border-white/5 flex items-center gap-3"
                                >
                                    <div className="w-8 h-8 rounded-full bg-green-500/20 text-green-400 flex items-center justify-center font-bold text-xs border border-green-500/30">
                                        {record.name.charAt(0)}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="font-bold text-sm truncate text-white">{record.name}</p>
                                        <p className="text-xs text-gray-500 font-mono">
                                            {record.time ? record.time.toLocaleTimeString() : 'Just now'}
                                        </p>
                                    </div>
                                </motion.div>
                            ))}
                            {recent.length === 0 && <p className="text-center text-gray-600 text-sm py-4">Waiting for inputs...</p>}
                        </AnimatePresence>
                    </div>
                </div>
            </div>
        </div>
      </main>
    </div>
  );
}

