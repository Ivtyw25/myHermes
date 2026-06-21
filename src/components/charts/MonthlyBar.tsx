'use client'

import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { ChartFrame } from './ChartFrame'

interface MonthlyBarProps {
  data: { month: string; income: number; expense: number }[]
}

// Comparison chart: two-tone green (forest income / mint expense) per the
// design system. Red is reserved for negative deltas + Failed status only.
const config = {
  income: { label: 'Income', color: 'var(--chart-1)' },
  expense: { label: 'Expenses', color: 'var(--accent-mint)' },
} satisfies ChartConfig

const fmtAxis = (v: number) => `RM ${new Intl.NumberFormat('en-MY', { notation: 'compact' }).format(v)}`

export default function MonthlyBar({ data }: MonthlyBarProps) {
  return (
    <ChartFrame title="Income vs expenses · 6 months">
      <ChartContainer config={config} className="h-[300px] w-full">
        <BarChart data={data} margin={{ left: 4, right: 12, top: 8, bottom: 4 }} barCategoryGap="28%">
          <defs>
            <linearGradient id="barIncome" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-income)" stopOpacity={1} />
              <stop offset="100%" stopColor="var(--color-income)" stopOpacity={0.78} />
            </linearGradient>
            <linearGradient id="barExpense" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="var(--color-expense)" stopOpacity={1} />
              <stop offset="100%" stopColor="var(--color-expense)" stopOpacity={0.72} />
            </linearGradient>
          </defs>
          <CartesianGrid vertical={false} stroke="var(--border)" strokeDasharray="3 3" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={10} fontSize={11} />
          <YAxis
            tickFormatter={fmtAxis}
            tickLine={false}
            axisLine={false}
            width={52}
            fontSize={11}
          />
          <ChartTooltip cursor={{ fill: 'var(--muted)', opacity: 0.5 }} content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="income" fill="url(#barIncome)" radius={[6, 6, 0, 0]} maxBarSize={36} />
          <Bar dataKey="expense" fill="url(#barExpense)" radius={[6, 6, 0, 0]} maxBarSize={36} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  )
}
