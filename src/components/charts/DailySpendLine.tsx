'use client'

import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { ChartFrame, ChartEmpty } from './ChartFrame'

interface DailySpendLineProps {
  data: { date: string; cumulative: number }[]
}

const config = {
  cumulative: { label: 'Cumulative', color: 'var(--chart-1)' },
} satisfies ChartConfig

const fmtAxis = (v: number) => `RM ${new Intl.NumberFormat('en-MY', { notation: 'compact' }).format(v)}`

export default function DailySpendLine({ data }: DailySpendLineProps) {
  if (data.length === 0) return <ChartEmpty title="Cumulative spending" />

  return (
    <ChartFrame title="Cumulative spending">
      <ChartContainer config={config} className="h-[240px] w-full">
        <AreaChart data={data} margin={{ left: 4, right: 12, top: 8, bottom: 4 }}>
          <defs>
            <linearGradient id="spendFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="var(--color-cumulative)" stopOpacity={0.28} />
              <stop offset="95%" stopColor="var(--color-cumulative)" stopOpacity={0} />
            </linearGradient>
          </defs>
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
          <Area
            dataKey="cumulative"
            type="monotone"
            stroke="var(--color-cumulative)"
            strokeWidth={2}
            fill="url(#spendFill)"
            dot={false}
          />
        </AreaChart>
      </ChartContainer>
    </ChartFrame>
  )
}
