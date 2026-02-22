// tailwind.config.ts - Enhanced for Staff Portal Dark Mode
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./features/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: "var(--background)",
        foreground: "var(--foreground)",

        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
          brand: {
            DEFAULT: "rgb(var(--primary-brand-raw))",
            light: "rgb(var(--primary-brand-light-raw))",
            dark: "rgb(var(--primary-brand-dark-raw))",
          },
        },

        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },

        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
          nature: "rgb(var(--accent-nature-raw))",
        },

        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },

        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },

        popover: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },

        sidebar: {
          DEFAULT: "var(--sidebar)",
          foreground: "var(--sidebar-foreground)",
          border: "var(--sidebar-border)",
          accent: "var(--sidebar-accent)",
        },

        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },

        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",

      },

      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
        xl: "0.75rem",
        "2xl": "1rem",
        "3xl": "1.5rem",
      },

      fontFamily: {
        sans: [
          "var(--font-sans)",
          "ui-sans-serif",
          "system-ui",
          "-apple-system",
          "BlinkMacSystemFont",
          "Segoe UI",
          "Roboto",
          "sans-serif",
        ],
        heading: ["var(--font-heading)", "sans-serif"],
      },

      keyframes: {
        fadeIn: {
          from: { opacity: "0", transform: "translateY(20px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInFromLeft: {
          from: { opacity: "0", transform: "translateX(-30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideInFromRight: {
          from: { opacity: "0", transform: "translateX(30px)" },
          to: { opacity: "1", transform: "translateX(0)" },
        },
        slideInFromTop: {
          from: { opacity: "0", transform: "translateY(-10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        slideInFromBottom: {
          from: { opacity: "0", transform: "translateY(10px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        zoomIn: {
          from: { opacity: "0", transform: "scale(0.95)" },
          to: { opacity: "1", transform: "scale(1)" },
        },
        shimmer: {
          from: { backgroundPosition: "200% 0" },
          to: { backgroundPosition: "-200% 0" },
        },
        pulse: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0.7" },
        },
      },

      animation: {
        "fade-in": "fadeIn 0.6s ease-out forwards",
        "slide-in-left": "slideInFromLeft 0.5s ease-out forwards",
        "slide-in-right": "slideInFromRight 0.5s ease-out forwards",
        "slide-in-from-top-2": "slideInFromTop 0.2s ease-out",
        "slide-in-from-bottom-2": "slideInFromBottom 0.2s ease-out",
        "zoom-in-95": "zoomIn 0.2s ease-out",
        in: "fadeIn 0.2s ease-out",
        shimmer: "shimmer 2s linear infinite",
        pulse: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },

      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic":
          "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "linear-to-r": "linear-gradient(to right, var(--tw-gradient-stops))",
        "linear-to-br":
          "linear-gradient(to bottom right, var(--tw-gradient-stops))",
      },

      boxShadow: {
        "inner-sm": "inset 0 1px 2px 0 var(--border)",
        "inner-lg": "inset 0 2px 4px 0 var(--border)",
      },

      container: {
        center: true,
        padding: {
          DEFAULT: "1rem",
          sm: "1.5rem",
          lg: "2rem",
        },
        screens: {
          "2xl": "1400px",
        },
      },

      backdropBlur: {
        xs: "2px",
      },

      transitionDuration: {
        "400": "400ms",
      },

      scale: {
        "102": "1.02",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
    function ({ addUtilities }: any) {
      addUtilities({
        ".scrollbar-hide": {
          "-ms-overflow-style": "none",
          "scrollbar-width": "none",
          "&::-webkit-scrollbar": {
            display: "none",
          },
        },
        ".scrollbar-thin": {
          "scrollbar-width": "thin",
          "&::-webkit-scrollbar": {
            width: "6px",
            height: "6px",
          },
        },
      });
    },
  ],
};

export default config;
