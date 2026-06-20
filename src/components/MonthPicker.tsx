'use client'

import { usePathname, useRouter, useSearchParams } from 'next/navigation'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { formatMonthLabel } from '@/lib/format'

interface MonthPickerProps {
  months: string[] // yyyy-mm, newest first
}

export default function MonthPicker({ months }: MonthPickerProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  if (months.length === 0) return null

  const param = searchParams.get('month')
  const selected = param && months.includes(param) ? param : months[0]

  return (
    <Select
      value={selected}
      onValueChange={(v) => {
        if (v) router.push(`${pathname}?month=${v}`)
      }}
    >
      <SelectTrigger className="nums w-44" aria-label="Select month">
        <SelectValue />
      </SelectTrigger>
      <SelectContent>
        {months.map((m) => (
          <SelectItem key={m} value={m}>
            {formatMonthLabel(m)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
