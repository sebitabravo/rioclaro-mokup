import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent
} from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Label } from '@shared/components/ui/label';
import { Switch } from '@shared/components/ui/switch';
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem
} from '@shared/components/ui/select';
import { Alert, AlertDescription } from '@shared/components/ui/alert';
import { AlertTriangle, CheckCircle2, Database, RefreshCw } from 'lucide-react';
import {
  useSystemSettingsStore,
  SystemSettings,
  DEFAULT_SETTINGS
} from '@features/admin/stores/SystemSettingsStore';

const REFRESH_OPTIONS = [
  { label: 'Cada 1 minuto', value: 1 },
  { label: 'Cada 5 minutos', value: 5 },
  { label: 'Cada 15 minutos', value: 15 },
  { label: 'Cada 30 minutos', value: 30 }
];

const formatDateTime = (isoDate: string | null) => {
  if (!isoDate) return 'Nunca';
  try {
    return new Intl.DateTimeFormat('es-CL', {
      dateStyle: 'medium',
      timeStyle: 'short'
    }).format(new Date(isoDate));
  } catch {
    return 'Fecha inválida';
  }
};

const deepEqual = (a: SystemSettings, b: SystemSettings) => {
  return JSON.stringify(a) === JSON.stringify(b);
};

export const SystemConfiguration: React.FC = () => {
  const settings = useSystemSettingsStore((state) => state.settings);
  const loading = useSystemSettingsStore((state) => state.loading);
  const saving = useSystemSettingsStore((state) => state.saving);
  const backupLoading = useSystemSettingsStore((state) => state.backupLoading);
  const error = useSystemSettingsStore((state) => state.error);
  const success = useSystemSettingsStore((state) => state.success);
  const fetchSettings = useSystemSettingsStore((state) => state.fetchSettings);
  const updateSettings = useSystemSettingsStore((state) => state.updateSettings);
  const triggerBackup = useSystemSettingsStore((state) => state.triggerBackup);
  const clearStatus = useSystemSettingsStore((state) => state.clearStatus);
  const resetToDefaults = useSystemSettingsStore((state) => state.resetToDefaults);

  const [localSettings, setLocalSettings] = useState<SystemSettings>({ ...DEFAULT_SETTINGS });
  const hasFetchedRef = useRef(false);

  useEffect(() => {
    if (hasFetchedRef.current) {
      return;
    }

    hasFetchedRef.current = true;
    void fetchSettings();
  }, [fetchSettings]);

  useEffect(() => {
    setLocalSettings(prev => (deepEqual(prev, settings) ? prev : { ...settings }));
  }, [settings]);

  const hasChanges = useMemo(() => !deepEqual(localSettings, settings), [localSettings, settings]);

  const handleSwitchChange = useCallback(
    (field: keyof SystemSettings) => (checked: boolean) => {
      clearStatus();
      setLocalSettings((prev) => ({
        ...prev,
        [field]: checked
      }));
    },
    [clearStatus]
  );

  const handleTextChange = useCallback(
    (field: keyof SystemSettings) => (event: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      clearStatus();
      setLocalSettings((prev) => ({
        ...prev,
        [field]: event.target.value
      }));
    },
    [clearStatus]
  );

  const handleNumberChange = useCallback(
    (field: keyof SystemSettings) => (event: React.ChangeEvent<HTMLInputElement>) => {
      clearStatus();
      const value = Number(event.target.value);
      setLocalSettings((prev) => ({
        ...prev,
        [field]: Number.isFinite(value) ? Math.max(value, 0) : prev[field]
      }));
    },
    [clearStatus]
  );

  const handleRefreshChange = useCallback(
    (value: string) => {
      clearStatus();
      setLocalSettings((prev) => ({
        ...prev,
        autoRefreshInterval: Number(value)
      }));
    },
    [clearStatus]
  );

  const handleSave = async () => {
    await updateSettings(localSettings);
  };

  const handleReset = async () => {
    await resetToDefaults();
  };

  const handleTriggerBackup = async () => {
    await triggerBackup();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">
          Configuración del Sistema
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Ajusta los parámetros globales que afectan a toda la plataforma RíoClaro.
        </p>
      </div>

      {(error || success) && (
        <Alert variant={error ? 'destructive' : 'default'} className="border-l-4 border-l-blue-500 dark:border-l-blue-400">
          {error ? (
            <AlertTriangle className="h-4 w-4" />
          ) : (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          )}
          <AlertDescription className="ml-6">
            {error || success}
          </AlertDescription>
        </Alert>
      )}

      {loading ? (
        <Card className="p-6">
          <div className="space-y-4 animate-pulse">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
              <div className="h-40 bg-gray-200 dark:bg-gray-700 rounded" />
            </div>
          </div>
        </Card>
      ) : (
        <>
          <Card>
            <CardHeader>
              <CardTitle>Operación general</CardTitle>
              <CardDescription>
                Controla el estado global del sistema y los intervalos de actualización automáticos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-start justify-between gap-4 border rounded-lg p-4">
                <div>
                  <Label className="flex items-center gap-2 text-base">
                    Modo mantenimiento
                  </Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Desactiva temporalmente el acceso para usuarios finales mientras aplicas cambios importantes.
                  </p>
                </div>
                <Switch
                  checked={localSettings.maintenanceMode}
                  onCheckedChange={handleSwitchChange('maintenanceMode')}
                  aria-label="Alternar modo mantenimiento"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="maintenance-message">Mensaje de mantenimiento</Label>
                <textarea
                  id="maintenance-message"
                  value={localSettings.maintenanceMessage}
                  onChange={handleTextChange('maintenanceMessage')}
                  disabled={!localSettings.maintenanceMode}
                  rows={3}
                  className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 disabled:opacity-60"
                  placeholder="Ej: Estamos realizando tareas de mantenimiento programadas. Volveremos en breve."
                />
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Este mensaje se mostrará a los usuarios cuando el modo mantenimiento esté activo.
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Intervalo de actualización automática</Label>
                  <Select value={String(localSettings.autoRefreshInterval)} onValueChange={handleRefreshChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona intervalo" />
                    </SelectTrigger>
                    <SelectContent>
                      {REFRESH_OPTIONS.map((option) => (
                        <SelectItem key={option.value} value={String(option.value)}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Determina cada cuánto tiempo se refrescan los paneles con datos en vivo.
                  </p>
                </div>

                <div className="flex items-start justify-between gap-4 border rounded-lg p-4">
                  <div>
                    <Label className="text-base">Notificaciones para todos</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Habilita o bloquea el envio de notificaciones dentro de la plataforma.
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.allowNotifications}
                    onCheckedChange={handleSwitchChange('allowNotifications')}
                    aria-label="Alternar notificaciones"
                  />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Alertas y notificaciones</CardTitle>
              <CardDescription>
                Ajusta las políticas de respuesta frente a eventos críticos o alarmas.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-start justify-between gap-4 border rounded-lg p-4">
                <div>
                  <Label className="text-base">Escalamiento automático</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Eleva alertas críticas al siguiente nivel cuando persisten durante varios ciclos de lectura.
                  </p>
                </div>
                <Switch
                  checked={localSettings.alertEscalationEnabled}
                  onCheckedChange={handleSwitchChange('alertEscalationEnabled')}
                  aria-label="Alternar escalamiento de alertas"
                />
              </div>

              <div className="flex items-start justify-between gap-4 border rounded-lg p-4">
                <div>
                  <Label className="text-base">Reconocimiento automático</Label>
                  <p className="text-sm text-gray-500 dark:text-gray-400">
                    Marca como atendidas las alertas menores cuando se normalizan los valores.
                  </p>
                </div>
                <Switch
                  checked={localSettings.alertAutoAcknowledge}
                  onCheckedChange={handleSwitchChange('alertAutoAcknowledge')}
                  aria-label="Alternar reconocimiento automático"
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Datos y respaldos</CardTitle>
              <CardDescription>
                Define la política de retención y programa respaldos preventivos.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label htmlFor="data-retention">Días de retención de datos</Label>
                  <Input
                    id="data-retention"
                    type="number"
                    min={30}
                    value={localSettings.dataRetentionDays}
                    onChange={handleNumberChange('dataRetentionDays')}
                  />
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    El sistema eliminará automáticamente registros históricos anteriores a este período.
                  </p>
                </div>

                <div className="flex items-start justify-between gap-4 border rounded-lg p-4">
                  <div>
                    <Label className="text-base">Respaldos automáticos</Label>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Genera copias de seguridad cada noche para prevenir pérdida de información.
                    </p>
                  </div>
                  <Switch
                    checked={localSettings.autoBackupEnabled}
                    onCheckedChange={handleSwitchChange('autoBackupEnabled')}
                    aria-label="Alternar respaldos automáticos"
                  />
                </div>
              </div>

              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 border rounded-lg p-4">
                <div className="flex items-start gap-3">
                  <div className="rounded-full bg-blue-100 dark:bg-blue-900 p-2 text-blue-600 dark:text-blue-300">
                    <Database className="h-5 w-5" />
                  </div>
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">Último respaldo</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDateTime(settings.lastBackupAt)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={handleTriggerBackup}
                  disabled={backupLoading}
                  className="flex items-center gap-2"
                >
                  <RefreshCw className={`h-4 w-4 ${backupLoading ? 'animate-spin' : ''}`} />
                  Iniciar respaldo manual
                </Button>
              </div>
            </CardContent>
          </Card>

          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="text-sm text-gray-500 dark:text-gray-400">
              Última actualización: <span className="font-medium text-gray-900 dark:text-gray-200">{formatDateTime(settings.updatedAt)}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="outline"
                onClick={handleReset}
                disabled={saving || loading}
              >
                Restablecer valores por defecto
              </Button>
              <Button
                onClick={handleSave}
                disabled={!hasChanges || saving}
                className="flex items-center gap-2"
              >
                {saving && <span className="h-3 w-3 animate-ping rounded-full bg-white" />}
                Guardar cambios
              </Button>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default SystemConfiguration;
