'use client'

import { Cell, Pie, PieChart } from 'recharts'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from '@/components/ui/chart'
import { ChartFrame, ChartEmpty } from './ChartFrame'

interface CategoryDonutProps {
  data: { category: string; amount: number }[]
}

const PALETTE = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--primary)',
  'var(--muted-foreground)',
  'var(--color-neg)',
  'var(--secondary-foreground)',
]

export default function CategoryDonut({ data }: CategoryDonutProps) {
  if (data.length === 0) return <ChartEmpty title="Spending by category" />

  const chartData = data.map((d, i) => ({ ...d, fill: PALETTE[i % PALETTE.length] }))
  const config: ChartConfig = Object.fromEntries(
    data.map((d, i) => [d.category, { label: d.category, color: PALETTE[i % PALETTE.length] }])
  )

  return (
    <ChartFrame title="Spending by category">
      <ChartContainer config={config} className="mx-auto aspect-square max-h-[240px]">
        <PieChart>
          <ChartTooltip content={<ChartTooltipContent nameKey="category" hideLabel />} />
          <Pie
            data={chartData}
            dataKey="amount"
            nameKey="category"
            innerRadius={56}
            outerRadius={86}
            paddingAngle={2}
            strokeWidth={1}
          >
            {chartData.map((d) => (
              <Cell key={d.category} fill={d.fill} />
            ))}
          </Pie>
        </PieChart>
      </ChartContainer>
    </ChartFrame>
  )
}
