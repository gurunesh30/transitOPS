/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        brand: {
          dark: '#0f172a',    // Deep slate for sidebar/headers
          primary: '#2563eb', // TransitOps blue for buttons/links
          success: '#16a34a', // Available / Completed states
          warning: '#ca8a04', // Maintenance / In Shop states
          danger: '#dc2626',  // Suspended / Cancelled states
        }
      }
    },
  },
  plugins: [],
}