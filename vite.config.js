import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/study-focus/', // 예: '/study-focus/' (앞뒤 슬래시 필수)
})