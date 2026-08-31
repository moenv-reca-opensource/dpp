import { describe, expect, it } from 'vitest'
import parameters from '@/data/parameters.json'
import countries from '@/data/countries.json'
import {
  createPassportPayload,
  createSpecification,
  normalizePassportPayload
} from '@/utils/passport'

describe('本地參數與國家資料', () => {
  it('僅提供電池類別與指定材料類型', () => {
    expect(parameters.DPPClass).toEqual([
      { code: '1', param_name: '電池', param_en_name: 'Battery' }
    ])
    expect(parameters.MaterType.map((item) => item.code)).toEqual(['1', '2', '3', '5', '6'])
  })
  it('Battery1 至 Battery40 均使用 param_en_name', () => {
    expect(parameters.SpecInfoType).toHaveLength(40)
    expect(parameters.SpecInfoType[0]?.code).toBe('Battery1')
    expect(parameters.SpecInfoType[39]?.code).toBe('Battery40')
    expect(
      parameters.SpecInfoType.every(
        (item) => item.param_en_name && item.param_purpose === 'DPPClass1'
      )
    ).toBe(true)
  })
  it('國家資料包含中英文名稱且複本完整', () => {
    expect(countries.length).toBeGreaterThan(200)
    expect(
      countries.every((item) => item.country_code && item.country_name_zh && item.country_name_en)
    ).toBe(true)
  })
  it('新增資料固定電池與五種必要材料', () => {
    const payload = createPassportPayload()
    expect(payload.DPP[0]?.DPPClass).toBe(1)
    expect(payload.DPP[0]?.DPPSource).toBe(1)
    expect(payload.DPP[0]?.DPPStatus).toBe(0)
    expect(payload.Material.map((item) => item.MaterType)).toEqual([1, 2, 3, 5, 6])
    const removed = structuredClone(payload)
    removed.Material = removed.Material.filter((item) => item.MaterType !== 6)
    expect(normalizePassportPayload(removed).Material.some((item) => item.MaterType === 6)).toBe(
      true
    )
  })
  it('四種特殊電池規格建立正確資料結構', () => {
    expect(createSpecification('Battery20').Chemistry).toMatchObject({
      positive_electrode: [],
      negative_electrode: [],
      electrolyte: []
    })
    expect(createSpecification('Battery25').Voltage).toHaveLength(1)
    expect(createSpecification('Battery26').Details[0]?.Temperature?.unit).toBe('°C')
    expect(createSpecification('Battery39').Details[0]?.Temperature?.unit).toBe('°C')
    expect(createSpecification('Battery1').Details).toHaveLength(1)
  })
})
