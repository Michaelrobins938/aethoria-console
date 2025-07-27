import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'console-dark': '#0a0a0a',
        'console-darker': '#050505',
        'console-accent': '#00ff41',
        'console-accent-dark': '#00cc6a',
        'console-text': '#e0e0e0',
        'console-text-dim': '#888888',
        'console-border': '#333333',
        'console-glow': '#00ff88',
        'console-glow-dark': '#00cc6a',
      },
      fontFamily: {
        'gaming': ['Orbitron', 'Courier New', 'monospace'],
        'console': ['Share Tech Mono', 'Courier New', 'monospace'],
        'display': ['Rajdhani', 'sans-serif'],
      },
      animation: {
        'text-glow': 'text-glow 2s ease-in-out infinite alternate',
        'console-glow': 'console-glow 1.5s ease-in-out infinite alternate',
        'scan-line': 'scan-line 2s linear infinite',
        'fade-in': 'fade-in 0.5s ease-out',
        'slide-up': 'slide-up 0.5s ease-out',
        'pulse-glow': 'pulse-glow 2s ease-in-out infinite',
        'matrix-rain': 'matrix-rain 3s linear infinite',
        'glitch': 'glitch 0.3s ease-in-out infinite',
        'holographic': 'holographic 3s ease-in-out infinite',
        'float': 'float 6s ease-in-out infinite',
        'gradient-shift': 'gradient-shift 3s ease-in-out infinite',
      },
      keyframes: {
        'text-glow': {
          '0%': { textShadow: '0 0 5px #00ff41, 0 0 10px #00ff41, 0 0 15px #00ff41' },
          '100%': { textShadow: '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41' },
        },
        'console-glow': {
          '0%': { boxShadow: '0 0 5px #00ff41, 0 0 10px #00ff41' },
          '100%': { boxShadow: '0 0 10px #00ff41, 0 0 20px #00ff41, 0 0 30px #00ff41' },
        },
        'scan-line': {
          '0%': { transform: 'translateY(-100%)' },
          '100%': { transform: 'translateY(100vh)' },
        },
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { transform: 'translateY(20px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        'pulse-glow': {
          '0%, 100%': { boxShadow: '0 0 20px rgba(0, 255, 136, 0.3)' },
          '50%': { boxShadow: '0 0 40px rgba(0, 255, 136, 0.6)' },
        },
        'matrix-rain': {
          '0%': { transform: 'translateY(-100%)', opacity: '0' },
          '10%': { opacity: '1' },
          '90%': { opacity: '1' },
          '100%': { transform: 'translateY(100vh)', opacity: '0' },
        },
        'glitch': {
          '0%, 100%': { transform: 'translate(0)' },
          '20%': { transform: 'translate(-2px, 2px)' },
          '40%': { transform: 'translate(-2px, -2px)' },
          '60%': { transform: 'translate(2px, 2px)' },
          '80%': { transform: 'translate(2px, -2px)' },
        },
        'holographic': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'float': {
          '0%, 100%': { transform: 'translateY(0px) rotate(0deg)', opacity: '1' },
          '50%': { transform: 'translateY(-20px) rotate(180deg)', opacity: '0.5' },
        },
        'gradient-shift': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
      },
      backgroundImage: {
        'console-gradient': 'linear-gradient(135deg, #0a0a0a 0%, #1a1a1a 50%, #0a0a0a 100%)',
        'accent-gradient': 'linear-gradient(135deg, #00ff41 0%, #00cc6a 50%, #00ff41 100%)',
        'glow-gradient': 'linear-gradient(45deg, #00ff88, #00cc6a, #00ff88)',
        'holographic': 'linear-gradient(45deg, rgba(0, 255, 136, 0.1) 0%, rgba(0, 204, 102, 0.1) 25%, rgba(0, 255, 136, 0.1) 50%, rgba(0, 204, 102, 0.1) 75%, rgba(0, 255, 136, 0.1) 100%)',
      },
      boxShadow: {
        'console': '0 0 20px rgba(0, 255, 136, 0.3)',
        'console-hover': '0 0 40px rgba(0, 255, 136, 0.6)',
        'console-glow': '0 0 30px rgba(0, 255, 136, 0.4)',
        'console-inner': 'inset 0 0 20px rgba(0, 255, 136, 0.1)',
      },
      backdropBlur: {
        'console': '10px',
      },
    },
  },
  plugins: [],
}

export default config 