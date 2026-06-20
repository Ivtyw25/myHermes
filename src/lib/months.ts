import { readdir } from 'fs/promises'

/** Lists yyyy-mm keys for every yyyy-mm.csv in HERMES_DATA_PATH, newest first. */
export async function getAvailableMonths(): Promise<string[]> {
  const dataPath = process.env.HERMES_DATA_PATH
  if (!dataPath) return []
  try {
    const files = await readdir(dataPath)
    return files
      .filter((f) => /^\d{4}-\d{2}\.csv$/.test(f))
      .map((f) => f.replace('.csv', ''))
      .sort()
      .reverse()
  } catch {
    return []
  }
}

/** Resolves the selected month from a ?month= param, falling back to `fallback`,
 *  then to the current calendar month. */
export function parseMonthParam(
  raw: string | undefined,
  fallback: string
): { year: number; monthNum: number; key: string } {
  const candidate = raw && /^\d{4}-\d{2}$/.test(raw) ? raw : fallback
  if (candidate && /^\d{4}-\d{2}$/.test(candidate)) {
    const [y, m] = candidate.split('-').map(Number)
    return { year: y, monthNum: m, key: candidate }
  }
  const d = new Date()
  const year = d.getFullYear()
  const monthNum = d.getMonth() + 1
  return { year, monthNum, key: `${year}-${String(monthNum).padStart(2, '0')}` }
}
