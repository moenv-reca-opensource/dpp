import type { PassportListItem } from '@/types/passport'

export interface PassportQueryState {
  p: number
  size: number
  q: string
  start: string
  end: string
}

const PAGE_SIZES = [10, 20, 50, 100, 500]
const first = (value: unknown) => (Array.isArray(value) ? value[0] : value)

export const parsePassportQuery = (query: Record<string, unknown>): PassportQueryState => {
  const page = Number(first(query.p))
  const size = Number(first(query.size))
  const text = (key: string) =>
    typeof first(query[key]) === 'string' ? String(first(query[key])) : ''
  return {
    p: Number.isInteger(page) && page > 0 ? page : 1,
    size: PAGE_SIZES.includes(size) ? size : 10,
    q: text('q'),
    start: text('start'),
    end: text('end')
  }
}

export const buildPassportQuery = (
  state: PassportQueryState,
  english = false
): Record<string, string> => {
  const query: Record<string, string> = {
    p: String(state.p),
    size: String(state.size)
  }
  if (english) query.lang = 'en'
  if (state.q.trim()) query.q = state.q.trim()
  if (state.start) query.start = state.start
  if (state.end) query.end = state.end
  return query
}

export const selectPassportPage = (
  items: PassportListItem[],
  state: PassportQueryState
): { rows: PassportListItem[]; total: number } => {
  const keyword = state.q.trim().toLowerCase()
  const matched = items.filter((item) => {
    if (keyword) {
      const haystack = [item.UID, item.ProdName, item.SerialNo, item.Model]
        .filter((value): value is string => typeof value === 'string')
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(keyword)) return false
    }
    const startDate = item.PassportStartDate || ''
    if (state.start && (!startDate || startDate < state.start)) return false
    if (state.end && (!startDate || startDate > state.end)) return false
    return true
  })

  const sorted = [...matched].sort((a, b) => (b.createdAt || '').localeCompare(a.createdAt || ''))
  const offset = (state.p - 1) * state.size
  return { rows: sorted.slice(offset, offset + state.size), total: sorted.length }
}
