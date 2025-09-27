import { AlertTriangle, Phone, ExternalLink, X } from 'lucide-react';
import { useState } from 'react';
import { Button } from './button';
import { Card } from './card';

interface EmergencyAlertProps {
  criticalCount: number;
  onViewDetails?: () => void;
  onDismiss?: () => void;
  className?: string;
}

export function EmergencyAlert({
  criticalCount,
  onViewDetails,
  onDismiss,
  className = ""
}: EmergencyAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false);

  if (criticalCount === 0 || isDismissed) {
    return null;
  }

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.();
  };

  return (
    <Card
      className={`bg-red-50 border-red-200 border-l-4 border-l-red-600 ${className}`}
      role="alert"
      aria-live="assertive"
      aria-labelledby="emergency-alert-title"
      aria-describedby="emergency-alert-description"
    >
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <AlertTriangle
                className="h-6 w-6 text-red-600"
                aria-hidden="true"
              />
            </div>
            <div className="flex-1">
              <h3
                id="emergency-alert-title"
                className="text-lg font-semibold text-red-800"
              >
                ¡Alerta Crítica del Sistema!
              </h3>
              <p
                id="emergency-alert-description"
                className="text-red-700 mt-1"
              >
                {criticalCount} {criticalCount === 1 ? 'estación presenta' : 'estaciones presentan'}
                {' '}niveles críticos de agua. Se requiere atención inmediata.
              </p>

              <div className="mt-4 flex flex-col sm:flex-row gap-3">
                <Button
                  onClick={onViewDetails}
                  variant="default"
                  size="sm"
                  className="bg-red-600 hover:bg-red-700 text-white border-red-600"
                >
                  <ExternalLink className="h-4 w-4 mr-2" aria-hidden="true" />
                  Ver Detalles de Alertas
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="border-red-300 text-red-700 hover:bg-red-50"
                  asChild
                >
                  <a href="tel:+56-9-12345678" aria-label="Llamar a emergencias">
                    <Phone className="h-4 w-4 mr-2" aria-hidden="true" />
                    Emergencias: +56-9-12345678
                  </a>
                </Button>
              </div>

              <div className="mt-3 text-sm text-red-600">
                <strong>Protocolo de Emergencia:</strong> Contactar inmediatamente al equipo técnico y verificar evacuación si es necesario.
              </div>
            </div>
          </div>

          <Button
            onClick={handleDismiss}
            variant="ghost"
            size="sm"
            className="text-red-600 hover:bg-red-100 flex-shrink-0"
            aria-label="Cerrar alerta"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </Button>
        </div>
      </div>
    </Card>
  );
}