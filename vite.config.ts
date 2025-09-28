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
        manualChunks: {
          // Core React chunk
          'react-core': ['react', 'react-dom', 'react-router-dom'],

          // UI components chunk
          'ui-components': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            'lucide-react'
          ],

          // Charts chunk (lazy loaded)
          'charts': ['recharts'],

          // Maps chunk (lazy loaded)
          'maps': ['leaflet', 'react-leaflet'],

          // Export functionality chunk (lazy loaded)
          'export': ['jspdf', 'jspdf-autotable', 'xlsx'],

          // Motion animations chunk
          'motion': ['framer-motion'],

          // Data management chunk
          'data': ['zustand', 'date-fns']
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
    chunkSizeWarningLimit: 800, // Government standard
    minify: 'terser',
    terserOptions: {
      compress: {
        drop_console: true, // Remove console.logs in production
        drop_debugger: true,
        passes: 2
      },
      mangle: {
        safari10: true
      }
    },
    reportCompressedSize: false
  },
})