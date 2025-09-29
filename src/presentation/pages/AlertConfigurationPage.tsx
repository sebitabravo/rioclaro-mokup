import React from 'react';
import { Navbar } from "@shared/components/layout/Navbar";
import { AlertConfigurationDashboard } from '@features/alerts/components/AlertConfigurationDashboard';
import { RoleGuard } from '@shared/components/auth/RoleGuard';
import { AlertContainer } from '@shared/components/alerts/AlertContainer';

export const AlertConfigurationPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <RoleGuard
        allowedRoles={['Administrador', 'Técnico']}
        fallback={
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                Acceso Restringido
              </h3>
              <p className="text-gray-500">
                Solo Administradores y Técnicos pueden configurar alertas
              </p>
            </div>
          </div>
        }
      >
        <div className="relative">
          <AlertConfigurationDashboard />
          <AlertContainer
            position="top-right"
            maxVisible={5}
            showSettings={false}
          />
        </div>
      </RoleGuard>
    </div>
  );
};