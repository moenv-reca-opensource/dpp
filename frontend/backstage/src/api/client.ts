import axios, { AxiosError, isAxiosError } from 'axios'
import type { ApiResponse } from '@/types/api'

export const http = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL,
  timeout: 30_000,
  withCredentials: true
})

http.interceptors.response.use(undefined, async (error: AxiosError<ApiResponse<unknown>>) => {
  if (error.response?.status === 401 && !error.config?.url?.endsWith('/auth/login')) {
    window.dispatchEvent(new CustomEvent('auth:expired'))
  }
  return Promise.reject(error)
})

export const post = async <T>(url: string, data?: unknown): Promise<T> => {
  const response = await http.post<ApiResponse<T>>(url, data)
  if (!response.data.success)
    throw new Error(response.data.s_message || `API error ${response.data.code}`)
  return response.data.payload
}

export const postBlob = async (url: string, data?: unknown): Promise<Blob> => {
  try {
    const response = await http.post<Blob>(url, data, { responseType: 'blob' })
    if (response.data.type.startsWith('image/')) return response.data
    throw new Error(await readBlobMessage(response.data))
  } catch (error) {
    if (isAxiosError<Blob>(error) && error.response?.data instanceof Blob)
      throw new Error(await readBlobMessage(error.response.data), { cause: error })
    throw error
  }
}

const readBlobMessage = async (blob: Blob): Promise<string> => {
  try {
    const body = JSON.parse(await blob.text()) as ApiResponse<unknown>
    return body.s_message || 'API error'
  } catch {
    return 'API error'
  }
}
