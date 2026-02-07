import React, { useRef, useState, useEffect } from 'react';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import { Scan, User, CheckCircle, AlertTriangle, Disc, Target } from 'lucide-react';
import './FaceCaptureComponent.css';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const FaceCaptureComponent = ({ onComplete, onError, numImages = 50 }) => {
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  const [sessionId, setSessionId] = useState(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [total, setTotal] = useState(numImages);
  const [message, setMessage] = useState('');
  const [faceDetected, setFaceDetected] = useState(false);
  const [bbox, setBbox] = useState(null);
  const streamRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    startCamera();
    return () => {
      stopCamera();
    };
  }, []);

  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { width: 640, height: 480 }
      });
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        streamRef.current = stream;
      }
    } catch (err) {
        console.error('Error:', err);
        setMessage('Error: Unable to access camera');
        if (onError) onError(err);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  };

  const startRegistration = async () => {
    try {
      setMessage('Initializing registration...');
      const token = localStorage.getItem('token');
      const response = await axios.post(`${API_URL}/face/register/start`, { numImages }, {
          headers: { Authorization: `Bearer ${token}` }
      });

      if (response.data.success) {
        const newSessionId = response.data.sessionId;
        setSessionId(newSessionId);
        setTotal(response.data.numImages);
        setIsCapturing(true);
        setMessage('ALIGN FACE FOR SCAN');
        startCaptureLoop(newSessionId);
      }
    } catch (error) {
      console.error('Error starting registration:', error);
      setMessage('Error: Failed to start registration');
      if (onError) onError(error);
    }
  };

  const startCaptureLoop = (activeSessionId) => {
    intervalRef.current = setInterval(() => {
      captureFrame(activeSessionId);
    }, 300);
  };

  const captureFrame = async (activeSessionId) => {
    const currentSessionId = activeSessionId || sessionId;
    if (!currentSessionId || !videoRef.current || !canvasRef.current) return;

    const video = videoRef.current;
    const canvas = canvasRef.current;
    const context = canvas.getContext('2d');

    // Set canvas size (hidden)
    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    canvas.toBlob(async (blob) => {
      if (!blob) return;

      try {
        const formData = new FormData();
        formData.append('image', blob, 'frame.jpg');
        formData.append('sessionId', currentSessionId);
        
        const response = await axios.post(`${API_URL}/face/register/frame`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });

        if (response.data.success) {
          setProgress(response.data.progress);
          setTotal(response.data.total);
          setFaceDetected(true);
          setBbox(response.data.bbox);
          setMessage(`SCANNING: ${Math.round((response.data.progress / response.data.total) * 100)}% COMPLETE`);

          if (response.data.progress >= response.data.total) {
            completeRegistration(currentSessionId);
          }
        } else {
          setFaceDetected(false);
          setBbox(null);
        }
      } catch (error) {
        console.error('Error capturing frame:', error);
      }
    }, 'image/jpeg', 0.95);
  };

  const completeRegistration = async (activeSessionId) => {
    const finalSessionId = activeSessionId || sessionId;
    if (!finalSessionId) return;
    
    try {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      setIsCapturing(false);
      setMessage('COMPILING BIOMETRIC DATA...');

      const response = await axios.post(`${API_URL}/face/register/complete`, { sessionId: finalSessionId });

      if (response.data.success) {
        setMessage('REGISTRATION SUCCESSFUL');
        stopCamera();
        if (onComplete) onComplete(response.data);
      } else {
        setMessage(`Error: ${response.data.error}`);
        if (onError) onError(new Error(response.data.error));
      }
    } catch (error) {
      console.error('Error completing registration:', error);
      setMessage('Error: Failed to complete registration');
      if (onError) onError(error);
    }
  };

  const cancelRegistration = () => {
    stopCamera();
    setIsCapturing(false);
    setSessionId(null);
    setProgress(0);
    setMessage('REGISTRATION ABORTED');
  };

  // --- Render ---
  return (
    <div className="relative w-full h-full bg-black overflow-hidden group">
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted
          className="w-full h-full object-cover opacity-80"
          style={{ transform: 'scaleX(-1)' }}
        />
        {/* Hidden Canvas for processing */}
        <canvas ref={canvasRef} className="hidden" />

        {/* --- IRON MAN HUD --- */}
        <div className="absolute inset-0 pointer-events-none z-10 p-6">
            
            {/* 1. Grid Overlay */}
            <div className="absolute inset-0 bg-[url('https://res.cloudinary.com/djaq2899n/image/upload/v1642286701/grid_overlay_transparent_j812n0.png')] opacity-10 bg-repeat bg-[length:50px_50px]" />
            <div className={`absolute inset-0 border-2 border-cyan-500/20 rounded-2xl transition-colors duration-500 ${isCapturing ? 'border-cyan-500/50' : ''}`} />

            {/* 2. Corner Brackets */}
            <>
                <div className="absolute top-4 left-4 w-12 h-12 border-t-4 border-l-4 border-cyan-400 rounded-tl-lg" />
                <div className="absolute top-4 right-4 w-12 h-12 border-t-4 border-r-4 border-cyan-400 rounded-tr-lg" />
                <div className="absolute bottom-4 left-4 w-12 h-12 border-b-4 border-l-4 border-cyan-400 rounded-bl-lg" />
                <div className="absolute bottom-4 right-4 w-12 h-12 border-b-4 border-r-4 border-cyan-400 rounded-br-lg" />
            </>

            {/* 3. Center Scanner */}
            {!isCapturing && !sessionId && (
                <div className="absolute inset-0 flex items-center justify-center flex-col gap-4">
                    <div className="relative">
                        <motion.div 
                            animate={{ rotate: 360 }} transition={{ duration: 10, repeat: Infinity, ease: 'linear' }}
                            className="w-48 h-48 border border-cyan-500/30 rounded-full border-dashed"
                        />
                        <motion.div 
                            animate={{ rotate: -360 }} transition={{ duration: 15, repeat: Infinity, ease: 'linear' }}
                            className="absolute inset-2 border border-cyan-400/20 rounded-full"
                        />
                        <div className="absolute inset-0 flex items-center justify-center text-cyan-400">
                             <Scan size={48} strokeWidth={1} />
                        </div>
                    </div>
                </div>
            )}

            {/* 4. Active Scanning UI */}
            <AnimatePresence>
                {isCapturing && (
                    <>
                        {/* Scanning Bar */}
                        <motion.div 
                            initial={{ top: '10%' }}
                            animate={{ top: '90%' }}
                            transition={{ duration: 2, repeat: Infinity, repeatType: "reverse", ease: "easeInOut" }}
                            className="absolute left-10 right-10 h-0.5 bg-cyan-400 shadow-[0_0_20px_rgba(34,211,238,0.8)] opacity-60"
                        />
                        
                        {/* Progress Circle (Jarvis Style) */}
                        <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
                             <div className="text-cyan-400 font-mono text-xs tracking-[0.2em] font-bold">{message}</div>
                             <div className="w-64 h-2 bg-gray-900 rounded-full overflow-hidden border border-cyan-500/30">
                                <motion.div 
                                    initial={{ width: 0 }}
                                    animate={{ width: `${(progress / total) * 100}%` }}
                                    className="h-full bg-cyan-400 shadow-[0_0_10px_rgba(34,211,238,0.8)]"
                                />
                             </div>
                        </div>

                        {/* Face Ring */}
                        {faceDetected && bbox && (
                             /* We could overlay a box here using bbox logic, 
                                but scaling coordinates from video -> CSS is tricky without perfect aspect ratio sync.
                                For now, we use a center-screen indicator that pulses when face is detected. 
                             */
                            <div className="absolute inset-0 flex items-center justify-center">
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-64 h-80 border-2 border-green-400/50 rounded-3xl"
                                />
                                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 -mt-44 text-green-400 text-[10px] font-bold tracking-widest bg-black/50 px-2 py-1 rounded">
                                    TARGET LOCKED
                                </div>
                            </div>
                        )}
                    </>
                )}
            </AnimatePresence>

            <div className="absolute top-8 left-8 flex flex-col gap-1">
                 <div className="text-[10px] text-cyan-500/60 font-mono">SYS.V.4.2</div>
                 <div className="text-[10px] text-cyan-500/60 font-mono">CAM.FEED.ACT</div>
            </div>
        </div>

        {/* --- Controls --- */}
        <div className="absolute bottom-0 inset-x-0 p-6 z-20 flex justify-center pointer-events-auto bg-gradient-to-t from-black/90 to-transparent pt-20">
             {!isCapturing && !sessionId && (
                <button 
                  onClick={startRegistration}
                  className="px-8 py-3 bg-cyan-500 hover:bg-cyan-400 text-black font-bold rounded-xl shadow-[0_0_20px_rgba(6,182,212,0.4)] transition-all transform hover:scale-105 flex items-center gap-2"
                >
                    <Target size={20} /> INITIATE SCAN
                </button>
             )}
             
             {isCapturing && (
                 <button 
                   onClick={cancelRegistration}
                   className="px-6 py-2 border border-red-500/50 text-red-500 hover:bg-red-500/10 rounded-lg text-sm font-bold tracking-wider"
                 >
                     ABORT SEQUENCE
                 </button>
             )}
        </div>
    </div>
  );
};

export default FaceCaptureComponent;
