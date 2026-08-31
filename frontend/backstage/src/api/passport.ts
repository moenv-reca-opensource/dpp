import { post, postBlob } from '@/api/client'
import type {
  PassportCreateResult,
  PassportDetailResponse,
  PassportImportResult,
  PassportListItem,
  PassportPayload
} from '@/types/passport'

const toBackendDocument = (payload: PassportPayload, UID?: string) => {
  const entry = { ...payload.DPP[0], ...(UID ? { UID } : {}) }
  return {
    DPP: [entry],
    DPPInfo: payload.DPPInfo,
    ProductInfo: {
      ...payload.ProductInfo,
      ProdInfoLink: payload.ProductInfo.ProdInfoLink.filter(Boolean),
      ProdPhoto: payload.ProductInfo.ProdPhoto.filter(Boolean)
    },
    MandatoryCertification: payload.MandatoryCertification,
    VoluntaryCertification: payload.VoluntaryCertification,
    Material: payload.Material,
    PEFInfo: payload.PEFInfo,
    TradeMark: payload.TradeMark
  }
}

const toFileForm = (file: File) => {
  const data = new FormData()
  data.append('file', file)
  return data
}

export const listPassports = () => post<PassportListItem[]>('/dpp.list', {})
export const getPassport = (UID: string) => post<PassportDetailResponse>('/dpp.info', { UID })
export const addPassport = (payload: PassportPayload) =>
  post<PassportCreateResult>('/dpp.add', toBackendDocument(payload))
export const modifyPassport = (UID: string, payload: PassportPayload) =>
  post<PassportDetailResponse>('/dpp.modify', toBackendDocument(payload, UID))
export const importPassport = (file: File) =>
  post<PassportImportResult>('/dpp.import', toFileForm(file))
export const importRepair = (file: File) =>
  post<PassportImportResult>('/dpp.import_repair', toFileForm(file))
export const importRecycle = (file: File) =>
  post<PassportImportResult>('/dpp.import_recycle', toFileForm(file))
export const getPassportQrCode = (UID: string) => postBlob('/dpp.qrcode', { UID })
