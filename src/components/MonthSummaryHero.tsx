import { ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { formatMYR } from '@/lib/format'

interface MonthSummaryHeroProps {
  monthLabel: string
  income: number
  expense: number
  net: number
  netDelta: number | null
}

export default function MonthSummaryHero({
  monthLabel,
  income,
  expense,
  net,
  netDelta,
}: MonthSummaryHeroProps) {
  const flow = income + expense
  const incomeShare = flow > 0 ? (income / flow) * 100 : 50

  const up = netDelta !== null && netDelta > 0
  const Arrow = up ? ArrowUpRight : ArrowDownRight

  return (
    <section
      className="relative overflow-hidden rounded-2xl p-4 sm:p-6 text-primary-foreground dark:text-[oklch(0.97_0.012_158)] ring-1 ring-white/10 md:p-8"
      style={{
        background:
          'radial-gradient(120% 130% at 85% 8%, oklch(0.46 0.09 158 / 0.55), transparent 55%), linear-gradient(135deg, oklch(0.36 0.062 158), oklch(0.25 0.05 158))',
      }}
    >
      <div className="relative grid gap-4 md:gap-8 md:grid-cols-[1.3fr_1fr] md:items-end">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-mint">
            Net balance · {monthLabel}
          </p>
          <p className="stat mt-2 text-3xl sm:text-4xl md:text-5xl">{formatMYR(net, { signed: true })}</p>
          <div className="mt-3 flex flex-wrap items-center gap-3 text-sm">
            {netDelta !== null && (
              <span className="nums inline-flex items-center gap-0.5 rounded-full bg-white/20 dark:bg-white/28 px-2 py-0.5 text-xs font-medium">
                <Arrow strokeWidth={2} className="size-3" />
                {Math.abs(netDelta).toFixed(1)}% vs last month
              </span>
            )}
          </div>
        </div>

        <div className="space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-primary-foreground/80 dark:text-[oklch(0.97_0.012_158)]/80">
              <span className="size-2 rounded-full bg-mint" />
              Income
            </span>
            <span className="stat text-lg">{formatMYR(income)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="flex items-center gap-2 text-primary-foreground/80 dark:text-[oklch(0.97_0.012_158)]/80">
              <span className="size-2 rounded-full bg-white/40" />
              Expense
            </span>
            <span className="stat text-lg">{formatMYR(expense)}</span>
          </div>
          <div
            className="flex h-2.5 overflow-hidden rounded-full bg-white/15"
            role="img"
            aria-label={`Income ${incomeShare.toFixed(0)} percent of total cash flow`}
          >
            <span className="h-full bg-mint" style={{ width: `${incomeShare}%` }} />
          </div>
        </div>
      </div>
    </section>
  )
}
