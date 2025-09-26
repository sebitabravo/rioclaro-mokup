import React from 'react';
import { Activity, CheckCircle, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@shared/utils/cn';

interface LoadingStateProps {
  message?: string;
  className?: string;
}

interface StatusMessageProps {
  type: 'success' | 'warning' | 'error' | 'info';
  message: string;
  className?: string;
}

interface EmptyStateProps {
  icon?: React.ComponentType<{ className?: string }>;
  title: string;
  description?: string;
  className?: string;
}

/**
 * Componente de estado de carga estandarizado
 */
export const LoadingState: React.FC<LoadingStateProps> = ({ 
  message = 'Cargando...', 
  className = '' 
}) => (
  <div className={cn('text-center py-8', className)}>
    <Activity className="h-8 w-8 mx-auto text-gov-primary mb-4 animate-spin" />
    <p className="text-gov-gray-a">{message}</p>
  </div>
);

/**
 * Componente de mensaje de estado estandarizado
 */
export const StatusMessage: React.FC<StatusMessageProps> = ({ 
  type, 
  message, 
  className = '' 
}) => {
  const config = {
    success: {
      icon: CheckCircle,
      textColor: 'text-gov-green',
      bgColor: 'bg-gov-green/10',
      borderColor: 'border-gov-green'
    },
    warning: {
      icon: AlertTriangle,
      textColor: 'text-gov-orange',
      bgColor: 'bg-yellow-50',
      borderColor: 'border-gov-orange'
    },
    error: {
      icon: AlertTriangle,
      textColor: 'text-gov-secondary',
      bgColor: 'bg-gov-secondary/10',
      borderColor: 'border-gov-secondary'
    },
    info: {
      icon: Info,
      textColor: 'text-gov-primary',
      bgColor: 'bg-gov-primary/10',
      borderColor: 'border-gov-primary'
    }
  };

  const IconComponent = config[type].icon;

  return (
    <div className={cn(
      'flex items-center p-4 rounded-lg border',
      config[type].bgColor,
      config[type].borderColor,
      className
    )}>
      <IconComponent className={cn('h-5 w-5 mr-3', config[type].textColor)} />
      <p className={cn('text-sm font-medium', config[type].textColor)}>
        {message}
      </p>
    </div>
  );
};

/**
 * Componente de estado vacío estandarizado
 */
export const EmptyState: React.FC<EmptyStateProps> = ({ 
  icon: Icon = CheckCircle, 
  title, 
  description, 
  className = '' 
}) => (
  <div className={cn('text-center py-8', className)}>
    <Icon className="h-12 w-12 mx-auto text-gov-gray-b mb-4" />
    <h3 className="text-lg font-semibold text-gov-black mb-2">{title}</h3>
    {description && (
      <p className="text-gov-gray-a max-w-md mx-auto">{description}</p>
    )}
  </div>
);

// Hooks are exported from './status-hooks' if needed separately
// For better React refresh, avoid default exports with mixed types
