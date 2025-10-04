import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": "/src",
      "@domain": "/src/domain",
      "@application": "/src/application",
      "@infrastructure": "/src/infrastructure",
      "@presentation": "/src/presentation",
      "@shared": "/src/shared",
      "@features": "/src/features",
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    // Government performance optimizations
    target: 'es2020',
    cssCodeSplit: true,
    rollupOptions: {
      output: {
        // Advanced chunking strategy for government apps
        manualChunks: (id) => {
          // Vendor chunks por tipo
          if (id.includes('node_modules')) {
            // React y relacionados
            if (id.includes('react') || id.includes('react-dom') || id.includes('react-router')) {
              return 'vendor-react';
            }
            // UI Components
            if (id.includes('@radix-ui') || id.includes('lucide-react')) {
              return 'vendor-ui';
            }
            // Charts - separado para lazy loading
            if (id.includes('recharts')) {
              return 'vendor-charts';
            }
            // Maps - separado para lazy loading
            if (id.includes('leaflet')) {
              return 'vendor-maps';
            }
            // Export libraries - separado para lazy loading
            if (id.includes('jspdf') || id.includes('xlsx')) {
              return 'vendor-export';
            }
            // Animations
            if (id.includes('framer-motion')) {
              return 'vendor-motion';
            }
            // State management y utilidades
            if (id.includes('zustand') || id.includes('date-fns') || id.includes('immer')) {
              return 'vendor-state';
            }
            // Resto de vendors en un chunk común pero más pequeño
            return 'vendor-common';
          }
          
          // Separar features por ruta para mejor code splitting
          if (id.includes('src/features/admin')) {
            return 'feature-admin';
          }
          if (id.includes('src/features/dashboard')) {
            return 'feature-dashboard';
          }
          if (id.includes('src/features/reports')) {
            return 'feature-reports';
          }
          if (id.includes('src/features/activity')) {
            return 'feature-activity';
          }
          if (id.includes('src/features/alerts')) {
            return 'feature-alerts';
          }
        },
        // Government-optimized file naming
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace('.tsx', '').replace('.ts', '')
            : 'chunk';
          return `assets/gov-${facadeModuleId}-[hash].js`;
        },
        assetFileNames: 'assets/gov-[name]-[hash][extname]'
      }
    },
    // Performance optimizations
    chunkSizeWarningLimit: 500, // Reducido de 800 a 500KB para mejor performance
    minify: 'terser',
    terserOptions: {
      compress: {
        // Solo eliminar console.log, mantener error/warn/info para debugging en producción
        pure_funcs: ['console.log', 'console.debug'],
        drop_debugger: true,
        passes: 2,
        // Optimizaciones adicionales
        dead_code: true,
        keep_fargs: false,
        keep_fnames: false,
      },
      mangle: {
        safari10: true
      },
      format: {
        // Preservar comentarios de licencias y legales
        comments: /^!/
      }
    },
    reportCompressedSize: true, // Cambiar a true para ver tamaños reales
    // Optimización adicional de assets
    assetsInlineLimit: 4096, // 4KB - inline pequeños assets como base64
  },
})