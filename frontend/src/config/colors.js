// Cyber-Punk Color Scheme for Face Attendance System

export const colors = {
  // Primary Colors
  cyber: {
    50: '#E0F7FF',
    100: '#B3ECFF',
    200: '#80E0FF',
    300: '#4DD4FF',
    400: '#26CBFF',
    500: '#00D9FF', // Main Cyber Blue
    600: '#00B8DB',
    700: '#0097B7',
    800: '#007693',
    900: '#005570',
  },
  
  electric: {
    50: '#F5E6FF',
    100: '#E6B3FF',
    200: '#D680FF',
    300: '#C64DFF',
    400: '#BB26FF',
    500: '#B026FF', // Electric Purple
    600: '#9620DB',
    700: '#7C1AB7',
    800: '#621493',
    900: '#480E70',
  },
  
  neon: {
    50: '#FFE6F0',
    100: '#FFB3D4',
    200: '#FF80B8',
    300: '#FF4D9C',
    400: '#FF2685',
    500: '#FF006E', // Neon Pink
    600: '#DB005E',
    700: '#B7004E',
    800: '#93003E',
    900: '#70002E',
  },
  
  // Neutral Colors
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
    900: '#0A0E27', // Deep Space (dark bg)
  },
  
  // Functional Colors
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
};

// Theme-aware color getter
export const getThemeColor = (colorPath, theme = 'dark') => {
  const [family, shade] = colorPath.split('.');
  return colors[family]?.[shade] || colorPath;
};

// Gradient presets
export const gradients = {
  hero: 'linear-gradient(135deg, #00D9FF 0%, #B026FF 50%, #FF006E 100%)',
  card: 'linear-gradient(135deg, #3F458B 0%, #0A0E27 100%)',
  button: 'linear-gradient(90deg, #00D9FF 0%, #B026FF 100%)',
  glow: 'radial-gradient(circle, rgba(0,217,255,0.3) 0%, transparent 70%)',
};

export default colors;
