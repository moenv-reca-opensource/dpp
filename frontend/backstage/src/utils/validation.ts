export const isHttpUrl = (value: string): boolean => {
  if (!value) return true
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

export const hasSerialNumberWhitespace = (value: unknown): boolean => {
  if (Array.isArray(value)) return value.some(hasSerialNumberWhitespace)
  if (!value || typeof value !== 'object') return false
  return Object.entries(value).some(([key, child]) =>
    key === 'SerialNo' && typeof child === 'string'
      ? /\s/.test(child)
      : hasSerialNumberWhitespace(child)
  )
}
