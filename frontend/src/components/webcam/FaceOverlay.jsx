export function FaceOverlay({ faces }) {
  if (!faces?.length) return null;
  return (
    <div className="absolute inset-0 pointer-events-none">
      {faces.map((f, i) => {
        const isFake = f.status === "fake" || f.liveness === "fake";
        const isUnknown = f.status === "unknown";
        const isRecognizing = f.status === "recognizing";
        const color = isFake ? "#ef4444" : isUnknown ? "#f97316" : isRecognizing ? "#eab308" : "#22c55e";
        const topLabel = f.name
          ? `${f.name}-${f.liveness || (isFake ? "fake" : "real")}`
          : (isUnknown ? "Unknown" : "Scanning...");
        
        return (
          <div
            key={i}
            className="absolute flex flex-col items-center"
            style={{
              left: f.x,
              top: f.y,
              width: f.width,
              height: f.height,
              border: `3px solid ${color}`,
              borderRadius: "8px",
              boxShadow: `0 0 10px ${color}80` // Glow effect
            }}
          >
            {/* Top Label: Name & ID */}
            <div 
              className="absolute -top-12 left-1/2 -translate-x-1/2 whitespace-nowrap flex flex-col items-center"
            >
              {/* Name */}
              <span 
                className="px-2 py-0.5 rounded-t text-white text-sm font-bold"
                style={{ backgroundColor: color }}
              >
                {topLabel}
              </span>
              
              {/* ID / Roll No */}
              {f.id && !isUnknown && !isRecognizing && (
                 <span 
                  className="px-2 py-0.5 rounded-b text-white text-xs font-semibold bg-black/60"
                  style={{ minWidth: "100%", textAlign: "center" }}
                >
                  {f.id}
                </span>
              )}
            </div>

            {/* Bottom Label: Emotion & Status */}
            {(f.emotion || f.status === "marked" || f.status === "already") && (
              <div className="absolute -bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-1">
                {f.emotion && f.emotion !== "unknown" && (
                  <span className="text-[10px] font-semibold text-white bg-black/60 px-2 py-0.5 rounded-full capitalize">
                    {f.emotion}
                  </span>
                )}
                {f.status === "marked" && (
                  <span className="text-[10px] font-bold text-green-600 bg-white px-1.5 py-0.5 rounded shadow-sm">
                    MARKED
                  </span>
                )}
                {f.status === "already" && (
                  <span className="text-[10px] font-bold text-amber-600 bg-white px-1.5 py-0.5 rounded shadow-sm">
                    ALREADY MARKED
                  </span>
                )}
                {isFake && (
                  <span className="text-[10px] font-bold text-red-600 bg-white px-1.5 py-0.5 rounded shadow-sm">
                    FAKE
                  </span>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
}
