// Panel principal de administración con navegación por pestañas
import React, { useState } from 'react';
import { Users, MapPin, Settings, BarChart3 } from 'lucide-react';

// UI Components
import { Card } from '@shared/components/ui/card';
import { RoleGuard } from '@shared/components/auth/RoleGuard';

// Componentes de administración
import { UserManagement } from './users/UserManagement';
import { StationManagement } from './stations/StationManagement';

type AdminTab = 'users' | 'stations' | 'settings' | 'analytics';

interface TabConfig {
  id: AdminTab;
  label: string;
  icon: React.ReactNode;
  component: React.ReactNode;
  description: string;
}

export const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<AdminTab>('users');

  const tabs: TabConfig[] = [
    {
      id: 'users',
      label: 'Usuarios',
      icon: <Users className="h-5 w-5" />,
      component: (
        <RoleGuard allowedRoles={['Administrador']}>
          <UserManagement />
        </RoleGuard>
      ),
      description: 'Gestionar usuarios del sistema (Solo Administradores)'
    },
    {
      id: 'stations',
      label: 'Estaciones',
      icon: <MapPin className="h-5 w-5" />,
      component: (
        <RoleGuard allowedRoles={['Administrador', 'Técnico']}>
          <StationManagement />
        </RoleGuard>
      ),
      description: 'Administrar estaciones de monitoreo (Administradores y Técnicos)'
    },
    {
      id: 'settings',
      label: 'Configuración',
      icon: <Settings className="h-5 w-5" />,
      component: (
        <RoleGuard allowedRoles={['Administrador']}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <Settings className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Configuración del Sistema
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Próximamente: Configuraciones generales del sistema
              </p>
            </div>
          </div>
        </RoleGuard>
      ),
      description: 'Configuraciones del sistema (Solo Administradores)'
    },
    {
      id: 'analytics',
      label: 'Analíticas',
      icon: <BarChart3 className="h-5 w-5" />,
      component: (
        <RoleGuard allowedRoles={['Administrador', 'Técnico']}>
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                Analíticas Administrativas
              </h3>
              <p className="text-gray-500 dark:text-gray-400">
                Próximamente: Métricas de uso y estadísticas del sistema
              </p>
            </div>
          </div>
        </RoleGuard>
      ),
      description: 'Métricas y estadísticas (Administradores y Técnicos)'
    }
  ];

  const activeTabConfig = tabs.find(tab => tab.id === activeTab);

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Panel de Administración
          </h1>
          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Gestiona usuarios, estaciones y configuraciones del sistema RíoClaro
          </p>
        </div>

        {/* Navegación por pestañas */}
        <Card className="mb-6">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="-mb-px flex space-x-8 px-6" aria-label="Tabs">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`
                    flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm whitespace-nowrap
                    ${activeTab === tab.id
                      ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300 dark:text-gray-400 dark:hover:text-gray-200'
                    }
                  `}
                  aria-current={activeTab === tab.id ? 'page' : undefined}
                >
                  {tab.icon}
                  <span>{tab.label}</span>
                </button>
              ))}
            </nav>
          </div>

          {/* Descripción de la pestaña activa */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-800/50">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {activeTabConfig?.description}
            </p>
          </div>
        </Card>

        {/* Contenido de la pestaña activa */}
        <div className="mb-8">
          {activeTabConfig?.component}
        </div>

        {/* Footer */}
        <div className="text-center text-sm text-gray-500 dark:text-gray-400 mt-12">
          <p>
            Panel de Administración - Sistema RíoClaro
          </p>
          <p className="mt-1">
            Solo usuarios con rol de Administrador pueden acceder a esta sección
          </p>
        </div>
      </div>
    </div>
  );
};