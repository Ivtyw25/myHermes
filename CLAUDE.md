 Before editing any file, read it first. Before modifying a function, grep for all callers. Research before you edit.
 Always use /caveman skills to save tokens.
# Frameworks (cherry-pick — one job each, never run full pipelines)

| Framework | Owns | NOT for |
|---|---|---|
| **gstack** | decisions, review, QA, ship, retro | — (backbone) |
| **GSD** | phase decomposition only | its review/ship |
| **Superpowers** | TDD during build only | its planning/brainstorm/review/finish |

Stay in lane. `/browse` (gstack) for web; NEVER `mcp__claude-in-chrome__*`.
gstack skills used: `/office-hours` `/autoplan` `/spec` `/review` `/cso` `/codex` `/qa` `/ship` `/retro` `/learn` `/investigate` `/careful` `/freeze` `/guard`.

Workflow (separate sessions, human-gated): plan (gstack `/office-hours`→`/autoplan`→`/spec`) → refine (Superpowers brainstorm) → decompose (GSD `/gsd-new-project`) → build (Superpowers TDD, one phase/session) → review (`/review`→`/cso`→opt `/codex`) → QA (`/qa <url>`) → ship (`/ship`, PR only) → reflect (`/retro` `/learn`).

# Project: Hermes Finance Dashboard

Private self-hosted finance dashboard. Hermes writes `$HERMES_DATA_PATH/yyyy-mm.csv`; this app reads them (Server Components, `fs`, no DB, no business-logic API routes), renders KPIs/charts/transaction-log behind single-password auth.

**Stack:** Next.js 16 App Router · React 19 · TS · Tailwind **v4** (CSS-first, no `tailwind.config`) · shadcn/ui (**Base UI**) · Recharts 3 · papaparse · next-auth **v4** · bcryptjs · Vitest. Theme: **Ledger Light**.

**Commands:** `npm run dev` · `build` (typechecks) · `start` · `test` (vitest, 22 data tests) · `lint` (eslint flat).

**Structure:**
- `src/lib/csv.ts` — all read+aggregation; pure, unit-tested. Data logic goes here.
- `src/lib/{format,months}.ts` — MYR/month fmt, `getAvailableMonths`/`parseMonthParam`.
- `src/lib/auth.ts` — `authOptions` (next-auth credentials).
- `src/components/charts/*` — `'use client'` Recharts via shadcn `ChartContainer`.
- `src/components/OverviewCharts.tsx` — client wrapper lazy-loading the 4 charts.
- `src/components/ui/*` — shadcn primitives; don't hand-edit, re-add via `npx shadcn@latest add`.
- `src/app/(dashboard)/*` — guarded pages + loading/error boundaries.
- `src/app/(auth)/login`, `middleware.ts` — auth gate.
- `Caddyfile`, `hermes-dashboard.service` — VPS (proxy + rate limit + systemd).
- `docs/superpowers/{specs,plans}/` · `.planning/` · `DESIGN.md` (tokens).

**Hard rules:**
- Every dashboard page: `export const dynamic = 'force-dynamic'` (fs reads must not cache).
- Next 16: `searchParams` is a `Promise` — `await` it.
- Charts need `ssr:false` (illegal in Server Component on 15+) → load via `OverviewCharts` client wrapper, never `dynamic(ssr:false)` in a page.
- `normalizeCategory` = trim + lowercase only.
- Numbers: `.nums` class (Geist Mono, tabular) + `formatMYR`. Tokens in `globals.css` (`@theme`+`:root`); read `DESIGN.md` before any UI change.
- Secrets (`NEXTAUTH_SECRET`, `HERMES_PASSWORD_HASH`) never committed — `.env.local` (dev) / systemd `EnvironmentFile` (prod). Template in `.env.example`.

**Gotchas:**
- `.env.local` bcrypt hash: dotenv-expand mangles `$` → escape as `\$` (`\$2b\$12\$...`). systemd does NOT expand — raw hash there.
- next-auth is **v4** (no v5 on npm): `getServerSession`/`getToken`.
- Per-phase worktrees: never junction `node_modules` — `rm`/`git worktree remove` follows it and deletes root deps. Use per-worktree `npm ci`.

