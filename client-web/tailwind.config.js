/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#2563EB',
          success: '#10B981',
          warning: '#F59E0B',
          danger: '#EF4444'
        }
      }
    }
  },
  plugins: []
};

