# Hermes Dashboard

A self-hosted personal dashboard — a private OS for visualizing your own data. Finance is Module 1. More modules to follow.

---

## Pull & Build

```bash
git clone <repo-url>
cd hermes-dashboard

cp .env.example .env.local
# Fill in NEXTAUTH_SECRET and HERMES_PASSWORD_HASH (see .env.example for instructions)

npm ci
npm run build
npm start          # serves on port 3000
```

Run tests: `npm test` (22 unit tests, data layer only).

---

## Data Store

Set `HERMES_DATA_PATH` in `.env.local` to the directory where your Hermes agent writes monthly CSV files:

```
HERMES_DATA_PATH=/home/hermes/data
```

Each file is named `yyyy-mm.csv` and contains rows in this format:

```
name,date,type,amount,category
Grab,2026-06-01,expense,12.50,food
Salary,2026-06-25,income,5000.00,income
```

The app reads files directly via Node `fs` — no database required.

---

## Service Configuration (VPS)

### Caddy

Requires [xcaddy](https://github.com/caddyserver/xcaddy) built with the `caddy-ratelimit` module:

```bash
xcaddy build --with github.com/mholt/caddy-ratelimit
```

Copy `Caddyfile` to your server and replace `yourdomain.com` with your actual domain. Caddy handles HTTPS automatically and rate-limits auth endpoints to 10 req/min per IP.

### systemd

```bash
sudo cp hermes-dashboard.service /etc/systemd/system/
# Edit the unit: set User= and WorkingDirectory= to match your server
# Create .env.production.local with NEXTAUTH_SECRET and HERMES_PASSWORD_HASH

sudo systemctl daemon-reload
sudo systemctl enable --now hermes-dashboard
```

> **Note:** systemd does NOT expand `$` in env values. Write bcrypt hashes as-is (no escaping).

---

## Modules

| Module | Status | Description |
|--------|--------|-------------|
| Finance | Live | KPI cards, monthly bar/trend, category donut, daily spend line, transaction log |
| *(more)* | Planned | Health, habits, media tracking — each as a self-contained module |

---

## Stack

Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Recharts 3 · next-auth v4 · papaparse · Vitest
