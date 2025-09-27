import { useState, useEffect } from 'react';

interface DeviceCapabilities {
  isLowEnd: boolean;
  memoryGB: number;
  connection: 'slow' | 'fast' | 'unknown';
  cores: number;
  prefersReducedMotion: boolean;
}

export function useDeviceOptimization(): DeviceCapabilities {
  const [capabilities, setCapabilities] = useState<DeviceCapabilities>({
    isLowEnd: false,
    memoryGB: 4,
    connection: 'unknown',
    cores: 4,
    prefersReducedMotion: false
  });

  useEffect(() => {
    const detectCapabilities = () => {
      // Memory detection (Chrome/Edge)
      const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory || 4;

      // CPU cores detection
      const cores = navigator.hardwareConcurrency || 4;

      // Connection detection
      const connection = (navigator as Navigator & { connection?: { effectiveType?: string; addEventListener?: (event: string, callback: () => void) => void; removeEventListener?: (event: string, callback: () => void) => void } }).connection;
      const connectionType = connection?.effectiveType || 'unknown';
      const isSlowConnection = ['slow-2g', '2g', '3g'].includes(connectionType);

      // Low-end device heuristics
      const isLowEnd = (
        memory <= 2 ||           // 2GB RAM or less
        cores <= 2 ||           // 2 CPU cores or less
        isSlowConnection        // Slow network
      );

      // Reduced motion preference
      const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

      setCapabilities({
        isLowEnd,
        memoryGB: memory,
        connection: isSlowConnection ? 'slow' : 'fast',
        cores,
        prefersReducedMotion
      });
    };

    detectCapabilities();

    // Listen for connection changes
    const connection = (navigator as Navigator & { connection?: { addEventListener?: (event: string, callback: () => void) => void; removeEventListener?: (event: string, callback: () => void) => void } }).connection;
    if (connection?.addEventListener && connection?.removeEventListener) {
      connection.addEventListener('change', detectCapabilities);
      return () => connection.removeEventListener!('change', detectCapabilities);
    }
  }, []);

  return capabilities;
}

// Government device optimization hook
export function useGovernmentDeviceOptimization() {
  const capabilities = useDeviceOptimization();

  return {
    ...capabilities,
    // Government-specific optimizations
    shouldReduceAnimations: capabilities.isLowEnd || capabilities.prefersReducedMotion,
    shouldLazyLoad: capabilities.isLowEnd || capabilities.connection === 'slow',
    shouldUseSimpleMap: capabilities.isLowEnd,
    maxConcurrentRequests: capabilities.isLowEnd ? 2 : 6,
    chartUpdateInterval: capabilities.isLowEnd ? 10000 : 5000, // ms
  };
}