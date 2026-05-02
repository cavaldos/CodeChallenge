import { LogOut, Moon, Plus, Sun } from 'lucide-react';
import { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { toggleTheme } from '~/redux/features/themeSlice';
import { useAppDispatch, useAppSelector } from '~/redux/hooks';
import { logout } from '~/services/user.service';
import { mutateAuth } from '~/services/auth';
import { persistor } from '~/redux/store';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const themeMode = useAppSelector(state => state.theme.mode);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (isLoggingOut) {
      return;
    }

    setIsLoggingOut(true);

    try {
      // Call server logout first to clear session cookie
      await logout();

      // Clear auth cache immediately
      await mutateAuth(false);

      // Purge persisted redux state to avoid stale UI after logout
      try {
        await persistor.purge();
      } catch (e) {
        // eslint-disable-next-line no-console
        console.error('Persistor purge failed', e);
      }

      // Hard reload to the login page to ensure the SPA resets completely.
      // Users reported the UI only comes back after a manual refresh; doing
      // a controlled replace here provides the same effect programmatically.
      window.location.replace('/login');
    } catch (err) {
      // If anything fails, fall back to client navigation so user isn't stuck.
      // eslint-disable-next-line no-console
      console.error('Logout flow failed', err);
      navigate('/login', { replace: true });
    } finally {
      setIsLoggingOut(false);
    }
  };

  const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
    [
      'inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
      isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    ].join(' ');

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80 w-full">
        <div className="flex w-full items-center justify-between px-4 py-4">
          <div className="space-y-1 text-left">
            <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Mini Campaign Manager</h1>
            <p className="text-sm text-muted-foreground">Create, schedule, and track email campaigns.</p>
          </div>

          <div className="flex items-center gap-2">
            <nav className="flex items-center gap-2 rounded-lg border bg-card p-1">
              <NavLink to="/campaigns" className={navLinkClassName}>
                Campaigns
              </NavLink>
              <NavLink to="/campaigns/new" className={navLinkClassName}>
                <Plus className="mr-1 size-4" />
                New Campaign
              </NavLink>
            </nav>

            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => dispatch(toggleTheme())}
              aria-label="Toggle theme"
            >
              {themeMode === 'light' ? <Moon className="size-4" /> : <Sun className="size-4" />}
            </Button>

            <Button type="button" variant="destructive" onClick={handleLogout} disabled={isLoggingOut}>
              <LogOut className="size-4" />
              {isLoggingOut ? 'Signing out...' : 'Logout'}
            </Button>
          </div>
        </div>
      </header>

      <main className="flex justify-center">
        <div className="w-full max-w-6xl px-4 py-8">{children}</div>
      </main>

      <footer className="mt-10">
        <Separator />
        <div className="mx-auto w-full max-w-6xl px-4 py-4 text-sm text-muted-foreground">Built with shadcn-style reusable components.</div>
      </footer>
    </div>
  );
};

export default MainLayout;
