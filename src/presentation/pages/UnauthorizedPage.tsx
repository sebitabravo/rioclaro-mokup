import { motion } from 'framer-motion';
import { Shield, ArrowLeft, Home } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Card } from '@shared/components/ui/card';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@features/auth/stores/AuthStore';

const pageVariants = {
  initial: { opacity: 0, y: 20 },
  in: { opacity: 1, y: 0 },
  out: { opacity: 0, y: -20 }
};

const pageTransition = {
  type: 'tween' as const,
  ease: 'easeInOut' as const,
  duration: 0.3
};

export function UnauthorizedPage() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const handleGoBack = () => {
    navigate(-1);
  };

  const handleGoHome = () => {
    // Redirigir según el rol del usuario
    if (user?.role === 'Administrador') {
      navigate('/admin');
    } else {
      navigate('/dashboard');
    }
  };

  return (
    <motion.div
      initial="initial"
      animate="in"
      exit="out"
      variants={pageVariants}
      transition={pageTransition}
      className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gov-primary/5 to-gov-secondary/5 p-4"
    >
      <Card className="w-full max-w-md p-8 shadow-lg text-center">
        <div className="space-y-6">
          {/* Icon */}
          <div className="mx-auto w-20 h-20 bg-destructive/10 rounded-full flex items-center justify-center">
            <Shield className="w-10 h-10 text-destructive" />
          </div>

          {/* Content */}
          <div className="space-y-3">
            <h1 className="text-2xl font-bold text-foreground">
              Acceso Denegado
            </h1>
            <p className="text-muted-foreground">
              No tienes los permisos necesarios para acceder a esta página.
            </p>
            {user && (
              <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  Tu rol actual: <span className="font-medium">{user.role}</span>
                </p>
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleGoBack}
              variant="outline"
              className="w-full"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Volver Atrás
            </Button>

            <Button
              onClick={handleGoHome}
              className="w-full"
            >
              <Home className="w-4 h-4 mr-2" />
              Ir al Inicio
            </Button>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}