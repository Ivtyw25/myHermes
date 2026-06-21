import fs from 'fs/promises'
import path from 'path'
import Papa from 'papaparse'

export const VALID_CATEGORIES = [
  'entertainment',
  'food',
  'other',
  'shopping',
  'anniversary & celebration',
  'transport',
  'utilities',
  'income',
  'allowance',
] as const

export type Category = (typeof VALID_CATEGORIES)[number]

export interface Transaction {
  name: string
  date: string // YYYY-MM-DD
  type: 'income' | 'expense'
  amount: number // always positive
  category: Category
}

export interface CategoryMonthRow {
  month: string
  [category: string]: number | string
}

function isValidYearMonth(year: number, month: number): void {
  if (!Number.isInteger(year) || year < 2000 || year > 2100) {
    throw new Error(`Invalid year: ${year}. Must be integer 2000-2100.`)
  }
  if (!Number.isInteger(month) || month < 1 || month > 12) {
    throw new Error(`Invalid month: ${month}. Must be integer 1-12.`)
  }
}

export function normalizeCategory(s: string): string {
  return s.trim().toLowerCase()
}

function isValidTransaction(row: unknown): row is Transaction {
  if (!row || typeof row !== 'object') return false
  const r = row as Record<string, unknown>

  if (typeof r.name !== 'string' || !r.name.trim()) return false
  if (typeof r.date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(r.date)) return false
  if (r.type !== 'income' && r.type !== 'expense') return false

  const amount = Number(r.amount)
  if (!Number.isFinite(amount) || amount <= 0) return false

  const cat = normalizeCategory(String(r.category ?? ''))
  if (!(VALID_CATEGORIES as readonly string[]).includes(cat)) return false

  return true
}

export async function readMonth(year: number, month: number): Promise<Transaction[]> {
  isValidYearMonth(year, month)

  const dataPath = process.env.HERMES_DATA_PATH
  if (!dataPath) throw new Error('HERMES_DATA_PATH environment variable is not set')

  const filename = `${year}-${String(month).padStart(2, '0')}.csv`
  const filePath = path.join(dataPath, filename)

  let content: string
  try {
    content = await fs.readFile(filePath, 'utf-8')
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return []
    throw err
  }

  const parsed = Papa.parse<Record<string, string>>(content, {
    header: true,
    skipEmptyLines: true,
  })

  const transactions: Transaction[] = []
  for (const row of parsed.data) {
    const normalized = {
      name: (row.Name ?? row.name ?? '').trim(),
      date: (row.Date ?? row.date ?? '').trim(),
      type: (row.Type ?? row.type ?? '').trim().toLowerCase(),
      amount: Number((row.Amount ?? row.amount ?? '').trim()),
      category: normalizeCategory(row.Category ?? row.category ?? ''),
    }

    if (isValidTransaction(normalized)) {
      transactions.push(normalized as Transaction)
    } else {
      console.warn(`[csv] Skipping invalid row in ${filename}:`, JSON.stringify(row))
    }
  }

  return transactions
}

export async function readMonths(
  endMonth: string,
  count: number
): Promise<Record<string, Transaction[]>> {
  const [endYearStr, endMonthStr] = endMonth.split('-')
  const endYear = parseInt(endYearStr, 10)
  const endMonthNum = parseInt(endMonthStr, 10)

  const result: Record<string, Transaction[]> = {}

  for (let i = count - 1; i >= 0; i--) {
    let month = endMonthNum - i
    let year = endYear
    while (month <= 0) {
      month += 12
      year -= 1
    }
    const key = `${year}-${String(month).padStart(2, '0')}`
    result[key] = await readMonth(year, month)
  }

  return result
}

export function aggregateByCategoryDonut(
  transactions: Transaction[],
  topN = 9
): { category: string; amount: number }[] {
  const expenses = transactions.filter((t) => t.type === 'expense')
  const totals = new Map<string, number>()
  for (const t of expenses) {
    totals.set(t.category, (totals.get(t.category) ?? 0) + t.amount)
  }

  const sorted = [...totals.entries()].sort((a, b) => b[1] - a[1])
  if (sorted.length <= topN) {
    return sorted.map(([category, amount]) => ({ category, amount }))
  }

  const top = sorted.slice(0, topN)
  const otherAmount = sorted.slice(topN).reduce((sum, [, amt]) => sum + amt, 0)
  return [
    ...top.map(([category, amount]) => ({ category, amount })),
    { category: 'Other', amount: Math.round(otherAmount * 100) / 100 },
  ]
}

export function aggregateByCategoryMonth(
  months: Record<string, Transaction[]>
): CategoryMonthRow[] {
  // Find top 6 expense categories across all months
  const globalTotals = new Map<string, number>()
  for (const transactions of Object.values(months)) {
    for (const t of transactions.filter((t) => t.type === 'expense')) {
      globalTotals.set(t.category, (globalTotals.get(t.category) ?? 0) + t.amount)
    }
  }

  const top6 = [...globalTotals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 6)
    .map(([cat]) => cat)

  return Object.entries(months).map(([monthKey, transactions]) => {
    const expenses = transactions.filter((t) => t.type === 'expense')
    const row: CategoryMonthRow = { month: monthKey }

    for (const cat of top6) {
      row[cat] =
        Math.round(
          expenses.filter((t) => t.category === cat).reduce((s, t) => s + t.amount, 0) * 100
        ) / 100
    }

    const otherAmount = expenses
      .filter((t) => !top6.includes(t.category))
      .reduce((s, t) => s + t.amount, 0)
    row['Other'] = Math.round(otherAmount * 100) / 100

    return row
  })
}

export function getBillingPeriodTransactions(
  prevTxns: Transaction[],
  currTxns: Transaction[]
): Transaction[] {
  const fromPrev = prevTxns.filter((t) => parseInt(t.date.slice(8), 10) >= 27)
  const fromCurr = currTxns.filter((t) => parseInt(t.date.slice(8), 10) <= 26)
  return [...fromPrev, ...fromCurr].sort((a, b) => a.date.localeCompare(b.date))
}

export function aggregateDailyActual(
  transactions: Transaction[]
): { date: string; amount: number }[] {
  const expenses = transactions.filter((t) => t.type === 'expense')
  const map = new Map<string, number>()
  for (const t of expenses) map.set(t.date, (map.get(t.date) ?? 0) + t.amount)
  return [...map.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, amount]) => ({ date, amount: Math.round(amount * 100) / 100 }))
}

export function aggregateDailySpend(
  transactions: Transaction[]
): { date: string; cumulative: number }[] {
  const expenses = transactions.filter((t) => t.type === 'expense')
  const dailyTotals = new Map<string, number>()

  for (const t of expenses) {
    dailyTotals.set(t.date, (dailyTotals.get(t.date) ?? 0) + t.amount)
  }

  const sorted = [...dailyTotals.entries()].sort(([a], [b]) => a.localeCompare(b))
  let cumulative = 0
  return sorted.map(([date, amount]) => {
    cumulative += amount
    return { date, cumulative: Math.round(cumulative * 100) / 100 }
  })
}
