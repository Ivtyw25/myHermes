'use client'

import { CartesianGrid, Line, LineChart, XAxis, YAxis } from 'recharts'
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

export default function DailySpendLine({ data }: DailySpendLineProps) {
  if (data.length === 0) return <ChartEmpty title="Cumulative spending" />

  return (
    <ChartFrame title="Cumulative spending">
      <ChartContainer config={config} className="h-[240px] w-full">
        <LineChart data={data} margin={{ left: 4, right: 12, top: 8, bottom: 4 }}>
          <CartesianGrid vertical={false} stroke="var(--border)" />
          <XAxis
            dataKey="date"
            tickFormatter={(d: string) => String(parseInt(d.split('-')[2] ?? '0', 10))}
            tickLine={false}
            axisLine={false}
            tickMargin={8}
            fontSize={11}
          />
          <YAxis
            tickFormatter={(v: number) => `RM ${v}`}
            tickLine={false}
            axisLine={false}
            width={64}
            fontSize={11}
          />
          <ChartTooltip content={<ChartTooltipContent />} />
          <Line
            dataKey="cumulative"
            type="monotone"
            stroke="var(--color-cumulative)"
            strokeWidth={2}
            dot={false}
          />
        </LineChart>
      </ChartContainer>
    </ChartFrame>
  )
}
