/** @type {import('tailwindcss').Config} */
module.exports = {
  // NOTE: Update this to include the paths to all files that contain Nativewind classes.
  content: ["./app/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        primary: '#030014',
        secondary: '#d42f2fff',

        // If you are making an option that can change colour or smt, e.g colour slider in the UI. U need to make sure all the
        // sub-colours are alr saved in the cache. So u need to make like a extra safelist 
        // (Js chatgpt how to make the colours always available to change)
        // To restart, npx expo start --clear (resets cache)

        green: {
          100: '#5bf370ff',
          200: '#48924fff',
          300: '#09330dff',
        }
      }
    },
  },
  plugins: [],
}