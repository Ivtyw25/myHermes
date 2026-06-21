'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { signOut } from 'next-auth/react'
import { Wallet, Menu, X, LogOut, Leaf, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { Button } from '@/components/ui/button'
import ThemeToggle from '@/components/ThemeToggle'

const NAV_ITEMS = [{ href: '/', label: 'Finance', icon: Wallet }] as const

const TITLES: Record<string, string> = { '/': 'Finance' }

function Brand({ collapsed = false }: { collapsed?: boolean }) {
  return (
    <Link href="/" className="flex items-center gap-2.5" aria-label="Hermes home">
      <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-primary text-primary-foreground">
        <Leaf strokeWidth={2} className="size-4" />
      </span>
      <AnimatePresence initial={false}>
        {!collapsed && (
          <motion.span
            initial={{ opacity: 0, width: 0 }}
            animate={{ opacity: 1, width: 'auto' }}
            exit={{ opacity: 0, width: 0 }}
            transition={{ duration: 0.15 }}
            className="overflow-hidden text-base font-semibold tracking-tight whitespace-nowrap"
          >
            Hermes
          </motion.span>
        )}
      </AnimatePresence>
    </Link>
  )
}

export default function DashboardShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [collapsed, setCollapsed] = useState(false)
  const title = TITLES[pathname] ?? 'Finance'

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setCollapsed(localStorage.getItem('hermes:sidebar-collapsed') === '1')
  }, [])

  const toggleCollapsed = () =>
    setCollapsed((c) => {
      localStorage.setItem('hermes:sidebar-collapsed', c ? '0' : '1')
      return !c
    })

  return (
    <div className="min-h-[100dvh]">
      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="fixed inset-y-0 left-0 z-30 hidden flex-col border-r border-border bg-card overflow-hidden lg:flex"
      >
        <div
          className={`flex py-5 ${collapsed ? 'flex-col items-center gap-3' : 'items-center justify-between px-5'}`}
        >
          <Brand collapsed={collapsed} />
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleCollapsed}
            aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            className="shrink-0"
          >
            {collapsed ? (
              <PanelLeftOpen strokeWidth={1.75} className="size-[18px]" />
            ) : (
              <PanelLeftClose strokeWidth={1.75} className="size-[18px]" />
            )}
          </Button>
        </div>

        <nav className="flex flex-col gap-1 flex-1 overflow-y-auto px-3 pb-6">
          <AnimatePresence initial={false}>
            {!collapsed && (
              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.1 }}
                className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-subtle-foreground"
              >
                Finance
              </motion.p>
            )}
          </AnimatePresence>
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const active = pathname === href
            return (
              <Link
                key={href}
                href={href}
                aria-current={active ? 'page' : undefined}
                title={collapsed ? label : undefined}
                className={`group relative flex h-10 items-center rounded-xl text-sm transition-colors ${
                  collapsed ? 'justify-center px-0' : 'gap-3 px-3'
                } ${
                  active
                    ? 'bg-accent font-medium text-accent-foreground'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                }`}
              >
                {active && !collapsed && (
                  <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                )}
                <Icon strokeWidth={1.75} className="size-[18px] shrink-0" />
                <AnimatePresence initial={false}>
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: 'auto' }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.12 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            )
          })}
        </nav>

        <div className="border-t border-border p-3">
          <Button
            variant="ghost"
            onClick={() => signOut({ callbackUrl: '/login' })}
            title={collapsed ? 'Sign out' : undefined}
            className={`w-full text-muted-foreground ${collapsed ? 'justify-center px-0' : 'justify-start gap-3'}`}
          >
            <LogOut strokeWidth={1.75} className="size-[18px] shrink-0" />
            <AnimatePresence initial={false}>
              {!collapsed && (
                <motion.span
                  initial={{ opacity: 0, width: 0 }}
                  animate={{ opacity: 1, width: 'auto' }}
                  exit={{ opacity: 0, width: 0 }}
                  transition={{ duration: 0.12 }}
                  className="overflow-hidden whitespace-nowrap"
                >
                  Sign out
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </div>
      </motion.aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <div className="fixed inset-0 z-50 lg:hidden">
            <motion.div
              className="absolute inset-0 bg-foreground/40 backdrop-blur-sm"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              onClick={() => setDrawerOpen(false)}
              aria-hidden
            />
            <motion.aside
              className="absolute inset-y-0 left-0 flex w-64 flex-col border-r border-border bg-card"
              initial={{ x: -264 }}
              animate={{ x: 0 }}
              exit={{ x: -264 }}
              transition={{ duration: 0.2, ease: 'easeOut' }}
            >
              <div className="flex items-center justify-between px-5 py-5">
                <Brand />
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setDrawerOpen(false)}
                  aria-label="Close menu"
                >
                  <X strokeWidth={1.75} className="size-5" />
                </Button>
              </div>
              <nav className="flex flex-col gap-1 flex-1 overflow-y-auto px-3 pb-6">
                <p className="px-3 pb-1 text-[11px] font-medium uppercase tracking-wider text-subtle-foreground">
                  Finance
                </p>
                {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
                  const active = pathname === href
                  return (
                    <Link
                      key={href}
                      href={href}
                      onClick={() => setDrawerOpen(false)}
                      aria-current={active ? 'page' : undefined}
                      className={`relative flex h-10 items-center gap-3 rounded-xl px-3 text-sm transition-colors ${
                        active
                          ? 'bg-accent font-medium text-accent-foreground'
                          : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                      }`}
                    >
                      {active && (
                        <span className="absolute left-0 top-1/2 h-5 w-0.5 -translate-y-1/2 rounded-full bg-primary" />
                      )}
                      <Icon strokeWidth={1.75} className="size-[18px] shrink-0" />
                      {label}
                    </Link>
                  )
                })}
              </nav>
              <div className="border-t border-border p-3">
                <Button
                  variant="ghost"
                  onClick={() => signOut({ callbackUrl: '/login' })}
                  className="w-full justify-start gap-3 text-muted-foreground"
                >
                  <LogOut strokeWidth={1.75} className="size-[18px] shrink-0" />
                  Sign out
                </Button>
              </div>
            </motion.aside>
          </div>
        )}
      </AnimatePresence>

      {/* Main column */}
      <motion.div
        animate={{ paddingLeft: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="lg:transition-none"
        // ponytail: desktop only — mobile uses full width, so only apply on lg
        style={{ paddingLeft: undefined }}
      >
        {/* Apply the desktop padding via a wrapper that hides on mobile */}
        <div className="lg:hidden">
          <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-4 backdrop-blur">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
            >
              <Menu strokeWidth={1.75} className="size-5" />
            </Button>
            <h1 className="text-base font-semibold tracking-tight">{title}</h1>
            <div className="ml-auto">
              <ThemeToggle />
            </div>
          </header>
          <main className="px-4 py-6">{children}</main>
          <footer className="px-4 py-8">
            <p className="text-xs text-subtle-foreground">
              Hermes · private dashboard — self-hosted, single-tenant.
            </p>
          </footer>
        </div>
      </motion.div>

      {/* Desktop layout — separate from mobile to avoid motion.div paddingLeft interfering */}
      <motion.div
        animate={{ paddingLeft: collapsed ? 64 : 240 }}
        transition={{ duration: 0.2, ease: 'easeOut' }}
        className="hidden lg:block"
      >
        <header className="sticky top-0 z-20 flex h-16 items-center gap-3 border-b border-border bg-background/80 px-8 backdrop-blur">
          <h1 className="text-base font-semibold tracking-tight">{title}</h1>
          <div className="ml-auto">
            <ThemeToggle />
          </div>
        </header>
        <main className="mx-auto max-w-[1400px] px-8 py-8">{children}</main>
        <footer className="mx-auto max-w-[1400px] px-8 py-8">
          <p className="text-xs text-subtle-foreground">
            Hermes · private dashboard — self-hosted, single-tenant.
          </p>
        </footer>
      </motion.div>
    </div>
  )
}
