import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        brand: {
          100: '#DBEAFE',
          500: '#3B82F6',
          600: '#2563EB',
          700: '#1D4ED8'
        },
        success: {
          100: '#D1FAE5',
          600: '#059669'
        },
        warning: {
          100: '#FEF3C7',
          500: '#F59E0B'
        },
        danger: {
          100: '#FEE2E2',
          600: '#DC2626'
        },
        info: {
          100: '#CFFAFE',
          600: '#0891B2'
        }
      },
      borderRadius: {
        sm: '0.75rem',
        md: '1rem',
        lg: '1.5rem'
      },
      boxShadow: {
        soft: '0 12px 30px -18px rgba(15, 23, 42, 0.22)',
        focus: '0 0 0 4px rgba(37, 99, 235, 0.18)'
      }
    }
  },
  plugins: []
} satisfies Config;
