import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@presentation/components/ui/card";
import { Button } from "@presentation/components/ui/button";
import { NormalizedChart } from "@presentation/components/charts/NormalizedChart";
import { DataSourceType, DataNormalizationService } from "@shared/services/DataNormalizationService";

// Ejemplos de diferentes fuentes de datos
const exampleDataSources = {
  measurements: [
    { timestamp: "2025-01-13T08:00:00Z", value: 2.3, station_name: "Río Claro Sur" },
    { timestamp: "2025-01-13T09:00:00Z", value: 2.1, station_name: "Río Claro Sur" },
    { timestamp: "2025-01-13T10:00:00Z", value: 2.5, station_name: "Río Claro Sur" }
  ],

  stations: [
    { id: 1, name: "Estación Norte", current_level: 2.4, last_measurement: "2025-01-13T10:30:00Z" },
    { id: 2, name: "Estación Sur", current_level: 2.1, last_measurement: "2025-01-13T10:30:00Z" },
    { id: 3, name: "Estación Centro", current_level: 2.8, last_measurement: "2025-01-13T10:30:00Z" }
  ],

  apiV1: [
    { time: "2025-01-13T08:00:00Z", level: 2.2, location: "Sensor A1", sensor_id: "A1" },
    { time: "2025-01-13T09:00:00Z", level: 2.4, location: "Sensor A1", sensor_id: "A1" },
    { time: "2025-01-13T10:00:00Z", level: 2.1, location: "Sensor A1", sensor_id: "A1" }
  ],

  apiV2: [
    { datetime: "2025-01-13T08:00:00Z", water_height: 2.0, sensor_name: "Device B2", device_id: "B2" },
    { datetime: "2025-01-13T09:00:00Z", water_height: 2.3, sensor_name: "Device B2", device_id: "B2" },
    { datetime: "2025-01-13T10:00:00Z", water_height: 2.6, sensor_name: "Device B2", device_id: "B2" }
  ],

  csv: [
    { fecha: "2025-01-13T08:00:00Z", nivel: 1.9, estacion: "CSV Import 1" },
    { fecha: "2025-01-13T09:00:00Z", nivel: 2.2, estacion: "CSV Import 1" },
    { fecha: "2025-01-13T10:00:00Z", nivel: 2.5, estacion: "CSV Import 1" }
  ],

  json: [
    { someTimestamp: "2025-01-13T08:00:00Z", waterLevel: 2.1, locationName: "JSON Source" },
    { someTimestamp: "2025-01-13T09:00:00Z", waterLevel: 2.4, locationName: "JSON Source" },
    { someTimestamp: "2025-01-13T10:00:00Z", waterLevel: 2.0, locationName: "JSON Source" }
  ]
};

export function DataNormalizationExamples() {
  const [selectedSource, setSelectedSource] = useState<keyof typeof exampleDataSources>('measurements');
  
  const sourceTypeMapping = {
    measurements: DataSourceType.MEASUREMENT,
    stations: DataSourceType.STATION,
    apiV1: DataSourceType.API_V1,
    apiV2: DataSourceType.API_V2,
    csv: DataSourceType.CSV,
    json: DataSourceType.JSON
  };

  return (
    <div className="space-y-6 p-6">
      <Card className="bg-gov-white border-gov-accent">
        <CardHeader>
          <CardTitle className="text-gov-black">Ejemplo: Servicio de Normalización de Datos</CardTitle>
          <CardDescription className="text-gov-gray-a">
            Demostración de cómo diferentes fuentes de datos se normalizan automáticamente para los gráficos
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Selector de fuente de datos */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gov-black">Seleccionar Fuente de Datos:</h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                {Object.keys(exampleDataSources).map((source) => (
                  <Button
                    key={source}
                    variant={selectedSource === source ? "default" : "outline"}
                    onClick={() => setSelectedSource(source as keyof typeof exampleDataSources)}
                    className="text-sm"
                  >
                    {source.charAt(0).toUpperCase() + source.slice(1)}
                  </Button>
                ))}
              </div>
            </div>

            {/* Datos de ejemplo */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gov-black">Datos Originales ({selectedSource}):</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                {JSON.stringify(exampleDataSources[selectedSource], null, 2)}
              </pre>
            </div>

            {/* Datos normalizados */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gov-black">Datos Normalizados:</h3>
              <pre className="bg-gray-100 p-4 rounded-lg text-sm overflow-x-auto">
                {JSON.stringify(
                  DataNormalizationService.normalize(
                    exampleDataSources[selectedSource], 
                    sourceTypeMapping[selectedSource]
                  ), 
                  null, 
                  2
                )}
              </pre>
            </div>

            {/* Gráfico normalizado */}
            <div>
              <h3 className="text-lg font-medium mb-3 text-gov-black">Gráfico Generado Automáticamente:</h3>
              <NormalizedChart 
                rawData={exampleDataSources[selectedSource]}
                sourceType={sourceTypeMapping[selectedSource]}
                height={250}
                className="border rounded-lg p-4"
              />
            </div>

            {/* Explicación del beneficio */}
            <div className="bg-gov-neutral p-4 rounded-lg">
              <h3 className="text-lg font-medium mb-2 text-gov-black">💡 Beneficio de la Normalización:</h3>
              <p className="text-sm text-gov-gray-a">
                <strong>Sin normalización:</strong> Cada vez que cambias la fuente de datos (API, CSV, JSON, etc.), 
                tendrías que modificar todos los componentes de gráficos manualmente.
              </p>
              <p className="text-sm text-gov-gray-a mt-2">
                <strong>Con normalización:</strong> El servicio abstrae automáticamente la transformación de datos. 
                Solo cambias el <code>DataSourceType</code> y el gráfico funciona inmediatamente, sin importar 
                el formato original de los datos.
              </p>
              <p className="text-sm text-gov-green font-medium mt-2">
                ✅ Esto es especialmente útil para migrar a producción con diferentes APIs o fuentes de datos.
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}