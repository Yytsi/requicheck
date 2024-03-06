// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base:
    process.env.NODE_ENV === 'production'
      ? '/rotmg-raid-requirement-checker/'
      : '/',
  plugins: [react()],
})
