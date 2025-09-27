import { MapPin, Droplets, AlertTriangle, Activity } from 'lucide-react';
import { MetricCard } from './MetricCard';
import { formatWaterLevel } from '@shared/utils/formatters';
import type { DashboardStats } from '../hooks/useDashboardData';

interface MetricsGridProps {
	stats: DashboardStats;
}

export function MetricsGrid({ stats }: MetricsGridProps) {
	const alertVariant = stats.criticalStations > 0 ? 'critical' : 'success';
	const alertSubtitle =
		stats.criticalStations > 0
			? `¡${stats.criticalStations} crítica${
					stats.criticalStations > 1 ? 's' : ''
			  }!`
			: 'Sin alertas';

	return (
		<div
			className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6'
			data-testid='metrics-grid'
		>
			<MetricCard
				title='Estaciones'
				value={stats.totalStations}
				subtitle={`${stats.activeStations} activas`}
				icon={MapPin}
				variant='normal'
			/>

			<MetricCard
				title='Nivel Promedio'
				value={formatWaterLevel(stats.averageLevel)}
				subtitle='En rango normal'
				icon={Droplets}
				variant='success'
			/>

			<MetricCard
				title='Alertas'
				value={stats.criticalStations}
				subtitle={alertSubtitle}
				icon={AlertTriangle}
				variant={alertVariant}
			/>

			<MetricCard
				title='Sistema'
				value='OK'
				subtitle='Operativo'
				icon={Activity}
				variant='success'
			/>
		</div>
	);
}
