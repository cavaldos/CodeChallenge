import { Moon, Plus, Sun } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '~/components/ui/button';
import { Separator } from '~/components/ui/separator';
import { toggleTheme } from '~/redux/features/themeSlice';
import { useAppDispatch, useAppSelector } from '~/redux/hooks';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(state => state.theme.mode);

  const navLinkClassName = ({ isActive }: { isActive: boolean }) =>
    [
      'inline-flex items-center rounded-md px-3 py-1.5 text-sm font-medium transition-colors',
      isActive ? 'bg-primary text-primary-foreground shadow-sm' : 'text-muted-foreground hover:bg-muted hover:text-foreground',
    ].join(' ');

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-20 border-b bg-background/90 backdrop-blur supports-[backdrop-filter]:bg-background/80">
        <div className="mx-auto w-full max-w-6xl px-4 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
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
            </div>
          </div>
        </div>
      </header>

      <main>
        <div>{children}</div>
      </main>

      <footer className="mt-10">
        <Separator />
        <div className="mx-auto w-full max-w-6xl px-4 py-4 text-sm text-muted-foreground">Built with shadcn-style reusable components.</div>
      </footer>
    </div>
  );
};

export default MainLayout;
