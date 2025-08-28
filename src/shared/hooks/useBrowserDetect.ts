import { useEffect, useState } from 'react'

export interface BrowserInfo {
  name: 'chrome' | 'firefox' | 'safari' | 'edge' | 'unknown'
  version: string
  isMobile: boolean
  prefersReducedMotion: boolean
  isSlowDevice: boolean
}

export function useBrowserDetect(): BrowserInfo {
  const [browserInfo, setBrowserInfo] = useState<BrowserInfo>({
    name: 'unknown',
    version: '',
    isMobile: false,
    prefersReducedMotion: false,
    isSlowDevice: false
  })

  useEffect(() => {
    const detectBrowser = () => {
      const userAgent = navigator.userAgent
      const platform = navigator.platform

      // Detect mobile
      const isMobile = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(userAgent) ||
                      (platform === 'MacIntel' && navigator.maxTouchPoints > 1)

      // Detect browser
      let name: BrowserInfo['name'] = 'unknown'
      let version = ''

      if (userAgent.includes('Chrome') && !userAgent.includes('Edg')) {
        name = 'chrome'
        const match = userAgent.match(/Chrome\/(\d+)/)
        version = match ? match[1] : ''
      } else if (userAgent.includes('Firefox')) {
        name = 'firefox'
        const match = userAgent.match(/Firefox\/(\d+)/)
        version = match ? match[1] : ''
      } else if (userAgent.includes('Safari') && !userAgent.includes('Chrome')) {
        name = 'safari'
        const match = userAgent.match(/Version\/(\d+)/)
        version = match ? match[1] : ''
      } else if (userAgent.includes('Edg')) {
        name = 'edge'
        const match = userAgent.match(/Edg\/(\d+)/)
        version = match ? match[1] : ''
      }

      // Detect reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches

      // Detect slow device (rough estimation)
      const isSlowDevice = navigator.hardwareConcurrency ?
        navigator.hardwareConcurrency <= 2 :
        isMobile // Assume mobile devices might be slower

      setBrowserInfo({
        name,
        version,
        isMobile,
        prefersReducedMotion,
        isSlowDevice
      })
    }

    detectBrowser()

    // Listen for changes in reduced motion preference
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    const handleChange = () => {
      setBrowserInfo(prev => ({
        ...prev,
        prefersReducedMotion: mediaQuery.matches
      }))
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  return browserInfo
}

import type { AnimationConfig } from '../types/animation-types';

// Hook for browser-specific optimizations
export function useBrowserOptimizations() {
  const browserInfo = useBrowserDetect()

  const getAnimationConfig = (baseConfig: AnimationConfig) => {
    if (browserInfo.prefersReducedMotion) {
      return {
        ...baseConfig,
        duration: 0.01,
        repeat: 0
      }
    }

    // Browser-specific optimizations
    switch (browserInfo.name) {
      case 'safari':
        return {
          ...baseConfig,
          duration: (baseConfig.duration || 0.5) * 0.8, // Faster animations in Safari
          ease: 'easeOut', // Simpler easing for better performance
          repeat: Math.min(baseConfig.repeat || 0, 3) // Limit repetitions
        }

      case 'firefox':
        return {
          ...baseConfig,
          duration: (baseConfig.duration || 0.5) * 0.9, // Slightly faster in Firefox
          repeat: Math.min(baseConfig.repeat || 0, 2) // More conservative with repetitions
        }

      case 'chrome':
      default:
        return baseConfig // Chrome handles animations well
    }
  }

  const shouldUseHardwareAcceleration = () => {
    // Use hardware acceleration for better performance on most browsers
    return !browserInfo.prefersReducedMotion && !browserInfo.isSlowDevice
  }

  const getTransformStyle = () => {
    if (shouldUseHardwareAcceleration()) {
      return {
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden' as const,
        transform: 'translateZ(0)'
      }
    }
    return {}
  }

  return {
    browserInfo,
    getAnimationConfig,
    shouldUseHardwareAcceleration,
    getTransformStyle
  }
}
