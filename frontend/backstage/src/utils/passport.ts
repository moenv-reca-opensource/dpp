import type {
  Certification,
  ChemistryInfo,
  Material,
  MaterialItem,
  PassportPayload,
  PassportDetailResponse,
  SpecificationDetail,
  SpecificationInfo,
  TradeMark,
  VoltageDetail
} from '@/types/passport'

export const createDetail = (): SpecificationDetail => ({
  value: '',
  unit: '',
  description: ''
})
export const createTemperature = () => ({
  min: undefined,
  max: undefined,
  unit: '°C',
  description: ''
})
export const createVoltage = (): VoltageDetail => ({
  min: undefined,
  nom: undefined,
  max: undefined,
  unit: 'V',
  description: '',
  Temperature: createTemperature()
})
export const createChemistry = (): ChemistryInfo => ({
  positive_electrode: [],
  negative_electrode: [],
  electrolyte: [],
  unit: 'g',
  description: ''
})
export const createSpecification = (type: string): SpecificationInfo => {
  const specification: SpecificationInfo = {
    SpecInfo_Type: type,
    Details: [],
    Voltage: [],
    Chemistry: createChemistry()
  }
  if (type === 'Battery25') specification.Voltage = [createVoltage()]
  else if (type !== 'Battery20') {
    const detail = createDetail()
    if (['Battery26', 'Battery39'].includes(type)) detail.Temperature = createTemperature()
    specification.Details = [detail]
  }
  return specification
}
export const createMaterialItem = (): MaterialItem => ({
  CompositionType: '',
  composition: '',
  weight: undefined,
  unit: '',
  error_value: undefined,
  parts: '',
  consumer_time: '',
  cas_no: '',
  clp_index_no: '',
  hazard_class_and_category_code: '',
  concentration_range: '',
  origin_country: '',
  supplier: ''
})
export const createMaterial = (MaterType: number): Material => ({
  MaterType,
  Description: '',
  material: [createMaterialItem()]
})
export const createCertification = (): Certification => ({
  CertName: '',
  CertificateNo: '',
  CertificationBody: '',
  StartDate: '',
  EndDate: '',
  CertLink: ''
})
export const createTradeMark = (): TradeMark => ({
  ApplicationNumber: '',
  TrademarkOffice: '',
  TrademarkName: '',
  TradeMarkLink: '',
  StartDate: '',
  EndDate: '',
  country_code_id: '',
  Subdivision: ''
})
export const createPassportPayload = (): PassportPayload => ({
  DPP: [
    {
      DPPClass: 1,
      DPPSubClass: undefined,
      PassportStartDate: '',
      PassportEndDate: '',
      SerialNo: '',
      MftDate: '',
      WarrantyDate: '',
      ProdCycleStatus: undefined,
      DPPSource: 1,
      DPPStatus: 0
    }
  ],
  DPPInfo: {
    GTIN: '',
    SSCC: '',
    BatchLot: '',
    TARIC: '',
    CCCCode: '',
    UniqueFacilityIdentifierDUNS: '',
    UniqueFacilityIdentifierGLN: '',
    OrigIn: ''
  },
  ProductInfo: {
    ProdName: '',
    Model: '',
    FID: '',
    Description: '',
    ProdInfoLink: ['', '', ''],
    ProdPhoto: [''],
    CFPDate: '',
    CFPValue: undefined,
    CFPEmissionUnit: 'kg CO2e',
    CFPFunctionUnit: '',
    SpecInfo: []
  },
  MandatoryCertification: [],
  VoluntaryCertification: [],
  Material: [1, 2, 3, 5, 6].map(createMaterial),
  PEFInfo: [],
  TradeMark: [],
  product_repair: [],
  product_recycle: []
})

