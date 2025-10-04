# 🚀 Guía de Optimización de Performance

## 📊 Estado Actual

### Análisis de Bundle (Último Build)

```
✅ Total bundles: 28 archivos
⚠️  Chunks > 500KB: 3 archivos
📦 Tamaño total: ~2.5MB (antes de gzip)
📦 Tamaño comprimido: ~625KB (gzip)
```

### Chunks más grandes:
```
676KB - gov-chunk-Cdn3VI1g.js (179KB gzip) - Recharts/Data visualization
644KB - gov-chunk-Dn6DHFV8.js (197KB gzip) - Leaflet/Maps
640KB - gov-chunk-DS-T2uW8.js (206KB gzip) - UI Components
```

---

## ✅ Optimizaciones Ya Implementadas

### 1. Code Splitting Inteligente
```typescript
// Separación por vendor
- vendor-react: React core
- vendor-ui: Radix UI + Lucide icons
- vendor-charts: Recharts (lazy loaded)
- vendor-maps: Leaflet (lazy loaded)
- vendor-export: jsPDF + xlsx (lazy loaded)
- vendor-motion: Framer Motion
- vendor-state: Zustand + date-fns

// Separación por feature
- feature-admin
- feature-dashboard
- feature-reports
- feature-activity
- feature-alerts
```

### 2. Terser Optimizaciones
```typescript
- dead_code removal: ✅
- console.log elimination: ✅
- debugger removal: ✅
- Aggressive minification: ✅
```

### 3. Asset Optimization
```typescript
- assetsInlineLimit: 4KB (small images as base64)
- CSS code splitting: ✅
- Modern ES2020 target: ✅
```

---

## 🎯 Recomendaciones Adicionales (Opcionales)

### Nivel 1: Optimizaciones Rápidas (30 min)

#### A. Lazy Loading de Rutas Pesadas
Ya implementado en `App.tsx`:
```typescript
const AdminPage = lazy(() => import('@presentation/pages/AdminPage'))
const DashboardPage = lazy(() => import('@presentation/pages/DashboardPage'))
// ... resto de lazy imports
```
✅ **Ya implementado**

#### B. Preload de Recursos Críticos
Agregar a `index.html`:
```html
<!-- Preload fonts críticos -->
<link rel="preload" href="/fonts/inter.woff2" as="font" type="font/woff2" crossorigin>

<!-- Preconnect a API -->
<link rel="preconnect" href="https://api.tudominio.cl">
<link rel="dns-prefetch" href="https://api.tudominio.cl">
```

### Nivel 2: Optimizaciones Intermedias (2-3 horas)

#### A. Implementar Suspense Boundaries
```typescript
// En App.tsx, mejorar suspense
<Suspense 
  fallback={
    <PageLoading 
      message="Cargando..." 
      showProgress 
    />
  }
>
  <Routes>
    {/* rutas */}
  </Routes>
</Suspense>
```

#### B. Lazy Load de Gráficos Pesados
```typescript
// En componentes con Recharts
const Chart = lazy(() => import('./HeavyChart'));

// Uso
<Suspense fallback={<ChartSkeleton />}>
  <Chart data={data} />
</Suspense>
```

#### C. Virtualización de Listas Largas
Para listas con muchos items, usar `react-window`:
```bash
pnpm add react-window @types/react-window
```

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={items.length}
  itemSize={50}
  width="100%"
>
  {Row}
</FixedSizeList>
```

### Nivel 3: Optimizaciones Avanzadas (1-2 días)

#### A. Implementar Service Worker (PWA)
```bash
pnpm add vite-plugin-pwa -D
```

```typescript
// vite.config.ts
import { VitePWA } from 'vite-plugin-pwa'

plugins: [
  react(),
  VitePWA({
    registerType: 'autoUpdate',
    includeAssets: ['favicon.ico', 'robots.txt', 'apple-touch-icon.png'],
    manifest: {
      name: 'Sistema Monitoreo Río Claro',
      short_name: 'RíoClaro',
      description: 'Sistema de monitoreo hidrológico',
      theme_color: '#1e40af',
      icons: [/* ... */]
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,ico,png,svg}'],
      runtimeCaching: [
        {
          urlPattern: /^https:\/\/api\./,
          handler: 'NetworkFirst',
          options: {
            cacheName: 'api-cache',
            expiration: {
              maxEntries: 50,
              maxAgeSeconds: 300 // 5 minutos
            }
          }
        }
      ]
    }
  })
]
```

#### B. Image Optimization
```bash
pnpm add vite-plugin-imagemin -D
```

```typescript
// vite.config.ts
import viteImagemin from 'vite-plugin-imagemin'

