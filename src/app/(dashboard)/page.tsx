import {
  readMonth,
  readMonths,
  aggregateByCategoryDonut,
  aggregateDailySpend,
  aggregateByCategoryMonth,
} from '@/lib/csv'
import { getAvailableMonths, parseMonthParam } from '@/lib/months'
import { formatMonthLabel, formatMonthShort } from '@/lib/format'
import KPICards from '@/components/KPICards'
import TopTransactions from '@/components/TopTransactions'
import OverviewCharts from '@/components/OverviewCharts'

export const dynamic = 'force-dynamic'

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month } = await searchParams
  const months = await getAvailableMonths()
  const { year, monthNum, key } = parseMonthParam(month, months[0] ?? '')

  const [transactions, multiMonth] = await Promise.all([
    readMonth(year, monthNum),
    readMonths(key, 6),
  ])

  const totalIncome = transactions
    .filter((t) => t.type === 'income')
    .reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions
    .filter((t) => t.type === 'expense')
    .reduce((s, t) => s + t.amount, 0)
  const netBalance = Math.round((totalIncome - totalExpense) * 100) / 100

  const topExpenses = transactions
    .filter((t) => t.type === 'expense')
    .sort((a, b) => b.amount - a.amount)
    .slice(0, 5)

  const donut = aggregateByCategoryDonut(transactions)
  const daily = aggregateDailySpend(transactions)
  const trend = aggregateByCategoryMonth(multiMonth)
  const monthly = Object.entries(multiMonth).map(([k, txns]) => ({
    month: formatMonthShort(k),
    income:
      Math.round(txns.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0) * 100) /
      100,
    expense:
      Math.round(txns.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0) * 100) /
      100,
  }))

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Overview</h1>
        <p className="nums text-sm text-muted-foreground">{formatMonthLabel(key)}</p>
      </div>

      <KPICards totalIncome={totalIncome} totalExpense={totalExpense} netBalance={netBalance} />

      <OverviewCharts donut={donut} daily={daily} monthly={monthly} trend={trend} />

      <TopTransactions transactions={topExpenses} />
    </div>
  )
}
