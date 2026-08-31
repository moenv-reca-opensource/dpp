<script setup lang="ts">
import { computed, nextTick, onMounted, onBeforeUnmount, reactive, ref, watch } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useI18n } from 'vue-i18n'
import { ElMessage } from 'element-plus'
import { Plus, Upload, Download, Search, ArrowDown, RefreshRight } from '@element-plus/icons-vue'
import {
  getPassportQrCode,
  importPassport,
  importRecycle,
  importRepair,
  listPassports
} from '@/api/passport'
import { useOptions } from '@/composables/useOptions'
import { hasSerialNumberWhitespace } from '@/utils/validation'
import { buildPassportQuery, parsePassportQuery, selectPassportPage } from '@/utils/listQuery'
import type { PassportEntryError, PassportListItem } from '@/types/passport'

const route = useRoute()
const router = useRouter()
const { locale, t } = useI18n()
const { parameterName } = useOptions()
const rows = ref<PassportListItem[]>([])
const total = ref(0)
const loading = ref(false)
const importOpen = ref(false)
const importLoading = ref(false)
const importFile = ref<File>()
const fileInput = ref<HTMLInputElement>()
const importKind = ref<'dpp' | 'repair' | 'recycle'>('dpp')
const liveMessage = ref('')
const qrOpen = ref(false)
const qrLoading = ref(false)
const qrSource = ref('')
const qrTarget = ref<PassportListItem>()
let requestSequence = 0

const filter = reactive(parsePassportQuery(route.query))
const advancedOpen = ref(Boolean(filter.start || filter.end))

const langQuery = computed(() => (locale.value === 'en' ? { lang: 'en' } : {}))

const syncQuery = async () => {
  await router.push({
    query: buildPassportQuery(filter, locale.value === 'en')
  })
}

const load = async () => {
  const sequence = ++requestSequence
  loading.value = true
  try {
    const items = await listPassports()
    if (sequence !== requestSequence) return
    const page = selectPassportPage(items, filter)
    rows.value = page.rows
    total.value = page.total
    const lastPage = Math.max(1, Math.ceil(page.total / filter.size))
    if (filter.p > lastPage) {
      filter.p = lastPage
      await syncQuery()
      return
    }
    liveMessage.value = t('common.resultCount', { count: page.total })
  } catch (error) {
    if (sequence === requestSequence)
      ElMessage.error(error instanceof Error ? error.message : t('common.loadFailed'))
  } finally {
    if (sequence === requestSequence) loading.value = false
  }
}

const applyRouteQuery = () => {
  Object.assign(filter, parsePassportQuery(route.query))
  if (filter.start || filter.end) advancedOpen.value = true
}
watch(
  () => route.query,
  async () => {
    applyRouteQuery()
    await load()
  }
)
onMounted(load)

const search = async () => {
  filter.p = 1
  await syncQuery()
}
const reset = async () => {
  Object.assign(filter, {
    p: 1,
    size: 10,
    q: '',
    start: '',
    end: ''
  })
  advancedOpen.value = false
  await syncQuery()
}
const resetAdvanced = async () => {
  Object.assign(filter, {
    p: 1,
    start: '',
    end: ''
  })
  await syncQuery()
}
const onAdvancedToggle = (event: Event) => {
  advancedOpen.value = (event.currentTarget as HTMLDetailsElement).open
}
const changePage = async (page: number) => {
  filter.p = page
  await syncQuery()
}
const changeSize = async (size: number) => {
  filter.size = size
  filter.p = 1
  await syncQuery()
}
const routeTo = (name: string, uid?: string) => ({
  name,
  ...(uid ? { params: { uid } } : {}),
  query: langQuery.value
})

const openImport = () => {
  importFile.value = undefined
  importKind.value = 'dpp'
  importOpen.value = true
  void nextTick(() => fileInput.value?.focus())
}
const fileChanged = (event: Event) => {
  importFile.value = (event.target as HTMLInputElement).files?.[0]
}
const describeErrors = (errors: PassportEntryError[] | undefined) =>
  (errors || []).map((item) => `#${item.index + 1} ${item.error}`).join('；')
