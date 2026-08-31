import { computed } from 'vue'
import { useI18n } from 'vue-i18n'
import parametersData from '@/data/parameters.json'
import countriesData from '@/data/countries.json'
import type {
  CountryOption,
  ParameterGroup,
  ParameterMap,
  ParameterOption
} from '@/types/parameter'

const parameters = parametersData as ParameterMap
const countries = countriesData as CountryOption[]

export const useOptions = () => {
  const { locale } = useI18n()
  const parameterLabel = (option: ParameterOption) =>
    locale.value === 'en' ? option.param_en_name : option.param_name
  const countryLabel = (option: CountryOption) =>
    locale.value === 'en' ? option.country_name_en : option.country_name_zh
  const options = (group: ParameterGroup) => parameters[group]
  const parameterName = (group: ParameterGroup, code: string | number | undefined) => {
    const match = parameters[group].find((item) => item.code === String(code ?? ''))
    return match ? parameterLabel(match) : '—'
  }
  return {
    options,
    parameterLabel,
    parameterName,
    countryLabel,
    countries: computed(() =>
      [...countries].sort((a, b) =>
        countryLabel(a).localeCompare(countryLabel(b), locale.value === 'en' ? 'en' : 'zh-Hant')
      )
    )
  }
}
