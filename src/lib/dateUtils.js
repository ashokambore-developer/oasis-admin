/**
 * Format a date value as dd/MM/yyyy.
 * Returns '—' for null/undefined/falsy values.
 */
export const fmtDate = (d) => {
  if (!d) return '—'
  const dt = new Date(d)
  const dd = String(dt.getDate()).padStart(2, '0')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const yyyy = dt.getFullYear()
  return `${dd}/${mm}/${yyyy}`
}

/**
 * Format a date value as dd/MM/yyyy HH:mm (24-hour).
 * Returns '—' for null/undefined/falsy values.
 */
export const fmtDateTime = (d) => {
  if (!d) return '—'
  const dt = new Date(d)
  const dd = String(dt.getDate()).padStart(2, '0')
  const mm = String(dt.getMonth() + 1).padStart(2, '0')
  const yyyy = dt.getFullYear()
  const hh = String(dt.getHours()).padStart(2, '0')
  const min = String(dt.getMinutes()).padStart(2, '0')
  return `${dd}/${mm}/${yyyy} ${hh}:${min}`
}
