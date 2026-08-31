import { createRouter, createWebHistory } from 'vue-router'
import { i18n, localeFromQuery } from '@/i18n'
import { signedInAccount } from '@/utils/session'

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    titleKey: string
  }
}

export const router = createRouter({
  history: createWebHistory(import.meta.env.VITE_APP_BASE_PATH || '/'),
  routes: [
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
      meta: { titleKey: 'auth.login' }
    },
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
      meta: { requiresAuth: true, titleKey: 'home.title' }
    },
    {
      path: '/passport/list',
      name: 'passport-list',
      component: () => import('@/views/PassportListView.vue'),
      meta: { requiresAuth: true, titleKey: 'passport.title' }
    },
    {
      path: '/passport/add',
      name: 'passport-add',
      component: () => import('@/views/PassportFormView.vue'),
      meta: { requiresAuth: true, titleKey: 'passport.addTitle', aka: '/passport/list' }
    },
    {
      path: '/passport/edit/:uid',
      name: 'passport-edit',
      component: () => import('@/views/PassportFormView.vue'),
      meta: { requiresAuth: true, titleKey: 'passport.editTitle' }
    },
    {
      path: '/passport/detail/:uid',
      name: 'passport-detail',
      component: () => import('@/views/PassportFormView.vue'),
      meta: { requiresAuth: true, titleKey: 'passport.detailTitle' }
    },
    { path: '/:pathMatch(.*)*', redirect: '/' }
  ],
  scrollBehavior: () => ({ top: 0 })
})

router.beforeEach((to) => {
  const locale = localeFromQuery(to.query.lang)
  i18n.global.locale.value = locale
  document.documentElement.lang = locale === 'en' ? 'en' : 'zh-Hant-TW'
  const appTitle = import.meta.env.VITE_APP_TITLE || i18n.global.t('app.name')
  document.title = `${i18n.global.t(to.meta.titleKey)}｜${appTitle}`
  if (to.meta.requiresAuth && !signedInAccount.get())
    return {
      name: 'login',
      query: {
        redirect: to.fullPath,
        ...(locale === 'en' ? { lang: 'en' } : {})
      }
    }
  if (to.name === 'login' && signedInAccount.get())
    return { name: 'home', query: locale === 'en' ? { lang: 'en' } : {} }
})
