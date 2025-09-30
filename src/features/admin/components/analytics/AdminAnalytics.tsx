import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
	Card,
	CardHeader,
	CardTitle,
	CardDescription,
	CardContent
} from '@shared/components/ui/card';
import { Badge } from '@shared/components/ui/badge';
import {
	BarChart3,
	Activity,
	Users,
	MapPin,
	AlertTriangle,
	ArrowUpRight,
	Clock,
	Database
} from 'lucide-react';
import { useUserStore } from '@features/admin/stores/UserStore';
import { useStationStore } from '@features/admin/stores/StationStore';
import { useSystemSettingsStore } from '@features/admin/stores/SystemSettingsStore';
import { MockActivityLogRepository } from '@infrastructure/adapters/MockActivityLogRepository';
import type { ActivityLog } from '@domain/entities/ActivityLog';

interface ActivityStats {
	total: number;
	byType: Record<string, number>;
	byStatus: Record<string, number>;
	recentActivity: ActivityLog[];
}

const ROLE_COLORS: Record<string, string> = {
	Administrador: 'bg-blue-500',
	Técnico: 'bg-emerald-500',
	Observador: 'bg-indigo-500'
};

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
	success: { label: 'Éxito', color: 'text-gov-green' },
	warning: { label: 'Advertencia', color: 'text-gov-orange' },
	error: { label: 'Error', color: 'text-gov-secondary' },
	info: { label: 'Info', color: 'text-gov-primary' }
};

const ROLE_LABELS: Record<string, string> = {
	Administrador: 'Administradores',
	Técnico: 'Técnicos',
	Observador: 'Observadores'
};

const STATION_STATUS_LABELS: Record<string, string> = {
	active: 'Activas',
	maintenance: 'Mantenimiento',
	inactive: 'Inactivas'
};

const STATION_STATUS_COLORS: Record<string, string> = {
	active: 'bg-emerald-500',
	maintenance: 'bg-amber-500',
	inactive: 'bg-rose-500'
};

const formatDateTime = (isoDate: string | null) => {
	if (!isoDate) return 'Nunca';
	try {
		return new Intl.DateTimeFormat('es-CL', {
			dateStyle: 'medium',
			timeStyle: 'short'
		}).format(new Date(isoDate));
	} catch {
		return 'Fecha inválida';
	}
};

