import { redirect } from "next/navigation";
import { getSession } from "@/shared/lib/auth";
import { logoutAction } from "@/features/auth/logout-action";
import { Button } from "@/components/ui/button";
import { Bell } from "lucide-react";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();
  if (!session) redirect("/");

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b bg-background sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Bell className="h-5 w-5 text-primary" />
            <span className="font-semibold">CryptoAlert</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-sm text-muted-foreground">
              {session.firstName}
            </span>
            <form action={logoutAction}>
              <Button variant="ghost" size="sm" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex-1 max-w-5xl mx-auto w-full px-4 py-8">{children}</div>
    </div>
  );
}
