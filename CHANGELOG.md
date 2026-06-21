# Hermes Dashboard — Changelog

All notable changes to this project are documented here.

---

## Finance Module — v1.0.0 (2026-06-21)

### Phase 5: Infrastructure
- Added `Caddyfile` with reverse proxy and per-IP rate limiting on auth endpoints (`caddy-ratelimit`)
- Added `hermes-dashboard.service` systemd unit for VPS deployment (auto-restart, env-file secrets)
- Added `.env.example` template

### Phase 4: Auth + Dashboard Shell
- Added `next-auth` v4 credentials login with bcryptjs password verification
- Added `DashboardShell` with responsive sidebar, theme toggle, and month selector
- Added `MonthSummaryHero` — current month summary banner
- Added `MonthSelector` — popover-based month navigation

### Phase 3: Charts
- Added `MonthlyBar` — total income vs. expense per month (bar chart)
- Added `DailySpendLine` — cumulative daily spending with projected line
- Added `CategoryDonut` — expense breakdown by category (donut chart)
- Added `CategoryTrend` — multi-month category spend stacked area chart
- Added `OverviewCharts` client wrapper (lazy-loads all 4 charts)

### Phase 2: Core UI
- Added Overview page — KPI cards + chart grid
- Added Transactions page — paginated, filterable transaction log with loading skeleton
- Added `KPICards` — total income, total expense, net balance, top category
- Added `TransactionTable` — sortable table with category badge and MYR formatting

### Phase 1: Data Layer
- Added `src/lib/csv.ts` — CSV reader, category aggregation, daily spend, donut rollup (`aggregateByCategoryDonut`, `aggregateByCategoryMonth`, `aggregateDailySpend`)
- Added `src/lib/months.ts` — `getAvailableMonths`, `parseMonthParam`
- Added `src/lib/format.ts` — `formatMYR`, `formatMonthLabel`, `formatMonthShort`
- Added `src/lib/auth.ts` — `authOptions` (next-auth v4, JWT strategy)
- Added Vitest suite — 22 unit tests covering all data-layer functions
