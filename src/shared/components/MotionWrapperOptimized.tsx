import { motion, type Variants } from 'framer-motion'
import { ReactNode, useEffect, useState } from 'react'

interface MotionWrapperProps {
  children: ReactNode
  variant?: 'fadeIn' | 'slideUp' | 'slideIn' | 'scale' | 'stagger' | 'pulse' | 'shake' | 'wave' | 'glow' | 'float' | 'bounce' | 'cardEntry'
  className?: string
  delay?: number
  duration?: number
  infinite?: boolean
  browserOptimized?: boolean
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
        staggerChildren: 0.05,
        delayChildren: 0.02
      }
    }
  },
  pulse: {
    hidden: { scale: 1 },
    visible: {
      scale: [1, 1.02, 1],
      transition: {
        duration: 1.5,
        repeat: 2, // Limitado para mejor compatibilidad
        ease: 'easeInOut'
      }
    }
  },
  shake: {
    hidden: { x: 0 },
    visible: {
      x: [-1, 1, -1, 1, 0], // Reducido para mejor rendimiento
      transition: {
        duration: 0.4,
        repeat: 1, // Solo una vez para evitar problemas de rendimiento
        ease: 'easeInOut'
      }
    }
  },
  wave: {
    hidden: { y: 0 },
    visible: {
      y: [-2, 2, -2, 2, 0], // Reducido para mejor rendimiento
      transition: {
        duration: 2,
        repeat: 2, // Limitado para compatibilidad
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
        '0 0 8px rgba(59, 130, 246, 0.2)', // Reducido para mejor rendimiento
        '0 0 0px rgba(59, 130, 246, 0)'
      ],
      transition: {
        duration: 2,
        repeat: 1, // Limitado para evitar problemas de rendimiento
        ease: 'easeInOut'
      }
    }
  },
  float: {
    hidden: { y: 0 },
    visible: {
      y: [-3, 3], // Reducido
      transition: {
        duration: 2,
        repeat: 3, // Limitado para compatibilidad
        repeatType: 'reverse' as const,
        ease: 'easeInOut'
      }
    }
  },
  bounce: {
    hidden: { y: 0 },
    visible: {
      y: [0, -5, 0], // Reducido
      transition: {
        duration: 1,
        repeat: 2, // Limitado
        ease: 'easeOut'
      }
    }
  },
  cardEntry: {
    hidden: {
      opacity: 0,
      y: 10,
      scale: 0.99
    },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.25,
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
  infinite,
  browserOptimized = true
}: MotionWrapperProps) {
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)
  const [isSafari, setIsSafari] = useState(false)

  useEffect(() => {
    // Detectar preferencia de usuario por menos movimiento
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)

    // Detectar Safari
    const isSafariBrowser = /^((?!chrome|android).)*safari/i.test(navigator.userAgent)
    setIsSafari(isSafariBrowser)

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

  // Optimizaciones específicas para Safari
  const safariOptimizedVariants = isSafari && browserOptimized ? {
    ...variants[variant],
    visible: {
      ...variants[variant].visible,
      transition: {
        ...((variants[variant].visible as any).transition || {}),
        // Reducir duración en Safari para mejor rendimiento
        duration: (((variants[variant].visible as any).transition?.duration as number) || 0.5) * 0.8,
        // Usar ease más simple en Safari
        ease: 'easeOut'
      }
    }
  } : variants[variant]

  const customVariants = duration || infinite ? {
    ...safariOptimizedVariants,
    visible: {
      ...safariOptimizedVariants.visible,
      transition: {
        ...((safariOptimizedVariants.visible as any).transition || {}),
        ...(duration && { duration }),
        ...(infinite && ((safariOptimizedVariants.visible as any).transition?.repeat !== Infinity) && { repeat: 3 }) // Limitar infinito en Safari
      }
    }
  } : safariOptimizedVariants

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={customVariants}
      style={{
        transitionDelay: `${delay}ms`,
        // Optimizaciones adicionales para Safari
        ...(isSafari && {
          willChange: 'transform, opacity',
          backfaceVisibility: 'hidden',
          transform: 'translateZ(0)'
        })
      }}
    >
      {children}
    </motion.div>
  )
}

// Export specialized motion components
export const MotionCard = motion.div
export const MotionButton = motion.button

// Componentes optimizados para compatibilidad cross-browser
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
  }, [])

  if (prefersReducedMotion || !isActive) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      animate={{
        boxShadow: [
          `0 0 0 0 ${pulseColor}`,
          `0 0 0 6px rgba(34, 197, 94, 0)`,
        ],
        scale: [1, 1.01, 1] // Reducido para mejor rendimiento
      }}
      transition={{
        duration: 2,
        repeat: 2, // Limitado para compatibilidad
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
  }, [])

  if (prefersReducedMotion || !isActive) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      animate={{
        scale: [1, 1.01, 1], // Reducido
        boxShadow: [
          '0 0 0 0 rgba(239, 68, 68, 0.4)',
          '0 0 0 4px rgba(239, 68, 68, 0)',
        ]
      }}
      transition={{
        duration: 1.5,
        repeat: 2, // Limitado
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
  }, [])

  if (prefersReducedMotion || !isActive) {
    return <div className={className}>{children}</div>
  }

  return (
    <motion.div
      className={className}
      animate={{
        x: [-0.5, 0.5, -0.5, 0.5, 0], // Reducido
        boxShadow: [
          '0 0 0 0 rgba(245, 158, 11, 0.3)',
          '0 0 0 3px rgba(245, 158, 11, 0)',
        ]
      }}
      transition={{
        duration: 1.2,
        repeat: 1, // Limitado
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
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false)

  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-reduced-motion: reduce)')
    setPrefersReducedMotion(mediaQuery.matches)
  }, [])

  if (prefersReducedMotion) {
    return (
      <div className={`inline-block ${className}`}>
        <div
          className="w-4 h-4 rounded-full"
          style={{
            background: `radial-gradient(circle at 30% 30%, ${color}, ${color}dd)`,
            boxShadow: `0 2px 4px ${color}33`
          }}
        />
      </div>
    )
  }

  return (
    <motion.div
      className={`inline-block ${className}`}
      animate={{
        y: [0, -6, 0], // Reducido
        scale: [1, 1.05, 1]
      }}
      transition={{
        duration: 2,
        repeat: 3, // Limitado para compatibilidad
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
