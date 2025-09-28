// Componente principal para gestión de usuarios
import React, { useEffect, useState } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2 } from 'lucide-react';
import { useUserStore } from '@features/admin/stores/UserStore';
import { User } from '@domain/entities/User';
import { UserFilters } from '@shared/types/pagination';
import { RoleGuard } from '@shared/components/auth/RoleGuard';
import { useRoleCheck } from '@shared/hooks/useAuthHooks';

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
import { UserForm } from './UserForm';
import { DeleteConfirmDialog } from './DeleteConfirmDialog';

export const UserManagement: React.FC = () => {
  const { canDelete, canEdit } = useRoleCheck();
  const {
    users,
    loading,
    error,
    fetchUsers,
    deleteUser,
    clearError
  } = useUserStore();

  // Estado local
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<UserFilters>({});
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [userToDelete, setUserToDelete] = useState<User | null>(null);

  // Cargar usuarios al montar el componente
  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  // Filtrar usuarios según búsqueda y filtros
  const filteredUsers = users.filter(user => {
    const matchesSearch = !searchTerm ||
      user.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.first_name && user.first_name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.last_name && user.last_name.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesRole = !filters.role || user.role === filters.role;
    const matchesStaff = filters.is_staff === undefined || user.is_staff === filters.is_staff;

    return matchesSearch && matchesRole && matchesStaff;
  });

  // Manejadores
  const handleCreateUser = () => {
    setIsCreateModalOpen(true);
  };

  const handleEditUser = (user: User) => {
    setEditingUser(user);
  };

  const handleDeleteUser = (user: User) => {
    setUserToDelete(user);
  };

  const confirmDeleteUser = async () => {
    if (userToDelete) {
      try {
        await deleteUser(userToDelete.id);
        setUserToDelete(null);
      } catch (error) {
        console.error('Error al eliminar usuario:', error);
      }
    }
  };

  const handleFormSuccess = () => {
    setIsCreateModalOpen(false);
    setEditingUser(null);
    fetchUsers(); // Recargar lista
  };

  const getRoleBadgeColor = (role: string) => {
    switch (role) {
      case 'Administrador':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'Técnico':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Observador':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
    }
  };

  const getStatusBadgeColor = (isActive: boolean) => {
    return isActive
      ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200'
      : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Gestión de Usuarios
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Administra los usuarios del sistema RíoClaro
          </p>
        </div>
        <RoleGuard allowedRoles={['Administrador']}>
          <Button onClick={handleCreateUser} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Nuevo Usuario
          </Button>
        </RoleGuard>
      </div>

      {/* Filtros y búsqueda */}
      <Card className="p-4">
        <div className="flex flex-col sm:flex-row gap-4">
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Buscar por nombre, usuario o email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="flex gap-2">
            <Select value={filters.role || 'all'} onValueChange={(value) =>
              setFilters(prev => ({ ...prev, role: value === 'all' ? undefined : (value as 'Administrador' | 'Técnico' | 'Observador') }))
            }>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Filtrar por rol" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos los roles</SelectItem>
                <SelectItem value="Administrador">Administrador</SelectItem>
                <SelectItem value="Técnico">Técnico</SelectItem>
                <SelectItem value="Observador">Observador</SelectItem>
              </SelectContent>
            </Select>
            <Select value={filters.is_staff?.toString() || 'all'} onValueChange={(value) =>
              setFilters(prev => ({ ...prev, is_staff: value === 'all' ? undefined : value === 'true' }))
            }>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Estado" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="true">Activo</SelectItem>
                <SelectItem value="false">Inactivo</SelectItem>
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

      {/* Tabla de usuarios */}
      <Card>
        <div className="overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuario</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nombre</TableHead>
                <TableHead>Rol</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Fecha de creación</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600"></div>
                      <span className="ml-2">Cargando usuarios...</span>
                    </div>
                  </TableCell>
                </TableRow>
              ) : filteredUsers.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    No se encontraron usuarios
                  </TableCell>
                </TableRow>
              ) : (
                filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.username}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      {user.first_name && user.last_name
                        ? `${user.first_name} ${user.last_name}`
                        : 'No especificado'
                      }
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getRoleBadgeColor(user.role)}`}>
                        {user.role}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadgeColor(user.is_staff)}`}>
                        {user.is_staff ? 'Activo' : 'Inactivo'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {new Date(user.created_at).toLocaleDateString('es-ES')}
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
                          {canEdit && (
                            <DropdownMenuItem onClick={() => handleEditUser(user)}>
                              <Edit className="mr-2 h-4 w-4" />
                              Editar
                            </DropdownMenuItem>
                          )}
                          {canDelete && (
                            <DropdownMenuItem
                              onClick={() => handleDeleteUser(user)}
                              className="text-red-600 dark:text-red-400"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Eliminar
                            </DropdownMenuItem>
                          )}
                          {!canEdit && !canDelete && (
                            <DropdownMenuItem disabled>
                              Sin permisos disponibles
                            </DropdownMenuItem>
                          )}
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

      {/* Modal para crear usuario */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Crear Nuevo Usuario</DialogTitle>
            <DialogDescription>
              Complete la información para crear un nuevo usuario en el sistema.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            onSuccess={handleFormSuccess}
            onCancel={() => setIsCreateModalOpen(false)}
          />
        </DialogContent>
      </Dialog>

      {/* Modal para editar usuario */}
      <Dialog open={!!editingUser} onOpenChange={(open) => !open && setEditingUser(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Usuario</DialogTitle>
            <DialogDescription>
              Modifique la información del usuario seleccionado.
            </DialogDescription>
          </DialogHeader>
          <UserForm
            user={editingUser || undefined}
            onSuccess={handleFormSuccess}
            onCancel={() => setEditingUser(null)}
          />
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmación para eliminar */}
      <DeleteConfirmDialog
        open={!!userToDelete}
        onOpenChange={(open) => !open && setUserToDelete(null)}
        title="Eliminar Usuario"
        description={`¿Está seguro que desea eliminar al usuario "${userToDelete?.username}"? Esta acción no se puede deshacer.`}
        onConfirm={confirmDeleteUser}
        loading={loading}
      />
    </div>
  );
};