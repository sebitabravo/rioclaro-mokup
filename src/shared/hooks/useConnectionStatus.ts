// Hook para obtener información de conexión
export function useConnectionStatus() {
  const isApiMode = import.meta.env.VITE_USE_API === 'true';
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:8000';

  return {
    isApiMode,
    isDemoMode: !isApiMode,
    apiUrl,
    connectionType: isApiMode ? 'api' : 'demo',
    displayText: isApiMode ? 'API Real' : 'Modo Demo'
  };
}