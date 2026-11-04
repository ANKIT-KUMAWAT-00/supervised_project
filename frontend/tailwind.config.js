/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        midnight: "#070B18",
        navy: "#0D1428",
        navyBorder: "rgba(0, 229, 255, 0.15)",
        cyan: {
          DEFAULT: "#00E5FF",
          glow: "rgba(0, 229, 255, 0.4)",
          subtle: "rgba(0, 229, 255, 0.08)",
        },
        ice: "#80F0FF",
        violet: {
          DEFAULT: "#8765FF",
          glow: "rgba(135, 101, 255, 0.35)",
        },
        softwhite: "#EAF4FF",
        subtlegrey: "#8290A8",
        available: "#10B981",
        medium: "#F59E0B",
        critical: "#EF4444",
      },
      fontFamily: {
        sans: ['"Space Grotesk"', 'Inter', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        display: ['"Space Grotesk"', 'sans-serif'],
      },
      boxShadow: {
        'cyan-glow': '0 0 25px rgba(0, 229, 255, 0.25)',
        'cyan-glow-lg': '0 0 40px rgba(0, 229, 255, 0.4)',
        'violet-glow': '0 0 25px rgba(135, 101, 255, 0.3)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        }
      }
    },
  },
  plugins: [],
}
