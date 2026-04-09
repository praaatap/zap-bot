/** @type {import('tailwindcss').Config} */
const config = {
    content: [
        "./app/**/*.{js,ts,jsx,tsx,mdx}",
        "./components/**/*.{js,ts,jsx,tsx,mdx}",
    ],
    darkMode: "class", // Enables light/dark switching
    theme: {
        extend: {
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
                heading: ["var(--font-space)", "sans-serif"],
            },
            colors: {
                surface: {
                    DEFAULT: "#f8fafc",     // slate-50
                    low: "#ffffff",         // white
                    highest: "#f1f5f9",     // slate-100
                },
                border: "hsl(var(--border))",
                background: "hsl(var(--background))",
                foreground: "hsl(var(--foreground))",
            },
        },
    },
};

export default config;
