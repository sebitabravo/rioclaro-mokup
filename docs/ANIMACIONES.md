# 🎬 Sistema de Animaciones - Monitoreo Río Claro

## 🎯 Visión General

El sistema de animaciones del proyecto está diseñado para proporcionar **feedback visual intuitivo**, **mejorar la experiencia del usuario** y **transmitir información crítica** sobre el estado del río de manera elegante y performante.

## ✨ Principios de Diseño

### 1. **Claridad Visual**
- Las animaciones comunican el estado del sistema de forma clara
- Diferenciación visual inmediata entre estados críticos y normales
- Transiciones suaves que no distraen de la información importante

### 2. **Rendimiento Optimizado**  
- Uso de `transform` y `opacity` para animaciones GPU-accelerated
- Framer Motion con `layoutId` para animaciones compartidas
- Lazy loading de animaciones pesadas
- Reducción de animaciones en `prefers-reduced-motion`

### 3. **Feedback Emocional**
- Estados críticos del río transmiten urgencia visual apropiada
- Animaciones celebran datos positivos y tendencias favorables
- Mascota interactiva que refleja el estado general del sistema

## 🎨 Implementación Técnica

### Configuración Base con Framer Motion

```typescript
// src/shared/types/animation-types.ts
export const pageVariants = {
  initial: { 
    opacity: 0,
    scale: 0.98,
    y: 20
  },
  in: { 
    opacity: 1,
    scale: 1,
    y: 0
  },
  out: { 
    opacity: 0,
    scale: 1.02,
    y: -20
  }
}

export const pageTransition = {
  type: 'tween' as const,
  ease: [0.4, 0, 0.2, 1] as const,
  duration: 0.2
}

export const cardVariants = {
  hidden: { 
    opacity: 0, 
    scale: 0.95,
    y: 20
  },
  visible: { 
    opacity: 1, 
    scale: 1,
    y: 0,
    transition: { 
      duration: 0.3,
      ease: "easeOut"
    }
  },
  hover: { 
    scale: 1.02,
    y: -4,
    transition: { 
      duration: 0.2,
      ease: "easeInOut"
    }
  }
}
```

## 🌊 Animaciones por Categoría

### 1. **Transiciones de Página**

Implementadas en `App.tsx` con lazy loading y animaciones fluidas:

```typescript
// App.tsx - Rutas animadas
const AnimatedRoute = ({ children }: { children: React.ReactNode }) => (
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

export function App() {
  const location = useLocation()

  return (
    <AnimatePresence mode="wait" initial={false}>
      <Suspense fallback={<PageLoading />}>
        <Routes location={location} key={location.pathname}>
          <Route path="/" element={<AnimatedRoute><HomePage /></AnimatedRoute>} />
          <Route path="/dashboard" element={<AnimatedRoute><DashboardPage /></AnimatedRoute>} />
          {/* Más rutas... */}
        </Routes>
      </Suspense>
    </AnimatePresence>
  )
}
```

### 2. **Componentes de Carga**

```typescript
// src/presentation/components/ui/page-loading.tsx
export const PageLoading: React.FC = () => {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="min-h-screen flex items-center justify-center bg-background"
    >
      <motion.div 
        className="text-center space-y-6"
        initial={{ scale: 0.8, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 0.1 }}
      >
        {/* Animación de río con CSS */}
        <div className="relative w-32 h-32 mx-auto">
          <motion.div
            className="absolute inset-0 bg-gradient-to-r from-blue-400 to-blue-600 rounded-full"
            animate={{
              scale: [1, 1.1, 1],
              rotate: [0, 360]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut"
            }}
          />
          <motion.div
            className="absolute inset-2 bg-gradient-to-r from-blue-300 to-blue-500 rounded-full"
            animate={{
              scale: [1.1, 1, 1.1],
              rotate: [360, 0]
            }}
            transition={{
              duration: 2,
              repeat: Infinity,
              ease: "easeInOut",
              delay: 0.5
            }}
          />
        </div>
        
        <motion.h2 
          className="text-2xl font-semibold text-foreground"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.5, repeat: Infinity }}
        >
          Cargando Sistema Río Claro
        </motion.h2>
      </motion.div>
    </motion.div>
  )
}
```

