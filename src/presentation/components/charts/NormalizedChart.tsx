import {
	LineChart,
	Line,
	XAxis,
	YAxis,
	CartesianGrid,
	Tooltip
} from 'recharts';
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
	const chartConfig =
		DataNormalizationService.getChartConfig(normalizedDataSet);

	// Defensive: if no data, render placeholder message so the card doesn't look empty
	if (!normalizedDataSet.data || normalizedDataSet.data.length === 0) {
		return (
			<div
				className={className}
				style={{ height }}
				data-testid='normalized-chart'
			>
				<div className='flex items-center justify-center h-full text-gov-gray-a'>
					No hay datos disponibles para mostrar
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
			className={className}
			style={{ height }}
			data-testid='normalized-chart'
		>
			<div style={{ width: '100%', height: '100%' }}>
				<LineChart
					width={900}
					height={280}
					data={safeData}
					margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
				>
					<CartesianGrid
						strokeDasharray='3 3'
						stroke='var(--gov-accent)'
					/>
					<XAxis
						dataKey={chartConfig.xAxisKey}
						stroke='var(--gov-gray-b)'
						fontSize={12}
						tickFormatter={chartConfig.formatTimestamp}
					/>
					<YAxis
						stroke='var(--gov-gray-b)'
						fontSize={12}
						tickFormatter={(value) => chartConfig.formatValue(value)}
					/>
					<Tooltip
						labelFormatter={(value) =>
							`Hora: ${chartConfig.formatTimestamp(value as string)}`
						}
						formatter={(value: number) => [
							chartConfig.formatValue(value),
							normalizedDataSet.metadata.type.charAt(0).toUpperCase() +
								normalizedDataSet.metadata.type.slice(1)
						]}
						contentStyle={{
							backgroundColor: 'var(--gov-white)',
							border: '1px solid var(--gov-accent)',
							borderRadius: '8px'
						}}
					/>
					<Line
						type='monotone'
						dataKey={chartConfig.yAxisKey}
						stroke={chartConfig.color}
						strokeWidth={chartConfig.strokeWidth || 2}
						dot={{
							fill: chartConfig.color,
							strokeWidth: 2,
							r: chartConfig.dotRadius || 4
						}}
					/>
				</LineChart>
			</div>

			{/* Metadata info */}
			<div className='mt-2 text-xs text-gov-gray-b flex justify-between'>
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
