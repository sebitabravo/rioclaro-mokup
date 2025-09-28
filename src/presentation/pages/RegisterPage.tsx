import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Eye, EyeOff, User, Mail, Lock, UserPlus } from 'lucide-react';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Card } from '@shared/components/ui/card';
import { Alert, AlertDescription } from '@shared/components/ui/alert';
import { useAuth } from '@features/auth/stores/AuthStore';
import { RegisterData } from '@domain/repositories/AuthRepository';

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

export function RegisterPage() {
  const navigate = useNavigate();
  const { register, isAuthenticated, isLoading, error, clearError } = useAuth();

  const [userData, setUserData] = useState<RegisterData>({
    username: '',
    email: '',
    password: '',
    first_name: '',
    last_name: ''
  });

  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
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
  }, [userData, confirmPassword, clearError, error]);

  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    // Username validation
    if (!userData.username.trim()) {
      errors.username = 'El usuario es requerido';
    } else if (userData.username.length < 3) {
      errors.username = 'El usuario debe tener al menos 3 caracteres';
    } else if (!/^[a-zA-Z0-9_]+$/.test(userData.username)) {
      errors.username = 'El usuario solo puede contener letras, números y guiones bajos';
    }

    // Email validation
    if (!userData.email.trim()) {
      errors.email = 'El email es requerido';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(userData.email)) {
      errors.email = 'El formato del email no es válido';
    }

    // First name validation
    if (!userData.first_name.trim()) {
      errors.first_name = 'El nombre es requerido';
    } else if (userData.first_name.length < 2) {
      errors.first_name = 'El nombre debe tener al menos 2 caracteres';
    }

    // Last name validation
    if (!userData.last_name.trim()) {
      errors.last_name = 'El apellido es requerido';
    } else if (userData.last_name.length < 2) {
      errors.last_name = 'El apellido debe tener al menos 2 caracteres';
    }

    // Password validation
    if (!userData.password) {
      errors.password = 'La contraseña es requerida';
    } else if (userData.password.length < 6) {
      errors.password = 'La contraseña debe tener al menos 6 caracteres';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])|(?=.*\d)/.test(userData.password)) {
      errors.password = 'La contraseña debe contener al menos una mayúscula y un número, o una minúscula y un número';
    }

    // Confirm password validation
    if (!confirmPassword) {
      errors.confirmPassword = 'Confirma tu contraseña';
    } else if (userData.password !== confirmPassword) {
      errors.confirmPassword = 'Las contraseñas no coinciden';
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
      await register(userData);
      // El hook useAuth manejará la redirección automáticamente
    } catch (err) {
      // El error ya está manejado en el store
      console.error('Error during registration:', err);
    }
  };

  const handleInputChange = (field: keyof RegisterData | 'confirmPassword') => (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    if (field === 'confirmPassword') {
      setConfirmPassword(e.target.value);
    } else {
      setUserData(prev => ({
        ...prev,
        [field]: e.target.value
      }));
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
      <Card className="w-full max-w-lg p-8 shadow-lg">
        <div className="space-y-6">
          {/* Header */}
          <div className="text-center space-y-2">
            <div className="mx-auto w-16 h-16 bg-gov-primary/10 rounded-full flex items-center justify-center">
              <UserPlus className="w-8 h-8 text-gov-primary" />
            </div>
            <h1 className="text-2xl font-bold text-foreground">
              Crear Cuenta
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
            {/* Name Fields */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="first_name">Nombre</Label>
                <Input
                  id="first_name"
                  type="text"
                  placeholder="Tu nombre"
                  value={userData.first_name}
                  onChange={handleInputChange('first_name')}
                  className={validationErrors.first_name ? 'border-destructive' : ''}
                  disabled={isLoading}
                  autoComplete="given-name"
                />
                {validationErrors.first_name && (
                  <p className="text-sm text-destructive">{validationErrors.first_name}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">Apellido</Label>
                <Input
                  id="last_name"
                  type="text"
                  placeholder="Tu apellido"
                  value={userData.last_name}
                  onChange={handleInputChange('last_name')}
                  className={validationErrors.last_name ? 'border-destructive' : ''}
                  disabled={isLoading}
                  autoComplete="family-name"
                />
                {validationErrors.last_name && (
                  <p className="text-sm text-destructive">{validationErrors.last_name}</p>
                )}
              </div>
            </div>

            {/* Username Field */}
            <div className="space-y-2">
              <Label htmlFor="username">Usuario</Label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="username"
                  type="text"
                  placeholder="Elige un nombre de usuario"
                  value={userData.username}
                  onChange={handleInputChange('username')}
                  className={`pl-10 ${validationErrors.username ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                  autoComplete="username"
                />
              </div>
              {validationErrors.username && (
                <p className="text-sm text-destructive">{validationErrors.username}</p>
              )}
            </div>

            {/* Email Field */}
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="email"
                  type="email"
                  placeholder="tu.email@ejemplo.com"
                  value={userData.email}
                  onChange={handleInputChange('email')}
                  className={`pl-10 ${validationErrors.email ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                  autoComplete="email"
                />
              </div>
              {validationErrors.email && (
                <p className="text-sm text-destructive">{validationErrors.email}</p>
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
                  placeholder="Crea una contraseña segura"
                  value={userData.password}
                  onChange={handleInputChange('password')}
                  className={`pl-10 pr-10 ${validationErrors.password ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                  autoComplete="new-password"
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

            {/* Confirm Password Field */}
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirmar Contraseña</Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder="Confirma tu contraseña"
                  value={confirmPassword}
                  onChange={handleInputChange('confirmPassword')}
                  className={`pl-10 pr-10 ${validationErrors.confirmPassword ? 'border-destructive' : ''}`}
                  disabled={isLoading}
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  disabled={isLoading}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {validationErrors.confirmPassword && (
                <p className="text-sm text-destructive">{validationErrors.confirmPassword}</p>
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
                  Creando cuenta...
                </>
              ) : (
                <>
                  <UserPlus className="w-4 h-4 mr-2" />
                  Crear Cuenta
                </>
              )}
            </Button>
          </form>

          {/* Footer */}
          <div className="text-center space-y-2 text-sm">
            <p className="text-muted-foreground">
              ¿Ya tienes una cuenta?{' '}
              <Link
                to="/login"
                className="text-gov-primary hover:underline font-medium"
              >
                Inicia sesión aquí
              </Link>
            </p>

            <div className="mt-4 p-3 bg-muted/50 rounded-lg text-xs text-muted-foreground">
              <p>
                Al registrarte, se te asignará el rol de <strong>Observador</strong> por defecto.
                Un administrador puede cambiar tu rol posteriormente.
              </p>
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}