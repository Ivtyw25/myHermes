import { readMonth } from '@/lib/csv'
import { getAvailableMonths, parseMonthParam } from '@/lib/months'
import { formatMonthLabel } from '@/lib/format'
import TransactionTable from '@/components/TransactionTable'

export const dynamic = 'force-dynamic'

export default async function TransactionsPage({
  searchParams,
}: {
  searchParams: Promise<{ month?: string }>
}) {
  const { month } = await searchParams
  const months = await getAvailableMonths()
  const { year, monthNum, key } = parseMonthParam(month, months[0] ?? '')

  const transactions = await readMonth(year, monthNum)
  const availableCategories = [...new Set(transactions.map((t) => t.category))].sort()

  return (
    <div className="space-y-6">
      <div className="flex items-baseline justify-between">
        <h1 className="text-lg font-semibold tracking-tight">Transactions</h1>
        <p className="nums text-sm text-muted-foreground">{formatMonthLabel(key)}</p>
      </div>
      <TransactionTable transactions={transactions} availableCategories={availableCategories} />
    </div>
  )
}
