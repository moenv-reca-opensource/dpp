import { describe, expect, it } from 'vitest'
import { hasSerialNumberWhitespace, isHttpUrl } from '@/utils/validation'

describe('輸入驗證', () => {
  it('限制網址協定並遞迴偵測產品序號空白', () => {
    expect(isHttpUrl('https://example.org/dpp')).toBe(true)
    expect(isHttpUrl('javascript:alert(1)')).toBe(false)
    expect(hasSerialNumberWhitespace({ DPP: [{ SerialNo: 'BAT 001' }] })).toBe(true)
    expect(hasSerialNumberWhitespace({ DPP: [{ SerialNo: 'BAT001' }] })).toBe(false)
  })
})
