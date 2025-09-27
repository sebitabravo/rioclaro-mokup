import { RefreshCw } from 'lucide-react';
import { AnimatedButton } from '@shared/components/ui/animated-button';
import { formatDateTime } from '@shared/utils/formatters';

interface DashboardHeaderProps {
  currentTime: Date | null;
  mounted: boolean;
  refreshing: boolean;
  onRefresh: () => void;
}

export function DashboardHeader({
  currentTime,
  mounted,
  refreshing,
  onRefresh
}: DashboardHeaderProps) {
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
          <p className='text-xs text-gov-gray-b'>
            Última actualización:{' '}
            {mounted && currentTime
              ? formatDateTime(currentTime.toISOString())
              : 'Cargando...'}
          </p>
        </div>
      </div>

      <AnimatedButton
        onClick={onRefresh}
        isLoading={refreshing}
        animation='glow'
        variant='outline'
        size='sm'
        className='bg-transparent border-gov-primary text-gov-primary hover:bg-gov-primary hover:text-white w-full md:w-auto'
      >
        <RefreshCw
          className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
        />
        {refreshing ? 'Actualizando...' : 'Actualizar'}
      </AnimatedButton>
    </div>
  );
}