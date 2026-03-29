import { redirect } from "next/navigation";
import { getSession } from "@/shared/lib/auth";
import { logoutAction } from "@/features/auth/logout-action";
import { Button } from "@/components/ui/button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 sticky top-0 z-10 bg-background">
        <div className="max-w-3xl mx-auto px-6 h-12 flex items-center justify-between">
          <span className="text-sm font-medium">CryptoAlert</span>
          <div className="flex items-center gap-4">
            <span className="text-xs text-muted-foreground">{session.firstName}</span>
            <form action={logoutAction}>
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">{children}</div>
    </div>
  );
}
