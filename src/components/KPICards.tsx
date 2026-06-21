import { TrendingUp, TrendingDown, Scale, ArrowUpRight, ArrowDownRight } from 'lucide-react'
import { Card } from '@/components/ui/card'
import { formatMYR } from '@/lib/format'

interface KPICardsProps {
  totalIncome: number
  totalExpense: number
  netBalance: number
  // percent change vs previous month; null when no prior month exists
  deltas?: { income: number | null; expense: number | null; net: number | null }
}

type Item = {
  label: string
  value: number
  signed: boolean
  icon: typeof TrendingUp
  chip: string
  delta: number | null
  goodWhenUp: boolean
}

function DeltaBadge({ delta, goodWhenUp }: { delta: number | null; goodWhenUp: boolean }) {
  if (delta === null || !Number.isFinite(delta)) {
    return <span className="text-xs text-subtle-foreground">new</span>
  }
  const up = delta > 0
  const good = up === goodWhenUp
  const Arrow = up ? ArrowUpRight : ArrowDownRight
  return (
    <span
      className={`nums inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
        good ? 'bg-pos-bg text-pos' : 'bg-neg-bg text-neg'
      }`}
    >
      <Arrow strokeWidth={2} className="size-3" />
      {Math.abs(delta).toFixed(1)}%
    </span>
  )
}

export default function KPICards({ totalIncome, totalExpense, netBalance, deltas }: KPICardsProps) {
  const items: Item[] = [
    {
      label: 'Total income',
      value: totalIncome,
      signed: false,
      icon: TrendingUp,
      chip: 'bg-pos-bg text-pos',
      delta: deltas?.income ?? null,
      goodWhenUp: true,
    },
    {
      label: 'Total expense',
      value: totalExpense,
      signed: false,
      icon: TrendingDown,
      chip: 'bg-neg-bg text-neg',
      delta: deltas?.expense ?? null,
      goodWhenUp: false,
    },
    {
      label: 'Net balance',
      value: netBalance,
      signed: true,
      icon: Scale,
      chip: netBalance >= 0 ? 'bg-primary text-primary-foreground' : 'bg-neg-bg text-neg',
      delta: deltas?.net ?? null,
      goodWhenUp: true,
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {items.map((it) => (
        <Card
          key={it.label}
          className="gap-0 p-5 transition-transform duration-200 ease-out hover:-translate-y-0.5"
        >
          <div className="flex items-center justify-between">
            <span className={`flex size-10 items-center justify-center rounded-xl ${it.chip}`}>
              <it.icon strokeWidth={1.75} className="size-5" />
            </span>
            <DeltaBadge delta={it.delta} goodWhenUp={it.goodWhenUp} />
          </div>
          <p
            className={`stat mt-4 text-[28px] leading-none ${
              it.signed && it.value < 0 ? 'text-neg' : 'text-foreground'
            }`}
          >
            {formatMYR(it.value, { signed: it.signed })}
          </p>
          <p className="mt-2 text-sm text-muted-foreground">{it.label}</p>
        </Card>
      ))}
    </div>
  )
}
