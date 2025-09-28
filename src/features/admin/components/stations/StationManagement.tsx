// Componente principal para gestión de estaciones
import React, { useEffect, useState } from 'react';
import { Plus, Search, MapPin, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { useStationStore } from '@features/admin/stores/StationStore';
import { Station } from '@domain/entities/Station';
import { StationFilters } from '@shared/types/pagination';

// UI Components
import { Button } from '@shared/components/ui/button';
import { Input } from '@shared/components/ui/input';
import { Card } from '@shared/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@shared/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@shared/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@shared/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@shared/components/ui/select';

// Componentes específicos
import { StationForm } from './StationForm';
import { DeleteConfirmDialog } from '../users/DeleteConfirmDialog';

export const StationManagement: React.FC = () => {
  const {
    stations,
    loading,
    error,
    fetchStations,
    deleteStation,
    setSelectedStation,
    clearError
  } = useStationStore();

  // Estado local
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<StationFilters>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingStation, setEditingStation] = useState<Station | null>(null);
  const [stationToDelete, setStationToDelete] = useState<Station | null>(null);

  // Cargar estaciones al montar el componente
  useEffect(() => {
    fetchStations();
  }, [fetchStations]);

  // Filtrar estaciones según búsqueda y filtros
  const filteredStations = stations.filter(station => {
    const matchesSearch = !searchTerm ||
      station.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
      station.location.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = !filters.status || station.status === filters.status;

    return matchesSearch && matchesStatus;
  });

  // Manejadores
  const handleCreateStation = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditStation = (station: Station) => {
    setEditingStation(station);
  };

  const handleViewStation = (station: Station) => {
    setSelectedStation(station);
  };

  const handleDeleteStation = (station: Station) => {
    setStationToDelete(station);
  };

  const confirmDeleteStation = async () => {
    if (stationToDelete) {
      try {
        await deleteStation(stationToDelete.id);
        setStationToDelete(null);
      } catch (error) {
        console.error('Error al eliminar estación:', error);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsCreateModalOpen(false);
    setEditingStation(null);
    fetchStations(); // Recargar lista
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'maintenance':
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'inactive':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'active':
        return 'Activa';
      case 'maintenance':
        return 'Mantenimiento';
      case 'inactive':
        return 'Inactiva';
      default:
        return 'Desconocido';
    }
  };

  const getLevelColor = (currentLevel: number, threshold: number) => {
    const percentage = (currentLevel / threshold) * 100;
    if (percentage >= 90) return 'text-red-600 font-semibold';
    if (percentage >= 70) return 'text-yellow-600 font-semibold';
    return 'text-green-600';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Estaciones
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra las estaciones de monitoreo del sistema RíoClaro
          </p>
        </div>
        <Button onClick={handleCreateStation} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Nueva Estación
        </Button>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, código o ubicación..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filters.status || ''} onValueChange={(value) =>
              setFilters(prev => ({ ...prev, status: (value as 'active' | 'maintenance' | 'inactive') || undefined }))
            }>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar por estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos los estados</SelectItem>
                <SelectItem value="active">Activa</SelectItem>
                <SelectItem value="maintenance">Mantenimiento</SelectItem>
                <SelectItem value="inactive">Inactiva</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* Error display */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-md dark:bg-red-900/20 dark:border-red-900 dark:text-red-200">
          {error}
          <Button
            variant="ghost"
            size="sm"
            onClick={clearError}
            className="ml-2 text-red-700 dark:text-red-200"
          >
            Cerrar
          </Button>
        </div>
      )}

      {/* Tabla de estaciones */}
      <Card>
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Ubicación</TableHead>
                <TableHead>Coordenadas</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Nivel Actual</TableHead>
                <TableHead>Última Medición</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Cargando estaciones...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredStations.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-gray-500">
                    No se encontraron estaciones
                  </TableCell>
                </TableRow>
              ) : (
                filteredStations.map((station) => (
                  <TableRow key={station.id}>
                    <TableCell className="font-medium font-mono">
                      {station.code}
                    </TableCell>
                    <TableCell className="font-medium">{station.name}</TableCell>
                    <TableCell>{station.location}</TableCell>
                    <TableCell className="font-mono text-sm">
                      <div className="flex items-center gap-1">
                        <MapPin className="h-3 w-3 text-gray-400" />
                        {station.latitude.toFixed(4)}, {station.longitude.toFixed(4)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(station.status)}`}>
                        {getStatusText(station.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className={getLevelColor(station.current_level, station.threshold)}>
                          {station.current_level.toFixed(2)} m
                        </span>
                        <span className="text-xs text-gray-500">
                          Umbral: {station.threshold} m
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      {new Date(station.last_measurement).toLocaleString('es-ES')}
                    </TableCell>
                    <TableCell className="text-right">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Abrir menú</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => handleViewStation(station)}>
                            <Eye className="mr-2 h-4 w-4" />
                            Ver Detalles
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleEditStation(station)}>
                            <Edit className="mr-2 h-4 w-4" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => handleDeleteStation(station)}
                            className="text-red-600 dark:text-red-400"
                          >
                            <Trash2 className="mr-2 h-4 w-4" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </Card>

      {/* Modal para crear estación */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Crear Nueva Estación</DialogTitle>
            <DialogDescription>
              Complete la información para crear una nueva estación de monitoreo.
            </DialogDescription>
          </DialogHeader>
          <StationForm
            onSuccess={handleFormSuccess}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para editar estación */}
      <Dialog open={!!editingStation} onOpenChange={(open) => !open && setEditingStation(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Estación</DialogTitle>
            <DialogDescription>
              Modifique la información de la estación seleccionada.
            </DialogDescription>
          </DialogHeader>
          <StationForm
            station={editingStation || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setEditingStation(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <DeleteConfirmDialog
        open={!!stationToDelete}
        onOpenChange={(open) => !open && setStationToDelete(null)}
        title="Eliminar Estación"
        description={`¿Está seguro que desea eliminar la estación "${stationToDelete?.name}" (${stationToDelete?.code})? Esta acción no se puede deshacer y se perderán todos los datos asociados.`}
        onConfirm={confirmDeleteStation}
        loading={loading}
      />
    </div>
  );
};