// tailwind.config.js

/** @type {import('tailwindcss').Config} */
export default {
  content: [
    // 💡 This is crucial: it tells Tailwind which files to scan for utility classes.
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
};
