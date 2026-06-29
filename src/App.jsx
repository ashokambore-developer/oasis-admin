import React, { Suspense, useEffect } from 'react'
import { HashRouter, Route, Routes } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { CSpinner, useColorModes } from '@coreui/react'

import { AuthProvider } from './context/AuthContext'
import ProtectedRoute from './components/ProtectedRoute'
import PWAUpdatePrompt from './components/PWAUpdatePrompt'
import './scss/style.scss'

const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'))
const Login = React.lazy(() => import('./views/pages/login/Login'))
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'))
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'))

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 30_000,
      refetchOnWindowFocus: false,
    },
  },
})

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('oasis-admin-theme')
  const storedTheme = useSelector((state) => state.theme)

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1])
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0]
    if (theme) {
      setColorMode(theme)
    }
    if (isColorModeSet()) return
    setColorMode(storedTheme)
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <HashRouter>
          <Suspense
            fallback={
              <div className="pt-3 text-center">
                <CSpinner color="primary" variant="grow" />
              </div>
            }
          >
            <Routes>
              <Route exact path="/login" name="Login" element={<Login />} />
              <Route exact path="/404" name="Page 404" element={<Page404 />} />
              <Route exact path="/500" name="Page 500" element={<Page500 />} />
              <Route
                path="*"
                name="Home"
                element={
                  <ProtectedRoute>
                    <DefaultLayout />
                  </ProtectedRoute>
                }
              />
            </Routes>
          </Suspense>
        </HashRouter>
      </AuthProvider>
      <PWAUpdatePrompt />
    </QueryClientProvider>
  )
}

export default App
