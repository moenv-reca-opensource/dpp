import { createApp } from 'vue'
import { createPinia } from 'pinia'
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'
import '@/assets/main.css'
import App from '@/App.vue'
import { i18n } from '@/i18n'
import { router } from '@/router'
import { useAuthStore } from '@/stores/auth'
import { signedInAccount } from '@/utils/session'

const app = createApp(App)
const pinia = createPinia()
app.use(pinia).use(router).use(i18n).use(ElementPlus)

// import.meta.env.DEV 是把繞過邏輯擋在正式建置外的關鍵，請勿移除
if (import.meta.env.DEV && import.meta.env.VITE_DEV_BYPASS_AUTH === 'true') {
  const { installMockBackend } = await import('@/dev/mockBackend')
  installMockBackend()
  signedInAccount.set('dev')
  console.warn('[dev] VITE_DEV_BYPASS_AUTH 已啟用：跳過登入並使用假資料，未連線任何後端。')
}

const auth = useAuthStore(pinia)
window.addEventListener('auth:expired', () => {
  auth.expire()
  const current = router.currentRoute.value
  void router.replace({
    name: 'login',
    query: {
      redirect: current.fullPath,
      ...(current.query.lang === 'en' ? { lang: 'en' } : {})
    }
  })
})

void auth.restore().finally(() => app.mount('#app'))
