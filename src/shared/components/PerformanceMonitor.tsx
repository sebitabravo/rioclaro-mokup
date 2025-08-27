import { useEffect, useState } from 'react'
import { useBrowserDetect } from '../hooks/useBrowserDetect'

interface PerformanceMetrics {
  loadTime: number
  animationFrameRate: number
  memoryUsage?: number
  animationSmoothness: number
}

export function PerformanceMonitor() {
  const browserInfo = useBrowserDetect()
  const [metrics, setMetrics] = useState<PerformanceMetrics>({
    loadTime: 0,
    animationFrameRate: 60,
    animationSmoothness: 100
  })
  const [isMonitoring, setIsMonitoring] = useState(false)

  useEffect(() => {
    // Measure page load time
    const loadTime = performance.now()
    setMetrics(prev => ({ ...prev, loadTime }))

    // Monitor animation performance
    let frameCount = 0
    let lastTime = performance.now()
    let animationId: number

    const monitorAnimation = () => {
      frameCount++
      const currentTime = performance.now()

      if (currentTime - lastTime >= 1000) {
        const fps = (frameCount * 1000) / (currentTime - lastTime)
        const smoothness = Math.min(100, (fps / 60) * 100)

        setMetrics(prev => ({
          ...prev,
          animationFrameRate: Math.round(fps),
          animationSmoothness: Math.round(smoothness)
        }))

        frameCount = 0
        lastTime = currentTime
      }

      if (isMonitoring) {
        animationId = requestAnimationFrame(monitorAnimation)
      }
    }

    if (isMonitoring) {
      animationId = requestAnimationFrame(monitorAnimation)
    }

    return () => {
      if (animationId) {
        cancelAnimationFrame(animationId)
      }
    }
  }, [isMonitoring])

  const getPerformanceGrade = () => {
    const { loadTime, animationFrameRate, animationSmoothness } = metrics

    if (loadTime < 500 && animationFrameRate > 50 && animationSmoothness > 90) {
      return { grade: 'A', color: 'text-green-600', bg: 'bg-green-100' }
    } else if (loadTime < 1000 && animationFrameRate > 40 && animationSmoothness > 80) {
      return { grade: 'B', color: 'text-yellow-600', bg: 'bg-yellow-100' }
    } else if (loadTime < 1500 && animationFrameRate > 30 && animationSmoothness > 70) {
      return { grade: 'C', color: 'text-orange-600', bg: 'bg-orange-100' }
    } else {
      return { grade: 'D', color: 'text-red-600', bg: 'bg-red-100' }
    }
  }

  const grade = getPerformanceGrade()

  return (
    <div className="fixed bottom-4 right-4 bg-white dark:bg-gray-800 p-4 rounded-lg shadow-lg border z-50 max-w-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Performance Monitor
        </h3>
        <button
          onClick={() => setIsMonitoring(!isMonitoring)}
          className={`px-2 py-1 text-xs rounded ${
            isMonitoring
              ? 'bg-red-100 text-red-700 dark:bg-red-900 dark:text-red-300'
              : 'bg-green-100 text-green-700 dark:bg-green-900 dark:text-green-300'
          }`}
        >
          {isMonitoring ? 'Stop' : 'Start'}
        </button>
      </div>

      <div className="space-y-2 text-xs">
        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Browser:</span>
          <span className="font-medium text-gray-900 dark:text-white capitalize">
            {browserInfo.name} {browserInfo.version}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Device:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {browserInfo.isMobile ? 'Mobile' : 'Desktop'}
            {browserInfo.isSlowDevice && ' (Slow)'}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Reduced Motion:</span>
          <span className={`font-medium ${browserInfo.prefersReducedMotion ? 'text-orange-600' : 'text-green-600'}`}>
            {browserInfo.prefersReducedMotion ? 'Yes' : 'No'}
          </span>
        </div>

        <hr className="my-2" />

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Load Time:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {metrics.loadTime.toFixed(0)}ms
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">FPS:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {metrics.animationFrameRate}
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-gray-600 dark:text-gray-400">Smoothness:</span>
          <span className="font-medium text-gray-900 dark:text-white">
            {metrics.animationSmoothness}%
          </span>
        </div>

        <div className="flex justify-between items-center pt-2">
          <span className="text-gray-600 dark:text-gray-400">Grade:</span>
          <span className={`px-2 py-1 rounded text-sm font-bold ${grade.color} ${grade.bg}`}>
            {grade.grade}
          </span>
        </div>
      </div>

      {browserInfo.name === 'safari' && (
        <div className="mt-3 p-2 bg-blue-50 dark:bg-blue-900/20 rounded text-xs text-blue-800 dark:text-blue-200">
          <strong>Safari Tips:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Limited animation repetitions</li>
            <li>• Hardware acceleration enabled</li>
            <li>• Reduced motion respected</li>
          </ul>
        </div>
      )}

      {browserInfo.name === 'firefox' && (
        <div className="mt-3 p-2 bg-orange-50 dark:bg-orange-900/20 rounded text-xs text-orange-800 dark:text-orange-200">
          <strong>Firefox Tips:</strong>
          <ul className="mt-1 space-y-1">
            <li>• Conservative animation limits</li>
            <li>• Optimized for stability</li>
            <li>• Reduced motion respected</li>
          </ul>
        </div>
      )}
    </div>
  )
}
