import { motion } from 'framer-motion'
import { useState, useEffect } from 'react'

export type MascotMood = 'happy' | 'concerned' | 'worried' | 'critical' | 'sleeping'

interface WaterMascotProps {
  mood?: MascotMood
  size?: 'sm' | 'md' | 'lg'
  showBubbles?: boolean
  className?: string
}

const mascotConfigs = {
  happy: {
    face: '●',
    color: '#22c55e',
    bgColor: 'rgba(34, 197, 94, 0.08)',
    message: 'Sistema operativo',
    animation: 'subtle'
  },
  concerned: {
    face: '●',
    color: '#f59e0b',
    bgColor: 'rgba(245, 158, 11, 0.08)',
    message: 'Monitoreo activo',
    animation: 'subtle'
  },
  worried: {
    face: '●',
    color: '#f97316',
    bgColor: 'rgba(249, 115, 22, 0.08)',
    message: 'Nivel elevado detectado',
    animation: 'subtle'
  },
  critical: {
    face: '●',
    color: '#ef4444',
    bgColor: 'rgba(239, 68, 68, 0.08)',
    message: 'Alerta de nivel crítico',
    animation: 'urgent'
  },
  sleeping: {
    face: '●',
    color: '#6b7280',
    bgColor: 'rgba(107, 114, 128, 0.08)',
    message: 'Sistema inactivo',
    animation: 'minimal'
  }
}

const animations = {
  subtle: {
    scale: [1, 1.01, 1],
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' as const }
  },
  urgent: {
    scale: [1, 1.03, 1],
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' as const }
  },
  minimal: {
    opacity: [1, 0.7, 1],
    transition: { duration: 4, repeat: Infinity, ease: 'easeInOut' as const }
  }
}

const sizeClasses = {
  sm: 'w-12 h-12 text-lg',
  md: 'w-16 h-16 text-2xl',
  lg: 'w-20 h-20 text-3xl'
}

export function WaterMascot({ 
  mood = 'happy', 
  size = 'md', 
  showBubbles = true,
  className = ''
}: WaterMascotProps) {
  const [showMessage, setShowMessage] = useState(false)
  const config = mascotConfigs[mood]

  useEffect(() => {
    const timer = setTimeout(() => setShowMessage(true), 5000)
    const hideTimer = setTimeout(() => setShowMessage(false), 8000)
    
    return () => {
      clearTimeout(timer)
      clearTimeout(hideTimer)
    }
  }, [mood])

  return (
    <div className={`relative ${className}`}>
      {/* Mascot */}
      <motion.div
        className={`${sizeClasses[size]} rounded-full flex items-center justify-center cursor-pointer relative overflow-hidden`}
        style={{
          backgroundColor: config.bgColor,
          border: `2px solid ${config.color}20`
        }}
        animate={animations[config.animation as keyof typeof animations]}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.95 }}
      >
        {/* Water ripple effect */}
        <motion.div
          className="absolute inset-0 rounded-full"
          style={{ backgroundColor: config.color }}
          initial={{ scale: 0, opacity: 0.5 }}
          animate={{ 
            scale: [0, 1.2], 
            opacity: [0.5, 0] 
          }}
          transition={{ 
            duration: 2, 
            repeat: Infinity, 
            repeatDelay: 1 
          }}
        />
        
        {/* Face */}
        <span className="relative z-10" style={{ fontSize: 'inherit' }}>
          {config.face}
        </span>
      </motion.div>

      {/* Bubbles */}
      {showBubbles && (
        <div className="absolute -top-2 -right-2">
          {[...Array(3)].map((_, i) => (
            <motion.div
              key={i}
              className="absolute w-1 h-1 bg-blue-400 rounded-full opacity-60"
              initial={{ y: 0, opacity: 0.6, scale: 0 }}
              animate={{
                y: [-20, -40],
                opacity: [0.6, 0],
                scale: [0, 1, 0.5]
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                delay: i * 0.3,
                ease: 'easeOut'
              }}
              style={{
                left: `${i * 4}px`,
                top: `${i * 2}px`
              }}
            />
          ))}
        </div>
      )}

      {/* Message tooltip */}
      {showMessage && (
        <motion.div
          className="absolute -top-12 left-1/2 transform -translate-x-1/2 z-20"
          initial={{ opacity: 0, y: 10, scale: 0.8 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 10, scale: 0.8 }}
        >
          <div 
            className="px-3 py-1 rounded-lg text-xs font-medium text-white relative shadow-lg"
            style={{ backgroundColor: config.color }}
          >
            {config.message}
            <div 
              className="absolute top-full left-1/2 transform -translate-x-1/2 w-0 h-0"
              style={{
                borderLeft: '4px solid transparent',
                borderRight: '4px solid transparent',
                borderTop: `4px solid ${config.color}`
              }}
            />
          </div>
        </motion.div>
      )}
    </div>
  )
}

// Hook to automatically determine mood based on system status
export function useSystemMood(
  criticalStations: number,
  averageLevel: number,
  threshold: number = 3.0,
  isSystemActive: boolean = true
): MascotMood {
  if (!isSystemActive) return 'sleeping'
  
  if (criticalStations > 0) return 'critical'
  
  const levelRatio = averageLevel / threshold
  
  if (levelRatio > 0.9) return 'worried'
  if (levelRatio > 0.7) return 'concerned'
  
  return 'happy'
}