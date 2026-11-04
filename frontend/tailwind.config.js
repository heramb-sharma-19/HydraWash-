/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx,ts,tsx}', './components/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: '#000000',
        foreground: '#F4F1EA',
        muted: {
          DEFAULT: '#131418',
          foreground: '#A89F91',
        },
        primary: {
          DEFAULT: '#FF7A1A',
          foreground: '#000000',
        },
        hero: {
          DEFAULT: '#000000',
          foreground: '#F4F1EA',
          accent: '#FF7A1A',
          beige: '#F4F1EA',
          muted: '#A89F91',
        },
        brand: {
          black       : '#000000',
          dark        : '#09090B',
          surface     : '#0E0F12',
          card        : '#131418',
          border      : 'rgba(244, 241, 234, 0.12)',
          orange      : '#FF7A1A',
          'orange-hover': '#EA580C',
          'orange-light': 'rgba(255, 122, 26, 0.15)',
          beige       : '#F4F1EA',
          'beige-muted': '#DCD2C4',
          'beige-dark' : '#A89F91',
          white       : '#FFFFFF',
          zinc        : '#A89F91',
        },
      },
      minHeight: {
        '50': '12.5rem',
      },
      fontFamily: {
        display: ['"Syne"', 'sans-serif'],
        body   : ['"DM Sans"', 'sans-serif'],
        mono   : ['"JetBrains Mono"', 'monospace'],
      },
      backdropBlur: {
        xs : '2px',
        '2xl': '40px',
      },
      boxShadow: {
        card   : '0 8px 30px rgba(0,0,0,0.8), inset 0 1px 0 rgba(244,241,234,0.06)',
        orange : '0 0 25px rgba(255,122,26,0.3)',
        beige  : '0 0 25px rgba(244,241,234,0.15)',
      },
    },
  },
  plugins: [],
}
