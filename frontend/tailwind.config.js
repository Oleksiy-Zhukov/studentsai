/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Japanese-inspired color palette
        paper: {
          50: 'oklch(0.99 0.005 60)',
          100: 'oklch(0.98 0.01 60)',
          200: 'oklch(0.96 0.015 60)',
          300: 'oklch(0.94 0.02 60)',
          400: 'oklch(0.92 0.025 60)',
        },
        ink: {
          50: 'oklch(0.95 0.01 240)',
          100: 'oklch(0.9 0.015 240)',
          200: 'oklch(0.8 0.02 240)',
          300: 'oklch(0.7 0.025 240)',
          400: 'oklch(0.6 0.03 240)',
          500: 'oklch(0.5 0.035 240)',
          600: 'oklch(0.4 0.04 240)',
          700: 'oklch(0.3 0.045 240)',
          800: 'oklch(0.2 0.05 240)',
          900: 'oklch(0.1 0.055 240)',
        },
        accent: {
          red: {
            50: 'oklch(0.98 0.02 27)',
            100: 'oklch(0.95 0.03 27)',
            500: 'oklch(0.6 0.15 27)',
            600: 'oklch(0.5 0.18 27)',
          },
          green: {
            50: 'oklch(0.95 0.02 140)',
            100: 'oklch(0.9 0.03 140)',
            500: 'oklch(0.6 0.15 140)',
            600: 'oklch(0.5 0.18 140)',
          },
          blue: {
            50: 'oklch(0.95 0.02 240)',
            100: 'oklch(0.9 0.03 240)',
            500: 'oklch(0.6 0.15 240)',
            600: 'oklch(0.5 0.18 240)',
          },
          purple: {
            50: 'oklch(0.98 0.02 280)',
            100: 'oklch(0.95 0.03 280)',
            500: 'oklch(0.6 0.15 280)',
            600: 'oklch(0.5 0.18 280)',
          },
          yellow: {
            50: 'oklch(0.98 0.02 60)',
            100: 'oklch(0.95 0.03 60)',
            500: 'oklch(0.7 0.15 60)',
            600: 'oklch(0.6 0.18 60)',
          },
          cyan: {
            50: 'oklch(0.98 0.02 180)',
            100: 'oklch(0.95 0.03 180)',
            500: 'oklch(0.6 0.15 180)',
            600: 'oklch(0.5 0.18 180)',
          },
        },
        // Legacy shadcn colors (for compatibility)
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        chart: {
          "1": "hsl(var(--chart-1))",
          "2": "hsl(var(--chart-2))",
          "3": "hsl(var(--chart-3))",
          "4": "hsl(var(--chart-4))",
          "5": "hsl(var(--chart-5))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },
      },
      fontFamily: {
        // Japanese-inspired font stack
        sans: ['Inter', 'Noto Sans JP', 'Hiragino Sans', 'Yu Gothic', 'system-ui', 'sans-serif'],
        mono: ['Roboto Mono', 'Noto Sans Mono CJK JP', 'monospace'],
        serif: ['Noto Serif JP', 'Yu Mincho', 'serif'],
        display: ['Inter', 'Noto Sans JP', 'system-ui', 'sans-serif'],
      },
      spacing: {
        // Japanese-inspired spacing
        '1/2': '0.125rem', // 2px - minimal spacing
        '3/4': '0.375rem', // 6px - subtle spacing
        '5/4': '1.25rem',  // 20px - comfortable spacing
        '3/2': '1.5rem',   // 24px - breathing room
      },
      borderRadius: {
        // Japanese-inspired border radius
        '1/2': '0.0625rem', // 1px - minimal rounding
        '3/4': '0.1875rem', // 3px - subtle rounding
        '5/4': '0.625rem',  // 10px - comfortable rounding
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      boxShadow: {
        // Japanese paper-like shadows
        'paper': '0 1px 3px 0 oklch(0 0 0 / 0.02), 0 1px 2px 0 oklch(0 0 0 / 0.01)',
        'paper-elevated': '0 2px 4px 0 oklch(0 0 0 / 0.04), 0 1px 2px 0 oklch(0 0 0 / 0.02)',
      },
      animation: {
        // Japanese-inspired animations
        'gentle-fade': 'gentleFade 0.3s ease-in-out',
        'smooth-slide': 'smoothSlide 0.3s ease-out',
        'paper-lift': 'paperLift 0.25s ease-out',
      },
      keyframes: {
        gentleFade: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        smoothSlide: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        paperLift: {
          '0%': { opacity: '0', transform: 'translateY(10px) scale(0.98)' },
          '100%': { opacity: '1', transform: 'translateY(0) scale(1)' },
        },
      },
    },
  },
  plugins: [],
} 