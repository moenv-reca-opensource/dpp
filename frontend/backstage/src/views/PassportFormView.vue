<script setup lang="ts">
import { computed, nextTick, onMounted, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { ArrowLeft, Check } from '@element-plus/icons-vue'
import { addPassport, getPassport, modifyPassport } from '@/api/passport'
import BasicInfoTab from '@/components/passport/BasicInfoTab.vue'
import SpecificationTab from '@/components/passport/SpecificationTab.vue'
import VerificationTab from '@/components/passport/VerificationTab.vue'
import MaterialTab from '@/components/passport/MaterialTab.vue'
import FootprintTab from '@/components/passport/FootprintTab.vue'
import TrademarkTab from '@/components/passport/TrademarkTab.vue'
import RepairTab from '@/components/passport/RepairTab.vue'
import RecycleTab from '@/components/passport/RecycleTab.vue'
import { createPassportPayload, normalizePassportPayload } from '@/utils/passport'
import { isHttpUrl } from '@/utils/validation'
import type { PassportPayload } from '@/types/passport'

type TabName =
  | 'basic'
  | 'specification'
  | 'verification'
  | 'material'
  | 'footprint'
  | 'trademark'
  | 'repair'
  | 'recycle'
interface ValidationFailure {
  tab: TabName
  message: string
}

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const payload = ref<PassportPayload>(createPassportPayload())
const activeTab = ref<TabName>('basic')
const loading = ref(false)
const saving = ref(false)
const mode = computed(() =>
  route.name === 'passport-add' ? 'add' : route.name === 'passport-edit' ? 'edit' : 'detail'
)
const disabled = computed(() => mode.value === 'detail')
const uid = computed(() => String(route.params.uid || ''))
const title = computed(() =>
  t(
    mode.value === 'add'
      ? 'passport.addTitle'
      : mode.value === 'edit'
        ? 'passport.editTitle'
        : 'passport.detailTitle'
  )
)
const langQuery = computed(() => (locale.value === 'en' ? { lang: 'en' } : {}))

const required = (value: unknown) =>
  value !== undefined && value !== null && String(value).trim() !== ''
const validNumber = (value: unknown) => typeof value === 'number' && Number.isFinite(value)
const fail = (tab: TabName, messageKey = 'common.required'): ValidationFailure => {
  return { tab, message: t(messageKey) }
}
const validate = (): ValidationFailure | null => {
  const dpp = payload.value.DPP[0]
  if (
    !dpp ||
    !dpp.DPPSubClass ||
    !dpp.PassportStartDate ||
    !dpp.MftDate ||
    !dpp.WarrantyDate ||
    !dpp.ProdCycleStatus
  )
    return fail('basic')
  if (!/^[^\s]{8,30}$/.test(dpp.SerialNo)) return fail('basic', 'validation.serialLength')
  if (dpp.PassportEndDate && dpp.PassportEndDate < dpp.PassportStartDate)
    return fail('basic', 'validation.dateOrder')
  const info = payload.value.DPPInfo
  if (!required(info.GTIN) || !required(info.BatchLot) || !required(info.OrigIn))
    return fail('basic')
  if (!required(info.TARIC) && !required(info.CCCCode)) return fail('basic', 'validation.oneTariff')
  if (!required(info.UniqueFacilityIdentifierDUNS) && !required(info.UniqueFacilityIdentifierGLN))
    return fail('basic', 'validation.oneFacility')
  const product = payload.value.ProductInfo
  if (!required(product.ProdName) || !required(product.Model) || !required(product.FID))
    return fail('basic')
  if (!validNumber(product.CFPValue) || !required(product.CFPFunctionUnit)) return fail('basic')
  if (product.ProdInfoLink.some((url) => !isHttpUrl(url))) return fail('basic', 'common.invalidUrl')
  if (product.ProdPhoto.some((url) => !isHttpUrl(url))) return fail('basic', 'common.invalidUrl')

  if (!product.SpecInfo.length) return fail('specification', 'validation.specRequired')
  const specTypes = product.SpecInfo.map((item) => item.SpecInfo_Type)
  if (new Set(specTypes).size !== specTypes.length)
    return fail('specification', 'validation.duplicateSpec')
  for (const spec of product.SpecInfo) {
    if (!required(spec.SpecInfo_Type)) return fail('specification', 'validation.specIncomplete')
    if (spec.SpecInfo_Type === 'Battery20') {
      const groups = [
        spec.Chemistry.positive_electrode,
        spec.Chemistry.negative_electrode,
        spec.Chemistry.electrolyte
      ]
      if (
        !required(spec.Chemistry.unit) ||
        groups.some(
          (group) =>
            !group.length ||
            group.some(
              (item) => !required(item.name) || !required(item.cas_no) || !validNumber(item.weight)
            )
        )
      )
        return fail('specification', 'validation.specIncomplete')
    } else if (spec.SpecInfo_Type === 'Battery25') {
      if (
        !spec.Voltage.length ||
        spec.Voltage.some(
          (item) =>
            !validNumber(item.min) ||
            !validNumber(item.nom) ||
            !validNumber(item.max) ||
            !required(item.unit) ||
            !validNumber(item.Temperature.min) ||
            !validNumber(item.Temperature.max) ||
            !required(item.Temperature.unit)
        )
      )
        return fail('specification', 'validation.specIncomplete')
    } else if (
      !spec.Details.length ||
      spec.Details.some(
        (item) =>
          !required(item.value) ||
          !required(item.unit) ||
          (['Battery26', 'Battery39'].includes(spec.SpecInfo_Type) &&
            (!item.Temperature ||
              !validNumber(item.Temperature.min) ||
              !validNumber(item.Temperature.max) ||
              !required(item.Temperature.unit)))
      )
    )
      return fail('specification', 'validation.specIncomplete')
  }

  for (const section of [
    payload.value.MandatoryCertification,
    payload.value.VoluntaryCertification
  ]) {
    for (const item of section)
      if (
        !required(item.CertName) ||
        !required(item.CertificateNo) ||
        !required(item.CertificationBody) ||
        !required(item.StartDate) ||
        !isHttpUrl(item.CertLink) ||
        (item.EndDate && item.EndDate < item.StartDate)
      )
        return fail(
          'verification',
          item.EndDate && item.EndDate < item.StartDate ? 'validation.dateOrder' : 'common.required'
        )
  }
  for (const type of [1, 2, 3, 5, 6]) {
    const blocks = payload.value.Material.filter((item) => item.MaterType === type)
    if (
      !blocks.length ||
      blocks.some(
        (block) =>
          !block.material.length ||
          block.material.some(
            (item) =>
              !required(item.CompositionType) ||
              !required(item.composition) ||
              !validNumber(item.weight) ||
              !required(item.unit) ||
              !validNumber(item.error_value)
          )
      )
    )
      return fail('material', 'validation.materialRequired')
  }
  for (const item of payload.value.PEFInfo)
    if (
      !required(item.AssessmentDate) ||
      !required(item.ImpactCategory) ||
      !required(item.LifeCycleStage) ||
      !validNumber(item.CharacterizationResult) ||
      !required(item.Unit)
    )
      return fail('footprint')
  for (const item of payload.value.TradeMark)
    if (
      !required(item.ApplicationNumber) ||
      !required(item.TrademarkOffice) ||
      !required(item.TrademarkName) ||
      !required(item.StartDate) ||
      !required(item.country_code_id) ||
      !isHttpUrl(item.TradeMarkLink) ||
      !/^[A-Za-z0-9]{0,3}$/.test(item.Subdivision) ||
      (item.EndDate && item.EndDate < item.StartDate)
    )
      return fail(
        'trademark',
        !/^[A-Za-z0-9]{0,3}$/.test(item.Subdivision) ? 'validation.subdivision' : 'common.required'
      )
  for (const item of payload.value.product_repair)
    if (
      !required(item.repair_date) ||
      !item.repair_type ||
      !required(item.component_name) ||
      !required(item.action_date) ||
      !required(item.action_area) ||
      (item.repair_delivery_date && item.repair_delivery_date < item.repair_date)
    )
      return fail('repair', 'common.required')
  for (const item of payload.value.product_recycle)
    if (
      !required(item.recycle_date) ||
      !item.recycle_type ||
      !item.recycle_addr_type ||
      (item.recycle_addr_type === 2 && !required(item.recycle_addr)) ||
      !required(item.execution_dec) ||
      (item.completed_date && item.completed_date < item.recycle_date)
    )
      return fail('recycle', 'common.required')
  return null
}

const focusFirst = async (tab: TabName) => {
  activeTab.value = tab
  await nextTick()
  const panel = document.querySelector<HTMLElement>('.el-tab-pane:not([style*="display: none"])')
  const target = panel?.querySelector<HTMLElement>(
    'input:not([disabled]), textarea:not([disabled]), button:not([disabled])'
  )
  target?.scrollIntoView({ behavior: 'smooth', block: 'center' })
  target?.focus()
}
const load = async () => {
  if (mode.value === 'add') {
    payload.value = createPassportPayload()
    return
  }
  loading.value = true
  try {
    payload.value = normalizePassportPayload(await getPassport(uid.value))
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('common.loadFailed'))
    await router.replace({ name: 'passport-list', query: langQuery.value })
  } finally {
    loading.value = false
  }
}
const save = async () => {
  const failure = validate()
  if (failure) {
    ElMessage.error(`${t('validation.firstError')}：${failure.message}`)
    await focusFirst(failure.tab)
    return
  }
  saving.value = true
  try {
    if (mode.value === 'add') {
      const result = await addPassport(payload.value)
      const failure = result.errors?.[0]
      if (failure) throw new Error(failure.error)
    } else {
      await modifyPassport(uid.value, payload.value)
    }
    ElMessage.success(t('common.saved'))
    await router.replace({ name: 'passport-list', query: langQuery.value })
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('common.saveFailed'))
  } finally {
    saving.value = false
  }
}
const back = () => {
  void router.push({ name: 'passport-list', query: langQuery.value })
}
watch(() => route.fullPath, load)
onMounted(load)
</script>

