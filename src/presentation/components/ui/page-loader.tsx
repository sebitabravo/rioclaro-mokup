import { motion, AnimatePresence } from 'framer-motion'
import { WaterDrop } from '@shared/components/MotionWrapper'

interface PageLoaderProps {
  isLoading: boolean
  title?: string
  subtitle?: string
}

export function PageLoader({ isLoading, title = 'Cargando', subtitle = 'Preparando datos...' }: PageLoaderProps) {
  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          className="fixed inset-0 bg-gov-neutral/95 backdrop-blur-sm z-50 flex items-center justify-center"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
        >
          <motion.div
            className="text-center"
            initial={{ scale: 0.8, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.8, y: -20 }}
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            {/* River Animation */}
            <div className="relative mb-8">
              <div className="flex space-x-1 justify-center items-end">
                {[...Array(5)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="w-2 bg-gradient-to-t from-blue-500 to-blue-300 rounded-full"
                    style={{ height: `${20 + i * 8}px` }}
                    animate={{
                      height: [`${20 + i * 8}px`, `${40 + i * 8}px`, `${20 + i * 8}px`],
                      opacity: [0.3, 1, 0.3]
                    }}
                    transition={{
                      duration: 1.5,
                      repeat: Infinity,
                      delay: i * 0.2,
                      ease: 'easeInOut'
                    }}
                  />
                ))}
              </div>
              
              {/* Floating water drops */}
              <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                {[...Array(3)].map((_, i) => (
                  <motion.div
                    key={i}
                    className="absolute"
                    style={{ 
                      left: `${(i - 1) * 20}px`,
                      top: `${i * 10}px`
                    }}
                    animate={{
                      y: [0, -20, 0],
                      opacity: [0.5, 1, 0.5],
                      scale: [0.8, 1.2, 0.8]
                    }}
                    transition={{
                      duration: 2,
                      repeat: Infinity,
                      delay: i * 0.4,
                      ease: 'easeInOut'
                    }}
                  >
                    <WaterDrop color="#3b82f6" />
                  </motion.div>
                ))}
              </div>
            </div>

            {/* Loading text */}
            <motion.h2 
              className="text-2xl font-bold text-gov-primary mb-2"
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
            >
              {title}
            </motion.h2>
            
            <motion.p 
              className="text-gov-gray-a"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
            >
              {subtitle}
            </motion.p>

            {/* Progress indicator */}
            <motion.div
              className="w-48 h-1 bg-gov-accent rounded-full mx-auto mt-6 overflow-hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.8 }}
            >
              <motion.div
                className="h-full bg-gradient-to-r from-blue-500 to-green-500 rounded-full"
                animate={{ x: [-200, 200] }}
                transition={{
                  duration: 1.5,
                  repeat: Infinity,
                  ease: 'easeInOut'
                }}
              />
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

// Skeleton loader for individual cards
interface SkeletonCardProps {
  className?: string
}

export function SkeletonCard({ className = '' }: SkeletonCardProps) {
  return (
    <div className={`bg-gov-white border border-gov-accent rounded-lg p-4 ${className}`}>
      <div className="animate-pulse">
        <div className="flex justify-between items-center mb-2">
          <div className="h-3 bg-gray-200 rounded w-16"></div>
          <div className="h-3 w-3 bg-gray-200 rounded"></div>
        </div>
        <div className="h-6 bg-gray-200 rounded w-12 mb-1"></div>
        <div className="h-2 bg-gray-200 rounded w-20"></div>
      </div>
    </div>
  )
}

// Loading states for different components
export function ChartSkeleton() {
  return (
    <div className="h-6 bg-gray-200 rounded animate-pulse">
      <div className="h-full bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 animate-pulse"></div>
    </div>
  )
}

// Global app loading overlay
export function AppLoader() {
  return (
    <div className="fixed inset-0 bg-gradient-to-br from-blue-50 to-green-50 z-50 flex items-center justify-center">
      <motion.div
        className="text-center"
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.6, ease: [0.4, 0, 0.2, 1] }}
      >
        <motion.div
          className="relative mb-6"
          animate={{ rotate: 360 }}
          transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
        >
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full"></div>
          <div className="absolute inset-2 w-12 h-12 border-4 border-green-200 border-b-green-600 rounded-full"></div>
        </motion.div>
        
        <motion.h1 
          className="text-3xl font-bold text-gov-primary mb-2"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Sistema de Monitoreo
        </motion.h1>
        
        <motion.p 
          className="text-gov-gray-a text-lg"
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ delay: 0.5, duration: 0.5 }}
        >
          Río Claro - Pucón
        </motion.p>
      </motion.div>
    </div>
  )
}