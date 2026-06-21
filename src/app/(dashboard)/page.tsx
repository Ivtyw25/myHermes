import {
  readMonth,
  readMonths,
  aggregateByCategoryDonut,
  aggregateDailySpend,
  aggregateDailyActual,
  aggregateByCategoryMonth,
  getBillingPeriodTransactions,
  type Transaction,
} from '@/lib/csv'
import { getAvailableMonths, parseMonthParam } from '@/lib/months'
import { formatMonthShort } from '@/lib/format'
import MonthSummaryHero from '@/components/MonthSummaryHero'
import OverviewCharts from '@/components/OverviewCharts'
import TransactionTable from '@/components/TransactionTable'
import MonthSelector from '@/components/MonthSelector'
import { getServerSession } from 'next-auth'
import { redirect } from 'next/navigation'
import { authOptions } from '@/lib/auth'
import { Suspense } from 'react'

export const dynamic = 'force-dynamic'

const round2 = (n: number) => Math.round(n * 100) / 100
const sumBy = (txns: Transaction[], type: 'income' | 'expense') =>
  txns.filter((t) => t.type === type).reduce((s, t) => s + t.amount, 0)
const pct = (curr: number, prev: number | null) =>
  prev !== null && prev !== 0 ? ((curr - prev) / Math.abs(prev)) * 100 : null

export default async function FinancePage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const { month } = await searchParams
  const months = await getAvailableMonths()
  const { year, monthNum, key } = parseMonthParam(month, months[0] ?? '')

  const [transactions, multiMonth] = await Promise.all([
    readMonth(year, monthNum),
    readMonths(key, 6),
  ])

  const totalIncome = sumBy(transactions, 'income')
  const totalExpense = sumBy(transactions, 'expense')
  const netBalance = round2(totalIncome - totalExpense)

  const monthKeys = Object.keys(multiMonth)
  const prevIdx = monthKeys.indexOf(key) - 1
  const prevTxns = prevIdx >= 0 ? multiMonth[monthKeys[prevIdx]] : null
  const prevIncome = prevTxns ? sumBy(prevTxns, 'income') : null
  const prevExpense = prevTxns ? sumBy(prevTxns, 'expense') : null
  const prevNet = prevTxns ? round2((prevIncome ?? 0) - (prevExpense ?? 0)) : null
  const netDelta = pct(netBalance, prevNet)

  const availableCategories = [...new Set(transactions.map((t) => t.category))].sort()

  const billingTxns = getBillingPeriodTransactions(prevTxns ?? [], transactions)
  const donut = aggregateByCategoryDonut(transactions)
  const daily = aggregateDailySpend(billingTxns)
  const dailyActual = aggregateDailyActual(billingTxns)
  const trend = aggregateByCategoryMonth(multiMonth)
  const monthly = Object.entries(multiMonth).map(([k, txns]) => ({
    month: formatMonthShort(k),
    income: round2(sumBy(txns, 'income')),
    expense: round2(sumBy(txns, 'expense')),
  }))

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-4">
        <h2 className="text-sm font-medium text-muted-foreground">Monthly summary</h2>
        <Suspense fallback={null}>
          <MonthSelector months={months} />
        </Suspense>
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 [animation-fill-mode:both]">
        <MonthSummaryHero
          monthLabel={key}
          income={totalIncome}
          expense={totalExpense}
          net={netBalance}
          netDelta={netDelta}
        />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 [animation-delay:80ms] [animation-fill-mode:both]">
        <OverviewCharts donut={donut} daily={daily} dailyActual={dailyActual} monthly={monthly} trend={trend} />
      </div>

      <div className="animate-in fade-in slide-in-from-bottom-3 duration-500 [animation-delay:160ms] [animation-fill-mode:both]">
        <div className="space-y-3">
          <h2 className="text-sm font-medium text-muted-foreground">Transactions</h2>
          <TransactionTable transactions={transactions} availableCategories={availableCategories} />
        </div>
      </div>
    </div>
  )
}
