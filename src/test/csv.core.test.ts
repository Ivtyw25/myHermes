import { describe, it, expect, vi, beforeEach } from 'vitest'
import path from 'path'
import { readMonth, normalizeCategory } from '@/lib/csv'

const FIXTURE_DIR = path.resolve(__dirname, 'fixtures')

describe('normalizeCategory', () => {
  it('trims whitespace and lowercases', () => {
    expect(normalizeCategory('  Food  ')).toBe('food')
    expect(normalizeCategory('TRANSPORT')).toBe('transport')
    expect(normalizeCategory('anniversary & celebration')).toBe('anniversary & celebration')
  })
})

describe('readMonth', () => {
  beforeEach(() => {
    process.env.HERMES_DATA_PATH = FIXTURE_DIR
  })

  it('returns an array for a queried month', async () => {
    const transactions = await readMonth(2026, 5)
    expect(Array.isArray(transactions)).toBe(true)
  })

  it('returns [] when file does not exist', async () => {
    const result = await readMonth(2099, 12)
    expect(result).toEqual([])
  })

  it('throws on invalid year', async () => {
    await expect(readMonth(1999, 1)).rejects.toThrow()
    await expect(readMonth(2101, 1)).rejects.toThrow()
  })

  it('does not throw on boundary years', async () => {
    await expect(readMonth(2000, 1)).resolves.toBeDefined()
    await expect(readMonth(2100, 12)).resolves.toBeDefined()
  })

  it('throws on invalid month', async () => {
    await expect(readMonth(2026, 0)).rejects.toThrow()
    await expect(readMonth(2026, 13)).rejects.toThrow()
  })
})

describe('readMonth row validation', () => {
  it('skips rows with invalid type and returns valid rows', async () => {
    const fs = await import('fs/promises')
    const os = await import('os')
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hermes-test-'))
    await fs.writeFile(
      path.join(tmpDir, '2026-01.csv'),
      'Name,Date,Type,Amount,Category\nvalid row,2026-01-10,expense,10.00,food\nbad type row,2026-01-11,transfer,10.00,food\n'
    )
    process.env.HERMES_DATA_PATH = tmpDir
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = await readMonth(2026, 1)
    expect(result).toHaveLength(1)
    expect(result[0].name).toBe('valid row')
    expect(consoleSpy).toHaveBeenCalled()
    consoleSpy.mockRestore()
    await fs.rm(tmpDir, { recursive: true })
  })

  it('skips rows with invalid category', async () => {
    const fs = await import('fs/promises')
    const os = await import('os')
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hermes-test-'))
    await fs.writeFile(
      path.join(tmpDir, '2026-02.csv'),
      'Name,Date,Type,Amount,Category\ngood,2026-02-01,expense,5.00,food\nbad cat,2026-02-02,expense,5.00,gambling\n'
    )
    process.env.HERMES_DATA_PATH = tmpDir
    const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = await readMonth(2026, 2)
    expect(result).toHaveLength(1)
    consoleSpy.mockRestore()
    await fs.rm(tmpDir, { recursive: true })
  })

  it('skips rows with negative or zero amount', async () => {
    const fs = await import('fs/promises')
    const os = await import('os')
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hermes-test-'))
    await fs.writeFile(
      path.join(tmpDir, '2026-03.csv'),
      'Name,Date,Type,Amount,Category\ngood,2026-03-01,expense,5.00,food\nbad amount,2026-03-02,expense,-10.00,food\nzero,2026-03-03,expense,0,food\n'
    )
    process.env.HERMES_DATA_PATH = tmpDir
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = await readMonth(2026, 3)
    expect(result).toHaveLength(1)
    await fs.rm(tmpDir, { recursive: true })
  })

  it('skips rows with malformed date', async () => {
    const fs = await import('fs/promises')
    const os = await import('os')
    const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), 'hermes-test-'))
    await fs.writeFile(
      path.join(tmpDir, '2026-04.csv'),
      'Name,Date,Type,Amount,Category\ngood,2026-04-01,expense,5.00,food\nbad date,20/04/2026,expense,5.00,food\n'
    )
    process.env.HERMES_DATA_PATH = tmpDir
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const result = await readMonth(2026, 4)
    expect(result).toHaveLength(1)
    await fs.rm(tmpDir, { recursive: true })
  })
})
