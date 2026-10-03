import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig(({ mode }) => ({
  plugins: [react(), tailwindcss()],
  // Pre-bundle every dependency at startup. Without this, Vite discovers them
  // after the first page load and force-reloads the page in dev.
  optimizeDeps: {
    include: ['react', 'react/jsx-runtime', 'react/jsx-dev-runtime', 'react-dom', 'react-dom/client', 'react-router-dom', 'lucide-react'],
  },
  // `npm run build:wp` builds into the WordPress theme. A relative base makes
  // asset URLs work wherever the theme folder lives; the theme reads the
  // manifest to load the entry files.
  ...(mode === 'wordpress'
    ? {
        base: './',
        publicDir: false,
        build: { outDir: 'wordpress/rfaheya/dist', emptyOutDir: true, manifest: true },
      }
    : {}),
}))
