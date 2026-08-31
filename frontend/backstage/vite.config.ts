import { fileURLToPath, URL } from 'node:url'
import { defineConfig, loadEnv } from 'vite'
import vue from '@vitejs/plugin-vue'

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), '')
  return {
    base: env.VITE_APP_BASE_PATH || '/',
    plugins: [vue()],
    resolve: { alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) } },
    // 後端以 PHP session cookie 驗證且未提供 CORS 標頭，開發時一律經由 proxy 讓前後端同源
    server: {
      proxy: {
        '/api': { target: env.VITE_DEV_API_TARGET || 'http://localhost:8080' }
      }
    },
    define: {
      __VUE_I18N_FULL_INSTALL__: true,
      __VUE_I18N_LEGACY_API__: false,
      __INTLIFY_JIT_COMPILATION__: true,
      __INTLIFY_DROP_MESSAGE_COMPILER__: false
    },
    build: { sourcemap: true, chunkSizeWarningLimit: 1200 }
  }
})
