'use client'

import { useState } from 'react'
import type { Transaction } from '@/lib/csv'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { formatMYR } from '@/lib/format'

interface TransactionTableProps {
  transactions: Transaction[]
  availableCategories: string[] // categories present in this month's data
}

type TypeFilter = 'all' | 'income' | 'expense'

export default function TransactionTable({
  transactions,
  availableCategories,
}: TransactionTableProps) {
  const [typeFilter, setTypeFilter] = useState<TypeFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<string>('all')

  const filtered = transactions.filter((t) => {
    if (typeFilter !== 'all' && t.type !== typeFilter) return false
    if (categoryFilter !== 'all' && t.category !== categoryFilter) return false
    return true
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Select
          value={typeFilter}
          onValueChange={(v) => setTypeFilter((v ?? 'all') as TypeFilter)}
        >
          <SelectTrigger className="w-36" aria-label="Filter by type">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>

        <Select value={categoryFilter} onValueChange={(v) => setCategoryFilter(v ?? 'all')}>
          <SelectTrigger className="w-52" aria-label="Filter by category">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All categories</SelectItem>
            {availableCategories.map((c) => (
              <SelectItem key={c} value={c} className="capitalize">
                {c}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <span className="nums ml-auto text-xs text-muted-foreground">
          {filtered.length} / {transactions.length}
        </span>
      </div>

      <div className="overflow-x-auto rounded-lg border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="py-10 text-center text-sm text-muted-foreground">
                  No transactions match these filters.
                </TableCell>
              </TableRow>
            ) : (
              filtered.map((t, i) => (
                <TableRow key={`${t.date}-${t.name}-${i}`}>
                  <TableCell className="nums text-muted-foreground">{t.date}</TableCell>
                  <TableCell className="text-foreground">{t.name}</TableCell>
                  <TableCell className="capitalize text-muted-foreground">{t.category}</TableCell>
                  <TableCell>
                    <Badge
                      variant="outline"
                      className={`capitalize ${t.type === 'income' ? 'text-pos' : 'text-neg'}`}
                    >
                      {t.type}
                    </Badge>
                  </TableCell>
                  <TableCell
                    className={`nums text-right ${t.type === 'income' ? 'text-pos' : 'text-neg'}`}
                  >
                    {formatMYR(t.amount)}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
