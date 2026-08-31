export interface ParameterOption {
  code: string
  param_name: string
  param_en_name: string
  param_purpose?: string
}

export type ParameterGroup =
  | 'DPPClass'
  | 'DPPSubClass'
  | 'DPPSource'
  | 'DPPStatus'
  | 'ProdCycleStatus'
  | 'MCertName'
  | 'VCertName'
  | 'MaterType'
  | 'CompositionType'
  | 'SpecInfoType'
  | 'ImpactCategory'
  | 'LifeCycleStage'
  | 'repair_type'
  | 'recycle_type'

export type ParameterMap = Record<ParameterGroup, ParameterOption[]>

export interface CountryOption {
  country_code_id: string
  country_code: string
  country_name_zh: string
  country_name_en: string
}
