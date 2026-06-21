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
const DailySpendActual = dynamic(() => import('./charts/DailySpendActual'), {
  ssr: false,
  loading: () => <Skeleton h="h-[352px]" />,
})

interface OverviewChartsProps {
  donut: { category: string; amount: number }[]
  daily: { date: string; cumulative: number }[]
  dailyActual: { date: string; amount: number }[]
  monthly: { month: string; income: number; expense: number }[]
  trend: CategoryMonthRow[]
}

export default function OverviewCharts({ donut, daily, dailyActual, monthly, trend }: OverviewChartsProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:gap-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <MonthlyBar data={monthly} />
        </div>
        <CategoryDonut data={donut} />
      </div>
      <div className="grid gap-4 md:gap-6 md:grid-cols-2">
        <DailySpendLine data={daily} />
        <CategoryTrend data={trend} />
      </div>
      <DailySpendActual data={dailyActual} />
    </div>
  )
}
