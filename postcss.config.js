// postcss.config.js (The definitive fix)

module.exports = {
  plugins: [
    // 💡 Use the dedicated PostCSS plugin package
    require("@tailwindcss/postcss"),
    require("autoprefixer"),
  ],
};
