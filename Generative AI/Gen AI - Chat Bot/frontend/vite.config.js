import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, '.', 'VITE_')

  return {
    plugins: [react()],
    server: { proxy: { '/api': env.VITE_API_URL || 'http://localhost:3000' } },
  }
})
