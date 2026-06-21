'use client'

import { useState, useMemo } from 'react'
import { Line, LineChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { formatMYR } from '@/lib/format'
import { ChartEmpty } from './ChartFrame'

interface DailySpendActualProps {
  data: { date: string; amount: number }[]
}

type Period = 'monthly' | 'weekly' | 'custom'

const config = {
  amount: { label: 'Spending', color: 'var(--chart-2)' },
} satisfies ChartConfig

const fmtAxis = (v: number) =>
  `RM ${new Intl.NumberFormat('en-MY', { notation: 'compact' }).format(v)}`

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr)
  d.setDate(d.getDate() + days)
  return d.toISOString().slice(0, 10)
}

function daysBetween(start: string, end: string): number {
  return Math.round((new Date(end).getTime() - new Date(start).getTime()) / 86400000) + 1
}

export default function DailySpendActual({ data }: DailySpendActualProps) {
  const [period, setPeriod] = useState<Period>('monthly')
  const [customStart, setCustomStart] = useState('')
  const [customEnd, setCustomEnd] = useState('')

  const filtered = useMemo(() => {
    if (data.length === 0) return data
    if (period === 'monthly') return data
    if (period === 'weekly') {
      const end = data[data.length - 1].date
      const start = addDays(end, -6)
      return data.filter((d) => d.date >= start && d.date <= end)
    }
    if (!customStart || !customEnd) return data
    return data.filter((d) => d.date >= customStart && d.date <= customEnd)
  }, [data, period, customStart, customEnd])

  const dayCount = useMemo(() => {
    if (period === 'weekly') return 7
    if (period === 'custom' && customStart && customEnd && customEnd >= customStart)
      return daysBetween(customStart, customEnd)
    if (data.length >= 2) return daysBetween(data[0].date, data[data.length - 1].date)
    return Math.max(1, filtered.length)
  }, [period, data, filtered, customStart, customEnd])

  const totalSpend = filtered.reduce((s, d) => s + d.amount, 0)
  const avgDaily = dayCount > 0 ? totalSpend / dayCount : 0

  if (data.length === 0) return <ChartEmpty title="Daily spending" />

  return (
    <Card className="gap-0 py-0">
      <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between px-4 sm:px-6 pt-5 pb-0">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Daily spending
        </p>
        <div className="flex rounded-lg border border-border bg-muted/40 p-0.5 text-xs">
          {(['monthly', 'weekly', 'custom'] as Period[]).map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`rounded-md px-2.5 py-1 font-medium capitalize transition-colors ${
                period === p
                  ? 'bg-card text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </CardHeader>
      <CardContent className="px-4 pt-2 pb-4">
        {period === 'custom' && (
          <div className="flex flex-wrap items-center gap-2 px-2 pt-2 pb-1">
            <Popover>
              <PopoverTrigger className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                {customStart || 'Start date'}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={customStart ? new Date(customStart) : undefined}
                  onSelect={(d) => setCustomStart(d ? d.toISOString().slice(0, 10) : '')}
                />
              </PopoverContent>
            </Popover>
            <span className="text-xs text-muted-foreground">to</span>
            <Popover>
              <PopoverTrigger className="inline-flex items-center rounded-lg border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted">
                {customEnd || 'End date'}
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={customEnd ? new Date(customEnd) : undefined}
                  onSelect={(d) => setCustomEnd(d ? d.toISOString().slice(0, 10) : '')}
                />
              </PopoverContent>
            </Popover>
          </div>
        )}
        <ChartContainer config={config} className="h-[240px] w-full">
          <LineChart data={filtered} margin={{ left: 4, right: 12, top: 8, bottom: 4 }}>
            <CartesianGrid vertical={false} stroke="var(--border)" />
            <XAxis
              dataKey="date"
              tickFormatter={(d: string) => d.slice(5).replace('-', '/')}
              tickLine={false}
              axisLine={false}
              tickMargin={8}
              fontSize={11}
            />
            <YAxis
              tickFormatter={fmtAxis}
              tickLine={false}
              axisLine={false}
              width={52}
              fontSize={11}
            />
            <ChartTooltip content={<ChartTooltipContent />} />
            <Line
              dataKey="amount"
              type="monotone"
              stroke="var(--color-amount)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
        <div className="flex items-baseline gap-1.5 border-t border-border px-2 pt-3">
          <span className="nums text-lg font-semibold text-foreground">{formatMYR(avgDaily)}</span>
          <span className="text-xs text-muted-foreground">avg / day</span>
          <span className="nums ml-auto text-xs text-muted-foreground">{formatMYR(totalSpend)} total</span>
        </div>
      </CardContent>
    </Card>
  )
}
