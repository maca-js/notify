import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata = {
  title: "About — CryptoAlert",
  description: "Learn how CryptoAlert works and what it can do for you.",
};

export default function AboutPage() {
  return (
    <main className="min-h-screen flex flex-col">
      <header className="border-b border-border/50">
        <div className="max-w-3xl mx-auto px-6 h-12 flex items-center justify-between">
          <Link href="/" className="text-sm font-medium hover:text-foreground/80 transition-colors">
            CryptoAlert
          </Link>
          <Button asChild variant="ghost" size="sm" className="text-xs h-7 px-2">
            <Link href="/">Back to home</Link>
          </Button>
        </div>
      </header>

      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-14 space-y-12">
        <div className="space-y-3">
          <h1 className="text-2xl font-semibold tracking-tight">About CryptoAlert</h1>
          <p className="text-muted-foreground leading-relaxed">
            CryptoAlert is a lightweight price monitoring tool that sends you Telegram notifications
            the moment your conditions are met — no app switching, no dashboard refreshing.
          </p>
        </div>

        <div className="space-y-6">
          <h2 className="text-base font-medium">How it works</h2>
          <ol className="space-y-4 text-sm text-muted-foreground">
            <li className="flex gap-3">
              <span className="text-foreground font-medium w-5 shrink-0">1.</span>
              <span>
                <strong className="text-foreground">Sign in with Telegram.</strong> Open the bot
                link and send it your one-time token. No passwords or email addresses required.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-foreground font-medium w-5 shrink-0">2.</span>
              <span>
                <strong className="text-foreground">Build your watchlist.</strong> Search for
                cryptocurrencies (via CoinGecko) or US stocks (via Finnhub) and add them to your
                personal watchlist.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-foreground font-medium w-5 shrink-0">3.</span>
              <span>
                <strong className="text-foreground">Set alerts.</strong> Choose a price threshold
                (e.g. BTC above $70,000) or a percentage change (e.g. ETH up more than 5% in 24 h).
                Configure a cooldown to avoid notification spam.
              </span>
            </li>
            <li className="flex gap-3">
              <span className="text-foreground font-medium w-5 shrink-0">4.</span>
              <span>
                <strong className="text-foreground">Get notified.</strong> The cron job evaluates
                all active alerts every few minutes and sends an HTML-formatted Telegram message the
                moment a condition is triggered.
              </span>
            </li>
          </ol>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-medium">Alert types</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            <div className="rounded-lg border border-border/50 p-4 space-y-1">
              <p className="text-sm font-medium">Price threshold</p>
              <p className="text-xs text-muted-foreground">
                Fire when an asset crosses an absolute USD value — e.g. BTC above $70,000 or ETH
                below $2,000.
              </p>
            </div>
            <div className="rounded-lg border border-border/50 p-4 space-y-1">
              <p className="text-sm font-medium">Percent change</p>
              <p className="text-xs text-muted-foreground">
                Fire when an asset moves by a given percentage over a timeframe (1 h or 24 h) —
                e.g. SOL up more than 10% in the last 24 hours.
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-medium">Data sources</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li>
              <strong className="text-foreground">Crypto prices —</strong> CoinGecko public API.
              Prices and 1 h / 24 h change data, cached for 2 minutes.
            </li>
            <li>
              <strong className="text-foreground">Stock prices —</strong> Finnhub API. Real-time
              quotes for US equities, cached for 2 minutes.
            </li>
            <li>
              <strong className="text-foreground">Notifications —</strong> Telegram Bot API.
              Messages are delivered directly to your Telegram account.
            </li>
          </ul>
        </div>

        <div className="space-y-4">
          <h2 className="text-base font-medium">Tech stack</h2>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><strong className="text-foreground">Framework —</strong> Next.js 16 (App Router) with React 19</li>
            <li><strong className="text-foreground">Database —</strong> Supabase (PostgreSQL) with row-level security</li>
            <li><strong className="text-foreground">Auth —</strong> Telegram-based, httpOnly JWT session cookie</li>
            <li><strong className="text-foreground">UI —</strong> Tailwind CSS 4 + shadcn/ui</li>
          </ul>
        </div>

        <div className="pt-2">
          <Button asChild>
            <Link href="/">Get started</Link>
          </Button>
        </div>
      </div>

      <footer className="border-t border-border/50">
        <div className="max-w-3xl mx-auto px-6 h-12 flex items-center">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} CryptoAlert
          </p>
        </div>
      </footer>
    </main>
  );
}
