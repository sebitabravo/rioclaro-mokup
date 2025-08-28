import { motion, type Variants } from 'framer-motion'
import type { SafeVariants } from '../types/motion-types'
import { ReactNode, useEffect, useState } from 'react'
import { useBrowserDetect } from '../hooks/useBrowserDetect'

interface MotionWrapperProps {
  children: ReactNode
  variant?: 'fadeIn' | 'slideUp' | 'slideIn' | 'scale' | 'stagger' | 'pulse' | 'shake' | 'wave' | 'glow' | 'float' | 'bounce' | 'cardEntry'
  className?: string
  delay?: number
  duration?: number
  infinite?: boolean
}

const variants: Record<string, Variants> = {
  fadeIn: {
    hidden: { opacity: 0 },
    visible: { 
      opacity: 1,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  },
  slideUp: {
    hidden: { opacity: 0, y: 30 },
    visible: { 
      opacity: 1, 
      y: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  },
  slideIn: {
    hidden: { opacity: 0, x: -30 },
    visible: { 
      opacity: 1, 
      x: 0,
      transition: { duration: 0.5, ease: 'easeOut' }
    }
  },
  scale: {
    hidden: { opacity: 0, scale: 0.95 },
    visible: { 
      opacity: 1, 
      scale: 1,
      transition: { duration: 0.3, ease: 'easeOut' }
    }
  },
  stagger: {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.05, // Reducir de 0.1 a 0.05
        delayChildren: 0.02 // Reducir de 0.1 a 0.02
      }
    }
  },
  pulse: {
    hidden: { scale: 1 },
    visible: { 
      scale: [1, 1.02, 1],
      transition: { 
        duration: 1.5,
        repeat: 2, // Limitar repeticiones en lugar de infinito
        ease: 'easeInOut'
      }
    }
  },
  shake: {
    hidden: { x: 0 },
    visible: { 
      x: [-2, 2, -2, 2, 0],
      transition: { 
        duration: 0.5,
        repeat: Infinity,
        repeatDelay: 1.5,
        ease: 'easeInOut'
      }
    }
  },
  wave: {
    hidden: { y: 0 },
    visible: { 
      y: [-3, 3, -3, 3, 0],
      transition: { 
        duration: 3,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  glow: {
    hidden: { 
      boxShadow: '0 0 0px rgba(59, 130, 246, 0)',
    },
    visible: { 
      boxShadow: [
        '0 0 0px rgba(59, 130, 246, 0)',
        '0 0 20px rgba(59, 130, 246, 0.3)',
        '0 0 0px rgba(59, 130, 246, 0)'
      ],
      transition: { 
        duration: 2.5,
        repeat: Infinity,
        ease: 'easeInOut'
      }
    }
  },
  float: {
    hidden: { y: 0 },
    visible: { 
      y: [-5, 5],
      transition: { 
        duration: 2.5,
        repeat: Infinity,
        repeatType: 'reverse' as const,
        ease: 'easeInOut'
      }
    }
  },
  bounce: {
    hidden: { y: 0 },
    visible: { 
      y: [0, -10, 0],
      transition: { 
        duration: 1.5,
        repeat: Infinity,
        ease: 'easeOut'
      }
    }
  },
  cardEntry: {
    hidden: { 
      opacity: 0, 
      y: 10, // Reducir de 20 a 10
      scale: 0.99 // Reducir de 0.98 a 0.99
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.25, // Reducir de 0.4 a 0.25
        ease: [0.4, 0, 0.2, 1]
      }
    }
  }
}

export function MotionWrapper({ 
  children, 
  variant = 'fadeIn', 
  className,
  delay = 0,
  duration,
  infinite
}: MotionWrapperProps) {
  const browserInfo = useBrowserDetect()
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    // Detectar preferencia de usuario por menos movimiento
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    const handleChange = () => setPrefersReducedMotion(mediaQuery.matches)
    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Si el usuario prefiere menos movimiento, usar animación simple
  if (prefersReducedMotion) {
    return (
      <div className={className} style={{ transitionDelay: `${delay}ms` }}>
        {children}
      </div>
    )
  }

  // Optimizaciones específicas para diferentes navegadores
  const getOptimizedVariants = () => {
    const baseVariants = variants[variant]

    switch (browserInfo.name) {
      case 'safari':
        return {
          ...baseVariants,
          visible: {
            ...baseVariants.visible,
            transition: {
              ...((baseVariants.visible as { transition?: Record<string, unknown> }).transition || {}),
              duration: (((baseVariants.visible as { transition?: { duration?: number } }).transition?.duration) || 0.5) * 0.8,
              repeat: Math.min(((baseVariants.visible as { transition?: { repeat?: number } }).transition?.repeat) || 0, 3),
              ease: 'easeOut'
            }
          }
        }

      case 'firefox':
        return {
          ...baseVariants,
          visible: {
            ...baseVariants.visible,
            transition: {
              ...((baseVariants.visible as { transition?: Record<string, unknown> }).transition || {}),
              duration: (((baseVariants.visible as { transition?: { duration?: number } }).transition?.duration) || 0.5) * 0.9,
              repeat: Math.min(((baseVariants.visible as { transition?: { repeat?: number } }).transition?.repeat) || 0, 2),
            }
          }
        }

      default:
        return baseVariants
    }
  }

  const optimizedVariants = getOptimizedVariants()
  const customVariants = duration || infinite ? {
    ...optimizedVariants,
    visible: {
      ...optimizedVariants.visible,
      transition: {
        ...((optimizedVariants.visible as { transition?: Record<string, unknown> }).transition || {}),
        ...(duration && { duration }),
        ...(infinite && browserInfo.name === 'safari' && { repeat: 3 })
      }
    }
  } : optimizedVariants

  const getTransformStyle = () => {
    // Aplicar optimizaciones de hardware para mejor rendimiento
    if (browserInfo.name === 'safari' || browserInfo.name === 'firefox') {
      return {
        willChange: 'transform, opacity',
        backfaceVisibility: 'hidden' as const,
        transform: 'translateZ(0)',
        transitionDelay: `${delay}ms`
      }
    }
    return { transitionDelay: `${delay}ms` }
  }

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={customVariants as SafeVariants}
      style={getTransformStyle()}
    >
      {children}
    </motion.div>
  )
}

// Export specialized motion components
export const MotionCard = motion.div
export const MotionButton = motion.button

// Water-specific animation components
export function PulsingIndicator({ 
  children, 
  className = '',
  isActive = true,
  pulseColor = 'rgba(34, 197, 94, 0.3)'
}: {
  children: ReactNode
  className?: string
  isActive?: boolean
  pulseColor?: string
}) {
  return (
    <motion.div
      className={className}
      animate={isActive ? {
        boxShadow: [
          `0 0 0 0 ${pulseColor}`,
          `0 0 0 10px rgba(34, 197, 94, 0)`,
        ],
        scale: [1, 1.02, 1]
      } : {}}
      transition={{
        duration: 2,
        repeat: isActive ? Infinity : 0,
        ease: 'easeOut'
      }}
    >
      {children}
    </motion.div>
  )
}

export function CriticalAlert({ 
  children, 
  className = '',
  isActive = false
}: {
  children: ReactNode
  className?: string
  isActive?: boolean
}) {
  return (
    <motion.div
      className={className}
      animate={isActive ? {
        scale: [1, 1.02, 1],
        boxShadow: [
          '0 0 0 0 rgba(239, 68, 68, 0.4)',
          '0 0 0 6px rgba(239, 68, 68, 0)',
        ]
      } : {}}
      transition={{
        duration: 2,
        repeat: isActive ? 3 : 0, // Limitar a 3 repeticiones
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  )
}

export function WarningAlert({ 
  children, 
  className = '',
  isActive = false
}: {
  children: ReactNode
  className?: string
  isActive?: boolean
}) {
  return (
    <motion.div
      className={className}
      animate={isActive ? {
        x: [-0.5, 0.5, -0.5, 0.5, 0],
        boxShadow: [
          '0 0 0 0 rgba(245, 158, 11, 0.3)',
          '0 0 0 4px rgba(245, 158, 11, 0)',
        ]
      } : {}}
      transition={{
        duration: 1.5,
        repeat: isActive ? 2 : 0, // Limitar a 2 repeticiones
        repeatDelay: 1,
        ease: 'easeInOut'
      }}
    >
      {children}
    </motion.div>
  )
}

export function WaterDrop({ 
  className = '',
  color = '#3B82F6'
}: {
  className?: string
  color?: string
}) {
  return (
    <motion.div
      className={`inline-block ${className}`}
      animate={{
        y: [0, -10, 0],
        scale: [1, 1.1, 1]
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: 'easeInOut'
      }}
    >
      <div 
        className="w-4 h-4 rounded-full"
        style={{ 
          background: `radial-gradient(circle at 30% 30%, ${color}, ${color}dd)`,
          boxShadow: `0 2px 4px ${color}33`
        }}
      />
    </motion.div>
  )
}