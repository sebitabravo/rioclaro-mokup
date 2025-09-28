import { RefreshCw, Pause, Play, Clock, Wifi, WifiOff } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { AnimatedButton } from '@shared/components/ui/animated-button';
import { Button } from '@shared/components/ui/button';
import { Badge } from '@shared/components/ui/badge';
import { ConnectionStatus } from '@shared/components/ui/connection-status';

interface DashboardHeaderProps {
  refreshing: boolean;
  autoRefreshEnabled: boolean;
  lastUpdated: Date | null;
  onRefresh: () => void;
  onToggleAutoRefresh: () => void;
}

export function DashboardHeader({
  refreshing,
  autoRefreshEnabled,
  lastUpdated,
  onRefresh,
  onToggleAutoRefresh
}: DashboardHeaderProps) {

  const getTimeSinceLastUpdate = () => {
    if (!lastUpdated) return 'nunca';

    try {
      return formatDistanceToNow(lastUpdated, {
        locale: es,
        addSuffix: true
      });
    } catch (error) {
      // Fallback en caso de error con date-fns
      const now = new Date();
      const diffMs = now.getTime() - lastUpdated.getTime();
      const diffSecs = Math.floor(diffMs / 1000);

      if (diffSecs < 60) return `hace ${diffSecs}s`;
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `hace ${diffMins}m`;
      const diffHours = Math.floor(diffMins / 60);
      return `hace ${diffHours}h`;
    }
  };

  // Determinar el estado visual del auto-refresh
  const getAutoRefreshStatus = () => {
    if (!autoRefreshEnabled) {
      return {
        color: 'bg-gray-400',
        animation: '',
        text: 'Auto-refresh desactivado',
        variant: 'secondary' as const
      };
    }

    if (refreshing) {
      return {
        color: 'bg-blue-500',
        animation: 'animate-pulse',
        text: 'Actualizando datos...',
        variant: 'default' as const
      };
    }

    return {
      color: 'bg-green-500',
      animation: 'animate-pulse',
      text: 'Auto-refresh activo',
      variant: 'default' as const
    };
  };

  const autoRefreshStatus = getAutoRefreshStatus();
  return (
    <div className='flex flex-col md:flex-row md:items-center justify-between mb-8 space-y-4 md:space-y-0'>
      <div className='flex items-center space-x-3'>
        <div>
          <h1 className='text-2xl font-bold mb-2 text-gov-black'>
            Dashboard
          </h1>
          <p className='text-sm text-gov-gray-a mb-1'>
            Monitoreo en tiempo real del Río Claro
          </p>
          <div className='flex items-center space-x-4 text-xs text-gov-gray-b'>
            <div className='flex items-center space-x-1'>
              <Clock className='h-3 w-3' />
              <span>
                Última actualización: {getTimeSinceLastUpdate()}
              </span>
            </div>

            <div className='flex items-center space-x-2'>
              <div className={`w-2 h-2 rounded-full ${autoRefreshStatus.color} ${autoRefreshStatus.animation}`} />
              <Badge
                variant={autoRefreshStatus.variant}
                className='text-xs flex items-center space-x-1'
              >
                {autoRefreshEnabled ? (
                  <Wifi className='h-3 w-3' />
                ) : (
                  <WifiOff className='h-3 w-3' />
                )}
                <span>{autoRefreshStatus.text}</span>
              </Badge>
            </div>

            <ConnectionStatus />
          </div>
        </div>
      </div>

      <div className='flex items-center space-x-2'>
        <Button
          onClick={onToggleAutoRefresh}
          variant='outline'
          size='sm'
          className='flex items-center space-x-2'
        >
          {autoRefreshEnabled ? (
            <Pause className='h-4 w-4' />
          ) : (
            <Play className='h-4 w-4' />
          )}
          <span className='hidden sm:inline'>
            {autoRefreshEnabled ? 'Pausar' : 'Activar'} Auto-refresh
          </span>
        </Button>

        <AnimatedButton
          onClick={onRefresh}
          isLoading={refreshing}
          animation='glow'
          variant='outline'
          size='sm'
          className='bg-transparent border-gov-primary text-gov-primary hover:bg-gov-primary hover:text-white'
        >
          <RefreshCw
            className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
          />
          {refreshing ? 'Actualizando...' : 'Actualizar'}
        </AnimatedButton>
      </div>
    </div>
  );
}