import { Routes, Route, useLocation } from 'react-router-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { HomePage } from '@presentation/pages/HomePage'
import { DashboardPage } from '@presentation/pages/DashboardPage'
import { ReportsPage } from '@presentation/pages/ReportsPage'
import { ActivityReportPage } from '@presentation/pages/ActivityReportPage'
import { AdminPage } from '@presentation/pages/AdminPage'

const pageVariants = {
  initial: { opacity: 0, x: 20 },
  in: { opacity: 1, x: 0 },
  out: { opacity: 0, x: -20 }
}

const pageTransition = {
  type: 'tween' as const,
  ease: 'anticipate' as const,
  duration: 0.4
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
      <Routes location={location} key={location.pathname}>
        <Route path="/" element={<AnimatedRoute><HomePage /></AnimatedRoute>} />
        <Route path="/dashboard" element={<AnimatedRoute><DashboardPage /></AnimatedRoute>} />
        <Route path="/reports" element={<AnimatedRoute><ReportsPage /></AnimatedRoute>} />
        <Route path="/activity" element={<AnimatedRoute><ActivityReportPage /></AnimatedRoute>} />
        <Route path="/admin" element={<AnimatedRoute><AdminPage /></AnimatedRoute>} />
      </Routes>
    </AnimatePresence>
  )
}