<script setup lang="ts">
import { computed, ref } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { useOptions } from '@/composables/useOptions'
import {
  createDetail,
  createSpecification,
  createTemperature,
  createVoltage
} from '@/utils/passport'
import type { ChemistryItem, PassportPayload } from '@/types/passport'

const model = defineModel<PassportPayload>({ required: true })
defineProps<{ disabled: boolean }>()
const { options, parameterLabel } = useOptions()
const selectedType = ref('')
const chemistryField = {
  positive_electrode: 'positive',
  negative_electrode: 'negative',
  electrolyte: 'electrolyte'
} as const
const available = computed(() =>
  options('SpecInfoType').filter(
    (option) => !model.value.ProductInfo.SpecInfo.some((spec) => spec.SpecInfo_Type === option.code)
  )
)
const addSpecification = () => {
  if (!selectedType.value) return
  const type = selectedType.value
  model.value.ProductInfo.SpecInfo.push(createSpecification(type))
  selectedType.value = ''
}
const label = (code: string) => {
  const item = options('SpecInfoType').find((option) => option.code === code)
  return item ? parameterLabel(item) : code
}
const addChemistry = (list: ChemistryItem[]) => {
  list.push({ name: '', cas_no: '', weight: undefined })
}
</script>

<template>
  <div class="tab-panel">
    <div v-if="!disabled" class="panel spec-adder">
      <el-select
        v-model="selectedType"
        filterable
        :placeholder="$t('fields.specType')"
        :aria-label="$t('fields.specType')"
        ><el-option
          v-for="item in available"
          :key="item.code"
          :label="`${item.code} · ${parameterLabel(item)}`"
          :value="item.code" /></el-select
      ><el-button type="primary" :icon="Plus" :disabled="!selectedType" @click="addSpecification">{{
        $t('common.add')
      }}</el-button>
    </div>
    <p v-if="!model.ProductInfo.SpecInfo.length" class="empty-state">
      {{ disabled ? $t('common.noData') : $t('validation.specRequired') }}
    </p>
    <section
      v-for="(spec, specIndex) in model.ProductInfo.SpecInfo"
      :key="spec.SpecInfo_Type"
      class="form-section spec-card"
    >
      <header>
        <span>{{ String(specIndex + 1).padStart(2, '0') }}</span>
        <div>
          <small>{{ spec.SpecInfo_Type }}</small>
          <h2>{{ label(spec.SpecInfo_Type) }}</h2>
        </div>
        <el-button
          v-if="!disabled"
          text
          type="danger"
          :icon="Delete"
          @click="model.ProductInfo.SpecInfo.splice(specIndex, 1)"
          >{{ $t('common.removeItem') }}</el-button
        >
      </header>
      <template v-if="spec.SpecInfo_Type === 'Battery20'">
        <div
          v-for="group in ['positive_electrode', 'negative_electrode', 'electrolyte'] as const"
          :key="group"
          class="chemistry-group"
        >
          <div class="subsection-title">
            <h3>{{ $t(`fields.${chemistryField[group]}`) }}</h3>
            <el-button
              v-if="!disabled"
              size="small"
              :icon="Plus"
              @click="addChemistry(spec.Chemistry[group])"
              >{{ $t('common.addItem') }}</el-button
            >
          </div>
          <div
            v-for="(item, index) in spec.Chemistry[group]"
            :key="index"
            class="form-grid chemistry-row"
          >
            <el-form-item :label="$t('common.name')" required
              ><el-input v-model="item.name" :disabled="disabled" /></el-form-item
            ><el-form-item :label="$t('fields.casNo')" required
              ><el-input v-model="item.cas_no" :disabled="disabled" /></el-form-item
            ><el-form-item :label="$t('fields.weight')" required
              ><el-input-number v-model="item.weight" :disabled="disabled" :min="0" /></el-form-item
            ><el-button
              v-if="!disabled"
              circle
              :icon="Delete"
              :aria-label="$t('common.removeItem')"
              @click="spec.Chemistry[group].splice(index, 1)"
            />
          </div>
        </div>
        <div class="form-grid cols-2">
          <el-form-item :label="$t('common.unit')" required
            ><el-input v-model="spec.Chemistry.unit" :disabled="disabled" /></el-form-item
          ><el-form-item :label="$t('common.description')"
            ><el-input v-model="spec.Chemistry.description" :disabled="disabled"
          /></el-form-item>
        </div>
      </template>
      <template v-else-if="spec.SpecInfo_Type === 'Battery25'">
        <div v-for="(voltage, index) in spec.Voltage" :key="index" class="nested-card">
          <div class="form-grid cols-4">
            <el-form-item :label="$t('fields.minimum')" required
              ><el-input-number v-model="voltage.min" :disabled="disabled" /></el-form-item
            ><el-form-item :label="$t('fields.nominal')" required
              ><el-input-number v-model="voltage.nom" :disabled="disabled" /></el-form-item
            ><el-form-item :label="$t('fields.maximum')" required
              ><el-input-number v-model="voltage.max" :disabled="disabled" /></el-form-item
            ><el-form-item :label="$t('common.unit')" required
              ><el-input v-model="voltage.unit" :disabled="disabled"
            /></el-form-item>
          </div>
          <div class="temperature-row">
            <strong>{{ $t('fields.temperature') }}</strong
            ><el-input-number
              v-model="voltage.Temperature.min"
              :disabled="disabled"
              :placeholder="$t('fields.minimum')"
            /><el-input-number
              v-model="voltage.Temperature.max"
              :disabled="disabled"
              :placeholder="$t('fields.maximum')"
            /><el-input v-model="voltage.Temperature.unit" :disabled="disabled" />
          </div>
        </div>
        <el-button v-if="!disabled" :icon="Plus" @click="spec.Voltage.push(createVoltage())">{{
          $t('common.addItem')
        }}</el-button>
      </template>
      <template v-else>
        <div v-for="(detail, index) in spec.Details" :key="index" class="nested-card">
          <div class="form-grid cols-3">
            <el-form-item :label="$t('common.value')" required
              ><el-input v-model="detail.value" :disabled="disabled" /></el-form-item
            ><el-form-item :label="$t('common.unit')" required
              ><el-input v-model="detail.unit" :disabled="disabled" /></el-form-item
            ><el-form-item :label="$t('common.description')"
              ><el-input v-model="detail.description" :disabled="disabled"
            /></el-form-item>
          </div>
          <div v-if="detail.Temperature" class="temperature-row">
            <strong>{{ $t('fields.temperature') }}</strong
            ><el-input-number
              v-model="detail.Temperature.min"
              :disabled="disabled"
              :placeholder="$t('fields.minimum')"
            /><el-input-number
              v-model="detail.Temperature.max"
              :disabled="disabled"
              :placeholder="$t('fields.maximum')"
            /><el-input v-model="detail.Temperature.unit" :disabled="disabled" /><el-button
              v-if="!disabled && spec.Details.length > 1"
              circle
              :icon="Delete"
              :aria-label="$t('common.removeItem')"
              @click="spec.Details.splice(index, 1)"
            />
          </div>
        </div>
        <el-button
          v-if="!disabled"
          :icon="Plus"
          @click="
            spec.Details.push({
              ...createDetail(),
              ...(['Battery26', 'Battery39'].includes(spec.SpecInfo_Type)
                ? { Temperature: createTemperature() }
                : {})
            })
          "
          >{{ $t('common.addItem') }}</el-button
        >
      </template>
    </section>
  </div>
</template>
