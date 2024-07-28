/** @type {import('tailwindcss').Config} */
export default {
    content: [
        "./pages/**/*.{html,js}",
        "./index.html",
        "./src/**/*.{js,ts,jsx,tsx}",
    ],
    theme: {
        screens: {
            // mobile
            sm: '640px',  // tablet
            md: '1024px', // desktop
            lg: '1440px', // monitor
            // xl: '1920px',
        },
        colors: {
            // Base
            "white": "#ffffff",
            "black": "#000000",

            // Grays
            "gray-100": "#e6e6e6",
            "gray-200": "#cccccc",
            "gray-300": "#b3b3b3",
            "gray-400": "#999999",
            "gray-500": "#808080",
            "gray-600": "#666666",
            "gray-700": "#4d4d4d",
            "gray-800": "#333333",
            "gray-900": "#1a1a1a",

            // Primary
            "primary-0": "#615ef0",
            "primary-100": "#f0f6ff",
            "primary-200": "#99dbfd",
            "primary-300": "#33b8fc",
            "primary-400": "#00a6fb",
            "primary-500": "#0085c9",
            "primary-600": "#006497",
            "primary-700": "#004264",
        },
        fontFamily: {
            primaryLight: ['Light'],
            primaryRegular: ['Regular'],
            primaryMedium: ['Medium'],
            primarySemiBold: ['SemiBold'],
            primaryBold: ['Bold']
        },
        extend: {
            spacing: {
                '128': '32rem',
                '144': '36rem',
            },
            borderRadius: {
                '4xl': '2rem'
            }
        },
    },
  plugins: [],
}

