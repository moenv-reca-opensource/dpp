import { AxiosError, type AxiosResponse, type InternalAxiosRequestConfig } from 'axios'
import { http } from '@/api/client'
import type { PassportDetailResponse, PassportListItem } from '@/types/passport'
import {
  createRecordFixtures,
  createRecycleFixtures,
  createRepairFixtures,
  type MockRecord
} from '@/dev/fixtures'

const now = () => new Date().toISOString().slice(0, 19).replace('T', ' ')

const buildDppId = (record: PassportDetailResponse): string =>
  '01' +
  String(record.DPPInfo?.GTIN ?? '').replace(/ /g, '') +
  '10' +
  String(record.DPPInfo?.BatchLot ?? '').replace(/ /g, '') +
  '21' +
  String(record.SerialNo ?? '').replace(/ /g, '')

const toSummary = (record: MockRecord): PassportListItem => ({
  UID: record.UID,
  DPPClass: record.DPPClass ?? null,
  DPPSubClass: record.DPPSubClass ?? null,
  SerialNo: record.SerialNo ?? '',
  Model: record.ProductInfo?.Model ?? null,
  ProdName: record.ProductInfo?.ProdName ?? null,
  PassportStartDate: record.PassportStartDate ?? null,
  DPPStatus: Number(record.DPPStatus ?? 0),
  createdAt: record.createdAt ?? '',
  updatedAt: record.updatedAt ?? ''
})

const drawPlaceholder = (uid: string): Promise<Blob> => {
  const size = 300
  const canvas = document.createElement('canvas')
  canvas.width = size
  canvas.height = size
  const context = canvas.getContext('2d')
  if (!context) return Promise.resolve(new Blob([], { type: 'image/png' }))

  context.fillStyle = '#ffffff'
  context.fillRect(0, 0, size, size)

  let hash = 0
  for (const char of uid) hash = (hash * 31 + char.charCodeAt(0)) >>> 0
  const modules = 21
  const cell = Math.floor((size - 40) / modules)
  const offset = Math.floor((size - cell * modules) / 2)
  context.fillStyle = '#111111'
  for (let row = 0; row < modules; row += 1) {
    for (let column = 0; column < modules; column += 1) {
      hash = (hash * 1103515245 + 12345) >>> 0
      if ((hash >>> 16) % 2 === 0) continue
      context.fillRect(offset + column * cell, offset + row * cell, cell, cell)
    }
  }
  const finders: { row: number; column: number }[] = [
    { row: 0, column: 0 },
    { row: 0, column: modules - 7 },
    { row: modules - 7, column: 0 }
  ]
  for (const { row, column } of finders) {
    context.fillStyle = '#111111'
    context.fillRect(offset + column * cell, offset + row * cell, cell * 7, cell * 7)
    context.fillStyle = '#ffffff'
    context.fillRect(offset + (column + 1) * cell, offset + (row + 1) * cell, cell * 5, cell * 5)
    context.fillStyle = '#111111'
    context.fillRect(offset + (column + 2) * cell, offset + (row + 2) * cell, cell * 3, cell * 3)
  }

  context.fillStyle = '#ffffff'
  context.fillRect(size / 2 - 36, size / 2 - 17, 72, 34)
  context.fillStyle = '#c02020'
  context.font = 'bold 20px sans-serif'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText('DEV', size / 2, size / 2)

  return new Promise((resolve) => {
    canvas.toBlob((blob) => resolve(blob ?? new Blob([], { type: 'image/png' })), 'image/png')
  })
}

interface EntryError {
  index: number
  UID?: string
  error: string
}

