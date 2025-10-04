import { useState, useEffect, useCallback } from 'react';
import type {
	ActivityStatus,
	ActivityType
} from '@domain/entities/ActivityLog';
import { Navbar } from '@shared/components/layout/Navbar';
import {
	Card,
	CardContent,
	CardHeader,
	CardTitle
} from '@shared/components/ui/card';
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle
} from '@shared/components/ui/dialog';
import {
	DropdownMenu,
	DropdownMenuContent,
	DropdownMenuItem,
	DropdownMenuSeparator,
	DropdownMenuTrigger
} from '@shared/components/ui/dropdown-menu';
import { ActivityExportButton } from '@features/activity/components/ActivityExportButton';
import {
	Activity,
	Search,
	Filter,
	Download,
	User,
	Server,
	AlertTriangle,
	CheckCircle,
	Clock,
	MapPin,
	RefreshCw,
	MoreVertical,
	Eye,
	Settings
} from 'lucide-react';
import { ActivityLog, ActivityLogFilter } from '@domain/entities/ActivityLog';
import { Container } from '@infrastructure/di/Container';
import { formatDateTime } from '@shared/utils/formatters';

// Mapeo de tipos de actividad a íconos y colores gubernamentales
const activityTypeConfig = {
	user_login: {
		icon: User,
		color: 'text-gov-primary',
		bg: 'bg-gov-primary/10',
		label: 'Inicio de sesión'
	},
	user_logout: {
		icon: User,
		color: 'text-gov-gray-a',
		bg: 'bg-gray-50',
		label: 'Cierre de sesión'
	},
	station_created: {
		icon: MapPin,
		color: 'text-gov-green',
		bg: 'bg-gov-green/10',
		label: 'Estación creada'
	},
	station_updated: {
		icon: MapPin,
		color: 'text-gov-orange',
		bg: 'bg-yellow-50',
		label: 'Estación actualizada'
	},
	station_deleted: {
		icon: MapPin,
		color: 'text-gov-secondary',
		bg: 'bg-gov-secondary/10',
		label: 'Estación eliminada'
	},
	measurement_recorded: {
		icon: Activity,
		color: 'text-gov-green',
		bg: 'bg-gov-green/10',
		label: 'Medición registrada'
	},
	alert_triggered: {
		icon: AlertTriangle,
		color: 'text-gov-secondary',
		bg: 'bg-gov-secondary/10',
		label: 'Alerta activada'
	},
	alert_resolved: {
		icon: CheckCircle,
		color: 'text-gov-green',
		bg: 'bg-gov-green/10',
		label: 'Alerta resuelta'
	},
	report_generated: {
		icon: Download,
		color: 'text-gov-primary',
		bg: 'bg-gov-primary/10',
		label: 'Reporte generado'
	},
	report_downloaded: {
		icon: Download,
		color: 'text-gov-purple',
		bg: 'bg-purple-50',
		label: 'Reporte descargado'
	},
	system_maintenance: {
		icon: Server,
		color: 'text-gov-orange',
		bg: 'bg-orange-50',
		label: 'Mantenimiento'
	},
	data_export: {
		icon: Download,
		color: 'text-gov-primary',
		bg: 'bg-indigo-50',
		label: 'Exportación de datos'
	},
	configuration_changed: {
		icon: Settings,
		color: 'text-gov-orange',
		bg: 'bg-yellow-50',
		label: 'Configuración modificada'
	},
	backup_created: {
		icon: Server,
		color: 'text-gov-primary',
		bg: 'bg-gov-primary/10',
		label: 'Respaldo creado'
	},
	threshold_updated: {
		icon: AlertTriangle,
		color: 'text-gov-orange',
		bg: 'bg-orange-50',
		label: 'Umbral actualizado'
	}
} as const;

// Mapeo de estados a colores gubernamentales
const statusConfig = {
	success: { color: 'text-gov-green', bg: 'bg-gov-green/20', label: 'Exitoso' },
	warning: {
		color: 'text-gov-orange',
		bg: 'bg-yellow-100',
		label: 'Advertencia'
	},
	error: {
		color: 'text-gov-secondary',
		bg: 'bg-gov-secondary/20',
		label: 'Error'
	},
	info: {
		color: 'text-gov-primary',
		bg: 'bg-gov-primary/20',
		label: 'Información'
	}
};

