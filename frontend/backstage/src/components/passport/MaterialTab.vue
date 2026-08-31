<script setup lang="ts">
import { computed } from 'vue'
import { Plus, Delete } from '@element-plus/icons-vue'
import { useOptions } from '@/composables/useOptions'
import { createMaterial, createMaterialItem } from '@/utils/passport'
import type { PassportPayload } from '@/types/passport'

defineProps<{ disabled: boolean }>()
const model = defineModel<PassportPayload>({ required: true })
const { options, parameterLabel, countryLabel, countries } = useOptions()
const materialTypes = computed(() => options('MaterType'))
const typeCount = (type: number) =>
  model.value.Material.filter((item) => item.MaterType === type).length
const addBlock = (type: number) => model.value.Material.push(createMaterial(type))
const removeBlock = (index: number) => {
  if (typeCount(model.value.Material[index]!.MaterType) > 1) model.value.Material.splice(index, 1)
}
</script>

<template>
  <div class="tab-panel form-sections">
    <div class="material-toolbar panel">
      <strong>{{ $t('validation.materialRequired') }}</strong>
      <div v-if="!disabled">
        <el-button
          v-for="type in materialTypes"
          :key="type.code"
          size="small"
          :icon="Plus"
          @click="addBlock(Number(type.code))"
          >{{ parameterLabel(type) }}</el-button
        >
      </div>
    </div>
    <section
      v-for="(block, blockIndex) in model.Material"
      :key="`${block.MaterType}-${blockIndex}`"
      class="form-section material-section"
    >
      <header>
        <span>{{ block.MaterType }}</span>
        <div>
          <small>MATERIAL TYPE</small>
          <h2>
            {{
              parameterLabel(materialTypes.find((item) => Number(item.code) === block.MaterType)!)
            }}
          </h2>
        </div>
        <el-button
          v-if="!disabled && typeCount(block.MaterType) > 1"
          text
          type="danger"
          :icon="Delete"
          @click="removeBlock(blockIndex)"
          >{{ $t('common.removeItem') }}</el-button
        >
      </header>
      <el-form-item :label="$t('common.note')"
        ><el-input v-model="block.Description" :disabled="disabled" type="textarea" :rows="2"
      /></el-form-item>
      <div
        v-for="(item, itemIndex) in block.material"
        :key="itemIndex"
        class="nested-card material-item"
      >
        <div class="subsection-title">
          <h3>{{ $t('common.item') }} {{ itemIndex + 1 }}</h3>
          <el-button
            v-if="!disabled && block.material.length > 1"
            circle
            :icon="Delete"
            :aria-label="$t('common.removeItem')"
            @click="block.material.splice(itemIndex, 1)"
          />
        </div>
        <div class="form-grid cols-4">
          <el-form-item :label="$t('fields.CompositionType')" required
            ><el-select v-model="item.CompositionType" :disabled="disabled"
              ><el-option
                v-for="option in options('CompositionType')"
                :key="option.code"
                :label="parameterLabel(option)"
                :value="option.code" /></el-select></el-form-item
          ><el-form-item :label="$t('fields.composition')" required
            ><el-input v-model="item.composition" :disabled="disabled" /></el-form-item
          ><el-form-item :label="$t('fields.weight')" required
            ><el-input-number v-model="item.weight" :disabled="disabled" :min="0" /></el-form-item
          ><el-form-item :label="$t('common.unit')" required
            ><el-input v-model="item.unit" :disabled="disabled" /></el-form-item
          ><el-form-item :label="$t('fields.errorValue')" required
            ><el-input-number
              v-model="item.error_value"
              :disabled="disabled"
              :min="0" /></el-form-item
          ><el-form-item :label="$t('fields.parts')"
            ><el-input v-model="item.parts" :disabled="disabled" /></el-form-item
          ><el-form-item :label="$t('fields.consumerTime')"
            ><el-input v-model="item.consumer_time" :disabled="disabled" /></el-form-item
          ><el-form-item :label="$t('fields.casNo')"
            ><el-input v-model="item.cas_no" :disabled="disabled"
          /></el-form-item>
          <template v-if="[3, 6].includes(block.MaterType)"
            ><el-form-item :label="$t('fields.clpNo')"
              ><el-input v-model="item.clp_index_no" :disabled="disabled" /></el-form-item
            ><el-form-item :label="$t('fields.hazardCode')"
              ><el-input
                v-model="item.hazard_class_and_category_code"
                :disabled="disabled" /></el-form-item
            ><el-form-item :label="$t('fields.concentration')"
              ><el-input v-model="item.concentration_range" :disabled="disabled" /></el-form-item
          ></template>
          <template v-if="[2, 5].includes(block.MaterType)"
            ><el-form-item :label="$t('fields.originCountry')"
              ><el-select v-model="item.origin_country" :disabled="disabled" filterable clearable
                ><el-option
                  v-for="country in countries"
                  :key="country.country_code_id"
                  :label="`${country.country_code} · ${countryLabel(country)}`"
                  :value="country.country_code" /></el-select></el-form-item
            ><el-form-item :label="$t('fields.supplier')"
              ><el-input v-model="item.supplier" :disabled="disabled" /></el-form-item
          ></template>
        </div>
      </div>
      <el-button v-if="!disabled" :icon="Plus" @click="block.material.push(createMaterialItem())">{{
        $t('common.addItem')
      }}</el-button>
    </section>
  </div>
</template>