const submitImport = async () => {
  const file = importFile.value
  if (!file) {
    ElMessage.warning(t('passport.chooseFile'))
    fileInput.value?.focus()
    return
  }
  if (!file.name.toLowerCase().endsWith('.json')) {
    ElMessage.error(t('passport.invalidExtension'))
    fileInput.value?.focus()
    return
  }
  let json: unknown
  try {
    json = JSON.parse(await file.text())
  } catch {
    ElMessage.error(t('passport.invalidJson'))
    fileInput.value?.focus()
    return
  }
  if (hasSerialNumberWhitespace(json)) {
    ElMessage.error(t('passport.serialWhitespace'))
    fileInput.value?.focus()
    return
  }
  importLoading.value = true
  try {
    const result =
      importKind.value === 'repair'
        ? await importRepair(file)
        : importKind.value === 'recycle'
          ? await importRecycle(file)
          : await importPassport(file)
    const failed = result.errors?.length || 0
    if (failed)
      ElMessage.warning(
        t('passport.importPartial', { count: failed, detail: describeErrors(result.errors) })
      )
    else ElMessage.success(t('passport.importSuccess'))
    importOpen.value = false
    await load()
  } catch (error) {
    ElMessage.error(error instanceof Error ? error.message : t('common.saveFailed'))
  } finally {
    importLoading.value = false
  }
}

const templateUrl = (file: string) => {
  return `${import.meta.env.BASE_URL}templates/${file}`
}

const releaseQrSource = () => {
  if (qrSource.value) URL.revokeObjectURL(qrSource.value)
  qrSource.value = ''
}
const openQrCode = async (row: PassportListItem) => {
  releaseQrSource()
  qrTarget.value = row
  qrOpen.value = true
  qrLoading.value = true
  try {
    qrSource.value = URL.createObjectURL(await getPassportQrCode(row.UID))
  } catch (error) {
    qrOpen.value = false
    ElMessage.error(error instanceof Error ? error.message : t('passport.qrcodeFailed'))
  } finally {
    qrLoading.value = false
  }
}
const closeQrCode = () => releaseQrSource()
onBeforeUnmount(releaseQrSource)
</script>

