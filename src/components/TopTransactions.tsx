import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import type { Transaction } from '@/lib/csv'
import { formatMYR } from '@/lib/format'

interface TopTransactionsProps {
  transactions: Transaction[] // pre-filtered expense, sorted desc, max 5
}

export default function TopTransactions({ transactions }: TopTransactionsProps) {
  return (
    <Card className="gap-0 py-0">
      <CardHeader className="px-6 pt-5 pb-3">
        <CardTitle className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          Top expenses
        </CardTitle>
      </CardHeader>
      <CardContent className="px-0 pb-2">
        {transactions.length === 0 ? (
          <p className="px-6 pb-4 text-sm text-muted-foreground">
            No expenses recorded this month.
          </p>
        ) : (
          <ul className="divide-y divide-border">
            {transactions.map((t, i) => (
              <li
                key={`${t.date}-${t.name}-${i}`}
                className="flex items-center justify-between gap-4 px-6 py-3"
              >
                <div className="flex min-w-0 items-baseline gap-3">
                  <span className="nums w-4 shrink-0 text-xs text-muted-foreground">{i + 1}</span>
                  <div className="min-w-0">
                    <p className="truncate text-sm text-foreground">{t.name}</p>
                    <p className="nums text-xs text-muted-foreground">
                      {t.date} · <span className="capitalize">{t.category}</span>
                    </p>
                  </div>
                </div>
                <span className="nums shrink-0 text-sm text-neg">{formatMYR(t.amount)}</span>
              </li>
            ))}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}
