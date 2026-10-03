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
  // `npm run export:content` (scripts/export-content.ts): keep images as files.
  ...(mode === 'export' ? { build: { ssrEmitAssets: true, assetsInlineLimit: 0, outDir: '.export-content', emptyOutDir: true } } : {}),
}))
