import { redirect } from "next/navigation";
import { getSession } from "@/shared/lib/auth";
import { TelegramLoginFlow } from "@/features/auth/TelegramLoginFlow";

export default async function LandingPage() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <main className="min-h-screen flex flex-col items-center justify-center p-8">
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
  );
}
