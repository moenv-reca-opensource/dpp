import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createPassportPayload } from '@/utils/passport'

const postMock = vi.fn()
const postBlobMock = vi.fn()
vi.mock('@/api/client', () => ({ post: postMock, postBlob: postBlobMock }))

describe('後端 DPP API 契約', () => {
  beforeEach(() => {
    postMock.mockReset()
    postBlobMock.mockReset()
  })

  it('登入送出明文帳密到 frontstage 的 auth 端點', async () => {
    postMock.mockResolvedValueOnce({ ok: true })
    const { loginApi, logoutApi } = await import('@/api/auth')

    await expect(loginApi('admin', 'plain-password')).resolves.toEqual({ ok: true })
    expect(postMock).toHaveBeenLastCalledWith('/frontstage/auth/login', {
      username: 'admin',
      password: 'plain-password'
    })

    postMock.mockResolvedValueOnce({ ok: true })
    await logoutApi()
    expect(postMock).toHaveBeenLastCalledWith('/frontstage/auth/logout')
  })

  it('清單不帶條件，詳情以 UID 查詢', async () => {
    const { listPassports, getPassport } = await import('@/api/passport')

    postMock.mockResolvedValueOnce([])
    await listPassports()
    expect(postMock).toHaveBeenLastCalledWith('/dpp.list', {})

    postMock.mockResolvedValueOnce({})
    await getPassport('uid-1')
    expect(postMock).toHaveBeenLastCalledWith('/dpp.info', { UID: 'uid-1' })
  })

  it('修改把 UID 放進 DPP[0] 且不送後端不接受的維修與回收區塊', async () => {
    const { addPassport, modifyPassport } = await import('@/api/passport')
    const payload = createPassportPayload()
    payload.ProductInfo.ProdPhoto = ['https://example.com/a.png', '']
    payload.product_repair = [
      {
        repair_date: '2026-01-01',
        repair_delivery_date: '',
        repair_type: 1,
        component_name: '電芯',
        action_date: '',
        action_area: '',
        description: ''
      }
    ]

    postMock.mockResolvedValueOnce({ created: [], errors: [] })
    await addPassport(payload)
    const addBody = postMock.mock.calls[0]?.[1] as Record<string, unknown>
    expect(postMock.mock.calls[0]?.[0]).toBe('/dpp.add')
    expect(addBody).not.toHaveProperty('product_repair')
    expect(addBody).not.toHaveProperty('product_recycle')
    expect(addBody.ProductInfo).toMatchObject({ ProdPhoto: ['https://example.com/a.png'] })
    expect((addBody.DPP as { UID?: string }[])[0]?.UID).toBeUndefined()

    postMock.mockResolvedValueOnce({})
    await modifyPassport('uid-1', payload)
    const modifyBody = postMock.mock.calls[1]?.[1] as { DPP: { UID?: string }[] }
    expect(postMock.mock.calls[1]?.[0]).toBe('/dpp.modify')
    expect(modifyBody.DPP[0]?.UID).toBe('uid-1')
  })

  it('三種匯入都以 FormData 的 file 欄位送出原始檔案', async () => {
    const { importPassport, importRepair, importRecycle } = await import('@/api/passport')
    const file = new File(['[]'], 'dpp.json', { type: 'application/json' })

    postMock.mockResolvedValue({ errors: [] })
    await importPassport(file)
    await importRepair(file)
    await importRecycle(file)

    expect(postMock.mock.calls.map((call) => call[0])).toEqual([
      '/dpp.import',
      '/dpp.import_repair',
      '/dpp.import_recycle'
    ])
    for (const call of postMock.mock.calls) {
      const body = call[1] as FormData
      expect(body).toBeInstanceOf(FormData)
      expect(body.get('file')).toBe(file)
    }
  })

  it('QR Code 以 UID 取單筆二進位圖檔', async () => {
    const blob = new Blob([''], { type: 'image/png' })
    postBlobMock.mockResolvedValueOnce(blob)
    const { getPassportQrCode } = await import('@/api/passport')

    await expect(getPassportQrCode('uid-1')).resolves.toBe(blob)
    expect(postBlobMock).toHaveBeenCalledWith('/dpp.qrcode', { UID: 'uid-1' })
  })
})
