/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        display: ["Poppins", "sans-serif"],
        mono: ["Fira Code", "monospace"],
      },
      colors: {
        // Cyber Blue
        cyber: {
          50: '#E0F7FF',
          100: '#B3ECFF',
          200: '#80E0FF',
          300: '#4DD4FF',
          400: '#26CBFF',
          500: '#00D9FF',
          600: '#00B8DB',
          700: '#0097B7',
          800: '#007693',
          900: '#005570',
        },
        // Electric Purple
        electric: {
          50: '#F5E6FF',
          100: '#E6B3FF',
          200: '#D680FF',
          300: '#C64DFF',
          400: '#BB26FF',
          500: '#B026FF',
          600: '#9620DB',
          700: '#7C1AB7',
          800: '#621493',
          900: '#480E70',
        },
        // Neon Pink
        neon: {
          50: '#FFE6F0',
          100: '#FFB3D4',
          200: '#FF80B8',
          300: '#FF4D9C',
          400: '#FF2685',
          500: '#FF006E',
          600: '#DB005E',
          700: '#B7004E',
          800: '#93003E',
          900: '#70002E',
        },
        // Deep Space
        space: {
          50: '#E8E9F0',
          100: '#C5C7DB',
          200: '#9FA2C4',
          300: '#797DAD',
          400: '#5C619C',
          500: '#3F458B',
          600: '#393E83',
          700: '#313578',
          800: '#292D6E',
          900: '#0A0E27',
        },
        // Keep legacy colors for compatibility
        primary: {
          50: '#E0F7FF',
          100: '#B3ECFF',
          200: '#80E0FF',
          300: '#4DD4FF',
          400: '#26CBFF',
          500: '#00D9FF',
          600: '#00B8DB',
          700: '#0097B7',
          800: '#007693',
          900: '#005570',
        },
        accent: {
          50: '#F5E6FF',
          100: '#E6B3FF',
          200: '#D680FF',
          300: '#C64DFF',
          400: '#BB26FF',
          500: '#B026FF',
          600: '#9620DB',
          700: '#7C1AB7',
          800: '#621493',
          900: '#480E70',
        },
        success: {
          500: '#00FF88',
          600: '#00DB74',
        },
        warning: {
          500: '#FFB800',
          600: '#DB9E00',
        },
        danger: {
          500: '#FF3366',
          600: '#DB2B56',
        },
      },
      animation: {
        'fadeIn': 'fadeIn 0.5s ease-in-out',
        'slideUp': 'slideUp 0.4s ease-out',
        'slideDown': 'slideDown 0.4s ease-out',
        'slideInRight': 'slideInRight 0.3s ease-out',
        'slideInLeft': 'slideInLeft 0.3s ease-out',
        'scaleIn': 'scaleIn 0.3s ease-out',
        'pulse-slow': 'pulse 3s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'glow': 'glow 2s ease-in-out infinite',
        'shimmer': 'shimmer 2s linear infinite',
        'bounce-slow': 'bounce 2s infinite',
        'spin-slow': 'spin 3s linear infinite',
        'float': 'float 3s ease-in-out infinite',
        'tilt': 'tilt 10s infinite linear',
        'gradient': 'gradient 15s ease infinite',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          '0%': { transform: 'translateY(-20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        slideInRight: {
          '0%': { transform: 'translateX(100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        slideInLeft: {
          '0%': { transform: 'translateX(-100%)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.9)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 217, 255, 0.5)' },
          '50%': { boxShadow: '0 0 40px rgba(176, 38, 255, 0.8)' },
        },
        shimmer: {
          '0%': { backgroundPosition: '-1000px 0' },
          '100%': { backgroundPosition: '1000px 0' },
        },
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-20px)' },
        },
        tilt: {
          '0%, 50%, 100%': { transform: 'rotate(0deg)' },
          '25%': { transform: 'rotate(1deg)' },
          '75%': { transform: 'rotate(-1deg)' },
        },
        gradient: {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backdropBlur: {
        xs: '2px',
      },
      boxShadow: {
        'glow-sm': '0 0 10px rgba(0, 217, 255, 0.3)',
        'glow': '0 0 20px rgba(0, 217, 255, 0.5)',
        'glow-lg': '0 0 30px rgba(0, 217, 255, 0.6)',
        'glow-electric': '0 0 30px rgba(176, 38, 255, 0.6)',
        'glow-neon': '0 0 30px rgba(255, 0, 110, 0.6)',
        'inner-glow': 'inset 0 0 20px rgba(0, 217, 255, 0.2)',
        '3d': '0 10px 40px rgba(0, 0, 0, 0.3), 0 2px 8px rgba(0, 0, 0, 0.2)',
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
        'gradient-conic': 'conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))',
        'shimmer': 'linear-gradient(90deg, transparent, rgba(255,255,255,0.1), transparent)',
        'cyber-gradient': 'linear-gradient(135deg, #00D9FF 0%, #B026FF 50%, #FF006E 100%)',
        'space-gradient': 'linear-gradient(135deg, #3F458B 0%, #0A0E27 100%)',
      },
      perspective: {
        '1000': '1000px',
        '2000': '2000px',
      },
      transformStyle: {
        '3d': 'preserve-3d',
      },
    },
  },
  plugins: [],
};
