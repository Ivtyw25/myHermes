import { Card } from '@/components/ui/card'
import { formatMYR } from '@/lib/format'

interface KPICardsProps {
  totalIncome: number
  totalExpense: number
  netBalance: number
}

export default function KPICards({ totalIncome, totalExpense, netBalance }: KPICardsProps) {
  const items = [
    { label: 'Income', value: totalIncome, tone: 'pos' as const, signed: false },
    { label: 'Expenses', value: totalExpense, tone: 'neg' as const, signed: false },
    {
      label: 'Net balance',
      value: netBalance,
      tone: netBalance >= 0 ? ('pos' as const) : ('neg' as const),
      signed: true,
    },
  ]

  return (
    <Card className="grid grid-cols-1 gap-0 divide-y divide-border p-0 sm:grid-cols-3 sm:divide-x sm:divide-y-0">
      {items.map((it) => (
        <div key={it.label} className="px-6 py-5">
          <p className="text-xs uppercase tracking-wide text-muted-foreground">{it.label}</p>
          <p
            className={`mt-2 nums text-2xl ${it.tone === 'pos' ? 'text-pos' : 'text-neg'}`}
          >
            {formatMYR(it.value, { signed: it.signed })}
          </p>
        </div>
      ))}
    </Card>
  )
}
