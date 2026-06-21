# DESIGN.md — Hermes Dashboard

> Design system reverse-engineered from the COINEST reference, adapted to Hermes:
> MYR currency, Geist type stack, light mode, sidebar shell that grows by module.
> Read BEFORE any UI work; update after meaningful builds.

## Aesthetic Direction

**Warm editorial fintech — two-tone green with a forest-gradient anchor.** A deep
forest-green gradient summary hero carries the focal weight; below it, elevated
cards with characterful display type, gradient chart fills, and soft tinted
shadows. Emerald/mint accents, soft status pills, generous whitespace. **Light +
dark** (next-themes, system-aware, no-flash). Real-data widgets only — no
decorative/placeholder panels.

Dials: DESIGN_VARIANCE 7 · MOTION_INTENSITY 6 · VISUAL_DENSITY 5.

## 1. Color Palette

Authored as oklch in `src/app/globals.css` (`@theme inline` + `:root`); hex ≈ for reference.

| Token | Hex (≈) | Role |
|---|---|---|
| `--background` | `#F6F7F8` | cool off-white canvas |
| `--card` / `--popover` | `#FEFEFF` | near-white surfaces, sidebar |
| `--primary` | `#16402C` | deep forest — sidebar logo, active bar, focus ring, dark series |
| `--primary-foreground` | `#F4F8F5` | text on forest |
| `--accent` | mint wash | nav-active bg, hover tint; `--accent-foreground` = forest |
| `--accent-mint` (`--color-mint`) | `#9FE0BC` | bright mint — light chart series, progress |
| `--muted` | `#F0F2F3` | tracks, hover fills; `--muted-foreground` secondary text |
| `--subtle-foreground` | `#A4A8AC` | captions, axis ticks, group labels |
| `--border` / `--input` | `#EAEDEE` | 1px hairline |
| `--foreground` | `#1A1D1F` | primary text |
| `--pos` / `--pos-bg` | emerald / `#E7F6EE` | income, positive delta |
| `--neg` / `--neg-bg` | red / `#FDECEC` | expense amounts, negative delta, Failed |
| `--warn` / `--warn-bg` | amber / `#FBF3DD` | Pending |
| `--chart-1..5` | forest · mint · teal · leaf · slate-teal | series (greens/teals, no red) |

Rules: no `#000`/`#FFF` in components (tinted tokens only); no purple→blue; one
accent (emerald) over a forest anchor. `--radius: 0.75rem`. Shadows tinted, never
pure black: `0 1px 2px rgb(20 64 44 / .06)`.

**Dark** (`.dark` token block + `color-scheme`): near-black charcoal-green ground
(`oklch(.19 .012 215)`), surfaces lifted by *lightness* (`--card` ~.225), accents
brightened so emerald/mint pop, borders are visible light hairlines, `.card-elevate`
swaps its shadow for an inset highlight. Charts/components read from tokens, so they
re-theme for free. Toggle = `ThemeToggle` (next-themes) in the top bar.

**Color-meaning rule:** red (`--neg`) is reserved for *negative deltas, expense
amounts, and Failed status*. Comparison charts (income vs expense) use **two-tone
green** (forest + mint) with a legend — green is not "good", it's the brand.

## 2. Typography & Hierarchy

Three faces, wired in `layout.tsx` (all via `next/font/google`):
- **Bricolage Grotesque** — display: headings (`h1/h2/h3`, `font-heading`) + headline
  figures via `.stat` (display + `tabular-nums` + `-0.02em`). Characterful, not techy.
- **Plus Jakarta Sans** — body/UI: labels, nav, table rows, captions (`font-sans`).
- **Geist Mono** — `.nums`: tabular figures in *dense data only* (table cells, chart
  axes, tiny delta pills). NOT for headline numbers — that's `.stat`.

Never Inter/system as primary. Big money figures read in the display face, not mono —
this is what keeps it from feeling like a terminal.

| Level | Size / weight | Face / class | Use |
|---|---|---|---|
| Hero figure | 36–48px / 600 | `.stat` (display) | net balance hero |
| KPI value | 28px / 600 | `.stat` (display) | KPI numbers |
| H1 / H2 | 16–24px / 600 | display (`font-heading`) | page + card titles |
| Body | 14px / 1.5 | Jakarta | table rows, list text |
| Label | 13–14px / 500 · muted | Jakarta | KPI labels, nav |
| Caption | 11px / 500 · subtle, uppercase | Jakarta | group labels, table headers |
| Dense figures | 11–14px · tabular | `.nums` (Geist Mono) | table amounts, chart axes |

## 3. Spacing & Grid Layout

