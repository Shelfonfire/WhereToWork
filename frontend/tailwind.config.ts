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
        // Warm, laptop-friendly-cafe inspired palette
        'primary': '#F59E0B',        // Warm amber
        'primary-dark': '#D97706',   // Darker amber
        'accent': '#10B981',         // Emerald green (available/good)
        'accent-red': '#EF4444',     // Red (busy/unavailable)
        'bg-cream': '#FFF8F0',       // Warm cream background
        'bg-white': '#FFFFFF',
        'card-bg': '#FFFFFF',
        'text-primary': '#1F2937',   // Dark charcoal
        'text-secondary': '#6B7280', // Medium gray
        'text-muted': '#9CA3AF',     // Light gray
        'border': '#E5E7EB',
        'border-light': '#F3F4F6',
        'tag-bg': '#FEF3C7',        // Light amber for tags
        'tag-text': '#92400E',       // Dark amber for tag text
      },
      fontFamily: {
        heading: ['var(--font-plus-jakarta-sans)', 'sans-serif'],
        body: ['var(--font-inter)', 'sans-serif'],
      },
      boxShadow: {
        'warm': '0 2px 12px rgba(180, 120, 60, 0.08)',
        'warm-md': '0 4px 20px rgba(180, 120, 60, 0.12)',
        'warm-lg': '0 8px 30px rgba(180, 120, 60, 0.15)',
      },
      keyframes: {
        'slide-in': {
          from: { opacity: '0', transform: 'translateX(20px)' },
          to: { opacity: '1', transform: 'translateX(0)' },
        },
      },
      animation: {
        'slide-in': 'slide-in 0.25s ease-out',
      },
    },
  },
  plugins: [],
};
export default config;
