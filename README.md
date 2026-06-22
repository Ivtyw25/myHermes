## Hermes Dashboard

A self-hosted personal OS dashboard. It ingests my own data — finances, habits, notes, tasks and surfaces insights through a unified interface. No cloud, no tracking, no subscriptions. Just own data, on my own vps.

---

## Environment Variables

| Variable | Required | Description | How to fill in |
|---|---|---|---|
| `NEXTAUTH_URL` | yes | Public base URL of the site | `https://YOUR_VPS_IP` |
| `NEXTAUTH_SECRET` | yes | Session signing secret | `openssl rand -base64 32` |
| `HERMES_PASSWORD_HASH` | yes | bcrypt hash of your dashboard password | `node -e "console.log(require('bcryptjs').hashSync('yourpassword',12))"` |
| `HERMES_DATA_PATH` | yes | Absolute path to the directory where module data files live | `/home/hermes/data` |

> **`$` escaping gotcha — `.env.local` only.** Next.js runs `dotenv-expand`, which treats `$` as a variable reference and will mangle a bcrypt hash. In `.env.local`, escape every `$` as `\$`:
> ```
> HERMES_PASSWORD_HASH=\$2b\$12\$abc...
> ```
> In the systemd `EnvironmentFile`, write the raw hash — no escaping needed.

---

## Data Store

`HERMES_DATA_PATH` is a flat directory. Each module reads its own files from it — no database required.

| Module | File pattern | Format |
|---|---|---|
| Finance | `yyyy-mm.csv` | `name, date, type, amount, category` |
| Future modules | own convention | Each module declares its own file format |

```csv
name,date,type,amount,category
Grab,2026-06-01,expense,12.50,food
Salary,2026-06-25,income,5000.00,income
```

---

## VPS Installation

**1. Prerequisites**

Node 20+, Go (for xcaddy), and a static IP on the VPS. No domain required.

**2. Clone and build**

```bash
git clone <repo-url> hermes-dashboard
cd hermes-dashboard
npm ci --omit=dev
npm run build
```

**3. Generate secrets and create `.env.production.local`**

```bash
openssl rand -base64 32
# → paste output as NEXTAUTH_SECRET

node -e "console.log(require('bcryptjs').hashSync('yourpassword',12))"
# → paste output as HERMES_PASSWORD_HASH
```

Create `/home/hermes/hermes-dashboard/.env.production.local` (chmod 600, never commit):

```ini
NEXTAUTH_URL=https://YOUR_VPS_IP
NEXTAUTH_SECRET=<openssl output>
HERMES_PASSWORD_HASH=$2b$12$...raw hash, no escaping needed here
HERMES_DATA_PATH=/home/hermes/data
```

**4. Install the systemd service**

`hermes-dashboard.service` is in the repo. Edit these three lines to match your server:

```ini
User=hermes
WorkingDirectory=/home/hermes/hermes-dashboard
EnvironmentFile=/home/hermes/hermes-dashboard/.env.production.local
```

```bash
sudo cp hermes-dashboard.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable --now hermes-dashboard
```

**5. Firewall — block direct access to port 3000**

Port 3000 must never be reachable from the internet. Only Caddy (on 443) should be the entry point.

```bash
sudo ufw deny 3000
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

**6. Build Caddy with the rate-limit module**

Standard Caddy packages do not include `caddy-ratelimit` — build it with xcaddy:

```bash
go install github.com/caddyserver/xcaddy/cmd/xcaddy@latest
~/go/bin/xcaddy build --with github.com/mholt/caddy-ratelimit
sudo mv caddy /usr/local/bin/caddy
```

**7. Configure and start Caddy**

Copy `Caddyfile` from the repo to your server and replace `YOUR_VPS_IP` with your actual static IP.

Caddy uses `tls internal` to generate a self-signed cert — no domain needed. On first visit, the browser shows a "Your connection is not private" warning; click **Advanced → Proceed**. After that it works normally and all traffic is encrypted.

```bash
sudo caddy start --config /path/to/Caddyfile
```

**8. Verify**

```bash
systemctl status hermes-dashboard        # expect: active (running)
curl -Ik https://YOUR_VPS_IP             # expect: HTTP 200 or 302 → /login
curl -Ik https://YOUR_VPS_IP | grep -E "X-Frame-Options|X-Content-Type-Options"
```

---

## Security

| Layer | Detail |
|---|---|
| Password | bcrypt cost 12 |
| Session | JWT, expires after 1 hour |
| Rate limiting | 5 auth attempts per IP per minute (Caddy) |
| Brute force | Login locks for 60s after 5 wrong attempts |
| Transport | HTTPS via Caddy `tls internal` (self-signed) |
| Headers | `X-Frame-Options`, `X-Content-Type-Options`, `CSP`, `Referrer-Policy`, `Permissions-Policy` |

---

## Local Development

```bash
git clone <repo-url> && cd hermes-dashboard
cp .env.example .env.local
# Fill in NEXTAUTH_SECRET and HERMES_PASSWORD_HASH — escape $ as \$ in .env.local
npm ci
npm run dev   # → http://localhost:3000
```

---

## Modules

| Module | Status | Description |
|---|---|---|
| Finance | Live | KPI cards, monthly bar/trend, category donut, daily spend line, transaction log |
| Health, habits, media… | Planned | Each a self-contained module with its own data format |

---

## Stack

Next.js 16 App Router · React 19 · TypeScript · Tailwind v4 · shadcn/ui · Recharts 3 · next-auth v4 · papaparse
