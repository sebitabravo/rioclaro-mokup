import { motion } from 'framer-motion'

export function PageLoading() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gov-primary/5">
      <div className="text-center">
        {/* Spinner animado */}
        <motion.div
          className="w-16 h-16 border-4 border-gov-primary/20 border-t-gov-primary rounded-full mx-auto mb-4"
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
        />
        
        {/* Texto de carga */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="text-gov-gray-b"
        >
          <p className="text-lg font-medium mb-2">Cargando página...</p>
          <p className="text-sm">Sistema de Monitoreo Río Claro</p>
        </motion.div>
        
        {/* Pulsos decorativos */}
        <div className="absolute inset-0 pointer-events-none">
          <motion.div
            className="absolute top-1/2 left-1/2 w-32 h-32 border border-gov-primary/10 rounded-full"
            style={{ x: '-50%', y: '-50%' }}
            animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0, 0.3] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.div
            className="absolute top-1/2 left-1/2 w-48 h-48 border border-gov-primary/5 rounded-full"
            style={{ x: '-50%', y: '-50%' }}
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0, 0.2] }}
            transition={{ duration: 3, repeat: Infinity, ease: "easeInOut", delay: 0.5 }}
          />
        </div>
      </div>
    </div>
  )
}