/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: ["class"],
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    // ── Fluid type scale (320px–2560px) ──
    fontSize: {
      'xs': ['0.75rem', { lineHeight: '1rem' }],
      'sm': ['0.875rem', { lineHeight: '1.25rem' }],
      'base': ['1rem', { lineHeight: '1.5rem' }],
      'lg': ['clamp(1.05rem, 0.5vw + 0.9rem, 1.125rem)', { lineHeight: '1.75rem' }],
      'xl': ['clamp(1.15rem, 0.7vw + 0.95rem, 1.25rem)', { lineHeight: '1.75rem' }],
      '2xl': ['clamp(1.35rem, 1.2vw + 1rem, 1.5rem)', { lineHeight: '2rem' }],
      '3xl': ['clamp(1.6rem, 2vw + 1rem, 1.875rem)', { lineHeight: '2.25rem' }],
      '4xl': ['clamp(1.8rem, 3vw + 1rem, 2.25rem)', { lineHeight: '2.5rem' }],
      '5xl': ['clamp(2.2rem, 4vw + 1rem, 3rem)', { lineHeight: '1' }],
    },

    extend: {
      // ── Screens ──
      screens: {
        'xs': '475px',
      },

      // ── Glassy Engineering Console Fonts ──
      fontFamily: {
        display: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"Geist Mono"', 'ui-monospace', 'SFMono-Regular', 'monospace'],
      },

      // ── Fluid spacing ──
      spacing: {
        'fluid-xs': 'clamp(0.25rem, 0.5vw, 0.5rem)',
        'fluid-sm': 'clamp(0.5rem, 1vw, 0.75rem)',
        'fluid-md': 'clamp(0.75rem, 1.5vw, 1.25rem)',
        'fluid-lg': 'clamp(1rem, 2vw, 2rem)',
        'fluid-xl': 'clamp(1.5rem, 3vw, 3rem)',
        'fluid-2xl': 'clamp(2rem, 4vw, 4rem)',
        // Safe area for bottom nav
        'safe-bottom': 'env(safe-area-inset-bottom, 0px)',
      },

      colors: {
        // shadcn/ui base tokens
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive) / <alpha-value>)",
          foreground: "hsl(var(--destructive-foreground) / <alpha-value>)",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        sidebar: {
          DEFAULT: "hsl(var(--sidebar-background))",
          foreground: "hsl(var(--sidebar-foreground))",
          primary: "hsl(var(--sidebar-primary))",
          "primary-foreground": "hsl(var(--sidebar-primary-foreground))",
          accent: "hsl(var(--sidebar-accent))",
          "accent-foreground": "hsl(var(--sidebar-accent-foreground))",
          border: "hsl(var(--sidebar-border))",
          ring: "hsl(var(--sidebar-ring))",
        },

        // ── Glassy Console tokens ──
        console: {
          bg: '#09090b',
          surface: 'rgba(255, 255, 255, 0.05)',
        },
        glow: {
          emerald: 'rgba(52, 211, 153, 0.20)',
          blue: 'rgba(96, 165, 250, 0.20)',
          amber: 'rgba(251, 191, 36, 0.20)',
          red: 'rgba(248, 113, 113, 0.20)',
          violet: 'rgba(167, 139, 250, 0.20)',
        },
      },

      borderRadius: {
        xl: "calc(var(--radius) + 4px)",
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xs: "calc(var(--radius) - 6px)",
      },

      // ── Glassy shadows ──
      boxShadow: {
        xs: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.37)',
        'glass-hover': '0 12px 40px 0 rgba(0, 0, 0, 0.45), 0 0 0 1px rgba(255, 255, 255, 0.08)',
        'glass-rim': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.06)',
        'glow-emerald': '0 0 20px -2px rgba(52, 211, 153, 0.20)',
        'glow-blue': '0 0 20px -2px rgba(96, 165, 250, 0.20)',
        'glow-amber': '0 0 20px -2px rgba(251, 191, 36, 0.20)',
        'glow-red': '0 0 20px -2px rgba(248, 113, 113, 0.20)',
        'glow-violet': '0 0 20px -2px rgba(167, 139, 250, 0.20)',
      },

      // ── Backdrop blur tokens ──
      backdropBlur: {
        glass: '12px',
        'glass-heavy': '20px',
      },

      keyframes: {
        "accordion-down": {
          from: { height: "0" },
          to: { height: "var(--radix-accordion-content-height)" },
        },
        "accordion-up": {
          from: { height: "var(--radix-accordion-content-height)" },
          to: { height: "0" },
        },
        "caret-blink": {
          "0%,70%,100%": { opacity: "1" },
          "20%,50%": { opacity: "0" },
        },
        "pulse-glow": {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.5" },
        },
      },
      animation: {
        "accordion-down": "accordion-down 0.2s ease-out",
        "accordion-up": "accordion-up 0.2s ease-out",
        "caret-blink": "caret-blink 1.25s ease-out infinite",
        "pulse-glow": "pulse-glow 2s ease-in-out infinite",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    require("@tailwindcss/container-queries"),
  ],
}