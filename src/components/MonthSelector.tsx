'use client'

import { useState } from 'react'
import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import { ChevronDown } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { formatMonthLabel } from '@/lib/format'
import { cn } from '@/lib/utils'

const MONTH_NAMES = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

interface MonthSelectorProps {
  months: string[] // yyyy-mm, newest first
}

export default function MonthSelector({ months }: MonthSelectorProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [open, setOpen] = useState(false)

  if (months.length === 0) return null

  const param = searchParams.get('month')
  const selected = param && months.includes(param) ? param : months[0]
  const selectedYear = selected.slice(0, 4)

  // Group by year, preserving newest-first order within each year
  const byYear = months.reduce<Record<string, string[]>>((acc, m) => {
    const y = m.slice(0, 4)
    ;(acc[y] ??= []).push(m)
    return acc
  }, {})
  const HIDDEN_YEARS = new Set(['2025'])
  const FUTURE_YEARS = ['2027']
  // Years newest first; hide 2025, always show 2027 (disabled)
  const years = [
    ...Object.keys(byYear).filter((y) => !HIDDEN_YEARS.has(y)),
    ...FUTURE_YEARS,
  ].sort((a, b) => Number(b) - Number(a))

  function select(m: string) {
    router.push(`${pathname}?month=${m}`)
    setOpen(false)
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger className={cn(buttonVariants({ variant: 'outline' }), 'nums gap-1.5 text-sm')}>
        {formatMonthLabel(selected)}
        <ChevronDown className="size-3.5 opacity-60" />
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 max-w-[90vw] p-3">
        <Tabs defaultValue={selectedYear}>
          <TabsList className="mb-3 w-full">
            {years.map((y) => (
              <TabsTrigger key={y} value={y} className="flex-1 text-xs" disabled={FUTURE_YEARS.includes(y)}>
                {y}
              </TabsTrigger>
            ))}
          </TabsList>
          {years.map((y) => {
            const available = new Set(byYear[y] ?? [])
            return (
              <TabsContent key={y} value={y} className="mt-0">
                <div className="grid grid-cols-4 gap-1">
                  {MONTH_NAMES.map((name, idx) => {
                    const key = `${y}-${String(idx + 1).padStart(2, '0')}`
                    const isAvailable = available.has(key)
                    const isSelected = key === selected
                    return (
                      <Button
                        key={key}
                        variant={isSelected ? 'default' : 'ghost'}
                        size="sm"
                        disabled={!isAvailable}
                        onClick={() => select(key)}
                        className="h-8 text-xs"
                      >
                        {name}
                      </Button>
                    )
                  })}
                </div>
              </TabsContent>
            )
          })}
        </Tabs>
      </PopoverContent>
    </Popover>
  )
}
