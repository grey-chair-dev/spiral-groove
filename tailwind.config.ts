import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Warm analog color palette from brand identity
        primary: {
          black: "#111111", // Midnight Vinyl Black
          cream: "#F5F3EE", // Cream Groove White
        },
        accent: {
          teal: "#3E787C", // Muted Teal
          amber: "#DDAA44", // Vintage Amber
          red: "#9C2830", // Vinyl Red
        },
        neutral: {
          gray: "#7A7A7A", // Slate Gray
        },
        // Text colors
        text: {
          primary: "#111111", // Black on light backgrounds
          secondary: "#F5F3EE", // Cream on dark backgrounds
          muted: "#7A7A7A", // Gray for labels
        },
        // Background colors
        background: {
          primary: "#F5F3EE", // Cream
          secondary: "#111111", // Black
          accent: "#3E787C", // Teal for sections
        },
      },
      fontFamily: {
        display: ["Playfair Display", "serif"], // Headlines
        sans: ["Inter", "system-ui", "sans-serif"], // Body text
        accent: ["Poppins", "sans-serif"], // Buttons and CTAs
      },
      fontSize: {
        // Typography scale from design system
        h1: ["3.375rem", { lineHeight: "120%", fontWeight: "700" }], // 54px
        h2: ["2.25rem", { lineHeight: "130%", fontWeight: "600" }], // 36px
        h3: ["1.75rem", { lineHeight: "135%", fontWeight: "400" }], // 28px
        h4: ["1.25rem", { lineHeight: "140%", fontWeight: "600" }], // 20px
        body: ["1.125rem", { lineHeight: "160%", fontWeight: "400" }], // 18px
        small: ["1rem", { lineHeight: "165%", fontWeight: "500" }], // 16px
        button: ["1rem", { lineHeight: "150%", fontWeight: "700" }], // 16px
        label: ["0.875rem", { lineHeight: "150%", fontWeight: "400" }], // 14px
        // Mobile responsive sizes
        "h1-mobile": ["2.25rem", { lineHeight: "120%", fontWeight: "700" }], // 36px
        "h2-mobile": ["1.75rem", { lineHeight: "130%", fontWeight: "600" }], // 28px
        "h3-mobile": ["1.375rem", { lineHeight: "135%", fontWeight: "400" }], // 22px
        "h4-mobile": ["1.125rem", { lineHeight: "140%", fontWeight: "600" }], // 18px
        "body-mobile": ["1rem", { lineHeight: "160%", fontWeight: "400" }], // 16px
        "small-mobile": ["0.875rem", { lineHeight: "165%", fontWeight: "500" }], // 14px
        "button-mobile": ["0.875rem", { lineHeight: "150%", fontWeight: "700" }], // 14px
      },
      spacing: {
        // Spacing tokens from design system
        "xxs": "0.25rem", // 4px
        "xs": "0.5rem", // 8px
        "sm": "1rem", // 16px
        "md": "1.5rem", // 24px
        "lg": "2rem", // 32px
        "xl": "4rem", // 64px
        "xxl": "6rem", // 96px
      },
      animation: {
        // Gentle analog-feel animations
        "fade-in": "fadeIn 0.6s ease-in-out",
        "fade-in-up": "fadeInUp 0.6s ease-out",
        "fade-in-down": "fadeInDown 0.6s ease-out",
        "slide-in-left": "slideInLeft 0.5s ease-out",
        "slide-in-right": "slideInRight 0.5s ease-out",
        "scale-in": "scaleIn 0.4s ease-out",
        "card-hover": "cardHover 0.3s ease-in-out",
        "button-hover": "buttonHover 0.2s ease-in-out",
        "float": "float 4s ease-in-out infinite",
        "spin-slow": "spin 4s linear infinite",
      },
      keyframes: {
        fadeIn: {
          "0%": { opacity: "0" },
          "100%": { opacity: "1" },
        },
        fadeInUp: {
          "0%": { opacity: "0", transform: "translateY(30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        fadeInDown: {
          "0%": { opacity: "0", transform: "translateY(-30px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        slideInLeft: {
          "0%": { opacity: "0", transform: "translateX(-30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        slideInRight: {
          "0%": { opacity: "0", transform: "translateX(30px)" },
          "100%": { opacity: "1", transform: "translateX(0)" },
        },
        scaleIn: {
          "0%": { opacity: "0", transform: "scale(0.95)" },
          "100%": { opacity: "1", transform: "scale(1)" },
        },
        cardHover: {
          "0%": { transform: "translateY(0) rotate(0deg)" },
          "100%": { transform: "translateY(-8px) rotate(2deg)" },
        },
        buttonHover: {
          "0%": { transform: "scale(1)" },
          "100%": { transform: "scale(1.02)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-8px)" },
        },
      },
      boxShadow: {
        // Warm analog shadows
        "card": "0 4px 12px rgba(17, 17, 17, 0.15)",
        "card-hover": "0 8px 24px rgba(17, 17, 17, 0.2)",
        "modal": "0 8px 20px rgba(17, 17, 17, 0.25)",
        "button": "0 2px 8px rgba(17, 17, 17, 0.1)",
        "button-hover": "0 4px 12px rgba(17, 17, 17, 0.15)",
        "elevated": "0 12px 32px rgba(17, 17, 17, 0.1)",
      },
      borderRadius: {
        "small": "0.375rem", // 6px
        "medium": "0.5rem", // 8px
        "large": "0.75rem", // 12px
      },
      backdropBlur: {
        xs: "2px",
      },
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
        "vinyl-texture": "radial-gradient(circle at 50% 50%, rgba(245, 243, 238, 0.1) 0%, transparent 50%)",
        "warm-gradient": "linear-gradient(135deg, #F5F3EE 0%, #3E787C 100%)",
      },
    },
  },
  plugins: [
    require("tailwindcss-animate"),
  ],
};

export default config;
