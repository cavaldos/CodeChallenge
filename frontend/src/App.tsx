import { Fragment, Suspense, useEffect } from 'react'
import MainRouter from '~/routers'
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom'
import { useAppSelector } from '~/redux/hooks'

const App: React.FC = () => {
  const themeMode = useAppSelector(state => state.theme.mode);

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', themeMode);
  }, [themeMode]);

  return (
    <Router>
      <Suspense fallback={<div>Loading...</div>}>
        <Routes>
          {MainRouter.map((route, index) => {
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
                <div className="not-found">
                  <div>
                    <h1>404 Not Found</h1>
                    <p className="text-muted mt-2">The page you requested does not exist.</p>
                  </div>
                </div>
              </Fragment>
            }
          />
        </Routes>
      </Suspense>
    </Router>
  )
}

export default App
