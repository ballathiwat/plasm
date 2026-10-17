// frontend/tailwind.config.ts
import type { Config } from 'tailwindcss'

export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Background & Surface
        bg: '#f0f4f8',
        surface: {
          DEFAULT: '#ffffff',
          alt: '#f7f9fc',
        },
        border: '#d8dee6',

        // Primary (Blue — Plasm Design System)
        primary: {
          DEFAULT: '#2563eb',
          hover: '#1d4ed8',
          light: '#dbeafe',
        },

        // Text
        text: {
          DEFAULT: '#1a2332',
          muted: '#5a6a7e',
        },

        // Danger
        danger: {
          DEFAULT: '#dc2626',
          light: '#fef2f2',
          border: '#fecaca',
        },

        // Warning
        warning: {
          DEFAULT: '#f59e0b',
          light: '#fffbeb',
          border: '#fde68a',
        },

        // Success
        success: {
          DEFAULT: '#16a34a',
          light: '#f0fdf4',
          border: '#bbf7d0',
        },

        // Blood types
        blood: {
          a: '#e74c3c',
          b: '#3498db',
          o: '#2ecc71',
          ab: '#9b59b6',
        },
      },

      fontFamily: {
        sans: ['"Noto Sans Thai Variable"', '"Segoe UI"', 'system-ui', '-apple-system', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'ui-monospace', 'monospace'],
      },

      fontSize: {
        // Display
        'display': ['36px', { lineHeight: '1.1', fontWeight: '700' }],

        // Heading
        'heading': ['22px', { lineHeight: '28px', fontWeight: '700' }],

        // Body
        'body': ['14px', { lineHeight: '20px', fontWeight: '400' }],

        // Label
        'label': ['13px', { lineHeight: '18px', fontWeight: '500' }],

        // Caption
        'caption': ['12px', { lineHeight: '16px', fontWeight: '600' }],
      },

      spacing: {
        1: '4px',
        2: '6px',
        3: '8px',
        4: '12px',
        5: '16px',
        6: '20px',
        7: '24px',
      },

      borderRadius: {
        sm: '6px',
        md: '8px',
        lg: '10px',
        full: '99px',
      },

      boxShadow: {
        sm: '0 1px 3px rgba(0,0,0,.08)',
        lg: '0 4px 16px rgba(0,0,0,.1)',
      },
    },
  },
  plugins: [],
} satisfies Config