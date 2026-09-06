import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  const apiUrl = process.env.VITE_API_URL || env.VITE_API_URL || 'http://127.0.0.1:8000'
  const googleClientId = process.env.VITE_GOOGLE_CLIENT_ID || env.VITE_GOOGLE_CLIENT_ID || ''
  return {
    plugins: [react(), tailwindcss()],
    define: {
      'import.meta.env.VITE_API_URL': JSON.stringify(apiUrl),
      'import.meta.env.VITE_GOOGLE_CLIENT_ID': JSON.stringify(googleClientId),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      proxy: {
        '/robots.txt': { target: apiUrl, changeOrigin: false },
        '/sitemap.xml': { target: apiUrl, changeOrigin: false },
      },
    },
  }
})
