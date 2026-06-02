import Link from "next/link";
import { redirect } from "next/navigation";
import { getSession } from "@/shared/lib/auth";
import { TelegramLoginFlow } from "@/features/auth/TelegramLoginFlow";

export default async function LandingPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 flex flex-col items-center justify-center p-8">
        <div className="flex flex-col items-center gap-10 max-w-sm w-full text-center">
          <div className="space-y-3">
            <h1 className="text-3xl font-semibold tracking-tight">CryptoAlert</h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Track crypto prices and get Telegram notifications when your conditions are met.
            </p>
          </div>
          <TelegramLoginFlow />
        </div>
      </main>
      <footer className="border-t border-border/50">
        <div className="max-w-3xl mx-auto px-6 h-12 flex items-center justify-between">
          <p className="text-xs text-muted-foreground">© {new Date().getFullYear()} CryptoAlert</p>
          <Link href="/about" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
            About
          </Link>
        </div>
      </footer>
    </div>
  );
}
