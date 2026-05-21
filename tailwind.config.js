/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      // Stitch FoodStore 
      colors: {
        // Surfaces
        "background":                "#fff8f6",
        "surface":                   "#fff8f6",
        "surface-bright":            "#fff8f6",
        "surface-dim":               "#f1d3cd",
        "surface-container-lowest":  "#ffffff",
        "surface-container-low":     "#fff0ed",
        "surface-container":         "#ffe9e4",
        "surface-container-high":    "#ffe2db",
        "surface-container-highest": "#fadcd5",
        "surface-variant":           "#fadcd5",
        // On-surface
        "on-surface":                "#281814",
        "on-surface-variant":        "#5c403a",
        "inverse-surface":           "#3e2c28",
        "inverse-on-surface":        "#ffede9",
        // Outline
        "outline":                   "#907068",
        "outline-variant":           "#e5beb5",
        // Primary (Appetite Red)
        "primary":                   "#b22300",
        "on-primary":                "#ffffff",
        "primary-container":         "#da3711",
        "on-primary-container":      "#fffbff",
        "primary-fixed":             "#ffdad2",
        "primary-fixed-dim":         "#ffb4a3",
        "on-primary-fixed":          "#3d0600",
        "on-primary-fixed-variant":  "#8b1900",
        "inverse-primary":           "#ffb4a3",
        "surface-tint":              "#b62400",
        // Secondary (Slate)
        "secondary":                 "#565e74",
        "on-secondary":              "#ffffff",
        "secondary-container":       "#dae2fd",
        "on-secondary-container":    "#5c647a",
        "secondary-fixed":           "#dae2fd",
        "secondary-fixed-dim":       "#bec6e0",
        "on-secondary-fixed":        "#131b2e",
        "on-secondary-fixed-variant":"#3f465c",
        // Tertiary (Blue)
        "tertiary":                  "#006192",
        "on-tertiary":               "#ffffff",
        "tertiary-container":        "#007bb8",
        "on-tertiary-container":     "#fcfcff",
        "tertiary-fixed":            "#cce5ff",
        "tertiary-fixed-dim":        "#91cdff",
        "on-tertiary-fixed":         "#001e31",
        "on-tertiary-fixed-variant": "#004b72",
        // Error
        "error":                     "#ba1a1a",
        "on-error":                  "#ffffff",
        "error-container":           "#ffdad6",
        "on-error-container":        "#93000a",
        // Background
        "on-background":             "#281814",
      },
      fontFamily: {
        sans: ["Hanken Grotesk", "system-ui", "sans-serif"],
      },
      fontSize: {
        "display-lg":        ["48px", { lineHeight: "1.1",  letterSpacing: "-0.02em", fontWeight: "700" }],
        "headline-lg":       ["32px", { lineHeight: "1.2",  letterSpacing: "-0.01em", fontWeight: "700" }],
        "headline-lg-mobile":["24px", { lineHeight: "1.2",  fontWeight: "700" }],
        "title-md":          ["18px", { lineHeight: "1.4",  fontWeight: "600" }],
        "body-lg":           ["16px", { lineHeight: "1.5",  fontWeight: "400" }],
        "body-sm":           ["14px", { lineHeight: "1.5",  fontWeight: "400" }],
        "label-caps":        ["12px", { lineHeight: "1",    letterSpacing: "0.05em", fontWeight: "700" }],
      },
      borderRadius: {
        DEFAULT: "0.5rem",
        sm:      "0.25rem",
        md:      "0.75rem",
        lg:      "1rem",
        xl:      "1.5rem",
        full:    "9999px",
      },
      spacing: {
        xs:            "4px",
        sm:            "12px",
        base:          "8px",
        md:            "24px",
        lg:            "40px",
        xl:            "64px",
        gutter:        "16px",
        container_max: "1280px",
      },
      boxShadow: {
        card:    "0 4px 20px rgba(15,23,42,0.08)",
        modal:   "0 8px 40px rgba(15,23,42,0.12)",
        button:  "0 2px 8px rgba(178,35,0,0.20)",
      },
    },
  },
  plugins: [],
}
