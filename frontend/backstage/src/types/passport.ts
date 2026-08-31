export interface TemperatureRange {
  min?: number
  max?: number
  unit: string
  description: string
}

export interface SpecificationDetail {
  value: string
  unit: string
  description: string
  Temperature?: TemperatureRange
}

export interface VoltageDetail {
  min?: number
  nom?: number
  max?: number
  unit: string
  description: string
  Temperature: TemperatureRange
}

export interface ChemistryItem {
  name: string
  cas_no: string
  weight?: number
}
export interface ChemistryInfo {
  positive_electrode: ChemistryItem[]
  negative_electrode: ChemistryItem[]
  electrolyte: ChemistryItem[]
  unit: string
  description: string
}

export interface SpecificationInfo {
  SpecInfo_Type: string
  Details: SpecificationDetail[]
  Voltage: VoltageDetail[]
  Chemistry: ChemistryInfo
}

export interface DPP {
  UID?: string
  DPPID?: string
  DPPClass: number
  DPPSubClass?: number
  PassportStartDate: string
  PassportEndDate: string
  SerialNo: string
  MftDate: string
  WarrantyDate: string
  ProdCycleStatus?: number
  DPPSource: number
  DPPStatus: string | number
}

export interface DPPInfo {
  GTIN: string
  SSCC: string
  BatchLot: string
  TARIC: string
  CCCCode: string
  UniqueFacilityIdentifierDUNS: string
  UniqueFacilityIdentifierGLN: string
  OrigIn: string
}

export interface ProductInfo {
  ProdInfoID?: string
  ProdName: string
  Model: string
  FID: string
  Description: string
  ProdInfoLink: string[]
  ProdPhoto: string[]
  CFPDate: string
  CFPValue?: number
  CFPEmissionUnit: string
  CFPFunctionUnit: string
  SpecInfo: SpecificationInfo[]
}

export interface Certification {
  CertName: string
  CertificateNo: string
  CertificationBody: string
  StartDate: string
  EndDate: string
  CertLink: string
}

export interface MaterialItem {
  CompositionType: string
  composition: string
  weight?: number
  unit: string
  error_value?: number
  parts: string
  consumer_time: string
  cas_no: string
  clp_index_no: string
  hazard_class_and_category_code: string
  concentration_range: string
  origin_country: string
  supplier: string
}

export interface Material {
  MaterType: number
  Description: string
  material: MaterialItem[]
}

export interface PEFInfo {
  AssessmentDate: string
  ImpactCategory: string
  LifeCycleStage: string
  CharacterizationResult?: number
  NormalizationResult?: number
  WeightingResult?: number
  Unit: string
  Description: string
}

export interface TradeMark {
  ApplicationNumber: string
  TrademarkOffice: string
  TrademarkName: string
  TradeMarkLink: string
  StartDate: string
  EndDate: string
  country_code_id: string
  Subdivision: string
}

export interface ProductRepair {
  repair_date: string
  repair_delivery_date: string
  repair_type?: number
  component_name: string
  action_date: string
  action_area: string
  description: string
}

export interface ProductRecycle {
  recycle_date: string
  recycle_type?: number
  recycle_addr_type?: number
  recycle_addr: string
  execution_dec: string
  completed_date: string
}

export interface PassportPayload {
  DPP: DPP[]
  DPPInfo: DPPInfo
  ProductInfo: ProductInfo
  MandatoryCertification: Certification[]
  VoluntaryCertification: Certification[]
  Material: Material[]
  PEFInfo: PEFInfo[]
  TradeMark: TradeMark[]
  product_repair: ProductRepair[]
  product_recycle: ProductRecycle[]
}

export interface PassportDetailProductInfo extends Partial<
  Omit<ProductInfo, 'ProdInfoLink' | 'ProdPhoto'>
> {
  CCCCode?: string
  ProdInfoLink?: string[] | Record<string, string>
  ProdPhoto?: string[] | Record<string, string> | string
}

export interface PassportDetailMaterial extends Partial<Omit<Material, 'material'>> {
  Material?: MaterialItem[]
  material?: MaterialItem[]
}

export interface RepairInfoItem {
  repair_type?: number | string
  component_name?: string
  action_date?: string
  action_area?: string
  description?: string
}

export interface PassportRepairRecord {
  repair_date?: string
  repair_delivery_date?: string
  repair_info?: RepairInfoItem[]
  importedAt?: string
}

export interface PassportRecycleRecord extends Partial<ProductRecycle> {
  importedAt?: string
}

export interface PassportDetailResponse extends Partial<Omit<DPP, 'DPPStatus'>> {
  DPPStatus?: string | number
  EORIID?: string
  createdAt?: string
  updatedAt?: string
  DPP?: DPP | DPP[]
  DPPInfo?: Partial<DPPInfo>
  ProductInfo?: PassportDetailProductInfo
  MandatoryCertification?: Partial<Certification>[]
  VoluntaryCertification?: Partial<Certification>[]
  RepairabilityIndex?: unknown[]
  Material?: PassportDetailMaterial[]
  PEFInfo?: Partial<PEFInfo>[]
  TradeMark?: Partial<TradeMark>[]
  RepairRecord?: PassportRepairRecord[]
  RecycleRecord?: PassportRecycleRecord[]
}

export interface PassportEntryError {
  index: number
  UID?: string
  error: string
}

export interface PassportCreateResult {
  created: PassportDetailResponse[]
  errors: PassportEntryError[]
}

export interface PassportImportResult {
  created?: PassportDetailResponse[]
  imported?: unknown[]
  errors: PassportEntryError[]
}

export interface PassportListItem {
  UID: string
  DPPClass: number | null
  DPPSubClass: number | null
  SerialNo: string
  Model: string | null
  ProdName: string | null
  PassportStartDate: string | null
  DPPStatus: number
  createdAt: string
  updatedAt: string
}
