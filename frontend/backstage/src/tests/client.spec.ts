import type { AxiosResponse } from 'axios'
import { describe, expect, it, vi } from 'vitest'
import { http, post } from '@/api/client'

const jsonResponse = (payload: unknown, config: Parameters<typeof http.request>[0]) =>
  ({
    data: { success: true, code: 200, s_message: '0000', payload },
    status: 200,
    statusText: 'OK',
    headers: {},
    config
  }) as AxiosResponse

describe('API 用戶端', () => {
  it('以 cookie 驗證，不附加 Authorization 標頭', async () => {
    expect(http.defaults.withCredentials).toBe(true)
    http.defaults.adapter = async (config): Promise<AxiosResponse> => {
      expect(config.headers.Authorization).toBeUndefined()
      return jsonResponse([{ UID: 'uid-1' }], config)
    }

    await expect(post('/dpp.list', {})).resolves.toEqual([{ UID: 'uid-1' }])
  })

  it('後端回 401 時發出登入失效事件', async () => {
    const expired = vi.fn()
    window.addEventListener('auth:expired', expired)
    http.defaults.adapter = async (config) => {
      throw Object.assign(new Error('Unauthorized'), {
        isAxiosError: true,
        config,
        response: { status: 401, data: {}, statusText: '', headers: {}, config }
      })
    }

    await expect(post('/dpp.list', {})).rejects.toThrow()
    expect(expired).toHaveBeenCalledOnce()
    window.removeEventListener('auth:expired', expired)
  })

  it('登入端點的 401 屬帳密錯誤，不視為登入失效', async () => {
    const expired = vi.fn()
    window.addEventListener('auth:expired', expired)
    http.defaults.adapter = async (config) => {
      throw Object.assign(new Error('Invalid credentials'), {
        isAxiosError: true,
        config,
        response: { status: 401, data: {}, statusText: '', headers: {}, config }
      })
    }

    await expect(post('/frontstage/auth/login', {})).rejects.toThrow()
    expect(expired).not.toHaveBeenCalled()
    window.removeEventListener('auth:expired', expired)
  })
})
