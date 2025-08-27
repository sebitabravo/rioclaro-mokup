import { useEffect, useState } from 'react';
import { Navbar } from '@presentation/components/layout/Navbar';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle
} from '@presentation/components/ui/card';
import { Button } from '@presentation/components/ui/button';
import {
	RefreshCw,
	Activity,
	MapPin,
	AlertTriangle,
	Droplets
} from 'lucide-react';
import { useStationStore } from '@presentation/stores/StationStore';
import { useMeasurementStore } from '@presentation/stores/MeasurementStore';
import { formatDateTime, formatWaterLevel } from '@shared/utils/formatters';
import { MetricsDashboard } from '@presentation/components/charts/MetricsDashboard';

// Función para generar datos mock de métricas
function generateMockMetricData() {
	const now = new Date();
	const data = [];
	
	// Generar datos para las últimas 24 horas
	for (let i = 23; i >= 0; i--) {
		const timestamp = new Date(now.getTime() - i * 60 * 60 * 1000);
		
		// Simular diferentes patrones para cada métrica
		const hour = 23 - i;
		const baseTime = hour / 24;
		
		// Nivel del agua (patrón de marea + variaciones)
		const waterLevel = 2.1 + Math.sin(baseTime * Math.PI * 2) * 0.4 + Math.random() * 0.15;
		
		// Flujo (relacionado con nivel pero con más variabilidad)
		const flow = waterLevel * 1.5 + Math.sin(baseTime * Math.PI * 4) * 0.3 + Math.random() * 0.2;
		
		// Caudal (más estable, relacionado con flujo)
		const flowRate = (flow * 1000) + Math.sin(baseTime * Math.PI * 3) * 50 + Math.random() * 30;
		
		// Velocidad (variable, depende del nivel)
		const velocity = Math.max(0.1, waterLevel * 0.8 + Math.sin(baseTime * Math.PI * 6) * 0.2 + Math.random() * 0.15);
		
		data.push({
			timestamp: timestamp.toISOString(),
			value: waterLevel,
			station_name: 'Río Claro Sur',
			station_id: 1,
			metric_type: 'nivel',
			// Almacenar todos los valores para diferentes métricas
			water_level: waterLevel,
			flow: flow,
			flow_rate: flowRate,
			velocity: velocity
		});
	}
	
	return data;
}

export function DashboardPage() {
	const [refreshing, setRefreshing] = useState(false);
	const [currentTime, setCurrentTime] = useState<Date | null>(null);
	const [mounted, setMounted] = useState(false);

	const { stations, fetchStations } = useStationStore();
	const { measurements, fetchLatestMeasurements } = useMeasurementStore();

	// Generar datos mock para diferentes métricas si no hay datos reales
	const mockMetricData = measurements.length > 0 ? measurements : generateMockMetricData();

	const stats = {
		total_stations: stations.length,
		active_stations: stations.filter((s) => s.status === 'active').length,
		average_level:
			stations.length > 0
				? stations.reduce((sum, s) => sum + s.current_level, 0) /
				  stations.length
				: 0,
		critical_stations: stations.filter((s) => s.current_level > s.threshold)
			.length
	};

	const handleRefresh = async () => {
		setRefreshing(true);
		await Promise.all([fetchStations(), fetchLatestMeasurements()]);
		setCurrentTime(new Date());
		setRefreshing(false);
	};

	useEffect(() => {
		setMounted(true);
		setCurrentTime(new Date());

		// Cargar datos iniciales
		fetchStations();
		fetchLatestMeasurements();

		// Update time every minute
		const interval = setInterval(() => {
			setCurrentTime(new Date());
		}, 60000);

		return () => clearInterval(interval);
	}, [fetchStations, fetchLatestMeasurements]);

	return (
		<div className='min-h-screen bg-gov-neutral'>
			<Navbar />

			<main className='container mx-auto px-4 py-2'>
				{/* Header compacto optimizado para 1080p */}
				<div className='flex flex-col md:flex-row md:items-center justify-between mb-3 space-y-2 md:space-y-0'>
					<div>
						<h1 className='text-2xl font-bold mb-1 text-gov-black'>
							Dashboard
						</h1>
						<p className='text-sm text-gov-gray-a'>
							Monitoreo en tiempo real del Río Claro
						</p>
						<p className='text-xs text-gov-gray-b'>
							Última actualización:{' '}
							{mounted && currentTime
								? formatDateTime(currentTime.toISOString())
								: 'Cargando...'}
						</p>
					</div>

					<Button
						onClick={handleRefresh}
						disabled={refreshing}
						variant='outline'
						size='sm'
						className='bg-transparent border-gov-primary text-gov-primary hover:bg-gov-primary hover:text-white w-full md:w-auto'
					>
						<RefreshCw
							className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`}
						/>
						Actualizar
					</Button>
				</div>

				<div className='space-y-3'>
					{/* Stats Cards - Compactas para 1080p */}
					<div className='grid grid-cols-4 gap-3'>
						<Card className='bg-gov-white border-gov-accent'>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1'>
								<CardTitle className='text-sm font-medium text-gov-gray-a'>
									Estaciones
								</CardTitle>
								<MapPin className='h-4 w-4 text-gov-primary' />
							</CardHeader>
							<CardContent className='pt-1'>
								<div className='text-xl font-bold text-gov-black'>
									{stats.total_stations}
								</div>
								<p className='text-xs text-gov-gray-b'>
									{stats.active_stations} activas
								</p>
							</CardContent>
						</Card>

						<Card className='bg-gov-white border-gov-accent'>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1'>
								<CardTitle className='text-sm font-medium text-gov-gray-a'>
									Nivel Promedio
								</CardTitle>
								<Droplets className='h-4 w-4 text-gov-green' />
							</CardHeader>
							<CardContent className='pt-1'>
								<div className='text-xl font-bold text-gov-green'>
									{formatWaterLevel(stats.average_level)}
								</div>
								<p className='text-xs text-gov-gray-b'>En rango normal</p>
							</CardContent>
						</Card>

						<Card className='bg-gov-white border-gov-accent'>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1 pt-1'>
								<CardTitle className='text-xs md:text-sm font-medium text-gov-gray-a'>
									Alertas
								</CardTitle>
								<AlertTriangle className='h-4 w-4 text-gov-secondary' />
							</CardHeader>
							<CardContent className='pb-1'>
								<div className='text-xl md:text-2xl font-bold text-gov-secondary'>
									{stats.critical_stations}
								</div>
								<p className='text-xs text-gov-gray-b'>
									{stats.critical_stations} crítica
								</p>
							</CardContent>
						</Card>

						<Card className='bg-gov-white border-gov-accent'>
							<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1 pt-1'>
								<CardTitle className='text-xs md:text-sm font-medium text-gov-gray-a'>
									Sistema
								</CardTitle>
								<Activity className='h-4 w-4 text-gov-green' />
							</CardHeader>
							<CardContent className='pb-1'>
								<div className='text-lg md:text-2xl font-bold text-gov-green'>
									OK
								</div>
								<p className='text-xs text-gov-gray-b'>Operativo</p>
							</CardContent>
						</Card>
					</div>

					{/* Dashboard de Métricas Especializadas */}
					<MetricsDashboard 
						measurementData={mockMetricData}
					/>
				</div>
			</main>
		</div>
	);
}