<template>
  <section class="page passport-list-page" aria-labelledby="page-title">
    <header class="page-heading">
      <div>
        <h1 id="page-title">{{ $t('nav.passportList') }}</h1>
        <p>{{ $t('passport.batteryOnly') }}</p>
      </div>
      <div class="page-actions">
        <el-button type="primary" :icon="Plus" @click="$router.push(routeTo('passport-add'))">{{
          $t('passport.addTitle')
        }}</el-button>
      </div>
    </header>

    <form class="panel filter-panel" role="search" @submit.prevent="search">
      <div class="list-toolbar">
        <div class="filter-main">
          <label
            ><span class="sr-only">{{ $t('passport.keyword') }}</span
            ><el-input
              v-model="filter.q"
              clearable
              :placeholder="$t('passport.keywordPlaceholder')" /></label
          ><el-button native-type="submit" type="primary" :icon="Search">{{
            $t('common.search')
          }}</el-button
          ><el-button :icon="RefreshRight" @click="reset">{{ $t('common.reset') }}</el-button>
        </div>
        <div class="list-actions">
          <el-button :icon="Upload" @click="openImport">{{ $t('passport.import') }}</el-button>
          <el-dropdown>
            <el-button :icon="Download"
              >{{ $t('passport.template') }}<el-icon class="el-icon--right"><ArrowDown /></el-icon
            ></el-button>
            <template #dropdown
              ><el-dropdown-menu>
                <el-dropdown-item
                  ><a
                    class="dropdown-link"
                    :href="templateUrl('dpp_add_battery_v1.0.json')"
                    download
                    >Battery DPP 1.0</a
                  ></el-dropdown-item
                >
              </el-dropdown-menu></template
            >
          </el-dropdown>
        </div>
      </div>
      <details class="advanced-filter" :open="advancedOpen" @toggle="onAdvancedToggle">
        <summary>{{ $t('passport.advanced') }}</summary>
        <div class="filter-grid">
          <label
            ><span>{{ $t('passport.startDate') }}</span
            ><el-date-picker v-model="filter.start" value-format="YYYY-MM-DD" type="date" /></label
          ><label
            ><span>{{ $t('passport.endDate') }}</span
            ><el-date-picker v-model="filter.end" value-format="YYYY-MM-DD" type="date"
          /></label>
          <div class="advanced-filter-actions">
            <el-button native-type="submit" type="primary" :icon="Search">{{
              $t('common.search')
            }}</el-button>
            <el-button native-type="button" :icon="RefreshRight" @click="resetAdvanced">{{
              $t('passport.advancedReset')
            }}</el-button>
          </div>
        </div>
      </details>
    </form>

    <div class="panel table-panel">
      <div class="table-meta">
        <strong>{{ $t('common.resultCount', { count: total }) }}</strong>
      </div>
      <el-table
        v-loading="loading"
        :data="rows"
        row-key="UID"
        empty-text="—"
        @row-dblclick="(row: PassportListItem) => $router.push(routeTo('passport-detail', row.UID))"
      >
        <el-table-column
          prop="UID"
          :label="$t('passport.UID')"
          min-width="210"
          show-overflow-tooltip
        />
        <el-table-column prop="ProdName" :label="$t('passport.ProdName')" min-width="170" />
        <el-table-column prop="SerialNo" :label="$t('passport.SerialNo')" min-width="150" />
        <el-table-column :label="$t('passport.status')" min-width="130"
          ><template #default="{ row }"
            ><span class="status-pill" :data-status="row.DPPStatus">{{
              parameterName('DPPStatus', row.DPPStatus)
            }}</span></template
          ></el-table-column
        >
        <el-table-column fixed="right" :label="$t('common.actions')" width="230"
          ><template #default="{ row }"
            ><el-button
              plain
              size="small"
              @click="$router.push(routeTo('passport-detail', row.UID))"
              >{{ $t('common.view') }}</el-button
            ><el-button
              plain
              type="primary"
              size="small"
              @click="$router.push(routeTo('passport-edit', row.UID))"
              >{{ $t('common.edit') }}</el-button
            ><el-button plain size="small" @click="openQrCode(row)">{{
              $t('passport.qrcode')
            }}</el-button></template
          ></el-table-column
        >
      </el-table>
      <div class="pagination-row">
        <span>{{ $t('common.resultCount', { count: total }) }}</span>
        <span>{{ $t('passport.pageSize') }}</span
        ><el-select
          :model-value="filter.size"
          class="page-size"
          :aria-label="$t('passport.pageSize')"
          @change="changeSize"
          ><el-option
            v-for="size in [10, 20, 50, 100, 500]"
            :key="size"
            :label="size"
            :value="size" /></el-select
        ><el-pagination
          :current-page="filter.p"
          :page-size="filter.size"
          :total="total"
          layout="prev, pager, next"
          @current-change="changePage"
        />
      </div>
    </div>
    <p class="sr-only" role="status" aria-live="polite">{{ liveMessage }}</p>

    <el-dialog
      v-model="importOpen"
      :title="$t('passport.importTitle')"
      width="min(34rem, 92vw)"
      destroy-on-close
    >
      <el-form label-position="top"
        ><el-form-item :label="$t('passport.importType')"
          ><el-radio-group v-model="importKind"
            ><el-radio value="dpp">{{ $t('passport.importDpp') }}</el-radio
            ><el-radio value="repair">{{ $t('passport.importRepair') }}</el-radio
            ><el-radio value="recycle">{{ $t('passport.importRecycle') }}</el-radio></el-radio-group
          ></el-form-item
        ><el-form-item :label="$t('passport.chooseFile')"
          ><input
            ref="fileInput"
            class="native-file"
            type="file"
            accept="application/json,.json"
            @change="fileChanged" /></el-form-item
      ></el-form>
      <template #footer
        ><el-button @click="importOpen = false">{{ $t('common.cancel') }}</el-button
        ><el-button type="primary" :loading="importLoading" @click="submitImport">{{
          $t('common.confirm')
        }}</el-button></template
      >
    </el-dialog>

    <el-dialog
      v-model="qrOpen"
      :title="$t('passport.qrcode')"
      width="min(24rem, 92vw)"
      @closed="closeQrCode"
    >
      <div v-loading="qrLoading" class="qrcode-preview">
        <img v-if="qrSource" :src="qrSource" :alt="`${$t('passport.qrcode')} ${qrTarget?.UID}`" />
        <p>{{ qrTarget?.ProdName || qrTarget?.SerialNo || qrTarget?.UID }}</p>
      </div>
      <template #footer
        ><el-button @click="qrOpen = false">{{ $t('common.cancel') }}</el-button
        ><a
          v-if="qrSource"
          class="el-button el-button--primary"
          :href="qrSource"
          :download="`dpp-qrcode-${qrTarget?.UID}.png`"
          >{{ $t('passport.qrcodeDownload') }}</a
        ></template
      >
    </el-dialog>
  </section>
</template>
