import { post } from '@/api/client'
import type { SessionResult } from '@/types/api'

export const loginApi = (username: string, password: string) =>
  post<SessionResult>('/frontstage/auth/login', { username, password })
export const logoutApi = () => post<SessionResult>('/frontstage/auth/logout')
