import type { PassportDetailResponse } from '@/types/passport'

export interface MockRecord extends PassportDetailResponse {
  UID: string
}

const TAIWAN = '026938c1-f5d7-4c53-acc5-91672d49d7f7'

const emptyChemistry = () => ({
  positive_electrode: [],
  negative_electrode: [],
  electrolyte: [],
  unit: 'g',
  description: ''
})

export const createRecordFixtures = (): MockRecord[] => [
  {
    UID: 'ef5ce6a6-8716-43a6-9861-2cc80cfe0697',
    EORIID: 'TWDEV0000001',
    DPPClass: 1,
    DPPSubClass: 1,
    PassportStartDate: '2026-01-15',
    PassportEndDate: '2031-01-14',
    SerialNo: 'DEVBATTERY00001',
    MftDate: '2026-01-05',
    WarrantyDate: '2031-01-04',
    ProdCycleStatus: 1,
    DPPStatus: 1,
    DPPSource: 1,
    createdAt: '2026-01-15 09:30:00',
    updatedAt: '2026-02-20 14:05:00',
    DPPInfo: {
      GTIN: '4711234560012',
      SSCC: '123456789123456000',
      BatchLot: 'LOT2026A',
      TARIC: '8507600000',
      CCCCode: '',
      UniqueFacilityIdentifierDUNS: '123456789',
      UniqueFacilityIdentifierGLN: '',
      OrigIn: 'TW'
    },
    ProductInfo: {
      ProdName: '開發用二次鋰電池',
      Model: 'DEV-BAT-100',
      FID: '99612345',
      Description: '開發模式假資料，供版型與流程驗證使用。',
      ProdInfoLink: [
        'https://example.com/dev-battery',
        'https://example.com/dev-battery/manual.pdf',
        'https://example.com/dev-battery/maintenance.pdf'
      ],
      ProdPhoto: ['https://placehold.co/600x400/png?text=DEV+BATTERY'],
      CFPDate: '2026-01-10',
      CFPValue: 73.5,
      CFPEmissionUnit: 'kg CO2e',
      CFPFunctionUnit: '台',
      SpecInfo: [
        {
          SpecInfo_Type: 'Battery1',
          Details: [{ value: '10', unit: '年', description: '預期使用壽命' }],
          Voltage: [],
          Chemistry: emptyChemistry()
        },
        {
          SpecInfo_Type: 'Battery20',
          Details: [],
          Voltage: [],
          Chemistry: {
            positive_electrode: [{ name: '磷酸鋰鐵', cas_no: '15365-14-7', weight: 420 }],
            negative_electrode: [{ name: '石墨', cas_no: '7782-42-5', weight: 250 }],
            electrolyte: [{ name: '六氟磷酸鋰', cas_no: '21324-40-3', weight: 80 }],
            unit: 'g',
            description: '化學成分、CAS 號碼與重量'
          }
        },
        {
          SpecInfo_Type: 'Battery25',
          Details: [],
          Voltage: [
            {
              min: 2.5,
              nom: 3.2,
              max: 3.65,
              unit: 'V',
              description: '單芯電壓',
              Temperature: { min: -20, max: 60, unit: '°C', description: '工作溫度範圍' }
            }
          ],
          Chemistry: emptyChemistry()
        },
        {
          SpecInfo_Type: 'Battery26',
          Details: [
            {
              value: '150',
              unit: 'W',
              description: '功率能力',
              Temperature: { min: 0, max: 45, unit: '°C', description: '量測溫度範圍' }
            }
          ],
          Voltage: [],
          Chemistry: emptyChemistry()
        }
      ]
    },
    MandatoryCertification: [
      {
        CertName: '5',
        CertificateNo: 'CE-2026-000123',
        CertificationBody: 'TUV Rheinland',
        StartDate: '2026-01-02',
        EndDate: '2031-01-01',
        CertLink: 'https://example.com/cert/ce.pdf'
      }
    ],
    VoluntaryCertification: [
      {
        CertName: '4',
        CertificateNo: 'CFV-2026-000456',
        CertificationBody: 'SGS',
        StartDate: '2026-01-08',
        EndDate: '2029-01-07',
        CertLink: 'https://example.com/cert/cfv.pdf'
      }
    ],
    RepairabilityIndex: [],
    Material: [
      {
        MaterType: 1,
        Description: '主要材料組成',
        material: [
          {
            CompositionType: '1',
            composition: '鋁',
            weight: 180,
            unit: 'g',
            error_value: 5,
            parts: '外殼',
            consumer_time: '',
            cas_no: '7429-90-5',
            clp_index_no: '',
            hazard_class_and_category_code: '',
            concentration_range: '',
            origin_country: 'TW',
            supplier: '開發用供應商 A'
          }
        ]
      },
      {
        MaterType: 2,
        Description: '關鍵材料組成',
        material: [
          {
            CompositionType: '1',
            composition: '鋰',
            weight: 45,
            unit: 'g',
            error_value: 2,
            parts: '正極',
            consumer_time: '',
            cas_no: '7439-93-2',
            clp_index_no: '',
            hazard_class_and_category_code: '',
            concentration_range: '5-10%',
            origin_country: 'AU',
            supplier: '開發用供應商 B'
          }
        ]
      },
      {
        MaterType: 3,
        Description: '有害成分',
        material: [
          {
            CompositionType: '2',
            composition: '六氟磷酸鋰',
            weight: 80,
            unit: 'g',
            error_value: 3,
            parts: '電解液',
            consumer_time: '',
            cas_no: '21324-40-3',
            clp_index_no: '009-001-00-0',
            hazard_class_and_category_code: 'Skin Corr. 1B',
            concentration_range: '10-15%',
            origin_country: 'JP',
            supplier: '開發用供應商 C'
          }
        ]
      },
      {
        MaterType: 5,
        Description: '使用的可再生材料',
        material: [
          {
            CompositionType: '2',
            composition: '再生聚丙烯',
            weight: 30,
            unit: 'g',
            error_value: 1,
            parts: '隔板',
            consumer_time: '3',
            cas_no: '9003-07-0',
            clp_index_no: '',
            hazard_class_and_category_code: '',
            concentration_range: '',
            origin_country: 'TW',
            supplier: '開發用供應商 D'
          }
        ]
      },
      {
        MaterType: 6,
        Description: '產品內關注物質',
        material: [
          {
            CompositionType: '1',
            composition: '鈷',
            weight: 12,
            unit: 'g',
            error_value: 1,
            parts: '正極',
            consumer_time: '',
            cas_no: '7440-48-4',
            clp_index_no: '027-001-00-9',
            hazard_class_and_category_code: 'Resp. Sens. 1',
            concentration_range: '1-3%',
            origin_country: 'CD',
            supplier: '開發用供應商 E'
          }
        ]
      }
    ],
    PEFInfo: [
      {
        AssessmentDate: '2026-01-12',
        ImpactCategory: '1',
        LifeCycleStage: '2',
        CharacterizationResult: 73.5,
        NormalizationResult: 0.0091,
        WeightingResult: 0.0018,
        Unit: 'kg CO2e',
        Description: '製造階段溫室效應'
      }
    ],
    TradeMark: [
      {
        ApplicationNumber: 'TW-2026-000789',
        TrademarkOffice: '經濟部智慧財產局',
        TrademarkName: 'DEVCELL',
        TradeMarkLink: 'https://example.com/trademark/devcell',
        StartDate: '2026-01-20',
        EndDate: '2036-01-19',
        country_code_id: TAIWAN,
        Subdivision: 'TPE'
      }
    ]
  },
  {
    UID: '17ad98df-6b1b-4aeb-a56f-30ffb59ea3c3',
    EORIID: 'TWDEV0000001',
    DPPClass: 1,
    DPPSubClass: 2,
    PassportStartDate: '2026-03-01',
    PassportEndDate: '2032-02-29',
    SerialNo: 'DEVBATTERY00002',
    MftDate: '2026-02-18',
    WarrantyDate: '2032-02-17',
    ProdCycleStatus: 2,
    DPPStatus: 0,
    DPPSource: 3,
    createdAt: '2026-03-01 08:00:00',
    updatedAt: '2026-03-01 08:00:00',
    DPPInfo: {
      GTIN: '4711234560029',
      SSCC: '',
      BatchLot: 'LOT2026B',
      TARIC: '',
      CCCCode: '85076000009',
      UniqueFacilityIdentifierDUNS: '',
      UniqueFacilityIdentifierGLN: '4711234560000',
      OrigIn: 'TW'
    },
    ProductInfo: {
      ProdName: '開發用電動車電池模組',
      Model: 'DEV-EV-200',
      FID: '99654321',
      Description: '第二筆假資料，狀態為初始，用於檢查清單篩選與狀態顯示。',
      ProdInfoLink: ['https://example.com/dev-ev'],
      ProdPhoto: [],
      CFPDate: '2026-02-20',
      CFPValue: 1280,
      CFPEmissionUnit: 'kg CO2e',
      CFPFunctionUnit: '模組',
      SpecInfo: [
        {
          SpecInfo_Type: 'Battery2',
          Details: [{ value: '開發用車廠', unit: '', description: '電動車製造商' }],
          Voltage: [],
          Chemistry: emptyChemistry()
        }
      ]
    },
    MandatoryCertification: [],
    VoluntaryCertification: [],
    RepairabilityIndex: [],
    Material: [
      {
        MaterType: 1,
        Description: '',
        material: [
          {
            CompositionType: '1',
            composition: '鋼',
            weight: 5400,
            unit: 'g',
            error_value: 50,
            parts: '模組框架',
            consumer_time: '',
            cas_no: '7439-89-6',
            clp_index_no: '',
            hazard_class_and_category_code: '',
            concentration_range: '',
            origin_country: 'TW',
            supplier: '開發用供應商 F'
          }
        ]
      }
    ],
    PEFInfo: [],
    TradeMark: []
  }
]

export const createRepairFixtures = (): Record<string, unknown[]> => ({
  'ef5ce6a6-8716-43a6-9861-2cc80cfe0697': [
    {
      repair_date: '2026-02-10',
      repair_delivery_date: '2026-02-14',
      repair_info: [
        {
          repair_type: 1,
          component_name: '電芯模組',
          action_date: '2026-02-11',
          action_area: '原廠維修中心',
          description: '更換兩顆衰退電芯'
        },
        {
          repair_type: 2,
          component_name: '外殼',
          action_date: '2026-02-12',
          action_area: '原廠維修中心',
          description: '更換受損外殼'
        }
      ],
      importedAt: '2026-02-20 14:05:00'
    }
  ]
})

export const createRecycleFixtures = (): Record<string, unknown[]> => ({
  'ef5ce6a6-8716-43a6-9861-2cc80cfe0697': [
    {
      recycle_date: '2026-02-25',
      recycle_type: 1,
      recycle_addr_type: 1,
      recycle_addr: '',
      execution_dec: '送交合格回收商處理',
      completed_date: '2026-03-02',
      importedAt: '2026-03-03 10:00:00'
    }
  ]
})
