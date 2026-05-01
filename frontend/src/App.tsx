import { Fragment, Suspense, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { PublicRouter, PrivateRouter } from '~/routers';
import { useAppSelector } from '~/redux/hooks';

const App: React.FC = () => {
  const themeMode = useAppSelector(state => state.theme.mode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {PublicRouter.map((route, index) => {
            const Layout = route.Layout === null ? Fragment : route.Layout;
            const Page = route.component;
            return (
              <Route
                key={index}
                path={route.path}
                element={
                  <Layout>
                    <Page />
                  </Layout>
                }
              />
            );
          })}
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