export const AdminAnalytics: React.FC = () => {
	const SkeletonBlock = ({ className = '' }: { className?: string }) => (
		<div
			className={`animate-pulse rounded bg-gray-200 dark:bg-gray-700 ${className}`}
		/>
	);

	const users = useUserStore((state) => state.users);
	const usersLoading = useUserStore((state) => state.loading);
	const fetchUsers = useUserStore((state) => state.fetchUsers);

	const stations = useStationStore((state) => state.stations);
	const stationsLoading = useStationStore((state) => state.loading);
	const fetchStations = useStationStore((state) => state.fetchStations);

	const systemSettings = useSystemSettingsStore((state) => state.settings);
	const fetchSystemSettings = useSystemSettingsStore(
		(state) => state.fetchSettings
	);
	const systemSettingsFetchedRef = useRef(false);

	const [activityStats, setActivityStats] = useState<ActivityStats | null>(
		null
	);
	const [activityLoading, setActivityLoading] = useState(true);
	const [activityError, setActivityError] = useState<string | null>(null);

	const activityRepoRef = useRef<MockActivityLogRepository>();

	if (!activityRepoRef.current) {
		activityRepoRef.current = new MockActivityLogRepository();
	}

	useEffect(() => {
		if (!users.length && !usersLoading) {
			void fetchUsers();
		}
	}, [users.length, usersLoading, fetchUsers]);

	useEffect(() => {
		if (!stations.length && !stationsLoading) {
			void fetchStations();
		}
	}, [stations.length, stationsLoading, fetchStations]);

	useEffect(() => {
		if (systemSettingsFetchedRef.current) {
			return;
		}
		systemSettingsFetchedRef.current = true;
		void fetchSystemSettings();
	}, [fetchSystemSettings]);

	useEffect(() => {
		let isMounted = true;

		const loadActivityStats = async () => {
			setActivityLoading(true);
			setActivityError(null);
			try {
				const stats = await activityRepoRef.current!.getStats();
				if (isMounted) {
					setActivityStats(stats);
				}
			} catch (error) {
				if (isMounted) {
					setActivityError(
						error instanceof Error
							? error.message
							: 'No se pudieron cargar las métricas de actividad.'
					);
				}
			} finally {
				if (isMounted) {
					setActivityLoading(false);
				}
			}
		};

		void loadActivityStats();

		return () => {
			isMounted = false;
		};
	}, []);

	const userRoleData = useMemo(() => {
		if (!users.length) return [];

		const counts = users.reduce<Record<string, number>>((acc, user) => {
			acc[user.role] = (acc[user.role] || 0) + 1;
			return acc;
		}, {});

		return Object.entries(counts).map(([role, count]) => ({
			role,
			label: ROLE_LABELS[role] ?? role,
			count
		}));
	}, [users]);

	const stationStatusData = useMemo(() => {
		if (!stations.length) return [];

		const counts = stations.reduce<Record<string, number>>((acc, station) => {
			acc[station.status] = (acc[station.status] || 0) + 1;
			return acc;
		}, {});

		return Object.entries(counts).map(([status, count]) => ({
			status,
			label: STATION_STATUS_LABELS[status] ?? status,
			count
		}));
	}, [stations]);

	const averageStationsPerUser = useMemo(() => {
		if (!users.length) return 0;
		const totalAssigned = users.reduce(
			(total, user) => total + (user.assigned_stations?.length || 0),
			0
		);
		return totalAssigned / users.length;
	}, [users]);

	const criticalStations = useMemo(
		() =>
			stations.filter(
				(station) =>
					station.status === 'maintenance' || station.status === 'inactive'
			),
		[stations]
	);

	const topStationAssignments = useMemo(() => {
		const assignments = users
			.map((user) => ({
				name:
					`${user.first_name ?? ''} ${user.last_name ?? ''}`.trim() ||
					user.username,
				role: user.role,
				count: user.assigned_stations?.length ?? 0
			}))
			.filter((item) => item.count > 0)
			.sort((a, b) => b.count - a.count)
			.slice(0, 5);

		return assignments;
	}, [users]);

	const totalUsers = users.length;
	const totalStations = stations.length;
	const totalAdmins =
		userRoleData.find((item) => item.role === 'Administrador')?.count ?? 0;
	const totalTechnicians =
		userRoleData.find((item) => item.role === 'Técnico')?.count ?? 0;

	return (
		<div className='space-y-6'>
			<div className='flex flex-col gap-2'>
				<h2 className='text-2xl font-bold text-gray-900 dark:text-white flex items-center gap-2'>
					<BarChart3 className='h-6 w-6 text-blue-500' />
					Analíticas Administrativas
				</h2>
				<p className='text-gray-600 dark:text-gray-400'>
					Métricas clave del uso de la plataforma, salud operacional y actividad
					reciente.
				</p>
			</div>

			<div className='grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4'>
				<Card>
					<CardContent className='p-5'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-gray-500 dark:text-gray-400'>
									Usuarios totales
								</p>
								<h3 className='text-2xl font-semibold text-gray-900 dark:text-white mt-1'>
									{usersLoading ? (
										<SkeletonBlock className='h-7 w-16' />
									) : (
										totalUsers
									)}
								</h3>
							</div>
							<div className='h-10 w-10 rounded-full bg-blue-100 dark:bg-blue-900 flex items-center justify-center'>
								<Users className='h-5 w-5 text-blue-600 dark:text-blue-300' />
							</div>
						</div>
						<p className='text-xs text-gray-500 dark:text-gray-400 mt-3'>
							Administradores: {totalAdmins} · Técnicos: {totalTechnicians}
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className='p-5'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-gray-500 dark:text-gray-400'>
									Estaciones monitoreadas
								</p>
								<h3 className='text-2xl font-semibold text-gray-900 dark:text-white mt-1'>
									{stationsLoading ? (
										<SkeletonBlock className='h-7 w-16' />
									) : (
										totalStations
									)}
								</h3>
							</div>
							<div className='h-10 w-10 rounded-full bg-emerald-100 dark:bg-emerald-900 flex items-center justify-center'>
								<MapPin className='h-5 w-5 text-emerald-600 dark:text-emerald-300' />
							</div>
						</div>
						<p className='text-xs text-gray-500 dark:text-gray-400 mt-3'>
							{criticalStations.length} estación(es) requiere(n) atención
							técnica
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className='p-5'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-gray-500 dark:text-gray-400'>
									Promedio asignaciones
								</p>
								<h3 className='text-2xl font-semibold text-gray-900 dark:text-white mt-1'>
									{usersLoading ? (
										<SkeletonBlock className='h-7 w-16' />
									) : (
										averageStationsPerUser.toFixed(1)
									)}
								</h3>
							</div>
							<div className='h-10 w-10 rounded-full bg-purple-100 dark:bg-purple-900 flex items-center justify-center'>
								<ArrowUpRight className='h-5 w-5 text-purple-600 dark:text-purple-300' />
							</div>
						</div>
						<p className='text-xs text-gray-500 dark:text-gray-400 mt-3'>
							Promedio de estaciones asignadas por usuario con rol operativo
						</p>
					</CardContent>
				</Card>

				<Card>
					<CardContent className='p-5'>
						<div className='flex items-center justify-between'>
							<div>
								<p className='text-sm text-gray-500 dark:text-gray-400'>
									Último respaldo
								</p>
								<h3 className='text-base font-semibold text-gray-900 dark:text-white mt-1'>
									{formatDateTime(systemSettings.lastBackupAt)}
								</h3>
							</div>
							<div className='h-10 w-10 rounded-full bg-amber-100 dark:bg-amber-900 flex items-center justify-center'>
								<Database className='h-5 w-5 text-amber-600 dark:text-amber-300' />
							</div>
						</div>
						<p className='text-xs text-gray-500 dark:text-gray-400 mt-3'>
							Retención de datos: {systemSettings.dataRetentionDays} días
						</p>
					</CardContent>
				</Card>
			</div>

			<div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
						<div>
							<CardTitle>Distribución de roles</CardTitle>
							<CardDescription>
								Resumen de usuarios por perfil de acceso
							</CardDescription>
						</div>
						<Users className='h-5 w-5 text-blue-500' />
					</CardHeader>
					<CardContent>
						{usersLoading ? (
							<div className='space-y-3'>
								{Array.from({ length: 3 }).map((_, index) => (
									<div
										key={index}
										className='space-y-2'
									>
										<SkeletonBlock className='h-4 w-32' />
										<SkeletonBlock className='h-3 w-full' />
									</div>
								))}
							</div>
						) : userRoleData.length ? (
							<div className='space-y-3'>
								{userRoleData.map(({ role, label, count }) => {
									const total = Math.max(totalUsers, 1);
									const percentage = Math.round((count / total) * 100);
									return (
										<div
											key={role}
											className='space-y-1'
										>
											<div className='flex items-center justify-between text-sm'>
												<span className='font-medium text-gray-900 dark:text-white'>
													{label}
												</span>
												<span className='text-gray-500 dark:text-gray-400'>
													{count} ({percentage}%)
												</span>
											</div>
											<div className='h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden'>
												<div
													className={`h-full ${
														ROLE_COLORS[role] ?? 'bg-blue-500'
													} transition-all`}
													style={{ width: `${Math.max(percentage, 4)}%` }}
													aria-label={`${label}: ${percentage}%`}
												/>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<p className='text-sm text-gray-500 dark:text-gray-400'>
								No hay datos de usuarios disponibles.
							</p>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='flex flex-row items-center justify-between space-y-0 pb-4'>
						<div>
							<CardTitle>Estado de estaciones</CardTitle>
							<CardDescription>
								Monitoreo operativo por estado actual
							</CardDescription>
						</div>
						<MapPin className='h-5 w-5 text-emerald-500' />
					</CardHeader>
					<CardContent>
						{stationsLoading ? (
							<div className='space-y-3'>
								{Array.from({ length: 3 }).map((_, index) => (
									<div
										key={index}
										className='space-y-2'
									>
										<SkeletonBlock className='h-4 w-28' />
										<SkeletonBlock className='h-3 w-full' />
									</div>
								))}
							</div>
						) : stationStatusData.length ? (
							<div className='space-y-3'>
								{stationStatusData.map(({ status, label, count }) => {
									const percentage = totalStations
										? Math.round((count / totalStations) * 100)
										: 0;
									return (
										<div
											key={status}
											className='space-y-1'
										>
											<div className='flex items-center justify-between text-sm'>
												<span className='font-medium text-gray-900 dark:text-white'>
													{label}
												</span>
												<span className='text-gray-500 dark:text-gray-400'>
													{count} ({percentage}%)
												</span>
											</div>
											<div className='h-3 rounded-full bg-gray-200 dark:bg-gray-800 overflow-hidden'>
												<div
													className={`h-full ${
														STATION_STATUS_COLORS[status] ?? 'bg-gray-400'
													} transition-all`}
													style={{ width: `${Math.max(percentage, 4)}%` }}
													aria-label={`${label}: ${percentage}%`}
												/>
											</div>
										</div>
									);
								})}
							</div>
						) : (
							<p className='text-sm text-gray-500 dark:text-gray-400'>
								No hay estaciones registradas.
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			<div className='grid grid-cols-1 xl:grid-cols-2 gap-4'>
				<Card>
					<CardHeader className='pb-3'>
						<CardTitle>Actividad reciente</CardTitle>
						<CardDescription>
							Eventos clave registrados en el sistema
						</CardDescription>
					</CardHeader>
					<CardContent className='space-y-4'>
						{activityLoading ? (
							<div className='space-y-3'>
								{Array.from({ length: 4 }).map((_, index) => (
									<SkeletonBlock
										key={index}
										className='h-14 w-full'
									/>
								))}
							</div>
						) : activityError ? (
							<p className='text-sm text-red-500'>{activityError}</p>
						) : activityStats?.recentActivity.length ? (
							activityStats.recentActivity.map((log) => {
								const statusConfig =
									STATUS_LABELS[log.status] ?? STATUS_LABELS.info;
								return (
									<div
										key={log.id}
										className='rounded-lg border border-gray-200 dark:border-gray-800 p-3'
									>
										<div className='flex items-start justify-between'>
											<div>
												<p className='text-sm font-semibold text-gray-900 dark:text-white'>
													{log.title}
												</p>
												<p className='text-xs text-gray-500 dark:text-gray-400 mt-1'>
													{log.description}
												</p>
											</div>
											<Badge
												variant='outline'
												className={`text-xs ${statusConfig.color}`}
											>
												{statusConfig.label}
											</Badge>
										</div>
										<div className='flex flex-wrap items-center gap-3 mt-3 text-xs text-gray-500 dark:text-gray-400'>
											{log.user_name && (
												<span className='flex items-center gap-1'>
													<Users className='h-3.5 w-3.5' />
													{log.user_name}
												</span>
											)}
											{log.station_name && (
												<span className='flex items-center gap-1'>
													<MapPin className='h-3.5 w-3.5' />
													{log.station_name}
												</span>
											)}
											<span className='flex items-center gap-1'>
												<Clock className='h-3.5 w-3.5' />
												{formatDateTime(log.timestamp)}
											</span>
										</div>
									</div>
								);
							})
						) : (
							<p className='text-sm text-gray-500 dark:text-gray-400'>
								No hay actividad reciente registrada.
							</p>
						)}
					</CardContent>
				</Card>

				<Card>
					<CardHeader className='pb-3'>
						<CardTitle>Asignaciones destacadas</CardTitle>
						<CardDescription>
							Usuarios con mayor cantidad de estaciones asignadas
						</CardDescription>
					</CardHeader>
					<CardContent>
						{usersLoading ? (
							<div className='space-y-3'>
								{Array.from({ length: 4 }).map((_, index) => (
									<SkeletonBlock
										key={index}
										className='h-12 w-full'
									/>
								))}
							</div>
						) : topStationAssignments.length ? (
							<div className='space-y-3'>
								{topStationAssignments.map((item, index) => (
									<div
										key={item.name}
										className='flex items-center justify-between rounded-lg border border-gray-200 dark:border-gray-800 px-3 py-2'
									>
										<div>
											<p className='text-sm font-medium text-gray-900 dark:text-white'>
												{item.name}
											</p>
											<p className='text-xs text-gray-500 dark:text-gray-400'>
												{item.role}
											</p>
										</div>
										<div className='flex items-center gap-2'>
											<span className='text-sm font-semibold text-gray-900 dark:text-white'>
												{item.count}
											</span>
											<Badge variant='secondary'>#{index + 1}</Badge>
										</div>
									</div>
								))}
							</div>
						) : (
							<p className='text-sm text-gray-500 dark:text-gray-400'>
								Ningún usuario tiene estaciones asignadas actualmente.
							</p>
						)}
					</CardContent>
				</Card>
			</div>

			<div className='my-8 border-t border-dashed border-gray-200 dark:border-gray-700' />

			<Card>
				<CardHeader className='pb-3'>
					<div className='flex items-center gap-3'>
						<Activity className='h-5 w-5 text-blue-500' />
						<div>
							<CardTitle>Resumen de actividad</CardTitle>
							<CardDescription>
								Distribución de eventos registrados por tipo y estado en el
								último periodo.
							</CardDescription>
						</div>
					</div>
				</CardHeader>
				<CardContent>
					{activityLoading ? (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<SkeletonBlock className='h-24 w-full' />
							<SkeletonBlock className='h-24 w-full' />
						</div>
					) : activityStats ? (
						<div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
							<div className='rounded-lg border border-gray-200 dark:border-gray-800 p-4'>
								<p className='text-sm font-semibold text-gray-900 dark:text-white mb-2'>
									Por tipo
								</p>
								<ul className='space-y-2 text-sm text-gray-600 dark:text-gray-300'>
									{Object.entries(activityStats.byType).map(([type, count]) => (
										<li
											key={type}
											className='flex items-center justify-between'
										>
											<span className='capitalize'>
												{type.replace(/_/g, ' ')}
											</span>
											<span className='font-semibold text-gray-900 dark:text-white'>
												{count}
											</span>
										</li>
									))}
								</ul>
							</div>
							<div className='rounded-lg border border-gray-200 dark:border-gray-800 p-4'>
								<p className='text-sm font-semibold text-gray-900 dark:text-white mb-2'>
									Por estado
								</p>
								<ul className='space-y-2 text-sm text-gray-600 dark:text-gray-300'>
									{Object.entries(activityStats.byStatus).map(
										([status, count]) => {
											const statusConfig =
												STATUS_LABELS[status] ?? STATUS_LABELS.info;
											return (
												<li
													key={status}
													className='flex items-center justify-between'
												>
													<span
														className={`flex items-center gap-2 ${statusConfig.color}`}
													>
														<AlertTriangle className='h-4 w-4' />
														{statusConfig.label}
													</span>
													<span className='font-semibold text-gray-900 dark:text-white'>
														{count}
													</span>
												</li>
											);
										}
									)}
								</ul>
							</div>
						</div>
					) : (
						<p className='text-sm text-gray-500 dark:text-gray-400'>
							No hay estadísticas de actividad disponibles.
						</p>
					)}
				</CardContent>
			</Card>
		</div>
	);
};

export default AdminAnalytics;
