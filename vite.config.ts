import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

export default defineConfig({
  // GitHub Pages serves the site from /Zypher-website/. Set BASE_PATH=/ for a
  // custom domain or any host that serves from the root.
  base: process.env.BASE_PATH ?? '/',
  plugins: [react(), tailwindcss()],
  build: {
    // three.js arrives in its own lazy chunk with the hero scene.
    chunkSizeWarningLimit: 1100,
  },
})
