import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// ⚠️ GitHub Pages 배포 시 필수!
// base 경로는 레포 이름과 반드시 동일해야 함
export default defineConfig({
  base: '/PB-neteflix/',

  plugins: [vue()],

  // (선택) 로컬 개발 서버 설정
  server: {
    port: 5173,
    open: true,
  },

  // (선택) 빌드 옵션 – 디폴트로도 충분하지만 명확히 해둠
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
})
