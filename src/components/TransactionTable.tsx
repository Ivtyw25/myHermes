'use client'

import { useState, useMemo } from 'react'
import type { Transaction } from '@/lib/csv'
import { motion, AnimatePresence } from 'framer-motion'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatMYR } from '@/lib/format'
import { ArrowUpDown, ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react'

const PAGE_SIZE = 10

type SortKey = 'date' | 'name' | 'category' | 'amount'

interface TransactionTableProps {
  transactions: Transaction[]
  availableCategories: string[]
}

function CheckItem({
  label,
  checked,
  onChange,
  bold,
}: {
  label: string
  checked: boolean
  onChange: () => void
  bold?: boolean
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2.5 rounded-lg px-2 py-1.5 hover:bg-muted select-none">
      <span
        className={`flex size-4 shrink-0 items-center justify-center rounded border transition-colors ${
          checked
            ? 'border-primary bg-primary'
            : 'border-border bg-card'
        }`}
      >
        {checked && (
          <svg viewBox="0 0 10 8" className="size-2.5" fill="none">
            <path d="M1 4l2.5 2.5L9 1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="text-primary-foreground" />
          </svg>
        )}
      </span>
      <input
        type="checkbox"
        checked={checked}
        onChange={onChange}
        className="sr-only"
        aria-label={label}
      />
      <span className={`text-sm capitalize ${bold ? 'font-medium' : ''}`}>{label}</span>
    </label>
  )
}

export default function TransactionTable({
  transactions,
  availableCategories,
}: TransactionTableProps) {
  const [selectedTypes, setSelectedTypes] = useState<Set<string>>(
    new Set(['income', 'expense'])
  )
  const [selectedCats, setSelectedCats] = useState<Set<string>>(
    new Set(availableCategories)
  )
  const [page, setPage] = useState(0)
  const [pageKey, setPageKey] = useState(0)
  const [sort, setSort] = useState<{ key: SortKey; dir: 'asc' | 'desc' } | null>(null)

  const filtered = useMemo(() => {
    const base = transactions.filter(
      (t) => selectedTypes.has(t.type) && selectedCats.has(t.category)
    )
    if (!sort) return base
    return [...base].sort((a, b) => {
      const v =
        sort.key === 'amount'
          ? a.amount - b.amount
          : sort.key === 'date'
            ? a.date.localeCompare(b.date)
            : (a[sort.key] as string).localeCompare(b[sort.key] as string)
      return sort.dir === 'asc' ? v : -v
    })
  }, [transactions, selectedTypes, selectedCats, sort])

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const safePage = Math.min(page, totalPages - 1)
  const pageRows = filtered.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE)

  const toggleSort = (key: SortKey) => {
    setPage(0)
    setSort((prev) => {
      if (!prev || prev.key !== key) return { key, dir: 'asc' }
      if (prev.dir === 'asc') return { key, dir: 'desc' }
      return null
    })
  }

  function SortIcon({ col }: { col: SortKey }) {
    if (!sort || sort.key !== col) return <ArrowUpDown className="size-3 opacity-40" />
    return sort.dir === 'asc'
      ? <ChevronUp className="size-3" />
      : <ChevronDown className="size-3" />
  }

  const toggleType = (type: string) => {
    setPage(0)
    setSelectedTypes((prev) => {
      const next = new Set(prev)
      next.has(type) ? next.delete(type) : next.add(type)
      return next
    })
  }

  const toggleCat = (cat: string) => {
    setPage(0)
    setSelectedCats((prev) => {
      const next = new Set(prev)
      next.has(cat) ? next.delete(cat) : next.add(cat)
      return next
    })
  }

  const allCatsSelected = selectedCats.size === availableCategories.length
  const toggleAllCats = () => {
    setPage(0)
    setSelectedCats(allCatsSelected ? new Set() : new Set(availableCategories))
  }

  const typeLabel =
    selectedTypes.size === 2
      ? 'All types'
      : selectedTypes.size === 0
        ? 'No types'
        : selectedTypes.has('income')
          ? 'Income only'
          : 'Expense only'

  const catLabel =
    selectedCats.size === 0
      ? 'None selected'
      : selectedCats.size === availableCategories.length
        ? 'All categories'
        : `${selectedCats.size} of ${availableCategories.length}`

  return (
    <div className="space-y-3">
      {/* Filter toolbar */}
      <div className="flex flex-wrap items-center gap-2">
        {/* Type filter */}
        <Popover>
          <PopoverTrigger className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            {typeLabel}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-44 p-1.5">
            {(['income', 'expense'] as const).map((type) => (
              <CheckItem
                key={type}
                label={type}
                checked={selectedTypes.has(type)}
                onChange={() => toggleType(type)}
              />
            ))}
          </PopoverContent>
        </Popover>

        {/* Category filter */}
        <Popover>
          <PopoverTrigger className="inline-flex items-center gap-1.5 rounded-lg border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground transition-colors hover:bg-muted">
            {catLabel}
            <ChevronDown className="size-3.5 text-muted-foreground" />
          </PopoverTrigger>
          <PopoverContent side="bottom" align="start" className="w-52 p-1.5">
            <div className="mb-1 border-b border-border pb-1">
              <CheckItem
                label="All categories"
                checked={allCatsSelected}
                onChange={toggleAllCats}
                bold
              />
            </div>
            {availableCategories.map((cat) => (
              <CheckItem
                key={cat}
                label={cat}
                checked={selectedCats.has(cat)}
                onChange={() => toggleCat(cat)}
              />
            ))}
          </PopoverContent>
        </Popover>

        <span className="nums ml-auto text-xs text-muted-foreground">
          {filtered.length} / {transactions.length}
        </span>
      </div>

      {/* Table */}
      <div className="overflow-x-auto rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow className="border-b border-border bg-muted/40 hover:bg-muted/40">
              {(['date', 'name', 'category'] as const).map((col) => (
                <TableHead key={col}>
                  <button
                    onClick={() => toggleSort(col)}
                    className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-subtle-foreground hover:text-foreground transition-colors"
                  >
                    {col.charAt(0).toUpperCase() + col.slice(1)}
                    <SortIcon col={col} />
                  </button>
                </TableHead>
              ))}
              <TableHead className="hidden sm:table-cell text-xs font-medium uppercase tracking-wider text-subtle-foreground">
                Type
              </TableHead>
              <TableHead className="text-right">
                <button
                  onClick={() => toggleSort('amount')}
                  className="inline-flex items-center gap-1 text-xs font-medium uppercase tracking-wider text-subtle-foreground hover:text-foreground transition-colors ml-auto"
                >
                  Amount
                  <SortIcon col="amount" />
                </button>
              </TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <AnimatePresence mode="popLayout" initial={false}>
              {pageRows.length === 0 ? (
                <TableRow key="empty">
                  <TableCell
                    colSpan={5}
                    className="py-12 text-center text-sm text-muted-foreground"
                  >
                    No transactions match these filters.
                  </TableCell>
                </TableRow>
              ) : (
                pageRows.map((t, i) => (
                  <motion.tr
                    key={`${pageKey}-${i}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -4 }}
                    transition={{ duration: 0.18, delay: i * 0.025, ease: 'easeOut' }}
                    className="border-b border-border transition-colors last:border-0 hover:bg-muted/50"
                  >
                    <TableCell className="nums py-3.5 text-xs sm:text-sm text-muted-foreground">
                      {t.date}
                    </TableCell>
                    <TableCell className="py-3.5 text-xs sm:text-sm font-medium text-foreground">
                      {t.name}
                    </TableCell>
                    <TableCell className="py-3.5">
                      <span className="inline-flex items-center gap-1.5 rounded-full bg-muted px-2 sm:px-3 py-1 text-xs sm:text-sm capitalize text-muted-foreground">
                        {t.category}
                      </span>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell py-3.5">
                      <Badge
                        variant="outline"
                        className={`capitalize text-xs sm:text-sm ${
                          t.type === 'income'
                            ? 'border-transparent bg-pos-bg text-pos'
                            : 'border-transparent bg-neg-bg text-neg'
                        }`}
                      >
                        {t.type}
                      </Badge>
                    </TableCell>
                    <TableCell
                      className={`nums py-3.5 text-right text-xs sm:text-sm font-medium ${
                        t.type === 'income' ? 'text-pos' : 'text-neg'
                      }`}
                    >
                      {formatMYR(t.amount)}
                    </TableCell>
                  </motion.tr>
                ))
              )}
            </AnimatePresence>
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-1">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setPageKey((k) => k + 1); setPage((p) => Math.max(0, p - 1)) }}
            disabled={safePage === 0}
            className="gap-1.5 text-muted-foreground"
          >
            <ChevronLeft className="size-3.5" />
            Previous
          </Button>
          <span className="nums text-xs text-muted-foreground">
            {safePage + 1} / {totalPages}
          </span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => { setPageKey((k) => k + 1); setPage((p) => Math.min(totalPages - 1, p + 1)) }}
            disabled={safePage === totalPages - 1}
            className="gap-1.5 text-muted-foreground"
          >
            Next
            <ChevronRight className="size-3.5" />
          </Button>
        </div>
      )}
    </div>
  )
}
