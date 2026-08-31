<script setup lang="ts">
import { useOptions } from '@/composables/useOptions'
import type { PassportPayload } from '@/types/passport'

defineProps<{ disabled: boolean }>()
const model = defineModel<PassportPayload>({ required: true })
const { options, parameterLabel } = useOptions()
</script>

<template>
  <div class="tab-panel">
    <div class="section-action">
      <div>
        <h2>{{ $t('tabs.recycle') }}</h2>
        <p>RECYCLE / DISPOSAL LOG</p>
      </div>
    </div>
    <p class="field-hint">{{ $t('passport.recordImportOnly') }}</p>
    <p v-if="!model.product_recycle.length" class="empty-state">{{ $t('common.noData') }}</p>
    <section v-for="(item, index) in model.product_recycle" :key="index" class="form-section">
      <header>
        <span>{{ String(index + 1).padStart(2, '0') }}</span>
        <div>
          <h2>{{ $t('tabs.recycle') }} {{ index + 1 }}</h2>
        </div>
      </header>
      <div class="form-grid cols-3">
        <el-form-item :label="$t('fields.recycleDate')"
          ><el-date-picker
            v-model="item.recycle_date"
            :disabled="true"
            type="date"
            value-format="YYYY-MM-DD" /></el-form-item
        ><el-form-item :label="$t('fields.recycleType')"
          ><el-select v-model="item.recycle_type" :disabled="true"
            ><el-option
              v-for="option in options('recycle_type')"
              :key="option.code"
              :label="parameterLabel(option)"
              :value="Number(option.code)" /></el-select></el-form-item
        ><el-form-item :label="$t('fields.addressType')"
          ><el-radio-group v-model="item.recycle_addr_type" :disabled="true"
            ><el-radio :value="1">{{ $t('fields.companyAddress') }}</el-radio
            ><el-radio :value="2">{{ $t('fields.customAddress') }}</el-radio></el-radio-group
          ></el-form-item
        ><el-form-item
          v-if="item.recycle_addr_type === 2"
          class="span-3"
          :label="$t('fields.address')"
          ><el-input v-model="item.recycle_addr" :disabled="true" maxlength="1024" /></el-form-item
        ><el-form-item class="span-3" :label="$t('fields.execution')"
          ><el-input v-model="item.execution_dec" :disabled="true" type="textarea" /></el-form-item
        ><el-form-item :label="$t('fields.completedDate')"
          ><el-date-picker
            v-model="item.completed_date"
            :disabled="true"
            type="date"
            value-format="YYYY-MM-DD"
        /></el-form-item>
      </div>
    </section>
  </div>
</template>
