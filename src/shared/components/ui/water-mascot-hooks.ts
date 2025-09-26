export type MascotMood = 'happy' | 'worried' | 'concerned' | 'sleeping' | 'critical';

// Hook to automatically determine mood based on system status
export function useSystemMood(
  criticalStations: number,
  averageLevel: number,
  threshold: number = 3.0,
  isSystemActive: boolean = true
): MascotMood {
  if (!isSystemActive) return 'sleeping'
  
  if (criticalStations > 0) return 'critical'
  
  const levelRatio = averageLevel / threshold
  
  if (levelRatio > 0.9) return 'worried'
  if (levelRatio > 0.7) return 'concerned'
  
  return 'happy'
}