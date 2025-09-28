// Formulario para crear y editar usuarios
import React, { useState } from 'react';
import { useUserStore } from '@features/admin/stores/UserStore';
import { User, CreateUserData, UpdateUserData } from '@domain/entities/User';

// UI Components
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';
import { DialogFooter } from '@shared/components/ui/dialog';

interface UserFormProps {
  user?: User;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  username: string;
  email: string;
  password: string;
  first_name: string;
  last_name: string;
  role: 'Administrador' | 'Técnico' | 'Observador';
  is_staff: boolean;
  is_superuser: boolean;
}

interface FormErrors {
  username?: string;
  email?: string;
  password?: string;
  first_name?: string;
  last_name?: string;
}

export const UserForm: React.FC<UserFormProps> = ({ user, onSuccess, onCancel }) => {
  const { createUser, updateUser, loading } = useUserStore();

  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    username: user?.username || '',
    email: user?.email || '',
    password: '',
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    role: user?.role || 'Observador',
    is_staff: user?.is_staff || true,
    is_superuser: user?.is_superuser || false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!user;

  // Validaciones
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Username
    if (!formData.username.trim()) {
      newErrors.username = 'El nombre de usuario es requerido';
    } else if (formData.username.length < 3) {
      newErrors.username = 'El nombre de usuario debe tener al menos 3 caracteres';
    }

    // Email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email.trim()) {
      newErrors.email = 'El email es requerido';
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'El formato del email no es válido';
    }

    // Password (solo para crear nuevos usuarios)
    if (!isEditing) {
      if (!formData.password) {
        newErrors.password = 'La contraseña es requerida';
      } else if (formData.password.length < 6) {
        newErrors.password = 'La contraseña debe tener al menos 6 caracteres';
      }
    }

    // Nombres
    if (!formData.first_name.trim()) {
      newErrors.first_name = 'El nombre es requerido';
    }

    if (!formData.last_name.trim()) {
      newErrors.last_name = 'El apellido es requerido';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejador de cambios en el formulario
  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }));

    // Limpiar error del campo si existe
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  // Manejador de envío del formulario
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && user) {
        // Actualizar usuario existente
        const updateData: UpdateUserData = {
          username: formData.username,
          email: formData.email,
          first_name: formData.first_name,
          last_name: formData.last_name,
          is_staff: formData.is_staff,
          is_superuser: formData.is_superuser,
        };
        await updateUser(user.id, updateData);
      } else {
        // Crear nuevo usuario
        const createData: CreateUserData = {
          username: formData.username,
          email: formData.email,
          password: formData.password,
          first_name: formData.first_name,
          last_name: formData.last_name,
          is_staff: formData.is_staff,
          is_superuser: formData.is_superuser,
        };
        await createUser(createData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error al guardar usuario:', error);
      // El error se maneja en el store y se muestra en UserManagement
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Username */}
      <div className="space-y-2">
        <Label htmlFor="username">Nombre de Usuario *</Label>
        <Input
          id="username"
          type="text"
          value={formData.username}
          onChange={(e) => handleInputChange('username', e.target.value)}
          className={errors.username ? 'border-red-500' : ''}
          placeholder="Ingrese el nombre de usuario"
        />
        {errors.username && (
          <p className="text-sm text-red-500">{errors.username}</p>
        )}
      </div>

      {/* Email */}
      <div className="space-y-2">
        <Label htmlFor="email">Email *</Label>
        <Input
          id="email"
          type="email"
          value={formData.email}
          onChange={(e) => handleInputChange('email', e.target.value)}
          className={errors.email ? 'border-red-500' : ''}
          placeholder="Ingrese el email"
        />
        {errors.email && (
          <p className="text-sm text-red-500">{errors.email}</p>
        )}
      </div>

      {/* Password (solo para nuevo usuario) */}
      {!isEditing && (
        <div className="space-y-2">
          <Label htmlFor="password">Contraseña *</Label>
          <Input
            id="password"
            type="password"
            value={formData.password}
            onChange={(e) => handleInputChange('password', e.target.value)}
            className={errors.password ? 'border-red-500' : ''}
            placeholder="Ingrese la contraseña"
          />
          {errors.password && (
            <p className="text-sm text-red-500">{errors.password}</p>
          )}
        </div>
      )}

      {/* Nombres */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="first_name">Nombre *</Label>
          <Input
            id="first_name"
            type="text"
            value={formData.first_name}
            onChange={(e) => handleInputChange('first_name', e.target.value)}
            className={errors.first_name ? 'border-red-500' : ''}
            placeholder="Nombre"
          />
          {errors.first_name && (
            <p className="text-sm text-red-500">{errors.first_name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="last_name">Apellido *</Label>
          <Input
            id="last_name"
            type="text"
            value={formData.last_name}
            onChange={(e) => handleInputChange('last_name', e.target.value)}
            className={errors.last_name ? 'border-red-500' : ''}
            placeholder="Apellido"
          />
          {errors.last_name && (
            <p className="text-sm text-red-500">{errors.last_name}</p>
          )}
        </div>
      </div>

      {/* Rol */}
      <div className="space-y-2">
        <Label htmlFor="role">Rol del Usuario</Label>
        <Select
          value={formData.role}
          onValueChange={(value) => handleInputChange('role', value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Seleccione un rol" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="Observador">Observador</SelectItem>
            <SelectItem value="Técnico">Técnico</SelectItem>
            <SelectItem value="Administrador">Administrador</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Configuraciones de acceso */}
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            id="is_staff"
            type="checkbox"
            checked={formData.is_staff}
            onChange={(e) => handleInputChange('is_staff', e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="is_staff" className="text-sm">
            Usuario activo (puede acceder al sistema)
          </Label>
        </div>

        <div className="flex items-center space-x-2">
          <input
            id="is_superuser"
            type="checkbox"
            checked={formData.is_superuser}
            onChange={(e) => handleInputChange('is_superuser', e.target.checked)}
            className="rounded border-gray-300"
          />
          <Label htmlFor="is_superuser" className="text-sm">
            Superusuario (acceso completo)
          </Label>
        </div>
      </div>

      {/* Botones de acción */}
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button
          type="submit"
          disabled={isSubmitting || loading}
          className="flex items-center gap-2"
        >
          {isSubmitting || loading ? (
            <>
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              {isEditing ? 'Actualizando...' : 'Creando...'}
            </>
          ) : (
            isEditing ? 'Actualizar Usuario' : 'Crear Usuario'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};