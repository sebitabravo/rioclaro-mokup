import React from 'react';
import { AdminDashboard } from '@features/admin/components/AdminDashboard';
import { RoleGuard } from '@shared/components/auth/RoleGuard';
import { Navbar } from '@shared/components/layout/Navbar';
import { AlertContainer } from '@shared/components/alerts/AlertContainer';

export const AdminPage: React.FC = () => {
  return (
    <RoleGuard
      allowedRoles={['Administrador']}
      fallback={
        <div className="min-h-screen bg-gray-50 flex items-center justify-center">
          <div className="text-center">
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Acceso Restringido
            </h3>
            <p className="text-gray-500">
              Solo Administradores pueden acceder al panel de administración
            </p>
          </div>
        </div>
      }
    >
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="relative">
          <AdminDashboard />
          <AlertContainer position="top-right" maxVisible={5} showSettings={false} />
        </div>
      </div>
    </RoleGuard>
  );
};

export default AdminPage;