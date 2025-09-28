// Formulario para crear y editar estaciones
import React, { useState } from 'react';
import { useStationStore } from '@features/admin/stores/StationStore';
import { Station, CreateStationData, UpdateStationData } from '@domain/entities/Station';

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

interface StationFormProps {
  station?: Station;
  onSuccess: () => void;
  onCancel: () => void;
}

interface FormData {
  name: string;
  location: string;
  code: string;
  status: 'active' | 'maintenance' | 'inactive';
  latitude: string;
  longitude: string;
  current_level: string;
  threshold: string;
}

interface FormErrors {
  name?: string;
  location?: string;
  code?: string;
  latitude?: string;
  longitude?: string;
  current_level?: string;
  threshold?: string;
}

export const StationForm: React.FC<StationFormProps> = ({ station, onSuccess, onCancel }) => {
  const { createStation, updateStation, loading } = useStationStore();

  // Estado del formulario
  const [formData, setFormData] = useState<FormData>({
    name: station?.name || '',
    location: station?.location || '',
    code: station?.code || '',
    status: station?.status || 'active',
    latitude: station?.latitude?.toString() || '',
    longitude: station?.longitude?.toString() || '',
    current_level: station?.current_level?.toString() || '0',
    threshold: station?.threshold?.toString() || '10',
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const isEditing = !!station;

  // Validaciones
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // Nombre
    if (!formData.name.trim()) {
      newErrors.name = 'El nombre es requerido';
    } else if (formData.name.length < 3) {
      newErrors.name = 'El nombre debe tener al menos 3 caracteres';
    }

    // Ubicación
    if (!formData.location.trim()) {
      newErrors.location = 'La ubicación es requerida';
    }

    // Código
    if (!formData.code.trim()) {
      newErrors.code = 'El código es requerido';
    } else if (!/^[A-Z0-9-]+$/.test(formData.code)) {
      newErrors.code = 'El código solo puede contener letras mayúsculas, números y guiones';
    }

    // Latitud
    const lat = parseFloat(formData.latitude);
    if (!formData.latitude || isNaN(lat)) {
      newErrors.latitude = 'La latitud es requerida y debe ser un número válido';
    } else if (lat < -90 || lat > 90) {
      newErrors.latitude = 'La latitud debe estar entre -90 y 90 grados';
    }

    // Longitud
    const lng = parseFloat(formData.longitude);
    if (!formData.longitude || isNaN(lng)) {
      newErrors.longitude = 'La longitud es requerida y debe ser un número válido';
    } else if (lng < -180 || lng > 180) {
      newErrors.longitude = 'La longitud debe estar entre -180 y 180 grados';
    }

    // Nivel actual (solo para crear)
    if (!isEditing) {
      const level = parseFloat(formData.current_level);
      if (isNaN(level) || level < 0) {
        newErrors.current_level = 'El nivel actual debe ser un número positivo';
      }
    }

    // Umbral
    const threshold = parseFloat(formData.threshold);
    if (!formData.threshold || isNaN(threshold)) {
      newErrors.threshold = 'El umbral es requerido y debe ser un número válido';
    } else if (threshold <= 0) {
      newErrors.threshold = 'El umbral debe ser mayor a 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Manejador de cambios en el formulario
  const handleInputChange = (field: keyof FormData, value: string) => {
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
      if (isEditing && station) {
        // Actualizar estación existente
        const updateData: UpdateStationData = {
          name: formData.name,
          location: formData.location,
          code: formData.code,
          status: formData.status,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          threshold: parseFloat(formData.threshold),
        };
        await updateStation(station.id, updateData);
      } else {
        // Crear nueva estación
        const createData: CreateStationData = {
          name: formData.name,
          location: formData.location,
          code: formData.code,
          status: formData.status,
          latitude: parseFloat(formData.latitude),
          longitude: parseFloat(formData.longitude),
          current_level: parseFloat(formData.current_level),
          threshold: parseFloat(formData.threshold),
          last_measurement: new Date().toISOString(),
        };
        await createStation(createData);
      }

      onSuccess();
    } catch (error) {
      console.error('Error al guardar estación:', error);
      // El error se maneja en el store y se muestra en StationManagement
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Información básica */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nombre de la Estación *</Label>
          <Input
            id="name"
            type="text"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            className={errors.name ? 'border-red-500' : ''}
            placeholder="Ej: Estación Centro"
          />
          {errors.name && (
            <p className="text-sm text-red-500">{errors.name}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="code">Código de la Estación *</Label>
          <Input
            id="code"
            type="text"
            value={formData.code}
            onChange={(e) => handleInputChange('code', e.target.value.toUpperCase())}
            className={errors.code ? 'border-red-500' : ''}
            placeholder="Ej: EST-001"
          />
          {errors.code && (
            <p className="text-sm text-red-500">{errors.code}</p>
          )}
        </div>
      </div>

      {/* Ubicación */}
      <div className="space-y-2">
        <Label htmlFor="location">Ubicación *</Label>
        <Input
          id="location"
          type="text"
          value={formData.location}
          onChange={(e) => handleInputChange('location', e.target.value)}
          className={errors.location ? 'border-red-500' : ''}
          placeholder="Ej: Río Claro, Sector Centro"
        />
        {errors.location && (
          <p className="text-sm text-red-500">{errors.location}</p>
        )}
      </div>

      {/* Coordenadas */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="latitude">Latitud *</Label>
          <Input
            id="latitude"
            type="number"
            step="any"
            value={formData.latitude}
            onChange={(e) => handleInputChange('latitude', e.target.value)}
            className={errors.latitude ? 'border-red-500' : ''}
            placeholder="Ej: -33.4569"
          />
          {errors.latitude && (
            <p className="text-sm text-red-500">{errors.latitude}</p>
          )}
        </div>

        <div className="space-y-2">
          <Label htmlFor="longitude">Longitud *</Label>
          <Input
            id="longitude"
            type="number"
            step="any"
            value={formData.longitude}
            onChange={(e) => handleInputChange('longitude', e.target.value)}
            className={errors.longitude ? 'border-red-500' : ''}
            placeholder="Ej: -70.6483"
          />
          {errors.longitude && (
            <p className="text-sm text-red-500">{errors.longitude}</p>
          )}
        </div>
      </div>

      {/* Estado y configuración */}
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Estado de la Estación</Label>
          <Select
            value={formData.status}
            onValueChange={(value) => handleInputChange('status', value)}
          >
            <SelectTrigger>
              <SelectValue placeholder="Seleccione el estado" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Activa</SelectItem>
              <SelectItem value="maintenance">En Mantenimiento</SelectItem>
              <SelectItem value="inactive">Inactiva</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="threshold">Umbral de Alerta (metros) *</Label>
          <Input
            id="threshold"
            type="number"
            step="0.1"
            min="0"
            value={formData.threshold}
            onChange={(e) => handleInputChange('threshold', e.target.value)}
            className={errors.threshold ? 'border-red-500' : ''}
            placeholder="Ej: 10.0"
          />
          {errors.threshold && (
            <p className="text-sm text-red-500">{errors.threshold}</p>
          )}
        </div>
      </div>

      {/* Nivel actual (solo para crear) */}
      {!isEditing && (
        <div className="space-y-2">
          <Label htmlFor="current_level">Nivel Inicial (metros)</Label>
          <Input
            id="current_level"
            type="number"
            step="0.01"
            min="0"
            value={formData.current_level}
            onChange={(e) => handleInputChange('current_level', e.target.value)}
            className={errors.current_level ? 'border-red-500' : ''}
            placeholder="Ej: 0.0"
          />
          {errors.current_level && (
            <p className="text-sm text-red-500">{errors.current_level}</p>
          )}
        </div>
      )}

      {/* Nota para edición */}
      {isEditing && (
        <div className="bg-blue-50 border border-blue-200 rounded-md p-4 dark:bg-blue-900/20 dark:border-blue-900">
          <p className="text-sm text-blue-700 dark:text-blue-200">
            <strong>Nota:</strong> El nivel actual de la estación se actualiza automáticamente
            con las mediciones del sistema. Solo puede modificar la configuración básica.
          </p>
        </div>
      )}

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
            isEditing ? 'Actualizar Estación' : 'Crear Estación'
          )}
        </Button>
      </DialogFooter>
    </form>
  );
};