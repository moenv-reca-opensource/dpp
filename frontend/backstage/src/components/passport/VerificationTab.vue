<script setup lang="ts">
import { Plus, Delete } from '@element-plus/icons-vue'
import { useOptions } from '@/composables/useOptions'
import { createCertification } from '@/utils/passport'
import type { PassportPayload } from '@/types/passport'

defineProps<{ disabled: boolean }>()
const model = defineModel<PassportPayload>({ required: true })
const { options, parameterLabel } = useOptions()
</script>

<template>
  <div class="tab-panel form-sections">
    <section
      v-for="section in ['MandatoryCertification', 'VoluntaryCertification'] as const"
      :key="section"
      class="form-section"
    >
      <header>
        <span>{{ section === 'MandatoryCertification' ? 'M' : 'V' }}</span>
        <div>
          <h2>
            {{ $t(section === 'MandatoryCertification' ? 'fields.mandatory' : 'fields.voluntary') }}
          </h2>
          <p>CERTIFICATION RECORDS</p>
        </div>
        <el-button
          v-if="!disabled"
          :icon="Plus"
          @click="model[section].push(createCertification())"
          >{{ $t('common.addItem') }}</el-button
        >
      </header>
      <p v-if="!model[section].length" class="empty-state">{{ $t('common.noData') }}</p>
      <div v-for="(item, index) in model[section]" :key="index" class="nested-card removable-card">
        <div class="card-index">{{ String(index + 1).padStart(2, '0') }}</div>
        <div class="form-grid cols-3">
          <el-form-item :label="$t('fields.CertName')" required
            ><el-select v-model="item.CertName" :disabled="disabled"
              ><el-option
                v-for="option in options(
                  section === 'MandatoryCertification' ? 'MCertName' : 'VCertName'
                )"
                :key="option.code"
                :label="parameterLabel(option)"
                :value="option.code" /></el-select></el-form-item
          ><el-form-item :label="$t('fields.CertificateNo')" required
            ><el-input v-model="item.CertificateNo" :disabled="disabled" /></el-form-item
          ><el-form-item :label="$t('fields.CertificationBody')" required
            ><el-input v-model="item.CertificationBody" :disabled="disabled" /></el-form-item
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
          ><el-form-item :label="$t('fields.CertLink')"
            ><el-input v-model="item.CertLink" :disabled="disabled" type="url"
          /></el-form-item>
        </div>
        <el-button
          v-if="!disabled"
          class="remove-card"
          circle
          :icon="Delete"
          :aria-label="$t('common.removeItem')"
          @click="model[section].splice(index, 1)"
        />
      </div>
    </section>
  </div>
</template>
