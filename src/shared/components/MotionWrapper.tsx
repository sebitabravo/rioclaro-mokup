import { motion, type Variants } from 'framer-motion'
import { ReactNode } from 'react'

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
        staggerChildren: 0.1,
        delayChildren: 0.1
      }
    }
  },
  pulse: {
    hidden: { scale: 1 },
    visible: { 
      scale: [1, 1.05, 1],
      transition: { 
        duration: 2,
        repeat: Infinity,
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
      y: 20, 
      scale: 0.98 
    },
    visible: { 
      opacity: 1, 
      y: 0, 
      scale: 1,
      transition: { 
        duration: 0.4, 
        ease: [0.4, 0, 0.2, 1] // Custom ease for card entry
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
  const customVariants = duration || infinite ? {
    ...variants[variant],
    visible: {
      ...variants[variant].visible,
      transition: {
        ...variants[variant].visible.transition,
        ...(duration && { duration }),
        ...(infinite && { repeat: Infinity })
      }
    }
  } : variants[variant]

  return (
    <motion.div
      className={className}
      initial="hidden"
      animate="visible"
      variants={customVariants}
      style={{ transitionDelay: `${delay}ms` }}
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
        scale: [1, 1.05, 1],
        boxShadow: [
          '0 0 0 0 rgba(239, 68, 68, 0.7)',
          '0 0 0 15px rgba(239, 68, 68, 0)',
        ]
      } : {}}
      transition={{
        duration: 1.5,
        repeat: isActive ? Infinity : 0,
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
        x: [-1, 1, -1, 1, 0],
        boxShadow: [
          '0 0 0 0 rgba(245, 158, 11, 0.5)',
          '0 0 0 8px rgba(245, 158, 11, 0)',
        ]
      } : {}}
      transition={{
        duration: 2,
        repeat: isActive ? Infinity : 0,
        repeatDelay: 0.5,
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