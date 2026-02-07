import React, { useRef, useState, useEffect } from 'react';
import Webcam from 'react-webcam';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, UserCheck, AlertTriangle } from 'lucide-react';

const AntigravityFeed = () => {
    const webcamRef = useRef(null);
    const [isRecognized, setIsRecognized] = useState(false);
    const [scannedName, setScannedName] = useState(null);
    const [scanning, setScanning] = useState(true);

    // Simulation of recognition loop (Replace with actual API call)
    useEffect(() => {
        const interval = setInterval(async () => {
            if (webcamRef.current) {
                const imageSrc = webcamRef.current.getScreenshot();
                if (imageSrc) {
                    // Start Scan Animation
                    // In a real app, send 'imageSrc' to backend:
                    // const res = await fetch('/api/recognize', { method: 'POST', body: JSON.stringify({ image: imageSrc }) })
                    // const data = await res.json()
                    
                    // Mocking successful recognition randomly for UI demo
                    // Remove this mock logic when connecting to real backend
                    // const mockSuccess = Math.random() > 0.8; 
                    // if (mockSuccess) {
                    //    setIsRecognized(true);
                    //    setScannedName("Santhosh TJ");
                    //    setTimeout(() => { setIsRecognized(false); setScannedName(null); }, 3000);
                    // }
                }
            }
        }, 2000);
        return () => clearInterval(interval);
    }, []);

    const videoConstraints = {
        width: 1280,
        height: 720,
        facingMode: "user"
    };

    return (
        <div className="relative w-full h-full flex items-center justify-center p-4">
            <div className="relative rounded-2xl overflow-hidden border border-white/10 shadow-2xl w-full max-w-2xl aspect-video bg-black/50 backdrop-blur-sm group">
                
                {/* Webcam Component */}
                <Webcam
                    audio={false}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    videoConstraints={videoConstraints}
                    className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity duration-500"
                />

                {/* HUD Overlay */}
                <div className="absolute inset-0 pointer-events-none">
                    {/* Corner Brackets */}
                    <div className="absolute top-4 left-4 w-16 h-16 border-t-2 border-l-2 border-cyan-400/50 rounded-tl-lg" />
                    <div className="absolute top-4 right-4 w-16 h-16 border-t-2 border-r-2 border-cyan-400/50 rounded-tr-lg" />
                    <div className="absolute bottom-4 left-4 w-16 h-16 border-b-2 border-l-2 border-cyan-400/50 rounded-bl-lg" />
                    <div className="absolute bottom-4 right-4 w-16 h-16 border-b-2 border-r-2 border-cyan-400/50 rounded-br-lg" />

                    {/* Scanning Line */}
                    {scanning && !isRecognized && (
                        <motion.div
                            animate={{ top: ["10%", "90%", "10%"] }}
                            transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                            className="absolute left-0 w-full h-0.5 bg-gradient-to-r from-transparent via-cyan-500 to-transparent shadow-[0_0_15px_rgba(6,182,212,0.8)]"
                        />
                    )}

                    {/* Face Recognition Box (Result) */}
                    <AnimatePresence>
                        {isRecognized && (
                            <motion.div
                                initial={{ scale: 0.8, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1, boxShadow: "0 0 30px #06b6d4" }}
                                exit={{ scale: 0.8, opacity: 0 }}
                                className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 border-2 border-cyan-400 rounded-lg flex items-center justify-center"
                            >
                                <div className="absolute -top-10 text-cyan-400 font-bold tracking-widest text-lg animate-pulse">
                                    IDENTITY VERIFIED
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>
            </div>

            {/* Floating Toast Notification */}
            <AnimatePresence>
                {isRecognized && (
                    <motion.div
                        initial={{ y: -100, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: -100, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 20 }}
                        className="fixed top-20 left-1/2 -translate-x-1/2 z-50"
                    >
                        <div className="flex items-center gap-4 bg-black/60 backdrop-blur-xl border border-cyan-500/30 px-8 py-4 rounded-full shadow-[0_0_30px_rgba(6,182,212,0.3)]">
                            <div className="bg-cyan-500/20 p-2 rounded-full">
                                <UserCheck className="w-6 h-6 text-cyan-400" />
                            </div>
                            <div>
                                <h4 className="text-white font-bold text-lg">Welcome back, {scannedName}</h4>
                                <p className="text-cyan-400/80 text-sm">Attendance Marked Successfully</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default AntigravityFeed;
