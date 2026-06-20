import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Suspense } from 'react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import { getAvailableMonths } from '@/lib/months'
import MonthPicker from '@/components/MonthPicker'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getServerSession(authOptions)
  if (!session) redirect('/login')

  const months = await getAvailableMonths()

  return (
    <div className="min-h-[100dvh]">
      <header className="border-b border-border">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-4 md:px-8">
          <div className="flex items-center gap-8">
            <Link href="/" className="text-sm font-semibold tracking-tight text-foreground">
              Hermes<span className="font-normal text-muted-foreground"> · ledger</span>
            </Link>
            <nav className="flex items-center gap-6 text-sm">
              <Link
                href="/"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Overview
              </Link>
              <Link
                href="/transactions"
                className="text-muted-foreground transition-colors hover:text-foreground"
              >
                Transactions
              </Link>
            </nav>
          </div>
          <Suspense fallback={null}>
            <MonthPicker months={months} />
          </Suspense>
        </div>
      </header>
      <main className="mx-auto max-w-6xl px-4 py-8 md:px-8">{children}</main>
    </div>
  )
}
