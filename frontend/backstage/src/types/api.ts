export interface ApiResponse<T> {
  success: boolean
  code: number
  s_message: string
  payload: T
}

export interface SessionResult {
  ok: boolean
}

export interface UserProfile {
  user_name: string
  account?: string
}
