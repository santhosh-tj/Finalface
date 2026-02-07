import { useRef, useEffect } from "react";

export function WebcamFeed({ videoRef, onReady, className = "" }) {
  useEffect(() => {
    onReady?.();
  }, [onReady]);

  return (
    <div
      className={`relative rounded-lg overflow-hidden bg-black ${className}`}
    >
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="w-full h-full object-fill"
        style={{ transform: "scaleX(-1)" }}
      />
    </div>
  );
}
