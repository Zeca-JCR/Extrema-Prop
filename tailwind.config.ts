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
        // Cores da Extrema
        extrema: {
          purple: {
            DEFAULT: '#8B4FD3',
            50: '#F3ECFC',
            100: '#E7D9F9',
            200: '#CFB3F3',
            300: '#B78CED',
            400: '#9F66E7',
            500: '#8B4FD3',
            600: '#7640B8',
            700: '#5F33A0',
            800: '#4A2780',
            900: '#351B60',
          },
          yellow: {
            DEFAULT: '#FFD93D',
            50: '#FFFAEB',
            100: '#FFF5D6',
            200: '#FFEEAE',
            300: '#FFE685',
            400: '#FFDF5C',
            500: '#FFD93D',
            600: '#F7C428',
            700: '#D9A81F',
            800: '#B08818',
            900: '#876812',
          },
        },
        accent: {
          DEFAULT: '#6C63FF',
          50: '#F0EEFF',
          100: '#E0DDFF',
          200: '#C2BBFF',
          300: '#A398FF',
          400: '#8576FF',
          500: '#6C63FF',
          600: '#5649E6',
          700: '#4333C7',
          800: '#3226A3',
          900: '#231A7A',
        },
        status: {
          rascunho: '#718096',
          enviada: '#4299e1',
          aguardando: '#ed8936',
          comprovante: '#9f7aea',
          paga: '#48bb78',
          recusada: '#f56565',
          expirada: '#4a5568',
        },
      },
      backgroundImage: {
        'gradient-extrema': 'linear-gradient(135deg, #8B4FD3 0%, #6C63FF 100%)',
        'gradient-extrema-reverse': 'linear-gradient(135deg, #6C63FF 0%, #8B4FD3 100%)',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