### 3. **Botones Animados**

```typescript
// src/presentation/components/ui/animated-button.tsx
interface AnimatedButtonProps extends ButtonProps {
  animationType?: 'scale' | 'glow' | 'bounce' | 'shake' | 'pulse'
  isLoading?: boolean
}

export const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children,
  animationType = 'scale',
  isLoading = false,
  className,
  ...props
}) => {
  const animations = {
    scale: {
      whileHover: { scale: 1.05 },
      whileTap: { scale: 0.95 }
    },
    glow: {
      whileHover: { 
        boxShadow: "0 0 20px rgba(59, 130, 246, 0.5)",
        scale: 1.02
      }
    },
    bounce: {
      whileHover: { y: -2 },
      whileTap: { y: 0 }
    },
    shake: {
      whileHover: {
        x: [0, -2, 2, -2, 2, 0],
        transition: { duration: 0.4 }
      }
    },
    pulse: {
      animate: {
        scale: [1, 1.05, 1],
        transition: { duration: 1, repeat: Infinity }
      }
    }
  }

  return (
    <motion.div
      {...animations[animationType]}
      transition={{ type: "spring", stiffness: 300, damping: 20 }}
    >
      <Button
        className={cn("relative overflow-hidden", className)}
        disabled={isLoading}
        {...props}
      >
        {isLoading && (
          <motion.div
            className="absolute inset-0 bg-current opacity-20"
            initial={{ x: "-100%" }}
            animate={{ x: "100%" }}
            transition={{ duration: 1, repeat: Infinity }}
          />
        )}
        {children}
      </Button>
    </motion.div>
  )
}
```

### 4. **Gráficos Animados**

```typescript
// src/presentation/components/charts/MetricChart.tsx
export const MetricChart: React.FC<MetricChartProps> = ({ data, title }) => {
  const [animationComplete, setAnimationComplete] = useState(false)

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="bg-card rounded-lg p-6"
    >
      <motion.h3 
        className="text-lg font-semibold mb-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2 }}
      >
        {title}
      </motion.h3>
      
      <ResponsiveContainer width="100%" height={300}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="timestamp" />
          <YAxis />
          <Tooltip />
          <Line 
            type="monotone" 
            dataKey="value" 
            stroke="#3b82f6"
            strokeWidth={2}
            dot={{ r: 4 }}
            // Animación progresiva de la línea
            animationBegin={0}
            animationDuration={1500}
            onAnimationEnd={() => setAnimationComplete(true)}
          />
        </LineChart>
      </ResponsiveContainer>

      {/* Indicador de datos críticos */}
      <AnimatePresence>
        {data.some(point => point.is_critical) && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg"
          >
            <motion.div
              animate={{ 
                color: ["#dc2626", "#ef4444", "#dc2626"]
              }}
              transition={{ duration: 1, repeat: Infinity }}
              className="flex items-center gap-2 text-red-600"
            >
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                Niveles críticos detectados
              </span>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
```

### 5. **Estados de Estaciones en Mapas**

