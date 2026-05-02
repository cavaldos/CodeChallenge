import { Fragment, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Navigate, Outlet, Route, Routes } from 'react-router-dom';
import useSWR from 'swr';
import { PublicRouter, PrivateRouter } from '~/routers';
import { useAppSelector } from '~/redux/hooks';
import { fetcher } from '~/services/api.instance';
import type { User } from '~/services/user.service';

const AuthLoading: React.FC = () => {
  return <div className="grid min-h-screen place-items-center">Loading...</div>;
};

const PrivateGuard: React.FC = () => {
  const { data, error, isLoading } = useSWR<User>('/auth/me', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
    shouldRetryOnError: false,
  });

  if (isLoading) {
    return <AuthLoading />;
  }

  if (!data || error) {
    return <Navigate to="/" replace />;
  }

  return <Outlet />;
};

const PublicGuard: React.FC = () => {
  const { data, isLoading } = useSWR<User>('/auth/me', fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    refreshInterval: 0,
    shouldRetryOnError: false,
  });

  if (isLoading) {
    return <AuthLoading />;
  }

  if (data) {
    return <Navigate to="/campaigns" replace />;
  }

  return <Outlet />;
};

const App: React.FC = () => {
  const themeMode = useAppSelector(state => state.theme.mode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          <Route element={<PrivateGuard />}>
            {PrivateRouter.map((route, index) => {
              const Layout = route.Layout === null ? Fragment : route.Layout;
              const Page = route.component;
              return (
                <Route
                  key={`private-${index}`}
                  path={route.path}
                  element={
                    <Layout>
                      <Page />
                    </Layout>
                  }
                />
              );
            })}
          </Route>

          <Route element={<PublicGuard />}>
            {PublicRouter.map((route, index) => {
              const Layout = route.Layout === null ? Fragment : route.Layout;
              const Page = route.component;
              return (
                <Route
                  key={`public-${index}`}
                  path={route.path}
                  element={
                    <Layout>
                      <Page />
                    </Layout>
                  }
                />
              );
            })}
          </Route>

          <Route
            path="*"
            element={
              <Fragment>
                <div className="grid min-h-[60vh] place-items-center px-4 text-center">
                  <div className="space-y-2">
                    <h1 className="text-2xl font-semibold tracking-tight">404 Not Found</h1>
                    <p className="text-sm text-muted-foreground">The page you requested does not exist.</p>
                  </div>
                </div>
              </Fragment>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  );
};

export default App;
