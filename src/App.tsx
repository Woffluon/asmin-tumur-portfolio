import { lazy, Suspense } from 'react'
import { Routes, Route, useLocation } from 'react-router-dom'
import Home from './pages/Home'
import Navigation from './components/Navigation'
import { AppErrorBoundary } from './components/AppErrorBoundary'
import { PageLoader } from './components/PageLoader'

const Gallery = lazy(() => import('./pages/Gallery'))
const NotFound = lazy(() => import('./pages/NotFound'))

function App() {
  const location = useLocation()
  const showNavigation = ['/', '/galeri'].includes(location.pathname)

  return (
    <AppErrorBoundary>
      {showNavigation && <Navigation />}
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/galeri" element={<Gallery />} />
          <Route path="/404" element={<NotFound />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Suspense>
    </AppErrorBoundary>
  )
}

export default App


