// ⚠️ OBSOLETO: Estos tipos han sido reemplazados por tipos más específicos
// Usar los tipos en /shared/types/data-sources.ts en su lugar

import type { RawDataInput } from './data-sources';

/**
 * @deprecated Usar tipos específicos de data-sources.ts en su lugar
 * Este tipo se mantiene solo para compatibilidad temporal
 */
export type ChartDataItem = Record<string, unknown>;

/**
 * @deprecated Usar tipos específicos de data-sources.ts en su lugar
 * Ejemplos de tipos nuevos:
 * - MeasurementDataArray para datos de mediciones
 * - StationDataArray para datos de estaciones
 * - AlertDataArray para datos de alertas
 * - etc.
 */
export type ChartDataArray = RawDataInput[];