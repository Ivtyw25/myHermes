import { describe, it, expect } from 'vitest'
import path from 'path'
import fs from 'fs/promises'
import os from 'os'
import {
  readMonths,
  aggregateByCategoryDonut,
  aggregateByCategoryMonth,
  aggregateDailySpend,
  type Transaction,
} from '@/lib/csv'

const makeTransaction = (overrides: Partial<Transaction> = {}): Transaction => ({
  name: 'test',
  date: '2026-06-01',
  type: 'expense',
  amount: 10.0,
  category: 'food',
  ...overrides,
})

describe('aggregateDailySpend', () => {
  it('returns empty array for no transactions', () => {
    expect(aggregateDailySpend([])).toEqual([])
  })

  it('excludes income rows', () => {
    const txns = [
      makeTransaction({ type: 'income', amount: 100, date: '2026-06-01' }),
      makeTransaction({ type: 'expense', amount: 10, date: '2026-06-02' }),
    ]
    const result = aggregateDailySpend(txns)
    expect(result).toHaveLength(1)
    expect(result[0].date).toBe('2026-06-02')
  })

  it('returns entries sorted ascending by date', () => {
    const txns = [
      makeTransaction({ date: '2026-06-03', amount: 5 }),
      makeTransaction({ date: '2026-06-01', amount: 10 }),
      makeTransaction({ date: '2026-06-02', amount: 20 }),
    ]
    const result = aggregateDailySpend(txns)
    expect(result.map((r) => r.date)).toEqual(['2026-06-01', '2026-06-02', '2026-06-03'])
  })

  it('cumulative value never decreases', () => {
    const txns = [
      makeTransaction({ date: '2026-06-01', amount: 10 }),
      makeTransaction({ date: '2026-06-02', amount: 20 }),
      makeTransaction({ date: '2026-06-03', amount: 5 }),
    ]
    const result = aggregateDailySpend(txns)
    expect(result[0].cumulative).toBe(10)
    expect(result[1].cumulative).toBe(30)
    expect(result[2].cumulative).toBe(35)
  })
})

describe('aggregateByCategoryDonut', () => {
  it('returns empty array for no transactions', () => {
    expect(aggregateByCategoryDonut([])).toEqual([])
  })

  it('excludes income rows', () => {
    const txns = [
      makeTransaction({ type: 'income', category: 'income', amount: 500 }),
      makeTransaction({ type: 'expense', category: 'food', amount: 10 }),
    ]
    const result = aggregateByCategoryDonut(txns)
    expect(result.find((r) => r.category === 'income')).toBeUndefined()
    expect(result.find((r) => r.category === 'food')).toBeDefined()
  })

  it('respects topN and groups tail into Other', () => {
    const categories = ['food', 'transport', 'entertainment', 'utilities', 'shopping'] as const
    const txns = categories.map((cat, i) => makeTransaction({ category: cat, amount: (i + 1) * 10 }))
    const result = aggregateByCategoryDonut(txns, 3)
    expect(result).toHaveLength(4) // top 3 + Other
    expect(result[result.length - 1].category).toBe('Other')
  })

  it('does not add Other when total categories <= topN', () => {
    const txns = [
      makeTransaction({ category: 'food', amount: 10 }),
      makeTransaction({ category: 'transport', amount: 20 }),
    ]
    const result = aggregateByCategoryDonut(txns, 8)
    expect(result.find((r) => r.category === 'Other')).toBeUndefined()
  })
})

describe('aggregateByCategoryMonth', () => {
  it('returns one row per month key', () => {
    const months = {
      '2026-04': [makeTransaction({ amount: 10, category: 'food' })],
      '2026-05': [makeTransaction({ amount: 20, category: 'food' })],
    }
    const result = aggregateByCategoryMonth(months)
    expect(result).toHaveLength(2)
    expect(result.map((r) => r.month)).toContain('2026-04')
    expect(result.map((r) => r.month)).toContain('2026-05')
  })

  it('excludes income transactions from category totals', () => {
    const months = {
      '2026-05': [
        makeTransaction({ type: 'income', category: 'income', amount: 3000 }),
        makeTransaction({ type: 'expense', category: 'food', amount: 50 }),
      ],
    }
    const result = aggregateByCategoryMonth(months)
    expect(result[0]['food']).toBe(50)
  })
})

describe('readMonths', () => {
  it('returns correct month keys ending at endMonth', async () => {
    let tmpDir = ''
    try {
      tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hermes-months-'))
      process.env.HERMES_DATA_PATH = tmpDir
      const result = await readMonths('2026-05', 6)
      const keys = Object.keys(result).sort()
      expect(keys).toEqual(['2025-12', '2026-01', '2026-02', '2026-03', '2026-04', '2026-05'])
    } finally {
      if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true })
    }
  })

  it('missing month returns empty array not undefined', async () => {
    let tmpDir = ''
    try {
      tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hermes-months2-'))
      process.env.HERMES_DATA_PATH = tmpDir
      const result = await readMonths('2026-03', 2)
      expect(result['2026-02']).toEqual([])
      expect(result['2026-03']).toEqual([])
    } finally {
      if (tmpDir) await fs.rm(tmpDir, { recursive: true, force: true })
    }
  })
})
