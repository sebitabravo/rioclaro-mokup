import { Server, TestTube } from 'lucide-react';
import { Badge } from './badge';

export function ConnectionStatus() {
  const isApiMode = import.meta.env.VITE_USE_API === 'true';
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  const getConnectionStatus = () => {
    if (isApiMode) {
      return {
        text: 'API Real',
        subtitle: apiUrl,
        variant: 'default' as const,
        icon: Server,
        color: 'bg-green-500',
        animation: 'animate-pulse'
      };
    }

    return {
      text: 'Modo Demo',
      subtitle: 'Datos simulados',
      variant: 'secondary' as const,
      icon: TestTube,
      color: 'bg-yellow-500',
      animation: ''
    };
  };

  const status = getConnectionStatus();
  const Icon = status.icon;

  return (
    <div className="flex items-center gap-2">
      <div className={`w-2 h-2 rounded-full ${status.color} ${status.animation}`} />
      <Badge variant={status.variant} className="flex items-center gap-1 text-xs">
        <Icon className="h-3 w-3" />
        <span>{status.text}</span>
      </Badge>
      {status.subtitle && (
        <span className="text-xs text-muted-foreground hidden sm:inline">
          {status.subtitle}
        </span>
      )}
    </div>
  );
}

// Hook para obtener información de conexión
export function useConnectionStatus() {
  const isApiMode = import.meta.env.VITE_USE_API === 'true';
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  return {
    isApiMode,
    isDemoMode: !isApiMode,
    apiUrl,
    connectionType: isApiMode ? 'api' : 'demo',
    displayText: isApiMode ? 'API Real' : 'Modo Demo'
  };
}