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
    },
  },
  server: {
    port: 5173,
    host: true,
  },
  build: {
    outDir: 'dist',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          // Separar React y React DOM
          react: ['react', 'react-dom'],
          // Separar Framer Motion
          motion: ['framer-motion'],
          // Separar librerías de UI grandes
          radix: [
            '@radix-ui/react-accordion',
            '@radix-ui/react-alert-dialog', 
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-dialog',
            '@radix-ui/react-popover',
            '@radix-ui/react-navigation-menu',
            '@radix-ui/react-menubar',
            '@radix-ui/react-hover-card',
            '@radix-ui/react-context-menu',
            '@radix-ui/react-collapsible',
            '@radix-ui/react-checkbox',
            '@radix-ui/react-avatar',
            '@radix-ui/react-aspect-ratio'
          ],
          // Separar librerías de charts
          charts: ['recharts'],
          // Separar librerías de mapas
          maps: ['react-leaflet', 'leaflet'],
          // Separar librerías de PDF/Excel
          export: ['jspdf', 'jspdf-autotable', 'xlsx'],
          // Separar utilidades
          utils: ['clsx', 'class-variance-authority', 'tailwind-merge'],
          // Separar router
          router: ['react-router-dom']
        }
      }
    },
    // Optimizaciones adicionales
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild', // Usar esbuild que es más rápido
    target: 'esnext',
    reportCompressedSize: false
  },
})