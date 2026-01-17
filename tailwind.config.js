/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        background: {
          DEFAULT: "#F8F8F8",
          soft: "#E9F3ED",
          warm: "#FFF9E6",
        },
        primary: {
          DEFAULT: "#B6D7C4",
          yellow: "#FFD74D",
          contrast: "#1A1A1A",
        },
        secondary: {
          DEFAULT: "#1A1A1A",
          contrast: "#FFFFFF",
        },
        neutral: {
          DEFAULT: "#F5F5F5",
          white: "#FFFFFF",
          light: "#F5F5F5",
          medium: "#BDBDBD",
          dark: "#4F4F4F",
        },
        accent: {
          success: "#4CAF50",
          error: "#F44336",
          soft: "#E9F3ED",
        },
      },
      fontFamily: {
        heading: ["var(--font-heading)", "Plus Jakarta Sans", "sans-serif"],
        body: ["var(--font-body)", "Manrope", "sans-serif"],
      },
      boxShadow: {
        subtle: "0 4px 24px rgba(0, 0, 0, 0.04)",
      },
      borderRadius: {
        s: "8px",
        m: "16px",
        l: "32px",
        pill: "9999px",
        card: "32px",
      },
    },
  },
  plugins: [],
};
