// Hook para obtener información de conexión
export function useConnectionStatus() {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  return {
    isApiMode: true,
    isDemoMode: false,
    apiUrl,
    connectionType: 'api' as const,
    displayText: 'API Real'
  };
}