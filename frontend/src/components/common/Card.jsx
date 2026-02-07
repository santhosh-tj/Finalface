export function Card({ children, className = "", hover = true, glow = false }) {
  return (
    <div
      className={`
        glass-strong rounded-2xl shadow-lg p-6
        ${hover ? 'hover-lift hover:shadow-xl' : ''}
        ${glow ? 'hover:shadow-glow' : ''}
        transition-all duration-300
        animate-fadeIn
        ${className}
      `}
    >
      {children}
    </div>
  );
}