```typescript
// src/presentation/components/maps/StationsMap.tsx
const StationMarker: React.FC<{ station: Station }> = ({ station }) => {
  const getMarkerAnimation = (status: Station['status']) => {
    switch (status) {
      case 'active':
        return station.is_critical 
          ? {
              scale: [1, 1.2, 1],
              backgroundColor: ["#dc2626", "#ef4444", "#dc2626"],
              transition: { duration: 1, repeat: Infinity }
            }
          : {
              scale: [1, 1.05, 1],
              backgroundColor: ["#16a34a", "#22c55e", "#16a34a"],
              transition: { duration: 2, repeat: Infinity }
            }
      case 'maintenance':
        return {
          x: [0, -2, 2, 0],
          backgroundColor: "#f59e0b",
          transition: { duration: 0.5, repeat: Infinity }
        }
      case 'inactive':
        return {
          opacity: [0.3, 0.6, 0.3],
          backgroundColor: "#6b7280",
          transition: { duration: 1.5, repeat: Infinity }
        }
    }
  }

  return (
    <Marker position={[station.latitude, station.longitude]}>
      <motion.div
        className="w-6 h-6 rounded-full border-2 border-white shadow-lg"
        animate={getMarkerAnimation(station.status)}
        whileHover={{ scale: 1.3 }}
        style={{ backgroundColor: getStatusColor(station.status) }}
      />
      <Popup>
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="p-2"
        >
          <h3 className="font-semibold">{station.name}</h3>
          <p>Nivel: {station.current_level}m</p>
          <p>Estado: {station.status}</p>
          {station.is_critical && (
            <motion.p
              animate={{ color: ["#dc2626", "#ef4444", "#dc2626"] }}
              transition={{ duration: 1, repeat: Infinity }}
              className="font-bold"
            >
              ⚠️ CRÍTICO
            </motion.p>
          )}
        </motion.div>
      </Popup>
    </Marker>
  )
}
```

### 6. **Dashboard Interactivo**

```typescript
// src/presentation/pages/DashboardPage.tsx
export const DashboardPage: React.FC = () => {
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      <main className="container mx-auto px-4 py-8">
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="visible"
          className="space-y-8"
        >
          {/* Header animado */}
          <motion.div variants={cardVariants}>
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Dashboard - Río Claro
            </h1>
            <p className="text-muted-foreground">
              Monitoreo en tiempo real del nivel de agua
            </p>
          </motion.div>

          {/* Grid de métricas */}
          <motion.div 
            variants={cardVariants}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
          >
            {mockMetricData.map((metric, index) => (
              <motion.div
                key={metric.id}
                variants={cardVariants}
                whileHover="hover"
                className="bg-card p-6 rounded-lg border shadow-sm"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{metric.label}</p>
                    <motion.p
                      className="text-2xl font-bold"
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ delay: index * 0.1 + 0.5 }}
                    >
                      {metric.value}
                    </motion.p>
                  </div>
                  <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ 
                      duration: 3 + index, 
                      repeat: Infinity, 
                      ease: "linear" 
                    }}
                  >
                    {metric.icon}
                  </motion.div>
                </div>
                
                {/* Mini gráfico de tendencia */}
                <MiniTrendChart data={metric.trendData} />
              </motion.div>
            ))}
          </motion.div>

          {/* Gráficos principales */}
          <motion.div variants={cardVariants}>
            <MetricsDashboard />
          </motion.div>
        </motion.div>
      </main>
    </div>
  )
}
```

### 7. **Mascota Emocional del Sistema**

```typescript
// src/presentation/components/ui/water-mascot.tsx
interface WaterMascotProps {
  riverStatus: 'normal' | 'warning' | 'critical' | 'excellent'
  size?: 'sm' | 'md' | 'lg'
}

export const WaterMascot: React.FC<WaterMascotProps> = ({ 
  riverStatus, 
  size = 'md' 
}) => {
  const getMascotState = (status: typeof riverStatus) => {
    switch (status) {
      case 'excellent':
        return {
          emoji: '😊',
          color: '#16a34a',
          animation: {
            y: [0, -8, 0],
            rotate: [0, 5, -5, 0],
            transition: { duration: 2, repeat: Infinity }
          },
          message: '¡El río está en excelente estado!'
        }
      case 'normal':
        return {
          emoji: '🙂',
          color: '#3b82f6',
          animation: {
            scale: [1, 1.05, 1],
            transition: { duration: 3, repeat: Infinity }
          },
          message: 'Todo normal en el río'
        }
      case 'warning':
        return {
          emoji: '😰',
          color: '#f59e0b',
          animation: {
            x: [0, -3, 3, 0],
            transition: { duration: 0.5, repeat: Infinity }
          },
          message: 'Atención: niveles elevados'
        }
      case 'critical':
        return {
          emoji: '😱',
          color: '#dc2626',
          animation: {
            scale: [1, 1.1, 1],
            rotate: [0, -10, 10, 0],
            transition: { duration: 0.3, repeat: Infinity }
          },
          message: '¡ALERTA! Riesgo de inundación'
        }
    }
  }

  const mascotState = getMascotState(riverStatus)
  const sizeClasses = {
    sm: 'text-4xl',
    md: 'text-6xl',
    lg: 'text-8xl'
  }

  return (
    <motion.div 
      className="text-center"
      initial={{ opacity: 0, scale: 0.5 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.5 }}
    >
      <motion.div
        className={`${sizeClasses[size]} mb-2`}
        animate={mascotState.animation}
      >
        {mascotState.emoji}
      </motion.div>
      
      <motion.p
        className="text-sm font-medium"
        style={{ color: mascotState.color }}
        animate={{ opacity: [0.7, 1, 0.7] }}
        transition={{ duration: 2, repeat: Infinity }}
      >
        {mascotState.message}
      </motion.p>
    </motion.div>
  )
}
```

