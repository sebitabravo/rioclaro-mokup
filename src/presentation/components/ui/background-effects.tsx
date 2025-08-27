import { motion } from 'framer-motion'

interface WaterRipplesProps {
  count?: number
  className?: string
}

export function WaterRipples({ count = 3, className = '' }: WaterRipplesProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full border border-blue-200/10"
          style={{
            width: `${150 + i * 75}px`,
            height: `${150 + i * 75}px`,
            left: `${25 + i * 20}%`,
            top: `${50 + i * 15}%`,
          }}
          animate={{
            scale: [1, 1.15, 1],
            opacity: [0.05, 0.15, 0.05],
          }}
          transition={{
            duration: 6 + i * 2,
            repeat: Infinity,
            delay: i * 2,
            ease: 'easeInOut'
          }}
        />
      ))}
    </div>
  )
}

interface FloatingParticlesProps {
  count?: number
  className?: string
  color?: string
}

export function FloatingParticles({ 
  count = 8, 
  className = '',
  color = '#3b82f6'
}: FloatingParticlesProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-1 h-1 rounded-full opacity-20"
          style={{
            backgroundColor: color,
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`,
          }}
          animate={{
            y: [-20, -100],
            x: [0, Math.random() * 40 - 20],
            opacity: [0.2, 0.6, 0],
            scale: [0.5, 1.2, 0.5]
          }}
          transition={{
            duration: 6 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
            ease: 'easeOut'
          }}
        />
      ))}
    </div>
  )
}

interface WavePatternProps {
  className?: string
  color?: string
  intensity?: 'subtle' | 'normal' | 'strong'
}

export function WavePattern({ 
  className = '',
  color = '#e0f2fe',
  intensity = 'subtle'
}: WavePatternProps) {
  const intensityConfig = {
    subtle: { amplitude: 10, frequency: 2, speed: 15 },
    normal: { amplitude: 20, frequency: 1.5, speed: 10 },
    strong: { amplitude: 30, frequency: 1, speed: 8 }
  }

  const config = intensityConfig[intensity]

  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      <svg
        className="absolute bottom-0 left-0 w-full"
        viewBox="0 0 1200 120"
        preserveAspectRatio="none"
      >
        <defs>
          <linearGradient id="waveGradient" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor={color} stopOpacity="0.1"/>
            <stop offset="100%" stopColor={color} stopOpacity="0.3"/>
          </linearGradient>
        </defs>
        
        <motion.path
          d="M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z"
          fill="url(#waveGradient)"
          animate={{
            d: [
              "M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z",
              `M0,${60+config.amplitude} C200,${20-config.amplitude} 400,${100+config.amplitude} 600,${60-config.amplitude} C800,${20+config.amplitude} 1000,${100-config.amplitude} 1200,${60+config.amplitude} L1200,120 L0,120 Z`,
              "M0,60 C200,20 400,100 600,60 C800,20 1000,100 1200,60 L1200,120 L0,120 Z"
            ]
          }}
          transition={{
            duration: config.speed,
            repeat: Infinity,
            ease: 'easeInOut'
          }}
        />
      </svg>
    </div>
  )
}

interface GradientOrbsProps {
  count?: number
  className?: string
}

export function GradientOrbs({ count = 2, className = '' }: GradientOrbsProps) {
  return (
    <div className={`absolute inset-0 overflow-hidden pointer-events-none ${className}`}>
      {[...Array(count)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute rounded-full blur-3xl opacity-5"
          style={{
            width: `${200 + i * 50}px`,
            height: `${200 + i * 50}px`,
            background: 'linear-gradient(135deg, #3b82f6, #1d4ed8)',
            left: `${30 + i * 40}%`,
            top: `${60 + i * 20}%`,
          }}
          animate={{
            x: [0, 20, 0],
            y: [0, -10, 0],
            scale: [1, 1.05, 1],
          }}
          transition={{
            duration: 30 + i * 10,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: i * 5
          }}
        />
      ))}
    </div>
  )
}