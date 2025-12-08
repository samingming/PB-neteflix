import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// GitHub Pages 배포: 레포 이름과 동일하게!
export default defineConfig({
  base: '/PB-neteflix/',

  plugins: [vue()],

  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },

  // 선택 사항 (로컬 개발 편의용)
  server: {
    port: 5173,
    open: true,
  },

  // 선택 사항 (기본값과 거의 같지만 명시)
  build: {
    outDir: '../docs',
    sourcemap: false,
  },
})
