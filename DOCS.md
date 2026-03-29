# Technical Documentation

## Overview

**CryptoAlert** is a Next.js web app that monitors cryptocurrency and stock prices and sends Telegram notifications when user-configured alert conditions are met.

**Stack:** Next.js 16 (App Router) · React 19 · Supabase (PostgreSQL) · Tailwind CSS 4 · shadcn/ui · TypeScript 5

---

## Folder Structure

```
stock-notification/
├── app/
│   ├── (dashboard)/
│   │   ├── layout.tsx              # Auth guard + header
│   │   └── dashboard/page.tsx      # Dashboard server component
│   ├── api/
│   │   ├── auth/
│   │   │   ├── start/route.ts      # POST – generate auth token + Telegram deep link
│   │   │   ├── telegram/route.ts   # GET  – Telegram Login Widget callback
│   │   │   └── poll/route.ts       # GET  – poll token verification status
│   │   ├── cron/
│   │   │   └── check-alerts/route.ts  # POST – evaluate alerts & send notifications
│   │   ├── search/route.ts         # GET  – search coins via CoinGecko
│   │   ├── stock-lookup/route.ts   # GET  – look up stock via Yahoo Finance
│   │   └── telegram/webhook/route.ts  # POST – receive Telegram updates
│   ├── layout.tsx
│   └── page.tsx                    # Landing + login
├── entities/                       # Domain models + DB queries
│   ├── user/
│   ├── alert/
│   └── asset/
├── features/                       # UI feature modules
│   ├── auth/
│   ├── alerts/
│   ├── watchlist/
│   └── notifications/
├── shared/
│   ├── api/
│   │   ├── supabase.ts
│   │   ├── coingecko.ts
│   │   ├── yahoo-finance.ts
│   │   └── telegram.ts
│   └── lib/
│       ├── auth.ts
│       └── alert-evaluator.ts
└── supabase/
    ├── schema.sql
    └── migrations/
```

---

## Environment Variables

| Variable | Visibility | Purpose |
|---|---|---|
| `TELEGRAM_BOT_TOKEN` | Server | Bot token from @BotFather |
| `NEXT_PUBLIC_TELEGRAM_BOT_USERNAME` | Client | Bot username for deep links |
| `NEXT_PUBLIC_SUPABASE_URL` | Client | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client | Supabase anon key (browser) |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Admin key — bypasses RLS |
| `NEXTAUTH_SECRET` | Server | JWT signing secret (32-byte base64) |
| `CRON_SECRET` | Server | Shared secret for cron endpoint |
| `NEXT_PUBLIC_APP_URL` | Client | Deployed app URL |

---

## Database Schema

### `users`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `telegram_id` | bigint UNIQUE | Telegram user ID |
| `username` | text | nullable |
| `first_name` | text | |
| `last_name` | text | nullable |
| `photo_url` | text | nullable |
| `created_at` | timestamptz | |

### `assets`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `external_id` | text UNIQUE | CoinGecko coin ID or stock ticker |
| `symbol` | text | e.g. `BTC`, `MSFT` |
| `name` | text | e.g. `Bitcoin` |
| `asset_type` | text | `'crypto'` or `'stock'` |

### `watchlist`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → users | |
| `asset_id` | uuid FK → assets | |
| UNIQUE | `(user_id, asset_id)` | |

### `alerts`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → users | |
| `asset_id` | uuid FK → assets | |
| `type` | text | `'percent_change'` or `'threshold'` |
| `condition` | text | `'above'` or `'below'` |
| `value` | numeric | % or USD depending on type |
| `timeframe` | text | `'24h'` (percent_change only) |
| `is_active` | boolean | default `true` |
| `cooldown_minutes` | integer | default `60` |
| `last_triggered_at` | timestamptz | nullable — set when alert fires |

### `notifications`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `user_id` | uuid FK → users | |
| `alert_id` | uuid FK → alerts | nullable |
| `asset_name` | text | |
| `message` | text | HTML-formatted Telegram message |
| `sent_at` | timestamptz | default `now()` |

### `auth_tokens`
| Column | Type | Notes |
|---|---|---|
| `id` | uuid PK | |
| `token` | text UNIQUE | 32-char hex |
| `user_id` | uuid FK → users | nullable — filled after bot verification |
| `expires_at` | timestamptz | 10 minutes from creation |
| `verified_at` | timestamptz | nullable — set by Telegram webhook |

---

## Authentication Flow

Authentication is Telegram-based with a polling mechanism — no passwords.

```
Browser                     Server                    Telegram Bot
   |                            |                           |
   |-- POST /api/auth/start --> |                           |
   |<-- { token, deepLink } --- |                           |
   |                            |                           |
   |-- open deep link --------> t.me/bot?start=TOKEN        |
   |                            |                           |
   |-- GET /api/auth/poll ---> |                           |
   |<-- { pending: true } ----- |                           |
   |                            |                           |
   |                user sends /start TOKEN to bot          |
   |                            |<-- webhook update --------|
   |                            | upsert user               |
   |                            | mark token verified       |
   |                            |                           |
   |-- GET /api/auth/poll ---> |                           |
   |<-- { success: true } ----- |                           |
   |   set sn_session cookie    |                           |
   |-- redirect /dashboard ---> |                           |
```

