import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0A',
        foreground: '#F5F5F7',
        sapphire: {
          DEFAULT: '#0F52BA',
          light: '#2E75E8',
          dark: '#083075',
          glow: 'rgba(15, 82, 186, 0.35)',
        },
        emerald: {
          DEFAULT: '#50C878',
          light: '#72DB94',
          dark: '#2A8449',
          glow: 'rgba(80, 200, 120, 0.35)',
        },
        glass: {
          surface: 'rgba(20, 20, 25, 0.65)',
          panel: 'rgba(15, 15, 20, 0.75)',
          card: 'rgba(25, 25, 35, 0.55)',
          border: 'rgba(255, 255, 255, 0.10)',
          'border-highlight': 'rgba(255, 255, 255, 0.22)',
        },
      },
      backdropBlur: {
        xs: '2px',
        glass: '16px',
        heavy: '24px',
      },
      boxShadow: {
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'sapphire-glow': '0 0 25px -3px rgba(15, 82, 186, 0.45)',
        'emerald-glow': '0 0 25px -3px rgba(80, 200, 120, 0.45)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        float: 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' },
        },
      },
    },
  },
  plugins: [],
};

export default config;
