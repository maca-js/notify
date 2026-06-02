import { Button } from '@/components/ui/button';
import { logoutAction } from '@/features/auth/logout-action';
import { getSession } from '@/shared/lib/auth';
import Link from 'next/link';
import { redirect } from 'next/navigation';

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect('/');

  return (
    <div className="min-h-screen flex flex-col">
      <header className="border-b border-border/50 sticky top-0 z-10 bg-background">
        <div className="max-w-3xl mx-auto px-6 h-12 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-sm font-medium mr-2">CryptoAlert</span>
            <Link href="/portfolio" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Portfolio
            </Link>
            <Link href="/dashboard" className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Alerts
            </Link>
          </div>
          <div className="flex items-center  gap-4">
            <span className="text-xs text-muted-foreground ml-2">{session.firstName}</span>
            <form action={logoutAction}>
              <Button variant="ghost" size="sm" className="text-xs h-7 px-2" type="submit">
                Sign out
              </Button>
            </form>
          </div>
        </div>
      </header>
      <div className="flex-1 max-w-3xl mx-auto w-full px-6 py-10">{children}</div>
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
