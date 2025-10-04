import React, { useState, useEffect } from 'react';
import {
  AlertTriangle,
  Phone,
  ExternalLink,
  X,
  Zap,
  Bell,
  Info,
  AlertCircle
} from 'lucide-react';
import { Button } from './button';
import { Card } from './card';
import { notificationService, NotificationLevel } from '@shared/services/NotificationService';

export interface AlertData {
  id: string;
  level: NotificationLevel;
  title: string;
  message: string;
  timestamp?: Date;
  stationCount?: number;
  actions?: Array<{
    label: string;
    onClick: () => void;
    variant?: 'default' | 'outline' | 'destructive';
    icon?: React.ReactNode;
  }>;
  persistent?: boolean;
  playSound?: boolean;
}

interface EnhancedAlertProps {
  alert: AlertData;
  onDismiss?: (alertId: string) => void;
  showNotification?: boolean;
  className?: string;
}

export function EnhancedAlert({
  alert,
  onDismiss,
  showNotification = true,
  className = ""
}: EnhancedAlertProps) {
  const [isDismissed, setIsDismissed] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  // Configuración por nivel de alerta
  const alertConfig = {
    info: {
      bgColor: 'bg-blue-50 dark:bg-blue-950',
      borderColor: 'border-blue-200 dark:border-blue-800',
      leftBorder: 'border-l-blue-600',
      textColor: 'text-blue-800 dark:text-blue-200',
      iconColor: 'text-blue-600 dark:text-blue-400',
      icon: Info,
      animation: 'animate-slide-in-right'
    },
    warning: {
      bgColor: 'bg-yellow-50 dark:bg-yellow-950',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      leftBorder: 'border-l-yellow-600',
      textColor: 'text-yellow-800 dark:text-yellow-200',
      iconColor: 'text-yellow-600 dark:text-yellow-400',
      icon: AlertTriangle,
      animation: 'animate-bounce-gentle'
    },
    critical: {
      bgColor: 'bg-red-50 dark:bg-red-950',
      borderColor: 'border-red-200 dark:border-red-800',
      leftBorder: 'border-l-red-600',
      textColor: 'text-red-800 dark:text-red-200',
      iconColor: 'text-red-600 dark:text-red-400',
      icon: AlertCircle,
      animation: 'animate-pulse-strong'
    },
    emergency: {
      bgColor: 'bg-red-100 dark:bg-red-900',
      borderColor: 'border-red-300 dark:border-red-700',
      leftBorder: 'border-l-red-800',
      textColor: 'text-red-900 dark:text-red-100',
      iconColor: 'text-red-800 dark:text-red-300',
      icon: Zap,
      animation: 'animate-emergency-flash'
    }
  };

  const config = alertConfig[alert.level];
  const IconComponent = config.icon;

  // Mostrar alerta con animación
  useEffect(() => {
    setIsVisible(true);

    // Mostrar notificación push si está habilitado
    if (showNotification && alert.level !== 'info') {
      const soundType = alert.level === 'emergency' ? 'emergency' :
                       alert.level === 'critical' ? 'critical' : 'warning';

      notificationService.showNotification({
        title: alert.title,
        body: alert.message,
        level: alert.level,
        playSound: alert.playSound ?? true,
        soundType,
        persistent: alert.persistent
      });
    }
  }, [alert, showNotification]);

  const handleDismiss = () => {
    setIsDismissed(true);
    onDismiss?.(alert.id);
  };

  if (isDismissed) {
    return null;
  }

  return (
    <div className={`transition-all duration-500 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
      <Card
        className={`
          ${config.bgColor} ${config.borderColor} border-l-4 ${config.leftBorder}
          ${config.animation} relative overflow-hidden ${className}
        `}
        role="alert"
        aria-live={alert.level === 'emergency' || alert.level === 'critical' ? 'assertive' : 'polite'}
        aria-labelledby={`alert-title-${alert.id}`}
        aria-describedby={`alert-description-${alert.id}`}
      >
        {/* Efecto de brillo para emergencias */}
        {alert.level === 'emergency' && (
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-red-200/30 to-transparent animate-shimmer" />
        )}

        <div className="p-4 relative z-10">
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              {/* Icono con animación especial para emergencias */}
              <div className={`flex-shrink-0 ${alert.level === 'emergency' ? 'animate-emergency-bounce' : ''}`}>
                <IconComponent
                  className={`h-6 w-6 ${config.iconColor}`}
                  aria-hidden="true"
                />
              </div>

              <div className="flex-1">
                {/* Título */}
                <h3
                  id={`alert-title-${alert.id}`}
                  className={`text-lg font-semibold ${config.textColor} flex items-center space-x-2`}
                >
                  <span>{alert.title}</span>
                  {alert.level === 'emergency' && (
                    <Bell className="h-4 w-4 animate-ring" />
                  )}
                </h3>

                {/* Mensaje */}
                <p
                  id={`alert-description-${alert.id}`}
                  className={`${config.textColor} mt-1 opacity-90`}
                >
                  {alert.message}
                  {alert.stationCount && (
                    <span className="font-medium">
                      {' '}({alert.stationCount} {alert.stationCount === 1 ? 'estación' : 'estaciones'})
                    </span>
                  )}
                </p>

                {/* Timestamp */}
                {alert.timestamp && (
                  <p className={`text-sm ${config.textColor} opacity-70 mt-1`}>
                    {alert.timestamp.toLocaleTimeString('es-CL')}
                  </p>
                )}

                {/* Acciones personalizadas */}
                {alert.actions && alert.actions.length > 0 && (
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    {alert.actions.map((action, index) => (
                      <Button
                        key={index}
                        onClick={action.onClick}
                        variant={action.variant || 'default'}
                        size="sm"
                        className={
                          action.variant === 'default'
                            ? `bg-${alert.level === 'emergency' ? 'red-800' : alert.level === 'critical' ? 'red-600' : 'blue-600'}
                               hover:bg-${alert.level === 'emergency' ? 'red-900' : alert.level === 'critical' ? 'red-700' : 'blue-700'}
                               text-white`
                            : ''
                        }
                      >
                        {action.icon && <span className="mr-2">{action.icon}</span>}
                        {action.label}
                      </Button>
                    ))}
                  </div>
                )}

                {/* Acciones por defecto para críticas y emergencias */}
                {(alert.level === 'critical' || alert.level === 'emergency') && !alert.actions && (
                  <div className="mt-4 flex flex-col sm:flex-row gap-3">
                    <Button
                      variant="default"
                      size="sm"
                      className={`bg-${alert.level === 'emergency' ? 'red-800' : 'red-600'}
                                  hover:bg-${alert.level === 'emergency' ? 'red-900' : 'red-700'}
                                  text-white`}
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Ver Detalles
                    </Button>

                    {alert.level === 'emergency' && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-red-300 text-red-700 hover:bg-red-50"
                        asChild
                      >
                        <a href="tel:+56-9-12345678" aria-label="Llamar a emergencias">
                          <Phone className="h-4 w-4 mr-2" />
                          Emergencias
                        </a>
                      </Button>
                    )}
                  </div>
                )}

                {/* Protocolo de emergencia */}
                {alert.level === 'emergency' && (
                  <div className={`mt-3 p-3 bg-red-200/50 dark:bg-red-900/50 rounded text-sm ${config.textColor} border border-red-300/50`}>
                    <strong>🚨 Protocolo de Emergencia:</strong> Contactar inmediatamente al equipo técnico,
                    verificar estado de evacuación y seguir procedimientos de seguridad establecidos.
                  </div>
                )}
              </div>
            </div>

            {/* Botón de cerrar */}
            {!alert.persistent && (
              <Button
                onClick={handleDismiss}
                variant="ghost"
                size="sm"
                className={`${config.iconColor} hover:bg-${alert.level === 'emergency' ? 'red' : alert.level === 'critical' ? 'red' : 'gray'}-100 flex-shrink-0`}
                aria-label="Cerrar alerta"
              >
                <X className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </Card>

      {/* CSS personalizado para animaciones */}
      <style>{`
        @keyframes slide-in-right {
          from {
            transform: translateX(100%);
            opacity: 0;
          }
          to {
            transform: translateX(0);
            opacity: 1;
          }
        }

        @keyframes bounce-gentle {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0);
          }
          40% {
            transform: translateY(-5px);
          }
          60% {
            transform: translateY(-3px);
          }
        }

        @keyframes pulse-strong {
          0%, 100% {
            opacity: 1;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.02);
          }
        }

        @keyframes emergency-flash {
          0%, 50%, 100% {
            background-color: rgb(254 242 242);
          }
          25%, 75% {
            background-color: rgb(254 226 226);
          }
        }

        @keyframes emergency-bounce {
          0%, 20%, 50%, 80%, 100% {
            transform: translateY(0) rotate(0deg);
          }
          40% {
            transform: translateY(-8px) rotate(-5deg);
          }
          60% {
            transform: translateY(-4px) rotate(5deg);
          }
        }

        @keyframes ring {
          0%, 100% {
            transform: rotate(0deg);
          }
          10%, 30%, 50%, 70%, 90% {
            transform: rotate(-10deg);
          }
          20%, 40%, 60%, 80% {
            transform: rotate(10deg);
          }
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-slide-in-right {
          animation: slide-in-right 0.5s ease-out;
        }

        .animate-bounce-gentle {
          animation: bounce-gentle 2s infinite;
        }

        .animate-pulse-strong {
          animation: pulse-strong 1.5s infinite;
        }

        .animate-emergency-flash {
          animation: emergency-flash 1s infinite;
        }

        .animate-emergency-bounce {
          animation: emergency-bounce 1s infinite;
        }

        .animate-ring {
          animation: ring 2s infinite;
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }
      `}</style>
    </div>
  );
}