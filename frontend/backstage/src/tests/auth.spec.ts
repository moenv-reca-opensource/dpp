import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPinia, setActivePinia } from 'pinia'

const loginApiMock = vi.fn()
const logoutApiMock = vi.fn()
const listPassportsMock = vi.fn()

vi.mock('@/api/auth', () => ({ loginApi: loginApiMock, logoutApi: logoutApiMock }))
vi.mock('@/api/passport', () => ({ listPassports: listPassportsMock }))

describe('登入狀態', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
    localStorage.clear()
    vi.clearAllMocks()
  })

  it('以明文帳密登入並記下帳號名，不再持有任何權杖', async () => {
    loginApiMock.mockResolvedValue({ ok: true })
    const { useAuthStore } = await import('@/stores/auth')
    const { signedInAccount } = await import('@/utils/session')

    const auth = useAuthStore()
    await auth.login(' admin ', 'plain-password')

    expect(loginApiMock).toHaveBeenCalledWith('admin', 'plain-password')
    expect(signedInAccount.get()).toBe('admin')
    expect(auth.user?.user_name).toBe('admin')
    expect(auth.isAuthenticated).toBe(true)
  })

  it('重新載入時以需登入的 API 探測 session 是否仍有效', async () => {
    const { useAuthStore } = await import('@/stores/auth')
    const { signedInAccount } = await import('@/utils/session')
    signedInAccount.set('admin')
    listPassportsMock.mockResolvedValue([])

    const auth = useAuthStore()
    await auth.restore()

    expect(listPassportsMock).toHaveBeenCalledOnce()
    expect(auth.user?.user_name).toBe('admin')
  })

  it('session 已失效時清掉旗標', async () => {
    const { useAuthStore } = await import('@/stores/auth')
    const { signedInAccount } = await import('@/utils/session')
    signedInAccount.set('admin')
    listPassportsMock.mockRejectedValue(new Error('Unauthorized'))

    const auth = useAuthStore()
    await auth.restore()

    expect(signedInAccount.get()).toBeNull()
    expect(auth.user).toBeNull()
  })

  it('登出後清掉旗標', async () => {
    logoutApiMock.mockResolvedValue({ ok: true })
    const { useAuthStore } = await import('@/stores/auth')
    const { signedInAccount } = await import('@/utils/session')
    signedInAccount.set('admin')

    const auth = useAuthStore()
    await auth.logout()

    expect(signedInAccount.get()).toBeNull()
  })
})
