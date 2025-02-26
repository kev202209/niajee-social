import type { Config } from "tailwindcss";

export default {
  darkMode: 'class',
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",
      },
      animation: {
        'border': 'border 4s linear infinite',
        'gradient': 'gradient 8s linear infinite',
      },
      keyframes: {
          'border': {
              to: { '--border-angle': '360deg' },
          },
          'gradient': {
            to: { 'background-position': '200% center' },
        }
      } 
    },
  },
  plugins: [],
} satisfies Config;
