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
        navy: {
          DEFAULT: '#0e1a2b',
          light: '#1a2d47',
        },
        cream: {
          DEFAULT: '#f7f4ee',
          dim: '#ede8df',
          muted: '#9a9085',
        },
        sand: {
          DEFAULT: '#c9b28f',
        },
        slate: {
          brand: '#4A5563',
        },
      },
      fontFamily: {
        display: ['var(--font-display)', 'Georgia', 'serif'],
        body: ['var(--font-body)', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
