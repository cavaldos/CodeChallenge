import { toggleTheme } from '~/redux/features/themeSlice';
import { useAppDispatch, useAppSelector } from '~/redux/hooks';

const MainLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const dispatch = useAppDispatch();
  const themeMode = useAppSelector(state => state.theme.mode);

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="container py-5 flex items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Pastel UI System</h1>
            <p className="text-muted mt-1">Minimal, elegant, and token-driven styling</p>
          </div>

          <button
            type="button"
            className="theme-toggle"
            onClick={() => dispatch(toggleTheme())}
            aria-label="Toggle theme"
          >
            {themeMode === 'light' ? 'Dark mode' : 'Light mode'}
          </button>
        </div>
      </header>

      <main>
        <div className="">{children}</div>
      </main>

      <footer className="app-footer">
        <div className="container py-4 text-sm text-muted">Built with reusable semantic design tokens</div>
      </footer>
    </div>
  );
};

export default MainLayout;
