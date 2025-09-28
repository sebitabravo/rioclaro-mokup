import { Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Suspense, lazy, useEffect } from 'react'
import { PageLoading } from '@shared/components/ui/page-loading'
import { ErrorBoundary } from '@shared/components/ErrorBoundary'
import { ProtectedRoute } from '@shared/components/auth/ProtectedRoute'
import { useAuth } from '@features/auth/stores/AuthStore'

// Lazy loading de las páginas para mejorar rendimiento
const HomePage = lazy(() => import('@presentation/pages/HomePage').then(m => ({ default: m.HomePage })))
const DashboardPage = lazy(() => import('@presentation/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const ReportsPage = lazy(() => import('@presentation/pages/ReportsPage').then(m => ({ default: m.ReportsPage })))
const ActivityReportPage = lazy(() => import('@presentation/pages/ActivityReportPage').then(m => ({ default: m.ActivityReportPage })))
const AdminPage = lazy(() => import('@presentation/pages/AdminPage').then(m => ({ default: m.AdminPage })))
const LoginPage = lazy(() => import('@presentation/pages/LoginPage').then(m => ({ default: m.LoginPage })))
const RegisterPage = lazy(() => import('@presentation/pages/RegisterPage').then(m => ({ default: m.RegisterPage })))
const UnauthorizedPage = lazy(() => import('@presentation/pages/UnauthorizedPage').then(m => ({ default: m.UnauthorizedPage })))
const AlertConfigurationPage = lazy(() => import('@presentation/pages/AlertConfigurationPage').then(m => ({ default: m.AlertConfigurationPage })))

const pageVariants = {
  initial: { 
    opacity: 0
  },
  in: { 
    opacity: 1
  },
  out: { 
    opacity: 0
  }
}

const pageTransition = {
  type: 'tween' as const,
  ease: 'easeInOut' as const,
  duration: 0.2
}

function AnimatedRoute({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
    >
      {children}
    </motion.div>
  )
}

export function App() {
  const location = useLocation()
  const { validateSession, isAuthenticated } = useAuth()

  // Validar sesión al cargar la aplicación
  useEffect(() => {
    validateSession()
  }, [validateSession])

  return (
    <ErrorBoundary>
      <AnimatePresence mode="wait" initial={false}>
        <Suspense fallback={<PageLoading />}>
          <Routes location={location} key={location.pathname}>
            {/* Rutas públicas */}
            <Route path="/login" element={<AnimatedRoute><LoginPage /></AnimatedRoute>} />
            <Route path="/register" element={<AnimatedRoute><RegisterPage /></AnimatedRoute>} />
            <Route path="/unauthorized" element={<AnimatedRoute><UnauthorizedPage /></AnimatedRoute>} />

            {/* Ruta raíz - redirige según autenticación */}
            <Route
              path="/"
              element={
                isAuthenticated ?
                  <Navigate to="/dashboard" replace /> :
                  <AnimatedRoute><HomePage /></AnimatedRoute>
              }
            />

            {/* Rutas protegidas */}
            <Route
              path="/dashboard"
              element={
                <ProtectedRoute>
                  <AnimatedRoute><DashboardPage /></AnimatedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/reports"
              element={
                <ProtectedRoute>
                  <AnimatedRoute><ReportsPage /></AnimatedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/activity"
              element={
                <ProtectedRoute requiredRoles={['Administrador', 'Técnico']}>
                  <AnimatedRoute><ActivityReportPage /></AnimatedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/admin"
              element={
                <ProtectedRoute requiredRoles={['Administrador']} requireStaff={true}>
                  <AnimatedRoute><AdminPage /></AnimatedRoute>
                </ProtectedRoute>
              }
            />

            <Route
              path="/alerts/configuration"
              element={
                <ProtectedRoute requiredRoles={['Administrador', 'Técnico']}>
                  <AnimatedRoute><AlertConfigurationPage /></AnimatedRoute>
                </ProtectedRoute>
              }
            />

            {/* Ruta catch-all para 404 */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Suspense>
      </AnimatePresence>
    </ErrorBoundary>
  )
}