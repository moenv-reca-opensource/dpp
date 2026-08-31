<script setup lang="ts">
import { Plus, Delete } from '@element-plus/icons-vue'
import { useOptions } from '@/composables/useOptions'
import { createTradeMark } from '@/utils/passport'
import type { PassportPayload } from '@/types/passport'

defineProps<{ disabled: boolean }>()
const model = defineModel<PassportPayload>({ required: true })
const { countries, countryLabel } = useOptions()
</script>

<template>
  <div class="tab-panel">
    <div class="section-action">
      <div>
        <h2>{{ $t('tabs.trademark') }}</h2>
        <p>TRADEMARK REGISTRY</p>
      </div>
      <el-button
        v-if="!disabled"
        type="primary"
        :icon="Plus"
        @click="model.TradeMark.push(createTradeMark())"
        >{{ $t('common.addItem') }}</el-button
      >
    </div>
    <p v-if="!model.TradeMark.length" class="empty-state">{{ $t('common.noData') }}</p>
    <section
      v-for="(item, index) in model.TradeMark"
      :key="index"
      class="form-section removable-card"
    >
      <header>
        <span>{{ String(index + 1).padStart(2, '0') }}</span>
        <div>
          <h2>{{ item.TrademarkName || $t('tabs.trademark') }}</h2>
        </div>
      </header>
      <div class="form-grid cols-3">
        <el-form-item :label="$t('fields.ApplicationNumber')" required
          ><el-input v-model="item.ApplicationNumber" :disabled="disabled" /></el-form-item
        ><el-form-item :label="$t('fields.TrademarkOffice')" required
          ><el-input v-model="item.TrademarkOffice" :disabled="disabled" /></el-form-item
        ><el-form-item :label="$t('fields.TrademarkName')" required
          ><el-input v-model="item.TrademarkName" :disabled="disabled" /></el-form-item
        ><el-form-item :label="$t('fields.TradeMarkLink')"
          ><el-input v-model="item.TradeMarkLink" :disabled="disabled" type="url" /></el-form-item
        ><el-form-item :label="$t('fields.StartDate')" required
          ><el-date-picker
            v-model="item.StartDate"
            :disabled="disabled"
            type="date"
            value-format="YYYY-MM-DD" /></el-form-item
        ><el-form-item :label="$t('fields.EndDate')"
          ><el-date-picker
            v-model="item.EndDate"
            :disabled="disabled"
            type="date"
            value-format="YYYY-MM-DD" /></el-form-item
        ><el-form-item :label="$t('fields.country')" required
          ><el-select v-model="item.country_code_id" :disabled="disabled" filterable
            ><el-option
              v-for="country in countries"
              :key="country.country_code_id"
              :label="`${country.country_code} · ${countryLabel(country)}`"
              :value="country.country_code_id" /></el-select></el-form-item
        ><el-form-item :label="$t('fields.Subdivision')"
          ><el-input v-model="item.Subdivision" :disabled="disabled" maxlength="3" />
          <p class="field-hint">{{ $t('fields.subdivisionHint') }}</p></el-form-item
        >
      </div>
      <el-button
        v-if="!disabled"
        class="remove-card"
        circle
        :icon="Delete"
        :aria-label="$t('common.removeItem')"
        @click="model.TradeMark.splice(index, 1)"
      />
    </section>
  </div>
</template>
