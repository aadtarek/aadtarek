import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// Relative base so the build works from any folder on shared hosting (e.g. Hostinger public_html).
export default defineConfig({
  base: './',
  plugins: [react(), tailwindcss()],
  optimizeDeps: { exclude: ['@huggingface/transformers'] },
  build: {
    chunkSizeWarningLimit: 2000,
  },
})