<template>
  <section v-loading="loading" class="page passport-form-page" aria-labelledby="page-title">
    <header class="page-heading">
      <div class="form-title">
        <el-button link type="primary" :icon="ArrowLeft" @click="back">{{
          $t('common.back')
        }}</el-button
        ><span aria-hidden="true">|</span>
        <div>
          <h1 id="page-title">{{ title }}</h1>
        </div>
      </div>
      <div class="page-actions">
        <el-button v-if="!disabled" type="primary" :icon="Check" :loading="saving" @click="save">{{
          $t('common.save')
        }}</el-button>
      </div>
    </header>
    <el-tabs v-model="activeTab" class="passport-tabs" type="border-card">
      <el-tab-pane name="basic" :label="$t('tabs.basic')"
        ><BasicInfoTab v-model="payload" :disabled="disabled" :status-editable="mode === 'add'"
      /></el-tab-pane>
      <el-tab-pane name="specification" :label="$t('tabs.specification')"
        ><SpecificationTab v-model="payload" :disabled="disabled"
      /></el-tab-pane>
      <el-tab-pane name="verification" :label="$t('tabs.verification')"
        ><VerificationTab v-model="payload" :disabled="disabled"
      /></el-tab-pane>
      <el-tab-pane name="material" :label="$t('tabs.material')"
        ><MaterialTab v-model="payload" :disabled="disabled"
      /></el-tab-pane>
      <el-tab-pane name="footprint" :label="$t('tabs.footprint')"
        ><FootprintTab v-model="payload" :disabled="disabled"
      /></el-tab-pane>
      <el-tab-pane name="trademark" :label="$t('tabs.trademark')"
        ><TrademarkTab v-model="payload" :disabled="disabled"
      /></el-tab-pane>
      <el-tab-pane name="repair" :label="$t('tabs.repair')"
        ><RepairTab v-model="payload" :disabled="disabled"
      /></el-tab-pane>
      <el-tab-pane name="recycle" :label="$t('tabs.recycle')"
        ><RecycleTab v-model="payload" :disabled="disabled"
      /></el-tab-pane>
    </el-tabs>
  </section>
</template>
