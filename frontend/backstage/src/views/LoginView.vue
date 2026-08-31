<script setup lang="ts">
import { reactive, ref } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage, type FormInstance, type FormRules } from 'element-plus'
import { User, Lock } from '@element-plus/icons-vue'
import { useAuthStore } from '@/stores/auth'
import loginLogo from '@/assets/images/logo.svg'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const auth = useAuthStore()
const formRef = ref<FormInstance>()
const loading = ref(false)
const form = reactive({ account: '', password: '' })
const rules: FormRules = {
  account: [{ required: true, message: t('common.required'), trigger: 'blur' }],
  password: [{ required: true, message: t('common.required'), trigger: 'blur' }]
}
const submit = async () => {
  if (!(await formRef.value?.validate().catch(() => false))) return
  loading.value = true
  try {
    await auth.login(form.account, form.password)
    const redirect =
      typeof route.query.redirect === 'string' && route.query.redirect.startsWith('/')
        ? route.query.redirect
        : '/'
    const target = router.resolve(redirect)
    await router.replace({
      path: target.path,
      hash: target.hash,
      query: {
        ...target.query,
        ...(locale.value === 'en' ? { lang: 'en' } : {})
      }
    })
  } catch (error) {
    ElMessage.error(error instanceof Error && error.message ? error.message : t('auth.loginFailed'))
  } finally {
    loading.value = false
  }
}
const switchLanguage = async (next: 'zh' | 'en') => {
  const query = { ...route.query }
  if (next === 'en') query.lang = 'en'
  else delete query.lang
  await router.replace({ query })
}
</script>

<template>
  <main id="main-content" class="login-page" tabindex="-1">
    <section class="login-card" aria-labelledby="login-title">
      <header class="login-card-header">
        <img class="login-logo" :src="loginLogo" :alt="$t('auth.logoAlt')" />
        <h1 id="login-title">{{ $t('auth.systemName') }}</h1>
      </header>
      <div class="login-card-body">
        <el-form
          ref="formRef"
          :model="form"
          :rules="rules"
          label-position="top"
          :validate-on-rule-change="false"
          @submit.prevent="submit"
        >
          <el-form-item prop="account">
            <template #label
              ><el-icon aria-hidden="true"><User /></el-icon
              ><span>{{ $t('auth.account') }}</span></template
            >
            <el-input
              v-model="form.account"
              size="large"
              autocomplete="username"
              :placeholder="$t('auth.accountPlaceholder')"
            />
          </el-form-item>
          <el-form-item prop="password">
            <template #label
              ><el-icon aria-hidden="true"><Lock /></el-icon
              ><span>{{ $t('auth.password') }}</span></template
            >
            <el-input
              v-model="form.password"
              size="large"
              type="password"
              show-password
              autocomplete="current-password"
              :placeholder="$t('auth.passwordPlaceholder')"
            />
          </el-form-item>
          <el-button
            class="login-submit"
            native-type="submit"
            type="primary"
            size="large"
            :loading="loading"
            >{{ $t('auth.login') }}</el-button
          >
        </el-form>
        <div class="login-language" role="group" :aria-label="$t('language.label')">
          <button
            type="button"
            :class="{ 'is-active': locale === 'zh' }"
            :aria-pressed="locale === 'zh'"
            @click="switchLanguage('zh')"
          >
            中
          </button>
          <button
            type="button"
            :class="{ 'is-active': locale === 'en' }"
            :aria-pressed="locale === 'en'"
            @click="switchLanguage('en')"
          >
            ENG
          </button>
        </div>
      </div>
    </section>
  </main>
</template>
