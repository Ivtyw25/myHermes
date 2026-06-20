export function formatMYR(n: number, opts?: { signed?: boolean }): string {
  const abs = Math.abs(n).toLocaleString('en-MY', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })
  const sign = opts?.signed ? (n < 0 ? '−' : '+') : n < 0 ? '−' : ''
  return `${sign}RM ${abs}`
}

export function formatMonthLabel(key: string): string {
  if (!key || !/^\d{4}-\d{2}$/.test(key)) return '—'
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-MY', {
    month: 'long',
    year: 'numeric',
  })
}

export function formatMonthShort(key: string): string {
  if (!/^\d{4}-\d{2}$/.test(key)) return key
  const [y, m] = key.split('-').map(Number)
  return new Date(y, m - 1, 1).toLocaleDateString('en-MY', {
    month: 'short',
    year: '2-digit',
  })
}