plugins: [
  viteImagemin({
    gifsicle: { optimizationLevel: 7 },
    optipng: { optimizationLevel: 7 },
    mozjpeg: { quality: 80 },
    svgo: {
      plugins: [
        { name: 'removeViewBox', active: false },
        { name: 'removeEmptyAttrs', active: true }
      ]
    }
  })
]
```

#### C. CDN para Librerías Pesadas
```html
<!-- En index.html para producción -->
<script crossorigin src="https://unpkg.com/react@18/umd/react.production.min.js"></script>
<script crossorigin src="https://unpkg.com/react-dom@18/umd/react-dom.production.min.js"></script>
```

```typescript
// vite.config.ts
build: {
  rollupOptions: {
    external: ['react', 'react-dom'],
    output: {
      globals: {
        react: 'React',
        'react-dom': 'ReactDOM'
      }
    }
  }
}
```

---

## 📈 Métricas y Monitoreo

### Herramientas Recomendadas

1. **Lighthouse CI**
   ```bash
   npm install -g @lhci/cli
   lhci autorun
   ```

2. **Bundle Analyzer**
   ```bash
   pnpm add -D rollup-plugin-visualizer
   ```
   
   ```typescript
   // vite.config.ts
   import { visualizer } from 'rollup-plugin-visualizer';
   
   plugins: [
     visualizer({
       open: true,
       gzipSize: true,
       brotliSize: true,
     })
   ]
   ```

3. **Web Vitals Tracking**
   ```typescript
   // src/main.tsx
   import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';
   
   function sendToAnalytics(metric) {
     // Enviar a tu servicio de analytics
     console.log(metric);
   }
   
   getCLS(sendToAnalytics);
   getFID(sendToAnalytics);
   getFCP(sendToAnalytics);
   getLCP(sendToAnalytics);
   getTTFB(sendToAnalytics);
   ```

### Objetivos de Performance

```
Target Metrics (Lighthouse):
- Performance: > 90
- Accessibility: > 95
- Best Practices: > 95
- SEO: > 90

Core Web Vitals:
- LCP (Largest Contentful Paint): < 2.5s
- FID (First Input Delay): < 100ms
- CLS (Cumulative Layout Shift): < 0.1
```

---

## 🎛️ Configuración por Entorno

### Desarrollo
```typescript
// vite.config.ts - desarrollo
export default defineConfig(({ mode }) => ({
  build: {
    minify: mode === 'production',
    sourcemap: mode !== 'production',
    reportCompressedSize: mode === 'production'
  }
}))
```

### Producción
```bash
# .env.production
VITE_ENABLE_ANALYTICS=true
VITE_ENABLE_COMPRESSION=true
VITE_CDN_URL=https://cdn.tudominio.cl
```

---

## 🔍 Checklist de Optimización

### Pre-Deploy
- [x] Lazy loading implementado
- [x] Code splitting configurado
- [x] console.log eliminados en producción
- [x] Terser optimizations habilitadas
- [x] CSS code splitting activado
- [ ] Service Worker (PWA) - Opcional
- [ ] Image optimization - Opcional
- [ ] CDN configurado - Opcional

### Post-Deploy
- [ ] Lighthouse audit > 90
- [ ] Core Web Vitals monitoreados
- [ ] Bundle size < 500KB por chunk
- [ ] Time to Interactive < 3s
- [ ] First Contentful Paint < 1.5s

---

## 📚 Recursos Adicionales

- [Vite Performance Guide](https://vitejs.dev/guide/performance.html)
- [React Performance Optimization](https://react.dev/learn/render-and-commit)
- [Web.dev Performance](https://web.dev/performance/)
- [Bundle Size Guide](https://bundlephobia.com/)

---

**Última actualización**: $(date +"%Y-%m-%d")  
**Versión**: 1.0
