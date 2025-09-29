import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip,
	ResponsiveContainer
} from '@shared/lib/recharts';
import {
	DataNormalizationService,
	ChartDataSet,
	DataSourceType
} from '@shared/services/DataNormalizationService';

interface NormalizedChartProps {
	rawData: Record<string, unknown>[];
	sourceType: DataSourceType;
	height?: number;
	className?: string;
}

export function NormalizedChart({
	rawData,
	sourceType,
	height = 300,
	className = ''
}: NormalizedChartProps) {
	const normalizedDataSet: ChartDataSet = DataNormalizationService.normalize(
		rawData,
		sourceType
	);
	// const chartConfig = DataNormalizationService.getChartConfig(normalizedDataSet); // Commented out as currently unused

	// If no data, render placeholder message so the card doesn't look empty
	if (!normalizedDataSet.data || normalizedDataSet.data.length === 0) {
		return (
			<div
				className={`flex items-center justify-center bg-gov-white rounded-lg border border-gov-accent shadow-sm ${className}`}
				style={{ height }}
				data-testid='normalized-chart'
			>
				<div className="flex flex-col items-center space-y-3">
					<div className="w-12 h-12 rounded-full bg-gov-accent flex items-center justify-center">
						<svg className="w-6 h-6 text-gov-gray-a" fill="none" stroke="currentColor" viewBox="0 0 24 24">
							<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
						</svg>
					</div>
					<p className="text-sm text-gov-gray-a text-center max-w-xs">
						No hay datos disponibles para mostrar
					</p>
				</div>
			</div>
		);
	}

	// Ensure data items have string timestamps and numeric values
	const safeData = normalizedDataSet.data.map((d) => ({
		...d,
		timestamp: String(d.timestamp),
		value: Number.isFinite(Number(d.value)) ? Number(d.value) : 0
	}));


	return (
		<div
			className={`bg-gov-white rounded-lg border border-gov-accent shadow-sm ${className}`}
			data-testid='normalized-chart'
		>
			<div className="w-full p-4" style={{ height: 300 }}>
				<ResponsiveContainer width="100%" height="100%">
					<LineChart
						data={safeData}
						margin={{ top: 20, right: 30, left: 20, bottom: 20 }}
					>
						<CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
						<XAxis
							dataKey="timestamp"
							stroke="#6b7280"
							fontSize={12}
						/>
						<YAxis
							stroke="#6b7280"
							fontSize={12}
						/>
						<Tooltip
							contentStyle={{
								backgroundColor: 'white',
								border: '1px solid #e2e8f0',
								borderRadius: '8px'
							}}
						/>
						<Line
							type="monotone"
							dataKey="value"
							stroke="#2563eb"
							strokeWidth={2}
							dot={{ fill: '#2563eb', strokeWidth: 2, r: 4 }}
						/>
					</LineChart>
				</ResponsiveContainer>
			</div>

			{/* Metadata info */}
			<div className='px-4 pb-3 text-xs text-gov-gray-b flex justify-between border-t border-gov-accent bg-gov-neutral/30'>
				<span>Fuente: {normalizedDataSet.metadata.source}</span>
				<span>
					Rango: {normalizedDataSet.metadata.range?.min.toFixed(2)} -{' '}
					{normalizedDataSet.metadata.range?.max.toFixed(2)}{' '}
					{normalizedDataSet.metadata.unit}
				</span>
			</div>
		</div>
	);
}