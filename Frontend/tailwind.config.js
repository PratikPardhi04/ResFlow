export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        background: '#0A0A0F',
        surface: '#18181A',
        accent: '#6EE7B7', // teal-mint
        accentSecondary: '#818CF8', // violet
      },
      fontFamily: {
        display: ['Syne', 'DM Sans', 'sans-serif'],
        body: ['IBM Plex Sans', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      }
    },
  },
  plugins: [],
}
