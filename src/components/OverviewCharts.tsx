'use client'

import dynamic from 'next/dynamic'
import type { CategoryMonthRow } from '@/lib/csv'

function Skeleton({ h }: { h: string }) {
  return <div className={`w-full animate-pulse rounded-xl border border-border bg-card ${h}`} />
}

// Charts use Recharts (browser-only). next/dynamic with ssr:false is only legal
// inside a Client Component on Next 15+, which is why this wrapper exists.
const CategoryDonut = dynamic(() => import('./charts/CategoryDonut'), {
  ssr: false,
  loading: () => <Skeleton h="h-[332px]" />,
})
const DailySpendLine = dynamic(() => import('./charts/DailySpendLine'), {
  ssr: false,
  loading: () => <Skeleton h="h-[332px]" />,
})
const MonthlyBar = dynamic(() => import('./charts/MonthlyBar'), {
  ssr: false,
  loading: () => <Skeleton h="h-[352px]" />,
})
const CategoryTrend = dynamic(() => import('./charts/CategoryTrend'), {
  ssr: false,
  loading: () => <Skeleton h="h-[352px]" />,
})

interface OverviewChartsProps {
  donut: { category: string; amount: number }[]
  daily: { date: string; cumulative: number }[]
  monthly: { month: string; income: number; expense: number }[]
  trend: CategoryMonthRow[]
}

export default function OverviewCharts({ donut, daily, monthly, trend }: OverviewChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-2">
        <CategoryDonut data={donut} />
        <DailySpendLine data={daily} />
      </div>
      <MonthlyBar data={monthly} />
      <CategoryTrend data={trend} />
    </div>
  )
}
