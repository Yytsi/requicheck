import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  base: '/rotmg-raid-requirement-checker/',
  plugins: [react()],
})