export function ActivityReportPage() {
	const [logs, setLogs] = useState<ActivityLog[]>([]);
	const [loading, setLoading] = useState(true);
	const [searchTerm, setSearchTerm] = useState('');
	const [selectedStatus, setSelectedStatus] = useState<string>('');
	const [selectedType, setSelectedType] = useState<string>('');
	const [showFilters, setShowFilters] = useState(false);
	const [stats, setStats] = useState<{
		total: number;
		byType: Record<string, number>;
		byStatus: Record<string, number>;
		recentActivity: ActivityLog[];
	} | null>(null);
	const [selectedLog, setSelectedLog] = useState<ActivityLog | null>(null);
	const [isDetailsOpen, setIsDetailsOpen] = useState(false);
	const [actionFeedback, setActionFeedback] = useState<string | null>(null);
	const [logPendingDeletion, setLogPendingDeletion] =
		useState<ActivityLog | null>(null);
	const [isDeleting, setIsDeleting] = useState(false);

	const loadLogs = useCallback(async () => {
		setLoading(true);
		try {
			const filter: ActivityLogFilter = {};

			if (searchTerm) filter.search = searchTerm;
			if (selectedStatus) filter.status = [selectedStatus as ActivityStatus];
			if (selectedType) filter.activityTypes = [selectedType as ActivityType];

			const [logsData, statsData] = await Promise.all([
				Container.activityLogRepository.findAll(filter),
				Container.activityLogRepository.getStats(filter)
			]);

			setLogs(logsData);
			setStats(statsData);
		} catch {
			// Error en carga de logs - se podría mostrar una notificación al usuario
		} finally {
			setLoading(false);
		}
	}, [searchTerm, selectedStatus, selectedType]);

	useEffect(() => {
		loadLogs();
	}, [loadLogs]);

	useEffect(() => {
		if (!actionFeedback) return;

		const timeoutId = window.setTimeout(() => {
			setActionFeedback(null);
		}, 3000);

		return () => {
			window.clearTimeout(timeoutId);
		};
	}, [actionFeedback]);

	const handleViewDetails = useCallback((log: ActivityLog) => {
		setSelectedLog(log);
		setIsDetailsOpen(true);
	}, []);

	const handleDeleteRequest = useCallback((log: ActivityLog) => {
		setLogPendingDeletion(log);
	}, []);

	const handleCopy = useCallback(async (value: string, label: string) => {
		try {
			if (typeof navigator !== 'undefined' && navigator.clipboard?.writeText) {
				await navigator.clipboard.writeText(value);
			} else {
				const textarea = document.createElement('textarea');
				textarea.value = value;
				textarea.style.position = 'fixed';
				textarea.style.opacity = '0';
				document.body.appendChild(textarea);
				textarea.focus();
				textarea.select();
				document.execCommand('copy');
				document.body.removeChild(textarea);
			}

			setActionFeedback(`${label} copiado al portapapeles.`);
		} catch (error) {
			console.error('Error copiando texto:', error);
			setActionFeedback('No se pudo copiar el texto.');
		}
	}, []);

	const closeDeleteDialog = useCallback(() => {
		setLogPendingDeletion(null);
	}, []);

	const handleConfirmDelete = useCallback(async () => {
		if (!logPendingDeletion) return;

		setIsDeleting(true);
		try {
			const deleted = await Container.activityLogRepository.deleteById(logPendingDeletion.id);

			if (deleted) {
				setActionFeedback('Actividad eliminada correctamente.');
				await loadLogs();
			} else {
				setActionFeedback('No se pudo eliminar la actividad seleccionada.');
			}
		} catch (error) {
			console.error('Error eliminando actividad:', error);
			setActionFeedback('Ocurrió un error al eliminar la actividad.');
		} finally {
			setIsDeleting(false);
			closeDeleteDialog();
		}
	}, [logPendingDeletion, closeDeleteDialog, loadLogs]);

	const ActivityIcon = ({
		type
	}: {
		type: keyof typeof activityTypeConfig;
	}) => {
		const config = activityTypeConfig[type];
		const IconComponent = config?.icon || Activity;
		return (
			<IconComponent
				className={`h-4 w-4 ${config?.color || 'text-gray-600'}`}
			/>
		);
	};

	const getRelativeTime = (timestamp: string) => {
		const now = new Date();
		const time = new Date(timestamp);
		const diffMs = now.getTime() - time.getTime();
		const diffMins = Math.floor(diffMs / (1000 * 60));
		const diffHours = Math.floor(diffMins / 60);
		const diffDays = Math.floor(diffHours / 24);

		if (diffMins < 1) return 'Hace un momento';
		if (diffMins < 60) return `Hace ${diffMins} min`;
		if (diffHours < 24) return `Hace ${diffHours}h`;
		if (diffDays < 7) return `Hace ${diffDays}d`;
		return formatDateTime(timestamp);
	};

	return (
		<div className='min-h-screen bg-gov-neutral'>
			<Navbar />

			<main className='container mx-auto px-4 py-6'>
				{/* Header */}
				<div className='flex flex-col md:flex-row md:items-center justify-between mb-6'>
					<div>
						<h1 className='text-2xl font-bold text-gov-black mb-2'>
							Historial del Sistema
						</h1>
						<p className='text-gov-gray-a'>
							Registro cronológico de todas las actividades y eventos del
							sistema
						</p>
					</div>

					<div className='flex items-center space-x-2 mt-4 md:mt-0'>
						<Button
							onClick={loadLogs}
							disabled={loading}
							variant='outline'
							size='sm'
							className='bg-transparent border-gov-primary text-gov-primary hover:bg-gov-primary hover:text-white'
						>
							<RefreshCw
								className={`h-4 w-4 mr-2 ${loading ? 'animate-spin' : ''}`}
							/>
							Actualizar
						</Button>

						<Button
							onClick={() => setShowFilters(!showFilters)}
							variant='outline'
							size='sm'
							className='bg-transparent border-gov-accent text-gov-gray-a hover:bg-gov-accent hover:text-gov-black'
						>
							<Filter className='h-4 w-4 mr-2' />
							Filtros
						</Button>

						<ActivityExportButton
							data={logs}
							disabled={loading || logs.length === 0}
							size='sm'
							className='bg-transparent border-gov-accent text-gov-gray-a hover:bg-gov-accent hover:text-gov-black'
						/>
					</div>
				</div>

				{actionFeedback && (
					<div className='mb-6 rounded-md border border-gov-green bg-gov-green/10 px-3 py-2 text-sm text-gov-green'>
						{actionFeedback}
					</div>
				)}

				{/* Stats Cards */}
				{stats && (
					<div className='grid grid-cols-2 md:grid-cols-4 gap-4 mb-6'>
						<Card className='bg-gov-white border-gov-accent'>
							<CardHeader className='pb-2'>
								<CardTitle className='text-sm font-medium text-gov-gray-a'>
									Total Actividades
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold text-gov-black'>
									{stats.total}
								</div>
								<p className='text-xs text-gov-gray-b'>Últimas 24 horas</p>
							</CardContent>
						</Card>

						<Card className='bg-gov-white border-gov-accent'>
							<CardHeader className='pb-2'>
								<CardTitle className='text-sm font-medium text-gov-gray-a'>
									Exitosas
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold text-gov-green'>
									{stats.byStatus.success || 0}
								</div>
								<p className='text-xs text-gov-gray-b'>Sin errores</p>
							</CardContent>
						</Card>

						<Card className='bg-gov-white border-gov-accent'>
							<CardHeader className='pb-2'>
								<CardTitle className='text-sm font-medium text-gov-gray-a'>
									Advertencias
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold text-yellow-600'>
									{stats.byStatus.warning || 0}
								</div>
								<p className='text-xs text-gov-gray-b'>Requieren atención</p>
							</CardContent>
						</Card>

						<Card className='bg-gov-white border-gov-accent'>
							<CardHeader className='pb-2'>
								<CardTitle className='text-sm font-medium text-gov-gray-a'>
									Errores
								</CardTitle>
							</CardHeader>
							<CardContent>
								<div className='text-2xl font-bold text-gov-secondary'>
									{stats.byStatus.error || 0}
								</div>
								<p className='text-xs text-gov-gray-b'>Fallos del sistema</p>
							</CardContent>
						</Card>
					</div>
				)}

				{/* Filters */}
				{showFilters && (
					<Card className='bg-gov-white border-gov-accent mb-6'>
						<CardHeader>
							<CardTitle className='text-base font-medium text-gov-black'>
								Filtros de Búsqueda
							</CardTitle>
						</CardHeader>
						<CardContent>
							<div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
								<div>
									<label className='block text-sm font-medium text-gov-gray-a mb-2'>
										Buscar
									</label>
									<div className='relative'>
										<Search className='absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gov-gray-b' />
										<Input
											placeholder='Buscar actividad, usuario, estación...'
											value={searchTerm}
											onChange={(e) => setSearchTerm(e.target.value)}
											className='pl-9'
										/>
									</div>
								</div>

								<div>
									<label className='block text-sm font-medium text-gov-gray-a mb-2'>
										Estado
									</label>
									<select
										value={selectedStatus}
										onChange={(e) => setSelectedStatus(e.target.value)}
										className='w-full rounded-md border border-gov-accent bg-gov-white px-3 py-2 text-sm'
									>
										<option value=''>Todos los estados</option>
										<option value='success'>Exitoso</option>
										<option value='warning'>Advertencia</option>
										<option value='error'>Error</option>
										<option value='info'>Información</option>
									</select>
								</div>

								<div>
									<label className='block text-sm font-medium text-gov-gray-a mb-2'>
										Tipo de Actividad
									</label>
									<select
										value={selectedType}
										onChange={(e) => setSelectedType(e.target.value)}
										className='w-full rounded-md border border-gov-accent bg-gov-white px-3 py-2 text-sm'
									>
										<option value=''>Todos los tipos</option>
										<option value='user_login'>Inicio de sesión</option>
										<option value='alert_triggered'>Alerta activada</option>
										<option value='report_generated'>Reporte generado</option>
										<option value='station_updated'>
											Estación actualizada
										</option>
										<option value='measurement_recorded'>
											Medición registrada
										</option>
									</select>
								</div>
							</div>
						</CardContent>
					</Card>
				)}

				{/* Activity Log */}
				<Card className='bg-gov-white border-gov-accent'>
					<CardHeader>
						<CardTitle className='flex items-center space-x-2 text-gov-black'>
							<Activity className='h-5 w-5 text-gov-primary' />
							<span>Historial de Actividades</span>
						</CardTitle>
					</CardHeader>
					<CardContent>
						{loading ? (
							<div className='flex items-center justify-center py-12'>
								<div className='text-center'>
									<RefreshCw className='h-8 w-8 mx-auto text-gov-primary mb-4 animate-spin' />
									<p className='text-gov-gray-a'>Cargando actividades...</p>
								</div>
							</div>
						) : logs.length === 0 ? (
							<div className='flex items-center justify-center py-12'>
								<div className='text-center'>
									<Activity className='h-12 w-12 mx-auto text-gov-gray-b mb-4' />
									<h3 className='text-lg font-medium text-gov-gray-a mb-2'>
										No hay actividades
									</h3>
									<p className='text-gov-gray-b'>
										No se encontraron registros con los filtros aplicados
									</p>
								</div>
							</div>
						) : (
							<div className='space-y-4'>
								{logs.map((log) => {
									const config =
										activityTypeConfig[log.activity_type] ||
										activityTypeConfig.measurement_recorded;
									const statusConfig_ = statusConfig[log.status];

									return (
										<div
											key={log.id}
											className='flex items-start space-x-4 p-4 rounded-lg border border-gov-accent hover:bg-gov-neutral transition-colors'
										>
											{/* Icon */}
											<div
												className={`flex-shrink-0 w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}
											>
												<ActivityIcon type={log.activity_type} />
											</div>

											{/* Content */}
											<div className='flex-1 min-w-0'>
												<div className='flex items-start justify-between'>
													<div className='flex-1'>
														<div className='flex items-center space-x-2 mb-1'>
															<h4 className='text-sm font-medium text-gov-black'>
																{log.title}
															</h4>
															<span
																className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${statusConfig_.bg} ${statusConfig_.color}`}
															>
																{statusConfig_.label}
															</span>
														</div>

														<p className='text-sm text-gov-gray-a mb-2'>
															{log.description}
														</p>

														<div className='flex items-center space-x-4 text-xs text-gov-gray-b'>
															{log.user_name && (
																<div className='flex items-center space-x-1'>
																	<User className='h-3 w-3' />
																	<span>{log.user_name}</span>
																</div>
															)}

															{log.station_name && (
																<div className='flex items-center space-x-1'>
																	<MapPin className='h-3 w-3' />
																	<span>{log.station_name}</span>
																</div>
															)}

															<div className='flex items-center space-x-1'>
																<Clock className='h-3 w-3' />
																<span>{getRelativeTime(log.timestamp)}</span>
															</div>
														</div>
													</div>

													<div className='flex items-center space-x-2'>
														<Button
															variant='ghost'
															size='sm'
															className='h-8 w-8 p-0'
															onClick={() => handleViewDetails(log)}
														>
															<Eye className='h-4 w-4' />
														</Button>
														<DropdownMenu>
															<DropdownMenuTrigger asChild>
																<Button
																	variant='ghost'
																	size='sm'
																	className='h-8 w-8 p-0'
																>
																	<MoreVertical className='h-4 w-4' />
																</Button>
															</DropdownMenuTrigger>
															<DropdownMenuContent align='end'>
																<DropdownMenuItem
																	onSelect={() => handleViewDetails(log)}
																>
																	Ver detalles
																</DropdownMenuItem>
																<DropdownMenuItem
																	onSelect={() =>
																		handleCopy(
																			String(log.id),
																			'ID de actividad'
																		)
																	}
																>
																	Copiar ID
																</DropdownMenuItem>
																{log.metadata && (
																	<DropdownMenuItem
																		onSelect={() =>
																			handleCopy(
																				JSON.stringify(log.metadata, null, 2),
																				'Metadatos'
																			)
																		}
																	>
																		Copiar metadatos
																	</DropdownMenuItem>
																)}
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	onSelect={() =>
																		handleCopy(
																			JSON.stringify(log, null, 2),
																			'Registro completo'
																		)
																	}
																>
																	Copiar registro completo
																</DropdownMenuItem>
																<DropdownMenuSeparator />
																<DropdownMenuItem
																	className='text-gov-secondary focus:text-gov-secondary'
																	onSelect={() => handleDeleteRequest(log)}
																>
																	Eliminar actividad
																</DropdownMenuItem>
															</DropdownMenuContent>
														</DropdownMenu>
													</div>
												</div>
											</div>
										</div>
									);
								})}
							</div>
						)}
					</CardContent>
				</Card>

				<Dialog
					open={isDetailsOpen && !!selectedLog}
					onOpenChange={(open) => {
						setIsDetailsOpen(open);
						if (!open) {
							setSelectedLog(null);
						}
					}}
				>
					<DialogContent className='max-h-[80vh] overflow-y-auto'>
						{selectedLog && (
							<>
								<DialogHeader>
									<DialogTitle className='text-gov-black'>
										{selectedLog.title}
									</DialogTitle>
									<DialogDescription>
										Registrado el {formatDateTime(selectedLog.timestamp)} ·
										Estado:{' '}
										<span className='font-medium text-gov-black'>
											{statusConfig[selectedLog.status]?.label ||
												selectedLog.status}
										</span>
									</DialogDescription>
								</DialogHeader>

								<div className='space-y-4 text-sm'>
									<p className='text-gov-gray-a'>{selectedLog.description}</p>

									<div className='grid gap-4 sm:grid-cols-2'>
										<div>
											<span className='text-xs uppercase text-gov-gray-b'>
												Tipo de actividad
											</span>
											<p className='font-medium text-gov-black'>
												{activityTypeConfig[selectedLog.activity_type]?.label ||
													selectedLog.activity_type}
											</p>
										</div>
										<div>
											<span className='text-xs uppercase text-gov-gray-b'>
												ID de actividad
											</span>
											<p className='font-medium text-gov-black'>
												#{selectedLog.id}
											</p>
										</div>
										{selectedLog.user_name && (
											<div>
												<span className='text-xs uppercase text-gov-gray-b'>
													Usuario
												</span>
												<p className='font-medium text-gov-black'>
													{selectedLog.user_name}
												</p>
											</div>
										)}
										{selectedLog.station_name && (
											<div>
												<span className='text-xs uppercase text-gov-gray-b'>
													Estación
												</span>
												<p className='font-medium text-gov-black'>
													{selectedLog.station_name}
												</p>
											</div>
										)}
										{selectedLog.ip_address && (
											<div>
												<span className='text-xs uppercase text-gov-gray-b'>
													IP registrada
												</span>
												<p className='font-medium text-gov-black'>
													{selectedLog.ip_address}
												</p>
											</div>
										)}
										{selectedLog.user_agent && (
											<div className='sm:col-span-2'>
												<span className='text-xs uppercase text-gov-gray-b'>
													Agente de usuario
												</span>
												<p className='font-medium text-gov-black break-words'>
													{selectedLog.user_agent}
												</p>
											</div>
										)}
										<div>
											<span className='text-xs uppercase text-gov-gray-b'>
												Creado en
											</span>
											<p className='font-medium text-gov-black'>
												{formatDateTime(selectedLog.created_at)}
											</p>
										</div>
									</div>

									{selectedLog.metadata && (
										<div className='space-y-2'>
											<span className='text-xs uppercase text-gov-gray-b'>
												Metadatos
											</span>
											<pre className='max-h-48 overflow-y-auto rounded-md bg-gov-neutral p-3 text-xs text-gov-black'>
												{JSON.stringify(selectedLog.metadata, null, 2)}
											</pre>
										</div>
									)}
								</div>

								<DialogFooter className='sm:flex-row sm:items-center sm:justify-between'>
									<Button
										variant='outline'
										onClick={() =>
											handleCopy(
												JSON.stringify(selectedLog, null, 2),
												'Registro completo'
											)
										}
									>
										Copiar registro
									</Button>
									<div className='flex w-full flex-col gap-2 sm:w-auto sm:flex-row'>
										<Button
											onClick={() => {
												setIsDetailsOpen(false);
												setSelectedLog(null);
											}}
										>
											Cerrar
										</Button>
										<Button
											variant='destructive'
											onClick={() => {
												const logForDeletion = selectedLog;
												setIsDetailsOpen(false);
												setSelectedLog(null);
												if (logForDeletion) {
													handleDeleteRequest(logForDeletion);
												}
											}}
										>
											Eliminar
										</Button>
									</div>
								</DialogFooter>
							</>
						)}
					</DialogContent>
				</Dialog>

				<Dialog
					open={!!logPendingDeletion}
					onOpenChange={(open) => {
						if (!open) {
							closeDeleteDialog();
						}
					}}
				>
					<DialogContent>
						{logPendingDeletion && (
							<>
								<DialogHeader>
									<DialogTitle className='text-gov-black'>
										Eliminar actividad
									</DialogTitle>
									<DialogDescription>
										Esta acción eliminará el registro de actividad{' '}
										<span className='font-medium text-gov-black'>
											#{logPendingDeletion.id}
										</span>{' '}
										({logPendingDeletion.title}). Esta operación no se puede
										deshacer.
									</DialogDescription>
								</DialogHeader>

								<div className='space-y-2 text-sm text-gov-gray-a'>
									<p>
										Confirma que deseas remover permanentemente este evento del
										historial.
									</p>
									{logPendingDeletion.timestamp && (
										<p>
											Registrado el{' '}
											{formatDateTime(logPendingDeletion.timestamp)}.
										</p>
									)}
								</div>

								<DialogFooter className='sm:flex-row sm:justify-end'>
									<Button
										variant='outline'
										onClick={closeDeleteDialog}
										disabled={isDeleting}
									>
										Cancelar
									</Button>
									<Button
										variant='destructive'
										onClick={handleConfirmDelete}
										disabled={isDeleting}
									>
										{isDeleting ? 'Eliminando...' : 'Eliminar actividad'}
									</Button>
								</DialogFooter>
							</>
						)}
					</DialogContent>
				</Dialog>
			</main>
		</div>
	);
}
