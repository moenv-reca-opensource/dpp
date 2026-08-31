<script setup lang="ts">
import { Plus, Delete } from '@element-plus/icons-vue'
import { useOptions } from '@/composables/useOptions'
import type { PassportPayload } from '@/types/passport'

const model = defineModel<PassportPayload>({ required: true })
defineProps<{ disabled: boolean; statusEditable?: boolean }>()
const { options, parameterLabel, countryLabel, countries } = useOptions()

const addLink = () => {
  if (model.value.ProductInfo.ProdInfoLink.length < 3) model.value.ProductInfo.ProdInfoLink.push('')
}
const addPhoto = () => {
  if (model.value.ProductInfo.ProdPhoto.length < 3) model.value.ProductInfo.ProdPhoto.push('')
}
</script>

<template>
  <div class="tab-panel form-sections">
    <section class="form-section">
      <header>
        <span>01</span>
        <div>
          <h2>{{ $t('tabs.basic') }}</h2>
          <p>{{ $t('passport.batteryOnly') }}</p>
        </div>
      </header>
      <div class="form-grid cols-3">
        <el-form-item :label="$t('fields.DPPClass')" required
          ><el-input :model-value="parameterLabel(options('DPPClass')[0]!)" disabled
        /></el-form-item>
        <el-form-item :label="$t('fields.DPPSubClass')" required
          ><el-select v-model="model.DPP[0]!.DPPSubClass" :disabled="disabled"
            ><el-option
              v-for="item in options('DPPSubClass')"
              :key="item.code"
              :label="parameterLabel(item)"
              :value="Number(item.code)" /></el-select
        ></el-form-item>
        <el-form-item :label="$t('fields.DPPStatus')"
          ><el-select v-model="model.DPP[0]!.DPPStatus" :disabled="!statusEditable"
            ><el-option
              v-for="item in options('DPPStatus')"
              :key="item.code"
              :label="parameterLabel(item)"
              :value="Number(item.code)" /></el-select
        ></el-form-item>
        <el-form-item :label="$t('fields.PassportStartDate')" required
          ><el-date-picker
            v-model="model.DPP[0]!.PassportStartDate"
            :disabled="disabled"
            type="date"
            value-format="YYYY-MM-DD"
        /></el-form-item>
        <el-form-item :label="$t('fields.PassportEndDate')"
          ><el-date-picker
            v-model="model.DPP[0]!.PassportEndDate"
            :disabled="disabled"
            type="date"
            value-format="YYYY-MM-DD"
        /></el-form-item>
        <el-form-item :label="$t('passport.SerialNo')" required
          ><el-input
            v-model="model.DPP[0]!.SerialNo"
            :disabled="disabled"
            maxlength="30"
            show-word-limit
        /></el-form-item>
        <el-form-item :label="$t('fields.MftDate')" required
          ><el-date-picker
            v-model="model.DPP[0]!.MftDate"
            :disabled="disabled"
            type="date"
            value-format="YYYY-MM-DD"
        /></el-form-item>
        <el-form-item :label="$t('fields.WarrantyDate')" required
          ><el-date-picker
            v-model="model.DPP[0]!.WarrantyDate"
            :disabled="disabled"
            type="date"
            value-format="YYYY-MM-DD"
        /></el-form-item>
        <el-form-item :label="$t('fields.ProdCycleStatus')" required
          ><el-select v-model="model.DPP[0]!.ProdCycleStatus" :disabled="disabled"
            ><el-option
              v-for="item in options('ProdCycleStatus')"
              :key="item.code"
              :label="parameterLabel(item)"
              :value="Number(item.code)" /></el-select
        ></el-form-item>
        <el-form-item :label="$t('fields.DPPSource')"
          ><el-select v-model="model.DPP[0]!.DPPSource" disabled
            ><el-option
              v-for="item in options('DPPSource')"
              :key="item.code"
              :label="parameterLabel(item)"
              :value="Number(item.code)" /></el-select
        ></el-form-item>
      </div>
    </section>

    <section class="form-section">
      <header>
        <span>02</span>
        <div>
          <h2>DPP INFO</h2>
          <p>Identification &amp; origin</p>
        </div>
      </header>
      <div class="form-grid cols-3">
        <el-form-item :label="$t('fields.GTIN')" required
          ><el-input v-model="model.DPPInfo.GTIN" :disabled="disabled" maxlength="14"
        /></el-form-item>
        <el-form-item :label="$t('fields.SSCC')"
          ><el-input v-model="model.DPPInfo.SSCC" :disabled="disabled" maxlength="18"
        /></el-form-item>
        <el-form-item :label="$t('fields.BatchLot')" required
          ><el-input v-model="model.DPPInfo.BatchLot" :disabled="disabled" maxlength="20"
        /></el-form-item>
        <el-form-item :label="$t('fields.TARIC')"
          ><el-input v-model="model.DPPInfo.TARIC" :disabled="disabled" maxlength="14"
        /></el-form-item>
        <el-form-item :label="$t('fields.CCCCode')"
          ><el-input v-model="model.DPPInfo.CCCCode" :disabled="disabled" maxlength="11"
        /></el-form-item>
        <el-form-item :label="$t('fields.OrigIn')" required
          ><el-select v-model="model.DPPInfo.OrigIn" :disabled="disabled" filterable
            ><el-option
              v-for="item in countries"
              :key="item.country_code_id"
              :label="`${item.country_code} · ${countryLabel(item)}`"
              :value="item.country_code" /></el-select
        ></el-form-item>
        <el-form-item :label="$t('fields.DUNS')"
          ><el-input
            v-model="model.DPPInfo.UniqueFacilityIdentifierDUNS"
            :disabled="disabled"
            maxlength="9"
        /></el-form-item>
        <el-form-item :label="$t('fields.GLN')"
          ><el-input
            v-model="model.DPPInfo.UniqueFacilityIdentifierGLN"
            :disabled="disabled"
            maxlength="13"
        /></el-form-item>
      </div>
    </section>

    <section class="form-section">
      <header>
        <span>03</span>
        <div>
          <h2>PRODUCT</h2>
          <p>Product identity &amp; media</p>
        </div>
      </header>
      <div class="form-grid cols-3">
        <el-form-item :label="$t('passport.ProdName')" required
          ><el-input v-model="model.ProductInfo.ProdName" :disabled="disabled" maxlength="128"
        /></el-form-item>
        <el-form-item :label="$t('fields.Model')" required
          ><el-input v-model="model.ProductInfo.Model" :disabled="disabled" maxlength="128"
        /></el-form-item>
        <el-form-item :label="$t('fields.FID')" required
          ><el-input v-model="model.ProductInfo.FID" :disabled="disabled" maxlength="8"
        /></el-form-item>
        <el-form-item class="span-3" :label="$t('fields.Description')"
          ><el-input
            v-model="model.ProductInfo.Description"
            :disabled="disabled"
            type="textarea"
            :rows="3"
            maxlength="2000"
            show-word-limit
        /></el-form-item>
      </div>
      <div class="subsection-title">
        <h3>{{ $t('fields.ProdInfoLink') }}</h3>
        <el-button
          v-if="!disabled && model.ProductInfo.ProdInfoLink.length < 3"
          size="small"
          :icon="Plus"
          @click="addLink"
          >{{ $t('common.addItem') }}</el-button
        >
      </div>
      <div v-for="(_link, index) in model.ProductInfo.ProdInfoLink" :key="index" class="inline-row">
        <el-form-item :label="`${$t('common.link')} ${index + 1}`"
          ><el-input
            v-model="model.ProductInfo.ProdInfoLink[index]"
            :disabled="disabled"
            type="url" /></el-form-item
        ><el-button
          v-if="!disabled && model.ProductInfo.ProdInfoLink.length > 1"
          circle
          :icon="Delete"
          :aria-label="$t('common.removeItem')"
          @click="model.ProductInfo.ProdInfoLink.splice(index, 1)"
        />
      </div>
      <div class="subsection-title">
        <h3>{{ $t('fields.productImages') }}</h3>
        <el-button
          v-if="!disabled && model.ProductInfo.ProdPhoto.length < 3"
          size="small"
          :icon="Plus"
          @click="addPhoto"
          >{{ $t('common.addItem') }}</el-button
        >
      </div>
      <div v-for="(_photo, index) in model.ProductInfo.ProdPhoto" :key="index" class="inline-row">
        <el-form-item :label="`${$t('fields.productImageUrl')} ${index + 1}`"
          ><el-input
            v-model="model.ProductInfo.ProdPhoto[index]"
            :disabled="disabled"
            type="url"
            aria-describedby="product-image-hint" /></el-form-item
        ><el-button
          v-if="!disabled && model.ProductInfo.ProdPhoto.length > 1"
          circle
          :icon="Delete"
          :aria-label="$t('common.removeItem')"
          @click="model.ProductInfo.ProdPhoto.splice(index, 1)"
        />
      </div>
      <div v-if="model.ProductInfo.ProdPhoto.some(Boolean)" class="stored-images">
        <img
          v-for="(photo, index) in model.ProductInfo.ProdPhoto.filter(Boolean)"
          :key="photo"
          :src="photo"
          :alt="`${model.ProductInfo.ProdName} ${index + 1}`"
        />
      </div>
      <p id="product-image-hint" class="field-hint">
        {{ $t('fields.imageHint') }}
      </p>
      <div class="form-grid cols-3">
        <el-form-item :label="$t('fields.CFPDate')"
          ><el-date-picker
            v-model="model.ProductInfo.CFPDate"
            :disabled="disabled"
            type="date"
            value-format="YYYY-MM-DD"
        /></el-form-item>
        <el-form-item :label="$t('fields.CFPValue')" required
          ><el-input-number
            v-model="model.ProductInfo.CFPValue"
            :disabled="disabled"
            :min="0"
            :precision="4"
        /></el-form-item>
        <el-form-item :label="$t('fields.CFPEmissionUnit')"
          ><el-select v-model="model.ProductInfo.CFPEmissionUnit" :disabled="disabled"
            ><el-option
              v-for="unit in ['g CO2e', 'kg CO2e', 't CO2e']"
              :key="unit"
              :label="unit"
              :value="unit" /></el-select
        ></el-form-item>
        <el-form-item :label="$t('fields.CFPFunctionUnit')" required
          ><el-input
            v-model="model.ProductInfo.CFPFunctionUnit"
            :disabled="disabled"
            maxlength="128"
        /></el-form-item>
      </div>
    </section>
  </div>
</template>
