<script setup lang="ts">
import { computed, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, ElMessageBox } from 'element-plus'
import {
  House,
  Tickets,
  SwitchButton,
  Menu as MenuIcon,
  Close,
  ArrowRight
} from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import headerLogo from '@/assets/images/logo.svg'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const auth = useAuthStore()
const mobileOpen = ref(false)
const collapsed = ref(false)
const userName = computed(() => auth.user?.user_name || auth.user?.account || '—')
const collapseSidebar = () => {
  mobileOpen.value = false
  collapsed.value = true
}
const expandSidebar = () => {
  collapsed.value = false
  mobileOpen.value = true
}
const withLang = (path: string) => ({
  path,
  query: locale.value === 'en' ? { lang: 'en' } : {}
})
const isPassportRoute = computed(() => String(route.name || '').startsWith('passport-'))
const currentTitle = computed(() => (route.meta.titleKey ? t(route.meta.titleKey) : ''))

const switchLanguage = async (next: 'zh' | 'en') => {
  const query = { ...route.query }
  if (next === 'en') query.lang = 'en'
  else delete query.lang
  await router.replace({ path: route.path, query })
}
const logout = async () => {
  try {
    await ElMessageBox.confirm(t('auth.logoutConfirm'), t('auth.logout'), {
      confirmButtonText: t('common.confirm'),
      cancelButtonText: t('common.cancel'),
      type: 'warning'
    })
  } catch {
    return
  }
  await auth.logout()
  ElMessage.success(t('auth.logout'))
  await router.replace({
    name: 'login',
    query: locale.value === 'en' ? { lang: 'en' } : {}
  })
}
</script>

<template>
  <div class="app-shell" :class="{ 'is-collapsed': collapsed }">
    <header class="site-header">
      <RouterLink class="header-brand" :to="withLang('/')" :aria-label="$t('app.name')">
        <img :src="headerLogo" :alt="$t('auth.logoAlt')" />
        <strong>{{ $t('auth.systemName') }}</strong>
      </RouterLink>
      <div class="header-actions">
        <label class="language-control"
          ><span>{{ $t('language.label') }}</span>
          <select
            :value="locale"
            @change="switchLanguage(($event.target as HTMLSelectElement).value as 'zh' | 'en')"
          >
            <option value="zh">繁體中文</option>
            <option value="en">English</option>
          </select>
        </label>
        <span class="user-chip"
          ><i aria-hidden="true">{{ userName.slice(0, 1).toUpperCase() }}</i
          >{{ userName }}</span
        >
        <button class="logout-button" type="button" @click="logout">
          <el-icon><SwitchButton /></el-icon><span>{{ $t('auth.logout') }}</span>
        </button>
      </div>
    </header>
    <aside class="sidebar" :class="{ 'is-open': mobileOpen }" aria-labelledby="primary-nav-title">
      <button
        class="sidebar-title"
        type="button"
        aria-controls="primary-nav"
        :aria-expanded="!collapsed"
        @click="collapseSidebar"
      >
        <el-icon><MenuIcon /></el-icon><span>{{ $t('nav.collapseMenu') }}</span>
      </button>
      <button
        class="mobile-close"
        type="button"
        :aria-label="$t('common.close')"
        @click="mobileOpen = false"
      >
        <el-icon><Close /></el-icon>
      </button>
      <nav id="primary-nav" :aria-label="$t('nav.menu')">
        <h2 id="primary-nav-title" class="sr-only">{{ $t('nav.menu') }}</h2>
        <RouterLink :to="withLang('/')" @click="mobileOpen = false"
          ><el-icon><House /></el-icon><span>{{ $t('nav.home') }}</span></RouterLink
        >
        <div class="sidebar-group" :class="{ 'is-active': isPassportRoute }">
          <div class="sidebar-group-title">
            <el-icon><Tickets /></el-icon><span>{{ $t('nav.passportManage') }}</span>
          </div>
          <RouterLink
            class="sidebar-child"
            :to="withLang('/passport/list')"
            @click="mobileOpen = false"
            ><span :class="{ 'is-active': isPassportRoute }">{{
              $t('nav.passportList')
            }}</span></RouterLink
          >
        </div>
      </nav>
    </aside>
    <div
      v-if="mobileOpen"
      class="sidebar-backdrop"
      aria-hidden="true"
      @click="mobileOpen = false"
    />
    <div class="app-stage">
      <div class="mobile-topbar">
        <button
          class="mobile-menu"
          type="button"
          aria-controls="primary-nav"
          :aria-expanded="false"
          :aria-label="$t('nav.expandMenu')"
          @click="expandSidebar"
        >
          <el-icon><MenuIcon /></el-icon>
        </button>
        <span>{{ currentTitle }}</span>
      </div>
      <nav class="breadcrumb" :aria-label="$t('nav.breadcrumb')">
        <RouterLink :to="withLang('/')"
          ><el-icon><House /></el-icon>{{ $t('nav.home') }}</RouterLink
        >
        <template v-if="isPassportRoute"
          ><el-icon aria-hidden="true"><ArrowRight /></el-icon
          ><span>{{ $t('nav.passportManage') }}</span></template
        >
        <template v-if="route.name !== 'home'"
          ><el-icon aria-hidden="true"><ArrowRight /></el-icon
          ><span aria-current="page">{{ currentTitle }}</span></template
        >
      </nav>
      <main id="main-content" tabindex="-1"><slot /></main>
      <div class="live-region sr-only" role="status" aria-live="polite" />
    </div>
  </div>
</template>
