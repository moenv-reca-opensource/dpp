import { describe, expect, it } from 'vitest'
import { buildPassportQuery, parsePassportQuery, selectPassportPage } from '@/utils/listQuery'
import type { PassportListItem } from '@/types/passport'

const item = (overrides: Partial<PassportListItem>): PassportListItem => ({
  UID: 'uid-1',
  DPPClass: 1,
  DPPSubClass: 1,
  SerialNo: 'SN-001',
  Model: 'BAT-100',
  ProdName: '範例電池',
  PassportStartDate: '2026-01-15',
  DPPStatus: 0,
  createdAt: '2026-01-15 10:00:00',
  updatedAt: '2026-01-15 10:00:00',
  ...overrides
})

describe('清單 URL 查詢狀態', () => {
  it('解析有效條件並修正無效分頁', () => {
    expect(
      parsePassportQuery({ p: '-1', size: '999', q: ' battery ', start: '2026-01-01' })
    ).toEqual({ p: 1, size: 10, q: ' battery ', start: '2026-01-01', end: '' })
  })
  it('只輸出有值條件且英文加入 lang=en', () => {
    expect(buildPassportQuery({ p: 2, size: 20, q: ' UID ', start: '', end: '' }, true)).toEqual({
      p: '2',
      size: '20',
      lang: 'en',
      q: 'UID'
    })
  })
  it('輸出進階篩選條件', () => {
    expect(
      buildPassportQuery({ p: 1, size: 10, q: '', start: '2026-01-01', end: '2026-01-31' })
    ).toEqual({ p: '1', size: '10', start: '2026-01-01', end: '2026-01-31' })
  })
})

describe('清單本地篩選與分頁', () => {
  const items = [
    item({ UID: 'uid-1', createdAt: '2026-01-01 00:00:00' }),
    item({
      UID: 'uid-2',
      ProdName: '備援電池',
      SerialNo: 'SN-002',
      Model: 'BAT-200',
      createdAt: '2026-03-01 00:00:00',
      PassportStartDate: '2026-03-01'
    }),
    item({
      UID: 'uid-3',
      ProdName: null,
      Model: null,
      SerialNo: 'SN-003',
      createdAt: '2026-02-01 00:00:00',
      PassportStartDate: null
    })
  ]

  it('依建立時間降冪排序', () => {
    const { rows, total } = selectPassportPage(items, { p: 1, size: 10, q: '', start: '', end: '' })
    expect(rows.map((row) => row.UID)).toEqual(['uid-2', 'uid-3', 'uid-1'])
    expect(total).toBe(3)
  })
  it('關鍵字比對 UID、產品名稱、序號與型號且不分大小寫', () => {
    const match = (q: string) =>
      selectPassportPage(items, { p: 1, size: 10, q, start: '', end: '' }).rows.map(
        (row) => row.UID
      )
    expect(match('bat-200')).toEqual(['uid-2'])
    expect(match('備援')).toEqual(['uid-2'])
    expect(match('sn-003')).toEqual(['uid-3'])
    expect(match('uid-1')).toEqual(['uid-1'])
  })
  it('日期區間比對護照開始日期，無日期者一律排除', () => {
    const { rows } = selectPassportPage(items, {
      p: 1,
      size: 10,
      q: '',
      start: '2026-01-01',
      end: '2026-01-31'
    })
    expect(rows.map((row) => row.UID)).toEqual(['uid-1'])
  })
  it('分頁只切出當頁資料但回報總筆數', () => {
    const { rows, total } = selectPassportPage(items, { p: 2, size: 2, q: '', start: '', end: '' })
    expect(rows.map((row) => row.UID)).toEqual(['uid-1'])
    expect(total).toBe(3)
  })
})
