<script setup lang="ts">
import { Plus, Delete } from '@element-plus/icons-vue'
import { useOptions } from '@/composables/useOptions'
import type { PassportPayload } from '@/types/passport'

defineProps<{ disabled: boolean }>()
const model = defineModel<PassportPayload>({ required: true })
const { options, parameterLabel } = useOptions()
const add = () =>
  model.value.PEFInfo.push({
    AssessmentDate: '',
    ImpactCategory: '',
    LifeCycleStage: '',
    CharacterizationResult: undefined,
    NormalizationResult: undefined,
    WeightingResult: undefined,
    Unit: '',
    Description: ''
  })
</script>

<template>
  <div class="tab-panel">
    <div class="section-action">
      <div>
        <h2>{{ $t('tabs.footprint') }}</h2>
        <p>PRODUCT ENVIRONMENTAL FOOTPRINT</p>
      </div>
      <el-button v-if="!disabled" type="primary" :icon="Plus" @click="add">{{
        $t('common.addItem')
      }}</el-button>
    </div>
    <p v-if="!model.PEFInfo.length" class="empty-state">
      {{ $t('common.noData') }}
    </p>
    <section
      v-for="(item, index) in model.PEFInfo"
      :key="index"
      class="form-section removable-card"
    >
      <header>
        <span>{{ String(index + 1).padStart(2, '0') }}</span>
        <div>
          <h2>{{ $t('tabs.footprint') }}</h2>
        </div>
      </header>
      <div class="form-grid cols-4">
        <el-form-item :label="$t('fields.AssessmentDate')" required
          ><el-date-picker
            v-model="item.AssessmentDate"
            :disabled="disabled"
            type="date"
            value-format="YYYY-MM-DD" /></el-form-item
        ><el-form-item :label="$t('fields.ImpactCategory')" required
          ><el-select v-model="item.ImpactCategory" :disabled="disabled" filterable
            ><el-option
              v-for="option in options('ImpactCategory')"
              :key="option.code"
              :label="parameterLabel(option)"
              :value="option.code" /></el-select></el-form-item
        ><el-form-item :label="$t('fields.LifeCycleStage')" required
          ><el-select v-model="item.LifeCycleStage" :disabled="disabled"
            ><el-option
              v-for="option in options('LifeCycleStage')"
              :key="option.code"
              :label="parameterLabel(option)"
              :value="option.code" /></el-select></el-form-item
        ><el-form-item :label="$t('common.unit')" required
          ><el-input v-model="item.Unit" :disabled="disabled" /></el-form-item
        ><el-form-item :label="$t('fields.CharacterizationResult')" required
          ><el-input-number
            v-model="item.CharacterizationResult"
            :disabled="disabled" /></el-form-item
        ><el-form-item :label="$t('fields.NormalizationResult')"
          ><el-input-number v-model="item.NormalizationResult" :disabled="disabled" /></el-form-item
        ><el-form-item :label="$t('fields.WeightingResult')"
          ><el-input-number v-model="item.WeightingResult" :disabled="disabled" /></el-form-item
        ><el-form-item class="span-4" :label="$t('common.description')"
          ><el-input v-model="item.Description" :disabled="disabled" type="textarea"
        /></el-form-item>
      </div>
      <el-button
        v-if="!disabled"
        class="remove-card"
        circle
        :icon="Delete"
        :aria-label="$t('common.removeItem')"
        @click="model.PEFInfo.splice(index, 1)"
      />
    </section>
  </div>
</template>
