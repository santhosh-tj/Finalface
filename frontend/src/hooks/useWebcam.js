import { useState, useEffect, useRef, useCallback } from "react";

export function useWebcam(videoRef, options = {}) {
  const [stream, setStream] = useState(null);
  const [error, setError] = useState(null);
  const [ready, setReady] = useState(false);

  const start = useCallback(async () => {
    setError(null);
    try {
      const s = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: options.facingMode || "user",
          width: options.width || 640,
          height: options.height || 480,
        },
        audio: false,
      });
      setStream(s);
      if (videoRef?.current) {
        videoRef.current.srcObject = s;
        videoRef.current.onloadedmetadata = () => setReady(true);
      }
      return s;
    } catch (e) {
      setError(e.message || "Camera access failed");
      return null;
    }
  }, [videoRef, options.facingMode, options.width, options.height]);

  const stop = useCallback(() => {
    if (stream) {
      stream.getTracks().forEach((t) => t.stop());
      setStream(null);
    }
    setReady(false);
  }, [stream]);

  useEffect(() => {
    return () => {
      if (stream) stream.getTracks().forEach((t) => t.stop());
    };
  }, [stream]);

  const captureBlob = useCallback(() => {
    if (!videoRef?.current || !stream) return null;
    const canvas = document.createElement("canvas");
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;
    const ctx = canvas.getContext("2d");
    ctx.drawImage(videoRef.current, 0, 0);
    return new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.9));
  }, [videoRef, stream]);

  const captureBase64 = useCallback(async () => {
    const blob = await captureBlob();
    if (!blob) return null;
    return new Promise((resolve) => {
      const r = new FileReader();
      r.onloadend = () => resolve(r.result?.split(",")[1]);
      r.readAsDataURL(blob);
    });
  }, [captureBlob]);

  return { stream, error, ready, start, stop, captureBlob, captureBase64 };
}
