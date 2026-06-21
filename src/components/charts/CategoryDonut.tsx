'use client'

import { Cell, Label, Pie, PieChart } from 'recharts'
import {
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  type ChartConfig,
} from '@/components/ui/chart'
import { formatMYR } from '@/lib/format'
import { ChartFrame, ChartEmpty } from './ChartFrame'

interface CategoryDonutProps {
  data: { category: string; amount: number }[]
}

// Greens + teals only — no red (reserved for negative deltas / Failed status).
const PALETTE = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--primary)',
  'var(--accent-mint)',
  'var(--muted-foreground)',
  'var(--ring)',
]

export default function CategoryDonut({ data }: CategoryDonutProps) {
  if (data.length === 0) return <ChartEmpty title="Spending by category" />

  const total = data.reduce((s, d) => s + d.amount, 0)
  const chartData = data.map((d, i) => ({ ...d, fill: PALETTE[i % PALETTE.length] }))
  const config: ChartConfig = Object.fromEntries(
    data.map((d, i) => [
      d.category,
      { label: d.category === 'Other' ? 'Other categories' : d.category, color: PALETTE[i % PALETTE.length] },
    ])
  )

  return (
    <ChartFrame title="Spending by category">
      <ChartContainer config={config} className="mx-auto aspect-square max-h-[220px] sm:max-h-[280px]">
        <PieChart>
          <ChartTooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const item = payload[0]
              const pct = (((item.value as number) / total) * 100).toFixed(1)
              return (
                <div className="rounded-lg border border-border bg-card px-3 py-2 text-sm shadow-md">
                  <p className="font-medium capitalize">{item.name}</p>
                  <p className="nums text-foreground">{pct}%</p>
                </div>
              )
            }}
          />
          <Pie
            data={chartData}
            dataKey="amount"
            nameKey="category"
            innerRadius={58}
            outerRadius={92}
            paddingAngle={2}
            cornerRadius={4}
            stroke="var(--card)"
            strokeWidth={2}
          >
            {chartData.map((d) => (
              <Cell key={d.category} fill={d.fill} />
            ))}
            <Label
              content={({ viewBox }) => {
                if (!viewBox || !('cx' in viewBox)) return null
                const { cx, cy } = viewBox as { cx: number; cy: number }
                return (
                  <text x={cx} y={cy - 23} textAnchor="middle" dominantBaseline="middle">
                    <tspan
                      style={{
                        fill: 'var(--foreground)',
                        fontSize: '14px',
                        fontFamily: 'var(--font-geist-mono)',
                        fontWeight: '600',
                        letterSpacing: '-0.01em',
                      }}
                    >
                      {formatMYR(total)}
                    </tspan>
                  </text>
                )
              }}
            />
          </Pie>
          <ChartLegend
            content={<ChartLegendContent nameKey="category" className="flex-wrap capitalize" />}
          />
        </PieChart>
      </ChartContainer>
    </ChartFrame>
  )
}
