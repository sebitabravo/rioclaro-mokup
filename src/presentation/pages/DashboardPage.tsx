import { useEffect, useState } from 'react';
import { Navbar } from '@presentation/components/layout/Navbar';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle
} from '@presentation/components/ui/card';
import { AnimatedButton } from '@presentation/components/ui/animated-button';
import { MotionWrapper } from '@shared/components/MotionWrapper';
import {
	WaterRipples,
	GradientOrbs
} from '@presentation/components/ui/background-effects';
import { PageLoader } from '@presentation/components/ui/page-loader';
import {
	RefreshCw,
	Activity,
	MapPin,
	AlertTriangle,
	Droplets,
	Waves,
	BarChart3,
	Gauge,
	TrendingUp,
	TrendingDown
} from 'lucide-react';
import { useStationStore } from '@presentation/stores/StationStore';
import { useMeasurementStore } from '@presentation/stores/MeasurementStore';
import { formatDateTime, formatWaterLevel } from '@shared/utils/formatters';
import { StationsMap } from '@presentation/components/maps/StationsMap';
import { MiniTrendChart } from '@presentation/components/charts/MiniTrendChart';
import type { Station } from '@domain/entities/Station';

interface MockMetricData {
  timestamp: string;
  value: number;
  station_name: string;
  station_id: number;
  metric_type: string;
  water_level: number;
  flow: number;
  flow_rate: number;
  velocity: number;
  nivel: number;
  flujo: number;
  caudal: number;
  velocidad: number;
}

// Función para generar datos mock de métricas
function generateMockMetricData(): MockMetricData[] {
	const now = new Date();
	const data: MockMetricData[] = [];

	// Generar datos para las últimas 24 horas (cada 2 horas para tener más puntos)
	for (let i = 11; i >= 0; i--) {
		const timestamp = new Date(now.getTime() - i * 2 * 60 * 60 * 1000);

		// Simular diferentes patrones para cada métrica con valores más visibles
		const hour = 11 - i;
		const baseTime = hour / 12;

		// Nivel del agua (rango más amplio: 1.5m - 3.5m)
		const waterLevel =
			2.5 + Math.sin(baseTime * Math.PI * 2) * 0.8 + Math.random() * 0.3;

		// Flujo (rango: 8-20 m³/s)
		const flow =
			14 + Math.sin(baseTime * Math.PI * 1.5) * 4 + Math.random() * 2;

		// Caudal (rango: 600-1400 L/s)
		const flowRate =
			1000 + Math.sin(baseTime * Math.PI * 2.5) * 300 + Math.random() * 100;

		// Velocidad (rango: 0.5-2.5 m/s)
		const velocity =
			1.5 + Math.sin(baseTime * Math.PI * 3) * 0.8 + Math.random() * 0.3;

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
			velocity: velocity,
			// Agregar también con nombres en español para compatibilidad
			nivel: waterLevel,
			flujo: flow,
			caudal: flowRate,
			velocidad: velocity
		});
	}

	return data;
}