export const normalizePassportPayload = (
  payload: PassportDetailResponse | PassportPayload
): PassportPayload => {
  const defaults = createPassportPayload()
  const source = structuredClone(payload) as PassportDetailResponse
  const sourceDpp = Array.isArray(source.DPP) ? source.DPP[0] : (source.DPP ?? source)
  const sourceInfo = source.DPPInfo || {}
  const sourceProduct = source.ProductInfo || {}
  const numberOrUndefined = (value: unknown) => {
    if (value === '' || value === null || value === undefined) return undefined
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : undefined
  }
  const stringValue = (value: unknown) =>
    value === null || value === undefined ? '' : String(value)
  const stringArray = (
    value: string[] | Record<string, string> | string | undefined,
    keys: string[]
  ) => {
    if (Array.isArray(value)) return value.map(stringValue)
    if (value && typeof value === 'object') return keys.map((key) => stringValue(value[key]))
    return value ? [String(value)] : []
  }
  const normalizeTemperature = (value: unknown) => {
    const temperature = (value || {}) as Record<string, unknown>
    return {
      min: numberOrUndefined(temperature.min),
      max: numberOrUndefined(temperature.max),
      unit: stringValue(temperature.unit),
      description: stringValue(temperature.description)
    }
  }
  const normalizeSpecification = (item: SpecificationInfo): SpecificationInfo => ({
    SpecInfo_Type: stringValue(item.SpecInfo_Type),
    Details: (Array.isArray(item.Details) ? item.Details : []).map((detail) => ({
      value: stringValue(detail.value),
      unit: stringValue(detail.unit),
      description: stringValue(detail.description),
      ...(['Battery26', 'Battery39'].includes(item.SpecInfo_Type) && detail.Temperature
        ? { Temperature: normalizeTemperature(detail.Temperature) }
        : {})
    })),
    Voltage: (Array.isArray(item.Voltage) ? item.Voltage : []).map((detail) => ({
      min: numberOrUndefined(detail.min),
      nom: numberOrUndefined(detail.nom),
      max: numberOrUndefined(detail.max),
      unit: stringValue(detail.unit),
      description: stringValue(detail.description),
      Temperature: normalizeTemperature(detail.Temperature)
    })),
    Chemistry: {
      positive_electrode: (item.Chemistry?.positive_electrode || []).map((part) => ({
        name: stringValue(part.name),
        cas_no: stringValue(part.cas_no),
        weight: numberOrUndefined(part.weight)
      })),
      negative_electrode: (item.Chemistry?.negative_electrode || []).map((part) => ({
        name: stringValue(part.name),
        cas_no: stringValue(part.cas_no),
        weight: numberOrUndefined(part.weight)
      })),
      electrolyte: (item.Chemistry?.electrolyte || []).map((part) => ({
        name: stringValue(part.name),
        cas_no: stringValue(part.cas_no),
        weight: numberOrUndefined(part.weight)
      })),
      unit: stringValue(item.Chemistry?.unit),
      description: stringValue(item.Chemistry?.description)
    }
  })
  const normalizeCertification = (item: Partial<Certification>): Certification => ({
    CertName: stringValue(item.CertName),
    CertificateNo: stringValue(item.CertificateNo),
    CertificationBody: stringValue(item.CertificationBody),
    StartDate: stringValue(item.StartDate),
    EndDate: stringValue(item.EndDate),
    CertLink: stringValue(item.CertLink)
  })
  const normalizeMaterialItem = (item: Partial<MaterialItem>): MaterialItem => ({
    ...createMaterialItem(),
    ...item,
    CompositionType: stringValue(item.CompositionType),
    composition: stringValue(item.composition),
    weight: numberOrUndefined(item.weight),
    unit: stringValue(item.unit),
    error_value: numberOrUndefined(item.error_value),
    parts: stringValue(item.parts),
    consumer_time: stringValue(item.consumer_time),
    cas_no: stringValue(item.cas_no),
    clp_index_no: stringValue(item.clp_index_no),
    hazard_class_and_category_code: stringValue(item.hazard_class_and_category_code),
    concentration_range: stringValue(item.concentration_range),
    origin_country: stringValue(item.origin_country),
    supplier: stringValue(item.supplier)
  })

  const next: PassportPayload = {
    DPP: [
      {
        ...defaults.DPP[0]!,
        UID: sourceDpp?.UID,
        DPPID: sourceDpp?.DPPID,
        DPPClass: 1,
        DPPSubClass: numberOrUndefined(sourceDpp?.DPPSubClass),
        PassportStartDate: stringValue(sourceDpp?.PassportStartDate),
        PassportEndDate: stringValue(sourceDpp?.PassportEndDate),
        SerialNo: stringValue(sourceDpp?.SerialNo),
        MftDate: stringValue(sourceDpp?.MftDate),
        WarrantyDate: stringValue(sourceDpp?.WarrantyDate),
        DPPSource: numberOrUndefined(sourceDpp?.DPPSource) ?? defaults.DPP[0]!.DPPSource,
        DPPStatus: numberOrUndefined(sourceDpp?.DPPStatus) ?? stringValue(sourceDpp?.DPPStatus),
        ProdCycleStatus: numberOrUndefined(sourceDpp?.ProdCycleStatus)
      }
    ],
    DPPInfo: {
      ...defaults.DPPInfo,
      ...sourceInfo,
      CCCCode: stringValue(sourceInfo.CCCCode ?? sourceProduct.CCCCode)
    },
    ProductInfo: {
      ...defaults.ProductInfo,
      ProdInfoID: sourceProduct.ProdInfoID,
      ProdName: stringValue(sourceProduct.ProdName),
      Model: stringValue(sourceProduct.Model),
      FID: stringValue(sourceProduct.FID),
      Description: stringValue(sourceProduct.Description),
      ProdInfoLink: stringArray(sourceProduct.ProdInfoLink, [
        'ProdWebPageLink',
        'ProductManualLink',
        'MaintenanceManualLink'
      ]),
      ProdPhoto: stringArray(sourceProduct.ProdPhoto, ['imgOne', 'imgTwo', 'imgThree']).filter(
        Boolean
      ),
      CFPDate: stringValue(sourceProduct.CFPDate),
      CFPValue: numberOrUndefined(sourceProduct.CFPValue),
      CFPEmissionUnit: stringValue(sourceProduct.CFPEmissionUnit),
      CFPFunctionUnit: stringValue(sourceProduct.CFPFunctionUnit),
      SpecInfo: (sourceProduct.SpecInfo || []).map(normalizeSpecification)
    },
    MandatoryCertification: (source.MandatoryCertification || []).map(normalizeCertification),
    VoluntaryCertification: (source.VoluntaryCertification || []).map(normalizeCertification),
    Material: (source.Material || []).map((block) => ({
      MaterType: numberOrUndefined(block.MaterType) ?? 0,
      Description: stringValue(block.Description),
      material: (block.material || block.Material || []).map(normalizeMaterialItem)
    })),
    PEFInfo: (source.PEFInfo || []).map((item) => ({
      AssessmentDate: stringValue(item.AssessmentDate),
      ImpactCategory: stringValue(item.ImpactCategory),
      LifeCycleStage: stringValue(item.LifeCycleStage),
      CharacterizationResult: numberOrUndefined(item.CharacterizationResult),
      NormalizationResult: numberOrUndefined(item.NormalizationResult),
      WeightingResult: numberOrUndefined(item.WeightingResult),
      Unit: stringValue(item.Unit),
      Description: stringValue(item.Description)
    })),
    TradeMark: (source.TradeMark || []).map((item) => ({
      ApplicationNumber: stringValue(item.ApplicationNumber),
      TrademarkOffice: stringValue(item.TrademarkOffice),
      TrademarkName: stringValue(item.TrademarkName),
      TradeMarkLink: stringValue(item.TradeMarkLink),
      StartDate: stringValue(item.StartDate),
      EndDate: stringValue(item.EndDate),
      country_code_id: stringValue(item.country_code_id),
      Subdivision: stringValue(item.Subdivision)
    })),
    product_repair: (source.RepairRecord || []).flatMap((record) =>
      (record.repair_info || []).map((info) => ({
        repair_date: stringValue(record.repair_date),
        repair_delivery_date: stringValue(record.repair_delivery_date),
        repair_type: numberOrUndefined(info.repair_type),
        component_name: stringValue(info.component_name),
        action_date: stringValue(info.action_date),
        action_area: stringValue(info.action_area),
        description: stringValue(info.description)
      }))
    ),
    product_recycle: (source.RecycleRecord || []).map((item) => ({
      recycle_date: stringValue(item.recycle_date),
      recycle_type: numberOrUndefined(item.recycle_type),
      recycle_addr_type: numberOrUndefined(item.recycle_addr_type),
      recycle_addr: stringValue(item.recycle_addr),
      execution_dec: stringValue(item.execution_dec),
      completed_date: stringValue(item.completed_date)
    }))
  }

  if (!next.ProductInfo.ProdInfoLink.length)
    next.ProductInfo.ProdInfoLink = [...defaults.ProductInfo.ProdInfoLink]
  if (!next.ProductInfo.ProdPhoto.length)
    next.ProductInfo.ProdPhoto = [...defaults.ProductInfo.ProdPhoto]
  for (const type of [1, 2, 3, 5, 6]) {
    if (!next.Material.some((item) => item.MaterType === type))
      next.Material.push(createMaterial(type))
  }
  return next
}
