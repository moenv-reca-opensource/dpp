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
        <h2>{{ $t('tabs.repair') }}</h2>
        <p>REPAIR / REPLACEMENT LOG</p>
      </div>
    </div>
    <p class="field-hint">{{ $t('passport.recordImportOnly') }}</p>
    <p v-if="!model.product_repair.length" class="empty-state">{{ $t('common.noData') }}</p>
    <section v-for="(item, index) in model.product_repair" :key="index" class="form-section">
      <header>
        <span>{{ String(index + 1).padStart(2, '0') }}</span>
        <div>
          <h2>{{ item.component_name || $t('tabs.repair') }}</h2>
        </div>
      </header>
      <div class="form-grid cols-3">
        <el-form-item :label="$t('fields.repairDate')"
          ><el-date-picker
            v-model="item.repair_date"
            :disabled="true"
            type="date"
            value-format="YYYY-MM-DD" /></el-form-item
        ><el-form-item :label="$t('fields.deliveryDate')"
          ><el-date-picker
            v-model="item.repair_delivery_date"
            :disabled="true"
            type="date"
            value-format="YYYY-MM-DD" /></el-form-item
        ><el-form-item :label="$t('fields.repairType')"
          ><el-select v-model="item.repair_type" :disabled="true"
            ><el-option
              v-for="option in options('repair_type')"
              :key="option.code"
              :label="parameterLabel(option)"
              :value="Number(option.code)" /></el-select></el-form-item
        ><el-form-item :label="$t('fields.componentName')"
          ><el-input v-model="item.component_name" :disabled="true" /></el-form-item
        ><el-form-item :label="$t('fields.actionDate')"
          ><el-date-picker
            v-model="item.action_date"
            :disabled="true"
            type="datetime"
            value-format="YYYY-MM-DD" /></el-form-item
        ><el-form-item :label="$t('fields.actionArea')"
          ><el-input v-model="item.action_area" :disabled="true" /></el-form-item
        ><el-form-item class="span-3" :label="$t('common.description')"
          ><el-input v-model="item.description" :disabled="true" type="textarea"
        /></el-form-item>
      </div>
    </section>
  </div>
</template>
