import { redirect } from "next/navigation";
import { getSession } from "@/shared/lib/auth";
import { TelegramLoginButton } from "@/features/auth/TelegramLoginButton";
import { Bell, TrendingUp, Zap } from "lucide-react";

export default async function LandingPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  const botUsername = process.env.NEXT_PUBLIC_TELEGRAM_BOT_USERNAME!;
  const authUrl = `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/telegram`;

  return (
    <main className="min-h-screen flex flex-col items-center justify-center gap-12 p-8">
      <div className="text-center space-y-4 max-w-lg">
        <div className="flex justify-center">
          <div className="bg-primary/10 rounded-2xl p-4">
            <Bell className="h-12 w-12 text-primary" />
          </div>
        </div>
        <h1 className="text-4xl font-bold tracking-tight">CryptoAlert</h1>
        <p className="text-muted-foreground text-lg">
          Track crypto prices and get instant Telegram notifications when your
          conditions are met.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-2xl w-full">
        <FeatureCard
          icon={<TrendingUp className="h-5 w-5" />}
          title="Price tracking"
          description="Monitor any crypto from CoinGecko"
        />
        <FeatureCard
          icon={<Bell className="h-5 w-5" />}
          title="Smart alerts"
          description="% change or price threshold alerts"
        />
        <FeatureCard
          icon={<Zap className="h-5 w-5" />}
          title="Instant delivery"
          description="Notifications sent to your Telegram"
        />
      </div>

      <div className="flex flex-col items-center gap-3">
        <p className="text-sm text-muted-foreground">
          Sign in with Telegram to get started — no password needed
        </p>
        <TelegramLoginButton botUsername={botUsername} authUrl={authUrl} />
      </div>
    </main>
  );
}

function FeatureCard({
  icon,
  title,
  description,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
}) {
  return (
    <div className="border rounded-xl p-4 space-y-2 bg-card">
      <div className="text-primary">{icon}</div>
      <h3 className="font-semibold text-sm">{title}</h3>
      <p className="text-xs text-muted-foreground">{description}</p>
    </div>
  );
}
