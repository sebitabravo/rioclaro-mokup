export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
};

export const formatDateTime = (dateString: string): string => {
  return new Date(dateString).toLocaleString('es-CL', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatTime = (dateString: string): string => {
  return new Date(dateString).toLocaleTimeString('es-CL', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

export const formatNumber = (value: number | undefined | null, decimals: number = 2): string => {
  if (value === undefined || value === null || isNaN(value)) {
    return '0.00';
  }
  return value.toFixed(decimals);
};

export const formatWaterLevel = (level: number): string => {
  return `${formatNumber(level)}m`;
};