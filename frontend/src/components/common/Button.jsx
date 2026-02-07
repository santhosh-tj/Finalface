import { useState } from 'react';

export function Button({
  children,
  variant = "primary",
  type = "button",
  disabled,
  loading = false,
  className = "",
  ...props
}) {
  const [ripples, setRipples] = useState([]);

  const handleClick = (e) => {
    const button = e.currentTarget;
    const rect = button.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    const newRipple = { x, y, id: Date.now() };
    setRipples([...ripples, newRipple]);
    
    setTimeout(() => {
      setRipples(prev => prev.filter(r => r.id !== newRipple.id));
    }, 600);

    if (props.onClick && !disabled && !loading) {
      props.onClick(e);
    }
  };

  const base = `
    relative overflow-hidden
    px-6 py-2.5 rounded-xl font-medium
    transition-all duration-300
    disabled:opacity-50 disabled:cursor-not-allowed
    focus-ring
    transform active:scale-95
  `;

  const variants = {
    primary: `
      bg-gradient-to-r from-primary-600 to-primary-700
      hover:from-primary-700 hover:to-primary-800
      text-white shadow-lg hover:shadow-xl
      hover:shadow-primary-500/50
    `,
    secondary: `
      bg-gray-200 dark:bg-gray-700
      text-gray-800 dark:text-gray-200
      hover:bg-gray-300 dark:hover:bg-gray-600
      shadow-md hover:shadow-lg
    `,
    danger: `
      bg-gradient-to-r from-danger-600 to-danger-700
      hover:from-danger-700 hover:to-danger-800
      text-white shadow-lg hover:shadow-xl
      hover:shadow-danger-500/50
    `,
    success: `
      bg-gradient-to-r from-success-600 to-success-700
      hover:from-success-700 hover:to-success-800
      text-white shadow-lg hover:shadow-xl
      hover:shadow-success-500/50
    `,
    ghost: `
      bg-transparent border-2 border-primary-600 dark:border-primary-500
      text-primary-600 dark:text-primary-400
      hover:bg-primary-50 dark:hover:bg-primary-900/20
    `,
  };

  return (
    <button
      type={type}
      disabled={disabled || loading}
      className={`${base} ${variants[variant] || variants.primary} ${className}`}
      {...props}
      onClick={handleClick}
    >
      {/* Ripple effect */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          className="absolute bg-white/30 rounded-full animate-ping"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: '20px',
            height: '20px',
            transform: 'translate(-50%, -50%)',
          }}
        />
      ))}

      {/* Loading spinner */}
      {loading && (
        <svg
          className="animate-spin -ml-1 mr-3 h-5 w-5 text-white inline-block"
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
        >
          <circle
            className="opacity-25"
            cx="12"
            cy="12"
            r="10"
            stroke="currentColor"
            strokeWidth="4"
          />
          <path
            className="opacity-75"
            fill="currentColor"
            d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
          />
        </svg>
      )}

      <span className="relative z-10">{children}</span>
    </button>
  );
}

