import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { copyFileSync } from 'fs'
import { join } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    // Plugin to copy 404.html to dist for GitHub Pages SPA routing
    {
      name: 'copy-404',
      closeBundle() {
        copyFileSync(
          join(__dirname, '404.html'),
          join(__dirname, 'dist', '404.html')
        )
      },
    },
  ],
  // Base path for GitHub Pages
  // If your site is at https://username.github.io/repo-name, set base to '/repo-name/'
  // If your site is at https://username.github.io, set base to '/'
  base: process.env.GITHUB_PAGES_BASE || '/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    // Generate source maps for production debugging (optional)
    sourcemap: false,
  },
})
