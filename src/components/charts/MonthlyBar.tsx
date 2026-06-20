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

const config = {
  income: { label: 'Income', color: 'var(--chart-1)' },
  expense: { label: 'Expenses', color: 'var(--chart-3)' },
} satisfies ChartConfig

export default function MonthlyBar({ data }: MonthlyBarProps) {
  return (
    <ChartFrame title="Income vs expenses · 6 months">
      <ChartContainer config={config} className="h-[260px] w-full">
        <BarChart data={data} margin={{ left: 4, right: 12, top: 8, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis dataKey="month" tickLine={false} axisLine={false} tickMargin={8} fontSize={11} />
          <YAxis
            tickFormatter={(v: number) => `RM ${v}`}
            tickLine={false}
            axisLine={false}
            width={64}
            fontSize={11}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <ChartLegend content={<ChartLegendContent />} />
          <Bar dataKey="income" fill="var(--color-income)" radius={[3, 3, 0, 0]} />
          <Bar dataKey="expense" fill="var(--color-expense)" radius={[3, 3, 0, 0]} />
        </BarChart>
      </ChartContainer>
    </ChartFrame>
  )
}
