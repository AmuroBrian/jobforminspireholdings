/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: '#F7C229',
        'primary-dark': '#d9a91c',
        secondary: '#10b981',
        dark: '#1e293b',
        light: '#f8fafc',
        gray: '#94a3b8',
        'dark-gray': '#64748b',
        'light-gray': '#e2e8f0',
      },
      animation: {
        shine: "shine 2s linear infinite",
        "spin-slow": "spin 1.5s linear infinite",
      },
      keyframes: {
        shine: {
          "0%": { transform: "translateX(-100%)" },
          "100%": { transform: "translateX(200%)" },
        },
      },
    },
  },
  plugins: [],
};