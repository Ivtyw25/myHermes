import { readMonth } from '@/lib/csv'
import { getAvailableMonths, parseMonthParam } from '@/lib/months'
import { formatMonthLabel } from '@/lib/format'
import KPICards from '@/components/KPICards'
import TopTransactions from '@/components/TopTransactions'
import { Card } from '@/components/ui/card'

export const dynamic = 'force-dynamic'

function ChartPlaceholder({ title }: { title: string }) {
  return (
    <Card className="flex h-64 flex-col p-6">
      <p className="text-xs uppercase tracking-wide text-muted-foreground">{title}</p>
      <div className="flex flex-1 items-center justify-center">
        <p className="text-sm text-muted-foreground">Chart added in Phase 3</p>
      </div>
    </Card>
  )
}

export default async function OverviewPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month } = await searchParams
  const months = await getAvailableMonths()
  const { year, monthNum, key } = parseMonthParam(month, months[0] ?? '')

  const transactions = await readMonth(year, monthNum)
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

  return (
    <div className="space-y-8">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Overview</h1>
        <p className="nums text-sm text-muted-foreground">{formatMonthLabel(key)}</p>
      </div>

      <KPICards totalIncome={totalIncome} totalExpense={totalExpense} netBalance={netBalance} />

      <div className="grid gap-6 lg:grid-cols-2">
        <ChartPlaceholder title="Spending by category" />
        <ChartPlaceholder title="Cumulative spending" />
      </div>

      <TopTransactions transactions={topExpenses} />
    </div>
  )
}