export function DashboardPage() {
	const [refreshing, setRefreshing] = useState(false);
	const [currentTime, setCurrentTime] = useState<Date | null>(null);
	const [mounted, setMounted] = useState(false);
	const [initialLoading, setInitialLoading] = useState(true);

	const { stations, fetchStations } = useStationStore();
	const { measurements, fetchLatestMeasurements } = useMeasurementStore();

	// Generar datos mock para diferentes métricas si no hay datos reales
	const mockMetricData =
		measurements.length > 0 ? measurements : generateMockMetricData();

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

	// Determine mascot mood based on system status
	// const systemMood = useSystemMood(
	//	stats.critical_stations,
	//	stats.average_level,
	//	2.5, // threshold
	//	stats.active_stations > 0
	// );

	const handleRefresh = async () => {
		setRefreshing(true);
		await Promise.all([fetchStations(), fetchLatestMeasurements()]);
		setCurrentTime(new Date());
		setRefreshing(false);
	};

	useEffect(() => {
		const initializeDashboard = async () => {
			setMounted(true);
			setCurrentTime(new Date());

			// Reducir tiempo de carga simulado para mejor UX
			const loadingPromise = new Promise((resolve) => setTimeout(resolve, 200));

			try {
				// Cargar datos iniciales
				await Promise.all([
					fetchStations(),
					fetchLatestMeasurements(),
					loadingPromise
				]);
			} finally {
				setInitialLoading(false);
			}
		};

		initializeDashboard();

		// Update time every minute
		const interval = setInterval(() => {
			setCurrentTime(new Date());
		}, 60000);

		return () => clearInterval(interval);
	}, [fetchStations, fetchLatestMeasurements]);

	return (
		<>
			<PageLoader
				isLoading={initialLoading}
				title='Río Claro Dashboard'
				subtitle='Cargando datos en tiempo real...'
			/>

			<div className='min-h-screen bg-gov-neutral relative overflow-hidden'>
				{/* Very subtle background animations */}
				<GradientOrbs count={1} />
				<WaterRipples count={2} />

				<Navbar />

				<main className='container mx-auto px-4 py-1 relative z-10'>
					{/* Header compacto optimizado para 1080p */}
					<div className='flex flex-col md:flex-row md:items-center justify-between mb-2 space-y-2 md:space-y-0'>
						<div className='flex items-center space-x-3'>
							<div>
								<h1 className='text-xl font-bold mb-1 text-gov-black'>
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
						</div>

						<AnimatedButton
							onClick={handleRefresh}
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

					<div
						className='space-y-2'
						data-testid='dashboard-content'
					>
						{/* Stats Cards - Más compactas y sin animaciones pesadas */}
						<div className='grid grid-cols-4 gap-2'>
							<Card className='bg-gov-white border-gov-accent h-full'>
								<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1 pt-2'>
									<CardTitle className='text-xs font-medium text-gov-gray-a'>
										Estaciones
									</CardTitle>
									<MapPin className='h-3 w-3 text-gov-primary' />
								</CardHeader>
								<CardContent className='pt-0 pb-2'>
									<div className='text-lg font-bold text-gov-black'>
										{stats.total_stations}
									</div>
									<p className='text-xs text-gov-gray-b'>
										{stats.active_stations} activas
									</p>
								</CardContent>
							</Card>

							<Card className='bg-gov-white border-gov-accent h-full'>
								<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1 pt-2'>
									<CardTitle className='text-xs font-medium text-gov-gray-a'>
										Nivel Promedio
									</CardTitle>
									<Droplets className='h-3 w-3 text-gov-green' />
								</CardHeader>
								<CardContent className='pt-0 pb-2'>
									<div className='text-lg font-bold text-gov-green'>
										{formatWaterLevel(stats.average_level)}
									</div>
									<p className='text-xs text-gov-gray-b'>En rango normal</p>
								</CardContent>
							</Card>

							{stats.critical_stations > 0 ? (
								<Card className='bg-gov-white border-gov-secondary h-full'>
									<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1 pt-2'>
										<CardTitle className='text-xs font-medium text-gov-gray-a'>
											Alertas
										</CardTitle>
										<AlertTriangle className='h-3 w-3 text-gov-secondary' />
									</CardHeader>
									<CardContent className='pt-0 pb-2'>
										<div className='text-lg font-bold text-gov-secondary'>
											{stats.critical_stations}
										</div>
										<p className='text-xs text-gov-secondary font-medium'>
											¡{stats.critical_stations} crítica
											{stats.critical_stations > 1 ? 's' : ''}!
										</p>
									</CardContent>
								</Card>
							) : (
								<Card className='bg-gov-white border-gov-accent h-full'>
									<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1 pt-2'>
										<CardTitle className='text-xs font-medium text-gov-gray-a'>
											Alertas
										</CardTitle>
										<AlertTriangle className='h-3 w-3 text-gov-green' />
									</CardHeader>
									<CardContent className='pt-0 pb-2'>
										<div className='text-lg font-bold text-gov-green'>
											{stats.critical_stations}
										</div>
										<p className='text-xs text-gov-gray-b'>Sin alertas</p>
									</CardContent>
								</Card>
							)}

							<Card className='bg-gov-white border-gov-accent h-full'>
								<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1 pt-2'>
									<CardTitle className='text-xs font-medium text-gov-gray-a'>
										Sistema
									</CardTitle>
									<Activity className='h-3 w-3 text-gov-green' />
								</CardHeader>
								<CardContent className='pt-0 pb-2'>
									<div className='text-lg font-bold text-gov-green'>OK</div>
									<p className='text-xs text-gov-gray-b'>Operativo</p>
								</CardContent>
							</Card>
						</div>

						{/* Métricas con Mini-Gráficos de Tendencia - Más compactas */}
						<MotionWrapper variant='stagger'>
							<div className='grid grid-cols-4 gap-2'>
								{/* Flujo de Agua */}
								<MotionWrapper
									variant='cardEntry'
									delay={400}
								>
									<Card className='bg-gov-white border-gov-accent h-full overflow-hidden'>
										<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1 pt-2'>
											<CardTitle className='text-xs font-medium text-gov-gray-a'>
												Flujo
											</CardTitle>
											<Waves className='h-3 w-3 text-gov-green' />
										</CardHeader>
										<CardContent className='pt-0 pb-2'>
											<div className='text-lg font-bold text-gov-green'>
												{(
													(mockMetricData[mockMetricData.length - 1] as MockMetricData)
														?.flow || 14
												).toFixed(1)}{' '}
												m³/s
											</div>
											<div className='h-6 mt-1 mb-1'>
												<MiniTrendChart
													data={mockMetricData.map((d) => ({
														value: (d as MockMetricData).flow || 14
													}))}
													color='#16a34a'
													height={24}
												/>
											</div>
											<div className='flex items-center space-x-1'>
												<TrendingUp className='h-2 w-2 text-gov-green' />
												<p className='text-xs text-gov-gray-b'>+2.3%</p>
											</div>
										</CardContent>
									</Card>
								</MotionWrapper>

								{/* Nivel del Agua */}
								<MotionWrapper
									variant='cardEntry'
									delay={500}
								>
									<Card className='bg-gov-white border-gov-accent h-full overflow-hidden'>
										<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1 pt-2'>
											<CardTitle className='text-xs font-medium text-gov-gray-a'>
												Nivel
											</CardTitle>
											<BarChart3 className='h-3 w-3 text-gov-primary' />
										</CardHeader>
										<CardContent className='pt-0 pb-2'>
											<div className='text-lg font-bold text-gov-primary'>
												{(
													(mockMetricData[mockMetricData.length - 1] as MockMetricData)
														?.water_level || 2.5
												).toFixed(1)}
												m
											</div>
											<div className='h-6 mt-1 mb-1'>
												<MiniTrendChart
													data={mockMetricData.map((d) => ({
														value: (d as MockMetricData).water_level || 2.5
													}))}
													color='#1e40af'
													height={24}
												/>
											</div>
											<div className='flex items-center space-x-1'>
												<TrendingDown className='h-2 w-2 text-gov-orange' />
												<p className='text-xs text-gov-gray-b'>-0.8%</p>
											</div>
										</CardContent>
									</Card>
								</MotionWrapper>

								{/* Caudal */}
								<MotionWrapper
									variant='cardEntry'
									delay={600}
								>
									<Card className='bg-gov-white border-gov-accent h-full overflow-hidden'>
										<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1 pt-2'>
											<CardTitle className='text-xs font-medium text-gov-gray-a'>
												Caudal
											</CardTitle>
											<Droplets className='h-3 w-3 text-purple-600' />
										</CardHeader>
										<CardContent className='pt-0 pb-2'>
											<div className='text-lg font-bold text-purple-600'>
												{Math.round(
													(mockMetricData[mockMetricData.length - 1] as MockMetricData)
														?.flow_rate || 1000
												)}{' '}
												L/s
											</div>
											<div className='h-6 mt-1 mb-1'>
												<MiniTrendChart
													data={mockMetricData.map((d) => ({
														value: (d as MockMetricData).flow_rate || 1000
													}))}
													color='#7c3aed'
													height={24}
												/>
											</div>
											<div className='flex items-center space-x-1'>
												<TrendingUp className='h-2 w-2 text-gov-green' />
												<p className='text-xs text-gov-gray-b'>+1.5%</p>
											</div>
										</CardContent>
									</Card>
								</MotionWrapper>

								{/* Velocidad */}
								<MotionWrapper
									variant='cardEntry'
									delay={700}
								>
									<Card className='bg-gov-white border-gov-accent h-full overflow-hidden'>
										<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-1 pt-2'>
											<CardTitle className='text-xs font-medium text-gov-gray-a'>
												Velocidad
											</CardTitle>
											<Gauge className='h-3 w-3 text-gov-secondary' />
										</CardHeader>
										<CardContent className='pt-0 pb-2'>
											<div className='text-lg font-bold text-gov-secondary'>
												{(
													(mockMetricData[mockMetricData.length - 1] as MockMetricData)
														?.velocity || 1.5
												).toFixed(1)}{' '}
												m/s
											</div>
											<div className='h-6 mt-1 mb-1'>
												<MiniTrendChart
													data={mockMetricData.map((d) => ({
														value: (d as MockMetricData).velocity || 1.5
													}))}
													color='#f97316'
													height={24}
												/>
											</div>
											<div className='flex items-center space-x-1'>
												<TrendingUp className='h-2 w-2 text-gov-green' />
												<p className='text-xs text-gov-gray-b'>+0.7%</p>
											</div>
										</CardContent>
									</Card>
								</MotionWrapper>
							</div>
						</MotionWrapper>

						{/* Mapa de Estaciones - Mucho más grande como elemento principal */}
						<MotionWrapper
							variant='cardEntry'
							delay={800}
						>
							<Card className='bg-gov-white border-gov-accent mt-2 overflow-hidden'>
								<CardHeader className='pb-2 pt-3'>
									<CardTitle className='flex items-center space-x-2 text-gov-black text-base'>
										<MapPin className='h-4 w-4 text-gov-primary' />
										<span>Estaciones de Monitoreo</span>
									</CardTitle>
								</CardHeader>
								<CardContent className='pt-0'>
									<div className='w-full h-[550px]'>
										<StationsMap
											stations={stations}
											onStationClick={(station: Station) => {
												console.log('Estación seleccionada:', station);
											}}
											height='550px'
										/>
									</div>
								</CardContent>
							</Card>
						</MotionWrapper>
					</div>
				</main>
			</div>
		</>
	);
}
