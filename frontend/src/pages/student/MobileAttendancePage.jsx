import { useState, useEffect, useRef } from "react";
import { Sidebar } from "../../components/layout/Sidebar";
import { Header } from "../../components/layout/Header";
import { Card } from "../../components/common/Card";
import { Button } from "../../components/common/Button";
import { useWebcam } from "../../hooks/useWebcam";
import { useGeolocation } from "../../hooks/useGeolocation";
import { sessionsApi } from "../../api/client";
import { faceApi } from "../../api/client";
import { motion, AnimatePresence } from "framer-motion";
import { Satellite, MapPin, Wifi, CheckCircle2, AlertTriangle, Radio } from "lucide-react";

const SatelliteLoader = ({ status, error }) => {
    // status: 'searching' | 'locked' | 'error'
    return (
        <div className="relative h-32 bg-black/90 rounded-xl overflow-hidden border border-gray-800 flex items-center justify-center mb-4">
            <div className="absolute inset-0 bg-[url('/grid-pattern.svg')] opacity-20" />
            
            {status === 'searching' && (
                <div className="flex flex-col items-center text-cyan-400">
                    <motion.div 
                        animate={{ rotate: 360 }}
                        transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                        className="mb-2"
                    >
                        <Satellite size={32} />
                    </motion.div>
                    <div className="flex items-center gap-2 text-xs font-mono tracking-widest">
                        <span className="w-2 h-2 bg-cyan-400 rounded-full animate-ping" />
                        ESTABLISHING UPLINK...
                    </div>
                    {/* Fake signal waves */}
                    <div className="absolute top-4 right-4 flex gap-1 items-end h-4">
                        {[1,2,3,4].map(i => (
                            <motion.div 
                                key={i}
                                animate={{ height: [4, 16, 4] }}
                                transition={{ duration: 1, repeat: Infinity, delay: i * 0.1 }}
                                className="w-1 bg-cyan-500/50 rounded-sm"
                            />
                        ))}
                    </div>
                </div>
            )}

            {status === 'locked' && (
                <motion.div 
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className="flex flex-col items-center text-green-400"
                >
                    <MapPin size={32} className="mb-2" />
                    <div className="text-xs font-mono tracking-widest font-bold">GPS SIGNAL LOCKED</div>
                    <div className="text-[10px] opacity-60 mt-1">LAT: 12.9716° N | LNG: 77.5946° E</div>
                </motion.div>
            )}

            {status === 'error' && (
                <div className="flex flex-col items-center text-red-400">
                    <AlertTriangle size={32} className="mb-2" />
                    <div className="text-xs font-mono tracking-widest font-bold">SIGNAL LOST</div>
                    <div className="text-[10px] opacity-80 mt-1">{error}</div>
                </div>
            )}
        </div>
    );
};

