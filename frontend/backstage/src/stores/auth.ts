import { computed, ref } from 'vue'
import { defineStore } from 'pinia'
import { loginApi, logoutApi } from '@/api/auth'
import { listPassports } from '@/api/passport'
import { signedInAccount } from '@/utils/session'
import type { UserProfile } from '@/types/api'

export const useAuthStore = defineStore('auth', () => {
  const user = ref<UserProfile | null>(null)
  const initialized = ref(false)
  const isAuthenticated = computed(() => Boolean(signedInAccount.get()))

  const login = async (account: string, password: string) => {
    const username = account.trim()
    await loginApi(username, password)
    signedInAccount.set(username)
    user.value = { user_name: username, account: username }
  }
  const restore = async () => {
    const account = signedInAccount.get()
    if (!account) {
      initialized.value = true
      return
    }
    try {
      await listPassports()
      user.value = { user_name: account, account }
    } catch {
      signedInAccount.clear()
      user.value = null
      window.dispatchEvent(new CustomEvent('auth:expired'))
    } finally {
      initialized.value = true
    }
  }
  const logout = async () => {
    try {
      await logoutApi()
    } finally {
      signedInAccount.clear()
      user.value = null
    }
  }
  const expire = () => {
    signedInAccount.clear()
    user.value = null
  }
  return { user, initialized, isAuthenticated, login, restore, logout, expire }
})