## 🎯 Optimizaciones de Rendimiento

### 1. **Reducción de Animaciones**

```typescript
// src/shared/hooks/useBrowserDetect.ts
export const useBrowserDetect = () => {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  
  return {
    prefersReducedMotion,
    // Devolver versiones simplificadas de animaciones
    getOptimizedVariants: (variants: any) => 
      prefersReducedMotion 
        ? { ...variants, transition: { duration: 0 } }
        : variants
  }
}
```

### 2. **Lazy Loading de Animaciones**

```typescript
// Componentes pesados con animaciones se cargan bajo demanda
const HeavyAnimatedChart = lazy(() => 
  import('./HeavyAnimatedChart').then(module => ({
    default: module.HeavyAnimatedChart
  }))
)
```

### 3. **GPU Acceleration**

```css
/* src/styles/cross-browser-animations.css */
.gpu-accelerated {
  transform: translateZ(0);
  will-change: transform, opacity;
}

.smooth-animation {
  animation-fill-mode: both;
  animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
}
```

## 🧪 Testing de Animaciones

```typescript
// tests/animation-performance.spec.ts
import { test, expect } from '@playwright/test'

test.describe('Animaciones', () => {
  test('las transiciones de página no exceden 500ms', async ({ page }) => {
    await page.goto('/')
    
    const startTime = Date.now()
    await page.click('a[href="/dashboard"]')
    await page.waitForSelector('[data-testid="dashboard-content"]')
    const endTime = Date.now()
    
    expect(endTime - startTime).toBeLessThan(500)
  })

  test('los gráficos se animan correctamente', async ({ page }) => {
    await page.goto('/dashboard')
    
    // Verificar que la animación del gráfico se ejecuta
    const chartLine = page.locator('.recharts-line-curve')
    await expect(chartLine).toBeVisible()
    
    // La línea debe tener la clase de animación
    await expect(chartLine).toHaveClass(/.*recharts-line.*/)
  })
})
```

## 🌟 Características Destacadas

### ✅ **Implementado Completamente**

1. **Transiciones fluidas** entre páginas con AnimatePresence
2. **Lazy loading** optimizado con React.Suspense  
3. **Feedback visual** para estados críticos del río
4. **Mascota emocional** que refleja el estado del sistema
5. **Botones animados** con múltiples variantes de interacción
6. **Gráficos progresivos** que se dibujan gradualmente
7. **Mapas interactivos** con marcadores animados por estado
8. **Loading states** elegantes y informativos
9. **Hover effects** sutiles y profesionales
10. **Optimizaciones cross-browser** con CSS personalizado

### 🚀 **Beneficios del Sistema**

- **UX Mejorada**: Las animaciones guían la atención del usuario
- **Feedback Claro**: Estados críticos se comunican visualmente
- **Rendimiento**: Uso de GPU acceleration y lazy loading
- **Accesibilidad**: Respeta `prefers-reduced-motion`
- **Escalabilidad**: Fácil agregar nuevas animaciones
- **Mantenibilidad**: Código organizado en tipos y utilidades

Este sistema de animaciones eleva significativamente la experiencia del usuario mientras mantiene el rendimiento y la claridad visual necesarios para un sistema de monitoreo crítico como el del Río Claro.