export const installMockBackend = (): void => {
  const records = new Map<string, MockRecord>(
    createRecordFixtures().map((record) => [record.UID, record])
  )
  const repairRecords: Record<string, unknown[]> = createRepairFixtures()
  const recycleRecords: Record<string, unknown[]> = createRecycleFixtures()
  let signedIn = true
  let nextId = 0

  const respond = (
    config: InternalAxiosRequestConfig,
    payload: unknown,
    status = 200
  ): AxiosResponse => ({
    data: { success: true, code: status, s_message: '0000', payload },
    status,
    statusText: 'OK',
    headers: {},
    config
  })

  const reject = (config: InternalAxiosRequestConfig, status: number, message: string): never => {
    const body = { success: false, code: status, s_message: message, payload: null }
    const data = config.responseType === 'blob' ? new Blob([JSON.stringify(body)]) : body
    throw new AxiosError(message, String(status), config, null, {
      data,
      status,
      statusText: 'Error',
      headers: {},
      config
    } as AxiosResponse)
  }

  const withRecordDetail = (record: MockRecord): PassportDetailResponse => ({
    ...record,
    DPPID: buildDppId(record),
    RepairRecord: (repairRecords[record.UID] ?? []) as PassportDetailResponse['RepairRecord'],
    RecycleRecord: (recycleRecords[record.UID] ?? []) as PassportDetailResponse['RecycleRecord']
  })

  const readJson = (config: InternalAxiosRequestConfig): Record<string, unknown> =>
    typeof config.data === 'string'
      ? (JSON.parse(config.data) as Record<string, unknown>)
      : ((config.data ?? {}) as Record<string, unknown>)

  const createFromDocument = (document: Record<string, unknown>) => {
    const entries = Array.isArray(document.DPP) ? (document.DPP as Record<string, unknown>[]) : []
    const sections = { ...document }
    delete sections.DPP

    const created: PassportDetailResponse[] = []
    const errors: EntryError[] = []
    entries.forEach((entry, index) => {
      if (!entry?.SerialNo) {
        errors.push({ index, error: 'SerialNo is required' })
        return
      }
      const stamp = now()
      nextId += 1
      const record = {
        ...entry,
        ...sections,
        UID: `dev-mock-${String(nextId).padStart(4, '0')}`,
        EORIID: 'TWDEV0000001',
        createdAt: stamp,
        updatedAt: stamp
      } as MockRecord

      const dppId = buildDppId(record)
      if ([...records.values()].some((existing) => buildDppId(existing) === dppId)) {
        errors.push({ index, error: 'DPPID duplicate, entry not created' })
        return
      }
      records.set(record.UID, record)
      created.push(withRecordDetail(record))
    })
    return { created, errors }
  }

  const importLogs = (entries: unknown, store: Record<string, unknown[]>, required: string[]) => {
    const list = Array.isArray(entries) ? entries : []
    const imported: unknown[] = []
    const errors: EntryError[] = []
    list.forEach((entry, index) => {
      const item = entry as Record<string, unknown>
      const uid = String(item?.UID ?? '')
      if (!uid || !records.has(uid)) {
        errors.push({ index, UID: uid, error: 'UID not found' })
        return
      }
      const missing = required.filter((field) => !item[field])
      if (missing.length) {
        errors.push({ index, UID: uid, error: `${missing.join(', ')} is required` })
        return
      }
      const record: Record<string, unknown> = { ...item, importedAt: now() }
      delete record.UID
      store[uid] = [...(store[uid] ?? []), record]
      imported.push({ UID: uid, ...record })
    })
    return { imported, errors }
  }

  http.defaults.adapter = async (config: InternalAxiosRequestConfig) => {
    await new Promise((resolve) => setTimeout(resolve, 120))

    const path = String(config.url ?? '')
    const at = (suffix: string) => path.endsWith(suffix)

    if (at('/frontstage/auth/login')) {
      const body = readJson(config) as { username?: string; password?: string }
      if (!body.username || !body.password) return reject(config, 401, 'Invalid credentials')
      signedIn = true
      return respond(config, { ok: true })
    }
    if (at('/frontstage/auth/logout')) {
      signedIn = false
      return respond(config, { ok: true })
    }
    if (!signedIn) return reject(config, 401, 'Unauthorized')

    if (at('/dpp.list')) return respond(config, [...records.values()].map(toSummary))

    if (at('/dpp.info')) {
      const { UID } = readJson(config) as { UID?: string }
      const record = UID ? records.get(UID) : undefined
      if (!record) return reject(config, 404, 'DPP not found')
      return respond(config, withRecordDetail(record))
    }

    if (at('/dpp.qrcode')) {
      const { UID } = readJson(config) as { UID?: string }
      if (!UID || !records.has(UID)) return reject(config, 404, 'DPP not found')
      return {
        data: await drawPlaceholder(UID),
        status: 200,
        statusText: 'OK',
        headers: { 'content-type': 'image/png' },
        config
      } as AxiosResponse
    }

    if (at('/dpp.add')) return respond(config, createFromDocument(readJson(config)), 201)

    if (at('/dpp.modify')) {
      const document = readJson(config)
      const entries = Array.isArray(document.DPP) ? (document.DPP as Record<string, unknown>[]) : []
      const entry = entries[0] ?? {}
      const existing = records.get(String(entry.UID ?? ''))
      if (!existing) return reject(config, 404, 'DPP not found')

      const sections = { ...document }
      delete sections.DPP
      const record = {
        ...existing,
        ...entry,
        ...sections,
        DPPStatus: existing.DPPStatus,
        updatedAt: now()
      } as MockRecord
      records.set(record.UID, record)
      return respond(config, withRecordDetail(record))
    }

    if (at('/dpp.import') || at('/dpp.import_repair') || at('/dpp.import_recycle')) {
      const file = config.data instanceof FormData ? config.data.get('file') : null
      if (!(file instanceof File)) return reject(config, 422, 'file is required')

      let document: unknown
      try {
        document = JSON.parse(await file.text())
      } catch {
        return reject(config, 422, 'file content is not valid JSON')
      }

      if (at('/dpp.import'))
        return respond(config, createFromDocument(document as Record<string, unknown>))
      if (at('/dpp.import_repair'))
        return respond(
          config,
          importLogs(document, repairRecords, [
            'repair_date',
            'repair_delivery_date',
            'repair_info'
          ])
        )
      return respond(
        config,
        importLogs(document, recycleRecords, ['recycle_date', 'recycle_type', 'recycle_addr_type'])
      )
    }

    return reject(config, 404, 'Not found')
  }
}
