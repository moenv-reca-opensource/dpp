import { describe, expect, it } from 'vitest'
import { normalizePassportPayload } from '@/utils/passport'
import type { PassportDetailResponse } from '@/types/passport'

describe('護照詳情 API 正規化', () => {
  it('將後端扁平記錄轉成頁面使用的資料格式', () => {
    const response = {
      UID: 'ef5ce6a6-8716-43a6-9861-2cc80cfe0697',
      DPPID: '01471123456001210abc12321EXAMPLE0P3S099',
      EORIID: 'TW123456789',
      DPPClass: '1',
      DPPSubClass: '1',
      PassportStartDate: '2023-01-01',
      PassportEndDate: '2027-12-31',
      SerialNo: 'EXAMPLE0P3S099',
      MftDate: '2023-01-01',
      WarrantyDate: '2027-12-31',
      ProdCycleStatus: '1',
      DPPSource: '1',
      DPPStatus: '0',
      createdAt: '2026-01-01 00:00:00',
      updatedAt: '2026-01-02 00:00:00',
      DPPInfo: {
        GTIN: '4711234560012',
        SSCC: '123456789123456000',
        BatchLot: 'abc123',
        TARIC: '8471300000',
        UniqueFacilityIdentifierDUNS: '123456789',
        UniqueFacilityIdentifierGLN: '1234567890123',
        OrigIn: 'TW'
      },
      ProductInfo: {
        ProdName: '範例電池一號',
        Model: 'BAT-100',
        FID: '99612345',
        CCCCode: '84713000008',
        Description: '18',
        ProdInfoLink: {
          ProdWebPageLink: 'https://example.com/product',
          ProductManualLink: 'https://example.com/manual.pdf',
          MaintenanceManualLink: 'https://example.com/maintenance.pdf'
        },
        ProdPhoto: ['https://example.com/product.png'],
        CFPDate: '2023-01-01',
        CFPValue: '73.0000',
        CFPEmissionUnit: 'kg CO2e',
        CFPFunctionUnit: '台',
        SpecInfo: []
      },
      Material: [
        {
          MaterType: '1',
          Description: '',
          Material: [
            {
              CompositionType: '1',
              composition: '銅',
              weight: '101',
              unit: '101',
              error_value: '101'
            }
          ]
        }
      ],
      RepairRecord: [
        {
          repair_date: '2025-09-03',
          repair_delivery_date: '2025-09-04',
          repair_info: [
            {
              repair_type: '1',
              component_name: '名稱',
              action_date: '2025-09-01',
              action_area: '我家',
              description: '備註'
            },
            {
              repair_type: '2',
              component_name: '名稱2',
              action_date: '2025-09-02',
              action_area: '公司',
              description: '備註2'
            }
          ],
          importedAt: '2026-01-03 00:00:00'
        }
      ],
      RecycleRecord: [
        {
          recycle_date: '2025-09-01',
          recycle_type: '1',
          recycle_addr_type: '1',
          recycle_addr: '地址',
          execution_dec: '處理情形',
          completed_date: '2025-09-02',
          importedAt: '2026-01-03 00:00:00'
        }
      ]
    } as unknown as PassportDetailResponse

    const payload = normalizePassportPayload(response)

    expect(payload.DPP[0]).toMatchObject({
      UID: 'ef5ce6a6-8716-43a6-9861-2cc80cfe0697',
      DPPID: '01471123456001210abc12321EXAMPLE0P3S099',
      DPPClass: 1,
      DPPSubClass: 1,
      PassportStartDate: '2023-01-01',
      SerialNo: 'EXAMPLE0P3S099',
      ProdCycleStatus: 1,
      DPPStatus: 0
    })
    expect(payload.DPP[0]).not.toHaveProperty('DPPInfo')
    expect(payload.DPP[0]).not.toHaveProperty('RepairRecord')

    expect(payload.DPPInfo.CCCCode).toBe('84713000008')
    expect(payload.ProductInfo.ProdInfoLink).toEqual([
      'https://example.com/product',
      'https://example.com/manual.pdf',
      'https://example.com/maintenance.pdf'
    ])
    expect(payload.ProductInfo.ProdPhoto).toEqual(['https://example.com/product.png'])
    expect(payload.ProductInfo.CFPValue).toBe(73)
    expect(payload.Material[0]?.material[0]).toMatchObject({
      composition: '銅',
      weight: 101,
      error_value: 101
    })
    expect(payload.Material.map((materialItem) => materialItem.MaterType)).toEqual([1, 2, 3, 5, 6])

    expect(payload.product_repair).toEqual([
      {
        repair_date: '2025-09-03',
        repair_delivery_date: '2025-09-04',
        repair_type: 1,
        component_name: '名稱',
        action_date: '2025-09-01',
        action_area: '我家',
        description: '備註'
      },
      {
        repair_date: '2025-09-03',
        repair_delivery_date: '2025-09-04',
        repair_type: 2,
        component_name: '名稱2',
        action_date: '2025-09-02',
        action_area: '公司',
        description: '備註2'
      }
    ])
    expect(payload.product_recycle).toEqual([
      {
        recycle_date: '2025-09-01',
        recycle_type: 1,
        recycle_addr_type: 1,
        recycle_addr: '地址',
        execution_dec: '處理情形',
        completed_date: '2025-09-02'
      }
    ])
  })

  it('沒有維修與回收紀錄時給空陣列，圖片欄位至少保留一列', () => {
    const payload = normalizePassportPayload({ UID: 'uid-1' } as PassportDetailResponse)
    expect(payload.product_repair).toEqual([])
    expect(payload.product_recycle).toEqual([])
    expect(payload.ProductInfo.ProdPhoto).toEqual([''])
  })
})
