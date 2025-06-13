/** @type {import('tailwindcss').Config} */
const config = {
    content: [
        './src/**/*.{ts,tsx,js,jsx,mdx}',
    ],
    theme: {
        extend: {
            colors: {
                brand: '#d4af37',
                accent: '#1abc9c',
                dark: '#0f0f0f',
                muted: '#555',
            },
            fontFamily: {
                sans: ["var(--font-inter)", "sans-serif"],
            },
            animation: {
                flicker: 'flicker 1.5s infinite alternate',
                pulseGlow: 'pulseGlow 2s infinite',
                tabWiggle: 'wiggle 0.3s ease-in-out',
                floatSlow: 'floatSlow 8s ease-in-out infinite',
            },
            keyframes: {
                flicker: {
                    '0%, 100%': { opacity: '1' },
                    '50%': { opacity: '0.3' },
                },
                pulseGlow: {
                    '0%, 100%': { boxShadow: '0 0 10px rgba(196, 84, 28, 0.5)' },
                    '50%': { boxShadow: '0 0 20px rgba(196, 84, 28, 0.9)' },
                },
                wiggle: {
                    '0%, 100%': { transform: 'translateY(0)' },
                    '50%': { transform: 'translateY(-3px)' },
                },
                floatSlow: {
                    '0%, 100%': { transform: 'translateY(0px)' },
                    '50%': { transform: 'translateY(-20px)' },
                },
            }
        },
    },
    plugins: [],
};

export default config;