export function MobileAttendancePage() {
  const videoRef = useRef(null);
  const {
    start,
    stop,
    captureBase64,
    ready,
    error: webcamError,
  } = useWebcam(videoRef);
  const {
    position,
    error: geoError,
    loading: geoLoading,
    getPosition,
  } = useGeolocation();

  const [sessions, setSessions] = useState([]);
  const [selectedSessionId, setSelectedSessionId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [step, setStep] = useState("session");

  useEffect(() => {
    sessionsApi
      .active()
      .then(({ data }) => setSessions(data.sessions || []))
      .catch(() => setSessions([]));
  }, []);

  useEffect(() => {
    if (step === "camera") {
      start();
      getPosition();
    }
    return () => stop();
  }, [step]);

  const handleMarkAttendance = async () => {
    if (!selectedSessionId) return;
    setResult(null);
    setLoading(true);
    try {
      if (!position) getPosition();
      const base64 = await captureBase64();
      if (!base64) {
        setResult({ success: false, error: "Could not capture face" });
        setLoading(false);
        return;
      }
      const payload = {
        image: base64,
        sessionId: selectedSessionId,
        autoMark: true,
      };
      if (position) payload.lat = position.lat;
      if (position) payload.lng = position.lng;
      
      const { data } = await faceApi.verifyPayload(payload);
      if (data.matched && data.attendanceMarked) {
        setResult({ success: true, name: data.user?.name });
      } else if (data.matched && data.alreadyMarked) {
        setResult({
          success: true,
          alreadyMarked: true,
          name: data.user?.name,
        });
      } else if (data.matched && data.error) {
        setResult({ success: false, error: data.error });
      } else {
        setResult({ success: false, error: "Face not recognized" });
      }
    } catch (err) {
      setResult({
        success: false,
        error: err.response?.data?.error || "Request failed",
      });
    } finally {
      setLoading(false);
    }
  };

  const mobileSessions = sessions.filter((s) => s.mode === "mobile");

  // Determine GPS Status
  let gpsStatus = 'searching';
  if (geoError) gpsStatus = 'error';
  if (position) gpsStatus = 'locked';

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-black">
      <Sidebar />
      <main className="flex-1 flex flex-col">
        <Header title="Mobile Attendance" subtitle="Camera + GPS mode" />
        <div className="p-6 max-w-lg mx-auto w-full space-y-6">
          {step === "session" && (
            <Card>
              <h3 className="font-semibold text-gray-800 mb-4 flex items-center gap-2">
                 <Wifi size={20} className="text-blue-500" /> Select Active Session
              </h3>
              {mobileSessions.length === 0 ? (
                <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-dashed">
                  <Radio size={32} className="mx-auto mb-2 opacity-50" />
                  <p>No active satellite sessions found.</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {mobileSessions.map((s) => (
                    <button
                      key={s.id}
                      type="button"
                      onClick={() => {
                        setSelectedSessionId(s.sessionId || s.id);
                        setStep("camera");
                      }}
                      className="w-full text-left px-4 py-3 rounded-xl border border-gray-200 hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 transition-all bg-white group"
                    >
                      <span className="font-bold text-gray-800 group-hover:text-blue-600">
                        {s.class}
                      </span>
                      <span className="text-sm text-gray-500 block">
                         {s.subject}
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </Card>
          )}

          {step === "camera" && (
            <>
              <Card className="overflow-hidden border-0 shadow-2xl">
                {/* GPS Status HUD */}
                <SatelliteLoader status={gpsStatus} error={geoError} />

                {/* Camera Feed */}
                <div
                  className="relative rounded-xl overflow-hidden bg-black mb-4 shadow-lg ring-1 ring-white/10"
                  style={{ aspectRatio: "4/3" }}
                >
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover opacity-90"
                    style={{ transform: "scaleX(-1)" }}
                  />
                  
                  {/* Simple Overlay */}
                  <div className="absolute inset-0 pointer-events-none border-2 border-white/10 rounded-xl" />
                  {webcamError && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black/80 text-white p-4 text-center">
                      <p className="text-red-400 font-mono text-sm">{webcamError}</p>
                    </div>
                  )}
                </div>

                <div className="space-y-3">
                    <Button
                    onClick={handleMarkAttendance}
                    disabled={loading || !position}
                    className={`w-full py-4 text-lg font-bold tracking-wider rounded-xl transition-all ${
                        loading ? 'bg-gray-600' : 'bg-gradient-to-r from-blue-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 shadow-lg shadow-blue-500/30'
                    }`}
                    >
                    {loading ? (
                        <span className="flex items-center gap-2 justify-center">
                            <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            VERIFYING...
                        </span>
                    ) : (
                        "CONFIRM ATTENDANCE"
                    )}
                    </Button>
                    
                    <Button
                    variant="secondary"
                    className="w-full"
                    onClick={() => setStep("session")}
                    >
                    ABORT MISSION
                    </Button>
                </div>
              </Card>

              {result && (
                <motion.div 
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
                    className={`p-6 rounded-2xl border backdrop-blur-xl ${
                        result.success ? "bg-green-500/10 border-green-500/30" : "bg-red-500/10 border-red-500/30"
                    }`}
                >
                  {result.success ? (
                    <div className="flex flex-col items-center text-center">
                      <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mb-2">
                        <CheckCircle2 className="text-green-500" size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-green-500 mb-1">ATTENDANCE LOGGED</h3>
                      {result.alreadyMarked && (
                        <p className="text-amber-500 text-xs font-mono mb-2">
                          [WARNING: DUPLICATE ENTRY DETECTED]
                        </p>
                      )}
                      {result.name && (
                        <p className="text-gray-400 text-sm">Valid User: {result.name}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex flex-col items-center text-center">
                       <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mb-2">
                        <AlertTriangle className="text-red-500" size={24} />
                      </div>
                      <h3 className="text-lg font-bold text-red-500 mb-1">VERIFICATION FAILED</h3>
                      <p className="text-red-400 text-sm font-mono">{result.error}</p>
                    </div>
                  )}
                </motion.div>
              )}
            </>
          )}
        </div>
      </main>
    </div>
  );
}
