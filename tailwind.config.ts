import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Swiss Style Palette (Extrema Prop Redesign)
        brand: {
          primary: {
            DEFAULT: '#000080', // Navy Blue (was Purple)
            50: '#E6E6F2',
            100: '#CDCDE6',
            200: '#9B9BCB',
            300: '#6868B1',
            400: '#343498',
            500: '#000080',
            600: '#000066',
            700: '#00004D',
            800: '#000033',
            900: '#00001A',
          },
          accent: {
            DEFAULT: '#FF4D00', // International Orange (Swiss)
            50: '#FFF0E6',
            100: '#FFE0CC',
            200: '#FFC299',
            300: '#FFA366',
            400: '#FF8533',
            500: '#FF4D00',
            600: '#CC3D00',
            700: '#992E00',
            800: '#661F00',
            900: '#330F00',
          },
        },
        // Mapping old names to new structure to prevent crash before refactor
        extrema: {
          purple: {
            DEFAULT: '#000080', // Maps to Navy
            50: '#E6E6F2',
            100: '#CDCDE6',
            200: '#9B9BCB',
            300: '#6868B1',
            400: '#343498',
            500: '#000080',
            600: '#000066',
            700: '#00004D',
            800: '#000033',
            900: '#00001A',
          },
          yellow: {
            DEFAULT: '#F2F2F2', // Swiss Fog (Off-White) - replacing Yellow
            50: '#FFFFFF',
            100: '#FAFAFA',
            200: '#F5F5F5',
            300: '#F0F0F0',
            400: '#EBEBEB',
            500: '#F2F2F2',
            600: '#DEDEDE',
            700: '#C9C9C9',
            800: '#B5B5B5',
            900: '#A1A1A1',
          },
        },
        status: {
          rascunho: '#718096',
          enviada: '#000080', // Navy
          aguardando: '#FF4D00', // Orange
          comprovante: '#000080', // Navy
          paga: '#008000', // Classic Green
          recusada: '#FF0000', // Classic Red
          expirada: '#1A1A1A', // Black
        },
      },
      borderRadius: {
        lg: '0px', // Sharp
        md: '0px', // Sharp
        sm: '0px', // Sharp
        xl: '0px', // Sharp
        '2xl': '0px', // Sharp
        '3xl': '0px', // Sharp
      },
      backgroundImage: {
        'gradient-extrema': 'none', // Removed gradients
        'gradient-extrema-reverse': 'none',
        'swiss-grid': 'linear-gradient(#E5E5E5 1px, transparent 1px), linear-gradient(90deg, #E5E5E5 1px, transparent 1px)',
      },
      boxShadow: {
        'swiss': '4px 4px 0px 0px rgba(0,0,0,1)', // Hard shadow
        'swiss-hover': '6px 6px 0px 0px rgba(0,0,0,1)', // Harder shadow
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