- **Shell:** left sidebar, **collapsible on lg** (`w-60` ⇄ `w-16` icon rail, persisted in
  `localStorage`, `transition-[width]`); main padding follows (`lg:pl-60`/`lg:pl-16`).
  Below `lg` it's a hamburger drawer. Sticky top bar `h-16` (`bg-background/80 backdrop-blur`)
  holds title + theme toggle + month picker. Content/footer max-width `1400px`.
- **Overview grid:** KPIs (`sm:grid-cols-3`) → cashflow bar `lg:col-span-2` + donut
  (`lg:grid-cols-3`) → cumulative + category-trend (`lg:grid-cols-2`) → top expenses.
  Single column < `lg`. `gap-6` (24px), section rhythm `space-y-6`.
- **Scale (8px base):** card padding `p-5`; nav item `h-10`; radius cards `rounded-xl`
  (~16px @ 0.75rem), chips/buttons `rounded-xl`, pills `rounded-full`.

## 4. Component Specifications

- **Sidebar (`DashboardShell.tsx`):** module-grouped nav (group label 11px uppercase
  subtle). Item `h-10 rounded-xl`, 18px lucide icon (stroke 1.75) + 14px label. Active =
  `bg-accent` + forest text + 2px left forest bar; inactive = muted, hover `bg-muted`.
  Brand = forest chip + "Hermes". Sign-out pinned bottom. Mobile = overlay drawer.
- **Summary hero (`MonthSummaryHero.tsx`):** full-width focal band. Forest gradient
  (`linear-gradient(135deg, oklch(.36 .062 158), oklch(.25 .05 158))` + a top-right
  radial highlight), white text, mint eyebrow/accents. Left: net (`.stat` 36–48px) +
  MoM pill + savings-rate line. Right: income/expense rows + a mint proportion bar.
  Never a gradient that drifts toward purple/blue.
- **Card (`ui/card`):** near-white, `rounded-2xl`, `ring-1 ring-border` + `.card-elevate`
  (forest-tinted soft shadow, never pure black), `p-5/6`. Nesting depth ≤ 1. KPI cards
  lift on hover (`hover:-translate-y-0.5`).
- **KPI card:** icon chip `size-9 rounded-xl` (soft tint: pos/neg/accent) top-left ·
  MoM delta pill top-right (`bg-pos-bg`/`bg-neg-bg` + arrow, colored by *goodness*:
  income/net ↑ = good, expense ↑ = bad; "new" when no prior month) · value (mono 24px) · muted label.
- **Status / type pill:** `rounded-full px-2 py-0.5 text-xs font-medium`, soft tint bg + colored text.
- **Charts:** income-vs-expense bars = **vertical gradient fills** (forest income / mint
  expense), `radius=[6,6,0,0]`, `maxBarSize 36`, `barCategoryGap 28%`, dashed grid, muted
  hover cursor; cumulative = forest **gradient area** (`url(#spendFill)`); donut = green/teal
  palette, `cornerRadius 4` + `stroke=var(--card)` for clean slice separation in both themes,
  centered `.nums` total + wrapped legend; tail bucket labeled "Other categories"; axes compact
  `RM` via `Intl.NumberFormat`. Responsive: chart pairs `md:grid-cols-2`, hero/bar `lg:grid-cols-3`.
- **Icons:** lucide-react, ~18px, stroke 1.75. Never emoji.
- **Buttons / inputs:** shadcn Base UI; primary = forest; `focus-visible` forest ring.

## 5. Intentional Design Nuances

- **Two-tone green system** carries the UI; third hue only for semantic status.
- **Sidebar is module-grouped and built to grow** — Finance is module #1, add a group not a rewrite.
- **MoM delta badges** turn KPIs into signals, colored by goodness not raw sign.
- **Numbers always tabular mono**; donut shows a center total figure.
- **Hairline minimalism** + airy spacing; borders/rings over shadows; shadows tinted.
- **Depth, not decoration:** one forest-gradient hero + soft forest-tinted card shadows +
  one gradient chart fill. No blobs, no purple, no nested cards.
- **Motion (CSS only, no lib):** sections enter with `animate-in fade-in slide-in-from-bottom-3`
  (tw-animate-css), staggered 0/80/160/240ms; KPI cards lift on hover; `prefers-reduced-motion`
  neutralizes all of it (global guard in `globals.css`).
- **Real data only** — every widget is backed by the CSV layer; nothing is faked for density.

---
*Last updated: 2026-06-21 — polish pass 2: dark theme (next-themes), collapsible sidebar, gradient bars + donut/area refinement, tablet responsiveness.*
