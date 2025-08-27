import { motion } from 'framer-motion'
import { Button, ButtonProps } from './button'
import { forwardRef } from 'react'

interface AnimatedButtonProps extends ButtonProps {
  animation?: 'scale' | 'glow' | 'bounce' | 'shake' | 'pulse'
  isLoading?: boolean
}

const animations = {
  scale: {
    hover: { scale: 1.05 },
    tap: { scale: 0.95 }
  },
  glow: {
    hover: { 
      boxShadow: '0 0 20px rgba(59, 130, 246, 0.5)',
      scale: 1.02
    },
    tap: { scale: 0.98 }
  },
  bounce: {
    hover: { y: -2 },
    tap: { y: 0 }
  },
  shake: {
    hover: { x: [0, -2, 2, -2, 2, 0] },
    tap: { scale: 0.95 }
  },
  pulse: {
    hover: { 
      scale: [1, 1.05, 1],
      transition: { 
        repeat: Infinity, 
        duration: 0.6,
        ease: 'easeInOut'
      }
    },
    tap: { scale: 0.95 }
  }
}

export const AnimatedButton = forwardRef<HTMLButtonElement, AnimatedButtonProps>(
  ({ children, animation = 'scale', isLoading = false, disabled, ...props }, ref) => {
    const animationVariants = animations[animation]
    
    return (
      <motion.div
        whileHover={!disabled && !isLoading ? animationVariants.hover : {}}
        whileTap={!disabled && !isLoading ? animationVariants.tap : {}}
        transition={{ type: 'spring', stiffness: 400, damping: 25 }}
      >
        <Button
          ref={ref}
          disabled={disabled || isLoading}
          {...props}
        >
          {isLoading ? (
            <motion.div
              className="flex items-center space-x-2"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <motion.div
                className="w-4 h-4 border-2 border-current border-t-transparent rounded-full"
                animate={{ rotate: 360 }}
                transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              />
              <span>Cargando...</span>
            </motion.div>
          ) : (
            children
          )}
        </Button>
      </motion.div>
    )
  }
)

AnimatedButton.displayName = 'AnimatedButton'