**Session:** httpOnly cookie `sn_session` — a HS256 JWT (30-day expiry) containing `{ userId, telegramId, firstName }`.

**Telegram hash validation:** `shared/lib/auth.ts:verifyTelegramHash` — HMAC-SHA256 over sorted key=value fields, 1-hour time window.

---

## Alert Evaluation

The cron job at `POST /api/cron/check-alerts` (authenticated via `x-cron-secret` header) runs the full evaluation loop:

1. Fetch all `is_active = true` alerts from the DB
2. Deduplicate asset IDs by type, fetch prices in parallel:
   - Crypto → CoinGecko (`getCoinPrices`)
   - Stocks → Yahoo Finance (`getStockPrices`)
3. For each alert:
   - **Skip** if `isInCooldown(alert)` — `now - last_triggered_at < cooldown_minutes`
   - **Skip** if `!evaluateAlert(alert, price)`
   - Otherwise: send Telegram message, call `updateAlertTriggered`, insert notification row

**Alert types:**

| Type | Condition | Logic |
|---|---|---|
| `percent_change` | `above` | `price.usd_24h_change >= value` |
| `percent_change` | `below` | `price.usd_24h_change <= -value` |
| `threshold` | `above` | `price.usd >= value` |
| `threshold` | `below` | `price.usd <= value` |

**Cooldown:** prevents repeated notifications. If an alert fires at 10:00 with a 60-minute cooldown, the next earliest it can fire again is 11:00, regardless of how often the cron runs.

---

## API Routes Reference

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/start` | none | Create auth token, return Telegram deep link |
| GET | `/api/auth/telegram` | Telegram hash | OAuth callback — set session cookie |
| GET | `/api/auth/poll` | none | Poll token verification status |
| POST | `/api/telegram/webhook` | Bot token | Handle Telegram updates (`/start`, `/alerts`) |
| GET | `/api/search` | session | Search coins via CoinGecko |
| GET | `/api/stock-lookup` | session | Look up stock via Yahoo Finance |
| POST | `/api/cron/check-alerts` | `x-cron-secret` | Evaluate alerts, send notifications |

---

## Shared Modules

### `shared/api/supabase.ts`
- `supabase` — browser/RSC client (anon key)
- `getAdminClient()` — server-only client (service role key, bypasses RLS)

### `shared/api/coingecko.ts`
- `searchCoins(query)` — search with 60s cache
- `getCoinPrices(ids[])` — fetch USD price + 24h change

### `shared/api/yahoo-finance.ts`
- `lookupStock(ticker)` — returns `{ symbol, name }` or null
- `getStockPrices(symbols[])` — batch fetch via `Promise.allSettled`

### `shared/api/telegram.ts`
- `sendMessage(chatId, htmlText)` — send HTML-formatted message
- `setWebhook(url)` — register webhook URL (run once on deploy)

### `shared/lib/auth.ts`
- `signSession(payload)` / `verifySession(token)` — JWT helpers
- `getSession()` — read + verify session from cookies
- `verifyTelegramHash(data)` — validate Telegram OAuth data

### `shared/lib/alert-evaluator.ts`
- `evaluateAlert(alert, price)` — returns `boolean`
- `isInCooldown(alert)` — returns `boolean`
- `formatAlertMessage(...)` — returns HTML string for Telegram

---

## Feature Modules

### `features/auth`
- `TelegramLoginFlow` — handles the full OAuth polling loop client-side
- `logout-action.ts` — server action to clear `sn_session` cookie

### `features/alerts`
- `AlertForm` — modal dialog for creating and editing alerts (shared form, mode detected via optional `alert` prop)
- `AlertList` — table grouped by asset; supports toggle, edit, delete
- `actions.ts` — `createAlertAction`, `updateAlertAction`, `toggleAlertAction`, `deleteAlertAction`

### `features/watchlist`
- `AssetSearch` — tabbed search for crypto/stocks; adds to watchlist
- `WatchlistTable` — displays watchlist with per-asset alert shortcut
- `actions.ts` — `addToWatchlist`, `removeFromWatchlist`, `getWatchlist`

### `features/notifications`
- `NotificationLog` — read-only table of sent notifications

---

## Deployment

1. Create a Supabase project and run `supabase/schema.sql`
2. Create a Telegram bot via @BotFather and note the token
3. Deploy to Vercel (or any Node.js host) with all env vars set
4. Register the Telegram webhook once:
   ```
   POST https://api.telegram.org/bot<TOKEN>/setWebhook
   { "url": "https://your-app.com/api/telegram/webhook" }
   ```
5. Set up a cron job (e.g. cron-job.org) to call `POST /api/cron/check-alerts` every 5–15 minutes with header `x-cron-secret: <CRON_SECRET>`
