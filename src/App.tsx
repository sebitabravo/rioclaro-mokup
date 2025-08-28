import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { Suspense, lazy } from 'react'
import { PageLoading } from '@presentation/components/ui/page-loading'

// Lazy loading de las páginas para mejorar rendimiento
const HomePage = lazy(() => import('@presentation/pages/HomePage').then(m => ({ default: m.HomePage })))
const DashboardPage = lazy(() => import('@presentation/pages/DashboardPage').then(m => ({ default: m.DashboardPage })))
const ReportsPage = lazy(() => import('@presentation/pages/ReportsPage').then(m => ({ default: m.ReportsPage })))
const ActivityReportPage = lazy(() => import('@presentation/pages/ActivityReportPage').then(m => ({ default: m.ActivityReportPage })))
const AdminPage = lazy(() => import('@presentation/pages/AdminPage').then(m => ({ default: m.AdminPage })))

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

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<PageLoading />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedRoute><HomePage /></AnimatedRoute>} />
          <Route path="/dashboard" element={<AnimatedRoute><DashboardPage /></AnimatedRoute>} />
          <Route path="/reports" element={<AnimatedRoute><ReportsPage /></AnimatedRoute>} />
          <Route path="/activity" element={<AnimatedRoute><ActivityReportPage /></AnimatedRoute>} />
          <Route path="/admin" element={<AnimatedRoute><AdminPage /></AnimatedRoute>} />
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}