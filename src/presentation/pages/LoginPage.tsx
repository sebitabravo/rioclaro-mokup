import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Lock, LogIn } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Card } from '@shared/components/ui/card';
import { Alert, AlertDescription } from '@shared/components/ui/alert';
import { useAuth } from '@features/auth/stores/AuthStore';
import { LoginCredentials } from '@domain/repositories/AuthRepository';

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

export function LoginPage() {
  const navigate = useNavigate();
  const { login, isAuthenticated, isLoading, error, clearError } = useAuth();

  const [credentials, setCredentials] = useState<LoginCredentials>({
    username: '',
    password: ''
  });

  const [showPassword, setShowPassword] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});

  // Redirigir si ya está autenticado
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/dashboard', { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Limpiar errores cuando el usuario cambie los campos
  useEffect(() => {
    if (error) {
      clearError();
    }
    setValidationErrors({});
  }, [credentials, clearError, error]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!credentials.username.trim()) {
      errors.username = 'El email es requerido';
    } else if (!credentials.username.includes('@')) {
      errors.username = 'Debe ser un email válido';
    }

    if (!credentials.password) {
      errors.password = 'La contraseña es requerida';
    } else if (credentials.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await login(credentials);
      // El hook useAuth manejará la redirección automáticamente
    } catch (err) {
      // El error ya está manejado en el store
      console.error('Error during login:', err);
    }
  };

  const handleInputChange = (field: keyof LoginCredentials) => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    setCredentials(prev => ({
      ...prev,
      [field]: e.target.value
    }));
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
      <Card className="w-full max-w-md p-8 shadow-lg">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gov-primary/10 rounded-full flex items-center justify-center">
              <LogIn className="w-8 h-8 text-gov-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Iniciar Sesión
            </h1>
            <p className="text-muted-foreground">
              Sistema de Monitoreo RíoClaro
            </p>
          </div>

          {/* Error Alert */}
          {error && (
            <Alert className="border-destructive/50 text-destructive dark:border-destructive [&>svg]:text-destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username">Email</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="username"
                  type="email"
                  placeholder="Ingresa tu email"
                  value={credentials.username}
                  onChange={handleInputChange('username')}
                  className={`pl-10 ${validationErrors.username ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              {validationErrors.username && (
                <p className="text-sm text-destructive">{validationErrors.username}</p>
              )}
            </div>

            {/* Password Field */}
            <div className="space-y-2">
              <Label htmlFor="password">Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ingresa tu contraseña"
                  value={credentials.password}
                  onChange={handleInputChange('password')}
                  className={`pl-10 pr-10 ${validationErrors.password ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.password && (
                <p className="text-sm text-destructive">{validationErrors.password}</p>
              )}
            </div>

            {/* Submit Button */}
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Iniciando sesión...
                </>
              ) : (
                <>
                  <LogIn className="w-4 h-4 mr-2" />
                  Iniciar Sesión
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center space-y-2 text-sm">
            <p className="text-muted-foreground">
              ¿No tienes una cuenta?{' '}
              <Link
                to="/register"
                className="text-gov-primary hover:underline font-medium"
              >
                Regístrate aquí
              </Link>
            </p>

            {/* Demo credentials info */}
            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
              <p className="font-medium mb-1">Credenciales de prueba:</p>
              <p>Admin: admin@rioclaro.com / admin123</p>
              <p>Técnico: tecnico1@rioclaro.com / password</p>
              <p>Test: test@example.com / password</p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}