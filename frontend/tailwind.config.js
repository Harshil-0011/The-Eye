/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg: {
          dark: "#0A0E14",
          surface: "#121822",
          card: "rgba(18, 24, 34, 0.7)",
        },
        sky: {
          accent: "#38BDF8",
          hover: "#4FC3F7",
        },
        text: {
          main: "#FFFFFF",
          muted: "#8B98AB",
        }
      },
      fontFamily: {
        grotesk: ['Space Grotesk', 'sans-serif'],
        inter: ['Inter', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      backdropBlur: {
        glass: '20px',
      }
    },
  },
  plugins: [],
}
